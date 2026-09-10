import type { ProjectStatus } from "../lib/project-status";

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 font-mono text-2xl tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-zinc-400">{hint}</div>}
    </div>
  );
}

export function ArchitectureOverview({ status }: { status: ProjectStatus }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            status.healthy
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.healthy ? "bg-emerald-500" : "bg-amber-500"}`} />
          Architecture {status.healthy ? "Healthy" : "Needs setup"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric label="Application Features" value={String(status.features.length)} />
        <Metric label="Application Routes" value={String(status.appRoutes.length)} />
        <Metric label="Developer Tooling Routes" value={String(status.toolingRoutes.length)} />
        <Metric label="i18n" value={status.i18nEnabled ? "Enabled" : "Off"} hint={status.i18nEnabled ? undefined : "not configured"} />
        <Metric label="Theme" value={status.themeEnabled ? "Enabled" : "Off"} hint={status.themeEnabled ? undefined : "not configured"} />
      </div>
    </div>
  );
}
