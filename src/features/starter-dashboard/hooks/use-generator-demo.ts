"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_SCENARIOS } from "../lib/demo-scenarios";
import { frameAt } from "../lib/demo-timeline";

/**
 * Drives the SIMULATED generator demo with isolated, client-only state. It never
 * calls the real generator and never mutates the filesystem or real status.
 */
export function useGeneratorDemo() {
  const [scenarioId, setScenarioId] = useState(DEMO_SCENARIOS[0]!.id);
  const scenario = useMemo(
    () => DEMO_SCENARIOS.find((s) => s.id === scenarioId) ?? DEMO_SCENARIOS[0]!,
    [scenarioId],
  );

  const [revealed, setRevealed] = useState(0);
  // Auto-run from the first paint so visitors immediately see the demo play.
  const [started, setStarted] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  // `running` is derived, so the effect never has to setState to stop itself —
  // it simply schedules the next reveal while there are steps remaining.
  const running = started && revealed < scenario.steps.length;

  useEffect(() => {
    if (!started || revealed >= scenario.steps.length) return;
    timer.current = setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 150 : 420);
    return clearTimer;
  }, [started, revealed, scenario, clearTimer]);

  const play = useCallback(() => {
    clearTimer();
    setRevealed(0);
    setStarted(true);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setStarted(false);
    setRevealed(0);
  }, [clearTimer]);

  // Switching scenarios auto-runs the new one immediately.
  const select = useCallback(
    (id: string) => {
      clearTimer();
      setRevealed(0);
      setStarted(true);
      setScenarioId(id);
    },
    [clearTimer],
  );

  const frame = useMemo(() => frameAt(scenario, revealed), [scenario, revealed]);

  return {
    scenario,
    scenarioId,
    scenarios: DEMO_SCENARIOS,
    frame,
    running,
    play,
    reset,
    select,
  };
}
