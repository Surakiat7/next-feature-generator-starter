import { loadConfig } from "../config";
import { dirExists } from "../core/filesystem";
import { logger } from "../core/logger";
import {
  assertValidName,
  contentFileName,
  constantsFileName,
  stateHookFileName,
  toCamel,
  toKebab,
  typesFileName,
} from "../core/naming";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { promptInput } from "../core/prompts";
import {
  componentsBarrel,
  constantsFile,
  contentComponentFile,
  featureRootIndex,
  hooksBarrel,
  libBarrel,
  stateHookFile,
  typesBarrel,
  typesFile,
  viewFile as featureViewFile,
} from "../templates/feature";
import { addPageToPlan } from "./shared";

export interface FeatureOptions {
  page?: string;
  route?: string;
  pathKey?: string;
  yes?: boolean;
  dryRun?: boolean;
}

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

  // Generic sample architecture files.
  planner.create(`${base}/types/${typesFileName(feature)}`, typesFile(feature));
  planner.create(`${base}/lib/${constantsFileName(feature)}`, constantsFile(feature));
  planner.create(`${base}/hooks/${stateHookFileName(feature)}`, stateHookFile(feature));
  planner.create(`${base}/components/${contentFileName(feature)}`, contentComponentFile(feature));

  // Focused barrel exports.
  planner.create(`${base}/types/index.ts`, typesBarrel(feature));
  planner.create(`${base}/lib/index.ts`, libBarrel(feature));
  planner.create(`${base}/hooks/index.ts`, hooksBarrel(feature));
  planner.create(`${base}/components/index.ts`, componentsBarrel(feature));

  await addPageToPlan({
    planner,
    cfg,
    feature,
    page,
    route,
    pathKey,
    viewSource: featureViewFile(feature, page),
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
