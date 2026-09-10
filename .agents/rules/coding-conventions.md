# Coding Conventions

## Naming

- Folders and files: **kebab-case** (`user-profile/`, `login-view.tsx`).
- React components: **PascalCase** (`UserProfileView`).
- Hooks: **useSomething** (`useUserProfile`).
- View files: `<page>-view.tsx` exporting `<Page>View`.

Example: `user-profile` → `src/features/user-profile/`, `UserProfileView`,
`user-profile-view.tsx`.

## Prefer

- Small, focused modules.
- Explicit types at module boundaries (props, return types of exported fns).
- Feature-owned code for feature-specific behavior.
- Deriving state from the source tree, not duplicating it.

## Avoid

- `any` and unnecessary type assertions.
- Business logic inside `page.tsx`.
- Hardcoded route strings — use `@/routes` (see [routing.md](./routing.md)).
- Duplicate abstractions and dead code.
- Huge barrel files that re-export every internal module. A feature's root
  `index.ts` exposes only its intended public API (typically its views).

## Validation

Before finishing a change run:

```
pnpm lint
pnpm typecheck
pnpm test
pnpm gen doctor
pnpm gen routes check
```
