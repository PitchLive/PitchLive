import { teams, type Match } from "../data"
import { useLive } from "../api/LiveProvider"
import type { Page } from "../components/Navbar"
import { LiveBadge } from "../components/ui"
import LiveChat from "../components/LiveChat"
import { photos } from "../imports/photos"

// Card artwork only; the stream itself is attached per match by an admin.
const ART = [photos.stadiumNight, photos.pitchAerial, photos.crowdBanner, photos.stadiumPacked, photos.goalCelebration]

const isLive = (m: Match) => m.status === "LIVE" || m.status === "HT"

export default function Streaming({ onOpen, go }: { onOpen: (id: string) => void; go: (p: Page) => void }) {
  const { matches } = useLive()
  const streamed = matches.filter((m) => m.hasStream && m.status !== "FT").sort((a, b) => Number(isLive(b)) - Number(isLive(a)))
  const liveCount = streamed.filter(isLive).length
  const chatMatch = streamed.find(isLive)?.id

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-line">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${photos.pitchAerial})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="relative flex flex-col gap-2 p-7 sm:p-10">
          {liveCount > 0 && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-live/15 px-3 py-1 text-[11px] font-bold text-live">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> {liveCount} {liveCount === 1 ? "STREAM" : "STREAMS"} LIVE
            </span>
          )}
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Streaming</h1>
          <p className="max-w-md text-sm text-mut">Matches PitchLive is licensed to show, with the live chat alongside.</p>
        </div>
      </section>

      <div className={`grid gap-6 ${chatMatch ? "lg:grid-cols-[1fr_320px]" : ""}`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {streamed.length === 0 && (
            <div className="card col-span-full rounded-2xl px-6 py-16 text-center">
              <p className="text-sm text-mut">No matches are being streamed right now.</p>
              <button onClick={() => go("scores")} className="mt-4 rounded-full bg-volt px-5 py-2.5 text-sm font-bold text-ink">
                Follow live scores
              </button>
            </div>
          )}
          {streamed.map((m, i) => (
            <button key={m.id} onClick={() => onOpen(m.id)} className="card card-hover group overflow-hidden rounded-2xl text-left">
              <div className="relative aspect-video overflow-hidden bg-ink-2">
                <img src={ART[i % ART.length]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute left-3 top-3">
                  {isLive(m) ? <LiveBadge m={m} /> : <span className="rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-fg backdrop-blur">{m.kickoff}</span>}
                </div>
              </div>
              <div className="p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mut-2">{m.league}</div>
                <div className="mt-0.5 truncate font-semibold text-fg">
                  {teams[m.home]?.name} vs {teams[m.away]?.name}
                </div>
              </div>
            </button>
          ))}
        </div>

        {chatMatch && (
          <aside className="hidden h-[560px] lg:block">
            <LiveChat matchId={chatMatch} onSignIn={() => go("signin")} />
          </aside>
        )}
      </div>
    </div>
  )
}
