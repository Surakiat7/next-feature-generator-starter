#!/usr/bin/env node
import { Command } from "commander";
import { runComponent } from "./commands/component";
import { runDoctor } from "./commands/doctor";
import { runFeature } from "./commands/feature";
import { runI18nInit } from "./commands/i18n-init";
import { runI18nRemove } from "./commands/i18n-remove";
import { runPage } from "./commands/page";
import { runRoutesCheck } from "./commands/routes-check";
import { runThemeInit } from "./commands/theme-init";
import { runThemeRemove } from "./commands/theme-remove";
import { logger } from "./core/logger";

/** Run a command action, mapping thrown errors and non-zero results to exit 1. */
async function guard(promise: Promise<number | string | void>): Promise<void> {
  try {
    const result = await promise;
    if (typeof result === "number" && result > 0) process.exitCode = 1;
  } catch (err) {
    logger.log();
    logger.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

const program = new Command();
program
  .name("gen")
  .description("Next.js feature-based architecture generator")
  .version("1.0.0");

program
  .command("feature")
  .argument("[name]", "feature name (kebab-case)")
  .description("Generate a feature module, optionally with an initial page")
  .option("--page <page>", "also create an initial page")
  .option("--route <route>", "route for the initial page, e.g. /login")
  .option("--path-key <key>", "centralized route key, e.g. login")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((name, opts) => guard(runFeature(name, opts)));

program
  .command("page")
  .argument("[name]", "page name (kebab-case)")
  .description("Add a page to an existing feature")
  .requiredOption("--feature <feature>", "owning feature")
  .option("--route <route>", "route, e.g. /forgot-password or /projects/[projectId]")
  .option("--path-key <key>", "centralized route key, e.g. forgotPassword")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((name, opts) => guard(runPage(name, opts)));

program
  .command("component")
  .argument("[name]", "component name (kebab-case)")
  .description("Generate a feature-owned or shared component")
  .option("--feature <feature>", "place the component in this feature")
  .option("--shared", "place the component in shared components")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((name, opts) => guard(runComponent(name, opts)));

const i18n = program.command("i18n").description("Internationalization (next-intl)");
i18n
  .command("init")
  .description("Set up i18n and migrate pages under [locale]")
  .option("--locales <list>", "comma-separated locales, e.g. th,en")
  .option("--default-locale <locale>", "default locale, e.g. th")
  .option("--locale-prefix <mode>", "always | as-needed | never")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((opts) => guard(runI18nInit(opts)));
i18n
  .command("remove")
  .description("Remove i18n (destructive; confirmation defaults to no)")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((opts) => guard(runI18nRemove(opts)));

const theme = program.command("theme").description("Dark/light theme (next-themes)");
theme
  .command("init")
  .description("Set up light/dark/system theme support")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((opts) => guard(runThemeInit(opts)));
theme
  .command("remove")
  .description("Remove the theme system (destructive; confirmation defaults to no)")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--dry-run", "print the plan without writing files")
  .action((opts) => guard(runThemeRemove(opts)));

program
  .command("routes")
  .description("Route registry utilities")
  .command("check")
  .description("Detect hardcoded internal navigation paths")
  .action(() => guard(runRoutesCheck()));

program
  .command("doctor")
  .description("Inspect the project architecture")
  .action(() => guard(runDoctor()));

program.parseAsync(process.argv);
