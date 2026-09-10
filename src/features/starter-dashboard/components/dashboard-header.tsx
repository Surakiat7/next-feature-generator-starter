import { BackToAppButton } from "./back-to-app-button";

export function DashboardHeader() {
  return (
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
  );
}
