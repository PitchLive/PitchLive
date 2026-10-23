import { useEffect, useState } from "react"
import { matches as demoMatches, teams, type Match } from "../data"
import { useLive } from "../api/LiveProvider"
import { leagueCatalog, tableFor } from "../leagueInfo"
import { Crest, LeagueLogo, LiveBadge, fmtViewers } from "../components/ui"
import MatchCard from "../components/MatchCard"
import LeagueFilters from "../components/LeagueFilters"
import BackgroundSlider from "../components/BackgroundSlider"
import { photos } from "../imports/photos"

// Deterministic, plausible live stats derived from the match so each slide differs.
function liveStats(m: Match) {
  const seed = m.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const poss = 42 + ((seed + m.homeScore * 5) % 17) // 42–58%
  const shots = 6 + ((seed + m.homeScore + m.awayScore) % 12) // 6–17
  const sot = Math.max(m.homeScore, 2) + (seed % 4) // >= goals
  return { poss, shots, sot }
}

export default function Home({ onOpen, onLeague }: { onOpen: (id: string) => void; onLeague: (name: string) => void }) {
  const { matches } = useLive()
  const matchLeagues = leagueCatalog.map((l) => l.name).filter((l) => matches.some((m) => m.league === l))
  const [league, setLeague] = useState("All")

  // Current ongoing matches drive the hero carousel.
  const liveMatches = matches.filter((m) => m.status === "LIVE" || m.status === "HT")
  const heroMatches = liveMatches.length
    ? liveMatches
    : [matches.find((m) => m.status === "UPCOMING") ?? matches[0] ?? demoMatches.find((m) => m.featured) ?? demoMatches[0]!]
  const [heroIdx, setHeroIdx] = useState(0)
  const idx = heroIdx % heroMatches.length
  const feat = heroMatches[idx]
  const stats = liveStats(feat)

  useEffect(() => {
    if (heroMatches.length <= 1) return
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroMatches.length), 5500)
    return () => clearInterval(t)
  }, [heroMatches.length])

  const list = matches
    .filter((m) => (league === "All" ? true : m.league === league))
    .filter((m) => m.status !== "FT")
    .slice(0, 6)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-panel shadow-2xl shadow-black/40">
        <div className="absolute inset-0 opacity-55">
          <BackgroundSlider
            images={[photos.scorerRun, photos.aerialDuel, photos.teamHighFive, photos.goalCelebration]}
            interval={6000}
            position="center 30%"
            showIndicators={false}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-2">
              <LiveBadge minute={feat.minute} status={feat.status} />
              <span className="text-[12px] font-semibold uppercase tracking-widest text-mut">{feat.league}</span>
            </div>
            <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              {teams[feat.home].name.toUpperCase()}
              <span className="mx-3 text-volt">vs</span>
              {teams[feat.away].name.toUpperCase()}
            </h1>
            <p className="mt-4 max-w-md text-[15px] text-mut">
              The tie of the round is on a knife-edge. Stream it in 4K, follow every touch, and track the stats live —
              all from one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpen(feat.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_28px_rgba(61,255,136,0.55)]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Live
              </button>
              <button
                onClick={() => onOpen(feat.id)}
                className="rounded-xl border border-line bg-ink-2/70 px-5 py-3 text-sm font-bold text-fg hover:border-volt/40"
              >
                Match Centre
              </button>
              <span className="flex items-center gap-1.5 text-[13px] text-mut">
                <span className="live-dot inline-block h-2 w-2 rounded-full bg-live" />
                {fmtViewers(feat.viewers ?? 0)} watching
              </span>
            </div>
          </div>

          {/* Ongoing-matches spotlight carousel */}
          <div className="glass relative flex h-[400px] flex-col overflow-hidden rounded-2xl border border-line p-5">
            {/* Spotlight backdrop: team-tinted radial glows (blue → red) + oversized ball graphic bleeding in from the corner */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(circle at 12% 18%, ${teams[feat.home].color}4d, transparent 48%), radial-gradient(circle at 90% 85%, ${teams[feat.away].color}4d, transparent 50%)` }}
            />
            <BallGlyph className="pointer-events-none absolute -left-16 -top-14 h-64 w-64 text-white/[0.05]" />

            {/* Dashed inner frame holding the current slide */}
            <div key={feat.id} className="relative flex flex-1 flex-col rounded-xl border border-dashed border-white/15 p-5">
              <div className="mb-3 flex h-5 shrink-0 items-center justify-between gap-3">
                <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-mut-2">
                  <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" />
                  Live Match Spotlight
                </span>
                {heroMatches.length > 1 && (
                  <span className="shrink-0 whitespace-nowrap font-mono-num text-[11px] font-semibold text-mut">
                    {idx + 1} / {heroMatches.length}
                  </span>
                )}
              </div>

              <button onClick={() => onOpen(feat.id)} className="block flex-1 text-left">
                <div className="grid h-[92px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                  <TeamBig key={feat.home} id={feat.home} />
                  <div className="w-28 shrink-0 text-center">
                    <div className="font-mono-num text-5xl font-extrabold leading-none sm:text-6xl">
                      <span className="text-volt text-glow">{feat.homeScore}</span>
                      <span className="mx-1.5 text-mut-2">:</span>
                      <span className="text-fg">{feat.awayScore}</span>
                    </div>
                    <div className="mt-2 font-mono-num text-sm text-live">
                      {feat.status === "HT" ? "HT" : `${feat.minute}′`}
                    </div>
                  </div>
                  <TeamBig key={feat.away} id={feat.away} />
                </div>
                <div className="mt-5 grid h-16 grid-cols-3 gap-3 border-t border-line pt-4 text-center">
                  <Stat label="Possession" value={`${stats.poss}%`} />
                  <Stat label="Shots" value={`${stats.shots}`} />
                  <Stat label="On Target" value={`${stats.sot}`} />
                </div>
              </button>
            </div>

            {heroMatches.length > 1 && (
              <div className="relative mt-4 flex items-center justify-between">
                <button
                  onClick={() => setHeroIdx((i) => (i - 1 + heroMatches.length) % heroMatches.length)}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-panel-2 px-5 py-2.5 text-[13px] font-bold text-fg shadow-lg shadow-black/30 transition-colors hover:border-volt/50 hover:text-volt"
                >
                  <span aria-hidden>‹</span> Prev
                </button>

                <div className="flex gap-1.5">
                  {heroMatches.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setHeroIdx(i)}
                      aria-label={`Show match ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-volt" : "w-1.5 bg-line hover:bg-mut-2"}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setHeroIdx((i) => (i + 1) % heroMatches.length)}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-panel-2 px-5 py-2.5 text-[13px] font-bold text-fg shadow-lg shadow-black/30 transition-colors hover:border-volt/50 hover:text-volt"
                >
                  Next <span aria-hidden>›</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* League filters */}
      <div className="mt-8 mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Today&rsquo;s Matches</h2>
          <p className="text-sm text-mut">Live &amp; upcoming across every competition</p>
        </div>
      </div>
      <LeagueFilters leagues={matchLeagues} active={league} onChange={setLeague} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m, i) => (
          <div key={m.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
            <MatchCard match={m} onOpen={onOpen} />
          </div>
        ))}
      </div>

      {/* Top leagues */}
      <div className="mt-10 mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Leagues &amp; Leaders</h2>
          <p className="text-sm text-mut">Who sits on top across {leagueCatalog.length} competitions right now</p>
        </div>
        <button onClick={() => onLeague("")} className="shrink-0 text-sm font-semibold text-volt hover:underline">
          All competitions →
        </button>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {leagueCatalog.map((l) => {
          const leader = tableFor(l.name)[0]?.rows[0]
          return (
            <button
              key={l.name}
              onClick={() => onLeague(l.name)}
              className="card card-hover relative w-56 shrink-0 overflow-hidden rounded-2xl p-4 text-left"
            >
              <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-2xl" style={{ background: l.accent }} />
              <div className="relative flex items-center gap-3">
                <LeagueLogo src={l.logo} accent={l.accent} size={40} label={l.short} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{l.name}</div>
                  <div className="truncate text-[11px] text-mut">{l.country}</div>
                </div>
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

      {/* Streaming CTA band */}
      <section className="relative mt-8 overflow-hidden rounded-3xl border border-line">
        <BackgroundSlider
          images={[photos.goalCelebration, photos.stadiumNight, photos.crowdBanner, photos.stadiumPacked, photos.pitchAerial]}
          position="center 35%"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="relative flex flex-col items-start gap-4 p-8 sm:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cobalt/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cobalt">
            Every match · 4K
          </span>
          <h2 className="max-w-xl font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            The atmosphere of the stands, streamed to your screen.
          </h2>
          <p className="max-w-md text-[15px] text-mut">
            Watch every fixture live in ultra-HD with real-time stats, multi-cam angles, and a roaring live chat.
          </p>
          <button
            onClick={() => onOpen(feat.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_28px_rgba(61,255,136,0.55)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Watching
          </button>
        </div>
      </section>
    </div>
  )
}

// Decorative original soccer-ball glyph (pentagon-and-seams motif) for the spotlight backdrop.
function BallGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="50" cy="50" r="46" />
      <path d="M50 22l16 12-6 19H40l-6-19z" fill="currentColor" stroke="none" opacity="0.5" />
      <path d="M50 22V6M66 34l14-9M60 53l12 15M40 53L28 68M34 34L20 25" />
    </svg>
  )
}

function TeamBig({ id }: { id: string }) {
  return (
    <div className="flex h-[84px] min-w-0 flex-col items-center justify-start gap-1.5 overflow-hidden text-center">
      <Crest id={id} size={40} />
      <span className="h-8 w-full overflow-hidden text-[12px] font-bold leading-4">{teams[id].name}</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-num text-lg font-bold text-fg">{value}</div>
      <div className="truncate text-[10px] uppercase tracking-wide text-mut-2">{label}</div>
    </div>
  )
}
