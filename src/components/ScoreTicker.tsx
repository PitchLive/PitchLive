import { matches, teams } from "../data"

export default function ScoreTicker({ onOpen }: { onOpen: (id: string) => void }) {
  const live = matches.filter((m) => m.status === "LIVE" || m.status === "HT")
  const row = [...live, ...live]
  return (
    <div className="border-b border-line bg-ink-2/80">
      <div className="mx-auto flex max-w-[1400px] items-center">
        <span className="flex shrink-0 items-center gap-1.5 border-r border-line px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-live">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> Live
        </span>
        <div className="overflow-hidden">
          <div className="ticker-track flex w-max">
            {row.map((m, i) => (
              <button
                key={m.id + i}
                onClick={() => onOpen(m.id)}
                className="flex shrink-0 items-center gap-2 border-r border-line/60 px-4 py-2 text-[13px] hover:bg-panel/60"
              >
                <span className="font-semibold text-fg/80">{teams[m.home].short}</span>
                <span className="font-mono-num font-bold text-volt">
                  {m.homeScore}–{m.awayScore}
                </span>
                <span className="font-semibold text-fg/80">{teams[m.away].short}</span>
                <span className="font-mono-num text-[11px] text-live">{m.status === "HT" ? "HT" : `${m.minute}'`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
