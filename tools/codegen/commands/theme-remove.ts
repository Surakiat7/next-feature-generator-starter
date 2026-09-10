import fg from "fast-glob";
import { readFileSync } from "node:fs";
import { abs, loadConfig } from "../config";
import { removeNamedExport } from "../core/ast";
import { fileExists, readIfExists, toDisplayPath } from "../core/filesystem";
import { color, logger } from "../core/logger";
import { uninstallDeps } from "../core/package-manager";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { DARK_CLASS_BLOCK, DARK_VARIANT } from "../templates/theme";

export interface ThemeRemoveOptions {
  yes?: boolean;
  dryRun?: boolean;
  skipInstall?: boolean;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MEDIA_BLOCK = `@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}`;

/** Find user files (outside the generated theme files) that depend on theming. */
export async function scanThemeUsage(generated: string[]): Promise<string[]> {
  const cfg = await loadConfig();
  const files = await fg([`${cfg.srcDir}/**/*.{ts,tsx}`], {
    cwd: abs("."),
    absolute: true,
    ignore: ["**/node_modules/**", "**/.next/**"],
  });
  const generatedAbs = new Set(generated.map((p) => abs(p)));
  const dependents: string[] = [];
  for (const file of files) {
    if (generatedAbs.has(abs(file))) continue;
    const content = readFileSync(file, "utf8");
    if (
      /from ["']next-themes["']/.test(content) ||
      /useTheme\s*\(/.test(content) ||
      /<ThemeToggle[\s/>]/.test(content) ||
      /<ThemeProvider[\s/>]/.test(content)
    ) {
      dependents.push(toDisplayPath(file));
    }
  }
  return dependents;
}

export async function runThemeRemove(opts: ThemeRemoveOptions): Promise<FinalizeResult> {
  const cfg = await loadConfig();

  const providerPath = `${cfg.providersDir}/theme-provider.tsx`;
  const togglePath = `${cfg.sharedComponentsDir}/theme-toggle.tsx`;

  if (!fileExists(providerPath)) {
    logger.error("Theme is not initialized.");
    logger.dim("No files changed.");
    return "empty";
  }

  const dependents = await scanThemeUsage([providerPath, togglePath, cfg.rootLayout, `${cfg.appDir}/page.tsx`]);

  logger.heading("Theme removal analysis");
  logger.log();
  logger.field("Files using theme", String(dependents.length));
  for (const dep of dependents) logger.log(color.dim(`  ${dep}`));
  logger.log();
  logger.warn("Removing the theme system may modify application source code.");

  const planner = new Planner();
  planner.delete(providerPath);
  planner.delete(togglePath);

  // Barrels.
  const providersBarrelPath = `${cfg.providersDir}/index.ts`;
  const providersBarrel = removeNamedExport(readIfExists(providersBarrelPath) ?? "", "ThemeProvider");
  if (providersBarrel.added) planner.modify(providersBarrelPath, providersBarrel.source);

  const componentsBarrelPath = `${cfg.sharedComponentsDir}/index.ts`;
  const componentsBarrel = removeNamedExport(readIfExists(componentsBarrelPath) ?? "", "ThemeToggle");
  if (componentsBarrel.added) planner.modify(componentsBarrelPath, componentsBarrel.source);

  // Layout: unwrap the provider.
  const layoutSrc = readIfExists(cfg.rootLayout);
  if (layoutSrc) {
    let out = layoutSrc;
    const importPath = escapeRegExp(`${cfg.pathAlias}/providers/theme-provider`);
    out = out.replace(new RegExp(`import \\{ ThemeProvider \\} from ["']${importPath}["'];\\n?`), "");
    out = out.replace(/<ThemeProvider>\s*\{children\}\s*<\/ThemeProvider>/, "{children}");
    out = out.replace(/\s+suppressHydrationWarning/, "");
    if (out !== layoutSrc) planner.modify(cfg.rootLayout, out);
  }

  // Home page: drop the sample toggle.
  const homePath = `${cfg.appDir}/page.tsx`;
  const homeSrc = readIfExists(homePath);
  if (homeSrc) {
    let out = homeSrc;
    out = out.replace(/import \{ ThemeToggle \} from ["'][^"']+["'];\n?/, "");
    out = out.replace(/\s*<ThemeToggle \/>\n?/, "\n");
    if (out !== homeSrc) planner.modify(homePath, out);
  }

  // Globals: revert to media-query dark mode.
  const cssSrc = readIfExists(cfg.globalsCss);
  if (cssSrc) {
    let out = cssSrc;
    out = out.replace(new RegExp(`${escapeRegExp(DARK_VARIANT)}\\n?`), "");
    out = out.replace(new RegExp(`\\n?${escapeRegExp(DARK_CLASS_BLOCK)}`), `\n${MEDIA_BLOCK}`);
    if (out !== cssSrc) planner.modify(cfg.globalsCss, out);
  }

  const result = await finalize(planner, {
    title: "Theme removal",
    yes: opts.yes,
    dryRun: opts.dryRun,
    confirmDefault: false,
  });

  if (result === "written" && !opts.skipInstall) {
    logger.log();
    logger.info("Uninstalling next-themes…");
    uninstallDeps(["next-themes"]);
  }

  return result;
}
