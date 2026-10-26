import { useState } from "react"
import { teams, type Match } from "../data"
import { useClock } from "../api/clock"

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

export function FormPills({ form, size = 20 }: { form: ("W" | "D" | "L")[]; size?: number }) {
  if (form.length === 0) return <span className="text-mut-2">—</span>
  return (
    <span className="flex gap-1">
      {form.map((f, i) => (
        <span
          key={i}
          className={`grid place-items-center rounded-md font-bold ${
            f === "W" ? "bg-volt/15 text-volt" : f === "D" ? "bg-white/[0.06] text-mut" : "bg-live/15 text-live"
          }`}
          style={{ width: size, height: size, fontSize: size * 0.5 }}
        >
          {f}
        </span>
      ))}
    </span>
  )
}
