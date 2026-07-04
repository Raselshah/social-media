import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

export const prisma = prismaClient;
export default prismaClient;
