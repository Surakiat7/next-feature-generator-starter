# Feature-Based Architecture

A feature owns everything specific to a domain area.

```
src/features/<feature>/
├── components/   feature UI            (index.ts barrel)
├── hooks/        feature hooks         (index.ts barrel)
├── lib/          feature logic/utils   (index.ts barrel)
├── types/        feature types         (index.ts barrel)
├── view/         page-level views      (<page>-view.tsx)
└── index.ts      public API (exports views)
```

## Where does code go?

- **Feature-specific** → `src/features/<feature>/…`
- **Shared reusable** → `src/components`, `src/hooks`, `src/lib`

Do **not** move something to a shared folder only because two files use it.
Shared code must represent genuinely reusable application infrastructure or UI.
When in doubt, keep it in the feature; promote later if a third, unrelated
consumer appears.

## Public API

The feature root `index.ts` exposes only what other modules may import — usually
its views:

```ts
export { LoginView } from "./view/login-view";
```

Avoid barrels that re-export every internal file; they invite circular
dependencies and leak internals.

## Pages compose views

```tsx
// src/app/login/page.tsx
import { LoginView } from "@/features/auth";

export default function LoginPage() {
  return <LoginView />;
}
```

## Generate, don't hand-roll

```
pnpm gen feature auth --page login --route /login --path-key login
pnpm gen page forgot-password --feature auth --route /forgot-password --path-key forgotPassword
```

The generator is idempotent: re-running for an existing feature/page/route makes
no changes rather than overwriting.
