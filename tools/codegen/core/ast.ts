import {
  Node,
  ObjectLiteralExpression,
  Project,
  SyntaxKind,
} from "ts-morph";

function inMemoryProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { allowJs: true, jsx: 1 /* Preserve */ },
  });
}

/* ------------------------------------------------------------------ *
 * Route parsing
 * ------------------------------------------------------------------ */

export interface ParsedRoute {
  /** Whether the route contains dynamic `[param]` segments. */
  isDynamic: boolean;
  /** Ordered parameter names, e.g. ["projectId"]. */
  params: string[];
  /** TS initializer text for the paths registry (string literal or arrow fn). */
  initializer: string;
}

/**
 * Turn a Next.js route pattern into a value for `paths.ts`.
 *
 *   "/login"                 -> `"/login"`
 *   "/projects/[projectId]"  -> `(projectId: string) => \`/projects/${projectId}\``
 *   "/blog/[...slug]"        -> `(slug: string[]) => \`/blog/${slug.join("/")}\``
 */
export function parseRoute(route: string): ParsedRoute {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  const dynamicMatches = [...normalized.matchAll(/\[(\.\.\.)?([^\]]+)\]/g)];

  if (dynamicMatches.length === 0) {
    return { isDynamic: false, params: [], initializer: JSON.stringify(normalized) };
  }

  const params: string[] = [];
  const paramDecls: string[] = [];
  let template = normalized;

  for (const match of dynamicMatches) {
    const isCatchAll = Boolean(match[1]);
    const name = match[2].replace(/[^a-zA-Z0-9_]/g, "");
    params.push(name);
    paramDecls.push(`${name}: string${isCatchAll ? "[]" : ""}`);
    const replacement = isCatchAll ? `\${${name}.join("/")}` : `\${${name}}`;
    template = template.replace(match[0], replacement);
  }

  const initializer = `(${paramDecls.join(", ")}) => \`${template}\``;
  return { isDynamic: true, params, initializer };
}

/* ------------------------------------------------------------------ *
 * paths.ts manipulation
 * ------------------------------------------------------------------ */

function getPathsObject(project: Project, source: string): ObjectLiteralExpression {
  const file = project.createSourceFile("paths.ts", source, { overwrite: true });
  const decl = file.getVariableDeclaration("paths");
  if (!decl) throw new Error("Could not find `paths` declaration in routes file.");
  let init: Node | undefined = decl.getInitializer();
  if (init && init.isKind(SyntaxKind.AsExpression)) {
    init = init.getExpression();
  }
  if (!init || !init.isKind(SyntaxKind.ObjectLiteralExpression)) {
    throw new Error("`paths` must be an object literal.");
  }
  return init;
}

function objectFromProperty(obj: ObjectLiteralExpression, key: string): ObjectLiteralExpression | null {
  const prop = obj.getProperty(key);
  if (!prop || !prop.isKind(SyntaxKind.PropertyAssignment)) return null;
  let init: Node | undefined = prop.getInitializer();
  if (init && init.isKind(SyntaxKind.AsExpression)) init = init.getExpression();
  if (init && init.isKind(SyntaxKind.ObjectLiteralExpression)) return init;
  return null;
}

/** Whether a (possibly nested, dot-separated) route key already exists. */
export function hasRouteKey(source: string, keyPath: string): boolean {
  const project = inMemoryProject();
  let obj: ObjectLiteralExpression;
  try {
    obj = getPathsObject(project, source);
  } catch {
    return false;
  }
  const segments = keyPath.split(".");
  for (let i = 0; i < segments.length; i++) {
    const key = segments[i];
    if (i === segments.length - 1) {
      return Boolean(obj.getProperty(key));
    }
    const next = objectFromProperty(obj, key);
    if (!next) return false;
    obj = next;
  }
  return false;
}

export interface AddRouteResult {
  source: string;
  added: boolean;
}

/**
 * Add a route key to `paths.ts`, creating intermediate objects as needed.
 * Idempotent: if the leaf key already exists, the source is returned unchanged
 * with `added: false`.
 */
export function addRouteKey(
  source: string,
  keyPath: string,
  initializer: string,
): AddRouteResult {
  if (hasRouteKey(source, keyPath)) return { source, added: false };

  const project = inMemoryProject();
  const obj = getPathsObject(project, source);
  const segments = keyPath.split(".");

  let current = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    let next = objectFromProperty(current, key);
    if (!next) {
      const assignment = current.addPropertyAssignment({ name: key, initializer: "{}" });
      next = assignment.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    }
    current = next;
  }

  current.addPropertyAssignment({
    name: segments[segments.length - 1],
    initializer,
  });

  return { source: current.getSourceFile().getFullText(), added: true };
}

