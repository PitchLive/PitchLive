import { useState } from "react"
import { teams } from "../data"
import { useLive } from "../api/LiveProvider"
import { Crest } from "../components/ui"
import type { Page } from "../components/Navbar"

type Kind = "goal" | "live" | "ft" | "news" | "stream"

type Note = {
  id: string
  kind: Kind
  team?: string
  match?: string
  title: string
  body: string
  time: string
  unread: boolean
}

const SEED: Note[] = [
  { id: "n1", kind: "goal", team: "ars", match: "m1", title: "GOAL · Arsenal 2–1 Real Madrid", body: "The home side restore their lead in the 67th minute. Tap to watch live.", time: "2m", unread: true },
  { id: "n2", kind: "goal", team: "atm", match: "m6", title: "GOAL · Atlético 1–3 Real Madrid", body: "Third goal for the visitors on the counter-attack.", time: "9m", unread: true },
  { id: "n3", kind: "live", team: "liv", match: "m2", title: "Kick-off · Liverpool vs Bournemouth", body: "Your followed club is now playing. Stream in 4K.", time: "23m", unread: true },
  { id: "n4", kind: "stream", match: "m5", title: "Now streaming in HD", body: "Barcelona vs Sevilla is live with 1.2M viewers.", time: "41m", unread: false },
  { id: "n5", kind: "ft", team: "bay", match: "m9", title: "Full-time · Bayern 2–2 Dortmund", body: "Der Klassiker ends level. See the highlights.", time: "1h", unread: false },
  { id: "n6", kind: "news", title: "Transfer Window", body: "Five deadline-day deals you might have missed.", time: "3h", unread: false },
]

const META: Record<Kind, { label: string; color: string; icon: React.ReactNode }> = {
  goal: {
    label: "Goal",
    color: "text-volt",
    icon: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4 2.6 1.9-1 3H10.4l-1-3L12 6Z" />,
  },
  live: {
    label: "Live",
    color: "text-live",
    icon: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm7.1-3.1a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2" />,
  },
  ft: { label: "Result", color: "text-cobalt", icon: <path d="M20 6 9 17l-5-5" /> },
  stream: { label: "Stream", color: "text-amber", icon: <path d="M4 6h11v12H4zM19 9l3-2v10l-3-2" /> },
  news: { label: "News", color: "text-mut", icon: <path d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h5" /> },
}

const FILTERS: { key: Kind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "goal", label: "Goals" },
  { key: "live", label: "Live" },
  { key: "ft", label: "Results" },
  { key: "stream", label: "Streams" },
]

export default function Notifications({ onOpen }: { onOpen: (id: string) => void; go: (p: Page) => void }) {
  const { getMatch } = useLive()
  const [notes, setNotes] = useState<Note[]>(SEED)
  const [filter, setFilter] = useState<Kind | "all">("all")

  const shown = notes.filter((n) => (filter === "all" ? true : n.kind === filter))
  const unread = notes.filter((n) => n.unread).length

  return (
    <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-sm text-mut">
            {unread > 0 ? `${unread} unread update${unread > 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        <button
          onClick={() => setNotes((ns) => ns.map((n) => ({ ...n, unread: false })))}
          disabled={unread === 0}
          className="rounded-lg border border-line bg-panel px-3.5 py-2 text-[13px] font-semibold text-mut hover:text-fg disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
              filter === f.key ? "bg-volt text-ink" : "bg-panel/60 text-mut hover:text-fg"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        {shown.length === 0 && <p className="py-16 text-center text-sm text-mut">Nothing here yet.</p>}
        {shown.map((n) => {
          const meta = META[n.kind]
          const clickable = !!(n.match && getMatch(n.match))
          return (
            <button
              key={n.id}
              onClick={() => {
                setNotes((ns) => ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
                if (clickable) onOpen(n.match!)
              }}
              className="flex w-full items-start gap-3 border-b border-line-soft px-4 py-3.5 text-left last:border-0 hover:bg-panel-2"
            >
              {n.team && teams[n.team] ? (
                <Crest id={n.team} size={38} />
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
                  <span className="text-[11px] text-mut-2">· {n.time} ago</span>
                </div>
                <div className="mt-0.5 truncate text-sm font-semibold text-fg">{n.title}</div>
                <div className="mt-0.5 line-clamp-2 text-[13px] text-mut">{n.body}</div>
              </div>

              {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-volt" />}
            </button>
          )
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-mut">Alert Preferences</h2>
        <div className="mt-3 space-y-1">
          <Toggle label="Goals from followed clubs" on />
          <Toggle label="Kick-off reminders" on />
          <Toggle label="Full-time results" on />
          <Toggle label="Breaking news" />
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  const [checked, setChecked] = useState(on)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => setChecked((c) => !c)}
      className="group flex w-full items-center justify-between rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-panel-2 focus-visible:bg-panel-2"
    >
      <span className="text-sm text-fg">{label}</span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full ring-1 transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-95 motion-reduce:transition-none ${
          checked
            ? "bg-volt/90 shadow-[0_0_14px_-4px_rgba(61,255,136,0.8)] ring-volt/60"
            : "bg-line shadow-inner ring-white/5"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            checked ? "translate-x-5 shadow-[0_2px_8px_rgba(0,0,0,0.35)]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  )
}
