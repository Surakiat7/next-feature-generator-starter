import type { RouteInfo } from "../lib/project-status";

function RouteList({ routes }: { routes: RouteInfo[] }) {
  if (routes.length === 0) {
    return <div className="px-4 py-3 text-xs text-zinc-400">none</div>;
  }
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {routes.map((route) => (
        <li key={route.key} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{route.key}</span>
          <span className="flex items-center gap-2">
            {route.dynamic && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                dynamic
              </span>
            )}
            <span className="font-mono text-xs text-zinc-500">{route.path}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RouteStatus({
  appRoutes,
  toolingRoutes,
}: {
  appRoutes: RouteInfo[];
  toolingRoutes: RouteInfo[];
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          Application Routes
        </div>
        <RouteList routes={appRoutes} />
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          Developer Tooling
        </div>
        <RouteList routes={toolingRoutes} />
      </div>
    </div>
  );
}
