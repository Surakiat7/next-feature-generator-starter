# Routing

`src/routes/paths.ts` is the **single source of truth** for internal navigation.
Every application path must originate here.

## Never hardcode internal paths

```tsx
// ✗ Bad
<Link href="/login">…
router.push("/projects");
redirect("/login");

// ✓ Good
import { paths } from "@/routes";
<Link href={paths.login}>…
router.push(paths.projects.detail(projectId));
redirect(paths.login);
```

This applies to generated code, hand-written code, docs, sample UI, and any AI
edits. It is enforced by:

```
pnpm gen routes check
```

which uses AST analysis to detect hardcoded `<Link href>`, `router.push/replace/
prefetch`, `redirect`, and `permanentRedirect` literals.

## Adding a path

When a new application path is required:

1. Add it to `src/routes/paths.ts` (static string or a function for dynamic
   segments).
2. Consume the constant/function everywhere.
3. Never duplicate the literal across components.

Dynamic routes are functions:

```ts
export const paths = {
  home: "/",
  login: "/login",
  projects: {
    root: "/projects",
    detail: (projectId: string) => `/projects/${projectId}`,
  },
} as const;
```

The `feature`/`page` generators add entries here automatically via AST edits, so
you rarely edit this file by hand. Keep it a single `as const` object literal.

## i18n

Do **not** hardcode localized URLs (`/th/login`). Keep `paths.login` semantic;
locale prefixes are handled by the i18n navigation helpers in
`@/i18n/navigation`. See [i18n.md](./i18n.md).
