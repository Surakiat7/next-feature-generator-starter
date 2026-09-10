import { BackToAppButton } from "../components/back-to-app-button";
import { CommandExplorer } from "../components/command-explorer";
import { LiveGeneratorDemo } from "../components/live-generator-demo";
import { Reveal } from "../components/reveal";
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
 * Development-time control center for the starter. It leads with a clearly
 * labelled SIMULATED, auto-playing generator demo, followed by an interactive
 * command explorer that previews the folder structure each command sets up.
 */
export function StarterDashboardView() {
  const status = getProjectStatus();

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{"</>"}</span>
              <h1 className="text-xl font-semibold tracking-tight">Starter Dashboard</h1>
            </div>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Developer tooling for this feature-based starter. Watch the generator
              in action, then explore what each command sets up.
            </p>
          </div>
          <BackToAppButton />
        </header>

        <Reveal className="mb-12">
          <SectionLabel title="Live Generator Demo" sub="simulated — auto-plays, never touches your files" />
          <LiveGeneratorDemo />
        </Reveal>

        <Reveal className="mb-4" delay={80}>
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