/** Collect every static string route value for duplicate detection. */
export function collectStaticRoutes(source: string): string[] {
  const project = inMemoryProject();
  let obj: ObjectLiteralExpression;
  try {
    obj = getPathsObject(project, source);
  } catch {
    return [];
  }
  const routes: string[] = [];
  const walk = (node: ObjectLiteralExpression) => {
    for (const prop of node.getProperties()) {
      if (!prop.isKind(SyntaxKind.PropertyAssignment)) continue;
      let init: Node | undefined = prop.getInitializer();
      if (init && init.isKind(SyntaxKind.AsExpression)) init = init.getExpression();
      if (!init) continue;
      if (init.isKind(SyntaxKind.StringLiteral)) {
        routes.push(init.getLiteralValue());
      } else if (init.isKind(SyntaxKind.ObjectLiteralExpression)) {
        walk(init);
      }
    }
  };
  walk(obj);
  return routes;
}

/* ------------------------------------------------------------------ *
 * Barrel / export manipulation
 * ------------------------------------------------------------------ */

export interface AddExportResult {
  source: string;
  added: boolean;
}

/**
 * Add `export { name } from "moduleSpecifier";` to a barrel file if that named
 * export from that module is not already present. Idempotent.
 */
export function addNamedExport(
  source: string,
  moduleSpecifier: string,
  name: string,
): AddExportResult {
  const project = inMemoryProject();
  const file = project.createSourceFile("index.ts", source, { overwrite: true });

  for (const decl of file.getExportDeclarations()) {
    if (decl.getModuleSpecifierValue() !== moduleSpecifier) continue;
    const already = decl.getNamedExports().some((e) => e.getName() === name);
    if (already) return { source, added: false };
  }

  // Drop a placeholder `export {};` if present.
  for (const decl of file.getExportDeclarations()) {
    if (
      decl.getNamedExports().length === 0 &&
      !decl.getModuleSpecifier() &&
      !decl.isNamespaceExport()
    ) {
      decl.remove();
    }
  }

  file.addExportDeclaration({ namedExports: [name], moduleSpecifier });
  return { source: file.getFullText(), added: true };
}

/** Remove a named export from a barrel. If it leaves an empty file, restore a
 * placeholder `export {};` so the module stays valid. Idempotent. */
export function removeNamedExport(source: string, name: string): AddExportResult {
  const project = inMemoryProject();
  const file = project.createSourceFile("index.ts", source, { overwrite: true });
  let removed = false;

  for (const decl of file.getExportDeclarations()) {
    const named = decl.getNamedExports();
    const match = named.find((e) => e.getName() === name);
    if (!match) continue;
    if (named.length === 1) decl.remove();
    else match.remove();
    removed = true;
  }

  if (!removed) return { source, added: false };

  if (file.getExportDeclarations().length === 0 && file.getStatements().length === 0) {
    file.addStatements("export {};");
  }
  return { source: file.getFullText(), added: true };
}

/* ------------------------------------------------------------------ *
 * Layout provider integration
 * ------------------------------------------------------------------ */

export interface WrapLayoutOptions {
  importName: string;
  importPath: string;
  /** Opening JSX for the wrapper, e.g. `<ThemeProvider attributeQuoteChar>`. */
  open: string;
  close: string;
  /** Add `suppressHydrationWarning` to the <html> element. */
  suppressHydration?: boolean;
}

export interface WrapLayoutResult {
  source: string;
  changed: boolean;
}

/**
 * Wrap the `{children}` expression in a root layout with a provider component,
 * adding the import and (optionally) `suppressHydrationWarning` on `<html>`.
 * Idempotent: if the wrapper is already present, nothing changes.
 */
