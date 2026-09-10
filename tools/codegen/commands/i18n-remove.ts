import fg from "fast-glob";
import { readFileSync } from "node:fs";
import { abs, loadConfig } from "../config";
import { removeNamedExport, unwrapNextConfigIntl } from "../core/ast";
import {
  getDefaultLocale,
  getLocales,
} from "../core/detect";
import { fileExists, readIfExists, toDisplayPath } from "../core/filesystem";
import { analyzeSource, convertSource, type DynamicKey } from "../core/i18n-usage";
import { color, logger } from "../core/logger";
import { uninstallDeps } from "../core/package-manager";
import { Planner, finalize, type FinalizeResult } from "../core/planner";

export interface I18nRemoveOptions {
  yes?: boolean;
  dryRun?: boolean;
  skipInstall?: boolean;
}

function rootLayoutFile(): string {
  return `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Feature Starter",
  description: "Feature-based Next.js starter with built-in code generation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={\`\${geistSans.variable} \${geistMono.variable} h-full antialiased\`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
`;
}

function plainHomeFile(title: string, description: string): string {
  return `export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">${title}</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        ${description}
      </p>
    </main>
  );
}
`;
}

export async function runI18nRemove(opts: I18nRemoveOptions): Promise<FinalizeResult> {
  const cfg = await loadConfig();

  if (!fileExists(`${cfg.i18nDir}/request.ts`)) {
    logger.error("i18n is not initialized.");
    logger.dim("No files changed.");
    return "empty";
  }

  const locales = await getLocales(cfg);
  const defaultLocale = (await getDefaultLocale(cfg)) ?? locales[0] ?? "en";
  const defaultMessages = JSON.parse(
    readIfExists(`${cfg.messagesDir}/${defaultLocale}.json`) ?? "{}",
  );

  // Files we will delete outright — no need to convert them.
  const localeSwitcherPath = `${cfg.sharedComponentsDir}/locale-switcher.tsx`;
  const localeLayoutPath = `${cfg.appDir}/[locale]/layout.tsx`;
  const localeHomePath = `${cfg.appDir}/[locale]/page.tsx`;
  const deleteSet = new Set(
    [localeSwitcherPath, localeLayoutPath, localeHomePath, `${cfg.srcDir}/proxy.ts`].map((p) => abs(p)),
  );

  // Analyze translation usage.
  const files = await fg([`${cfg.srcDir}/**/*.{ts,tsx}`], {
    cwd: abs("."),
    ignore: ["**/node_modules/**", "**/.next/**", `${cfg.i18nDir}/**`],
  });

  let staticCalls = 0;
  let filesUsing = 0;
  const dynamic: DynamicKey[] = [];
  for (const rel of files) {
    const content = readFileSync(abs(rel), "utf8");
    const analysis = analyzeSource(content, toDisplayPath(rel));
    if (analysis.staticCalls > 0 || analysis.dynamic.length > 0) filesUsing++;
    staticCalls += analysis.staticCalls;
    dynamic.push(...analysis.dynamic);
  }

  logger.heading("i18n removal analysis");
  logger.log();
  logger.field("Locales", locales.join(", "));
  logger.field("Default locale", defaultLocale);
  logger.field("Translation calls", String(staticCalls));
  logger.field("Files using i18n", String(filesUsing));
  logger.field("Dynamic calls", String(dynamic.length));
  logger.log();

  if (dynamic.length > 0) {
    logger.error("Cannot safely remove i18n.");
    logger.log();
    for (const d of dynamic) {
      logger.log(`  ${color.cyan(`${d.file}:${d.line}`)}  ${color.dim(d.text)}`);
    }
    logger.log();
    logger.dim("Dynamic translation keys cannot be statically inlined. No files were changed.");
    return "empty";
  }

  const planner = new Planner();
  const unresolvedAll: string[] = [];

  // Convert kept files that use translations (the home page is regenerated).
  for (const rel of files) {
    if (deleteSet.has(abs(rel)) || abs(rel) === abs(localeHomePath)) continue;
    const content = readFileSync(abs(rel), "utf8");
    const analysis = analyzeSource(content, rel);
    if (!analysis.uses) continue;
    const converted = convertSource(content, defaultMessages);
    if (converted.unresolved.length) {
      unresolvedAll.push(...converted.unresolved.map((k) => `${rel}: ${k}`));
    }
    if (converted.changed) planner.modify(rel, converted.source);
  }

  if (unresolvedAll.length > 0) {
    logger.error("Cannot safely remove i18n.");
    logger.log();
    for (const u of unresolvedAll) logger.log(color.dim(`  missing message: ${u}`));
    logger.log();
    logger.dim("No files were changed.");
    return "empty";
  }

  // Restore a plain root layout and home page.
  planner.create(cfg.rootLayout, rootLayoutFile());
  const home = (defaultMessages.Home ?? {}) as { title?: string; description?: string };
  planner.create(
    `${cfg.appDir}/page.tsx`,
    plainHomeFile(home.title ?? "Next Feature Starter", home.description ?? ""),
  );
  planner.delete(localeLayoutPath);
  planner.delete(localeHomePath);

  // Move other pages out of [locale].
  const localePages = await fg([`${cfg.appDir}/[locale]/**/page.tsx`], {
    cwd: abs("."),
    ignore: ["**/node_modules/**"],
  });
  for (const rel of localePages) {
    if (rel === localeHomePath) continue;
    const dest = rel.replace(`${cfg.appDir}/[locale]/`, `${cfg.appDir}/`);
    if (fileExists(dest)) throw new Error(`Cannot restore ${rel}: ${dest} already exists.`);
    planner.move(rel, dest);
  }

  // Delete i18n infrastructure.
  for (const rel of await fg([`${cfg.i18nDir}/*.ts`], { cwd: abs(".") })) {
    planner.delete(rel);
  }
  if (fileExists(`${cfg.srcDir}/proxy.ts`)) planner.delete(`${cfg.srcDir}/proxy.ts`);
  if (fileExists(localeSwitcherPath)) planner.delete(localeSwitcherPath);
  for (const locale of locales) {
    if (fileExists(`${cfg.messagesDir}/${locale}.json`)) {
      planner.delete(`${cfg.messagesDir}/${locale}.json`);
    }
  }

  // Barrel export.
  const barrelPath = `${cfg.sharedComponentsDir}/index.ts`;
  const barrel = removeNamedExport(readIfExists(barrelPath) ?? "", "LocaleSwitcher");
  if (barrel.added) planner.modify(barrelPath, barrel.source);

  // next.config.
  const nextConfigSrc = readIfExists("next.config.ts");
  if (nextConfigSrc) {
    const unwrapped = unwrapNextConfigIntl(nextConfigSrc);
    if (unwrapped.changed) planner.modify("next.config.ts", unwrapped.source);
  }

  const result = await finalize(planner, {
    title: "i18n removal",
    yes: opts.yes,
    dryRun: opts.dryRun,
    confirmDefault: false,
  });

  if (result === "written" && !opts.skipInstall) {
    logger.log();
    logger.info("Uninstalling next-intl…");
    uninstallDeps(["next-intl"]);
  }

  return result;
}
