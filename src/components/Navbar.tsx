import { useState } from "react"
import { teams, leagues } from "../data"
import logo from "../imports/Gemini_Generated_Image_gjm08ggjm08ggjm0.png"

const NAV: { key: Page; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "scores", label: "Live Scores" },
  { key: "competitions", label: "Competitions" },
  { key: "streaming", label: "Streaming" },
  { key: "news", label: "News" },
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
  | "news"
  | "about"
  | "fixtures"
  | "help"
  | "terms"
  | "privacy"

export default function Navbar({ page, go, onTeam }: { page: Page; go: (p: Page) => void; onTeam: (id: string) => void }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)

  const results = q.trim()
    ? [
        ...Object.values(teams)
          .filter((t) => t.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 4)
          .map((t) => ({ kind: "Team", label: t.name, sub: t.league ?? t.city, id: t.id })),
        ...leagues
          .filter((l) => l.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3)
          .map((l) => ({ kind: "League", label: l, sub: "Competition", id: l })),
      ]
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 glass">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:h-24">
        <button onClick={() => go("home")} className="flex items-center shrink-0" aria-label="PITCHLIVE home">
          <img src={logo} alt="PITCHLIVE" className="h-14 w-auto object-contain sm:h-16 lg:h-[72px]" />
        </button>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => go(n.key)}
              className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                page === n.key ? "text-fg" : "text-mut hover:text-fg"
              }`}
            >
              {n.label}
              {page === n.key && <span className="absolute inset-x-3 -bottom-1.5 h-0.5 rounded-full bg-volt" />}
            </button>
          ))}
        </nav>

        <div className="relative ml-auto hidden w-full max-w-xs md:block">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-ink-2 px-3 py-2 focus-within:border-volt/50">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-mut-2" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search teams, leagues…"
              className="w-full bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none"
            />
            <kbd className="hidden rounded border border-line px-1.5 text-[10px] text-mut-2 lg:block">/</kbd>
          </div>
          {open && results.length > 0 && (
            <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
              {results.map((r) => (
                <button
                  key={r.kind + r.id}
                  onClick={() => {
                    setQ(r.label)
                    if (r.kind === "Team") onTeam(r.id)
                    else go("competitions")
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-panel-2"
                >
                  <span>
                    <span className="block text-sm font-semibold text-fg">{r.label}</span>
                    <span className="text-[11px] text-mut">{r.sub}</span>
                  </span>
                  <span className="rounded bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mut">{r.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => go("notifications")} aria-label="Notifications" className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-ink-2 hover:text-fg ${page === "notifications" ? "text-volt" : "text-mut"}`}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-live px-1 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <button onClick={() => go("signin")} className="hidden shrink-0 rounded-lg bg-volt px-4 py-2 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_20px_rgba(61,255,136,0.5)] sm:block">
          Sign In
        </button>

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
