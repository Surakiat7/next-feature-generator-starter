import { CommandExplorer } from "../components/command-explorer";
import { DashboardHeader } from "../components/dashboard-header";
import { GettingStarted } from "../components/getting-started";
import { Reveal } from "../components/reveal";
import { SectionLabel } from "../components/section-label";
import { getProjectStatus } from "../lib/project-status";

/**
 * Development-time control center for the starter. It provides an interactive
 * command explorer that previews the folder structure each command sets up.
 */
export function StarterDashboardView() {
  const status = getProjectStatus();

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-470 px-6 py-10">
        <DashboardHeader />

        <div className="grid lg:grid-cols-[minmax(0,30%)_minmax(0,70%)]">
          <Reveal className="mb-4 lg:border-r lg:border-zinc-200 lg:pr-6 lg:dark:border-zinc-800">
            <SectionLabel title="Quick Start" sub="from clone to first feature" />
            <GettingStarted status={status} />
          </Reveal>

          <Reveal className="mb-4 lg:sticky lg:top-4 lg:self-start lg:pl-6">
            <SectionLabel title="Commands" sub="pick a command to preview what it sets up" />
            <CommandExplorer
              i18nEnabled={status.i18nEnabled}
              themeEnabled={status.themeEnabled}
              featureCount={status.features.length}
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
