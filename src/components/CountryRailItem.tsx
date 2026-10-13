import { useEffect, useState } from "react"
import { fetchCountryLeagues, type RemoteLeague } from "./CountryExplorer"

const leagueCache = new Map<string, RemoteLeague[]>()

export default function CountryRailItem({
  name,
  flag,
  sport,
  expanded,
  activeLeagueId,
  pinnedIds,
  onToggle,
  onSelect,
  onPin,
}: {
  name: string
  flag: string
  sport: string
  expanded: boolean
  activeLeagueId: string | null
  pinnedIds: Set<string>
  onToggle: () => void
  onSelect: (league: RemoteLeague) => void
  onPin: (league: RemoteLeague) => void
}) {
  const [leagues, setLeagues] = useState<RemoteLeague[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const key = `${name}:${sport}`
    const cached = leagueCache.get(key)
    if (cached) {
      setLeagues(cached)
      setLoading(false)
      setFailed(false)
      return
    }
    const controller = new AbortController()
    setLeagues([])
    setLoading(true)
    setFailed(false)
    fetchCountryLeagues(name, sport, controller.signal)
      .then((available) => {
        leagueCache.set(key, available)
        setLeagues(available)
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setFailed(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [expanded, name, sport])

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors ${
          expanded ? "bg-panel text-fg" : "text-fg/80 hover:bg-panel/60 hover:text-fg"
        }`}
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-md bg-white/[0.06] text-[12px] ring-1 ring-white/10">
          {flag}
        </span>
        <span className="min-w-0 flex-1 truncate">{name}</span>
        <span className={`text-[10px] text-mut transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {expanded && (
        <div className="ml-4 border-l border-line pl-2">
          {loading && <span className="block px-2 py-2 text-[11px] text-mut">Loading leagues…</span>}
          {failed && <span className="block px-2 py-2 text-[11px] text-live">Unable to load leagues.</span>}
          {!loading && !failed && leagues.length === 0 && <span className="block px-2 py-2 text-[11px] text-mut">No leagues found.</span>}
          {leagues.map((league) => {
            const pinned = pinnedIds.has(league.idLeague)
            return (
              <div
                key={league.idLeague}
                className={`group flex items-center rounded-lg ${activeLeagueId === league.idLeague ? "bg-volt/10" : "hover:bg-panel/60"}`}
              >
                <button
                  onClick={() => onSelect(league)}
                  className={`min-w-0 flex-1 truncate px-2 py-1.5 text-left text-[12px] ${
                    activeLeagueId === league.idLeague ? "font-semibold text-volt" : "text-fg/80 group-hover:text-fg"
                  }`}
                >
                  {league.strLeague}
                </button>
                <button
                  onClick={() => onPin(league)}
                  aria-label={`${pinned ? "Unpin" : "Pin"} ${league.strLeague}`}
                  aria-pressed={pinned}
                  className={`grid h-7 w-7 shrink-0 place-items-center transition-colors ${
                    pinned ? "text-volt" : "text-mut-2 hover:text-volt"
                  }`}
                >
                  <PinIcon filled={pinned} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PinIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M15 4.5 19.5 9l-3 1.5-3 3L12 18l-1.5-1.5L6 21l-1.5-1.5 4.5-4.5L7.5 13l3-3L12 6.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
