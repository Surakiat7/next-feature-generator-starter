"use client";

import { animate, stagger } from "animejs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_STRUCTURE,
  COMMAND_PREVIEWS,
  type CommandPreview,
} from "../lib/command-previews";
import type { TreeEntry, TreeNodeState } from "../types/generator-demo.types";
import { CopyButton } from "./copy-button";
import { FileTree } from "./file-tree";

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
  const [selectedId, setSelectedId] = useState(COMMAND_PREVIEWS[0]!.id);
  const selected =
    COMMAND_PREVIEWS.find((c) => c.id === selectedId) ?? COMMAND_PREVIEWS[0]!;

  const treeRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  const entries: TreeEntry[] = useMemo(() => {
    const map = new Map<string, TreeNodeState>();
    for (const p of BASE_STRUCTURE) map.set(p, "existing");
    for (const p of selected.modifies) map.set(p, "highlight");
    for (const p of selected.creates) map.set(p, "added");
    return [...map.entries()].map(([path, state]) => ({ path, state }));
  }, [selected]);

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
                onClick={() => setSelectedId(cmd.id)}
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
        <div ref={codeRef} className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <code className="scrollbar-faint min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-zinc-800 dark:text-zinc-200">
            <span className="select-none text-emerald-600 dark:text-emerald-400">$ </span>
            {selected.command}
          </code>
          <CopyButton value={selected.command} />
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

          <div
            ref={treeRef}
            key={selectedId}
            className="scrollbar-faint overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <FileTree entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}
