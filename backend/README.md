# Coralz Cloud — Backend

Node.js/Express + PostgreSQL backend. This phase covers the
**authentication foundation**, the **initial database schema**, and a
**Telegram/MTProto storage foundation** (configuration + connection
plumbing only — no upload/download yet).

## Stack

- **Express** — HTTP server
- **PostgreSQL** (`pg`) — primary database, raw SQL migrations (no ORM)
- **express-session** + **connect-pg-simple** — server-side sessions stored in Postgres
- **argon2** — password hashing (argon2id)
- **zod** — request validation
- **telegram** (GramJS) — MTProto client, foundation only
- **helmet**, **cors**, **express-rate-limit** — baseline hardening

## Getting started

```bash
cd backend
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and SESSION_SECRET
npm install
npm run migrate
npm run dev
```

The server starts on `http://localhost:4000` by default (`PORT` in `.env`).

### 1. Create the database

```bash
createdb coralz_cloud
# or, from psql:
# CREATE DATABASE coralz_cloud;
```

Set `DATABASE_URL` in `.env` to point at it, e.g.:

```
DATABASE_URL=postgresql://coralz_user:password@localhost:5432/coralz_cloud
```

### 2. Run migrations

```bash
npm run migrate
```

This applies every file in `src/db/migrations/` in order and records
what's been applied in a `schema_migrations` table, so it's safe to
run repeatedly. To roll back the most recent migration:

```bash
npm run migrate:down
```

### 3. Verify the database connection

```bash
node src/db/check-connection.js
```

Prints the connected database name, server time, and the list of
tables that exist — useful right after migrating.

### 4. Run the server

```bash
npm run dev     # auto-restarts on file changes (node --watch)
npm start       # plain start
```

## Testing the auth flow manually

With the server running:

```bash
# Register
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"supersecret123"}'

# Check session (should return the user you just registered)
curl -i -b cookies.txt http://localhost:4000/api/auth/me

# Log out
curl -i -b cookies.txt -X POST http://localhost:4000/api/auth/logout

# Confirm session is gone (should 401)
curl -i -b cookies.txt http://localhost:4000/api/auth/me

# Log back in with email...
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"supersecret123"}'

# ...or with username
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"supersecret123"}'
```

Health checks:

```bash
curl http://localhost:4000/api/health           # DB connectivity
curl http://localhost:4000/api/health/telegram  # Telegram config status (no connection attempt)
```

## Automated tests

```bash
npm test
```

Runs Node's built-in test runner (`node --test`) against
`test/authSchemas.test.js` (validation rules) and
`test/passwordService.test.js` (hashing/verification behavior). These
don't touch Postgres, so they run without a database configured.
Route-level integration tests against a live Postgres instance are a
good next addition once this phase's database is provisioned in your
environment — this sandbox has no network access to install
dependencies or spin up Postgres to run them here.

## Project structure

```
src/
  config/env.js              # single source of truth for all env vars
  db/
    pool.js                  # pg Pool + query/transaction helpers
    migrate.js                # migration runner (up/down)
    migrations/               # numbered .sql migrations
    check-connection.js       # standalone DB connectivity check
  models/userModel.js         # user data access (raw SQL)
  validation/authSchemas.js   # zod schemas for register/login
  services/
    passwordService.js        # argon2 hash/verify
    authService.js             # register/login business logic
    telegram/
      telegramClient.js        # GramJS client lifecycle (foundation only)
      storageChannel.js        # storage channel resolution (foundation only)
  middleware/
    session.js                 # express-session + connect-pg-simple config
    requireAuth.js              # protects routes behind a valid session
    validate.js                  # zod request-body validation middleware
    rateLimit.js                  # auth endpoint rate limiting
    errorHandler.js                # central error formatting
  controllers/authController.js  # register/login/logout/me handlers
  routes/                          # Express routers
  app.js                            # Express app assembly
  server.js                          # entry point
```

## Database schema (this phase)

- `users` — id, username, email, password_hash, display_name, timestamps
- `session` — server-side session store (connect-pg-simple)
- `plans` / `subscriptions` — every new user gets a `free` plan row automatically; no billing logic yet
- `folders` / `files` — self-referencing folder tree + file records; nothing writes to these yet
- `storage_objects` — where a file's bytes live (Telegram channel/message references); schema only, unused this phase
- `shares` — file/folder sharing with another user or via a public token; schema only, unused this phase
- `storage_usage` — per-user running total of bytes/files used; auto-created per user, not yet updated by anything

All of this is created by the migrations in `src/db/migrations/` — read
those directly for exact column definitions and constraints.

## Authentication design notes

- Sessions, not JWTs — server-side sessions stored in Postgres via
  `connect-pg-simple`, so logout is immediate and absolute (no token
  to wait out).
- Login accepts **either** email or username in a single `identifier`
  field, resolved case-insensitively.
- Passwords hashed with **argon2id** (OWASP-recommended parameters).
- `requireAuth` middleware protects any route that needs a logged-in
  user; currently used on `GET /api/auth/me` and `GET /api/users/me`.
- Registration and login are rate-limited per IP.

## Telegram/MTProto foundation (this phase only)

`src/services/telegram/telegramClient.js` and `storageChannel.js`
set up:

- Reading `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`,
  `TELEGRAM_SESSION_STRING`, `TELEGRAM_STORAGE_CHANNEL_ID` from env
- A lazily-connected, shared `TelegramClient` instance
- Storage channel entity resolution

They deliberately do **not** implement upload, download, or chunking —
that's the next phase, building on the `storage_objects` table already
in the schema. If Telegram env vars are unset, `isTelegramConfigured()`
returns `false` and the rest of the app runs normally; Telegram is not
a hard dependency for auth to work.

### Generating a session string (do this once, outside the server)

```js
// scripts/generate-telegram-session.js (run manually, not part of the app)
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input"; // npm install input --save-dev, or prompt however you like

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
await client.start({
  phoneNumber: async () => await input.text("Phone number: "),
  password: async () => await input.text("2FA password (if set): "),
  phoneCode: async () => await input.text("Code you received: "),
  onError: (err) => console.error(err),
});
console.log("Save this as TELEGRAM_SESSION_STRING:");
console.log(client.session.save());
```

## Cloudflare Tunnel

Nothing in this backend hardcodes a tunnel hostname. `PUBLIC_BACKEND_URL`
in `.env` is the only place it's configured, and it's only used for
logging/health-check reporting right now — CORS is driven separately by
`FRONTEND_URL` / `ALLOWED_ORIGINS`. Point your tunnel at
`http://localhost:<PORT>` and set `TRUST_PROXY=true` and
`SESSION_SECURE_COOKIE=true` once you're running behind it over HTTPS.
