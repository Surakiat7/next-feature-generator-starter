import Link from "next/link";
import { paths } from "@/routes";

/**
 * Subtle developer-tool shortcut into the Starter Dashboard. Rendered by the app
 * layout only when SHOW_STARTER_DASHBOARD=true. Kept intentionally small and
 * non-dominant so it never competes with real application actions.
 */
export function StarterDashboardFloatingButton() {
  return (
    <Link
      href={paths.starterDashboard}
      aria-label="Open Starter Dashboard"
      title="Open Starter Dashboard"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-zinc-300/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-zinc-900 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
    >
      <span aria-hidden className="font-mono text-emerald-600 dark:text-emerald-400">
        {"</>"}
      </span>
      Starter
    </Link>
  );
}
