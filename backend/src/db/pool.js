import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

if (!env.DATABASE_URL) {
  // We don't throw here so that non-DB commands (like printing --help)
  // don't crash, but every real query will fail loudly and clearly.
  console.warn(
    "[db] DATABASE_URL is not set. Set it in your .env file — see .env.example."
  );
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL || undefined,
  max: env.DB_POOL_MAX,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  // Prevents an idle client error from crashing the whole process.
  console.error("[db] Unexpected error on idle client", err);
});

/**
 * Run a query using the shared pool.
 * @param {string} text
 * @param {any[]} [params]
 */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Run a function within a single client, useful for transactions.
 * @template T
 * @param {(client: pg.PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Run a function inside a BEGIN/COMMIT/ROLLBACK transaction.
 * @template T
 * @param {(client: pg.PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  return withClient(async (client) => {
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  });
}

export async function checkDatabaseConnection() {
  const result = await pool.query("SELECT NOW() as now, current_database() as db");
  return result.rows[0];
}
