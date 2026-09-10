import { CommandExplorer } from "../components/command-explorer";
import { DashboardHeader } from "../components/dashboard-header";
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
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <DashboardHeader />

        <Reveal className="mb-4">
          <SectionLabel title="Generator Commands" sub="pick a command to preview what it sets up" />
          <CommandExplorer
            i18nEnabled={status.i18nEnabled}
            themeEnabled={status.themeEnabled}
            featureCount={status.features.length}
          />
        </Reveal>
      </div>
    </div>
  );
}
