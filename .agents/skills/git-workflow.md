# Skill: Git Workflow

Follow [`.agents/rules/git.md`](../rules/git.md).

## Before changing code

```
git status
git diff
```

Understand existing uncommitted changes and preserve unrelated ones.

## While working

- Make focused edits. Prefer the generator for scaffolding so diffs stay small
  and consistent.
- Do not run `git reset --hard`, rebases, or force pushes on your own.

## Before finishing

```
pnpm lint && pnpm typecheck && pnpm test
pnpm gen doctor && pnpm gen routes check
```

## Handing off

- **Do not commit or push automatically.** Summarize the changed files and let
  the developer commit.
- If asked to commit, write a clear message describing the change; never bypass
  hooks or signing unless explicitly told to.
- If a force push is explicitly approved, use `--force-with-lease`.
