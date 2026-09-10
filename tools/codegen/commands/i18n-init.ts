import fg from "fast-glob";
import path from "node:path";
import { abs, loadConfig } from "../config";
import { addNamedExport, wrapNextConfigWithIntl } from "../core/ast";
import { fileExists, readIfExists } from "../core/filesystem";
import { logger } from "../core/logger";
import { installDeps } from "../core/package-manager";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { promptInput, promptSelect } from "../core/prompts";
import {
  localeHomePageFile,
  localeLayoutFile,
  localeSwitcherFile,
  messagesFile,
  navigationFile,
  proxyFile,
  requestFile,
  routingFile,
  type I18nConfig,
} from "../templates/i18n";

export interface I18nInitOptions {
  locales?: string;
  defaultLocale?: string;
  localePrefix?: string;
  yes?: boolean;
  dryRun?: boolean;
  skipInstall?: boolean;
}

export async function runI18nInit(opts: I18nInitOptions): Promise<FinalizeResult> {
  const cfg = await loadConfig();
  const interactive = Boolean(process.stdout.isTTY) && !opts.yes;

  if (fileExists(`${cfg.i18nDir}/request.ts`)) {
    logger.error("i18n is already initialized.");
    logger.dim("No files changed.");
    return "empty";
  }

  // Resolve configuration.
  let localesRaw = opts.locales;
  if (!localesRaw) {
    localesRaw = interactive ? await promptInput("Locales:", { default: "th,en" }) : "th,en";
  }
  const locales = localesRaw
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  let defaultLocale = opts.defaultLocale;
  if (!defaultLocale) {
    defaultLocale = interactive
      ? await promptInput("Default locale:", { default: locales[0] })
      : locales[0];
  }
  if (!locales.includes(defaultLocale)) {
    throw new Error(`Default locale "${defaultLocale}" is not in [${locales.join(", ")}].`);
  }

  let localePrefix = opts.localePrefix as I18nConfig["localePrefix"] | undefined;
  if (!localePrefix) {
    localePrefix = interactive
      ? await promptSelect<I18nConfig["localePrefix"]>("Locale prefix:", [
          { name: "always", value: "always" },
          { name: "as-needed", value: "as-needed" },
          { name: "never", value: "never" },
        ])
      : "always";
  }

  const messagesRelDir = path.posix
    .relative(cfg.i18nDir, cfg.messagesDir)
    .replace(/\\/g, "/");

  const i18n: I18nConfig = {
    locales,
    defaultLocale,
    localePrefix,
    pathAlias: cfg.pathAlias,
    messagesRelDir,
  };

  const planner = new Planner();

  // i18n infrastructure.
  planner.create(`${cfg.i18nDir}/routing.ts`, routingFile(i18n));
  planner.create(`${cfg.i18nDir}/navigation.ts`, navigationFile());
  planner.create(`${cfg.i18nDir}/request.ts`, requestFile(i18n));
  planner.create(`${cfg.srcDir}/proxy.ts`, proxyFile(i18n));

  // Messages.
  for (const locale of locales) {
    planner.create(`${cfg.messagesDir}/${locale}.json`, messagesFile(locale));
  }

  // Locale switcher sample + barrel.
  planner.create(`${cfg.sharedComponentsDir}/locale-switcher.tsx`, localeSwitcherFile(i18n));
  const barrelPath = `${cfg.sharedComponentsDir}/index.ts`;
  const barrel = addNamedExport(
    readIfExists(barrelPath) ?? "export {};\n",
    "./locale-switcher",
    "LocaleSwitcher",
  );
  if (barrel.added) planner.modify(barrelPath, barrel.source);

  // next.config plugin.
  const nextConfigPath = "next.config.ts";
  const nextConfigSrc = readIfExists(nextConfigPath);
  if (nextConfigSrc) {
    const wrapped = wrapNextConfigWithIntl(nextConfigSrc, `./${cfg.i18nDir}/request.ts`);
    if (wrapped.changed) planner.modify(nextConfigPath, wrapped.source);
  }

  // App Router migration into [locale].
  planner.create(`${cfg.appDir}/[locale]/layout.tsx`, localeLayoutFile(i18n));
  planner.create(`${cfg.appDir}/[locale]/page.tsx`, localeHomePageFile(i18n));
  if (fileExists(`${cfg.appDir}/layout.tsx`)) planner.delete(`${cfg.appDir}/layout.tsx`);
  if (fileExists(`${cfg.appDir}/page.tsx`)) planner.delete(`${cfg.appDir}/page.tsx`);

  // Move any other existing pages under [locale] (never api / special files).
  const pages = await fg([`${cfg.appDir}/**/page.tsx`], {
    cwd: abs("."),
    ignore: ["**/node_modules/**"],
  });
  for (const rel of pages) {
    if (
      rel === `${cfg.appDir}/page.tsx` ||
      rel.startsWith(`${cfg.appDir}/[locale]/`) ||
      rel.startsWith(`${cfg.appDir}/api/`)
    ) {
      continue;
    }
    const dest = rel.replace(`${cfg.appDir}/`, `${cfg.appDir}/[locale]/`);
    if (fileExists(dest)) {
      throw new Error(`Cannot migrate ${rel}: ${dest} already exists.`);
    }
    planner.move(rel, dest);
  }

  const result = await finalize(planner, {
    title: "i18n Generator",
    fields: [
      ["Locales", locales.join(", ")],
      ["Default", defaultLocale],
      ["Prefix", localePrefix],
    ],
    yes: opts.yes,
    dryRun: opts.dryRun,
  });

  if (result === "written" && !opts.skipInstall) {
    logger.log();
    logger.info("Installing next-intl…");
    installDeps(["next-intl"]);
  }

  return result;
}
