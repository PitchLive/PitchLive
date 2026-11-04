import { useState } from "react"
import { teams, type Match } from "../data"
import type { CommentaryLine, Lineup, LineupPlayer, MatchDetails, MatchEvent, StatRow } from "../api/client"
import { useLeagueTable } from "../api/useLeagueTable"
import { Crest, LiveResultPill, MoveArrow, UpdatedAgo } from "./ui"

type Side = "home" | "away"

/* ───────────── Icons ───────────── */

function Ball({ own = false, className = "h-3.5 w-3.5" }: { own?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 ${own ? "text-live" : "text-fg"}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l3.2 2.3-1.2 3.7H10l-1.2-3.7z" fill="currentColor" stroke="none" />
      <path d="M12 3v4.5M15.2 9.8l4.3-1.4M14 13.5l2.6 3.7M10 13.5l-2.6 3.7M8.8 9.8L4.5 8.4" />
    </svg>
  )
}

const Card = ({ color }: { color: "yellow" | "red" | "second" }) =>
  color === "second" ? (
    <span className="relative inline-block h-3.5 w-3 shrink-0">
      <span className="absolute left-0 top-0 h-3 w-2.5 rounded-[2px] bg-amber" />
      <span className="absolute bottom-0 right-0 h-3 w-2.5 rounded-[2px] bg-live" />
    </span>
  ) : (
    <span className={`inline-block h-3.5 w-2.5 shrink-0 rounded-[2px] ${color === "yellow" ? "bg-amber" : "bg-live"}`} />
  )

function SubArrows({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 20V5M4 9l4-4 4 4" stroke="#3dff88" />
      <path d="M16 4v15M12 15l4 4 4-4" stroke="#ff3b5c" />
    </svg>
  )
}

function EventIcon({ type }: { type: string }) {
  if (type === "goal" || type === "penalty-goal" || type === "penalty---scored") return <Ball />
  if (type === "own-goal") return <Ball own />
  if (type === "yellow-card") return <Card color="yellow" />
  if (type === "red-card") return <Card color="red" />
  if (type === "second-yellow-card") return <Card color="second" />
  if (type === "substitution") return <SubArrows />
  if (type.startsWith("var")) return <span className="rounded bg-cobalt/20 px-1 text-[9px] font-bold text-cobalt">VAR</span>
  if (type === "penalty---missed") return <span className="text-[11px] font-bold text-live">✕</span>
  return <span className="h-1.5 w-1.5 rounded-full bg-mut-2" />
}

const isGoal = (t: string | null) => t === "goal" || t === "own-goal" || t === "penalty-goal" || t === "penalty---scored"

/* ───────────── Summary ───────────── */

const PERIOD_NAMES: Record<number, string> = { 1: "1st Half", 2: "2nd Half", 3: "Extra Time", 4: "Extra Time", 5: "Penalties" }

/** Event timeline in Flashscore's layout: home events on the left, away on the right, grouped by half. */
export function SummaryTab({ match, details }: { match: Match; details: MatchDetails | null }) {
  const events = (details?.events ?? []).filter((e) => e.side)
  if (!events.length)
    return <Empty text={match.status === "UPCOMING" ? "The match hasn't started yet." : details ? "No key events yet." : "Loading match events…"} />

  // Running score per half, as Flashscore shows in each half's header.
  const periods = [...new Set(events.map((e) => e.period ?? 1))].sort()
  const goalsUntil = (p: number, side: Side) => events.filter((e) => (e.period ?? 1) === p && isGoal(e.type) && e.side === side).length

  return (
    <div className="card overflow-hidden rounded-2xl">
      {periods.map((p) => (
        <div key={p}>
          <div className="flex items-center justify-between bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-mut">
            <span>{PERIOD_NAMES[p] ?? `Period ${p}`}</span>
            <span className="font-mono-num text-fg">
              {goalsUntil(p, "home")} - {goalsUntil(p, "away")}
            </span>
          </div>
          {events
            .filter((e) => (e.period ?? 1) === p)
            .map((e) => (
              <SummaryRow key={e.id} e={e} />
            ))}
        </div>
      ))}
    </div>
  )
}

