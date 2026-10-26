import { useEffect, useState } from "react"
import { teams, type Match } from "../data"
import { useLive } from "../api/LiveProvider"
import { Crest, LeagueLogo, LiveBadge } from "../components/ui"
import MatchCard from "../components/MatchCard"
import LeagueFilters from "../components/LeagueFilters"
import BackgroundSlider from "../components/BackgroundSlider"
import type { Page } from "../components/Navbar"
import { photos } from "../imports/photos"
import { leagueCatalog, tableFor } from "../leagueInfo"

const isLive = (m: Match) => m.status === "LIVE" || m.status === "HT"
const isToday = (m: Match) => !m.kickoffAt || new Date(m.kickoffAt).toDateString() === new Date().toDateString()

export default function Home({ onOpen, onLeague, go }: { onOpen: (id: string) => void; onLeague: (name: string) => void; go: (p: Page) => void }) {
  const { matches, online, user } = useLive()
  const [league, setLeague] = useState("All")

  const live = matches.filter(isLive)
  const next = matches.find((m) => m.status === "UPCOMING" && m.kickoffAt && new Date(m.kickoffAt).getTime() > Date.now())
  // Spotlight: everything live, otherwise the next kick-off.
  const spotlight = live.length ? live : next ? [next] : []
  const [heroIdx, setHeroIdx] = useState(0)
  const idx = spotlight.length ? heroIdx % spotlight.length : 0
  const feat = spotlight[idx]

  useEffect(() => {
    if (spotlight.length <= 1) return
    const t = setInterval(() => setHeroIdx((i) => i + 1), 6000)
    return () => clearInterval(t)
  }, [spotlight.length])

  const today = matches.filter(isToday)
  const matchLeagues = leagueCatalog.map((l) => l.name).filter((l) => today.some((m) => m.league === l))
  const list = today
    .filter((m) => (league === "All" ? true : m.league === league))
    .filter((m) => m.status !== "FT")
    .sort((a, b) => Number(isLive(b)) - Number(isLive(a)))
    .slice(0, 9)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-panel shadow-2xl shadow-black/40">
        <div className="absolute inset-0 opacity-55">
          <BackgroundSlider images={[photos.scorerRun, photos.aerialDuel, photos.teamHighFive, photos.goalCelebration]} interval={6000} position="center 30%" showIndicators={false} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div className="flex flex-col justify-center">
            {live.length > 0 ? (
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-live/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-live">
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> {live.length} {live.length === 1 ? "match" : "matches"} live now
              </span>
            ) : (
              <span className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-mut">{leagueCatalog.length} competitions · live scores</span>
            )}
            <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              Every goal,
              <br />
              <span className="text-volt">the moment it happens.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] text-mut">
              Live scores with a running match clock, league tables and club pages across {leagueCatalog.length} competitions — plus alerts for the clubs you follow.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => go("scores")}
                className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_28px_rgba(61,255,136,0.55)]"
              >
                <span className="live-dot inline-block h-2 w-2 rounded-full bg-live" />
                Live scores
              </button>
              <button onClick={() => go("competitions")} className="rounded-xl border border-line bg-ink-2/70 px-5 py-3 text-sm font-bold text-fg hover:border-volt/40">
                Tables
              </button>
            </div>
          </div>

          {/* Spotlight */}
          <div className="glass relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-line p-5">
            {feat ? (
              <>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: `radial-gradient(circle at 12% 18%, ${teams[feat.home]?.color}4d, transparent 48%), radial-gradient(circle at 90% 85%, ${teams[feat.away]?.color}4d, transparent 50%)` }}
                />
                <div className="relative mb-3 flex items-center justify-between gap-3">
                  <span className="truncate text-[10px] font-bold uppercase tracking-widest text-mut-2">{isLive(feat) ? "Live now" : "Next kick-off"} · {feat.league}</span>
                  {spotlight.length > 1 && (
                    <span className="shrink-0 font-mono-num text-[11px] font-semibold text-mut">
                      {idx + 1} / {spotlight.length}
                    </span>
                  )}
                </div>
                <button key={feat.id} onClick={() => onOpen(feat.id)} className="relative flex flex-1 flex-col justify-center rounded-xl border border-dashed border-white/15 p-5 text-left">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                    <TeamBig id={feat.home} />
                    <div className="w-32 text-center">
                      {isLive(feat) ? (
                        <>
                          <div className="font-mono-num text-5xl font-extrabold leading-none sm:text-6xl">
                            <span className="text-volt text-glow">{feat.homeScore}</span>
                            <span className="mx-1.5 text-mut-2">:</span>
                            <span className="text-fg">{feat.awayScore}</span>
                          </div>
                          <div className="mt-3 flex justify-center">
                            <LiveBadge m={feat} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-mono-num text-4xl font-extrabold">{feat.kickoff}</div>
                          <div className="mt-2 text-[11px] text-mut">{feat.kickoffAt && new Date(feat.kickoffAt).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}</div>
                        </>
                      )}
                    </div>
                    <TeamBig id={feat.away} />
                  </div>
                  {feat.venue && <p className="mt-5 text-center text-[12px] text-mut-2">{feat.venue}</p>}
                </button>
                {spotlight.length > 1 && (
                  <div className="relative mt-4 flex justify-center gap-1.5">
                    {spotlight.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => setHeroIdx(i)}
                        aria-label={`Show match ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-volt" : "w-1.5 bg-line hover:bg-mut-2"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-center text-sm text-mut">
                {online === false ? "Live scores are unavailable right now." : online === null ? "Loading live scores…" : "No matches scheduled in the next day."}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Today */}
      <div className="mt-8 mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Today&rsquo;s matches</h2>
          <p className="text-sm text-mut">Live and upcoming, updated in real time</p>
        </div>
        <button onClick={() => go("scores")} className="shrink-0 text-sm font-semibold text-volt hover:underline">
          All scores →
        </button>
      </div>
      {matchLeagues.length > 1 && <LeagueFilters leagues={matchLeagues} active={league} onChange={setLeague} />}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && <p className="card col-span-full rounded-2xl px-6 py-12 text-center text-sm text-mut">No more matches today.</p>}
        {list.map((m, i) => (
          <div key={m.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
            <MatchCard match={m} onOpen={onOpen} />
          </div>
        ))}
      </div>

      {/* Top leagues */}
      <div className="mt-10 mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Leagues &amp; leaders</h2>
          <p className="text-sm text-mut">Who sits on top across {leagueCatalog.length} competitions</p>
        </div>
        <button onClick={() => onLeague("")} className="shrink-0 text-sm font-semibold text-volt hover:underline">
          All competitions →
        </button>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {leagueCatalog.map((l) => {
          const leader = tableFor(l.name)[0]?.rows[0]
          const liveHere = live.filter((m) => m.league === l.name).length
          return (
            <button key={l.name} onClick={() => onLeague(l.name)} className="card card-hover relative w-56 shrink-0 overflow-hidden rounded-2xl p-4 text-left">
              <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-2xl" style={{ background: l.accent }} />
              <div className="relative flex items-center gap-3">
                <LeagueLogo src={l.logo} accent={l.accent} size={40} label={l.short} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{l.name}</div>
                  <div className="truncate text-[11px] text-mut">{l.country}</div>
                </div>
                {liveHere > 0 && <span className="rounded-full bg-live/15 px-2 py-0.5 text-[10px] font-bold text-live">{liveHere} live</span>}
              </div>
              {leader && (
                <div className="relative mt-4 flex items-center gap-2 rounded-xl bg-white/[0.04] px-2.5 py-2">
                  <Crest id={leader.team} size={20} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{teams[leader.team]?.name}</span>
                  <span className="font-mono-num text-[12px] font-bold text-volt">{leader.pts}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Follow CTA */}
      <section className="relative mt-8 overflow-hidden rounded-3xl border border-line">
        <BackgroundSlider images={[photos.goalCelebration, photos.stadiumNight, photos.crowdBanner, photos.stadiumPacked]} position="center 35%" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="relative flex flex-col items-start gap-4 p-8 sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cobalt/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cobalt">Your clubs</span>
          <h2 className="max-w-xl font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl">Never miss a goal from the clubs you follow.</h2>
          <p className="max-w-md text-[15px] text-mut">Follow clubs to get goal, kick-off and full-time alerts, and join every match&rsquo;s live chat.</p>
          <button
            onClick={() => go(user ? "notifications" : "signin")}
            className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_28px_rgba(61,255,136,0.55)]"
          >
            {user ? "Your alerts" : "Create a free account"}
          </button>
        </div>
      </section>
    </div>
  )
}

function TeamBig({ id }: { id: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <Crest id={id} size={48} />
      <span className="line-clamp-2 w-full text-[13px] font-bold leading-4">{teams[id]?.name ?? id}</span>
    </div>
  )
}
