import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tools/codegen/tests/**/*.test.ts"],
    environment: "node",
    // Commands use process.chdir into per-test fixtures; keep files isolated.
    fileParallelism: false,
    globals: false,
  },
});
