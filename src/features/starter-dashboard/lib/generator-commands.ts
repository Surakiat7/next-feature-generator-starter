/** Static catalog of generator commands shown in the dashboard. */

export interface GenCommand {
  command: string;
  description: string;
}

export const SCAFFOLDING_COMMANDS: GenCommand[] = [
  {
    command: "pnpm gen feature <name> --page <page> --route /<path>",
    description: "Feature module: folders, view, thin page, public export, and a centralized route.",
  },
  {
    command: "pnpm gen page <name> --feature <feature> --route /<path>",
    description: "Add a page (supports dynamic [param] routes) to an existing feature.",
  },
  {
    command: "pnpm gen component <name> --feature <feature>",
    description: "Feature-owned component. Use --shared for genuinely shared UI.",
  },
];

export const VALIDATE_COMMANDS: GenCommand[] = [
  {
    command: "pnpm gen routes check",
    description: "Detect hardcoded internal navigation paths (AST-based).",
  },
  {
    command: "pnpm gen doctor",
    description: "Inspect the architecture and integration status.",
  },
];

export interface SetupCommand {
  name: string;
  library: string;
  /** Command to run when the integration is NOT yet configured. */
  initCommand: string;
  /** Command to run to undo it. */
  removeCommand: string;
}

export const SETUP_COMMANDS: SetupCommand[] = [
  {
    name: "Internationalization",
    library: "next-intl",
    initCommand: "pnpm gen i18n init --locales th,en --default-locale th",
    removeCommand: "pnpm gen i18n remove",
  },
  {
    name: "Theme (dark / light / system)",
    library: "next-themes",
    initCommand: "pnpm gen theme init",
    removeCommand: "pnpm gen theme remove",
  },
];
