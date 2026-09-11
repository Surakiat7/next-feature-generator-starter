interface SimulatedTerminalProps {
  command: string;
  lines: string[];
}

export function SimulatedTerminal({ command, lines }: SimulatedTerminalProps) {
  return (
    <div className="rounded-xl border border-zinc-700/70 bg-zinc-950 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-800/70 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Simulated Terminal
        </span>
      </div>

      <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300/90">
        <div className="mb-3 select-none rounded-md border border-zinc-800/60 bg-zinc-900/60 px-3 py-2 text-zinc-100">
          <span className="mr-2 text-emerald-500">$</span>
          {command}
        </div>

        <pre className="whitespace-pre">
          {lines.map((line, i) => (
            <code
              key={`${line}-${i}`}
              className="block"
              style={{
                color: line.startsWith("✓") ? "#34d399" : line.startsWith("!") ? "#fbbf24" : line.startsWith("✗") ? "#f87171" : undefined,
              }}
            >
              {line || " "}
            </code>
          ))}
        </pre>
      </div>
    </div>
  );
}
