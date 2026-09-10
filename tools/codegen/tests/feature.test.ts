import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@inquirer/prompts", () => ({
  confirm: vi.fn().mockResolvedValue(false),
  input: vi.fn(),
  select: vi.fn(),
}));

import { runComponent } from "../commands/component";
import { runFeature } from "../commands/feature";
import { runPage } from "../commands/page";
import { executePlan } from "../core/transaction";
import { setupFixture, type Fixture } from "./helpers";

let fx: Fixture;
beforeEach(() => {
  fx = setupFixture();
});
afterEach(() => {
  fx.cleanup();
});

describe("gen feature", () => {
  it("infers page, route, and path key from the feature name", async () => {
    const result = await runFeature("login", { yes: true });
    expect(result).toBe("written");

    for (const sub of ["components", "hooks", "lib", "types"]) {
      expect(fx.exists(`src/features/login/${sub}/index.ts`)).toBe(true);
    }
    expect(fx.read("src/features/login/view/login-view.tsx")).toContain("export function LoginView");
    expect(fx.read("src/app/login/page.tsx")).toContain("import { LoginView }");
    expect(fx.read("src/features/login/index.ts")).toContain(
      'export { LoginView } from "./view/login-view";',
    );
    expect(fx.read("src/routes/paths.ts")).toContain('login: "/login"');
  });

  it("supports overrides for page, route, and path key", async () => {
    const result = await runFeature("auth", {
      page: "login",
      route: "/login",
      pathKey: "login",
      yes: true,
    });
    expect(result).toBe("written");

    for (const sub of ["components", "hooks", "lib", "types"]) {
      expect(fx.exists(`src/features/auth/${sub}/index.ts`)).toBe(true);
    }
    expect(fx.read("src/features/auth/view/login-view.tsx")).toContain("export function LoginView");
    expect(fx.read("src/app/login/page.tsx")).toContain("import { LoginView }");
    expect(fx.read("src/features/auth/index.ts")).toContain(
      'export { LoginView } from "./view/login-view";',
    );
    expect(fx.read("src/routes/paths.ts")).toContain('login: "/login"');
  });

  it("aborts on a duplicate feature without changing files", async () => {
    await runFeature("auth", { yes: true });
    const before = fx.read("src/features/auth/view/auth-view.tsx");

    const result = await runFeature("auth", { page: "other", route: "/other", pathKey: "other", yes: true });
    expect(result).toBe("empty");
    expect(fx.read("src/features/auth/view/auth-view.tsx")).toBe(before);
    expect(fx.exists("src/app/other/page.tsx")).toBe(false);
  });

  it("writes zero files on --dry-run", async () => {
    const result = await runFeature("billing", { dryRun: true });
    expect(result).toBe("dry-run");
    expect(fx.exists("src/features/billing")).toBe(false);
    expect(fx.read("src/routes/paths.ts")).not.toContain("billing");
  });

  it("writes zero files when the confirmation is declined", async () => {
    const result = await runFeature("orders", { yes: false });
    expect(result).toBe("cancelled");
    expect(fx.exists("src/features/orders")).toBe(false);
  });
});

describe("gen page", () => {
  it("adds a page to an existing feature and registers the route", async () => {
    await runFeature("auth", { page: "login", route: "/login", pathKey: "login", yes: true });
    const result = await runPage("forgot-password", {
      feature: "auth",
      route: "/forgot-password",
      pathKey: "forgotPassword",
      yes: true,
    });
    expect(result).toBe("written");
    expect(fx.exists("src/app/forgot-password/page.tsx")).toBe(true);
    expect(fx.read("src/features/auth/index.ts")).toContain("ForgotPasswordView");
    expect(fx.read("src/routes/paths.ts")).toContain('forgotPassword: "/forgot-password"');
  });

  it("generates a path function for a dynamic route", async () => {
    await runFeature("projects", {
      page: "list",
      route: "/projects",
      pathKey: "projects.list",
      yes: true,
    });
    const result = await runPage("project-detail", {
      feature: "projects",
      route: "/projects/[projectId]",
      pathKey: "projects.detail",
      yes: true,
    });
    expect(result).toBe("written");
    const page = fx.read("src/app/projects/[projectId]/page.tsx");
    expect(page).toContain("await params");
    expect(page).toContain("projectId");
    expect(fx.read("src/routes/paths.ts")).toContain(
      "detail: (projectId: string) => `/projects/${projectId}`",
    );
  });
});

describe("gen component", () => {
  it("creates a feature component and updates the barrel", async () => {
    await runFeature("auth", { yes: true });
    await runComponent("login-form", { feature: "auth", yes: true });
    expect(fx.exists("src/features/auth/components/login-form.tsx")).toBe(true);
    expect(fx.read("src/features/auth/components/index.ts")).toContain("LoginForm");
  });

  it("creates a shared component", async () => {
    await runComponent("app-logo", { shared: true, yes: true });
    expect(fx.exists("src/components/app-logo.tsx")).toBe(true);
    expect(fx.read("src/components/index.ts")).toContain("AppLogo");
  });
});

describe("transaction rollback", () => {
  it("restores modified files and removes created files on failure", async () => {
    fx.write("src/keep.ts", "original\n");

    await expect(
      executePlan(
        [
          { kind: "modify", path: "src/keep.ts", content: "changed\n" },
          { kind: "create", path: "src/new.ts", content: "new\n" },
        ],
        { failAt: 1 },
      ),
    ).rejects.toThrow();

    expect(fx.read("src/keep.ts")).toBe("original\n");
    expect(fx.exists("src/new.ts")).toBe(false);
  });
});
