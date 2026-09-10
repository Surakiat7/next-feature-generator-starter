import type {
  DemoMetrics,
  DemoScenario,
  TerminalLine,
  TreeEntry,
  TreeNodeState,
} from "../types/generator-demo.types";

export interface DemoFrame {
  terminal: TerminalLine[];
  tree: TreeEntry[];
  metrics: DemoMetrics;
  done: boolean;
}

/**
 * Derive the visible demo state after `revealedCount` steps. Pure and
 * deterministic — the hook just advances `revealedCount` over time.
 */
export function frameAt(scenario: DemoScenario, revealedCount: number): DemoFrame {
  const revealed = scenario.steps.slice(0, Math.max(0, revealedCount));

  const terminal = revealed.map((step) => step.terminal);

  const order: string[] = [...scenario.initialTree];
  const state = new Map<string, TreeNodeState>();
  for (const p of scenario.initialTree) state.set(p, "existing");

  revealed.forEach((step, index) => {
    const isLast = index === revealed.length - 1;
    for (const p of step.addPaths ?? []) {
      if (!state.has(p)) order.push(p);
      state.set(p, isLast ? "added" : "existing");
    }
    if (step.highlightPath && isLast) {
      if (!state.has(step.highlightPath)) order.push(step.highlightPath);
      state.set(step.highlightPath, "highlight");
    }
  });

  const tree: TreeEntry[] = order.map((path) => ({
    path,
    state: state.get(path) ?? "existing",
  }));

  let metrics: DemoMetrics = { ...scenario.initialMetrics };
  for (const step of revealed) {
    if (step.metrics) metrics = { ...metrics, ...step.metrics };
  }

  return { terminal, tree, metrics, done: revealedCount >= scenario.steps.length };
}
