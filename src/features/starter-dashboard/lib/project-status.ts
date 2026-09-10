import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * REAL project status, detected from the source tree at request/build time.
 * Server-only (uses node:fs). This reflects the actual repository — it is NOT
 * the simulated demo state.
 */

const ROOT = process.cwd();
const DASHBOARD_FEATURE = "starter-dashboard";

export interface FeatureInfo {
  name: string;
  pages: string[];
}

export interface RouteInfo {
  key: string;
  path: string;
  dynamic: boolean;
}

export interface ProjectStatus {
  features: FeatureInfo[];
  appRoutes: RouteInfo[];
  toolingRoutes: RouteInfo[];
  i18nEnabled: boolean;
  themeEnabled: boolean;
  healthy: boolean;
}

function safeReadDir(rel: string): string[] {
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((name) => {
    if (name.startsWith(".")) return false;
    return statSync(path.join(abs, name)).isDirectory();
  });
}

function readFeatures(): FeatureInfo[] {
  return safeReadDir("src/features")
    .filter((name) => name !== DASHBOARD_FEATURE)
    .map((name) => {
      const viewDir = path.join(ROOT, "src/features", name, "view");
      const pages = existsSync(viewDir)
        ? readdirSync(viewDir)
            .filter((f) => f.endsWith("-view.tsx"))
            .map((f) => f.replace(/-view\.tsx$/, ""))
        : [];
      return { name, pages };
    });
}

const TOOLING_KEYS = new Set(["starterDashboard"]);

function readRoutes(): { app: RouteInfo[]; tooling: RouteInfo[] } {
  const file = path.join(ROOT, "src/routes/paths.ts");
  const app: RouteInfo[] = [];
  const tooling: RouteInfo[] = [];
  if (!existsSync(file)) return { app, tooling };

  const source = readFileSync(file, "utf8");
  // Tolerant scan: `key: "..."` (static) or `key: (...) => ...` (dynamic).
  const re = /(\w+):\s*(?:"([^"]*)"|\([^)]*\)\s*=>\s*`([^`]*)`)/g;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((match = re.exec(source)) !== null) {
    const key = match[1];
    if (["root"].includes(key) && seen.has(key)) continue;
    const dynamic = match[2] === undefined;
    const value = match[2] ?? match[3] ?? "";
    const info: RouteInfo = { key, path: value, dynamic };
    seen.add(key);
    (TOOLING_KEYS.has(key) ? tooling : app).push(info);
  }
  return { app, tooling };
}

export function getProjectStatus(): ProjectStatus {
  const features = readFeatures();
  const { app, tooling } = readRoutes();
  const i18nEnabled = existsSync(path.join(ROOT, "src/i18n/request.ts"));
  const themeEnabled = existsSync(path.join(ROOT, "src/providers/theme-provider.tsx"));

  return {
    features,
    appRoutes: app,
    toolingRoutes: tooling,
    i18nEnabled,
    themeEnabled,
    // A clean, generated starter is always "healthy": routes registry present.
    healthy: app.length > 0 || tooling.length > 0,
  };
}
