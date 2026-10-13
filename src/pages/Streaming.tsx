import { streams, matches, teams } from "../data"
import { QualityBadge, fmtViewers } from "../components/ui"
import LiveChat from "../components/LiveChat"
import { photos } from "../imports/photos"

function label(matchId: string) {
  const m = matches.find((x) => x.id === matchId)
  if (!m) return ""
  return `${teams[m.home].name} vs ${teams[m.away].name}`
}

export default function Streaming({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-line">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${photos.pitchAerial})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="relative flex flex-col gap-2 p-7 sm:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-live/15 px-3 py-1 text-[11px] font-bold text-live">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> {streams.filter((s) => s.live).length} STREAMS LIVE
          </span>
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Streaming</h1>
          <p className="max-w-md text-sm text-mut">Every live match and upcoming broadcast in one grid — pick a game and drop into the live chat.</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => onOpen(s.match)}
              className="group overflow-hidden rounded-2xl border border-line bg-panel text-left transition-all hover:border-volt/40"
            >
              <div className="relative aspect-video overflow-hidden bg-ink-2">
                <img
                  src={s.thumb}
                  alt={label(s.match)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  {s.live ? (
                    <span className="inline-flex items-center gap-1.5 rounded bg-live px-2 py-0.5 text-[11px] font-bold text-white">
                      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                    </span>
                  ) : (
                    <span className="rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-fg backdrop-blur">
                      {s.kickoff}
                    </span>
                  )}
                  <QualityBadge q={s.quality} />
                </div>
                {s.live && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-fg backdrop-blur">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    </svg>
                    {fmtViewers(s.viewers)}
                  </span>
                )}
                <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-volt/90 text-ink shadow-[0_0_30px_rgba(61,255,136,0.6)]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-0.5" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mut-2">{s.league}</div>
                <div className="mt-0.5 truncate font-semibold text-fg">{label(s.match)}</div>
              </div>
            </button>
          ))}
        </div>

        <aside className="hidden h-[560px] lg:block">
          <LiveChat />
        </aside>
      </div>
    </div>
  )
}
