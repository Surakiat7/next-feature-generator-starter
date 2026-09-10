/**
 * Static preview of what each generator command sets up, used by the interactive
 * Command Explorer to show the resulting project folder structure. Illustrative
 * (uses example names) — the real generator is deterministic and idempotent.
 */

export type SetupKind = "i18n" | "theme";

export interface CommandPreview {
  id: string;
  label: string;
  command: string;
  description: string;
  /** Files/folders the command creates (folders end with "/"). */
  creates: string[];
  /** Existing files the command edits. */
  modifies: string[];
  /** Shown for validation commands that create nothing. */
  note?: string;
  /** Marks a one-time setup so the UI can show its configured state. */
  setup?: SetupKind;
  /** Marks the command whose badge shows the generated feature count. */
  countsFeatures?: boolean;
  /**
   * Syntax tokens for display: `param` tokens are highlighted as the parts a user
   * should replace. Concatenating all `text` values must equal `command`.
   */
  template?: { text: string; param?: boolean }[];
  example?: { text: string; param?: boolean }[];
}

/** Baseline structure shown as "existing" context in every preview. */
export const BASE_STRUCTURE = ["src/app/", "src/features/", "src/routes/paths.ts"];

export const COMMAND_PREVIEWS: CommandPreview[] = [
  {
    id: "feature",
    label: "Feature",
    command: "pnpm gen feature product",
    description: "Create a feature module with a generic sample architecture, an initial page, and a centralized route.",
    countsFeatures: true,
    creates: [
      "src/features/product/components/product-content.tsx",
      "src/features/product/components/index.ts",
      "src/features/product/hooks/use-product-state.ts",
      "src/features/product/hooks/index.ts",
      "src/features/product/lib/product.constants.ts",
      "src/features/product/lib/index.ts",
      "src/features/product/types/product.types.ts",
      "src/features/product/types/index.ts",
      "src/features/product/view/product-view.tsx",
      "src/features/product/index.ts",
      "src/app/product/page.tsx",
    ],
    modifies: ["src/routes/paths.ts"],
    template: [
      { text: "pnpm gen feature " },
      { text: "<feature>", param: true },
    ],
    example: [
      { text: "pnpm gen feature " },
      { text: "product", param: true },
    ],
  },
  {
    id: "page",
    label: "Page",
    command: "pnpm gen page forgot-password --feature auth",
    description: "Add a page (incl. dynamic [param] routes) to an existing feature.",
    creates: [
      "src/features/auth/view/forgot-password-view.tsx",
      "src/app/forgot-password/page.tsx",
    ],
    modifies: ["src/features/auth/index.ts", "src/routes/paths.ts"],
    template: [
      { text: "pnpm gen page " },
      { text: "<page>", param: true },
      { text: " --feature " },
      { text: "<feature>", param: true },
    ],
    example: [
      { text: "pnpm gen page " },
      { text: "forgot-password", param: true },
      { text: " --feature " },
      { text: "auth", param: true },
    ],
  },
  {
    id: "component",
    label: "Component",
    command: "pnpm gen component login-form --feature auth",
    description: "Create a feature-owned component (use --shared for shared UI).",
    creates: ["src/features/auth/components/login-form.tsx"],
    modifies: ["src/features/auth/components/index.ts"],
    template: [
      { text: "pnpm gen component " },
      { text: "<component>", param: true },
      { text: " --feature " },
      { text: "<feature>", param: true },
    ],
    example: [
      { text: "pnpm gen component " },
      { text: "login-form", param: true },
      { text: " --feature " },
      { text: "auth", param: true },
    ],
  },
  {
    id: "i18n",
    label: "i18n",
    command: "pnpm gen i18n init --locales th,en --default-locale th",
    description: "Set up next-intl and migrate pages under [locale].",
    setup: "i18n",
    creates: [
      "src/i18n/routing.ts",
      "src/i18n/navigation.ts",
      "src/i18n/request.ts",
      "src/proxy.ts",
      "src/app/[locale]/layout.tsx",
      "src/app/[locale]/page.tsx",
      "src/components/locale-switcher.tsx",
      "locales/th.json",
      "locales/en.json",
    ],
    modifies: ["next.config.ts", "src/components/index.ts"],
    template: [
      { text: "pnpm gen i18n init --locales " },
      { text: "<locales>", param: true },
      { text: " --default-locale " },
      { text: "<locale>", param: true },
    ],
    example: [
      { text: "pnpm gen i18n init --locales " },
      { text: "th,en", param: true },
      { text: " --default-locale " },
      { text: "th", param: true },
    ],
  },
  {
    id: "theme",
    label: "Theme",
    command: "pnpm gen theme init",
    description: "Set up next-themes light / dark / system theming.",
    setup: "theme",
    creates: [
      "src/providers/theme-provider.tsx",
      "src/components/theme-toggle.tsx",
    ],
    modifies: [
      "src/app/layout.tsx",
      "src/app/globals.css",
      "src/providers/index.ts",
      "src/components/index.ts",
    ],
    example: [{ text: "pnpm gen theme init" }],
  },
  {
    id: "routes-check",
    label: "Routes check",
    command: "pnpm gen routes check",
    description: "Detect hardcoded internal navigation paths (AST-based).",
    creates: [],
    modifies: [],
    note: "Read-only. Scans the source tree and reports findings — no files change.",
    example: [{ text: "pnpm gen routes check" }],
  },
  {
    id: "doctor",
    label: "Doctor",
    command: "pnpm gen doctor",
    description: "Inspect the architecture and integration status.",
    creates: [],
    modifies: [],
    note: "Read-only. Prints an architecture report — no files change.",
    example: [{ text: "pnpm gen doctor" }],
  },
];
