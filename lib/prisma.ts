import { PrismaClient } from "@/app/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  const accelerateUrl = process.env.DATABASE_URL;
  if (!accelerateUrl) throw new Error("DATABASE_URL must be set.");
  
  return new PrismaClient({ accelerateUrl }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}