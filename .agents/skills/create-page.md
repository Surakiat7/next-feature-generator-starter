# Skill: Create a Page

Add a page to an **existing** feature.

## Command

```
pnpm gen page <name> --feature <feature> [--route <route>] [--path-key <key>] [--yes] [--dry-run]
```

Examples:

```
pnpm gen page forgot-password --feature auth --route /forgot-password --path-key forgotPassword
pnpm gen page project-detail --feature projects --route "/projects/[projectId]" --path-key projects.detail
```

## What it produces

- `src/features/<feature>/view/<name>-view.tsx`
- `src/app/<route>/page.tsx` (or `src/app/[locale]/<route>/page.tsx` with i18n)
- updates the feature `index.ts` and `src/routes/paths.ts`

## Dynamic routes

`--route "/projects/[projectId]"` generates a Next 16 async-params page and a
path **function** in `paths.ts`:

```ts
projects: { detail: (projectId: string) => `/projects/${projectId}` }
```

## Checklist

1. The feature must already exist (`pnpm gen feature` first).
2. Use a dotted `--path-key` (`projects.detail`) to nest under a parent.
3. Quote routes containing `[` in the shell.
4. Verify: `pnpm gen routes check`.
