import { paths } from "@/routes";
import type { ProjectStatus } from "./project-status";

export interface StepStatus {
  text: string;
  tone: "ready" | "recommended" | "completed" | "optional" | "not-configured";
}

export interface OptionalItem {
  id: string;
  name: string;
  description: string;
  command: string;
  status: StepStatus;
}

export interface OnboardingStep {
  id: string;
  number: number;
  title: string;
  description: string;
  commands?: string[];
  urls?: { label: string; href: string }[];
  status?: StepStatus;
  items?: OptionalItem[];
}

export function getSteps(status: ProjectStatus): OnboardingStep[] {
  return [
    {
      id: "clone",
      number: 1,
      title: "Clone repository",
      description: "Get the starter onto your machine.",
      commands: [
        "git clone https://github.com/Surakiat7/next-feature-generator-starter.git",
        "cd next-feature-generator-starter",
      ],
      status: { text: "Ready", tone: "ready" },
    },
    {
      id: "install",
      number: 2,
      title: "Install dependencies",
      description: "Install packages with pnpm.",
      commands: ["pnpm install"],
      status: { text: "Ready", tone: "ready" },
    },
    {
      id: "dev",
      number: 3,
      title: "Start development server",
      description: "Run the dev server, then open the app and this dashboard.",
      commands: ["pnpm dev"],
      urls: [
        { label: "App", href: "http://localhost:3000" },
        { label: "Dashboard", href: `http://localhost:3000${paths.starterDashboard}` },
      ],
      status: { text: "Ready", tone: "ready" },
    },
    {
      id: "doctor",
      number: 4,
      title: "Check starter health",
      description:
        "Validates the feature structure, centralized routes, i18n/theme state, and generator setup.",
      commands: ["pnpm gen doctor"],
      status: { text: "Ready", tone: "ready" },
    },
    {
      id: "feature",
      number: 5,
      title: "Generate the first feature",
      description:
        "Creates a feature module, a page, and registers the route in the centralized registry.",
      commands: [
        "pnpm gen feature auth --page login --route /login --path-key login",
      ],
      status:
        status.features.length > 0
          ? { text: `${status.features.length} feature(s) detected`, tone: "completed" }
          : { text: "Next recommended step", tone: "recommended" },
    },
    {
      id: "optional",
      number: 6,
      title: "Optional setup",
      description: "Enable the integrations you need before implementing the app.",
      items: [
        {
          id: "i18n",
          name: "Internationalization",
          description: "Set up next-intl and migrate pages under [locale].",
          command: "pnpm gen i18n init",
          status: status.i18nEnabled
            ? { text: "Enabled", tone: "completed" }
            : { text: "Not configured", tone: "not-configured" },
        },
        {
          id: "theme",
          name: "Theme",
          description: "Set up next-themes light / dark / system theming.",
          command: "pnpm gen theme init",
          status: status.themeEnabled
            ? { text: "Enabled", tone: "completed" }
            : { text: "Not configured", tone: "not-configured" },
        },
      ],
      status: { text: "Optional", tone: "optional" },
    },
    {
      id: "routes-check",
      number: 7,
      title: "Validate routing",
      description: "Checks for hardcoded internal navigation paths (AST-based).",
      commands: ["pnpm gen routes check"],
      status: { text: "Ready", tone: "ready" },
    },
    {
      id: "build",
      number: 8,
      title: "Start building the real application",
      description:
        "The starter dashboard is developer tooling only. Implement your app in `src/app/page.tsx` and feature code under `src/features/`.",
      status: { text: "Ready", tone: "ready" },
    },
    {
      id: "hide-shortcut",
      number: 9,
      title: "Hide the Starter Dashboard shortcut",
      description:
        `Setting \`SHOW_STARTER_DASHBOARD=false\` hides only the floating shortcut. The dashboard, generators, and starter tooling remain accessible directly at \`${paths.starterDashboard}\`.`,
      commands: ["SHOW_STARTER_DASHBOARD=false"],
      status: { text: "Optional", tone: "optional" },
    },
  ];
}
