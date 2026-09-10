import path from "node:path";
import prettier from "prettier";
import { abs } from "../config";

function parserFor(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
    case ".tsx":
    case ".mts":
    case ".cts":
      return "typescript";
    case ".js":
    case ".jsx":
    case ".mjs":
      return "babel";
    case ".json":
      return "json";
    case ".css":
      return "css";
    case ".md":
      return "markdown";
    default:
      return null;
  }
}

/**
 * Format generated source with Prettier, honouring any local config. Falls back
 * to the raw content when the file type is unknown or formatting fails, so a
 * generator never crashes on a formatting edge case.
 */
export async function format(content: string, filePath: string): Promise<string> {
  const parser = parserFor(filePath);
  if (!parser) return content;
  try {
    const config = await prettier.resolveConfig(abs(filePath)).catch(() => null);
    return await prettier.format(content, { ...config, parser });
  } catch {
    return content;
  }
}
