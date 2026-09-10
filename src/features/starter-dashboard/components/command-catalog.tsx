import {
  SCAFFOLDING_COMMANDS,
  SETUP_COMMANDS,
  VALIDATE_COMMANDS,
} from "../lib/generator-commands";
import { CopyButton } from "./copy-button";

type Badge = { text: string; tone: "on" | "off" | "muted" };

function StatusBadge({ badge }: { badge: Badge }) {
  const tone =
    badge.tone === "on"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
      : badge.tone === "off"
        ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>
      {badge.text}
    </span>
  );
}

function CommandRow({
  command,
  description,
  badge,
}: {
  command: string;
  description: string;
  badge?: Badge;
}) {
  return (
    <li className="px-4 py-3">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
        {badge && <StatusBadge badge={badge} />}
      </div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md bg-zinc-100 px-2.5 py-1.5 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {command}
        </code>
        <CopyButton value={command} />
      </div>
    </li>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        {title}
      </div>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">{children}</ul>
    </div>
  );
}

/**
 * Copy-ready catalog of every generator command, with badges showing what is
 * already set up in this project so developers know what to run next.
 */
export function CommandCatalog({
  i18nEnabled,
  themeEnabled,
  featureCount,
}: {
  i18nEnabled: boolean;
  themeEnabled: boolean;
  featureCount: number;
}) {
  const setupEnabled = [i18nEnabled, themeEnabled];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Group title="Scaffolding">
        {SCAFFOLDING_COMMANDS.map((cmd, i) => (
          <CommandRow
            key={cmd.command}
            command={cmd.command}
            description={cmd.description}
            badge={
              i === 0
                ? {
                    text:
                      featureCount > 0
                        ? `${featureCount} generated`
                        : "none yet",
                    tone: featureCount > 0 ? "muted" : "off",
                  }
                : undefined
            }
          />
        ))}
      </Group>

      <Group title="Setup">
        {SETUP_COMMANDS.map((cmd, i) => {
          const enabled = setupEnabled[i]!;
          return (
            <CommandRow
              key={cmd.name}
              description={`${cmd.name} — ${cmd.library}.`}
              command={enabled ? cmd.removeCommand : cmd.initCommand}
              badge={
                enabled
                  ? { text: "Configured", tone: "on" }
                  : { text: "Not configured", tone: "off" }
              }
            />
          );
        })}
      </Group>

      <Group title="Validate">
        {VALIDATE_COMMANDS.map((cmd) => (
          <CommandRow key={cmd.command} command={cmd.command} description={cmd.description} />
        ))}
      </Group>
    </div>
  );
}
