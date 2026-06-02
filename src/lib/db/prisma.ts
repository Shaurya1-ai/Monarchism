import { PrismaClient } from "@/generated/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required for Prisma. Create a .env file or set DATABASE_URL in your environment."
  );
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Singleton Prisma client — prevents connection exhaustion in dev hot reload */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
