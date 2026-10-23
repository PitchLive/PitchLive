import { useEffect, useRef, useState } from "react"
import { useLive } from "../api/LiveProvider"
import type { ChatMessage } from "../api/client"

const COLORS = ["#3dff88", "#8b5cf6", "#3d7bff", "#ffb020", "#06b6d4", "#ec4899", "#f97316", "#a3e635"]
const colorFor = (id: string) => COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]!

type Line = { key: string; name: string; color: string; text: string; mine?: boolean }

/** Live chat for one match. Falls back to a simulated demo feed when the API isn't available. */
export default function LiveChat({ matchId, onSignIn }: { matchId?: string; onSignIn?: () => void }) {
  const { online } = useLive()
  if (online && matchId) return <RealChat key={matchId} matchId={matchId} onSignIn={onSignIn} />
  return <DemoChat />
}

function RealChat({ matchId, onSignIn }: { matchId: string; onSignIn?: () => void }) {
  const { user, connected, loadMatch, watchMatch, sendChat } = useLive()
  const [msgs, setMsgs] = useState<ChatMessage[]>([])
  const [val, setVal] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadMatch(matchId)
      .then((history) => !cancelled && setMsgs(history))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    const stop = watchMatch(matchId, (e) => {
      if (e.type === "chat") setMsgs((m) => (m.some((x) => x.id === e.message.id) ? m : [...m.slice(-99), e.message]))
      else setNotice(e.error)
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [matchId, loadMatch, watchMatch])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

  function send(e: React.FormEvent) {
    e.preventDefault()
    const body = val.trim()
    if (!body) return
    if (!sendChat(matchId, body)) return setNotice("Reconnecting — try again in a moment")
    setVal("")
  }

  const lines: Line[] = msgs.map((m) => ({
    key: String(m.id),
    name: m.user.displayName,
    color: colorFor(m.user.id),
    text: m.body,
    mine: m.user.id === user?.id,
  }))

  return (
    <ChatFrame
      status={connected ? "Live" : "Reconnecting…"}
      lines={lines}
      empty={loading ? "Loading chat…" : "No messages yet — start the conversation."}
      notice={notice}
      footer={
        user ? (
          <ChatInput value={val} onChange={setVal} onSubmit={send} />
        ) : (
          <button onClick={onSignIn} className="w-full rounded-lg bg-volt py-2.5 text-sm font-bold text-ink">
            Sign in to chat
          </button>
        )
      }
    />
  )
}

const SEED = [
  { u: "harrier_hank", c: "#3dff88", t: "WHAT A STRIKE 🔥🔥" },
  { u: "galaxy_gal", c: "#8b5cf6", t: "ref is having a shocker tbh" },
  { u: "midfield_maestro", c: "#3d7bff", t: "that back four is all over the place" },
  { u: "cornerflag", c: "#ffb020", t: "2-1 called it at half time" },
]

const POOL = ["GOOOOAL 🎉", "unbelievable save", "how was that not a card??", "this is the game of the season", "keeper needs to come off his line", "counter attack incoming"]

function DemoChat() {
  const [msgs, setMsgs] = useState<Line[]>(SEED.map((s, i) => ({ key: `s${i}`, name: s.u, color: s.c, text: s.t })))
  const [val, setVal] = useState("")

  useEffect(() => {
    let n = 0
    const id = setInterval(() => {
      const s = SEED[Math.floor(Math.random() * SEED.length)]!
      setMsgs((m) => [...m.slice(-30), { key: `d${n++}`, name: s.u, color: s.c, text: POOL[Math.floor(Math.random() * POOL.length)]! }])
    }, 2600)
    return () => clearInterval(id)
  }, [])

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!val.trim()) return
    setMsgs((m) => [...m.slice(-30), { key: `me${Date.now()}`, name: "you", color: "#eef0f7", text: val.trim(), mine: true }])
    setVal("")
  }

  return <ChatFrame status="Demo" lines={msgs} empty="" notice={null} footer={<ChatInput value={val} onChange={setVal} onSubmit={send} />} />
}

function ChatFrame({ status, lines, empty, notice, footer }: { status: string; lines: Line[]; empty: string; notice: string | null; footer: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" })
  }, [lines.length])

  return (
    <div className="card flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <span className="flex items-center gap-2 font-display text-sm font-bold">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> Live Chat
        </span>
        <span className="text-[11px] text-mut">{status}</span>
      </div>
      <div ref={boxRef} className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {lines.length === 0 && <p className="py-8 text-center text-[13px] text-mut-2">{empty}</p>}
        {lines.map((m) => (
          <div key={m.key} className="text-[13px] leading-snug">
            <span className="font-semibold" style={{ color: m.color }}>
              {m.name}
              {m.mine && <span className="ml-1 text-[10px] font-normal text-mut-2">(you)</span>}
            </span>
            <span className="text-fg/85"> {m.text}</span>
          </div>
        ))}
      </div>
      {notice && <p className="border-t border-white/[0.06] bg-amber/10 px-4 py-1.5 text-[12px] text-amber">{notice}</p>}
      <div className="border-t border-white/[0.06] p-3">{footer}</div>
    </div>
  )
}

function ChatInput({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={280}
        placeholder="Say something…"
        className="w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-fg placeholder:text-mut-2 focus:border-volt/50 focus:outline-none"
      />
      <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-volt text-ink" aria-label="Send">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M3 20v-6l8-2-8-2V4l19 8z" />
        </svg>
      </button>
    </form>
  )
}
