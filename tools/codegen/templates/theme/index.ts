/** next-themes provider wrapper (client component). */
export function themeProviderFile(): string {
  return `"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
`;
}

/** Minimal light/dark/system toggle (client component). */
export function themeToggleFile(): string {
  return `"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEMES = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid a hydration mismatch: the resolved theme is only known on the client.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div role="group" aria-label="Theme" className="inline-flex gap-1 rounded-md border p-1">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => setTheme(option)}
          className="rounded px-2 py-1 text-sm capitalize aria-pressed:bg-zinc-200 dark:aria-pressed:bg-zinc-700"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
`;
}

/** The Tailwind v4 custom variant that makes `dark:` respond to a `.dark` class. */
export const DARK_VARIANT = `@custom-variant dark (&:where(.dark, .dark *));`;

/** CSS block that maps the `.dark` class to the dark palette. */
export const DARK_CLASS_BLOCK = `.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}`;
