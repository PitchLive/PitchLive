import { useEffect, useState } from "react"
import { useLive, WAKING_MS } from "./LiveProvider"

/**
 * While the API isn't answering: "waking" for the first 90 seconds (the free server sleeps after
 * 15 idle minutes and takes up to a minute to start), then "down". Null while it answers.
 */
export function useServerState(): "waking" | "down" | null {
  const { online, offlineSince } = useLive()
  const [now, setNow] = useState(() => Date.now())
  const waiting = online === false && offlineSince != null
  useEffect(() => {
    if (!waiting) return
    const t = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(t)
  }, [waiting])
  if (!waiting) return null
  return now - offlineSince! < WAKING_MS ? "waking" : "down"
}
