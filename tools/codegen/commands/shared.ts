import type { CodegenConfig } from "../config";
import { addNamedExport, addRouteKey, parseRoute } from "../core/ast";
import { isI18nEnabled } from "../core/detect";
import { fileExists, readIfExists } from "../core/filesystem";
import { logger } from "../core/logger";
import { toKebab } from "../core/naming";
import type { Planner } from "../core/planner";
import { pageFile, viewExportStatement, viewFile } from "../templates/page";

/**
 * Resolve the App Router file path for a route, accounting for i18n. With i18n
 * enabled, pages live under `[locale]`. Special segments are preserved as-is.
 *
 *   "/login" (no i18n)  -> src/app/login/page.tsx
 *   "/login" (i18n)     -> src/app/[locale]/login/page.tsx
 *   "/" (i18n)          -> src/app/[locale]/page.tsx
 */
export async function pageFilePath(
  route: string,
  cfg: CodegenConfig,
): Promise<string> {
  const i18n = await isI18nEnabled(cfg);
  const normalized = route.replace(/^\//, "").replace(/\/$/, "");
  const segments = normalized ? normalized.split("/") : [];
  const prefix = i18n ? ["[locale]"] : [];
  return [cfg.appDir, ...prefix, ...segments, "page.tsx"].join("/");
}

export interface AddPageInput {
  planner: Planner;
  cfg: CodegenConfig;
  /** kebab-case feature folder name */
  feature: string;
  /** raw page name */
  page: string;
  route: string;
  pathKey: string;
  /** Current content of the feature root index (in-memory or from disk). */
  currentFeatureIndex: string;
  /** Whether the feature index already exists on disk. */
  featureIndexExists: boolean;
}

export interface AddPageResult {
  /** The feature index content after adding the view export. */
  featureIndex: string;
  routeAdded: boolean;
}

/**
 * Queue the changes for one page: the view, the App Router page, the feature
 * public-API export, and the centralized route entry. Aborts if the target page
 * file already exists (never overwrites a route).
 */
export async function addPageToPlan(input: AddPageInput): Promise<AddPageResult> {
  const { planner, cfg, feature, page, route, pathKey } = input;
  const parsed = parseRoute(route);

  // View file
  const viewPath = `${cfg.featuresDir}/${feature}/view/${toKebab(page)}-view.tsx`;
  if (fileExists(viewPath)) {
    throw new Error(`View already exists: ${viewPath}`);
  }
  planner.create(viewPath, viewFile(page, parsed));

  // App Router page
  const pagePath = await pageFilePath(route, cfg);
  if (fileExists(pagePath)) {
    throw new Error(
      `A page already exists at ${pagePath}. Refusing to overwrite an existing route.`,
    );
  }
  planner.create(
    pagePath,
    pageFile({ feature, page, route: parsed, pathAlias: cfg.pathAlias }),
  );

  // Feature public API export
  const { moduleSpecifier, name } = viewExportStatement(page);
  const nextIndex = addNamedExport(input.currentFeatureIndex, moduleSpecifier, name);
  const indexPath = `${cfg.featuresDir}/${feature}/index.ts`;
  if (input.featureIndexExists) {
    if (nextIndex.added) planner.modify(indexPath, nextIndex.source);
  } else {
    planner.create(indexPath, nextIndex.source);
  }

  // Centralized route
  let routeAdded = false;
  const routesSrc = readIfExists(cfg.routesFile);
  if (!routesSrc) {
    logger.warn(`Routes file not found at ${cfg.routesFile}; skipping route registration.`);
  } else {
    const result = addRouteKey(routesSrc, pathKey, parsed.initializer);
    if (result.added) {
      planner.modify(cfg.routesFile, result.source);
      routeAdded = true;
    } else {
      logger.warn(`Route key "${pathKey}" already exists — leaving it unchanged.`);
    }
  }

  return { featureIndex: nextIndex.source, routeAdded };
}
