/** Types for the SIMULATED live generator demo. Nothing here touches disk. */

export type TerminalKind = "run" | "ok" | "info";

export interface TerminalLine {
  text: string;
  kind: TerminalKind;
}

export type TreeNodeState = "existing" | "added" | "highlight";

/** A flat tree entry; nesting is derived from the slash-separated path. */
export interface TreeEntry {
  path: string;
  state: TreeNodeState;
}

export interface DemoMetrics {
  features: number;
  appRoutes: number;
}

export interface DemoStep {
  /** Terminal line appended when this step runs. */
  terminal: TerminalLine;
  /** Tree paths this step creates. */
  addPaths?: string[];
  /** Existing tree path to briefly highlight (e.g. a modified file). */
  highlightPath?: string;
  /** Metric values after this step (partial patch). */
  metrics?: Partial<DemoMetrics>;
}

export interface DemoScenario {
  id: string;
  label: string;
  command: string;
  initialTree: string[];
  initialMetrics: DemoMetrics;
  steps: DemoStep[];
}
