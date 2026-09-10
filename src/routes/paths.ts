/**
 * Centralized application route registry.
 *
 * This is the SINGLE SOURCE OF TRUTH for internal navigation paths.
 * Do not hardcode route strings in components, pages, proxy, or docs.
 * Every `<Link href>`, `router.push`, `redirect`, etc. must reference a value
 * from here. The `gen routes check` command enforces this rule.
 *
 * Static routes are plain strings. Dynamic routes are functions that build the
 * path from their parameters, e.g. `paths.projects.detail(projectId)`.
 *
 * The code generators add entries to this object automatically via AST edits,
 * so keep it a single `as const` object literal.
 */
export const paths = {
  home: "/",
} as const;
