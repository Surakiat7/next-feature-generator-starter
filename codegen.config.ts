import type { CodegenConfig } from "./tools/codegen/config";

/**
 * Central configuration for the code generators.
 *
 * All generator commands read their directory locations from here instead of
 * hardcoding paths. Adjust these if the project's folder layout changes.
 */
const config: CodegenConfig = {
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

export default config;
