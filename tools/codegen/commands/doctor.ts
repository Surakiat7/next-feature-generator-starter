import { loadConfig } from "../config";
import { collectStaticRoutes } from "../core/ast";
import {
  getDefaultLocale,
  getLocales,
  hasDependency,
  isI18nEnabled,
  isThemeEnabled,
} from "../core/detect";
import { dirExists, fileExists, readIfExists } from "../core/filesystem";
import { color, logger } from "../core/logger";
import { findHardcodedRoutes } from "./routes-check";

interface Check {
  ok: boolean;
  label: string;
  level: "error" | "warn";
  detail?: string;
}

export async function runDoctor(): Promise<number> {
  const cfg = await loadConfig();
  const checks: Check[] = [];

  const pass = (label: string, ok: boolean, level: "error" | "warn" = "error", detail?: string) =>
    checks.push({ ok, label, level, detail });

  pass("Next.js detected", hasDependency("next"));
  pass("App Router detected", dirExists(cfg.appDir));
  pass("TypeScript configured", fileExists("tsconfig.json"));
  pass("Feature root exists", dirExists(cfg.featuresDir), "warn");

  const routesSrc = readIfExists(cfg.routesFile);
  pass("Centralized route registry exists", Boolean(routesSrc));

  if (routesSrc) {
    const routes = collectStaticRoutes(routesSrc);
    const seen = new Set<string>();
    const dupes = routes.filter((r) => (seen.has(r) ? true : (seen.add(r), false)));
    pass(
      "No duplicated static routes",
      dupes.length === 0,
      "warn",
      dupes.length ? `duplicates: ${[...new Set(dupes)].join(", ")}` : undefined,
    );
  }

  const findings = await findHardcodedRoutes();
  pass(
    "No obvious hardcoded internal navigation",
    findings.length === 0,
    "warn",
    findings.length ? `${findings.length} occurrence(s) — run gen routes check` : undefined,
  );

  // Render.
  logger.heading("Next Starter Doctor");
  logger.log();
  for (const c of checks) {
    const icon = c.ok ? color.green("✓") : c.level === "error" ? color.red("✗") : color.yellow("!");
    logger.log(`${icon} ${c.label}${c.detail ? color.dim(`  (${c.detail})`) : ""}`);
  }

  // i18n
  const i18n = await isI18nEnabled(cfg);
  logger.log();
  logger.info(color.bold("i18n:"));
  if (i18n) {
    const locales = await getLocales(cfg);
    const def = await getDefaultLocale(cfg);
    logger.log(`${color.green("✓")} enabled`);
    if (locales.length) logger.log(color.dim(`  locales: ${locales.join(", ")}`));
    if (def) logger.log(color.dim(`  default: ${def}`));
  } else {
    logger.log(`${color.green("✓")} disabled`);
  }

  // Theme
  const theme = await isThemeEnabled(cfg);
  logger.log();
  logger.info(color.bold("Theme:"));
  if (theme) {
    logger.log(`${color.green("✓")} enabled`);
    logger.log(color.dim("  light / dark / system"));
  } else {
    logger.log(`${color.green("✓")} disabled`);
  }

  const errors = checks.filter((c) => !c.ok && c.level === "error").length;
  const warnings = checks.filter((c) => !c.ok && c.level === "warn").length;
  logger.log();
  logger.log(`${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`);

  return errors;
}
