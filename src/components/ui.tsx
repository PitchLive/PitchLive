import { useState } from "react"
import { teams, type Match } from "../data"
import type { FormEntry } from "../api/client"
import { useClock, useNow } from "../api/clock"

export function Crest({ id, size = 40 }: { id: string; size?: number }) {
  const [broken, setBroken] = useState(false)
  const t = teams[id]
  if (!t) return null
  const r = size / 2
  if (t.logo && !broken) {
    return (
      <span
        className="relative inline-grid shrink-0 place-items-center overflow-hidden"
        style={{ width: size, height: size }}
        aria-label={t.name}
      >
        <img
          src={t.logo}
          alt={`${t.name} crest`}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setBroken(true)}
          className="block object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]"
          style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
        />
      </span>
    )
  }
  return (
    <span
      className="relative inline-grid place-items-center shrink-0 rounded-full"
      style={{ width: size, height: size }}
      aria-label={t.name}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" className="absolute inset-0">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={t.color} />
            <stop offset="1" stopColor={t.color2} />
          </linearGradient>
        </defs>
        <path
          d="M50 4 L90 18 V52 C90 76 72 90 50 96 C28 90 10 76 10 52 V18 Z"
          fill={`url(#g-${id})`}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <path d="M50 4 L90 18 V35 H10 V18 Z" fill="rgba(255,255,255,0.14)" />
      </svg>
      <span
        className="relative font-display font-extrabold leading-none text-white"
        style={{ fontSize: r * 0.52, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
      >
        {t.short}
      </span>
    </span>
  )
}

export function LiveBadge({ m }: { m: Match }) {
  if (m.status === "FT") return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide bg-line text-mut">FT</span>
  if (m.status === "UPCOMING") return null
  if (m.status === "POSTPONED")
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide bg-amber/15 text-amber">PPD</span>
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-bold text-live">
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" />
      <LiveClock m={m} />
    </span>
  )
}

/** The match clock, ticking every second while the match is live. */
export function LiveClock({ m }: { m: Match }) {
  return <span className="font-mono-num tabular-nums">{useClock(m)}</span>
}

export function LeagueLogo({ src, accent, size = 40, label }: { src?: string; accent: string; size?: number; label: string }) {
  const [broken, setBroken] = useState(false)
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl ring-1 ring-white/10"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${accent}33, ${accent}0d)` }}
    >
      {src && !broken ? (
        <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className="h-[68%] w-[68%] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
      ) : (
        <span className="font-display font-black text-white" style={{ fontSize: size * 0.3 }}>{label}</span>
      )}
    </span>
  )
}

/** Last-five results, oldest on the left. With details, each pill says what the result was and can open that match. */
export function FormPills({
  form,
  size = 20,
  details,
  onOpen,
}: {
  form: ("W" | "D" | "L")[]
  size?: number
  details?: FormEntry[]
  onOpen?: (matchId: string) => void
}) {
  if (form.length === 0) return <span className="text-mut-2">—</span>
  const tone = (f: string) => (f === "W" ? "bg-volt/15 text-volt" : f === "D" ? "bg-white/[0.06] text-mut" : "bg-live/15 text-live")
  return (
    <span className="flex gap-1">
      {form.map((f, i) => {
        const d = details?.[i]
        const title = d
          ? `${f} ${d.scored}-${d.conceded} ${d.home ? "vs" : "at"} ${teams[d.opponentId]?.name ?? "opponent"} · ${new Date(d.kickoff).toLocaleDateString([], { day: "numeric", month: "short" })}`
          : undefined
        const cls = `grid place-items-center rounded-md font-bold ${tone(f)}`
        const style = { width: size, height: size, fontSize: size * 0.5 }
        return d && onOpen ? (
          <button
            key={i}
            type="button"
            title={title}
            onClick={(e) => {
              e.stopPropagation()
              onOpen(d.matchId)
            }}
            className={`${cls} hover:ring-1 hover:ring-white/40`}
            style={style}
          >
            {f}
          </button>
        ) : (
          <span key={i} title={title} className={cls} style={style}>
            {f}
          </span>
        )
      })}
    </span>
  )
}

/** "Updated just now" / "Updated 4 min ago", ticking on its own so the table around it doesn't re-render. */
export function UpdatedAgo({ iso }: { iso: string | null }) {
  const now = useNow()
  if (!iso) return null
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  const text = s < 60 ? "just now" : s < 3600 ? `${Math.floor(s / 60)} min ago` : `${Math.floor(s / 3600)} h ago`
  return <span className="text-[11px] text-mut-2">Updated {text}</span>
}

/** "+2" / "−1" places versus the official table, shown in live tables. */
export function MoveArrow({ move }: { move?: number }) {
  if (!move) return null
  return (
    <span className={`font-mono-num text-[10px] font-bold ${move > 0 ? "text-volt" : "text-live"}`} title={`${move > 0 ? "Up" : "Down"} ${Math.abs(move)} in the live table`}>
      {move > 0 ? "▲" : "▼"}
      {Math.abs(move)}
    </span>
  )
}

/** The in-play score pill on a live table row, coloured by how it's going for that team. */
export function LiveResultPill({ live, onOpen }: { live?: { matchId: string; status: string; scored: number; conceded: number }; onOpen?: (id: string) => void }) {
  if (!live) return null
  const tone = live.scored > live.conceded ? "bg-volt/20 text-volt" : live.scored < live.conceded ? "bg-live/20 text-live" : "bg-white/10 text-fg/80"
  const cls = `shrink-0 rounded px-1.5 py-0.5 font-mono-num text-[10px] font-bold ${tone} ${live.status === "FT" ? "" : "ring-1 ring-live/40"}`
  const title = live.status === "FT" ? "Full-time, not yet in the official table" : "Match in progress"
  // Inside rows that are already buttons, render a plain badge (buttons can't nest).
  if (!onOpen)
    return (
      <span className={cls} title={title}>
        {live.scored}-{live.conceded}
      </span>
    )
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen(live.matchId)
      }}
      title={`${title} — open the match`}
      className={`${cls} hover:brightness-125`}
    >
      {live.scored}-{live.conceded}
    </button>
  )
}

/** A country flag image from flagcdn (covers GB-ENG/SCT/WLS/NIR and XK); falls back to the code. */
export function Flag({ code }: { code: string }) {
  const [broken, setBroken] = useState(false)
  if (broken || !/^[A-Z]{2}(-[A-Z]{3})?$/.test(code)) return <span className="text-[9px] font-bold text-mut">{code.slice(-3)}</span>
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-full w-full object-cover"
    />
  )
}

/** Placeholder rows shown while content loads (instead of an empty or "Loading…" state). */
export function SkeletonRows({ count = 6, height = 44, label = "Loading" }: { count?: number; height?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="card overflow-hidden rounded-2xl">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-white/[0.04] px-4 first:border-t-0" style={{ height }}>
          <span className="h-3 w-10 animate-pulse rounded bg-white/[0.06]" />
          <span className="h-5 w-5 animate-pulse rounded-full bg-white/[0.06]" />
          <span className="h-3 animate-pulse rounded bg-white/[0.06]" style={{ width: `${30 + ((i * 17) % 35)}%` }} />
          <span className="ml-auto h-3 w-8 animate-pulse rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  )
}
