/* Minimal ANSI logger — no external dependency. Colors are disabled when the
 * output is not a TTY or when NO_COLOR is set. */

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

function paint(code: string, text: string): string {
  return useColor ? `[${code}m${text}[0m` : text;
}

export const color = {
  dim: (t: string) => paint("2", t),
  bold: (t: string) => paint("1", t),
  red: (t: string) => paint("31", t),
  green: (t: string) => paint("32", t),
  yellow: (t: string) => paint("33", t),
  blue: (t: string) => paint("34", t),
  cyan: (t: string) => paint("36", t),
};

export const logger = {
  log(msg = "") {
    console.log(msg);
  },
  info(msg: string) {
    console.log(msg);
  },
  success(msg: string) {
    console.log(`${color.green("✓")} ${msg}`);
  },
  warn(msg: string) {
    console.log(`${color.yellow("!")} ${msg}`);
  },
  error(msg: string) {
    console.log(`${color.red("✗")} ${msg}`);
  },
  dim(msg: string) {
    console.log(color.dim(msg));
  },
  heading(msg: string) {
    console.log(`\n${color.bold(color.cyan(msg))}`);
  },
  /** Render a "KEY   value" aligned row. */
  field(key: string, value: string) {
    console.log(`${color.dim(key.padEnd(12))}${value}`);
  },
};

/** Format a change label like `CREATE src/...` with colored verb. */
export function changeLine(
  kind: "create" | "modify" | "delete" | "move",
  path: string,
  toPath?: string,
): string {
  const label = {
    create: color.green("CREATE"),
    modify: color.yellow("MODIFY"),
    delete: color.red("DELETE"),
    move: color.blue("MOVE  "),
  }[kind];
  if (kind === "move" && toPath) {
    return `  ${label} ${path} ${color.dim("→")} ${toPath}`;
  }
  return `  ${label} ${path}`;
}
