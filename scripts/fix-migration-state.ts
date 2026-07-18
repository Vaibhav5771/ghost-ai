/**
 * Removes the falsely-applied migration record so `prisma migrate dev`
 * can apply it correctly once DIRECT_URL is set.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../app/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const p = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
} as ConstructorParameters<typeof PrismaClient>[0]).$extends(withAccelerate());

async function main() {
  const deleted = await p.$executeRawUnsafe(
    `DELETE FROM "_prisma_migrations" WHERE migration_name = '20260714000000_add_task_run'`
  );
  console.log(`Deleted ${deleted} migration record(s). State is now clean.`);
  console.log("\nNext: set DIRECT_URL in .env.local, then run:  npx prisma migrate dev");
}

main()
  .catch((e: unknown) => console.error("err:", e instanceof Error ? e.message : e))
  .finally(() => p.$disconnect());
