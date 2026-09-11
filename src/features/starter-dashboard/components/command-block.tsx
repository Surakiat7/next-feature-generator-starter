import { CopyButton } from "./copy-button";

export function CommandBlock({ command }: { command: string }) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-md bg-zinc-100 px-2.5 py-1.5 dark:bg-zinc-900">
      <code className="scrollbar-faint block min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-zinc-800 dark:text-zinc-200">
        <span className="select-none text-emerald-600 dark:text-emerald-400">$ </span>
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  );
}
