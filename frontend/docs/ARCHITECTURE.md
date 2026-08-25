# Coralz Cloud — Architecture (Phase 1)

## Monorepo layout

The repository is organised so the frontend stays fully independent of the
future backend. Phase 1 ships only the web frontend.

```
/                     workspace root (bun/npm workspaces)
  src/                apps/web — the Coralz Cloud frontend (React 19 + TS)
  docs/               product + engineering docs
  packages/           (future) shared packages: types, ui, sdk
  services/api/       (future) backend service — never imported by the frontend
```

The frontend never imports backend source. All future server access goes
through a single typed client layer (`src/lib/api/`), so the backend can be
swapped without touching UI code.

## Frontend structure

```
src/
  routes/             file-based routes (TanStack Router). Thin: metadata + page
  features/           one folder per product area, owns its components
    home/             Phase 1 — HomePage + hero, highlights, scroll cue
  components/
    layout/           header, logo, shared chrome
    ui/               primitives
  config/site.ts      product copy, nav registry
  styles.css          design system: tokens, animations (no colors in components)
```

### Conventions

- Colors, radii, fonts and keyframes live in `src/styles.css` as tokens.
  Components use semantic classes (`bg-primary`, `text-muted-foreground`).
- Each route defines its own `head()` metadata.
- Motion is subtle and respects `prefers-reduced-motion`.

## Planned phases

| Phase | Scope | Location |
| --- | --- | --- |
| 1 (done) | Foundations + Home page | `src/features/home` |
| 2 | Auth (login, signup, reset) | `src/features/auth` |
| 3 | Dashboard + file browser | `src/features/dashboard` |
| 4 | Storage/upload engine | `src/lib/api`, `services/api` |
| 5 | Payments + plans | `src/features/billing` |
