import { BackToAppButton } from "./back-to-app-button";
import { DashboardLogo } from "./dashboard-logo";

export function DashboardHeader() {
  return (
    <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <DashboardLogo />
          <h1 className="text-xl font-semibold tracking-tight">Setup Next.js</h1>
        </div>
        <p className="mt-1 max-w-xl text-sm text-zinc-500 line-clamp-1">
          Generator and command previews for the starter.
        </p>
      </div>
      <BackToAppButton />
    </header>
  );
}
