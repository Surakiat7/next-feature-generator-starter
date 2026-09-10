import { describe, expect, it } from "vitest";
import {
  addNamedExport,
  addRouteKey,
  collectStaticRoutes,
  hasRouteKey,
  parseRoute,
  removeNamedExport,
} from "../core/ast";

const BASE_PATHS = `export const paths = {
  home: "/",
} as const;
`;

describe("parseRoute", () => {
  it("treats a plain route as a string literal", () => {
    const r = parseRoute("/login");
    expect(r.isDynamic).toBe(false);
    expect(r.initializer).toBe('"/login"');
  });

  it("builds a function for a dynamic segment", () => {
    const r = parseRoute("/projects/[projectId]");
    expect(r.isDynamic).toBe(true);
    expect(r.params).toEqual(["projectId"]);
    expect(r.initializer).toBe("(projectId: string) => `/projects/${projectId}`");
  });

  it("handles multiple params and catch-all", () => {
    expect(parseRoute("/a/[x]/b/[y]").initializer).toBe(
      "(x: string, y: string) => `/a/${x}/b/${y}`",
    );
    expect(parseRoute("/blog/[...slug]").initializer).toBe(
      '(slug: string[]) => `/blog/${slug.join("/")}`',
    );
  });
});

describe("addRouteKey", () => {
  it("adds a top-level static key", () => {
    const { source, added } = addRouteKey(BASE_PATHS, "login", '"/login"');
    expect(added).toBe(true);
    expect(source).toContain('login: "/login"');
    expect(hasRouteKey(source, "login")).toBe(true);
  });

  it("creates nested objects for dotted keys", () => {
    const { source } = addRouteKey(
      BASE_PATHS,
      "projects.detail",
      "(projectId: string) => `/projects/${projectId}`",
    );
    expect(source).toContain("projects:");
    expect(source).toContain("detail:");
    expect(hasRouteKey(source, "projects.detail")).toBe(true);
  });

  it("is idempotent for an existing key", () => {
    const once = addRouteKey(BASE_PATHS, "login", '"/login"').source;
    const twice = addRouteKey(once, "login", '"/login"');
    expect(twice.added).toBe(false);
    expect(twice.source).toBe(once);
  });

  it("collects static routes", () => {
    const { source } = addRouteKey(BASE_PATHS, "login", '"/login"');
    expect(collectStaticRoutes(source)).toEqual(expect.arrayContaining(["/", "/login"]));
  });
});

describe("addNamedExport / removeNamedExport", () => {
  it("adds an export and drops the placeholder", () => {
    const { source, added } = addNamedExport("export {};\n", "./view/login-view", "LoginView");
    expect(added).toBe(true);
    expect(source).toContain('export { LoginView } from "./view/login-view";');
    expect(source).not.toContain("export {};");
  });

  it("does not duplicate an existing export", () => {
    const first = addNamedExport("export {};\n", "./a", "A").source;
    const second = addNamedExport(first, "./a", "A");
    expect(second.added).toBe(false);
  });

  it("removes an export and restores the placeholder when empty", () => {
    const withExport = addNamedExport("export {};\n", "./a", "A").source;
    const removed = removeNamedExport(withExport, "A");
    expect(removed.added).toBe(true);
    expect(removed.source).toContain("export {};");
  });
});
