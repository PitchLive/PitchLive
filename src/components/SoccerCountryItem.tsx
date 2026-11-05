import { useEffect, useState } from "react"
import { api, type CatalogLeague } from "../api/client"
import { registerLeague } from "../leagueInfo"
import { LeagueLogo } from "./ui"

const cache = new Map<string, CatalogLeague[]>()

/** A country in the Live Scores menu: expands to its competitions; each opens its league page. */
export default function SoccerCountryItem({
  name,
  flag,
  covered,
  expanded,
  onToggle,
  onLeague,
}: {
  name: string
  flag: React.ReactNode
  /** Number of competitions we have for this country (0 = none, undefined = unknown yet). */
  covered?: number
  expanded: boolean
  onToggle: () => void
  onLeague: (league: string) => void
}) {
  const [leagues, setLeagues] = useState<CatalogLeague[] | null>(cache.get(name) ?? null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!expanded || cache.has(name) || covered === 0) return
    let cancelled = false
    setFailed(false)
    api
      .countryLeagues(name)
      .then(({ leagues: list }) => {
        cache.set(name, list)
        if (!cancelled) setLeagues(list)
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [expanded, name, covered])

  const list = leagues ?? cache.get(name) ?? null

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors ${
          expanded ? "bg-panel text-fg" : "text-fg/80 hover:bg-panel/60 hover:text-fg"
        }`}
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-md bg-white/[0.06] text-[12px] ring-1 ring-white/10">{flag}</span>
        <span className="min-w-0 flex-1 truncate">{name}</span>
        {!!covered && <span className="shrink-0 text-[10px] font-semibold text-mut-2">{covered}</span>}
        <span className={`text-[10px] text-mut transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {expanded && (
        <div className="ml-4 border-l border-line pl-2">
          {covered === 0 && <span className="block px-2 py-2 text-[11px] text-mut">No competitions from {name} are covered yet.</span>}
          {covered !== 0 && !list && !failed && <span className="block px-2 py-2 text-[11px] text-mut">Loading competitions…</span>}
          {failed && <span className="block px-2 py-2 text-[11px] text-live">Couldn&rsquo;t load competitions. Try again shortly.</span>}
          {list?.length === 0 && <span className="block px-2 py-2 text-[11px] text-mut">No current competitions.</span>}
          {list?.map((l) => (
            <button
              key={l.slug}
              onClick={() => onLeague(registerLeague({ ...l, logo: l.logo }).name)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] text-fg/80 hover:bg-panel/60 hover:text-fg"
            >
              <LeagueLogo src={l.logo ?? undefined} accent="#3d7bff" size={18} label="" />
              <span className="min-w-0 flex-1 truncate">{l.name}</span>
              {l.women && <span className="shrink-0 rounded bg-white/[0.06] px-1 text-[9px] font-bold text-mut">W</span>}
              {l.cup && <span className="shrink-0 rounded bg-white/[0.06] px-1 text-[9px] font-bold text-mut">CUP</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