function SummaryRow({ e }: { e: MatchEvent }) {
  const [main, second] = e.players
  const secondary = e.type === "substitution" ? second : isGoal(e.type) ? second && `(${second})` : null
  const body = (
    <span className={`flex min-w-0 items-center gap-2 ${e.side === "away" ? "flex-row-reverse text-right" : ""}`}>
      <span className="w-9 shrink-0 font-mono-num text-[12px] font-bold text-mut">{e.minute}</span>
      <EventIcon type={e.type} />
      <span className="min-w-0 truncate text-[13px]">
        <span className={isGoal(e.type) ? "font-bold text-fg" : "font-semibold text-fg/90"}>{main ?? e.text}</span>
        {secondary && <span className="ml-1.5 text-mut">{secondary}</span>}
      </span>
    </span>
  )
  return (
    <div className={`grid grid-cols-2 border-t border-white/[0.04] px-4 py-2 ${isGoal(e.type) ? "bg-volt/[0.04]" : ""}`} title={e.text}>
      <div className="min-w-0">{e.side === "home" && body}</div>
      <div className="flex min-w-0 justify-end">{e.side === "away" && body}</div>
    </div>
  )
}

/** Goal scorers for the scoreboard header. */
export function scorers(details: MatchDetails | null, side: Side) {
  return (details?.events ?? [])
    .filter((e) => isGoal(e.type) && e.side === side)
    .map((e) => `${e.players[0]?.split(" ").slice(-1)[0] ?? "Goal"} ${e.minute}${e.type === "own-goal" ? " (OG)" : e.type.startsWith("penalty") ? " (P)" : ""}`)
}

/* ───────────── Stats ───────────── */

const num = (v: string) => parseFloat(v.replace(/[^\d.]/g, "")) || 0

export function StatsTab({ match, details }: { match: Match; details: MatchDetails | null }) {
  const stats = details?.stats ?? []
  if (!stats.length) return <Empty text={match.status === "UPCOMING" ? "Statistics appear once the match kicks off." : details ? "No statistics available for this match." : "Loading statistics…"} />
  const hc = teams[match.home]?.color ?? "#3dff88"
  const ac = teams[match.away]?.color ?? "#3d7bff"
  return (
    <div className="card space-y-4 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <Crest id={match.home} size={28} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-mut">Match statistics</span>
        <Crest id={match.away} size={28} />
      </div>
      {stats.map((s) => (
        <StatBar key={s.key} s={s} hc={hc} ac={ac} />
      ))}
    </div>
  )
}

function StatBar({ s, hc, ac }: { s: StatRow; hc: string; ac: string }) {
  const h = num(s.home)
  const a = num(s.away)
  const total = h + a || 1
  const better = h === a ? null : h > a ? "home" : "away"
  // Fouls and cards: fewer is "better", but Flashscore highlights the bigger number either way.
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className={`font-mono-num font-bold ${better === "home" ? "text-fg" : "text-mut"}`}>{s.home}</span>
        <span className="text-mut">{s.label}</span>
        <span className={`font-mono-num font-bold ${better === "away" ? "text-fg" : "text-mut"}`}>{s.away}</span>
      </div>
      <div className="flex h-1.5 gap-1">
        <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(h / total) * 100}%`, background: hc }} />
        </div>
        <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(a / total) * 100}%`, background: ac }} />
        </div>
      </div>
    </div>
  )
}

/* ───────────── Line-ups ───────────── */

