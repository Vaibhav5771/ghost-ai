import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct PostgreSQL URL (not an Accelerate proxy URL).
    // Set DIRECT_URL=postgres://... in .env.local for migrate dev/deploy.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
