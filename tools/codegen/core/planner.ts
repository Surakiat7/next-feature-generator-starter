import { color, changeLine, logger } from "./logger";
import { promptConfirm } from "./prompts";
import { executePlan } from "./transaction";

export interface PlannedChange {
  kind: "create" | "modify" | "delete" | "move";
  /** Target path (create/modify/delete) or source path (move). Repo-relative. */
  path: string;
  /** Destination path for a move. */
  toPath?: string;
  /** Full file content for create/modify. */
  content?: string;
}

/**
 * Accumulates the changes a command intends to make. Nothing touches disk until
 * `finalize` runs, so plans can be printed and confirmed (or dry-run) first.
 */
export class Planner {
  readonly changes: PlannedChange[] = [];

  create(path: string, content: string): void {
    this.changes.push({ kind: "create", path, content });
  }

  modify(path: string, content: string): void {
    this.changes.push({ kind: "modify", path, content });
  }

  delete(path: string): void {
    this.changes.push({ kind: "delete", path });
  }

  move(from: string, to: string): void {
    this.changes.push({ kind: "move", path: from, toPath: to });
  }

  get isEmpty(): boolean {
    return this.changes.length === 0;
  }
}

export interface FinalizeOptions {
  title: string;
  fields?: [string, string][];
  yes?: boolean;
  dryRun?: boolean;
  /** Message printed when there is nothing to do. */
  emptyMessage?: string;
  /** Default answer for the confirmation prompt (false for destructive ops). */
  confirmDefault?: boolean;
}

export type FinalizeResult = "written" | "dry-run" | "cancelled" | "empty";

export function printPlan(planner: Planner, opts: FinalizeOptions): void {
  logger.heading(opts.title);
  logger.log();
  for (const [key, value] of opts.fields ?? []) {
    logger.field(key, value);
  }
  if (opts.fields?.length) logger.log();
  logger.info(color.bold("Changes"));
  logger.log();
  for (const change of planner.changes) {
    logger.log(changeLine(change.kind, change.path, change.toPath));
  }
  logger.log();
}

/**
 * Print the plan, honour `--dry-run`, ask for confirmation unless `--yes`, then
 * execute the changes transactionally. Shared by every mutating command.
 */
export async function finalize(
  planner: Planner,
  opts: FinalizeOptions,
): Promise<FinalizeResult> {
  if (planner.isEmpty) {
    logger.warn(opts.emptyMessage ?? "Nothing to do. No files changed.");
    return "empty";
  }

  printPlan(planner, opts);

  if (opts.dryRun) {
    logger.dim("Dry run — no files were written.");
    return "dry-run";
  }

  if (!opts.yes) {
    const ok = await promptConfirm("Continue?", opts.confirmDefault ?? true);
    if (!ok) {
      logger.log();
      logger.warn("Cancelled. No files changed.");
      return "cancelled";
    }
  }

  await executePlan(planner.changes);
  logger.log();
  logger.success(`Done — ${planner.changes.length} change(s) applied.`);
  return "written";
}
