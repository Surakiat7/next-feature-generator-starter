import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { abs } from "../config";

/** Convert an absolute or OS path to a repo-relative POSIX display path. */
export function toDisplayPath(absOrRel: string): string {
  const rel = path.isAbsolute(absOrRel)
    ? path.relative(abs("."), absOrRel)
    : absOrRel;
  return rel.split(path.sep).join("/");
}

export function fileExists(relPath: string): boolean {
  return existsSync(abs(relPath));
}

export function dirExists(relPath: string): boolean {
  const p = abs(relPath);
  return existsSync(p) && statSync(p).isDirectory();
}

export function readIfExists(relPath: string): string | null {
  const p = abs(relPath);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}
