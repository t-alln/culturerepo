import { PrismaClient } from "../generated/prisma";

// Avoid multiple instances during development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
