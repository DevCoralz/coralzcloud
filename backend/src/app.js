import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { createSessionMiddleware } from "./middleware/session.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  // Behind the Cloudflare Tunnel (or any reverse proxy) in production,
  // so req.secure / X-Forwarded-* are trusted and secure cookies work.
  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.set("sessionCookieName", env.SESSION_COOKIE_NAME);

  app.use(helmet());
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
    })
  );
  app.use(morgan(env.LOG_LEVEL));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(createSessionMiddleware());

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