export function wrapLayoutChildren(
  source: string,
  opts: WrapLayoutOptions,
): WrapLayoutResult {
  if (new RegExp(`<${opts.importName}[\\s>]`).test(source)) {
    return { source, changed: false };
  }

  const project = inMemoryProject();
  const file = project.createSourceFile("layout.tsx", source, { overwrite: true });

  const hasImport = file
    .getImportDeclarations()
    .some((d) => d.getModuleSpecifierValue() === opts.importPath);
  if (!hasImport) {
    file.addImportDeclaration({
      namedImports: [opts.importName],
      moduleSpecifier: opts.importPath,
    });
  }

  if (opts.suppressHydration) {
    file.forEachDescendant((node) => {
      if (
        node.isKind(SyntaxKind.JsxOpeningElement) &&
        node.getTagNameNode().getText() === "html" &&
        !node.getAttribute("suppressHydrationWarning")
      ) {
        node.addAttribute({ name: "suppressHydrationWarning" });
      }
    });
  }

  let wrapped = false;
  file.forEachDescendant((node) => {
    if (wrapped) return;
    if (node.isKind(SyntaxKind.JsxExpression)) {
      const expr = node.getExpression();
      if (expr && expr.isKind(SyntaxKind.Identifier) && expr.getText() === "children") {
        node.replaceWithText(`${opts.open}{children}${opts.close}`);
        wrapped = true;
      }
    }
  });

  return { source: file.getFullText(), changed: true };
}

/* ------------------------------------------------------------------ *
 * next.config wrapping (next-intl plugin)
 * ------------------------------------------------------------------ */

/** Wrap `export default <config>` with `withNextIntl(...)`. Idempotent. */
export function wrapNextConfigWithIntl(source: string, requestPath: string): WrapLayoutResult {
  if (/createNextIntlPlugin/.test(source)) return { source, changed: false };

  const project = inMemoryProject();
  const file = project.createSourceFile("next.config.ts", source, { overwrite: true });

  file.addImportDeclaration({
    defaultImport: "createNextIntlPlugin",
    moduleSpecifier: "next-intl/plugin",
  });

  const importCount = file.getImportDeclarations().length;
  file.insertStatements(
    importCount,
    `\nconst withNextIntl = createNextIntlPlugin(${JSON.stringify(requestPath)});\n`,
  );

  const exportAssignment = file.getExportAssignments()[0];
  if (exportAssignment) {
    const expr = exportAssignment.getExpression().getText();
    exportAssignment.setExpression(`withNextIntl(${expr})`);
  }

  return { source: file.getFullText(), changed: true };
}

/** Reverse {@link wrapNextConfigWithIntl}. */
export function unwrapNextConfigIntl(source: string): WrapLayoutResult {
  if (!/createNextIntlPlugin/.test(source)) return { source, changed: false };

  const project = inMemoryProject();
  const file = project.createSourceFile("next.config.ts", source, { overwrite: true });

  file
    .getImportDeclarations()
    .filter((d) => d.getModuleSpecifierValue() === "next-intl/plugin")
    .forEach((d) => d.remove());

  file
    .getVariableStatements()
    .filter((s) => s.getDeclarations().some((d) => d.getName() === "withNextIntl"))
    .forEach((s) => s.remove());

  const exportAssignment = file.getExportAssignments()[0];
  if (exportAssignment) {
    const expr = exportAssignment.getExpression().getText();
    const inner = expr.replace(/^withNextIntl\((.*)\)$/, "$1");
    exportAssignment.setExpression(inner);
  }

  return { source: file.getFullText(), changed: true };
}

export interface InjectChildOptions {
  importName: string;
  importPath: string;
  /** Tag whose element receives the child, e.g. "main". */
  tag: string;
  /** JSX text to append as the last child, e.g. "<ThemeToggle />". */
  childJsx: string;
}

/**
 * Append a JSX child (and its import) to the first element with the given tag.
 * Idempotent on the imported component name. Returns changed:false if the tag
 * is not found, so callers can decide how to surface a missing sample host.
 */
export function appendChildToElement(
  source: string,
  opts: InjectChildOptions,
): WrapLayoutResult {
  if (new RegExp(`<${opts.importName}[\\s/>]`).test(source)) {
    return { source, changed: false };
  }

  const project = inMemoryProject();
  const file = project.createSourceFile("host.tsx", source, { overwrite: true });

  const hasImport = file
    .getImportDeclarations()
    .some((d) => d.getModuleSpecifierValue() === opts.importPath);
  if (!hasImport) {
    file.addImportDeclaration({
      namedImports: [opts.importName],
      moduleSpecifier: opts.importPath,
    });
  }

  let changed = false;
  file.forEachDescendant((node) => {
    if (changed) return;
    if (
      node.isKind(SyntaxKind.JsxElement) &&
      node.getOpeningElement().getTagNameNode().getText() === opts.tag
    ) {
      const text = node.getText();
      const closeTag = `</${opts.tag}>`;
      const idx = text.lastIndexOf(closeTag);
      if (idx === -1) return;
      node.replaceWithText(text.slice(0, idx) + `${opts.childJsx}\n` + text.slice(idx));
      changed = true;
    }
  });

  return { source: changed ? file.getFullText() : source, changed };
}
