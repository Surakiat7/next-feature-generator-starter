import {
  constantsFileName,
  constantsObjectName,
  contentComponentName,
  contentFileName,
  contentPropsTypeName,
  stateHookFileName,
  stateHookName,
  toTitle,
  typesFileName,
  viewComponentName,
} from "../../core/naming";

const SUBFOLDER_COMMENT: Record<string, string> = {
  components: "// Feature-owned UI components.",
  hooks: "// Feature-owned React hooks.",
  lib: "// Feature-owned utilities and business logic.",
  types: "// Feature-owned types.",
};

/** Minimal barrel for an empty feature subfolder. */
export function subBarrel(folder: keyof typeof SUBFOLDER_COMMENT | string): string {
  const comment = SUBFOLDER_COMMENT[folder] ?? "// Feature module.";
  return `${comment}\nexport {};\n`;
}

/** Initial feature root barrel (before any page/view export is added). */
export function featureRootIndex(): string {
  return `// Public API of this feature. Only export what other modules may import.\nexport {};\n`;
}

/** Generic feature sample types file. */
export function typesFile(feature: string): string {
  const props = contentPropsTypeName(feature);
  return `export type ${props} = {
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
};
`;
}

/** Generic feature sample constants file. */
export function constantsFile(feature: string): string {
  const objectName = constantsObjectName(feature);
  const title = toTitle(feature);
  return `export const ${objectName} = {
  title: "${title}",
  description: "${title} feature is ready to implement.",
} as const;
`;
}

/** Generic feature sample state hook file. */
export function stateHookFile(feature: string): string {
  const hook = stateHookName(feature);
  return `"use client";

import { useState } from "react";

export function ${hook}() {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleToggle() {
    setIsExpanded((current) => !current);
  }

  return {
    isExpanded,
    handleToggle,
  };
}
`;
}

/** Generic feature sample content component file. */
export function contentComponentFile(feature: string): string {
  const component = contentComponentName(feature);
  const props = contentPropsTypeName(feature);
  const file = typesFileName(feature);
  return `import type { ${props} } from "../types/${file.replace(/\.ts$/, "")}";

export function ${component}({
  title,
  description,
  isExpanded,
  onToggle,
}: ${props}) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        {isExpanded ? "Hide example" : "Show example"}
      </button>

      {isExpanded && (
        <div className="rounded-md border p-4">
          Replace this sample with your feature implementation.
        </div>
      )}
    </section>
  );
}
`;
}

/** Generic feature sample view file (composes hook, constants, content). */
export function viewFile(feature: string, page: string): string {
  const view = viewComponentName(page);
  const content = contentComponentName(feature);
  const hook = stateHookName(feature);
  const meta = constantsObjectName(feature);
  return `"use client";

import { ${content} } from "../components";
import { ${hook} } from "../hooks";
import { ${meta} } from "../lib";

export function ${view}() {
  const { isExpanded, handleToggle } = ${hook}();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <${content}
        title={${meta}.title}
        description={${meta}.description}
        isExpanded={isExpanded}
        onToggle={handleToggle}
      />
    </main>
  );
}
`;
}

/** Barrel export for the generated components folder. */
export function componentsBarrel(feature: string): string {
  const component = contentComponentName(feature);
  const file = contentFileName(feature).replace(/\.tsx$/, "");
  return `// Feature-owned UI components.\nexport { ${component} } from "./${file}";\n`;
}

/** Barrel export for the generated hooks folder. */
export function hooksBarrel(feature: string): string {
  const hook = stateHookName(feature);
  const file = stateHookFileName(feature).replace(/\.ts$/, "");
  return `// Feature-owned React hooks.\nexport { ${hook} } from "./${file}";\n`;
}

/** Barrel export for the generated lib folder. */
export function libBarrel(feature: string): string {
  const objectName = constantsObjectName(feature);
  const file = constantsFileName(feature).replace(/\.ts$/, "");
  return `// Feature-owned utilities and business logic.\nexport { ${objectName} } from "./${file}";\n`;
}

/** Barrel export for the generated types folder. */
export function typesBarrel(feature: string): string {
  const props = contentPropsTypeName(feature);
  const file = typesFileName(feature).replace(/\.ts$/, "");
  return `// Feature-owned types.\nexport type { ${props} } from "./${file}";\n`;
}