// Depth of a position on the pitch (0 = goal line) and its side (0 left, 1 centre, 2 right).
function depth(pos: string | null) {
  const p = (pos ?? "").toUpperCase()
  if (p === "G" || p === "GK") return 0
  if (p.includes("WB")) return 2
  if (p.includes("DM")) return 3
  if (p.includes("AM")) return 5
  if (/(^|-)(CD|D|LB|RB|SW)($|-)/.test(p) || p.startsWith("CD") || p === "D") return 1
  if (p.includes("M")) return 4
  if (/W$|^LW|^RW/.test(p)) return 6
  return 7 // F, CF, ST
}
function lateral(pos: string | null) {
  const p = (pos ?? "").toUpperCase()
  if (p.endsWith("-L") || /^L[BMW]|^LWB/.test(p)) return 0
  if (p.endsWith("-R") || /^R[BMW]|^RWB/.test(p)) return 2
  return 1
}

/** Split starters into lines (defence → attack) using the formation string, e.g. "4-2-3-1". */
export function formationLines(l: Lineup): LineupPlayer[][] | null {
  const counts = (l.formation ?? "").split("-").map(Number).filter((n) => n > 0)
  const keeper = l.starters.find((p) => depth(p.position) === 0)
  const outfield = l.starters.filter((p) => p !== keeper)
  if (!keeper || !counts.length || counts.reduce((a, b) => a + b, 0) !== outfield.length) return null
  const sorted = [...outfield].sort((a, b) => depth(a.position) - depth(b.position) || (a.formationPlace ?? 0) - (b.formationPlace ?? 0))
  const lines: LineupPlayer[][] = [[keeper]]
  let i = 0
  for (const n of counts) {
    lines.push(sorted.slice(i, i + n).sort((a, b) => lateral(a.position) - lateral(b.position)))
    i += n
  }
  return lines
}

export function LineupsTab({ match, details }: { match: Match; details: MatchDetails | null }) {
  const l = details?.lineups
  if (!l) return <Empty text={match.status === "UPCOMING" ? "Line-ups are usually confirmed about an hour before kick-off." : details ? "Line-ups aren't available for this match." : "Loading line-ups…"} />
  const homeLines = formationLines(l.home)
  const awayLines = formationLines(l.away)
  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between rounded-2xl px-5 py-3 text-sm font-bold">
        <span className="flex items-center gap-2">
          <Crest id={match.home} size={22} /> {l.home.formation ?? "—"}
        </span>
        <span className="text-[11px] uppercase tracking-widest text-mut">Formations</span>
        <span className="flex items-center gap-2">
          {l.away.formation ?? "—"} <Crest id={match.away} size={22} />
        </span>
      </div>

      {homeLines && awayLines && (
        <div className="relative mx-auto aspect-[68/105] w-full max-w-[460px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f5132]">
          <PitchMarkings />
          {/* Away team attacks downwards from the top; home team attacks upwards from the bottom. */}
          <Half lines={awayLines} color={teams[match.away]?.color ?? "#3d7bff"} top />
          <Half lines={homeLines} color={teams[match.home]?.color ?? "#3dff88"} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerList title="Starting XI" id={match.home} players={l.home.starters} />
        <PlayerList title="Starting XI" id={match.away} players={l.away.starters} />
        <PlayerList title="Substitutes" id={match.home} players={l.home.bench} />
        <PlayerList title="Substitutes" id={match.away} players={l.away.bench} />
      </div>
    </div>
  )
}

function PitchMarkings() {
  return (
    <svg viewBox="0 0 68 105" className="absolute inset-0 h-full w-full" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.4">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x="0" y={i * 15} width="68" height="7.5" fill="rgba(255,255,255,0.025)" stroke="none" />
      ))}
      <rect x="1.5" y="1.5" width="65" height="102" />
      <line x1="1.5" y1="52.5" x2="66.5" y2="52.5" />
      <circle cx="34" cy="52.5" r="9.15" />
      <rect x="13.85" y="1.5" width="40.3" height="16.5" />
      <rect x="24.85" y="1.5" width="18.3" height="5.5" />
      <rect x="13.85" y="87" width="40.3" height="16.5" />
      <rect x="24.85" y="98" width="18.3" height="5.5" />
    </svg>
  )
}

