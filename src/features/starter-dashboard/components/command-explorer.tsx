"use client";

import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import {
  COMMAND_PREVIEWS,
  type CommandPreview,
} from "../lib/command-previews";
import { useCommandSimulation } from "../hooks/use-command-simulation";
import { CopyButton } from "./copy-button";
import { FileTree } from "./file-tree";
import { TerminalDemo } from "./terminal-demo";

function badgeFor(
  cmd: CommandPreview,
  i18nEnabled: boolean,
  themeEnabled: boolean,
  featureCount: number,
): { text: string; tone: "on" | "off" | "muted" } | null {
  if (cmd.setup === "i18n") {
    return i18nEnabled
      ? { text: "Configured", tone: "on" }
      : { text: "Not set up", tone: "off" };
  }
  if (cmd.setup === "theme") {
    return themeEnabled
      ? { text: "Configured", tone: "on" }
      : { text: "Not set up", tone: "off" };
  }
  if (cmd.countsFeatures) {
    return featureCount > 0
      ? { text: `${featureCount} generated`, tone: "muted" }
      : { text: "none yet", tone: "off" };
  }
  return null;
}

const TONE_CLASS = {
  on: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  off: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  muted: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
} as const;

export function CommandExplorer({
  i18nEnabled,
  themeEnabled,
  featureCount,
}: {
  i18nEnabled: boolean;
  themeEnabled: boolean;
  featureCount: number;
}) {
  const {
    selected,
    selectedId,
    script,
    revealed,
    running,
    stop,
    replay,
    selectCommand,
    entries,
  } = useCommandSimulation();

  const treeRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  // Animate the folder structure + command whenever the selection changes.
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    if (treeRef.current) {
      const rows = treeRef.current.querySelectorAll<HTMLElement>("[data-tree-row]");
      if (rows.length) {
        animate(rows, {
          opacity: [0, 1],
          translateX: [-10, 0],
          duration: 460,
          delay: stagger(26),
          ease: "outQuad",
        });
      }
    }
    if (codeRef.current) {
      animate(codeRef.current, {
        opacity: [0, 1],
        translateY: [-6, 0],
        duration: 380,
        ease: "outQuad",
      });
    }
  }, [selectedId, entries]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,300px)_1fr]">
      {/* Command list */}
      <ul className="flex flex-col gap-1.5">
        {COMMAND_PREVIEWS.map((cmd) => {
          const active = cmd.id === selectedId;
          const badge = badgeFor(cmd, i18nEnabled, themeEnabled, featureCount);
          return (
            <li key={cmd.id}>
              <button
                type="button"
                onClick={() => selectCommand(cmd.id)}
                aria-pressed={active}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                    : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {cmd.label}
                  </span>
                  {badge && (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${TONE_CLASS[badge.tone]}`}>
                      {badge.text}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{cmd.description}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Structure preview */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
        <div ref={codeRef} className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex w-fit items-center gap-2">
            <code className="scrollbar-faint w-fit overflow-x-auto whitespace-nowrap font-mono text-xs text-zinc-800 dark:text-zinc-200">
              <span className="select-none text-emerald-600 dark:text-emerald-400">$ </span>
              {selected.command}
            </code>
            <CopyButton value={selected.command} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={stop}
              disabled={!running}
              className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Stop
            </button>
            <button
              type="button"
              onClick={replay}
              disabled={running}
              className="shrink-0 rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {running ? "Running…" : "Replay"}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            {selected.note ? (
              <span className="text-zinc-500">{selected.note}</span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {selected.creates.length} created
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {selected.modifies.length} modified
                </span>
              </>
            )}
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <div
              ref={treeRef}
              key={selectedId}
              className="scrollbar-faint overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <div className="mb-2 font-mono text-[11px] text-zinc-500">file tree</div>
              <FileTree entries={entries} />
            </div>
            <TerminalDemo lines={script.slice(0, revealed)} running={running} />
          </div>
        </div>
      </div>
    </div>
  );
}
