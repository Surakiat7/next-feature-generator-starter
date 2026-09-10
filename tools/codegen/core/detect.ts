import { readdirSync } from "node:fs";
import { abs, loadConfig, type CodegenConfig } from "../config";
import { dirExists, fileExists, readIfExists } from "./filesystem";

/** True if a package name appears in dependencies or devDependencies. */
export function hasDependency(name: string): boolean {
  const pkgRaw = readIfExists("package.json");
  if (!pkgRaw) return false;
  const pkg = JSON.parse(pkgRaw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
}

/**
 * i18n is considered enabled when the next-intl request config exists. We infer
 * from the source tree (authoritative) rather than a state file.
 */
export async function isI18nEnabled(config?: CodegenConfig): Promise<boolean> {
  const cfg = config ?? (await loadConfig());
  return fileExists(`${cfg.i18nDir}/request.ts`) || hasDependency("next-intl");
}

/** Theme is enabled when next-themes is installed and a provider exists. */
export async function isThemeEnabled(config?: CodegenConfig): Promise<boolean> {
  const cfg = config ?? (await loadConfig());
  return (
    hasDependency("next-themes") &&
    fileExists(`${cfg.providersDir}/theme-provider.tsx`)
  );
}

/** Parse the configured locales from `i18n/routing.ts`, else from messages. */
export async function getLocales(config?: CodegenConfig): Promise<string[]> {
  const cfg = config ?? (await loadConfig());
  const routing = readIfExists(`${cfg.i18nDir}/routing.ts`);
  if (routing) {
    const match = routing.match(/locales:\s*\[([^\]]*)\]/);
    if (match) {
      return match[1]
        .split(",")
        .map((s) => s.replace(/["'\s]/g, ""))
        .filter(Boolean);
    }
  }
  if (dirExists(cfg.messagesDir)) {
    return readdirSync(abs(cfg.messagesDir))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  }
  return [];
}

/** Parse the default locale from `i18n/routing.ts`. */
export async function getDefaultLocale(config?: CodegenConfig): Promise<string | null> {
  const cfg = config ?? (await loadConfig());
  const routing = readIfExists(`${cfg.i18nDir}/routing.ts`);
  const match = routing?.match(/defaultLocale:\s*["']([^"']+)["']/);
  return match ? match[1] : null;
}
