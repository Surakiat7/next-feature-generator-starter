# Next Feature Starter

A minimal, feature-based Next.js starter with built-in code generators.

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- Feature-based architecture with a centralized route registry
- `pnpm gen` generators: feature, page, component, i18n, theme
- Architecture checks: `doctor`, `routes check`
- Optional i18n (next-intl) and theme (next-themes)

## Quick start

```bash
git clone https://github.com/Surakiat7/next-feature-generator-starter.git
cd next-feature-generator-starter
pnpm install
pnpm dev
```

Open [`http://localhost:3000`](http://localhost:3000).  
The starter dashboard is at [`http://localhost:3000/dashboard-demo`](http://localhost:3000/dashboard-demo).

## Generate your first feature

```bash
pnpm gen feature auth --page login --route /login --path-key login
```

This creates:

```
src/features/auth/view/login-view.tsx
src/features/auth/index.ts
src/app/login/page.tsx
src/routes/paths.ts       # + login: "/login"
```

## Generator commands

```bash
# Feature, page, and component
pnpm gen feature <name> [--page <name> --route <path> --path-key <key>]
pnpm gen page <name> --feature <feature> --route <path> --path-key <key>
pnpm gen component <name> --feature <feature> | --shared

# Optional setup
pnpm gen i18n init | remove
pnpm gen theme init | remove

# Validation
pnpm gen routes check
pnpm gen doctor
```

All mutating commands support `--dry-run` and `--yes` and are idempotent.

## Routing

Never hardcode paths. Use `paths` from `@/routes`:

```tsx
import { paths } from "@/routes";

<Link href={paths.login}>Sign in</Link>
```

`pnpm gen routes check` fails the build if it finds hardcoded internal navigation in `Link`, `router.*`, `redirect`, or `permanentRedirect` calls.

## Project structure

```
src/
├── app/           thin pages that render feature views
├── components/    shared UI primitives
├── features/      domain code (most of your work)
├── hooks/         shared hooks
├── lib/           shared infrastructure
├── providers/     app providers
├── routes/        paths.ts — single source of truth
└── ...
```

## Starter dashboard

`/dashboard-demo` is a developer-only control center. It shows the real project state and lets you preview what each generator command sets up.

The root route `/` is the real application and stays separate from the dashboard.

## Scripts

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm start      # start production server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest (generator tests)
pnpm gen ...    # generator CLI
```

## For AI agents

See [`AGENTS.md`](AGENTS.md).
