import { confirm, input, select } from "@inquirer/prompts";

/** Text prompt with an optional default. */
export function promptInput(
  message: string,
  opts: { default?: string; required?: boolean } = {},
): Promise<string> {
  return input({
    message,
    default: opts.default,
    validate: opts.required
      ? (v) => (v.trim().length > 0 ? true : "Required")
      : undefined,
  });
}

/** Yes/No prompt. */
export function promptConfirm(message: string, defaultValue = true): Promise<boolean> {
  return confirm({ message, default: defaultValue });
}

/** Single-choice select. */
export function promptSelect<T extends string>(
  message: string,
  choices: { name: string; value: T }[],
): Promise<T> {
  return select({ message, choices });
}
