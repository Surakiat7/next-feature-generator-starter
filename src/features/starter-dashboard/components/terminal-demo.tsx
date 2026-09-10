import type { TerminalLine } from "../types/generator-demo.types";

function Line({ line }: { line: TerminalLine }) {
  if (line.kind === "run") {
    return (
      <div data-term-line className="text-zinc-100">
        <span className="select-none text-emerald-400">$ </span>
        {line.text}
      </div>
    );
  }
  if (line.kind === "ok") {
    return (
      <div data-term-line className="text-zinc-300">
        <span className="select-none text-emerald-400">✓ </span>
        {line.text}
      </div>
    );
  }
  return (
    <div data-term-line className="text-zinc-400">
      {line.text}
    </div>
  );
}

export function TerminalDemo({ lines, running }: { lines: TerminalLine[]; running: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="ml-2 font-mono text-[11px] text-zinc-500">terminal — simulated</span>
      </div>
      <div className="min-h-[210px] space-y-1 p-3 font-mono text-xs leading-6">
        {lines.length === 0 ? (
          <div className="text-zinc-600">
            <span className="select-none text-emerald-400">$ </span>
            <span className="animate-pulse">▍</span>
          </div>
        ) : (
          lines.map((line, i) => <Line key={i} line={line} />)
        )}
        {running && lines.length > 0 && (
          <div className="text-zinc-600">
            <span className="animate-pulse">▍</span>
          </div>
        )}
      </div>
    </div>
  );
}
