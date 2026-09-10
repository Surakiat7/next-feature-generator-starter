import path from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

/**
 * Shape of `codegen.config.ts` at the repository root. All paths are relative
 * to the repository root and use POSIX separators.
 */
export interface CodegenConfig {
  srcDir: string;
  appDir: string;
  featuresDir: string;
  routesFile: string;
  sharedComponentsDir: string;
  providersDir: string;
  hooksDir: string;
  libDir: string;
  i18nDir: string;
  messagesDir: string;
  styleDir: string;
  globalsCss: string;
  rootLayout: string;
  /** Import path alias for `srcDir`, e.g. "@" for `@/features/...`. */
  pathAlias: string;
}

const DEFAULT_CONFIG: CodegenConfig = {
  srcDir: "src",
  appDir: "src/app",
  featuresDir: "src/features",
  routesFile: "src/routes/paths.ts",
  sharedComponentsDir: "src/components",
  providersDir: "src/providers",
  hooksDir: "src/hooks",
  libDir: "src/lib",
  i18nDir: "src/i18n",
  messagesDir: "locales",
  styleDir: "src/style",
  globalsCss: "src/app/globals.css",
  rootLayout: "src/app/layout.tsx",
  pathAlias: "@",
};

/** Absolute path to the repository root (the folder holding package.json). */
export function repoRoot(): string {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, "package.json"))) {
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
  return dir;
}

let cached: CodegenConfig | null = null;

/**
 * Load `codegen.config.ts` from the repo root, falling back to sane defaults
 * when it is missing. The result is cached for the process lifetime.
 */
export async function loadConfig(): Promise<CodegenConfig> {
  if (cached) return cached;
  const configPath = path.join(repoRoot(), "codegen.config.ts");
  if (!existsSync(configPath)) {
    cached = DEFAULT_CONFIG;
    return cached;
  }
  const mod = await import(pathToFileURL(configPath).href);
  const merged: CodegenConfig = { ...DEFAULT_CONFIG, ...(mod.default ?? mod.config ?? {}) };
  cached = merged;
  return merged;
}

/** Resolve a repo-relative path to an absolute one. */
export function abs(relativePath: string): string {
  return path.join(repoRoot(), relativePath);
}
