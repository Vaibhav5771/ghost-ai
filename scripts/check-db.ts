import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../app/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const p = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
} as ConstructorParameters<typeof PrismaClient>[0]).$extends(withAccelerate());

async function main() {
  const [tables, mig] = await Promise.all([
    p.$queryRawUnsafe<Array<{ table_schema: string; table_name: string }>>(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE LOWER(table_name) = 'taskrun'"
    ),
    p.$queryRawUnsafe<Array<{ c: string }>>(
      `SELECT COUNT(*)::text AS c FROM "_prisma_migrations" WHERE migration_name = '20260714000000_add_task_run'`
    ),
  ]);

  console.log("TaskRun table found:", tables);
  console.log("Migration row count:", mig[0]?.c ?? "0");
}

main()
  .catch((e: unknown) => console.error("err:", e instanceof Error ? e.message : e))
  .finally(() => p.$disconnect());
