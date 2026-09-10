import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@inquirer/prompts", () => ({
  confirm: vi.fn().mockResolvedValue(true),
  input: vi.fn(),
  select: vi.fn(),
}));

import { runThemeInit } from "../commands/theme-init";
import { runThemeRemove, scanThemeUsage } from "../commands/theme-remove";
import { setupFixture, type Fixture } from "./helpers";

let fx: Fixture;
beforeEach(() => {
  fx = setupFixture();
});
afterEach(() => {
  fx.cleanup();
});

describe("gen theme init", () => {
  it("creates the provider/toggle and integrates the layout", async () => {
    const result = await runThemeInit({ yes: true, skipInstall: true });
    expect(result).toBe("written");

    expect(fx.exists("src/providers/theme-provider.tsx")).toBe(true);
    expect(fx.exists("src/components/theme-toggle.tsx")).toBe(true);
    expect(fx.read("src/providers/index.ts")).toContain("ThemeProvider");
    expect(fx.read("src/components/index.ts")).toContain("ThemeToggle");

    const layout = fx.read("src/app/layout.tsx");
    expect(layout).toContain("<ThemeProvider>");
    expect(layout).toContain("suppressHydrationWarning");

    const css = fx.read("src/app/globals.css");
    expect(css).toContain("@custom-variant dark");
    expect(css).toContain(".dark {");

    expect(fx.read("src/app/page.tsx")).toContain("<ThemeToggle />");
  });

  it("does not initialize twice", async () => {
    await runThemeInit({ yes: true, skipInstall: true });
    const result = await runThemeInit({ yes: true, skipInstall: true });
    expect(result).toBe("empty");
  });
});

describe("gen theme remove", () => {
  it("detects theme usage before removing", async () => {
    await runThemeInit({ yes: true, skipInstall: true });
    fx.write(
      "src/features/dash/widget.tsx",
      `"use client";\nimport { useTheme } from "next-themes";\nexport function Widget() {\n  const { theme } = useTheme();\n  return <span>{theme}</span>;\n}\n`,
    );

    const dependents = await scanThemeUsage([]);
    expect(dependents.some((f) => f.includes("widget.tsx"))).toBe(true);
  });

  it("removes provider, toggle and layout integration", async () => {
    await runThemeInit({ yes: true, skipInstall: true });
    const result = await runThemeRemove({ yes: true, skipInstall: true });
    expect(result).toBe("written");

    expect(fx.exists("src/providers/theme-provider.tsx")).toBe(false);
    expect(fx.exists("src/components/theme-toggle.tsx")).toBe(false);
    expect(fx.read("src/app/layout.tsx")).not.toContain("ThemeProvider");
    expect(fx.read("src/providers/index.ts")).not.toContain("ThemeProvider");
  });
});
