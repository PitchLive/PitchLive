const ALL = "All"

export default function LeagueFilters({
  leagues,
  active,
  onChange,
}: {
  leagues: string[]
  active: string
  onChange: (l: string) => void
}) {
  const items = [ALL, ...leagues]
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {items.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            active === l
              ? "border-volt bg-volt text-ink"
              : "border-line bg-panel/50 text-mut hover:border-volt/40 hover:text-fg"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
