# Coralz Cloud

A cloud storage application. This monorepo has two independent projects:

```
/backend    Node.js/Express + PostgreSQL API (this phase's main focus)
/frontend   React 19 + TanStack Start frontend
```

## This phase

Backend foundation + authentication, connected to the existing
Login/Register UI. The backend is packaged to run as one Pterodactyl
server — API, local PostgreSQL, and the Cloudflare Tunnel all start
together from a single startup command. See `backend/README.md` for
full deployment and testing instructions, and `frontend/README.md`
for the frontend.

**Backend (Pterodactyl):** build `backend/Dockerfile`, import
`backend/docker/pterodactyl-egg.json` as an egg, create a server from
it, fill in the handful of variables it asks for
(`CLOUDFLARE_TUNNEL_TOKEN`, `CORS_ORIGIN`, `SESSION_SECRET`, the
Telegram ones). No database setup — Postgres runs inside the same
container and connects automatically. Full walkthrough in
`backend/README.md`.

**Frontend (separate, anywhere you like):**

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL to your backend's tunnel URL + /api
npm install
npm run dev                 # http://localhost:3000
```

Open the frontend, register an account, and you should land on the
dashboard. Refreshing keeps you signed in; logging out (account menu,
top right of the dashboard) returns you to the login page.

**Local backend development without Pterodactyl/Docker** is also
possible — see the "Local development" section in `backend/README.md`.

## What's implemented this phase

- User registration, login (email **or** username), logout, session
  handling, protected routes — see `backend/README.md`
- PostgreSQL schema: users, sessions, plans/subscriptions, folders,
  files, storage objects, sharing, storage usage — auth-active,
  everything else schema-only and ready for later phases
- Telegram/GramJS/MTProto foundation (config + connection lifecycle
  only — no upload/download yet)
- One Pterodactyl server runs the backend, its own local PostgreSQL,
  and the Cloudflare Tunnel together — `.env` only holds real secrets
  (tunnel token, CORS origin, session secret, Telegram credentials),
  never a database connection string

## What's intentionally not implemented yet

File uploads/downloads, folder management, sharing, payments,
subscriptions, admin dashboard, API marketplace, advanced analytics.
These are later phases — the database schema and Telegram foundation
are in place for them, but no logic sits on top of them yet.

## Note on the frontend as received

A few files the existing frontend code already imported were missing
from the project as uploaded (`vite.config.ts`, `src/lib/utils.ts`,
`src/config/site.ts`, `src/features/dashboard/data.ts`) — without
them the app couldn't build at all. These have been added with
minimal, non-visual content so the app runs; no existing page's
design was changed. See `frontend/README.md` for details.
