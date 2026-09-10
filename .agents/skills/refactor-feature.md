# Skill: Refactor a Feature

## Goals

Keep features cohesive and boundaries clean.

## Steps

1. **Map the surface.** Read the feature's `index.ts` (its public API) and how
   other modules import it. Anything not exported is private.
2. **Keep feature code local.** Move feature-specific components/hooks/lib/types
   into `src/features/<feature>/…`. Do not promote to shared folders unless a
   third, unrelated consumer genuinely needs it.
3. **Thin the pages.** Ensure `src/app/**/page.tsx` only composes a view; push
   logic into the feature's `view`, `hooks`, or `lib`.
4. **Fix navigation.** Replace any hardcoded paths with `paths.*` from
   `@/routes`. Run `pnpm gen routes check`.
5. **Trim barrels.** The root `index.ts` exposes only intended public modules
   (usually views). Remove leaked internals to avoid circular deps.
6. **Update imports** across the codebase after moves.
7. **Validate:** `pnpm lint && pnpm typecheck && pnpm test && pnpm gen doctor`.

## Guardrails

- Preserve behavior; refactors should not change output.
- Prefer many small, verifiable edits over one large rewrite.
- Do not delete files you did not author without confirming they are unused.
