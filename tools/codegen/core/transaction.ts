import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { abs } from "../config";
import { format } from "./format";
import type { PlannedChange } from "./planner";

interface Backup {
  absPath: string;
  existed: boolean;
  content: Buffer | null;
}

/**
 * A file-mutation unit with rollback. Every write/delete/move first snapshots
 * the affected paths, so `rollback()` can restore the tree to its prior state
 * if generation fails midway.
 */
export class Transaction {
  private backups: Backup[] = [];
  private createdDirs: string[] = [];

  private snapshot(absPath: string): void {
    const existed = existsSync(absPath);
    this.backups.push({
      absPath,
      existed,
      content: existed ? readFileSync(absPath) : null,
    });
  }

  private ensureDir(absPath: string): void {
    const dir = path.dirname(absPath);
    if (existsSync(dir)) return;
    let cur = dir;
    const toCreate: string[] = [];
    while (!existsSync(cur)) {
      toCreate.unshift(cur);
      cur = path.dirname(cur);
    }
    mkdirSync(dir, { recursive: true });
    this.createdDirs.push(...toCreate);
  }

  writeFile(absPath: string, content: string): void {
    this.snapshot(absPath);
    this.ensureDir(absPath);
    writeFileSync(absPath, content, "utf8");
  }

  deleteFile(absPath: string): void {
    this.snapshot(absPath);
    if (existsSync(absPath)) rmSync(absPath);
  }

  moveFile(fromAbs: string, toAbs: string): void {
    this.snapshot(fromAbs);
    this.snapshot(toAbs);
    const content = readFileSync(fromAbs);
    this.ensureDir(toAbs);
    writeFileSync(toAbs, content);
    rmSync(fromAbs);
  }

  /** Restore every touched path to its pre-transaction state. */
  rollback(): void {
    for (const b of [...this.backups].reverse()) {
      if (b.existed && b.content !== null) {
        this.ensureDir(b.absPath);
        writeFileSync(b.absPath, b.content);
      } else if (existsSync(b.absPath)) {
        rmSync(b.absPath);
      }
    }
    for (const dir of [...this.createdDirs].reverse()) {
      try {
        if (existsSync(dir) && readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
      } catch {
        /* ignore */
      }
    }
  }
}

async function applyChange(tx: Transaction, change: PlannedChange): Promise<void> {
  switch (change.kind) {
    case "create":
    case "modify": {
      const formatted = await format(change.content ?? "", change.path);
      tx.writeFile(abs(change.path), formatted);
      break;
    }
    case "delete":
      tx.deleteFile(abs(change.path));
      break;
    case "move":
      tx.moveFile(abs(change.path), abs(change.toPath!));
      break;
  }
}

/**
 * Apply a list of planned changes atomically. On any error (including an
 * injected `failAt` for tests) the whole batch is rolled back and the error
 * rethrown, so no half-generated architecture is left behind.
 */
export async function executePlan(
  changes: PlannedChange[],
  opts: { failAt?: number } = {},
): Promise<Transaction> {
  const tx = new Transaction();
  try {
    for (let i = 0; i < changes.length; i++) {
      if (opts.failAt === i) {
        throw new Error("Simulated mid-operation failure");
      }
      await applyChange(tx, changes[i]);
    }
  } catch (err) {
    tx.rollback();
    throw err;
  }
  return tx;
}
