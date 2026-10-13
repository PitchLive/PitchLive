import { useEffect, useRef, useState } from "react"

const SEED = [
  { u: "harrier_hank", c: "#3dff88", t: "WHAT A STRIKE 🔥🔥" },
  { u: "galaxy_gal", c: "#8b5cf6", t: "ref is having a shocker tbh" },
  { u: "midfield_maestro", c: "#3d7bff", t: "that back four is all over the place" },
  { u: "cornerflag", c: "#ffb020", t: "2-1 called it at half time" },
  { u: "offsideoracle", c: "#06b6d4", t: "the 4K stream is unreal quality" },
  { u: "sixyardbox", c: "#ec4899", t: "sub coming? he looks knackered" },
]

const POOL = [
  "GOOOOAL 🎉",
  "unbelievable save",
  "how was that not a card??",
  "streaming from three countries away, no lag 👏",
  "this is the game of the season",
  "keeper needs to come off his line",
  "20 mins to hold on…",
  "counter attack incoming",
]

export default function LiveChat() {
  const [msgs, setMsgs] = useState(SEED)
  const [val, setVal] = useState("")
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => {
      const s = SEED[Math.floor(Math.random() * SEED.length)]
      setMsgs((m) => [...m.slice(-30), { ...s, t: POOL[Math.floor(Math.random() * POOL.length)] }])
    }, 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" })
  }, [msgs])

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!val.trim()) return
    setMsgs((m) => [...m.slice(-30), { u: "you", c: "#eef0f7", t: val.trim() }])
    setVal("")
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="flex items-center gap-2 font-display text-sm font-bold">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> Live Chat
        </span>
        <span className="text-[11px] text-mut">4.2K online</span>
      </div>
      <div ref={boxRef} className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {msgs.map((m, i) => (
          <div key={i} className="text-[13px] leading-snug">
            <span className="font-semibold" style={{ color: m.c }}>
              {m.u}
            </span>
            <span className="text-fg/85"> {m.t}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Say something…"
          className="w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-fg placeholder:text-mut-2 focus:border-volt/50 focus:outline-none"
        />
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-volt text-ink" aria-label="Send">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M3 20v-6l8-2-8-2V4l19 8z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
