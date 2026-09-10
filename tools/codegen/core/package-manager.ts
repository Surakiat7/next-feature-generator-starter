import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { abs } from "../config";
import { logger } from "./logger";

export type PackageManager = "pnpm" | "npm" | "yarn";

/** Detect the package manager from the repository's lockfile. */
export function detectPackageManager(): PackageManager {
  if (existsSync(abs("pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(abs("yarn.lock"))) return "yarn";
  return "npm";
}

/** How the user runs the `gen` script, e.g. `pnpm gen` or `npm run gen --`. */
export function genInvocation(pm: PackageManager = detectPackageManager()): string {
  return pm === "npm" ? "npm run gen --" : `${pm} gen`;
}

function installArgs(pm: PackageManager, deps: string[], dev: boolean): string[] {
  switch (pm) {
    case "pnpm":
      return ["add", ...(dev ? ["-D"] : []), ...deps];
    case "yarn":
      return ["add", ...(dev ? ["-D"] : []), ...deps];
    case "npm":
      return ["install", ...(dev ? ["--save-dev"] : ["--save"]), ...deps];
  }
}

/**
 * Install runtime/dev dependencies with the detected package manager.
 * Returns the command string that was run (or would be run in dry mode).
 */
export function installDeps(
  deps: string[],
  opts: { dev?: boolean; dryRun?: boolean } = {},
): string {
  const pm = detectPackageManager();
  const args = installArgs(pm, deps, opts.dev ?? false);
  const cmd = `${pm} ${args.join(" ")}`;
  if (opts.dryRun) return cmd;
  logger.dim(`  running: ${cmd}`);
  execFileSync(pm, args, { cwd: abs("."), stdio: "inherit", shell: true });
  return cmd;
}

function removeArgs(pm: PackageManager, deps: string[]): string[] {
  return pm === "npm" ? ["uninstall", ...deps] : ["remove", ...deps];
}

/** Uninstall dependencies with the detected package manager. */
export function uninstallDeps(
  deps: string[],
  opts: { dryRun?: boolean } = {},
): string {
  const pm = detectPackageManager();
  const args = removeArgs(pm, deps);
  const cmd = `${pm} ${args.join(" ")}`;
  if (opts.dryRun) return cmd;
  logger.dim(`  running: ${cmd}`);
  execFileSync(pm, args, { cwd: abs("."), stdio: "inherit", shell: true });
  return cmd;
}
