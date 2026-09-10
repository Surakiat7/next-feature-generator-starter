import { loadConfig } from "../config";
import { dirExists } from "../core/filesystem";
import { logger } from "../core/logger";
import { assertValidName, toCamel, toKebab } from "../core/naming";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { promptConfirm, promptInput } from "../core/prompts";
import { featureRootIndex, subBarrel } from "../templates/feature";
import { addPageToPlan } from "./shared";

export interface FeatureOptions {
  page?: string;
  route?: string;
  pathKey?: string;
  yes?: boolean;
  dryRun?: boolean;
}

const SUBFOLDERS = ["components", "hooks", "lib", "types"] as const;

export async function runFeature(
  nameArg: string | undefined,
  opts: FeatureOptions,
): Promise<FinalizeResult> {
  const cfg = await loadConfig();
  const interactive = Boolean(process.stdout.isTTY) && !opts.yes;

  let name = nameArg;
  if (!name) {
    if (!interactive) throw new Error("Feature name is required.");
    name = await promptInput("Feature name:", { required: true });
  }
  assertValidName(name, "feature name");
  const feature = toKebab(name);

  if (dirExists(`${cfg.featuresDir}/${feature}`)) {
    logger.error(`Feature "${feature}" already exists.`);
    logger.dim("No files changed.");
    return "empty";
  }

  // Decide whether to scaffold an initial page.
  let page = opts.page;
  let createPage = Boolean(page);
  if (!page && interactive) {
    createPage = await promptConfirm("Create initial page?", true);
    if (createPage) {
      page = await promptInput("Page name:", { default: "index", required: true });
    }
  }

  let route = opts.route;
  let pathKey = opts.pathKey;
  if (createPage && page) {
    assertValidName(page, "page name");
    if (!route) {
      const fallback = `/${toKebab(page)}`;
      route = interactive ? await promptInput("Route:", { default: fallback }) : fallback;
    }
    if (!pathKey) {
      const fallback = toCamel(page);
      pathKey = interactive ? await promptInput("Route key:", { default: fallback }) : fallback;
    }
  }

  const planner = new Planner();
  const base = `${cfg.featuresDir}/${feature}`;
  for (const sub of SUBFOLDERS) {
    planner.create(`${base}/${sub}/index.ts`, subBarrel(sub));
  }

  if (createPage && page && route && pathKey) {
    await addPageToPlan({
      planner,
      cfg,
      feature,
      page,
      route,
      pathKey,
      currentFeatureIndex: featureRootIndex(),
      featureIndexExists: false,
    });
  } else {
    planner.create(`${base}/index.ts`, featureRootIndex());
  }

  const fields: [string, string][] = [["Feature", feature]];
  if (createPage && page) {
    fields.push(["Page", toKebab(page)], ["Route", route!], ["Path key", pathKey!]);
  }

  return finalize(planner, {
    title: "Feature Generator",
    fields,
    yes: opts.yes,
    dryRun: opts.dryRun,
  });
}
