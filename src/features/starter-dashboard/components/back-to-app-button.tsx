import Link from "next/link";
import { paths } from "@/routes";

/**
 * Persistent, subtle "Back to App" action shown on the dashboard so a developer
 * who deep-links to /dashboard-demo has an obvious way back to the real app.
 */
export function BackToAppButton() {
  return (
    <Link
      href={paths.home}
      aria-label="Back to the application"
      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300/80 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur transition-colors hover:text-zinc-900 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      <span aria-hidden>←</span>
      Back to App
    </Link>
  );
}
