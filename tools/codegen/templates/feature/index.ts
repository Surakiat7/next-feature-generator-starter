/** Template builders for feature scaffolding. */

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
