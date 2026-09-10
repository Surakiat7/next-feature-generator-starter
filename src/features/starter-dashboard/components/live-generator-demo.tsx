"use client";

import { useGeneratorDemo } from "../hooks/use-generator-demo";
import { DemoSelector } from "./demo-selector";
import { FileTree } from "./file-tree";
import { TerminalDemo } from "./terminal-demo";

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-lg tabular-nums text-zinc-900 dark:text-zinc-100">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}

export function LiveGeneratorDemo() {
  const { scenario, scenarioId, scenarios, frame, running, play, reset, select } =
    useGeneratorDemo();

  return (
    <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Live Generator Demo
          </h2>
          <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400">
            Simulated
          </span>
        </div>
        <DemoSelector scenarios={scenarios} activeId={scenarioId} onSelect={select} />
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <code className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {scenario.command}
          </code>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={play}
              disabled={running}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {running ? "Running…" : "Run demo"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TerminalDemo lines={frame.terminal} running={running} />
          <div className="overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-2 font-mono text-[11px] text-zinc-500">file tree</div>
            <FileTree entries={frame.tree} />
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-lg border border-dashed border-zinc-300 px-4 py-3 dark:border-zinc-700">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Simulated metrics
          </span>
          <MetricPill label="features" value={frame.metrics.features} />
          <MetricPill label="app routes" value={frame.metrics.appRoutes} />
        </div>
      </div>
    </section>
  );
}
