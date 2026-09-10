import { rmSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runDoctor } from "../commands/doctor";
import { setupFixture, type Fixture } from "./helpers";

let fx: Fixture;
beforeEach(() => {
  fx = setupFixture();
});
afterEach(() => {
  fx.cleanup();
});

describe("gen doctor", () => {
  it("reports zero errors for a valid starter", async () => {
    const errors = await runDoctor();
    expect(errors).toBe(0);
  });

  it("reports an error when the route registry is missing", async () => {
    rmSync(path.join(fx.dir, "src/routes/paths.ts"));
    const errors = await runDoctor();
    expect(errors).toBeGreaterThan(0);
  });
});
