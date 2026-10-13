import { matches, standings, teams, type Standing } from "../data"
import { Crest, LiveBadge } from "../components/ui"
import { photos } from "../imports/photos"

const FORMATION = [
  { pos: "GK", n: 1 },
  { pos: "RB", n: 2 },
  { pos: "CB", n: 4 },
  { pos: "CB", n: 5 },
  { pos: "LB", n: 3 },
  { pos: "CM", n: 6 },
  { pos: "CM", n: 8 },
  { pos: "CAM", n: 10 },
  { pos: "RW", n: 7 },
  { pos: "ST", n: 9 },
  { pos: "LW", n: 11 },
]

const pts = (s: Standing) => s.pts ?? s.w * 3 + s.d
const gd = (s: Standing) => s.gf - s.ga

export default function Team({ id, onOpen, onTeam, back }: {
  id: string
  onOpen: (id: string) => void
  onTeam: (id: string) => void
  back: () => void
}) {
  const t = teams[id]
  if (!t) return null

  const table = [...standings].sort((a, b) => pts(b) - pts(a) || gd(b) - gd(a))
  const standing = standings.find((s) => s.team === id)
  const position = standing ? table.findIndex((s) => s.team === id) + 1 : null

  const fixtures = matches.filter((m) => m.home === id || m.away === id)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-mut hover:text-fg">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Club header */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel">
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
              {t.city} · <span className="font-semibold text-fg">{t.short}</span>
            </p>
          </div>
          {position && (
            <div className="sm:ml-auto flex items-center gap-2 rounded-2xl border border-line bg-ink-2/70 px-5 py-3 text-center">
              <div>
                <div className="font-mono-num text-2xl font-extrabold text-volt">#{position}</div>
                <div className="text-[11px] uppercase tracking-wider text-mut-2">League</div>
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
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-panel px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-mut-2">Recent Form</span>
          <span className="flex gap-1.5">
            {standing.form.map((f, i) => (
              <span
                key={i}
                className={`grid h-6 w-6 place-items-center rounded text-[11px] font-bold ${
                  f === "W" ? "bg-volt/20 text-volt" : f === "D" ? "bg-line text-mut" : "bg-live/20 text-live"
                }`}
              >
                {f}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Fixtures */}
        <section className="rounded-2xl border border-line bg-panel">
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

        {/* Squad */}
        <section className="rounded-2xl border border-line bg-panel">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-mut">Squad</h2>
            <span className="rounded bg-line px-2 py-0.5 text-[11px] font-semibold text-mut">4-3-3</span>
          </div>
          <ul className="p-2">
            {FORMATION.map((p, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-panel-2">
                <span
                  className="grid h-7 w-7 place-items-center rounded-md font-mono-num text-[12px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color2})` }}
                >
                  {p.n}
                </span>
                <span className="w-10 text-[11px] font-semibold text-mut-2">{p.pos}</span>
                <span className="text-sm text-fg">{t.city} Player {p.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Related clubs */}
      <div className="mt-6">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-mut">Explore Clubs</h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {Object.values(teams)
            .filter((x) => x.id !== id)
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
    <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
      <div className={`font-mono-num text-2xl font-extrabold ${accent ? "text-volt" : "text-fg"}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-mut-2">{label}</div>
    </div>
  )
}
