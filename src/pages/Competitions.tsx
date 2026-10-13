import { useState } from "react"
import { teams, leagues, type Standing } from "../data"
import { leagueStandings } from "../leagueStandings"
import { Crest } from "../components/ui"
import bundesligaLogo from "../imports/logos/bundesliga.svg"
import laLigaLogo from "../imports/logos/la-liga.svg"
import ligue1Logo from "../imports/logos/ligue-1.svg"
import serieALogo from "../imports/logos/serie-a.svg"
import premierleagueLogo from "../imports/logos/english-premier-league.svg"
import eflleagueLogo from "../imports/logos/efl-championship.svg"
import uefachampionsleagueLogo from "../imports/logos/uefa-champions-league.svg"


type SortKey = "pts" | "p" | "gf" | "ga" | "gd" | "w" | "d" | "l"

const COMPETITION_LOGOS: Record<string, string> = {
  Bundesliga: bundesligaLogo,
  "La Liga": laLigaLogo,
  "Ligue 1": ligue1Logo,
  "Serie A": serieALogo,
  "Premier League":premierleagueLogo,
  "EFL Championship":eflleagueLogo,
  "UEFA Champions League":uefachampionsleagueLogo
}

export default function Competitions({ onTeam }: { onTeam: (id: string) => void }) {
  const [league, setLeague] = useState(leagues[0])
  const [sort, setSort] = useState<SortKey>("pts")

  const pts = (s: Standing) => s.pts ?? s.w * 3 + s.d
  const gd = (s: Standing) => s.gf - s.ga
  const rows = [...(leagueStandings[league] ?? [])].sort((a, b) => {
    switch (sort) {
      case "p":
        return b.p - a.p
      case "gf":
        return b.gf - a.gf
      case "ga":
        return a.ga - b.ga
      case "gd":
        return gd(b) - gd(a)
      case "w":
        return b.w - a.w
      case "d":
        return b.d - a.d
      case "l":
        return a.l - b.l
      default:
        return pts(b) - pts(a) || gd(b) - gd(a)
    }
  })

  const cols: { key: SortKey | "team"; label: string; sortable?: boolean }[] = [
    { key: "team", label: "Club" },
    { key: "p", label: "P", sortable: true },
    { key: "w", label: "W", sortable: true },
    { key: "d", label: "D", sortable: true },
    { key: "l", label: "L", sortable: true },
    { key: "gf", label: "GF", sortable: true },
    { key: "ga", label: "GA", sortable: true },
    { key: "gd", label: "GD", sortable: true },
    { key: "pts", label: "PTS", sortable: true },
  ]

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {COMPETITION_LOGOS[league] && (
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-panel">
              <img src={COMPETITION_LOGOS[league]} alt="" className="h-8 w-8 object-contain" />
            </span>
          )}
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">{league}</h1>
            <p className="text-sm text-mut">Standings, form &amp; qualification</p>
          </div>
        </div>
        <select
          value={league}
          onChange={(e) => {
            setLeague(e.target.value)
            setSort("pts")
          }}
          className="rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-fg focus:border-volt/50 focus:outline-none"
        >
          {leagues.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wider text-mut-2">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className={`px-3 py-3 font-semibold ${c.key === "team" ? "text-left" : "text-center"} ${
                      c.sortable ? "cursor-pointer select-none hover:text-fg" : ""
                    } ${sort === c.key ? "text-volt" : ""}`}
                    onClick={() => c.sortable && setSort(c.key as SortKey)}
                  >
                    {c.label}
                    {c.sortable && sort === c.key && <span className="ml-1">▾</span>}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Form</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const pos = i + 1
                const zone = league === "UEFA Champions League"
                  ? pos <= 8
                    ? "bg-volt"
                    : pos <= 24
                      ? "bg-cobalt"
                      : "bg-live"
                  : pos <= 4
                    ? "bg-volt"
                    : pos <= 6
                      ? "bg-cobalt"
                      : pos >= rows.length - 2
                        ? "bg-live"
                        : "bg-line"
                return (
                  <tr key={s.team} className="border-b border-line-soft last:border-0 transition-colors hover:bg-panel-2">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className={`h-4 w-1 rounded-full ${zone}`} />
                        <span className="font-mono-num font-semibold text-mut">{pos}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => onTeam(s.team)}
                        className="flex items-center gap-2.5 text-left hover:text-volt"
                      >
                        <Crest id={s.team} size={26} />
                        <span className="font-semibold text-fg group-hover:text-volt">{teams[s.team].name}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{s.p}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{s.w}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{s.d}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{s.l}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{s.gf}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{s.ga}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-mut">{gd(s) > 0 ? `+${gd(s)}` : gd(s)}</td>
                    <td className="px-3 py-3 text-center font-mono-num text-base font-bold text-fg">{pts(s)}</td>
                    <td className="px-4 py-3">
                      <span className="flex justify-end gap-1">
                        {s.form.length === 0 && <span className="text-mut-2">—</span>}
                        {s.form.map((f, j) => (
                          <span
                            key={j}
                            className={`grid h-5 w-5 place-items-center rounded text-[10px] font-bold ${
                              f === "W"
                                ? "bg-volt/20 text-volt"
                                : f === "D"
                                ? "bg-line text-mut"
                                : "bg-live/20 text-live"
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-4 border-t border-line px-4 py-3 text-[11px] text-mut">
          <Legend color="bg-volt" label="Continental Cup" />
          <Legend color="bg-cobalt" label="Continental Qualifiers" />
          <Legend color="bg-live" label="Relegation" />
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}
    </span>
  )
}
