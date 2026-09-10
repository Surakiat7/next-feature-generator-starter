# Architecture

The project is organized by **feature**, with a small set of genuinely shared
layers. Respect these boundaries.

```
src/
├── app/          Next.js App Router only. Thin pages that compose feature views.
├── components/   Genuinely shared UI (ui/ for primitives).
├── features/     Domain features. Most code lives here.
├── hooks/        Shared, app-wide hooks.
├── lib/          Shared infrastructure and utilities.
├── providers/    App-level React providers.
├── routes/       Single source of truth for application paths.
├── services/     Shared API/service infrastructure.
├── store/        Shared, app-wide state.
├── style/        Shared styling assets.
└── types/        Shared, app-wide types.
```

## Rules

- `src/app` contains only routing. A `page.tsx` imports a feature view and
  renders it. No business logic, no data orchestration in pages.
- Put feature-specific components, hooks, lib and types **inside the feature**
  (`src/features/<feature>/…`), not in the shared folders.
- Something is "shared" only when it is genuinely reusable infrastructure or UI —
  not merely because two files happen to use it. See
  [feature-based.md](./feature-based.md).
- Empty architectural folders keep a minimal `index.ts`. Do not create fake
  hooks/services/requests just to fill folders.

## Generators

Prefer the generator; it keeps this structure consistent and idempotent:

```
pnpm gen feature <name>
pnpm gen page <name> --feature <feature>
pnpm gen component <name> --feature <feature> | --shared
pnpm gen doctor
```
