import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export interface Fixture {
  dir: string;
  read(rel: string): string;
  exists(rel: string): boolean;
  write(rel: string, content: string): void;
  cleanup(): void;
}

const PATHS_TS = `export const paths = {
  home: "/",
} as const;
`;

const LAYOUT_TSX = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Feature Starter",
  description: "Feature-based Next.js starter with built-in code generation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
`;

const PAGE_TSX = `export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Next Feature Starter</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Feature-based Next.js starter with built-in code generation.
      </p>
    </main>
  );
}
`;

const GLOBALS_CSS = `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
}
`;

const NEXT_CONFIG = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`;

const FILES: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "fixture",
      version: "0.0.0",
      private: true,
      dependencies: { next: "16.3.4", react: "19.2.8", "react-dom": "19.2.8" },
    },
    null,
    2,
  ),
  "next.config.ts": NEXT_CONFIG,
  "tsconfig.json": JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }, null, 2),
  "src/routes/paths.ts": PATHS_TS,
  "src/routes/index.ts": `export { paths } from "./paths";\n`,
  "src/app/layout.tsx": LAYOUT_TSX,
  "src/app/page.tsx": PAGE_TSX,
  "src/app/globals.css": GLOBALS_CSS,
  "src/components/index.ts": "export {};\n",
  "src/providers/index.ts": "export {};\n",
  "src/features/.gitkeep": "",
};

let originalCwd = "";

/** Create an isolated temp repo fixture and chdir into it. */
export function setupFixture(): Fixture {
  originalCwd = process.cwd();
  const dir = mkdtempSync(path.join(tmpdir(), "codegen-fx-"));

  for (const [rel, content] of Object.entries(FILES)) {
    const abs = path.join(dir, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }

  process.chdir(dir);

  return {
    dir,
    read: (rel) => readFileSync(path.join(dir, rel), "utf8"),
    exists: (rel) => existsSync(path.join(dir, rel)),
    write: (rel, content) => {
      const abs = path.join(dir, rel);
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    },
    cleanup: () => {
      process.chdir(originalCwd);
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
