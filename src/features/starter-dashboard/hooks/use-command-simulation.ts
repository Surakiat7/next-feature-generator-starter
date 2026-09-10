"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_STRUCTURE,
  COMMAND_PREVIEWS,
  type CommandPreview,
} from "../lib/command-previews";
import type { TerminalLine, TreeEntry, TreeNodeState } from "../types/generator-demo.types";

function buildScript(selected: CommandPreview): TerminalLine[] {
  const lines: TerminalLine[] = [{ text: selected.command, kind: "run" }];
  if (selected.note) {
    lines.push({ text: selected.note, kind: "info" });
  } else {
    for (const p of selected.creates)
      lines.push({ text: `Created ${p}`, kind: "ok" });
    for (const p of selected.modifies)
      lines.push({ text: `Modified ${p}`, kind: "ok" });
    lines.push({
      text: `Done — ${selected.creates.length + selected.modifies.length} change(s) applied.`,
      kind: "info",
    });
  }
  return lines;
}

export function useCommandSimulation() {
  const [selectedId, setSelectedId] = useState(COMMAND_PREVIEWS[0]!.id);
  const selected = useMemo(
    () => COMMAND_PREVIEWS.find((c) => c.id === selectedId) ?? COMMAND_PREVIEWS[0]!,
    [selectedId],
  );

  const script: TerminalLine[] = useMemo(() => buildScript(selected), [selected]);

  const entries: TreeEntry[] = useMemo(() => {
    const map = new Map<string, TreeNodeState>();
    for (const p of BASE_STRUCTURE) map.set(p, "existing");
    for (const p of selected.modifies) map.set(p, "highlight");
    for (const p of selected.creates) map.set(p, "added");
    return [...map.entries()].map(([path, state]) => ({ path, state }));
  }, [selected]);

  const [revealed, setRevealed] = useState(0);
  const [stopped, setStopped] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = revealed < script.length && !stopped;

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const selectCommand = useCallback(
    (id: string) => {
      clearTimer();
      setSelectedId(id);
      setRevealed(0);
      setStopped(false);
    },
    [clearTimer],
  );

  const stop = useCallback(() => {
    clearTimer();
    setStopped(true);
  }, [clearTimer]);

  const replay = useCallback(() => {
    clearTimer();
    setStopped(false);
    setRevealed(0);
  }, [clearTimer]);

  useEffect(() => {
    if (stopped || revealed >= script.length) return;
    timer.current = setTimeout(
      () => setRevealed((r) => r + 1),
      revealed === 0 ? 150 : 420,
    );
    return clearTimer;
  }, [revealed, script, stopped, clearTimer]);

  return {
    selected,
    selectedId,
    script,
    revealed,
    running,
    stop,
    replay,
    selectCommand,
    entries,
  };
}