function Half({ lines, color, top = false }: { lines: LineupPlayer[][]; color: string; top?: boolean }) {
  // Lines spread from near the goal line to just short of halfway.
  const rows = lines.length
  return (
    <>
      {lines.map((line, r) => {
        // Distance from the team's own goal line, as a percentage of the whole pitch (keeper 5%, front line 44%).
        const y = 5 + (r * 39) / Math.max(1, rows - 1)
        const topPct = top ? y : 100 - y
        // The away side faces the other way, so its left is the viewer's right.
        const ordered = top ? [...line].reverse() : line
        return ordered.map((p, i) => (
          <div
            key={p.id}
            className="absolute flex w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${((i + 1) / (ordered.length + 1)) * 100}%`, top: `${topPct}%` }}
          >
            <span className="relative grid h-7 w-7 place-items-center rounded-full border-2 border-white/80 font-mono-num text-[11px] font-bold text-white shadow-lg" style={{ background: color }}>
              {p.number ?? ""}
              {p.goals > 0 && (
                <span className="absolute -right-2 -top-1.5 rounded-full bg-white p-px">
                  <Ball className="h-3 w-3 text-ink" />
                </span>
              )}
              {(p.yellow || p.red) && (
                <span className="absolute -left-1.5 -top-1">
                  <Card color={p.red ? "red" : "yellow"} />
                </span>
              )}
              {p.subbedOut && (
                <span className="absolute -bottom-1 -right-2 rounded-full bg-ink/80 p-px">
                  <SubArrows className="h-3 w-3" />
                </span>
              )}
            </span>
            <span className="mt-0.5 max-w-full truncate rounded bg-black/45 px-1 text-[9.5px] font-semibold leading-tight text-white">{p.shortName}</span>
          </div>
        ))
      })}
    </>
  )
}

