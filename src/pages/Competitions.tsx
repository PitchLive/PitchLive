import { useMemo, useState } from "react"
import { teams, type Standing } from "../data"
import { Crest, FormPills, LeagueLogo } from "../components/ui"
import {
  REGIONS,
  clubsIn,
  detailsFor,
  leagueByName,
  leagueCatalog,
  positionIn,
  seasonLabel,
  tableFor,
  type LeagueInfo,
  type Region,
} from "../leagueInfo"

type SortKey = "pts" | "p" | "gf" | "ga" | "gd" | "w" | "d" | "l"
type Tab = "table" | "clubs"

const pts = (s: Standing) => s.pts ?? s.w * 3 + s.d
const gd = (s: Standing) => s.gf - s.ga

export default function Competitions({
  onTeam,
  league,
  setLeague,
}: {
  onTeam: (id: string) => void
  league: string | null
  setLeague: (l: string | null) => void
}) {
  const info = league ? leagueByName[league] : null
  return info ? (
    <LeagueView info={info} onTeam={onTeam} back={() => setLeague(null)} switchTo={setLeague} />
  ) : (
    <LeagueDirectory open={setLeague} />
  )
}

/* ───────────────────────────── Directory ───────────────────────────── */

function LeagueDirectory({ open }: { open: (l: string) => void }) {
  const [q, setQ] = useState("")
  const [region, setRegion] = useState<Region | "All">("All")

  const totalClubs = new Set(leagueCatalog.flatMap((l) => clubsIn(l.name))).size
  const filtered = leagueCatalog.filter(
    (l) =>
      (region === "All" || l.region === region) &&
      (l.name + l.country + l.short).toLowerCase().includes(q.trim().toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-volt/25 bg-volt/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-volt">
            Season {seasonLabel("Premier League")}
          </span>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
            <span className="text-gradient">Competitions</span>
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-mut">
            Live tables, form and club profiles across {leagueCatalog.length} major competitions and {totalClubs} clubs.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-2/80 px-4 py-3 focus-within:border-volt/50 lg:w-80">
          <SearchIcon />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search league or country…"
            className="w-full bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none"
          />
        </div>
      </header>

      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["All", ...REGIONS] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
              region === r ? "bg-fg text-ink" : "border border-white/10 bg-white/[0.03] text-mut hover:text-fg"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="card rounded-2xl px-6 py-14 text-center text-sm text-mut">No competitions match “{q}”.</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l, i) => (
          <div key={l.name} className="rise" style={{ animationDelay: `${i * 30}ms` }}>
            <LeagueCard info={l} onOpen={() => open(l.name)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function LeagueCard({ info, onOpen }: { info: LeagueInfo; onOpen: () => void }) {
  const groups = tableFor(info.name)
  const leaders = groups.map((g) => g.rows[0]).filter(Boolean)
  const top = groups[0]?.rows.slice(0, 3) ?? []
  const clubs = clubsIn(info.name).length

  return (
    <button onClick={onOpen} className="card card-hover group relative block h-full w-full overflow-hidden rounded-3xl p-5 text-left">
      <span
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-45"
        style={{ background: info.accent }}
      />
      <div className="relative flex items-start gap-4">
        <LeagueLogo src={info.logo} accent={info.accent} size={56} label={info.short} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-mut">{info.code}</span>
            <span className="truncate text-[12px] text-mut">{info.country}</span>
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-extrabold tracking-tight">{info.name}</h3>
          <p className="text-[12px] text-mut-2">
            {clubs} clubs · Est. {info.founded}
          </p>
        </div>
        <Arrow />
      </div>

      <div className="relative mt-5 space-y-1.5">
        {top.map((r, i) => (
          <div key={r.team} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
            <span className={`w-4 font-mono-num text-[12px] font-bold ${i === 0 ? "text-volt" : "text-mut-2"}`}>{i + 1}</span>
            <Crest id={r.team} size={20} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-fg/90">{teams[r.team]?.name}</span>
            <span className="font-mono-num text-[13px] font-bold text-fg">{pts(r)}</span>
          </div>
        ))}
      </div>

      {leaders.length > 1 && (
        <p className="relative mt-3 text-[11px] text-mut-2">
          {groups.length} groups · leaders {leaders.map((r) => teams[r.team]?.short).join(", ")}
        </p>
      )}
    </button>
  )
}

/* ───────────────────────────── League view ───────────────────────────── */

function LeagueView({
  info,
  onTeam,
  back,
  switchTo,
}: {
  info: LeagueInfo
  onTeam: (id: string) => void
  back: () => void
  switchTo: (l: string) => void
}) {
  const [tab, setTab] = useState<Tab>("table")
  const groups = tableFor(info.name)
  const clubs = clubsIn(info.name)
  const leader = groups[0]?.rows[0]
  const totalGoals = Math.round(groups.reduce((a, g) => a + g.rows.reduce((b, r) => b + r.gf, 0), 0) / 2)
  const matchesPlayed = Math.round(groups.reduce((a, g) => a + g.rows.reduce((b, r) => b + r.p, 0), 0) / 2)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={back} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-mut hover:text-fg">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All competitions
        </button>
        <div className="no-scrollbar ml-auto flex gap-1.5 overflow-x-auto">
          {leagueCatalog.map((l) => (
            <button
              key={l.name}
              title={l.name}
              onClick={() => switchTo(l.name)}
              className={`shrink-0 rounded-xl p-0.5 transition-all ${l.name === info.name ? "ring-2 ring-volt" : "opacity-60 hover:opacity-100"}`}
            >
              <LeagueLogo src={l.logo} accent={l.accent} size={32} label={l.short} />
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="card relative overflow-hidden rounded-3xl">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(700px 300px at 0% 0%, ${info.accent}40, transparent 70%), radial-gradient(500px 260px at 100% 100%, ${info.accent}1f, transparent 70%)` }}
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-5">
            <LeagueLogo src={info.logo} accent={info.accent} size={88} label={info.short} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-mut">
                <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold tracking-wider">{info.code}</span>
                {info.country}
                <span className="text-mut-2">·</span>
                Season {seasonLabel(info.name)}
              </div>
              <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-5xl">{info.name}</h1>
              <p className="mt-2 max-w-xl text-sm text-mut">{info.blurb}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            <HeroStat label="Clubs" value={clubs.length} />
            <HeroStat label="Founded" value={info.founded} />
            <HeroStat label="Goals" value={totalGoals} />
            <HeroStat label="Goals / game" value={matchesPlayed ? (totalGoals / matchesPlayed).toFixed(2) : "—"} />
          </div>
        </div>
        <div className="relative grid gap-px border-t border-white/[0.06] bg-white/[0.04] sm:grid-cols-2">
          {leader && (
            <button onClick={() => onTeam(leader.team)} className="flex items-center gap-3 bg-panel/80 px-6 py-4 text-left hover:bg-panel-2">
              <Crest id={leader.team} size={34} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-mut-2">{groups.length > 1 ? `${groups[0].group} leader` : "League leader"}</div>
                <div className="font-semibold">
                  {teams[leader.team]?.name} <span className="font-mono-num text-volt">· {pts(leader)} pts</span>
                </div>
              </div>
            </button>
          )}
          <div className="flex items-center gap-3 bg-panel/80 px-6 py-4">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-amber/15 text-amber">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M7 4h10v3a5 5 0 0 1-4 4.9V15h3v2H8v-2h3v-3.1A5 5 0 0 1 7 7V4zm-3 1h2v2a3 3 0 0 1-2-2zm16 0a3 3 0 0 1-2 2V5h2zM7 19h10v2H7z" />
              </svg>
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-mut-2">Most titles</div>
              <div className="font-semibold">{info.recordHolder}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-6 mb-4 inline-flex rounded-2xl border border-white/10 bg-ink-2/80 p-1">
        {(["table", "clubs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-bold capitalize transition-colors ${tab === t ? "bg-volt text-ink" : "text-mut hover:text-fg"}`}
          >
            {t === "table" ? "Standings" : `Clubs (${clubs.length})`}
          </button>
        ))}
      </div>

      {tab === "table" ? (
        <div className="space-y-5">
          {groups.map((g, i) => (
            <StandingsTable key={g.group ?? i} title={g.group} rows={g.rows} onTeam={onTeam} />
          ))}
          {groups.length === 0 && <p className="card rounded-2xl px-6 py-14 text-center text-sm text-mut">No table published yet.</p>}
        </div>
      ) : (
        <ClubGrid league={info.name} clubs={clubs} onTeam={onTeam} />
      )}
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink/40 px-4 py-3 backdrop-blur">
      <div className="font-mono-num text-xl font-extrabold">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-mut-2">{label}</div>
    </div>
  )
}

type Row = Standing & { note?: string; noteColor?: string }

function StandingsTable({ title, rows, onTeam }: { title?: string; rows: Row[]; onTeam: (id: string) => void }) {
  const [sort, setSort] = useState<SortKey>("pts")

  // Keep official order for the default sort; positions always reflect the official table.
  const official = new Map(rows.map((r, i) => [r.team, i + 1]))
  const sorted = useMemo(() => {
    if (sort === "pts") return rows
    const val: Record<SortKey, (s: Standing) => number> = {
      pts,
      p: (s) => s.p,
      w: (s) => s.w,
      d: (s) => s.d,
      l: (s) => -s.l,
      gf: (s) => s.gf,
      ga: (s) => -s.ga,
      gd,
    }
    return [...rows].sort((a, b) => val[sort](b) - val[sort](a))
  }, [rows, sort])

  const notes = [...new Map(rows.filter((r) => r.note).map((r) => [r.note!, r.noteColor])).entries()]

  const cols: { key: SortKey; label: string; hide?: string }[] = [
    { key: "p", label: "P" },
    { key: "w", label: "W", hide: "hidden sm:table-cell" },
    { key: "d", label: "D", hide: "hidden sm:table-cell" },
    { key: "l", label: "L", hide: "hidden sm:table-cell" },
    { key: "gf", label: "GF", hide: "hidden md:table-cell" },
    { key: "ga", label: "GA", hide: "hidden md:table-cell" },
    { key: "gd", label: "GD" },
    { key: "pts", label: "PTS" },
  ]

  return (
    <section className="card overflow-hidden rounded-3xl">
      {title && <h2 className="border-b border-white/[0.06] px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-mut">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-mut-2">
              <th className="w-12 py-3 pl-5 text-left font-semibold">#</th>
              <th className="px-3 py-3 text-left font-semibold">Club</th>
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => setSort(c.key)}
                  className={`cursor-pointer select-none px-2 py-3 text-center font-semibold hover:text-fg ${c.hide ?? ""} ${sort === c.key ? "text-volt" : ""}`}
                >
                  {c.label}
                </th>
              ))}
              <th className="hidden px-5 py-3 text-right font-semibold lg:table-cell">Last 5</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.team} className="group border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]">
                <td className="py-3 pl-5">
                  <span className="flex items-center gap-2.5">
                    <span className="h-5 w-1 rounded-full" style={{ background: s.noteColor ?? "transparent" }} title={s.note} />
                    <span className="font-mono-num font-semibold text-mut">{official.get(s.team)}</span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => onTeam(s.team)} className="flex min-w-0 items-center gap-3 text-left">
                    <Crest id={s.team} size={26} />
                    <span className="truncate font-semibold text-fg transition-colors group-hover:text-volt">{teams[s.team]?.name}</span>
                  </button>
                </td>
                {cols.map((c) => {
                  const v = c.key === "gd" ? gd(s) : c.key === "pts" ? pts(s) : s[c.key as "p" | "w" | "d" | "l" | "gf" | "ga"]
                  return (
                    <td
                      key={c.key}
                      className={`px-2 py-3 text-center font-mono-num ${c.hide ?? ""} ${
                        c.key === "pts" ? "text-base font-bold text-fg" : c.key === "gd" ? (v > 0 ? "text-volt/90" : v < 0 ? "text-live/90" : "text-mut") : "text-mut"
                      }`}
                    >
                      {c.key === "gd" && v > 0 ? `+${v}` : v}
                    </td>
                  )
                })}
                <td className="hidden px-5 py-3 lg:table-cell">
                  <span className="flex justify-end">
                    <FormPills form={s.form} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] px-5 py-3 text-[11px] text-mut">
          {notes.map(([n, c]) => (
            <span key={n} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} /> {n}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

function ClubGrid({ league, clubs, onTeam }: { league: string; clubs: string[]; onTeam: (id: string) => void }) {
  const [q, setQ] = useState("")
  const list = clubs.filter((id) => teams[id]?.name.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => teams[a].name.localeCompare(teams[b].name))
  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-2/80 px-4 py-3 focus-within:border-volt/50 sm:w-80">
        <SearchIcon />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter clubs…" className="w-full bg-transparent text-sm placeholder:text-mut-2 focus:outline-none" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((id) => {
          const t = teams[id]
          const d = detailsFor(id)
          const pos = positionIn(league, id)
          return (
            <button key={id} onClick={() => onTeam(id)} className="card card-hover group relative overflow-hidden rounded-2xl p-4 text-left">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color2})` }} />
              <div className="flex items-center gap-3">
                <Crest id={id} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{t.name}</div>
                  <div className="truncate text-[12px] text-mut">{d?.city ?? t.city}{d?.country ? `, ${d.country}` : ""}</div>
                </div>
                {pos && <span className="rounded-lg bg-white/[0.06] px-2 py-1 font-mono-num text-[12px] font-bold text-fg">#{pos.pos}</span>}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-mut">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-mut-2" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6" strokeLinejoin="round" />
                </svg>
                <span className="truncate">{d?.stadium ?? "Stadium TBC"}</span>
              </div>
              {pos && (
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="font-mono-num text-[12px] text-mut">
                    <span className="font-bold text-fg">{pts(pos.row)}</span> pts · {pos.row.w}-{pos.row.d}-{pos.row.l}
                  </span>
                  <FormPills form={pos.row.form} size={16} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-mut-2" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" strokeLinecap="round" />
    </svg>
  )
}

function Arrow() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-mut transition-all group-hover:border-volt/50 group-hover:bg-volt group-hover:text-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
