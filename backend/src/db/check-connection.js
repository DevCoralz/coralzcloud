import { pool, checkDatabaseConnection } from "./pool.js";

async function main() {
  try {
    const info = await checkDatabaseConnection();
    console.log("[db] Connected successfully.");
    console.log(`[db] Database: ${info.db}`);
    console.log(`[db] Server time: ${info.now}`);

    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log(`[db] Tables (${rows.length}):`, rows.map((r) => r.table_name).join(", "));
  } catch (err) {
    console.error("[db] Connection failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
