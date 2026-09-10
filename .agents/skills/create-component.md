# Skill: Create a Component

## Command

```
pnpm gen component <name> --feature <feature>   # feature-owned
pnpm gen component <name> --shared              # genuinely shared
pnpm gen component <name>                        # prompts for location
```

Examples:

```
pnpm gen component login-form --feature auth
pnpm gen component app-logo --shared
```

## What it produces

- Feature: `src/features/<feature>/components/<name>.tsx` + barrel export.
- Shared: `src/components/<name>.tsx` + barrel export.

## Rules

- Domain-specific components are **feature-owned**. Never silently place them in
  shared components.
- Only use `--shared` for genuinely reusable UI/infrastructure.
- If neither flag is given interactively, the generator asks where it should
  live — choose deliberately.

Re-running for an existing component name makes no changes.
