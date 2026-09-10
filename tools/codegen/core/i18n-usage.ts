import { Project, SourceFile, SyntaxKind } from "ts-morph";

const TRANSLATOR_FNS = new Set(["useTranslations", "getTranslations"]);

function project(): Project {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { allowJs: true, jsx: 1 /* Preserve */ },
  });
}

/**
 * Map translator variable name -> namespace (e.g. `t` -> "Home"). Declarations
 * live inside component/function bodies, so we walk all descendants, not just
 * top-level statements.
 */
function translatorVars(file: SourceFile): Map<string, string> {
  const map = new Map<string, string>();
  for (const decl of file.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
    let init = decl.getInitializer();
    if (init && init.isKind(SyntaxKind.AwaitExpression)) init = init.getExpression();
    if (!init || !init.isKind(SyntaxKind.CallExpression)) continue;
    const callee = init.getExpression();
    if (callee.isKind(SyntaxKind.Identifier) && TRANSLATOR_FNS.has(callee.getText())) {
      const arg = init.getArguments()[0];
      const ns = arg && arg.isKind(SyntaxKind.StringLiteral) ? arg.getLiteralValue() : "";
      map.set(decl.getName(), ns);
    }
  }
  return map;
}

function hasNextIntlImport(file: SourceFile): boolean {
  return file
    .getImportDeclarations()
    .some((d) => /^next-intl(\/|$)/.test(d.getModuleSpecifierValue()));
}

export interface DynamicKey {
  file: string;
  line: number;
  text: string;
}

export interface FileAnalysis {
  uses: boolean;
  staticCalls: number;
  dynamic: DynamicKey[];
}

/** Analyze one source file for translation usage and dynamic keys. */
export function analyzeSource(source: string, filePath: string): FileAnalysis {
  const file = project().createSourceFile("f.tsx", source, { overwrite: true });
  const vars = translatorVars(file);
  const uses = vars.size > 0 || hasNextIntlImport(file);

  let staticCalls = 0;
  const dynamic: DynamicKey[] = [];

  file.forEachDescendant((node) => {
    if (!node.isKind(SyntaxKind.CallExpression)) return;
    const expr = node.getExpression();
    if (!expr.isKind(SyntaxKind.Identifier) || !vars.has(expr.getText())) return;
    const arg = node.getArguments()[0];
    if (arg && arg.isKind(SyntaxKind.StringLiteral)) {
      staticCalls++;
    } else {
      dynamic.push({
        file: filePath,
        line: node.getStartLineNumber(),
        text: node.getText().replace(/\s+/g, " ").slice(0, 60),
      });
    }
  });

  return { uses, staticCalls, dynamic };
}

function resolveMessage(messages: unknown, dottedKey: string): string | undefined {
  let cur: unknown = messages;
  for (const part of dottedKey.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export interface ConvertResult {
  source: string;
  changed: boolean;
  unresolved: string[];
}

/**
 * Inline static `t("key")` calls with their default-locale values and strip the
 * translation hooks/imports. Any key missing from `messages` is reported in
 * `unresolved` so the caller can refuse to remove i18n.
 */
export function convertSource(source: string, messages: unknown): ConvertResult {
  const file = project().createSourceFile("f.tsx", source, { overwrite: true });
  const vars = translatorVars(file);
  if (vars.size === 0 && !hasNextIntlImport(file)) {
    return { source, changed: false, unresolved: [] };
  }

  const unresolved: string[] = [];

  const callNodes = file
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((node) => {
      const expr = node.getExpression();
      return expr.isKind(SyntaxKind.Identifier) && vars.has(expr.getText());
    });

  for (const node of callNodes) {
    if (node.wasForgotten()) continue;
    const expr = node.getExpression();
    const ns = vars.get(expr.getText()) ?? "";
    const arg = node.getArguments()[0];
    if (!arg || !arg.isKind(SyntaxKind.StringLiteral)) continue;
    const key = arg.getLiteralValue();
    const full = ns ? `${ns}.${key}` : key;
    const value = resolveMessage(messages, full);
    if (value === undefined) {
      unresolved.push(full);
      continue;
    }
    node.replaceWithText(JSON.stringify(value));
  }

  // Remove `const t = useTranslations(...)` statements (may be nested).
  for (const decl of file.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
    if (decl.wasForgotten() || !vars.has(decl.getName())) continue;
    const statement = decl.getVariableStatement();
    if (statement && !statement.wasForgotten()) statement.remove();
  }

  // Drop next-intl imports.
  for (const decl of file.getImportDeclarations()) {
    if (/^next-intl(\/|$)/.test(decl.getModuleSpecifierValue())) decl.remove();
  }

  return { source: file.getFullText(), changed: true, unresolved };
}
