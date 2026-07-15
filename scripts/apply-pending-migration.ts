/**
 * Applies the 20260714000000_add_task_run migration through the Prisma Accelerate
 * connection (no DIRECT_URL needed). Also records it in _prisma_migrations so
 * future `prisma migrate dev` runs don't try to re-apply it.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/apply-pending-migration.ts
 */
import * as dotenv from "dotenv";
import { createHash, randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../app/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

dotenv.config({ path: ".env.local" });

const MIGRATION_NAME = "20260714000000_add_task_run";

const sqlPath = join(
  process.cwd(),
  `prisma/migrations/${MIGRATION_NAME}/migration.sql`
);
const migrationSql = readFileSync(sqlPath, "utf-8");
const checksum = createHash("sha256").update(migrationSql).digest("hex");

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
} as ConstructorParameters<typeof PrismaClient>[0]).$extends(withAccelerate());

async function run() {
  // 1. Check if the table already exists via information_schema (read-only, no DDL perms needed)
  const tableRows = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'TaskRun'`
  );
  const tableExists = tableRows.length > 0;

  if (tableExists) {
    console.log("✓ TaskRun table already exists — skipping CREATE.");
  } else {
    console.log("Creating TaskRun table…");

    const statements = migrationSql
      .split(";")
      .map((s) => s.replace(/--.*$/gm, "").trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`  ✓ ${stmt.split("\n")[0].trim()}`);
    }
    console.log("TaskRun table created.");
  }

  // 2. Record the migration in _prisma_migrations so migrate dev doesn't replay it
  const rows = await prisma.$queryRawUnsafe<Array<{ count: string }>>(
    `SELECT COUNT(*)::text AS count FROM "_prisma_migrations" WHERE migration_name = $1`,
    MIGRATION_NAME
  );

  if (parseInt(rows[0].count, 10) > 0) {
    console.log("✓ Migration already recorded in _prisma_migrations.");
  } else {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_prisma_migrations"
         (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)`,
      randomUUID(),
      checksum,
      MIGRATION_NAME
    );
    console.log("✓ Migration recorded in _prisma_migrations.");
  }

  console.log("\n✅ Done. Restart your dev server.");
}

run()
  .catch((e: unknown) => {
    console.error("❌ Failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
