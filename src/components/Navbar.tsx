import { useEffect, useRef, useState } from "react"
import { useLive } from "../api/LiveProvider"
import { teams } from "../data"
import { leagueCatalog } from "../leagueInfo"
import { Crest, LeagueLogo } from "./ui"
import logo from "../imports/Gemini_Generated_Image_gjm08ggjm08ggjm0.png"

const NAV: { key: Page; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "scores", label: "Live Scores" },
  { key: "competitions", label: "Competitions" },
  { key: "streaming", label: "Streaming" },
]

export type Page =
  | "home"
  | "scores"
  | "competitions"
  | "streaming"
  | "match"
  | "team"
  | "signin"
  | "notifications"
  | "about"
  | "fixtures"
  | "help"
  | "terms"
  | "privacy"

export default function Navbar({
  page,
  go,
  onTeam,
  onLeague,
}: {
  page: Page
  go: (p: Page) => void
  onTeam: (id: string) => void
  onLeague: (name: string) => void
}) {
  const { unreadAlerts } = useLive()
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)

  const needle = q.trim().toLowerCase()
  const results = needle
    ? [
        ...leagueCatalog
          .filter((l) => (l.name + " " + l.country).toLowerCase().includes(needle))
          .slice(0, 3)
          .map((l) => ({ kind: "League", label: l.name, sub: l.country, id: l.name })),
        ...Object.values(teams)
          .filter((t) => t.name.toLowerCase().includes(needle))
          .slice(0, 6)
          .map((t) => ({ kind: "Team", label: t.name, sub: t.league ?? t.city, id: t.id })),
      ]
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] glass">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:h-24">
        <button onClick={() => go("home")} className="flex items-center shrink-0" aria-label="PITCHLIVE home">
          <img src={logo} alt="PITCHLIVE" className="h-14 w-auto object-contain sm:h-16 lg:h-[72px]" />
        </button>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => go(n.key)}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                page === n.key ? "bg-white/[0.08] text-fg" : "text-mut hover:bg-white/[0.04] hover:text-fg"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="relative ml-auto hidden w-full max-w-xs md:block">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 transition-colors focus-within:border-volt/50 focus-within:bg-white/[0.06]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-mut-2" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search 340+ clubs & 18 leagues…"
              className="w-full bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none"
            />
            <kbd className="hidden rounded border border-line px-1.5 text-[10px] text-mut-2 lg:block">/</kbd>
          </div>
          {open && results.length > 0 && (
            <div className="absolute mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-panel/95 py-1 shadow-2xl shadow-black/60 backdrop-blur-xl">
              {results.map((r) => (
                <button
                  key={r.kind + r.id}
                  onClick={() => {
                    setQ(r.label)
                    if (r.kind === "Team") onTeam(r.id)
                    else onLeague(r.id)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04]"
                >
                  {r.kind === "Team" ? (
                    <Crest id={r.id} size={26} />
                  ) : (
                    <LeagueLogo src={leagueCatalog.find((l) => l.name === r.id)?.logo} accent={leagueCatalog.find((l) => l.name === r.id)?.accent ?? "#3d7bff"} size={26} label="" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-fg">{r.label}</span>
                    <span className="text-[11px] text-mut">{r.sub}</span>
                  </span>
                  <span className="rounded bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mut">{r.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => go("notifications")} aria-label="Notifications" className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] hover:text-fg ${page === "notifications" ? "text-volt" : "text-mut"}`}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
          </svg>
          {unreadAlerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-live px-1 text-[9px] font-bold text-white">
              {unreadAlerts > 9 ? "9+" : unreadAlerts}
            </span>
          )}
        </button>

        <AccountButton go={go} onTeam={onTeam} />

        <button onClick={() => setMenu((m) => !m)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-fg lg:hidden">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menu && (
        <div className="border-t border-line px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => {
                go(n.key)
                setMenu(false)
              }}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${
                page === n.key ? "bg-panel text-volt" : "text-mut"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

function AccountButton({ go, onTeam }: { go: (p: Page) => void; onTeam: (id: string) => void }) {
  const { user, logout, favorites, connected, online } = useLive()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  if (!user)
    return (
      <button
        onClick={() => go("signin")}
        className="shrink-0 rounded-full bg-volt px-4 py-2.5 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_20px_rgba(61,255,136,0.5)] sm:px-5"
      >
        Sign In
      </button>
    )

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-volt to-cobalt font-display text-sm font-black text-ink ring-2 ring-white/10"
      >
        {user.displayName.slice(0, 1).toUpperCase()}
        {online && (
          <span
            title={connected ? "Live updates connected" : "Reconnecting…"}
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-ink ${connected ? "bg-volt" : "bg-amber"}`}
          />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-panel/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <div className="truncate text-sm font-bold">{user.displayName}</div>
            <div className="truncate text-[12px] text-mut">{user.email}</div>
          </div>
          <div className="px-2 py-2">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-mut-2">Following</div>
            {favorites.size === 0 && <p className="px-2 py-1.5 text-[12px] text-mut">Follow clubs from their page.</p>}
            {[...favorites].slice(0, 6).map((id) =>
              teams[id] ? (
                <button
                  key={id}
                  onClick={() => {
                    setOpen(false)
                    onTeam(id)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-white/[0.05]"
                >
                  <Crest id={id} size={20} />
                  <span className="truncate">{teams[id].name}</span>
                </button>
              ) : null,
            )}
          </div>
          <button
            onClick={async () => {
              setOpen(false)
              await logout()
              go("home")
            }}
            className="w-full border-t border-white/[0.06] px-4 py-3 text-left text-sm font-semibold text-live hover:bg-live/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
