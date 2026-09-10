import type { DemoScenario } from "../types/generator-demo.types";

/**
 * Scripted, SIMULATED generator runs. These drive the terminal + file-tree
 * animation only; they never invoke the real generator or touch the filesystem.
 */

const BASE_TREE = [
  "src/app/",
  "src/features/",
  "src/routes/paths.ts",
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "feature",
    label: "Generate a feature",
    command: "pnpm gen feature auth --page login --route /login",
    initialTree: BASE_TREE,
    initialMetrics: { features: 0, appRoutes: 1 },
    steps: [
      {
        terminal: { text: "pnpm gen feature auth --page login --route /login", kind: "run" },
      },
      {
        terminal: { text: "Created feature auth", kind: "ok" },
        addPaths: ["src/features/auth/"],
        metrics: { features: 1 },
      },
      {
        terminal: { text: "Created components / hooks / lib / types", kind: "ok" },
        addPaths: [
          "src/features/auth/components/index.ts",
          "src/features/auth/hooks/index.ts",
          "src/features/auth/lib/index.ts",
          "src/features/auth/types/index.ts",
        ],
      },
      {
        terminal: { text: "Created login-view.tsx", kind: "ok" },
        addPaths: ["src/features/auth/view/login-view.tsx"],
      },
      {
        terminal: { text: "Created app/login/page.tsx", kind: "ok" },
        addPaths: ["src/app/login/page.tsx"],
      },
      {
        terminal: { text: "Registered paths.login", kind: "ok" },
        highlightPath: "src/routes/paths.ts",
        metrics: { appRoutes: 2 },
      },
      {
        terminal: { text: "Done — 8 change(s) applied.", kind: "info" },
      },
    ],
  },
  {
    id: "i18n",
    label: "Initialize i18n",
    command: "pnpm gen i18n init --locales th,en --default-locale th",
    initialTree: BASE_TREE,
    initialMetrics: { features: 0, appRoutes: 1 },
    steps: [
      {
        terminal: { text: "pnpm gen i18n init --locales th,en --default-locale th", kind: "run" },
      },
      {
        terminal: { text: "Created src/i18n/{routing,navigation,request}.ts", kind: "ok" },
        addPaths: [
          "src/i18n/routing.ts",
          "src/i18n/navigation.ts",
          "src/i18n/request.ts",
        ],
      },
      {
        terminal: { text: "Created src/proxy.ts", kind: "ok" },
        addPaths: ["src/proxy.ts"],
      },
      {
        terminal: { text: "Created locales/{th,en}.json", kind: "ok" },
        addPaths: ["locales/th.json", "locales/en.json"],
      },
      {
        terminal: { text: "Migrated pages under src/app/[locale]/", kind: "ok" },
        addPaths: ["src/app/[locale]/layout.tsx", "src/app/[locale]/page.tsx"],
      },
      {
        terminal: { text: "Installing next-intl…", kind: "info" },
      },
    ],
  },
  {
    id: "theme",
    label: "Initialize theme",
    command: "pnpm gen theme init",
    initialTree: BASE_TREE,
    initialMetrics: { features: 0, appRoutes: 1 },
    steps: [
      { terminal: { text: "pnpm gen theme init", kind: "run" } },
      {
        terminal: { text: "Created theme-provider.tsx", kind: "ok" },
        addPaths: ["src/providers/theme-provider.tsx"],
      },
      {
        terminal: { text: "Created theme-toggle.tsx", kind: "ok" },
        addPaths: ["src/components/theme-toggle.tsx"],
      },
      {
        terminal: { text: "Integrated ThemeProvider into layout", kind: "ok" },
        highlightPath: "src/app/layout.tsx",
        addPaths: ["src/app/layout.tsx"],
      },
      { terminal: { text: "Installing next-themes…", kind: "info" } },
    ],
  },
];
