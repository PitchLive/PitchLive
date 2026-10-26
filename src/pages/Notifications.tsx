import { useEffect, useState } from "react"
import { useLive, type Alert } from "../api/LiveProvider"
import { useNow } from "../api/clock"
import { Crest } from "../components/ui"
import type { Page } from "../components/Navbar"

const META: Record<Alert["kind"], { label: string; color: string; icon: React.ReactNode }> = {
  goal: { label: "Goal", color: "text-volt", icon: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4 2.6 1.9-1 3H10.4l-1-3L12 6Z" /> },
  kickoff: {
    label: "Kick-off",
    color: "text-live",
    icon: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm7.1-3.1a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2" />,
  },
  ht: { label: "Half-time", color: "text-amber", icon: <path d="M12 3v18M5 12h14" /> },
  ft: { label: "Full-time", color: "text-cobalt", icon: <path d="M20 6 9 17l-5-5" /> },
}

const FILTERS: { key: Alert["kind"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "goal", label: "Goals" },
  { key: "kickoff", label: "Kick-offs" },
  { key: "ft", label: "Results" },
]

function ago(at: number, now: number) {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function Notifications({ onOpen, go }: { onOpen: (id: string) => void; go: (p: Page) => void }) {
  const { user, favorites, alerts, markAlertsRead, getMatch } = useLive()
  const [filter, setFilter] = useState<Alert["kind"] | "all">("all")
  const now = useNow()

  // Opening the page counts as seeing everything on it.
  useEffect(() => {
    markAlertsRead()
  }, [alerts.length, markAlertsRead])

  const shown = alerts.filter((a) => filter === "all" || a.kind === filter)

  return (
    <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Notifications</h1>
        <p className="text-sm text-mut">Goals, kick-offs and results for the clubs you follow, as they happen.</p>
      </div>

      {!user ? (
        <Empty text="Sign in and follow clubs to get live alerts for their matches." action="Sign in" onAction={() => go("signin")} />
      ) : favorites.size === 0 ? (
        <Empty text="You're not following any clubs yet. Open a club page and tap Follow." action="Browse competitions" onAction={() => go("competitions")} />
      ) : (
        <>
          <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  filter === f.key ? "bg-volt text-ink" : "border border-white/10 bg-white/[0.03] text-mut hover:text-fg"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden rounded-2xl">
            {shown.length === 0 && (
              <p className="px-6 py-14 text-center text-sm text-mut">Nothing yet. Alerts appear here while PitchLive is open and your clubs are playing.</p>
            )}
            {shown.map((a) => {
              const meta = META[a.kind]
              const m = getMatch(a.matchId)
              return (
                <button
                  key={a.id}
                  onClick={() => onOpen(a.matchId)}
                  className="flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left last:border-0 hover:bg-white/[0.03]"
                >
                  {m ? (
                    <Crest id={favorites.has(m.home) ? m.home : m.away} size={38} />
                  ) : (
                    <span className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-ink-2 ${meta.color}`}>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {meta.icon}
                      </svg>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                      <span className="text-[11px] text-mut-2">· {ago(a.at, now)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-fg">{a.title}</div>
                    <div className="mt-0.5 truncate text-[13px] text-mut">{a.body}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function Empty({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return (
    <div className="card rounded-2xl px-6 py-14 text-center">
      <p className="text-sm text-mut">{text}</p>
      <button onClick={onAction} className="mt-4 rounded-full bg-volt px-5 py-2.5 text-sm font-bold text-ink">
        {action}
      </button>
    </div>
  )
}
