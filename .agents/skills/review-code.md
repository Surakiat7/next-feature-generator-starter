# Skill: Review Code

Check a change against this starter's rules.

## Checklist

**Architecture**
- Feature-specific code lives in `src/features/<feature>/`, not shared folders.
- `page.tsx` is thin (composes a view; no business logic).
- No fake hooks/services/requests padding empty folders.

**Routing**
- No hardcoded internal paths (`href="/…"`, `router.push("/…")`, `redirect("/…")`).
  All navigation uses `paths.*` from `@/routes`. Run `pnpm gen routes check`.

**Conventions**
- kebab-case files/folders, PascalCase components, `useX` hooks.
- No `any`, no needless assertions, no dead code, explicit boundary types.
- Feature root `index.ts` exports only the public API.

**i18n / theme (if enabled)**
- Navigation uses `@/i18n/navigation`; no hardcoded `/th/…` URLs.
- No dynamic translation keys.
- Theme hooks are client-only and hydration-safe.

**Tests**
- Generator changes covered by Vitest in temp fixtures.

## Commands

```
pnpm lint
pnpm typecheck
pnpm test
pnpm gen doctor
pnpm gen routes check
```

Report findings as concrete, file-anchored items with a suggested fix.
