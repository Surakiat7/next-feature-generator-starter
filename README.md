# Next Feature Starter

Next.js starter template with a **feature-based project structure** and
**built-in code generators**. Create future projects from this template and
scaffold architecture with a single command instead of hand-wiring folders,
barrels, and routes.

- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind CSS v4
- Feature-based architecture with a centralized route registry
- A deterministic TypeScript generator (`pnpm gen`) — no AI at generation time
- Optional, reversible i18n (next-intl) and theme (next-themes)
- Architecture validation (`doctor`, `routes check`) and Vitest tests

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/          App Router (thin pages that compose feature views)
├── components/   Shared UI (ui/ for primitives)
├── features/     Domain features (most code lives here)
├── hooks/        Shared hooks
├── lib/          Shared infrastructure
├── providers/    App-level providers
├── routes/       paths.ts — single source of truth for navigation
├── services/     Shared API/service infrastructure
├── store/        Shared state
├── style/        Shared styling assets
└── types/        Shared types

tools/codegen/    The generator (CLI, core, templates, tests)
.agents/          Rules & skills for AI coding agents
codegen.config.ts Generator configuration
```

See [`.agents/rules/architecture.md`](.agents/rules/architecture.md) for the
full breakdown.

## Generator

```bash
pnpm gen feature <name>        # feature module (+ optional initial page)
pnpm gen page <name> --feature <feature>
pnpm gen component <name> --feature <feature> | --shared

pnpm gen i18n init | remove    # optional internationalization (next-intl)
pnpm gen theme init | remove   # optional dark/light theme (next-themes)

pnpm gen routes check          # detect hardcoded internal navigation
pnpm gen doctor                # inspect the architecture
```

All mutating commands support `--dry-run` (write nothing) and `--yes` (skip the
confirmation). Every command shows a change plan before writing and is
**idempotent** and **transactional** (rolls back on failure).

### Example

```bash
pnpm gen feature auth --page login --route /login --path-key login
```

produces:

```
src/features/auth/{components,hooks,lib,types}/index.ts
src/features/auth/view/login-view.tsx      # LoginView
src/features/auth/index.ts                 # exports LoginView
src/app/login/page.tsx                     # composes LoginView
src/routes/paths.ts                        # + login: "/login"
```

Dynamic routes generate a Next 16 async-params page and a path **function**:

```bash
pnpm gen page project-detail --feature projects --route "/projects/[projectId]" --path-key projects.detail
# paths.projects.detail(projectId) => `/projects/${projectId}`
```

## Centralized routing

Never hardcode internal paths. Import from `@/routes`:

```tsx
import { paths } from "@/routes";

<Link href={paths.login}>Sign in</Link>;
router.push(paths.projects.detail(projectId));
```

`pnpm gen routes check` fails the build if hardcoded `<Link href>`,
`router.push/replace/prefetch`, `redirect`, or `permanentRedirect` literals are
found (AST-based, not regex).

## i18n & theme

Both are **optional** and off by default. `init` installs the runtime dependency
and wires everything up; `remove` is destructive, defaults confirmation to **no**,
and refuses to run when it cannot safely undo a change (e.g. dynamic translation
keys). After `i18n init`, the same `pnpm gen page …` command automatically emits
pages under `src/app/[locale]/…`. See
[`.agents/rules/i18n.md`](.agents/rules/i18n.md) and
[`.agents/rules/theme.md`](.agents/rules/theme.md).

## Starter Dashboard

Optional **developer tooling** at [`/dashboard-demo`](http://localhost:3000/dashboard-demo)
— a development-time control center for understanding the starter architecture.
It shows **real detected project state** (features, application routes vs.
developer-tooling routes, i18n/theme status) and a clearly-labelled **simulated**
Live Generator Demo (animated terminal + file tree) that never touches your
files.

The root route `/` stays the developer's real application and contains none of
this — the dashboard lives only at `/dashboard-demo`.

A small floating shortcut into the dashboard is shown in the app when enabled:

```bash
# .env.local
SHOW_STARTER_DASHBOARD=true    # show the floating "</> Starter" shortcut
SHOW_STARTER_DASHBOARD=false   # hide it (safe default when unset)
```

`SHOW_STARTER_DASHBOARD` controls **only the floating shortcut**. It does **not**
disable the generators and does **not** block `/dashboard-demo` (still reachable
by direct navigation, with a persistent "← Back to App" action). Once your setup
is complete, set it to `false` — the CLI generators remain fully available:

```bash
pnpm gen feature ...   pnpm gen page ...   pnpm gen i18n ...
pnpm gen theme ...      pnpm gen doctor
```

## Scripts

```bash
pnpm dev / build / start / lint
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest (generator tests, run in temp fixtures)
pnpm gen ...          # the generator
```

## For AI agents

Start from [`AGENTS.md`](AGENTS.md); it indexes the rules in `.agents/rules` and
skills in `.agents/skills`.
