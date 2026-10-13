import { teams, type Match } from "../data"

export function Crest({ id, size = 40 }: { id: string; size?: number }) {
  const t = teams[id]
  if (!t) return null
  const r = size / 2
  if (t.logo) {
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

export function LiveBadge({ minute, status }: { minute?: number; status: Match["status"] }) {
  if (status === "FT")
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide bg-line text-mut">FT</span>
  if (status === "UPCOMING") return null
  const label = status === "HT" ? "HT" : `${minute}'`
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-bold text-live">
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" />
      {label}
    </span>
  )
}

export function QualityBadge({ q }: { q: "HD" | "4K" | "FHD" }) {
  return (
    <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-volt ring-1 ring-volt/40">
      {q}
    </span>
  )
}

export function fmtViewers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return `${n}`
}

const icons = {
  card: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <rect x="7" y="3" width="10" height="18" rx="1.5" />
    </svg>
  ),
  sub: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 8h11l-3-3M20 16H9l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export function StatChip({ kind, value, tone = "amber" }: { kind: "card" | "sub"; value: number; tone?: string }) {
  if (!value) return null
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-mono-num text-mut`}>
      <span className={tone === "amber" ? "text-amber" : "text-cobalt"}>{icons[kind]}</span>
      {value}
    </span>
  )
}
