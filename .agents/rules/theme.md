# Theme (dark / light / system)

Theming is **optional** and not installed in the base starter. It uses
[next-themes](https://github.com/pacocoursey/next-themes) with Tailwind v4
class-based dark mode.

## Enable / disable

```
pnpm gen theme init     # installs next-themes, integrates the layout
pnpm gen theme remove   # destructive; confirmation defaults to NO
```

`init` creates `src/providers/theme-provider.tsx` and
`src/components/theme-toggle.tsx`, wraps the root layout with `ThemeProvider`
(adding `suppressHydrationWarning` to `<html>`), enables the Tailwind
`@custom-variant dark` and a `.dark` palette in `globals.css`, and drops a
sample `ThemeToggle` on the home page.

## Rules

- Use the `ThemeToggle` component or `useTheme()` from `next-themes` in client
  components only (`"use client"`).
- Guard against hydration mismatch: read the resolved theme after mount, as
  `ThemeToggle` does.
- Style dark variants with Tailwind's `dark:` utilities; they respond to the
  `.dark` class set by next-themes.
- Do not manually edit the layout to add the provider — the generator does it
  safely and idempotently.

## Removal safety

`gen theme remove` scans for `useTheme`, `ThemeProvider`, `next-themes` imports
and `ThemeToggle` usage, reports dependent files, then removes the provider,
toggle, layout integration and dependency.
