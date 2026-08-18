import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

import pg from "pg";

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";
  const connectionString = rawUrl.replace(/[?&]sslmode=[^&]+/g, "");
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
