import { useEffect } from "react"
import { teams, type Standing } from "../data"
import { useLive } from "../api/LiveProvider"
import { Crest, FormPills, LeagueLogo, LiveBadge } from "../components/ui"
import { clubsIn, detailsFor, domesticLeague, leagueByName, positionIn } from "../leagueInfo"
import { photos } from "../imports/photos"

const pts = (s: Standing) => s.pts ?? s.w * 3 + s.d
const gd = (s: Standing) => s.gf - s.ga

export default function Team({ id, onOpen, onTeam, onLeague, onSignIn, back }: {
  id: string
  onOpen: (id: string) => void
  onTeam: (id: string) => void
  onLeague: (name: string) => void
  onSignIn: () => void
  back: () => void
}) {
  const { matches, favorites, toggleFavorite, loadTeamMatches } = useLive()
  useEffect(() => {
    loadTeamMatches(id).catch(() => {})
  }, [id, loadTeamMatches])

  const t = teams[id]
  if (!t) return null
  const following = favorites.has(id)

  const details = detailsFor(id)
  const league = domesticLeague(id) ?? t.league
  const info = league ? leagueByName[league] : undefined
  const placed = league ? positionIn(league, id) : null
  const standing = placed?.row
  const position = placed?.pos ?? null
  // Five-row window of the table around this club
  const groupRows = placed?.group.rows ?? []
  const start = Math.max(0, Math.min((position ?? 1) - 3, groupRows.length - 5))
  const tableWindow = groupRows.slice(start, start + 5)
  const leagueMates = league ? clubsIn(league).filter((x) => x !== id) : []

  const fixtures = matches.filter((m) => m.home === id || m.away === id)
  const follow = async () => {
    if ((await toggleFavorite(id)) === "signin") onSignIn()
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-mut hover:text-fg">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Club header */}
      <section className="relative overflow-hidden card rounded-3xl">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${photos.turfLines})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(circle at 15% 0%, ${t.color}88, transparent 60%), radial-gradient(circle at 90% 120%, ${t.color2}66, transparent 55%)` }}
        />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="relative flex flex-col items-center gap-5 p-7 sm:flex-row sm:p-9">
          <Crest id={id} size={96} />
          <div className="text-center sm:text-left">
            <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">{t.name}</h1>
            <p className="mt-1 text-sm text-mut">
              {details?.city ?? t.city}
              {details?.country ? `, ${details.country}` : ""} · <span className="font-semibold text-fg">{t.short}</span>
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {details?.stadium && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/50 px-3 py-1 text-[12px] font-semibold text-fg/90 backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-mut" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6" strokeLinejoin="round" />
                  </svg>
                  {details.stadium}
                </span>
              )}
              {(details?.leagues ?? (league ? [league] : [])).map((l) => {
                const li = leagueByName[l]
                return (
                  <button
                    key={l}
                    onClick={() => li && onLeague(l)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/50 py-1 pl-1 pr-3 text-[12px] font-semibold text-fg/90 backdrop-blur hover:border-volt/40"
                  >
                    {li && <LeagueLogo src={li.logo} accent={li.accent} size={20} label="" />}
                    {l}
                  </button>
                )
              })}
            </div>
          </div>
          <button
            onClick={follow}
            aria-pressed={following}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all sm:ml-auto ${
              following ? "border border-volt/50 bg-volt/15 text-volt" : "bg-volt text-ink hover:shadow-[0_0_20px_rgba(61,255,136,0.5)]"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill={following ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" strokeLinejoin="round" />
            </svg>
            {following ? "Following" : "Follow"}
          </button>
          {position && (
            <div className="flex items-center gap-2 rounded-2xl border border-line bg-ink-2/70 px-5 py-3 text-center">
              <div>
                <div className="font-mono-num text-2xl font-extrabold text-volt">#{position}</div>
                <div className="text-[11px] uppercase tracking-wider text-mut-2">{info?.short ?? "League"}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stat tiles */}
      {standing && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <Stat label="Points" value={pts(standing)} accent />
          <Stat label="Played" value={standing.p} />
          <Stat label="Won" value={standing.w} />
          <Stat label="Drawn" value={standing.d} />
          <Stat label="Lost" value={standing.l} />
          <Stat label="Goal Diff" value={gd(standing) > 0 ? `+${gd(standing)}` : gd(standing)} />
        </div>
      )}

      {/* Form */}
      {standing && (
        <div className="mt-3 flex items-center gap-3 card rounded-2xl px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-mut-2">Recent Form</span>
          <FormPills form={standing.form} size={24} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Fixtures */}
        <section className="card rounded-2xl">
          <h2 className="border-b border-line px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-mut">
            Fixtures &amp; Results
          </h2>
          {fixtures.length === 0 && <p className="px-5 py-10 text-center text-sm text-mut">No scheduled fixtures.</p>}
          {fixtures.map((m) => {
            const opp = m.home === id ? m.away : m.home
            const homeGame = m.home === id
            const forGoals = homeGame ? m.homeScore : m.awayScore
            const agGoals = homeGame ? m.awayScore : m.homeScore
            const decided = m.status === "FT"
            return (
              <button
                key={m.id}
                onClick={() => onOpen(m.id)}
                className="flex w-full items-center gap-3 border-b border-line-soft px-5 py-3 text-left last:border-0 hover:bg-panel-2"
              >
                <span className="w-14 shrink-0 text-[11px] font-semibold text-mut-2">{m.league.split(" ")[0]}</span>
                <span className={`rounded px-1 text-[10px] font-bold ${homeGame ? "text-mut" : "text-mut-2"}`}>
                  {homeGame ? "H" : "A"}
                </span>
                <Crest id={opp} size={22} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{teams[opp].name}</span>
                {m.status === "UPCOMING" ? (
                  <span className="font-mono-num text-[13px] font-semibold text-mut">{m.kickoff}</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className={`font-mono-num text-sm font-bold ${decided ? (forGoals > agGoals ? "text-volt" : forGoals < agGoals ? "text-live" : "text-mut") : "text-fg"}`}>
                      {forGoals}-{agGoals}
                    </span>
                    <LiveBadge minute={m.minute} status={m.status} />
                  </span>
                )}
              </button>
            )
          })}
        </section>

        {/* League position */}
        <section className="card overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-mut">{placed?.group.group ?? league ?? "League"}</h2>
            {league && leagueByName[league] && (
              <button onClick={() => onLeague(league)} className="text-[12px] font-semibold text-volt hover:underline">
                Full table →
              </button>
            )}
          </div>
          {tableWindow.length === 0 && <p className="px-5 py-10 text-center text-sm text-mut">No table available.</p>}
          <ul className="p-2">
            {tableWindow.map((r, i) => (
              <li key={r.team}>
                <button
                  onClick={() => onTeam(r.team)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${r.team === id ? "bg-volt/10 ring-1 ring-volt/30" : "hover:bg-white/[0.04]"}`}
                >
                  <span className="w-5 font-mono-num text-[12px] font-bold text-mut">{start + i + 1}</span>
                  <Crest id={r.team} size={22} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{teams[r.team]?.name}</span>
                  <span className="font-mono-num text-[12px] text-mut">{gd(r) > 0 ? `+${gd(r)}` : gd(r)}</span>
                  <span className="w-7 text-right font-mono-num text-sm font-bold">{pts(r)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Related clubs */}
      <div className="mt-6">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-mut">More from {league ?? "the league"}</h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {(leagueMates.length ? leagueMates.map((x) => teams[x]) : Object.values(teams).filter((x) => x.id !== id).slice(0, 24))
            .filter(Boolean)
            .map((x) => (
              <button
                key={x.id}
                onClick={() => onTeam(x.id)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-sm font-semibold text-mut hover:border-volt/40 hover:text-fg"
              >
                <Crest id={x.id} size={20} />
                {x.short}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="card rounded-2xl px-4 py-3.5">
      <div className={`font-mono-num text-2xl font-extrabold ${accent ? "text-volt" : "text-fg"}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-mut-2">{label}</div>
    </div>
  )
}
