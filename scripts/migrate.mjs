import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client/web";

const tursoUrl =
  process.env.TURSO_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith("libsql://")
    ? process.env.DATABASE_URL
    : undefined);
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

function tursoHost(url) {
  try {
    return new URL(url.replace("libsql://", "https://")).host;
  } catch {
    return "unknown";
  }
}

async function withRetry(label, fn, attempts = 3) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${label} failed (attempt ${i}/${attempts}): ${message}`);
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, i * 1500));
      }
    }
  }
  throw lastError;
}

function isIgnorableMigrationError(error) {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    message.includes("duplicate column") ||
    message.includes("already exists") ||
    message.includes("duplicate column name")
  );
}

async function applyTursoMigrations() {
  if (!tursoUrl || !tursoToken) {
    throw new Error(
      "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set for production deploys."
    );
  }

  console.log(`Connecting to Turso (${tursoHost(tursoUrl)})...`);

  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  await withRetry("Turso connection test", async () => {
    await client.execute("SELECT 1");
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  const migrationsDir = "prisma/migrations";
  const folders = readdirSync(migrationsDir)
    .filter((name) => !name.endsWith(".toml"))
    .sort();

  for (const folder of folders) {
    const sqlPath = join(migrationsDir, folder, "migration.sql");
    const sql = readFileSync(sqlPath, "utf8");

    const existing = await client.execute({
      sql: 'SELECT "migration_name" FROM "_prisma_migrations" WHERE "migration_name" = ?',
      args: [folder],
    });

    if (existing.rows.length > 0) {
      console.log(`Migration already applied: ${folder}`);
      continue;
    }

    console.log(`Applying migration: ${folder}`);

    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await withRetry(`SQL in ${folder}`, () => client.execute(statement));
      } catch (error) {
        if (isIgnorableMigrationError(error)) {
          console.log(`Skipping existing schema change in ${folder}`);
          continue;
        }
        throw error;
      }
    }

    await client.execute({
      sql: `INSERT INTO "_prisma_migrations"
        ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
        VALUES (?, ?, ?, datetime('now'), ?)`,
      args: [randomUUID(), "manual", folder, statements.length],
    });
  }

  console.log("Turso migrations applied successfully.");
}

async function main() {
  if (tursoUrl?.startsWith("libsql://")) {
    await applyTursoMigrations();
    return;
  }

  if (process.env.VERCEL && !databaseUrl.startsWith("file:")) {
    throw new Error(
      "On Vercel, set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN. " +
        "prisma migrate deploy does not support libsql:// URLs."
    );
  }

  if (databaseUrl.startsWith("file:")) {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    return;
  }

  throw new Error(
    `Unsupported database URL scheme. Use file:./dev.db locally or libsql:// on Vercel. Got: ${databaseUrl.split(":")[0]}://`
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : null;
  console.error("Migration failed:", message);
  if (cause) console.error("Cause:", cause);
  process.exit(1);
});
