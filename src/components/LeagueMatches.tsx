import { useState } from "react"
import { teams, type Match } from "../data"
import { Crest, LiveClock, SkeletonRows } from "./ui"

const dayKey = (m: Match) => (m.status === "POSTPONED" ? "postponed" : m.kickoffAt ? new Date(m.kickoffAt).toDateString() : "TBC")
const dayLabel = (m: Match) =>
  m.status === "POSTPONED"
    ? "Postponed — new date to be confirmed"
    : m.kickoffAt
      ? new Date(m.kickoffAt).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })
      : "Date to be confirmed"

/** Matches grouped under date headings; `pageSize` rows at a time with "Show more". */
export function MatchList({
  matches,
  onOpen,
  pageSize = 40,
  empty,
  loading = false,
}: {
  matches: Match[]
  onOpen: (id: string) => void
  pageSize?: number
  empty: string
  loading?: boolean
}) {
  const [shown, setShown] = useState(pageSize)
  if (loading && !matches.length) return <SkeletonRows count={10} label="Loading matches" />
  if (!matches.length) return <p className="card rounded-2xl px-6 py-12 text-center text-sm text-mut">{empty}</p>
  const visible = matches.slice(0, shown)
  const days: { key: string; label: string; items: Match[] }[] = []
  for (const m of visible) {
    const key = dayKey(m)
    const last = days.at(-1)
    if (last?.key === key) last.items.push(m)
    else days.push({ key, label: dayLabel(m), items: [m] })
  }
  return (
    <div className="card overflow-hidden rounded-2xl">
      {days.map((d) => (
        <div key={d.key}>
          <div className="bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-mut">{d.label}</div>
          {d.items.map((m) => (
            <MatchLine key={m.id} m={m} onOpen={onOpen} />
          ))}
        </div>
      ))}
      {matches.length > shown && (
        <button onClick={() => setShown((n) => n + pageSize)} className="w-full border-t border-white/[0.06] py-3 text-sm font-semibold text-volt hover:bg-white/[0.03]">
          Show more ({matches.length - shown} left)
        </button>
      )}
    </div>
  )
}

function MatchLine({ m, onOpen }: { m: Match; onOpen: (id: string) => void }) {
  const live = m.status === "LIVE" || m.status === "HT"
  const played = m.status !== "UPCOMING" && m.status !== "POSTPONED"
  const homeWin = m.status === "FT" && m.homeScore > m.awayScore
  const awayWin = m.status === "FT" && m.awayScore > m.homeScore
  return (
    <button
      onClick={() => onOpen(m.id)}
      className={`grid w-full grid-cols-[56px_minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-2 border-t border-white/[0.04] px-4 py-2.5 text-left text-[13px] hover:bg-white/[0.04] ${live ? "bg-live/[0.04]" : ""}`}
    >
      <span className={`font-mono-num text-[12px] font-semibold ${live ? "text-live" : "text-mut"}`}>
        {live ? <LiveClock m={m} /> : m.status === "FT" ? "FT" : m.status === "POSTPONED" ? "PPD" : m.kickoff}
      </span>
      <span className="flex min-w-0 items-center justify-end gap-2 text-right">
        <span className={`truncate ${homeWin ? "font-bold text-fg" : "text-fg/85"}`}>{teams[m.home]?.name ?? m.home}</span>
        <Crest id={m.home} size={20} />
      </span>
      <span className={`text-center font-mono-num text-[15px] font-bold ${live ? "text-volt" : played ? "text-fg" : "text-mut-2"}`}>
        {played ? `${m.homeScore} - ${m.awayScore}` : "-"}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <Crest id={m.away} size={20} />
        <span className={`truncate ${awayWin ? "font-bold text-fg" : "text-fg/85"}`}>{teams[m.away]?.name ?? m.away}</span>
      </span>
    </button>
  )
}

/** Flashscore-style league summary: in play now, latest results, next fixtures. */
export function LeagueOverview({
  data,
  onOpen,
  onAllResults,
  onAllFixtures,
}: {
  data: { live: Match[]; results: Match[]; fixtures: Match[]; loading: boolean; error: boolean }
  onOpen: (id: string) => void
  onAllResults: () => void
  onAllFixtures: () => void
}) {
  if (data.loading)
    return (
      <div className="space-y-6">
        <SkeletonRows count={6} label="Loading results" />
        <SkeletonRows count={6} label="Loading fixtures" />
      </div>
    )
  if (data.error) return <p className="card rounded-2xl px-6 py-12 text-center text-sm text-mut">Results and fixtures are unavailable right now.</p>
  return (
    <div className="space-y-6">
      {data.live.length > 0 && (
        <Section title="Live now" live>
          <MatchList matches={data.live} onOpen={onOpen} empty="" />
        </Section>
      )}
      <Section title="Latest results" action={data.results.length > 10 ? { label: "All results →", onClick: onAllResults } : undefined}>
        <MatchList matches={data.results.slice(0, 10)} onOpen={onOpen} empty="No results yet this season." />
      </Section>
      <Section title="Next fixtures" action={data.fixtures.length > 10 ? { label: "All fixtures →", onClick: onAllFixtures } : undefined}>
        <MatchList matches={data.fixtures.slice(0, 10)} onOpen={onOpen} empty="No more fixtures scheduled this season." />
      </Section>
    </div>
  )
}

function Section({ title, live, action, children }: { title: string; live?: boolean; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={`flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider ${live ? "text-live" : "text-mut"}`}>
          {live && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" />}
          {title}
        </h2>
        {action && (
          <button onClick={action.onClick} className="text-[12px] font-semibold text-volt hover:underline">
            {action.label}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
