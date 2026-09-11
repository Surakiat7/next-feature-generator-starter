/**
 * REAL project status, derived from the source tree at build time.
 *
 * Uses Turbopack's `import.meta.glob` (Vite-compatible) instead of `node:fs`,
 * so the file list is baked into the bundle when the app is compiled. This is
 * why it reflects the actual repository in BOTH dev (with HMR when files are
 * added/removed) and production — unlike a runtime `readdirSync(process.cwd())`
 * scan, which would see nothing because Next.js does not deploy the `src/` tree.
 *
 * This is NOT the simulated demo state.
 */

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

// Every feature view, keyed by path. Lazy (thunks) — we only read the keys to
// enumerate features/pages, so the modules are never actually loaded.
const featureViews = import.meta.glob([
  "../../*/view/*-view.tsx",
  "!../../starter-dashboard/**",
]);

// Raw source of the centralized route registry, captured at build time.
const pathsSource = import.meta.glob("../../../routes/paths.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Presence probes for optional subsystems. Empty object ⇒ file absent.
const i18nProbe = import.meta.glob("../../../i18n/request.ts");
const themeProbe = import.meta.glob("../../../providers/theme-provider.tsx");

function readFeatures(): FeatureInfo[] {
  const byFeature = new Map<string, string[]>();
  for (const key of Object.keys(featureViews)) {
    // Keys look like "../../product/view/product-view.tsx".
    const match = key.match(/([^/]+)\/view\/(.+)-view\.tsx$/);
    if (!match) continue;
    const [, name, page] = match;
    if (name === DASHBOARD_FEATURE) continue;
    const pages = byFeature.get(name) ?? [];
    pages.push(page);
    byFeature.set(name, pages);
  }
  return [...byFeature.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, pages]) => ({ name, pages: pages.sort() }));
}

const TOOLING_KEYS = new Set(["starterDashboard"]);

function readRoutes(): { app: RouteInfo[]; tooling: RouteInfo[] } {
  const app: RouteInfo[] = [];
  const tooling: RouteInfo[] = [];
  const source = Object.values(pathsSource)[0];
  if (!source) return { app, tooling };

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
  const i18nEnabled = Object.keys(i18nProbe).length > 0;
  const themeEnabled = Object.keys(themeProbe).length > 0;

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
