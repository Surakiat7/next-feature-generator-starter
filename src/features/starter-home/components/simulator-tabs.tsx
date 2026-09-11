import type { SimulatorScenario } from "../lib/simulator-scenarios";

interface SimulatorTabsProps {
  scenarios: SimulatorScenario[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function SimulatorTabs({ scenarios, activeId, onSelect }: SimulatorTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Generator previews">
      {scenarios.map((scenario) => {
        const active = scenario.id === activeId;
        return (
          <button
            key={scenario.id}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(scenario.id)}
            className={[
              "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              active
                ? "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-600/40"
                : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
            ].join(" ")}
          >
            {scenario.label}
          </button>
        );
      })}
    </div>
  );
}
