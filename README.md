# Coralz Cloud

A cloud storage application. This monorepo has two independent projects:

```
/backend    Node.js/Express + PostgreSQL API (this phase's main focus)
/frontend   React 19 + TanStack Start frontend
```

## This phase

Backend foundation + authentication, connected to the existing
Login/Register UI. See `backend/README.md` for full setup and testing
instructions, and `frontend/README.md` for the frontend.

Quick start:

```bash
# 1. Backend
cd backend
cp .env.example .env      # fill in DATABASE_URL and SESSION_SECRET at minimum
npm install
npm run migrate
npm run dev                # http://localhost:4000

# 2. Frontend (separate terminal)
cd frontend
cp .env.example .env       # defaults to http://localhost:4000/api, adjust if needed
npm install
npm run dev                 # http://localhost:3000
```

Then open `http://localhost:3000`, register an account, and you should
land on the dashboard. Refreshing keeps you signed in; logging out
(account menu, top right of the dashboard) returns you to the login
page.

## What's implemented this phase

- User registration, login (email **or** username), logout, session
  handling, protected routes — see `backend/README.md`
- PostgreSQL schema: users, sessions, plans/subscriptions, folders,
  files, storage objects, sharing, storage usage — auth-active,
  everything else schema-only and ready for later phases
- Telegram/GramJS/MTProto foundation (config + connection lifecycle
  only — no upload/download yet)
- Backend is Cloudflare Tunnel-ready: nothing hardcodes a public URL,
  everything comes from `backend/.env`

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
