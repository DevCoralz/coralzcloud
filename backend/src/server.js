import { createApp } from "./app.js";
import { env, assertRequiredEnv } from "./config/env.js";
import { checkDatabaseConnection } from "./db/pool.js";

async function main() {
  assertRequiredEnv();

  const app = createApp();

  app.listen(env.PORT, env.HOST, () => {
    console.log(`[server] Coralz Cloud backend listening on http://${env.HOST}:${env.PORT}`);
    if (env.PUBLIC_BACKEND_URL) {
      console.log(`[server] Public URL (via Cloudflare Tunnel): ${env.PUBLIC_BACKEND_URL}`);
    } else {
      console.log(
        "[server] PUBLIC_BACKEND_URL is not set — fine for local dev, required behind the tunnel."
      );
    }
  });

  try {
    await checkDatabaseConnection();
    console.log("[server] Database connection verified.");
  } catch (err) {
    console.error(
      "[server] Could not verify database connection. The server is running, but requests that touch the database will fail until this is fixed:",
      err.message
    );
  }
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
