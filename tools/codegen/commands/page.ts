import { loadConfig } from "../config";
import { dirExists, fileExists, readIfExists } from "../core/filesystem";
import { logger } from "../core/logger";
import { assertValidName, toCamel, toKebab } from "../core/naming";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { promptInput } from "../core/prompts";
import { featureRootIndex } from "../templates/feature";
import { addPageToPlan } from "./shared";

export interface PageOptions {
  feature?: string;
  route?: string;
  pathKey?: string;
  yes?: boolean;
  dryRun?: boolean;
}

export async function runPage(
  nameArg: string | undefined,
  opts: PageOptions,
): Promise<FinalizeResult> {
  const cfg = await loadConfig();
  const interactive = Boolean(process.stdout.isTTY) && !opts.yes;

  let name = nameArg;
  if (!name) {
    if (!interactive) throw new Error("Page name is required.");
    name = await promptInput("Page name:", { required: true });
  }
  assertValidName(name, "page name");

  let featureName = opts.feature;
  if (!featureName) {
    if (!interactive) throw new Error("--feature is required.");
    featureName = await promptInput("Feature:", { required: true });
  }
  const feature = toKebab(featureName);

  if (!dirExists(`${cfg.featuresDir}/${feature}`)) {
    logger.error(`Feature "${feature}" does not exist.`);
    logger.dim(`Create it first, e.g. gen feature ${feature}`);
    return "empty";
  }

  const route = opts.route ?? `/${toKebab(name)}`;
  const pathKey = opts.pathKey ?? toCamel(name);

  const indexPath = `${cfg.featuresDir}/${feature}/index.ts`;
  const featureIndexExists = fileExists(indexPath);
  const currentFeatureIndex = readIfExists(indexPath) ?? featureRootIndex();

  const planner = new Planner();
  await addPageToPlan({
    planner,
    cfg,
    feature,
    page: name,
    route,
    pathKey,
    currentFeatureIndex,
    featureIndexExists,
  });

  return finalize(planner, {
    title: "Page Generator",
    fields: [
      ["Feature", feature],
      ["Page", toKebab(name)],
      ["Route", route],
      ["Path key", pathKey],
    ],
    yes: opts.yes,
    dryRun: opts.dryRun,
    emptyMessage: "Page already present. No files changed.",
  });
}
