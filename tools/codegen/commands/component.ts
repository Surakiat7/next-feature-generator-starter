import { loadConfig } from "../config";
import { addNamedExport } from "../core/ast";
import { dirExists, fileExists, readIfExists } from "../core/filesystem";
import { logger } from "../core/logger";
import {
  assertValidName,
  componentFileName,
  componentName,
  toKebab,
} from "../core/naming";
import { Planner, finalize, type FinalizeResult } from "../core/planner";
import { promptInput, promptSelect } from "../core/prompts";
import { componentFile } from "../templates/component";

export interface ComponentOptions {
  feature?: string;
  shared?: boolean;
  yes?: boolean;
  dryRun?: boolean;
}

export async function runComponent(
  nameArg: string | undefined,
  opts: ComponentOptions,
): Promise<FinalizeResult> {
  const cfg = await loadConfig();
  const interactive = Boolean(process.stdout.isTTY) && !opts.yes;

  let name = nameArg;
  if (!name) {
    if (!interactive) throw new Error("Component name is required.");
    name = await promptInput("Component name:", { required: true });
  }
  assertValidName(name, "component name");

  // Resolve destination.
  let location: "feature" | "shared";
  if (opts.shared) location = "shared";
  else if (opts.feature) location = "feature";
  else if (interactive) {
    location = await promptSelect("Where should this component live?", [
      { name: "Feature", value: "feature" },
      { name: "Shared", value: "shared" },
    ]);
  } else {
    throw new Error("Specify --feature <name> or --shared.");
  }

  let feature = opts.feature ? toKebab(opts.feature) : undefined;
  if (location === "feature" && !feature) {
    if (!interactive) throw new Error("--feature <name> is required.");
    feature = toKebab(await promptInput("Feature:", { required: true }));
  }

  const fileName = componentFileName(name);
  const comp = componentName(name);

  let componentDir: string;
  let barrelPath: string;
  if (location === "feature") {
    if (!dirExists(`${cfg.featuresDir}/${feature}`)) {
      logger.error(`Feature "${feature}" does not exist.`);
      logger.dim(`Create it first, e.g. gen feature ${feature}`);
      return "empty";
    }
    componentDir = `${cfg.featuresDir}/${feature}/components`;
    barrelPath = `${componentDir}/index.ts`;
  } else {
    componentDir = cfg.sharedComponentsDir;
    barrelPath = `${componentDir}/index.ts`;
  }

  const componentPath = `${componentDir}/${fileName}`;
  if (fileExists(componentPath)) {
    logger.error(`Component already exists: ${componentPath}`);
    logger.dim("No files changed.");
    return "empty";
  }

  const planner = new Planner();
  planner.create(componentPath, componentFile(name));

  // Update the components barrel.
  const barrelExists = fileExists(barrelPath);
  const currentBarrel = readIfExists(barrelPath) ?? "export {};\n";
  const nextBarrel = addNamedExport(currentBarrel, `./${toKebab(name)}`, comp);
  if (barrelExists) {
    if (nextBarrel.added) planner.modify(barrelPath, nextBarrel.source);
  } else {
    planner.create(barrelPath, nextBarrel.source);
  }

  return finalize(planner, {
    title: "Component Generator",
    fields: [
      ["Component", comp],
      ["Location", location === "feature" ? `feature: ${feature}` : "shared"],
    ],
    yes: opts.yes,
    dryRun: opts.dryRun,
  });
}
