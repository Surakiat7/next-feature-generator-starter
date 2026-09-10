# Testing

The generator is covered by **Vitest** tests in `tools/codegen/tests/`.

```
pnpm test          # run once
pnpm test:watch    # watch mode
```

## Rules

- Run generator integration tests inside **temporary directories**
  (`setupFixture()` in `tests/helpers.ts`). Never mutate the real project tree
  or the fixtures.
- Prefer deterministic assertions on generated file contents and on the returned
  `FinalizeResult` (`"written" | "dry-run" | "cancelled" | "empty"`).
- Mock `@inquirer/prompts` when a test needs to exercise the confirmation path;
  otherwise pass `{ yes: true }` to skip prompts.
- Pass `{ skipInstall: true }` to `theme`/`i18n` commands in tests so they do not
  hit the network.

## What to cover when extending the generator

- Feature/page/component creation (structure, view, page, public export, route).
- Idempotency (duplicate runs make no changes).
- Dynamic routes produce a path function.
- `--dry-run` and cancelled confirmation write **zero** files.
- Rollback restores prior state on a mid-operation failure.
- i18n/theme init are idempotent; remove detects usage and aborts on unsafe
  input.
- `doctor` passes on a valid starter and reports errors on a broken one.
