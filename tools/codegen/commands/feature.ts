import { loadConfig } from "../config";
import { dirExists } from "../core/filesystem";
import { logger } from "../core/logger";
import { assertValidName, toCamel, toKebab } from "../core/naming";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { promptInput } from "../core/prompts";
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

  // Convention-over-configuration: infer page, route, and path key from the feature name.
  const page = opts.page ?? feature;
  assertValidName(page, "page name");
  const route = opts.route ?? `/${page}`;
  const pathKey = opts.pathKey ?? toCamel(page);

  const planner = new Planner();
  const base = `${cfg.featuresDir}/${feature}`;
  for (const sub of SUBFOLDERS) {
    planner.create(`${base}/${sub}/index.ts`, subBarrel(sub));
  }

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

  const fields: [string, string][] = [
    ["Feature", feature],
    ["Page", toKebab(page)],
    ["Route", route],
    ["Path key", pathKey],
  ];

  return finalize(planner, {
    title: "Feature Generator",
    fields,
    yes: opts.yes,
    dryRun: opts.dryRun,
  });
}
