interface SimulatedFileTreeProps {
  lines: string[];
}

export function SimulatedFileTree({ lines }: SimulatedFileTreeProps) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-4 font-mono text-xs text-zinc-300 backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        example preview
      </p>
      <pre className="overflow-x-auto whitespace-pre text-zinc-300/90">
        {lines.map((line, i) => (
          <code key={`${line}-${i}`} className="block">
            {line}
          </code>
        ))}
      </pre>
    </div>
  );
}
