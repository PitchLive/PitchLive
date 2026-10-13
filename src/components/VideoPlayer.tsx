import { useRef, useState } from "react"
import { fmtViewers, QualityBadge } from "./ui"

export default function VideoPlayer({
  thumb,
  viewers,
  title,
  live = true,
}: {
  thumb: string
  viewers: number
  title: string
  live?: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [captions, setCaptions] = useState(false)
  const [progress, setProgress] = useState(67)
  const playerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={playerRef} className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
      <img src={thumb} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          {live && (
            <span className="inline-flex items-center gap-1.5 rounded bg-live px-2 py-0.5 text-[11px] font-bold text-white">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-white" /> LIVE
            </span>
          )}
          <QualityBadge q="4K" />
        </div>
        <span className="flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-fg backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-live" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          </svg>
          {fmtViewers(viewers)}
        </span>
      </div>

      {/* center play */}
      <button
        onClick={() => setPlaying((p) => !p)}
        className="absolute inset-0 grid place-items-center"
        aria-label={playing ? "Pause" : "Play"}
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-volt/90 text-ink shadow-[0_0_40px_rgba(61,255,136,0.6)] transition-transform group-hover:scale-105">
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      </button>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <button
          onClick={() => setProgress((value) => (value >= 90 ? 15 : value + 15))}
          className="mb-2 block h-1 w-full overflow-hidden rounded-full bg-white/25"
          aria-label="Seek forward"
        >
          <span className="block h-full rounded-full bg-live transition-[width]" style={{ width: `${progress}%` }} />
        </button>
        <div className="flex items-center justify-between text-fg">
          <div className="flex items-center gap-3">
            <span className="font-mono-num text-[12px] text-white/90">67:14 · LIVE</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <button onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute" : "Mute"} className={muted ? "text-live" : "hover:text-white"}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                {muted ? <path d="m16 9 5 5m0-5-5 5" strokeLinecap="round" /> : <path d="M19 5a10 10 0 0 1 0 14" strokeLinecap="round" />}
              </svg>
            </button>
            <button
              onClick={() => setCaptions((value) => !value)}
              aria-pressed={captions}
              className={`rounded border px-1.5 text-[10px] font-bold ${captions ? "border-volt bg-volt text-ink" : "border-white/30 hover:text-white"}`}
            >
              CC
            </button>
            <button
              onClick={() => playerRef.current?.requestFullscreen?.()}
              aria-label="Enter fullscreen"
              className="hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
