import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "./pool.js";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function loadMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // filenames are zero-padded, so lexical sort == order
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query("SELECT name FROM schema_migrations ORDER BY id ASC");
  return new Set(rows.map((r) => r.name));
}

function splitUpDown(sql) {
  // Migrations may include a "-- DOWN" marker separating the forward
  // migration from its rollback. Everything above is "up"; everything
  // below is "down". If there's no marker, there's no rollback.
  const marker = "-- DOWN";
  const idx = sql.indexOf(marker);
  if (idx === -1) return { up: sql, down: null };
  return { up: sql.slice(0, idx), down: sql.slice(idx + marker.length) };
}

async function migrateUp() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }

  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);
    const files = loadMigrationFiles();
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log("[migrate] Database is up to date. No pending migrations.");
      return;
    }

    for (const file of pending) {
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      const { up } = splitUpDown(sql);
      console.log(`[migrate] Applying ${file} ...`);
      try {
        await client.query("BEGIN");
        await client.query(up);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`[migrate] ✓ ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[migrate] ✗ ${file} failed:`, err.message);
        throw err;
      }
    }

    console.log(`[migrate] Applied ${pending.length} migration(s).`);
  } finally {
    client.release();
  }
}

async function migrateDown() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const { rows } = await client.query(
      "SELECT name FROM schema_migrations ORDER BY id DESC LIMIT 1"
    );
    if (rows.length === 0) {
      console.log("[migrate] Nothing to roll back.");
      return;
    }
    const file = rows[0].name;
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const { down } = splitUpDown(sql);
    if (!down || !down.trim()) {
      throw new Error(`Migration ${file} has no "-- DOWN" rollback section.`);
    }
    console.log(`[migrate] Rolling back ${file} ...`);
    await client.query("BEGIN");
    await client.query(down);
    await client.query("DELETE FROM schema_migrations WHERE name = $1", [file]);
    await client.query("COMMIT");
    console.log(`[migrate] ✓ rolled back ${file}`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  const direction = process.argv[2] === "down" ? "down" : "up";
  try {
    if (direction === "down") {
      await migrateDown();
    } else {
      await migrateUp();
    }
  } catch (err) {
    console.error("[migrate] Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
