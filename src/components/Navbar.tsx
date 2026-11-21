import { useEffect, useRef, useState } from "react"
import { useLive } from "../api/LiveProvider"
import { teams } from "../data"
import { leagueCatalog } from "../leagueInfo"
import { Crest, LeagueLogo } from "./ui"
import Wordmark from "./Wordmark"

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
          // The same club can be listed twice (bundled and from the feed); show it once.
          .filter((t, i, all) => all.findIndex((x) => x.name === t.name) === i)
          .slice(0, 6)
          .map((t) => ({ kind: "Team", label: t.name, sub: t.league ?? t.city, id: t.id })),
      ]
    : []

  return (
    // Painted under the notch (viewport-fit=cover); the safe-area padding keeps the content below it.
    <header className="sticky top-0 z-50 border-b border-white/[0.06] glass" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:h-[88px]">
        <button onClick={() => go("home")} className="flex shrink-0 items-center rounded-lg text-[15px] sm:text-[17px] lg:text-[19px]" aria-label="PitchLive home">
          <Wordmark className="h-8 sm:h-9 lg:h-10" />
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

        <div className="ml-auto flex min-w-0 items-center justify-end gap-2 sm:gap-3">
        <div className="relative hidden w-full max-w-xs md:block lg:w-72">
          <SearchField q={q} setQ={setQ} setOpen={setOpen} />
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

        <button onClick={() => go("notifications")} aria-label="Notifications" className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] hover:text-fg ${page === "notifications" ? "text-volt" : "text-mut"}`}>
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

        <button
          onClick={() => setMenu((m) => !m)}
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-fg lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {menu ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
          </svg>
        </button>
        </div>
      </div>

      {menu && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-line px-4 py-3 lg:hidden">
          <div className="mb-2 md:hidden">
            <SearchField q={q} setQ={setQ} setOpen={setOpen} />
            {needle && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-panel/95 py-1">
                {results.length === 0 && <p className="px-3 py-3 text-sm text-mut">Nothing found for &ldquo;{q.trim()}&rdquo;.</p>}
                {results.map((r) => (
                  <button
                    key={r.kind + r.id}
                    onClick={() => {
                      setQ("")
                      setMenu(false)
                      if (r.kind === "Team") onTeam(r.id)
                      else onLeague(r.id)
                    }}
                    className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left"
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
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => {
                go(n.key)
                setMenu(false)
              }}
              className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[15px] font-semibold ${
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
        className="h-11 shrink-0 whitespace-nowrap rounded-full bg-volt px-4 text-sm font-bold text-ink hover:shadow-[0_0_20px_rgba(61,255,136,0.5)] sm:px-5"
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
        className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-volt to-cobalt font-display text-sm font-black text-ink ring-2 ring-white/10"
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

/** The search box (header on tablets and up, the menu on phones). */
function SearchField({ q, setQ, setOpen }: { q: string; setQ: (v: string) => void; setOpen: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 transition-colors focus-within:border-volt/50 focus-within:bg-white/[0.06]">
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-mut-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3-3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        enterKeyHint="search"
        autoCapitalize="none"
        autoCorrect="off"
        aria-label="Search clubs and leagues"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search clubs & leagues…"
        className="w-full min-w-0 bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="hidden rounded border border-line px-1.5 text-[10px] text-mut-2 lg:block">/</kbd>
    </div>
  )
}