function PlayerList({ title, id, players }: { title: string; id: string; players: LineupPlayer[] }) {
  if (!players.length) return null
  return (
    <section className="card rounded-2xl p-4">
      <h3 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-mut">
        <Crest id={id} size={18} /> {title}
      </h3>
      <ul>
        {players.map((p) => (
          <li key={p.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px]">
            <span className="w-6 text-right font-mono-num text-[12px] font-bold text-mut">{p.number}</span>
            <span className={`min-w-0 flex-1 truncate ${p.subbedIn || p.starter ? "text-fg" : "text-fg/60"}`}>{p.name}</span>
            {p.position && <span className="text-[10px] font-semibold text-mut-2">{p.position}</span>}
            {Array.from({ length: p.goals }, (_, i) => (
              <Ball key={i} />
            ))}
            {p.yellow && <Card color="yellow" />}
            {p.red && <Card color="red" />}
            {(p.subbedIn || p.subbedOut) && (
              <span className="flex items-center gap-1 text-[11px] text-mut">
                <SubArrows className="h-3 w-3" />
                {p.subbedIn ?? p.subbedOut}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ───────────── Commentary ───────────── */

const KEY_TYPES = new Set(["goal", "own-goal", "penalty-goal", "penalty---scored", "penalty---missed", "yellow-card", "red-card", "second-yellow-card", "substitution"])

export function CommentaryTab({ match, details }: { match: Match; details: MatchDetails | null }) {
  const [keyOnly, setKeyOnly] = useState(false)
  const lines = (details?.commentary ?? []).filter((c) => !keyOnly || KEY_TYPES.has(c.type ?? "") || c.type?.startsWith("var"))
  if (!details?.commentary.length)
    return <Empty text={match.status === "UPCOMING" ? "Live commentary starts shortly before kick-off." : details ? "No commentary for this match." : "Loading commentary…"} />
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setKeyOnly((v) => !v)}
          aria-pressed={keyOnly}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${keyOnly ? "bg-volt text-ink" : "border border-white/10 bg-white/[0.03] text-mut hover:text-fg"}`}
        >
          Key moments only
        </button>
      </div>
      <div className="card overflow-hidden rounded-2xl">
        {lines.map((c) => (
          <CommentaryRow key={c.seq} c={c} />
        ))}
      </div>
    </div>
  )
}

function CommentaryRow({ c }: { c: CommentaryLine }) {
  const goal = isGoal(c.type)
  return (
    <div className={`flex gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0 ${goal ? "bg-volt/[0.06]" : ""}`}>
      <span className="w-10 shrink-0 pt-0.5 font-mono-num text-[12px] font-bold text-mut">{c.minute}</span>
      <span className="grid w-4 shrink-0 place-items-center pt-1">{c.type && KEY_TYPES.has(c.type) ? <EventIcon type={c.type} /> : <span className="h-1 w-1 rounded-full bg-mut-2" />}</span>
      <p className={`text-[13px] leading-relaxed ${goal ? "font-semibold text-fg" : "text-fg/80"}`}>{c.text}</p>
    </div>
  )
}

/* ───────────── Standings ───────────── */

export function StandingsTab({ match, onTeam, onOpen, onLeague }: { match: Match; onTeam: (id: string) => void; onOpen: (id: string) => void; onLeague: (league: string) => void }) {
  const table = useLeagueTable(match.league)
  const group = table.groups.find((g) => g.rows.some((r) => r.team === match.home || r.team === match.away))
  if (!group) return <Empty text={table.loading ? "Loading the latest table…" : (table.error ?? "No league table for this competition.")} />
  return (
    <div className="card overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-mut">
        <button onClick={() => onLeague(match.league)} className="hover:text-volt">
          {group.group ?? match.league}
        </button>
        {table.live > 0 && <span className="rounded bg-live px-1.5 py-0.5 text-[9px] text-white">LIVE</span>}
        <span className="ml-auto font-normal normal-case tracking-normal">
          <UpdatedAgo iso={table.updatedAt} />
        </span>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-mut-2">
            <th className="w-10 py-2 pl-4 text-left">#</th>
            <th className="py-2 text-left">Team</th>
            <th className="w-9 py-2 text-center">P</th>
            <th className="hidden w-14 py-2 text-center sm:table-cell">Goals</th>
            <th className="w-10 py-2 text-center">GD</th>
            <th className="w-12 py-2 pr-4 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((r, i) => {
            const playing = r.team === match.home || r.team === match.away
            return (
              <tr key={r.team} onClick={() => onTeam(r.team)} className={`cursor-pointer border-t border-white/[0.04] hover:bg-white/[0.04] ${playing ? "bg-volt/[0.08]" : ""}`}>
                <td className="py-2 pl-4">
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full" style={{ background: r.noteColor ?? "transparent" }} />
                    <span className="font-mono-num font-semibold text-mut">{i + 1}</span>
                    <MoveArrow move={r.move} />
                  </span>
                </td>
                <td className="py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <button onClick={() => onTeam(r.team)} className="flex min-w-0 items-center gap-2 text-left hover:text-volt">
                      <Crest id={r.team} size={18} />
                      <span className={`truncate ${playing ? "font-bold" : ""}`}>{teams[r.team]?.name ?? r.team}</span>
                    </button>
                    <LiveResultPill live={r.live} onOpen={r.live?.matchId === match.id ? undefined : onOpen} />
                  </span>
                </td>
                <td className="py-2 text-center font-mono-num text-mut">{r.p}</td>
                <td className="hidden py-2 text-center font-mono-num text-mut sm:table-cell">
                  {r.gf}:{r.ga}
                </td>
                <td className="py-2 text-center font-mono-num text-mut">{r.gf - r.ga > 0 ? `+${r.gf - r.ga}` : r.gf - r.ga}</td>
                <td className="py-2 pr-4 text-right font-mono-num font-bold">{r.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="card rounded-2xl px-6 py-14 text-center text-sm text-mut">{text}</p>
}
