# Skill: Create a Feature

Use the generator; do not hand-scaffold.

## Command

```
pnpm gen feature <name> [--page <page> --route <route> --path-key <key>] [--yes] [--dry-run]
```

Interactive (prompts for page/route/key):

```
pnpm gen feature auth
```

Non-interactive:

```
pnpm gen feature auth --page login --route /login --path-key login --yes
```

## What it produces

```
src/features/auth/{components,hooks,lib,types}/index.ts
src/features/auth/view/login-view.tsx      # LoginView
src/features/auth/index.ts                 # exports LoginView
src/app/login/page.tsx                     # composes LoginView
src/routes/paths.ts                        # + login: "/login"
```

With i18n enabled the page is emitted under `src/app/[locale]/login/page.tsx`.

## Checklist

1. Pick a kebab-case name (`user-profile`).
2. Preview with `--dry-run` if unsure.
3. Run the command; confirm the plan.
4. Put feature-specific code inside the feature; keep `page.tsx` thin.
5. Verify: `pnpm gen doctor && pnpm gen routes check`.

Re-running for an existing feature makes **no changes** (idempotent).
