# Coralz Cloud

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Authentication (this phase)

The Login and Register pages are wired to the backend in `../backend`.
Design is unchanged — only the submit handlers, error states, and
loading states were added.

- `src/lib/api/client.ts` — typed fetch wrapper, sends cookies for
  session auth, normalizes backend error responses
- `src/lib/api/auth.ts` — register/login/logout/me request functions
- `src/lib/auth/AuthContext.tsx` — session state via React Query,
  provides `useAuth()` (`user`, `isLoading`, `register`, `login`, `logout`)
- `src/lib/auth/RequireAuth.tsx` — wraps `DashboardPage`; redirects to
  `/login` if there's no active session
- `.env` needs `VITE_API_URL` pointing at the backend (defaults to
  `http://localhost:4000/api` — see `.env.example`)

`DashboardHeader`'s account button (previously non-functional) now
opens a small menu with the signed-in user's name/email and a Log out
action, using the same interaction pattern already used elsewhere in
this header (local `useState` toggle, no new UI library).

### Files that were missing but already referenced

These didn't exist in the project as uploaded, so the app couldn't
build. They've been added with minimal, functional content — no
design decisions, just filling the gap so existing components render:

- `vite.config.ts` — the build wouldn't run at all without this
- `src/lib/utils.ts` — the standard `cn()` helper every `ui/*` component imports
- `src/config/site.ts` — product name/description/nav, referenced by `Header`, `AuthLayout`, `DashboardHeader`
- `src/features/dashboard/data.ts` — mock storage/folders/files data the dashboard components already expected; kept empty/zeroed since file and folder management isn't implemented this phase

Everything else in the frontend — layout, styling, components — is
untouched.
