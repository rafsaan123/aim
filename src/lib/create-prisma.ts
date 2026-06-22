import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDatabaseUrl() {
  const fileUrl = process.env.DATABASE_URL;
  if (fileUrl?.startsWith("file:")) {
    return fileUrl;
  }

  return (
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:./dev.db"
  );
}

export function createPrismaClient() {
  const url = getDatabaseUrl();

  const adapter = new PrismaLibSql({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return new PrismaClient({ adapter });
}
