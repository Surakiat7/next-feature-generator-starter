import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@inquirer/prompts", () => ({
  confirm: vi.fn().mockResolvedValue(false),
  input: vi.fn(),
  select: vi.fn(),
}));

import { runFeature } from "../commands/feature";
import { runI18nInit } from "../commands/i18n-init";
import { runI18nRemove } from "../commands/i18n-remove";
import { setupFixture, type Fixture } from "./helpers";

let fx: Fixture;
beforeEach(() => {
  fx = setupFixture();
});
afterEach(() => {
  fx.cleanup();
});

async function initI18n() {
  return runI18nInit({ locales: "th,en", defaultLocale: "th", yes: true, skipInstall: true });
}

describe("gen i18n init", () => {
  it("generates the i18n architecture and migrates pages under [locale]", async () => {
    await runFeature("auth", { page: "login", route: "/login", pathKey: "login", yes: true });
    const result = await initI18n();
    expect(result).toBe("written");

    expect(fx.exists("src/i18n/routing.ts")).toBe(true);
    expect(fx.exists("src/i18n/navigation.ts")).toBe(true);
    expect(fx.exists("src/i18n/request.ts")).toBe(true);
    expect(fx.exists("src/proxy.ts")).toBe(true);
    expect(fx.exists("locales/th.json")).toBe(true);
    expect(fx.exists("locales/en.json")).toBe(true);

    expect(fx.exists("src/app/[locale]/layout.tsx")).toBe(true);
    expect(fx.exists("src/app/[locale]/page.tsx")).toBe(true);
    expect(fx.exists("src/app/layout.tsx")).toBe(false);
    expect(fx.exists("src/app/page.tsx")).toBe(false);

    // Existing page migrated, not left behind.
    expect(fx.exists("src/app/[locale]/login/page.tsx")).toBe(true);
    expect(fx.exists("src/app/login/page.tsx")).toBe(false);

    expect(fx.read("next.config.ts")).toContain("createNextIntlPlugin");
    expect(fx.read("src/components/index.ts")).toContain("LocaleSwitcher");
  });

  it("does not initialize twice", async () => {
    await initI18n();
    const result = await initI18n();
    expect(result).toBe("empty");
  });
});

describe("gen i18n remove", () => {
  it("changes nothing when the confirmation is declined", async () => {
    await initI18n();
    const result = await runI18nRemove({ yes: false });
    expect(result).toBe("cancelled");
    expect(fx.exists("src/i18n/request.ts")).toBe(true);
  });

  it("aborts on a dynamic translation key", async () => {
    await initI18n();
    fx.write(
      "src/features/products/card.tsx",
      `import { useTranslations } from "next-intl";\nexport function Card({ k }: { k: string }) {\n  const t = useTranslations("Products");\n  return <span>{t(k)}</span>;\n}\n`,
    );

    const result = await runI18nRemove({ yes: true });
    expect(result).toBe("empty");
    // Nothing removed.
    expect(fx.exists("src/i18n/request.ts")).toBe(true);
    expect(fx.exists("src/proxy.ts")).toBe(true);
  });

  it("removes i18n cleanly for a safe project", async () => {
    await initI18n();
    const result = await runI18nRemove({ yes: true, skipInstall: true });
    expect(result).toBe("written");

    expect(fx.exists("src/i18n/request.ts")).toBe(false);
    expect(fx.exists("src/proxy.ts")).toBe(false);
    expect(fx.exists("src/app/[locale]/layout.tsx")).toBe(false);
    expect(fx.exists("src/app/layout.tsx")).toBe(true);
    expect(fx.exists("src/app/page.tsx")).toBe(true);
    expect(fx.read("next.config.ts")).not.toContain("createNextIntlPlugin");
  });
});
