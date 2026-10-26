import { useEffect, useState } from "react"
import { teams } from "../data"
import { useLive } from "../api/LiveProvider"
import type { Page } from "../components/Navbar"
import { Crest, LeagueLogo, LiveBadge } from "../components/ui"
import LiveChat from "../components/LiveChat"
import { leagueByName, positionIn } from "../leagueInfo"

export default function MatchDetail({ id, onTeam, go, back }: { id: string; onTeam: (id: string) => void; go: (p: Page) => void; back: () => void }) {
  const { getMatch, loadMatch } = useLive()
  const m = getMatch(id)
  const [missing, setMissing] = useState(false)
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
  const info = leagueByName[m.league]
  const kickoff = m.kickoffAt ? new Date(m.kickoffAt) : null
  const played = m.status !== "UPCOMING" && m.status !== "POSTPONED"

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
        <div className="relative grid grid-cols-3 items-center gap-3 p-6 sm:p-10">
          <TeamCol id={m.home} onTeam={onTeam} />
          <div className="text-center">
            <div className="mb-2 flex h-6 justify-center">
              <LiveBadge m={m} />
            </div>
            {played ? (
              <div className="font-mono-num text-5xl font-extrabold leading-none sm:text-7xl">
                <span className={m.status === "FT" ? "text-fg" : "text-volt text-glow"}>{m.homeScore}</span>
                <span className="mx-2 text-mut-2">:</span>
                <span className="text-fg">{m.awayScore}</span>
              </div>
            ) : (
              <div className="font-mono-num text-4xl font-extrabold leading-none text-fg sm:text-6xl">{m.kickoff}</div>
            )}
            <div className="mt-3 text-[12px] uppercase tracking-widest text-mut">{m.league}</div>
          </div>
          <TeamCol id={m.away} onTeam={onTeam} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <section className="card rounded-2xl p-5">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-mut">Match info</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Competition">
                <button onClick={() => info && go("competitions")} className="flex items-center gap-2 font-semibold hover:text-volt">
                  {info && <LeagueLogo src={info.logo} accent={info.accent} size={22} label="" />}
                  {m.league}
                </button>
              </Info>
              <Info label="Kick-off">
                {kickoff ? kickoff.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "TBC"}
              </Info>
              <Info label="Venue">{m.venue ?? "TBC"}</Info>
              <Info label="Status">{statusText(m.status)}</Info>
            </dl>
          </section>

          {info && <TableSnippet league={m.league} ids={[m.home, m.away]} onTeam={onTeam} />}
        </div>

        <div className="h-[460px] lg:h-[560px]">
          <LiveChat matchId={m.id} onSignIn={() => go("signin")} />
        </div>
      </div>
    </div>
  )
}

const statusText = (s: string) => ({ LIVE: "In play", HT: "Half-time", FT: "Full-time", UPCOMING: "Scheduled", POSTPONED: "Postponed" })[s] ?? s

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-mut-2">{label}</dt>
      <dd className="mt-1 text-fg">{children}</dd>
    </div>
  )
}

/** Where the two clubs sit in the competition table. */
function TableSnippet({ league, ids, onTeam }: { league: string; ids: string[]; onTeam: (id: string) => void }) {
  const rows = ids.map((id) => ({ id, p: positionIn(league, id) })).filter((r) => r.p)
  if (!rows.length) return null
  return (
    <section className="card rounded-2xl p-5">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-mut">League position</h2>
      <ul className="space-y-1.5">
        {rows.map(({ id, p }) => (
          <li key={id}>
            <button onClick={() => onTeam(id)} className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 text-left hover:bg-white/[0.06]">
              <span className="w-6 font-mono-num text-sm font-bold text-volt">{p!.pos}</span>
              <Crest id={id} size={24} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{teams[id]?.name}</span>
              <span className="font-mono-num text-[12px] text-mut">
                {p!.row.w}-{p!.row.d}-{p!.row.l}
              </span>
              <span className="w-8 text-right font-mono-num text-sm font-bold">{p!.row.pts}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TeamCol({ id, onTeam }: { id: string; onTeam: (id: string) => void }) {
  return (
    <button onClick={() => onTeam(id)} className="flex flex-col items-center gap-3 text-center hover:text-volt">
      <Crest id={id} size={72} />
      <span className="font-display text-lg font-bold leading-tight sm:text-2xl">{teams[id]?.name ?? id}</span>
    </button>
  )
}
