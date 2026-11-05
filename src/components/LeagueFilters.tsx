import { leagueByName } from "../leagueInfo"
import { LeagueLogo } from "./ui"

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
          className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 text-[13px] font-semibold transition-colors ${
            leagueByName[l] ? "pl-1.5 pr-4" : "px-4"
          } ${
            active === l
              ? "border-volt bg-volt text-ink"
              : "border-white/10 bg-white/[0.03] text-mut hover:border-volt/40 hover:text-fg"
          }`}
        >
          {leagueByName[l] && <LeagueLogo src={leagueByName[l].logo} accent={leagueByName[l].accent} size={22} label="" />}
          {l}
        </button>
      ))}
    </div>
  )
}
