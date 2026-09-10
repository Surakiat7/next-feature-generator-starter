import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findHardcodedRoutes } from "../commands/routes-check";
import { setupFixture, type Fixture } from "./helpers";

let fx: Fixture;
beforeEach(() => {
  fx = setupFixture();
});
afterEach(() => {
  fx.cleanup();
});

describe("routes check", () => {
  it("detects Link, router.push and redirect literals but ignores external URLs", async () => {
    fx.write(
      "src/features/demo/bad.tsx",
      `import Link from "next/link";
import { redirect } from "next/navigation";

export function Bad({ router }: { router: { push: (h: string) => void } }) {
  redirect("/login");
  router.push("/projects");
  return (
    <div>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="https://example.com">External</Link>
      <a href="/not-a-link">plain anchor</a>
    </div>
  );
}
`,
    );

    const findings = await findHardcodedRoutes();
    const values = findings.map((f) => f.value).sort();

    expect(values).toContain("/login");
    expect(values).toContain("/projects");
    expect(values).toContain("/dashboard");
    expect(values).not.toContain("https://example.com");
    // Plain <a> is not a <Link>, so it is ignored.
    expect(values).not.toContain("/not-a-link");
  });

  it("ignores the paths.ts registry itself", async () => {
    fx.write("src/routes/paths.ts", `export const paths = { home: "/", login: "/login" } as const;\n`);
    const findings = await findHardcodedRoutes();
    expect(findings.every((f) => !f.file.endsWith("paths.ts"))).toBe(true);
  });
});
