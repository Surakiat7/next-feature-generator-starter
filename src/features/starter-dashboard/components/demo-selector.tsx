import type { DemoScenario } from "../types/generator-demo.types";

export function DemoSelector({
  scenarios,
  activeId,
  onSelect,
}: {
  scenarios: DemoScenario[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
      {scenarios.map((scenario) => {
        const active = scenario.id === activeId;
        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            aria-pressed={active}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {scenario.label}
          </button>
        );
      })}
    </div>
  );
}
