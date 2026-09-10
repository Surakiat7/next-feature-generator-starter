import fg from "fast-glob";
import { Node, Project, SyntaxKind } from "ts-morph";
import { abs, loadConfig } from "../config";
import { toDisplayPath } from "../core/filesystem";
import { color, logger } from "../core/logger";

export interface RouteFinding {
  file: string;
  line: number;
  code: string;
  value: string;
}

const NAV_METHODS = new Set(["push", "replace", "prefetch"]);
const NAV_FUNCTIONS = new Set(["redirect", "permanentRedirect"]);

/** Internal absolute navigation path we care about (not external / asset). */
function isInternalPath(value: string): boolean {
  if (!value.startsWith("/")) return false; // relative / external
  if (value.startsWith("//")) return false; // protocol-relative
  if (value.startsWith("/api")) return false; // API route, not navigation
  if (/\.[a-z0-9]+$/i.test(value)) return false; // /foo.svg, /file.ico assets
  return true;
}

function firstStringArg(node: Node): { value: string; text: string } | null {
  if (!node.isKind(SyntaxKind.CallExpression)) return null;
  const arg = node.getArguments()[0];
  if (arg && arg.isKind(SyntaxKind.StringLiteral)) {
    return { value: arg.getLiteralValue(), text: node.getText() };
  }
  return null;
}

/**
 * Scan the source tree for hardcoded internal navigation paths, which should
 * instead come from `src/routes/paths.ts`. Uses AST analysis, not regex.
 */
export async function findHardcodedRoutes(): Promise<RouteFinding[]> {
  const cfg = await loadConfig();
  const routesFileAbs = abs(cfg.routesFile);

  const files = await fg([`${cfg.srcDir}/**/*.{ts,tsx}`], {
    cwd: abs("."),
    absolute: true,
    ignore: ["**/node_modules/**", "**/.next/**"],
  });

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true, jsx: 4 /* Preserve */ },
  });

  const findings: RouteFinding[] = [];

  for (const filePath of files) {
    if (abs(filePath) === routesFileAbs) continue; // the registry itself
    const source = project.addSourceFileAtPath(filePath);
    const display = toDisplayPath(filePath);

    const record = (node: Node, value: string) => {
      if (!isInternalPath(value)) return;
      findings.push({
        file: display,
        line: node.getStartLineNumber(),
        code: node.getText().replace(/\s+/g, " ").slice(0, 80),
        value,
      });
    };

    // <Link href="/..."> JSX attributes.
    source.forEachDescendant((node) => {
      if (node.isKind(SyntaxKind.JsxAttribute) && node.getNameNode().getText() === "href") {
        const init = node.getInitializer();
        if (init && init.isKind(SyntaxKind.StringLiteral)) {
          const parent = node.getFirstAncestorByKind(SyntaxKind.JsxOpeningElement)
            ?? node.getFirstAncestorByKind(SyntaxKind.JsxSelfClosingElement);
          const tag = parent?.getTagNameNode().getText();
          if (tag === "Link") record(node, init.getLiteralValue());
        }
        return;
      }

      if (node.isKind(SyntaxKind.CallExpression)) {
        const expr = node.getExpression();
        // redirect("/...") / permanentRedirect("/...")
        if (expr.isKind(SyntaxKind.Identifier) && NAV_FUNCTIONS.has(expr.getText())) {
          const arg = firstStringArg(node);
          if (arg) record(node, arg.value);
        }
        // router.push("/...") / .replace / .prefetch
        if (expr.isKind(SyntaxKind.PropertyAccessExpression)) {
          const method = expr.getName();
          const obj = expr.getExpression().getText();
          if (NAV_METHODS.has(method) && /router/i.test(obj)) {
            const arg = firstStringArg(node);
            if (arg) record(node, arg.value);
          }
        }
      }
    });

    project.removeSourceFile(source);
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

export async function runRoutesCheck(): Promise<number> {
  logger.heading("Routes Check");
  const findings = await findHardcodedRoutes();

  if (findings.length === 0) {
    logger.log();
    logger.success("No hardcoded internal navigation paths found.");
    return 0;
  }

  logger.log();
  logger.error(`Found ${findings.length} hardcoded navigation path(s):`);
  logger.log();
  for (const f of findings) {
    logger.log(
      `  ${color.cyan(`${f.file}:${f.line}`)}  ${color.dim(f.code)}`,
    );
  }
  logger.log();
  logger.dim("Move these into src/routes/paths.ts and reference paths.* instead.");
  return findings.length;
}
