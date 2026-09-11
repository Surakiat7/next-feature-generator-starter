"use client";

import { useMemo, useState } from "react";
import { SIMULATOR_SCENARIOS } from "../lib/simulator-scenarios";
import { SimulatedFileTree } from "./simulated-file-tree";
import { SimulatedTerminal } from "./simulated-terminal";
import { SimulatorTabs } from "./simulator-tabs";

export function GeneratorSimulator() {
  const [activeId, setActiveId] = useState<string>("feature");
  const activeScenario = useMemo(
    () => SIMULATOR_SCENARIOS.find((s) => s.id === activeId) ?? SIMULATOR_SCENARIOS[0],
    [activeId],
  );

  return (
    <section className="flex h-full flex-col justify-center gap-5 px-6 py-12 lg:px-10">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Generator preview
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Simulated examples. Switch tabs to preview each command.
        </p>
      </div>

      <SimulatorTabs
        scenarios={SIMULATOR_SCENARIOS}
        activeId={activeScenario.id}
        onSelect={setActiveId}
      />

      <SimulatedTerminal command={activeScenario.command} lines={activeScenario.output} />

      {activeScenario.fileTree ? (
        <SimulatedFileTree lines={activeScenario.fileTree} />
      ) : null}
    </section>
  );
}
