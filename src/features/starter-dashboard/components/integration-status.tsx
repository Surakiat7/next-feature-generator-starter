function IntegrationRow({
  name,
  enabled,
  setupCommand,
}: {
  name: string;
  enabled: boolean;
  setupCommand: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-zinc-400"}`} />
        <span className="text-sm text-zinc-800 dark:text-zinc-200">{name}</span>
      </div>
      {enabled ? (
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Configured</span>
      ) : (
        <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {setupCommand}
        </code>
      )}
    </div>
  );
}

export function IntegrationStatus({ i18n, theme }: { i18n: boolean; theme: boolean }) {
  return (
    <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      <IntegrationRow name="Internationalization (i18n)" enabled={i18n} setupCommand="pnpm gen i18n init" />
      <IntegrationRow name="Theme (dark / light / system)" enabled={theme} setupCommand="pnpm gen theme init" />
    </div>
  );
}
