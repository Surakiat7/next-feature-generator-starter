import { ArchitectureOverview } from "../components/architecture-overview";
import { BackToAppButton } from "../components/back-to-app-button";
import { CommandCatalog } from "../components/command-catalog";
import { FeatureStatus } from "../components/feature-status";
import { IntegrationStatus } from "../components/integration-status";
import { LiveGeneratorDemo } from "../components/live-generator-demo";
import { RouteStatus } from "../components/route-status";
import { getProjectStatus } from "../lib/project-status";

function SectionLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      {sub && <span className="text-[11px] text-zinc-400">{sub}</span>}
    </div>
  );
}

/**
 * Development-time control center for understanding the starter architecture.
 * The top half is REAL project status detected from the source tree; the bottom
 * half is a clearly-labelled SIMULATED generator demo.
 */
export function StarterDashboardView() {
  const status = getProjectStatus();

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{"</>"}</span>
              <h1 className="text-xl font-semibold tracking-tight">Starter Dashboard</h1>
            </div>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Developer tooling for this feature-based starter. Inspect the detected
              architecture, then generate features from the CLI.
            </p>
          </div>
          <BackToAppButton />
        </header>

        <section className="mb-12">
          <SectionLabel title="Real Project Status" sub="detected from src/" />
          <div className="space-y-6">
            <ArchitectureOverview status={status} />
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Features</h3>
                <FeatureStatus features={status.features} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Routes</h3>
                <RouteStatus appRoutes={status.appRoutes} toolingRoutes={status.toolingRoutes} />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Optional Setup</h3>
              <IntegrationStatus i18n={status.i18nEnabled} theme={status.themeEnabled} />
            </div>
          </div>
        </section>

        <hr className="mb-12 border-zinc-200 dark:border-zinc-800" />

        <section className="mb-12">
          <SectionLabel title="Generator Commands" sub="copy & run in your terminal" />
          <CommandCatalog
            i18nEnabled={status.i18nEnabled}
            themeEnabled={status.themeEnabled}
            featureCount={status.features.length}
          />
        </section>

        <hr className="mb-12 border-zinc-200 dark:border-zinc-800" />

        <section>
          <SectionLabel title="Live Generator Demo" sub="simulated — never touches your files" />
          <LiveGeneratorDemo />
        </section>
      </div>
    </div>
  );
}
