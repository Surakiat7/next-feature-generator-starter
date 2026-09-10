import { capitalCase } from "change-case";
import type { ParsedRoute } from "../../core/ast";
import {
  pageComponentName,
  toKebab,
  viewComponentName,
} from "../../core/naming";

/** The feature view component (`<page>-view.tsx`). */
export function viewFile(page: string, route: ParsedRoute): string {
  const name = viewComponentName(page);
  const title = capitalCase(page);

  if (route.isDynamic) {
    const propsType = route.params.map((p) => `${p}: string`).join("; ");
    const propsDestructure = route.params.join(", ");
    return `export function ${name}({ ${propsDestructure} }: { ${propsType} }) {
  return (
    <main>
      <h1>${title}</h1>
    </main>
  );
}
`;
  }

  return `export function ${name}() {
  return (
    <main>
      <h1>${title}</h1>
    </main>
  );
}
`;
}

/**
 * The thin App Router page that composes the feature view. Uses the Next 16
 * async-params convention for dynamic routes.
 */
export function pageFile(options: {
  feature: string;
  page: string;
  route: ParsedRoute;
  pathAlias: string;
}): string {
  const { feature, page, route, pathAlias } = options;
  const view = viewComponentName(page);
  const pageName = pageComponentName(page);
  const importPath = `${pathAlias}/features/${toKebab(feature)}`;

  if (route.isDynamic) {
    const typeMembers = route.params.map((p) => `${p}: string`).join("; ");
    const awaited = route.params.join(", ");
    const props = route.params.map((p) => `${p}={${p}}`).join(" ");
    return `import { ${view} } from "${importPath}";

export default async function ${pageName}({
  params,
}: {
  params: Promise<{ ${typeMembers} }>;
}) {
  const { ${awaited} } = await params;
  return <${view} ${props} />;
}
`;
  }

  return `import { ${view} } from "${importPath}";

export default function ${pageName}() {
  return <${view} />;
}
`;
}

/** The relative import specifier a page uses to reach the feature barrel. */
export function viewExportStatement(page: string): {
  moduleSpecifier: string;
  name: string;
} {
  return {
    moduleSpecifier: `./view/${toKebab(page)}-view`,
    name: viewComponentName(page),
  };
}
