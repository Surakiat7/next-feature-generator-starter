import { loadConfig } from "../config";
import { addNamedExport, appendChildToElement, wrapLayoutChildren } from "../core/ast";
import { fileExists, readIfExists } from "../core/filesystem";
import { logger } from "../core/logger";
import { installDeps } from "../core/package-manager";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import {
  DARK_CLASS_BLOCK,
  DARK_VARIANT,
  themeProviderFile,
  themeToggleFile,
} from "../templates/theme";

export interface ThemeInitOptions {
  yes?: boolean;
  dryRun?: boolean;
  /** Skip the real dependency install (used by tests). */
  skipInstall?: boolean;
}

/** Enable Tailwind v4 class-based dark mode and map `.dark` to the dark palette. */
function enableClassDarkMode(css: string): string {
  let out = css;
  if (!out.includes("@custom-variant dark")) {
    const replaced = out.replace(
      /(@import\s+["']tailwindcss["'];\s*\n)/,
      `$1\n${DARK_VARIANT}\n`,
    );
    out = replaced !== out ? replaced : `${DARK_VARIANT}\n${out}`;
  }
  const mediaRe = /@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n\}/;
  if (!out.includes(".dark {")) {
    out = mediaRe.test(out)
      ? out.replace(mediaRe, DARK_CLASS_BLOCK)
      : `${out}\n${DARK_CLASS_BLOCK}\n`;
  }
  return out;
}

export async function runThemeInit(opts: ThemeInitOptions): Promise<FinalizeResult> {
  const cfg = await loadConfig();

  const providerPath = `${cfg.providersDir}/theme-provider.tsx`;
  if (fileExists(providerPath)) {
    logger.error("Theme is already initialized.");
    logger.dim("No files changed.");
    return "empty";
  }

  const planner = new Planner();

  // Provider + toggle.
  planner.create(providerPath, themeProviderFile());
  planner.create(`${cfg.sharedComponentsDir}/theme-toggle.tsx`, themeToggleFile());

  // Barrels.
  const providersBarrelPath = `${cfg.providersDir}/index.ts`;
  const providersBarrel = addNamedExport(
    readIfExists(providersBarrelPath) ?? "export {};\n",
    "./theme-provider",
    "ThemeProvider",
  );
  if (providersBarrel.added) planner.modify(providersBarrelPath, providersBarrel.source);

  const componentsBarrelPath = `${cfg.sharedComponentsDir}/index.ts`;
  const componentsBarrel = addNamedExport(
    readIfExists(componentsBarrelPath) ?? "export {};\n",
    "./theme-toggle",
    "ThemeToggle",
  );
  if (componentsBarrel.added) planner.modify(componentsBarrelPath, componentsBarrel.source);

  // Layout integration.
  const layoutSrc = readIfExists(cfg.rootLayout);
  if (layoutSrc) {
    const wrapped = wrapLayoutChildren(layoutSrc, {
      importName: "ThemeProvider",
      importPath: `${cfg.pathAlias}/providers/theme-provider`,
      open: "<ThemeProvider>",
      close: "</ThemeProvider>",
      suppressHydration: true,
    });
    if (wrapped.changed) planner.modify(cfg.rootLayout, wrapped.source);
  }

  // Tailwind dark mode.
  const cssSrc = readIfExists(cfg.globalsCss);
  if (cssSrc) {
    const nextCss = enableClassDarkMode(cssSrc);
    if (nextCss !== cssSrc) planner.modify(cfg.globalsCss, nextCss);
  }

  // Sample: drop a ThemeToggle onto the home page.
  const homePath = `${cfg.appDir}/page.tsx`;
  const homeSrc = readIfExists(homePath);
  if (homeSrc) {
    const injected = appendChildToElement(homeSrc, {
      importName: "ThemeToggle",
      importPath: `${cfg.pathAlias}/components/theme-toggle`,
      tag: "main",
      childJsx: "      <ThemeToggle />",
    });
    if (injected.changed) planner.modify(homePath, injected.source);
  }

  const result = await finalize(planner, {
    title: "Theme Generator",
    fields: [
      ["Modes", "light / dark / system"],
      ["Library", "next-themes"],
    ],
    yes: opts.yes,
    dryRun: opts.dryRun,
  });

  if (result === "written" && !opts.skipInstall) {
    logger.log();
    logger.info("Installing next-themes…");
    installDeps(["next-themes"]);
  }

  return result;
}
