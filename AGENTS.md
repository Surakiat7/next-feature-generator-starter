<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Next Feature Starter — Agent Guide

This repository is a **feature-based Next.js starter** with a built-in code
generator. Read the relevant rule below **before** changing the matching part of
the project. The rules are the source of truth; this file is only the index.

## Stack

- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind CSS v4
- Package manager: **pnpm** (`pnpm gen ...`)
- Generator: `tools/codegen` (run via `pnpm gen`)

## When you are about to…

| Task | Read first | Prefer |
| --- | --- | --- |
| Add a feature | `.agents/rules/feature-based.md`, `.agents/skills/create-feature.md` | `pnpm gen feature <name>` |
| Add a page | `.agents/rules/feature-based.md`, `.agents/skills/create-page.md` | `pnpm gen page <name> --feature <f>` |
| Add a component | `.agents/rules/architecture.md`, `.agents/skills/create-component.md` | `pnpm gen component <name>` |
| Navigate / link | `.agents/rules/routing.md` | `paths.*` from `@/routes` |
| Add/remove i18n | `.agents/rules/i18n.md` | `pnpm gen i18n init` / `remove` |
| Add/remove theme | `.agents/rules/theme.md` | `pnpm gen theme init` / `remove` |
| Write tests | `.agents/rules/testing.md` | Vitest in `tools/codegen/tests` |
| Use git | `.agents/rules/git.md` | never auto-commit/push |

## Non-negotiables

1. **No hardcoded internal navigation.** All app paths come from
   `src/routes/paths.ts`. Enforced by `pnpm gen routes check`.
2. **Feature code stays in `src/features/<feature>/`.** Only genuinely shared
   code lives in `src/components`, `src/hooks`, `src/lib`.
3. **`page.tsx` stays thin** — it composes a feature view, no business logic.
4. **Prefer the generator** over hand-writing scaffolding; it keeps the
   structure, barrels, and route registry consistent and idempotent.
5. Run `pnpm gen doctor` and `pnpm gen routes check` before finishing.

## Rules

- [architecture.md](.agents/rules/architecture.md) — folder responsibilities
- [coding-conventions.md](.agents/rules/coding-conventions.md) — naming & style
- [feature-based.md](.agents/rules/feature-based.md) — feature boundaries
- [routing.md](.agents/rules/routing.md) — centralized routes
- [i18n.md](.agents/rules/i18n.md) — internationalization
- [theme.md](.agents/rules/theme.md) — dark/light theme
- [testing.md](.agents/rules/testing.md) — generator tests
- [git.md](.agents/rules/git.md) — git safety

## Skills

- [create-feature.md](.agents/skills/create-feature.md)
- [create-page.md](.agents/skills/create-page.md)
- [create-component.md](.agents/skills/create-component.md)
- [refactor-feature.md](.agents/skills/refactor-feature.md)
- [review-code.md](.agents/skills/review-code.md)
- [git-workflow.md](.agents/skills/git-workflow.md)
