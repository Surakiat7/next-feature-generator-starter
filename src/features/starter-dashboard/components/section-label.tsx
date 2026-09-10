export function SectionLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      {sub && <span className="text-[11px] text-zinc-400">{sub}</span>}
    </div>
  );
}
