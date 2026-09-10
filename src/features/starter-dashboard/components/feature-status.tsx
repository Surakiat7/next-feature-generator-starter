import type { FeatureInfo } from "../lib/project-status";

export function FeatureStatus({ features }: { features: FeatureInfo[] }) {
  if (features.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-5 text-sm dark:border-zinc-700">
        <p className="text-zinc-600 dark:text-zinc-400">No application features generated yet.</p>
        <p className="mt-2 text-zinc-500">Try:</p>
        <code className="mt-1 inline-block rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          pnpm gen feature auth --page login --route /login
        </code>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {features.map((feature) => (
        <li key={feature.name} className="px-4 py-3">
          <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{feature.name}</div>
          {feature.pages.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {feature.pages.map((page) => (
                <span
                  key={page}
                  className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  {page}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-zinc-400">no pages</div>
          )}
        </li>
      ))}
    </ul>
  );
}
