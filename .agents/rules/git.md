# Git Safety

- Inspect `git status` before broad modifications; understand what is already
  changed.
- **Preserve unrelated working-tree changes.** Only touch what the task needs.
- Never run `git reset --hard` unless explicitly requested.
- Never force-push automatically. If a force push is explicitly approved, prefer
  `--force-with-lease`.
- **Do not commit or push automatically.** Leave commits to the developer unless
  asked.
- After completing work, report the list of changed files.
- The Next.js agent-rules block at the top of `AGENTS.md` is re-added by
  `next dev`. Commit it together with your work to keep the tree clean rather
  than deleting it repeatedly.
