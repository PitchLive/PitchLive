import { useEffect, useState } from "react"
import { teams, type Match } from "../data"
import { useLive } from "../api/LiveProvider"
import { api, type MatchDetails } from "../api/client"
import type { Page } from "../components/Navbar"
import { Crest, LeagueLogo, LiveBadge } from "../components/ui"
import LiveChat from "../components/LiveChat"
import { CommentaryTab, LineupsTab, StandingsTab, StatsTab, SummaryTab, scorers } from "../components/MatchCentre"
import { leagueByName } from "../leagueInfo"

const TABS = ["Summary", "Stats", "Line-ups", "Commentary", "Table", "Chat"] as const
type Tab = (typeof TABS)[number]

/** Live stats, line-ups, events and commentary: fetched once, then pushed over the socket while live. */
function useMatchDetails(id: string) {
  const { online, watchMatch } = useLive()
  const [details, setDetails] = useState<MatchDetails | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    if (!online) return
    let cancelled = false
    setDetails(null)
    setUnavailable(false)
    api
      .details(id)
      .then((r) => !cancelled && setDetails((cur) => (cur && cur.updatedAt > r.details.updatedAt ? cur : r.details)))
      .catch(() => !cancelled && setUnavailable(true))
    const stop = watchMatch(id, (e) => {
      if (e.type === "details") setDetails(e.details)
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [id, online, watchMatch])

  return { details, unavailable }
}

export default function MatchDetail({
  id,
  onTeam,
  onOpen,
  onLeague,
  go,
  back,
}: {
  id: string
  onTeam: (id: string) => void
  onOpen: (id: string) => void
  onLeague: (league: string) => void
  go: (p: Page) => void
  back: () => void
}) {
  const { getMatch, loadMatch } = useLive()
  const m = getMatch(id)
  const [missing, setMissing] = useState(false)
  const [tab, setTab] = useState<Tab>("Summary")
  const { details, unavailable } = useMatchDetails(id)
  const known = !!m

  // Matches outside the loaded days (e.g. from a club page) are fetched on demand.
  useEffect(() => {
    if (!known) loadMatch(id).catch(() => setMissing(true))
  }, [id, known, loadMatch])

  if (!m)
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-24 text-center sm:px-6">
        <p className="text-mut">{missing ? "This match could not be found." : "Loading match…"}</p>
        <button onClick={back} className="mt-4 text-sm font-semibold text-volt hover:underline">
          Back to scores
        </button>
      </div>
    )

  const home = teams[m.home]
  const away = teams[m.away]
  const played = m.status !== "UPCOMING" && m.status !== "POSTPONED"
  const shown: MatchDetails | null = details ?? (unavailable ? { matchId: id, stats: [], lineups: null, events: [], commentary: [], updatedAt: "" } : null)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-mut hover:text-fg">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Scoreboard */}
      <section className="card relative overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `radial-gradient(circle at 20% 0%, ${home?.color}55, transparent 55%), radial-gradient(circle at 80% 100%, ${away?.color}55, transparent 55%)` }}
        />
        <div className="relative px-6 pt-4 text-center text-[11px] font-semibold uppercase tracking-widest text-mut">
          {leagueByName[m.league] ? (
            <button onClick={() => onLeague(m.league)} className="uppercase tracking-widest hover:text-volt hover:underline">
              {m.league}
            </button>
          ) : (
            m.league
          )}
          {m.kickoffAt && ` · ${new Date(m.kickoffAt).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
        </div>
        <div className="relative grid grid-cols-3 items-start gap-3 px-4 pb-6 pt-4 sm:px-10 sm:pb-8">
          <TeamCol id={m.home} onTeam={onTeam} scorers={scorers(shown, "home")} />
          <div className="pt-4 text-center">
            {played ? (
              <div className="font-mono-num text-5xl font-extrabold leading-none sm:text-7xl">
                <span className={m.status === "FT" ? "text-fg" : "text-volt text-glow"}>{m.homeScore}</span>
                <span className="mx-2 text-mut-2">-</span>
                <span className={m.status === "FT" ? "text-fg" : "text-volt text-glow"}>{m.awayScore}</span>
              </div>
            ) : (
              <div className="font-mono-num text-4xl font-extrabold leading-none text-fg sm:text-6xl">{m.kickoff}</div>
            )}
            <div className="mt-3 flex h-6 justify-center">
              <LiveBadge m={m} />
            </div>
          </div>
          <TeamCol id={m.away} onTeam={onTeam} scorers={scorers(shown, "away")} />
        </div>
      </section>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {/* Tabs */}
          <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-ink-2/80 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${t === "Chat" ? "lg:hidden" : ""} ${
                  tab === t ? "bg-volt text-ink" : "text-mut hover:text-fg"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Summary" && (
            <div className="space-y-4">
              <SummaryTab match={m} details={shown} />
              <MatchInfo m={m} onLeague={onLeague} />
            </div>
          )}
          {tab === "Stats" && <StatsTab match={m} details={shown} />}
          {tab === "Line-ups" && <LineupsTab match={m} details={shown} />}
          {tab === "Commentary" && <CommentaryTab match={m} details={shown} />}
          {tab === "Table" && <StandingsTab match={m} onTeam={onTeam} onOpen={onOpen} onLeague={onLeague} />}
          {tab === "Chat" && (
            <div className="h-[520px] lg:hidden">
              <LiveChat matchId={m.id} onSignIn={() => go("signin")} />
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-32 h-[560px]">
            <LiveChat matchId={m.id} onSignIn={() => go("signin")} />
          </div>
        </aside>
      </div>
    </div>
  )
}

const statusText = (s: string) => ({ LIVE: "In play", HT: "Half-time", FT: "Full-time", UPCOMING: "Scheduled", POSTPONED: "Postponed" })[s] ?? s

function MatchInfo({ m, onLeague }: { m: Match; onLeague: (league: string) => void }) {
  const info = leagueByName[m.league]
  return (
    <section className="card rounded-2xl p-5">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-mut">Match info</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <Info label="Competition">
          <button onClick={() => info && onLeague(m.league)} disabled={!info} className="flex items-center gap-2 font-semibold enabled:hover:text-volt">
            {info && <LeagueLogo src={info.logo} accent={info.accent} size={22} label="" />}
            {m.league}
          </button>
        </Info>
        <Info label="Venue">
          {m.venue ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.venue)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-volt hover:underline"
            >
              {m.venue}
            </a>
          ) : (
            "TBC"
          )}
        </Info>
        <Info label="Status">{statusText(m.status)}</Info>
      </dl>
    </section>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-mut-2">{label}</dt>
      <dd className="mt-1 text-fg">{children}</dd>
    </div>
  )
}

function TeamCol({ id, onTeam, scorers }: { id: string; onTeam: (id: string) => void; scorers: string[] }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <button onClick={() => onTeam(id)} className="flex flex-col items-center gap-3 hover:text-volt">
        <Crest id={id} size={72} />
        <span className="font-display text-lg font-bold leading-tight sm:text-2xl">{teams[id]?.name ?? id}</span>
      </button>
      {scorers.length > 0 && (
        <ul className="space-y-0.5 text-[11px] text-mut">
          {scorers.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
