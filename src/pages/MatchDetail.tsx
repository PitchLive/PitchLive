import { useEffect, useState } from "react"
import { teams, commentary, streams } from "../data"
import { useLive } from "../api/LiveProvider"
import type { Page } from "../components/Navbar"
import { Crest, LiveBadge } from "../components/ui"
import VideoPlayer from "../components/VideoPlayer"
import LiveChat from "../components/LiveChat"

const TABS = ["Overview", "Lineups", "Stats", "Commentary", "Stream"] as const
type Tab = (typeof TABS)[number]

const STATS = [
  { label: "Possession", h: 58, a: 42, pct: true },
  { label: "Shots", h: 14, a: 9 },
  { label: "Shots on Target", h: 6, a: 3 },
  { label: "Corners", h: 7, a: 4 },
  { label: "Fouls", h: 8, a: 12 },
  { label: "Pass Accuracy", h: 87, a: 79, pct: true },
]

const FORMATION = ["GK", "RB", "CB", "CB", "LB", "CM", "CM", "CAM", "RW", "ST", "LW"]

export default function MatchDetail({ id, onTeam, go, back }: { id: string; onTeam: (id: string) => void; go: (p: Page) => void; back: () => void }) {
  const { getMatch, loadMatch } = useLive()
  const m = getMatch(id)
  const [tab, setTab] = useState<Tab>("Overview")
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

  const stream = streams.find((s) => s.match === m.id)
  const thumb = stream?.thumb ?? "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=675&fit=crop&auto=format"
  const home = teams[m.home]
  const away = teams[m.away]

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-mut hover:text-fg">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Scoreboard header */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 20% 0%, ${home.color}55, transparent 55%), radial-gradient(circle at 80% 100%, ${away.color}55, transparent 55%)` }}
        />
        <div className="relative grid grid-cols-3 items-center gap-3 p-6 sm:p-10">
          <TeamCol id={m.home} onTeam={onTeam} />
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <LiveBadge minute={m.minute} status={m.status} />
            </div>
            <div className="font-mono-num text-5xl font-extrabold leading-none sm:text-7xl">
              <span className="text-volt text-glow">{m.homeScore}</span>
              <span className="mx-2 text-mut-2">:</span>
              <span className="text-fg">{m.awayScore}</span>
            </div>
            <div className="mt-2 text-[12px] uppercase tracking-widest text-mut">{m.league}</div>
            {m.status === "UPCOMING" && m.kickoff && <div className="mt-1 font-mono-num text-sm text-fg/80">Kick-off {m.kickoff}</div>}
            {m.venue && <div className="mt-1 text-[12px] text-mut-2">{m.venue}</div>}
          </div>
          <TeamCol id={m.away} onTeam={onTeam} />
        </div>
      </section>

      {/* Tabs */}
      <div className="no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t ? "text-fg" : "text-mut hover:text-fg"
            }`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-volt" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Overview" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <VideoPlayer thumb={thumb} viewers={m.viewers ?? 120000} title={`${home.name} vs ${away.name}`} live={m.status === "LIVE"} />
              <div className="grid gap-3 sm:grid-cols-2">
                {commentary.slice(0, 4).map((c, i) => (
                  <CommentaryRow key={i} {...c} />
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-line bg-panel p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-mut">Key Stats</h3>
              {STATS.slice(0, 4).map((s) => (
                <StatBar key={s.label} {...s} hColor={home.color} aColor={away.color} />
              ))}
            </div>
          </div>
        )}

        {tab === "Lineups" && (
          <div className="grid gap-6 md:grid-cols-2">
            {[m.home, m.away].map((tid) => (
              <div key={tid} className="rounded-2xl border border-line bg-panel p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <Crest id={tid} size={32} />
                  <span className="font-bold">{teams[tid].name}</span>
                  <span className="ml-auto rounded bg-line px-2 py-0.5 text-[11px] font-semibold text-mut">4-3-3</span>
                </div>
                <ul className="space-y-1">
                  {FORMATION.map((pos, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-panel-2">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-2 font-mono-num text-[11px] font-bold text-volt">
                        {i + 1}
                      </span>
                      <span className="w-9 text-[11px] font-semibold text-mut-2">{pos}</span>
                      <span className="text-sm text-fg">
                        {teams[tid].city} Player {i + 1}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "Stats" && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-line bg-panel p-6">
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span style={{ color: home.color }}>{home.short}</span>
              <span style={{ color: away.color }}>{away.short}</span>
            </div>
            {STATS.map((s) => (
              <StatBar key={s.label} {...s} hColor={home.color} aColor={away.color} />
            ))}
          </div>
        )}

        {tab === "Commentary" && (
          <div className="mx-auto max-w-2xl space-y-3">
            {commentary.map((c, i) => (
              <CommentaryRow key={i} {...c} />
            ))}
          </div>
        )}

        {tab === "Stream" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <VideoPlayer thumb={thumb} viewers={m.viewers ?? 120000} title={`${home.name} vs ${away.name}`} live={m.status === "LIVE"} />
            <div className="h-[420px] lg:h-auto">
              <LiveChat matchId={m.id} onSignIn={() => go("signin")} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamCol({ id, onTeam }: { id: string; onTeam: (id: string) => void }) {
  return (
    <button onClick={() => onTeam(id)} className="flex flex-col items-center gap-3 text-center hover:text-volt">
      <Crest id={id} size={72} />
      <span className="font-display text-lg font-bold leading-tight sm:text-2xl">{teams[id].name}</span>
    </button>
  )
}

function StatBar({ label, h, a, pct, hColor, aColor }: { label: string; h: number; a: number; pct?: boolean; hColor: string; aColor: string }) {
  const total = h + a || 1
  const hp = pct ? h : (h / total) * 100
  return (
    <div>
      <div className="mb-1 flex justify-between text-[13px] font-mono-num">
        <span className="font-bold text-fg">{h}{pct ? "%" : ""}</span>
        <span className="text-mut">{label}</span>
        <span className="font-bold text-fg">{a}{pct ? "%" : ""}</span>
      </div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        <div className="h-full rounded-l-full" style={{ width: `${hp}%`, background: hColor }} />
        <div className="h-full flex-1 rounded-r-full" style={{ background: aColor, opacity: 0.5 }} />
      </div>
    </div>
  )
}

function CommentaryRow({ min, type, text }: { min: string; type: string; text: string }) {
  const dot =
    type === "goal" ? "bg-volt text-ink" : type === "card" ? "bg-amber text-ink" : type === "sub" ? "bg-cobalt text-white" : "bg-line text-mut"
  const icon = type === "goal" ? "⚽" : type === "card" ? "▮" : type === "sub" ? "⇄" : "•"
  return (
    <div className="flex gap-3 rounded-xl border border-line-soft bg-panel/60 p-3">
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono-num text-[12px] font-bold text-mut">{min}</span>
        <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${dot}`}>{icon}</span>
      </div>
      <p className={`text-[13px] leading-relaxed ${type === "goal" ? "font-semibold text-fg" : "text-fg/80"}`}>{text}</p>
    </div>
  )
}
