import { useSyncExternalStore } from "react"
import type { Match } from "../data"

// One shared 1-second ticker for every running clock on the page.
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined
let now = Date.now()

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (!timer)
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 1000)
  return () => {
    listeners.delete(cb)
    if (!listeners.size) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

/** Current time, re-rendering the caller once a second. */
export function useNow() {
  return useSyncExternalStore(subscribe, () => now)
}

// Regulation end of each period, in seconds (1st/2nd half, extra-time halves).
const PERIOD_END: Record<number, number> = { 1: 45 * 60, 2: 90 * 60, 3: 105 * 60, 4: 120 * 60 }
// Never run the clock more than this far past the last reading, in case the feed stalls.
const MAX_EXTRAPOLATION_S = 150

/**
 * ESPN's clock as seconds played at the moment of the reading. During stoppage time
 * ESPN holds the clock at the period end and reports the added minute in the display
 * ("45'+2'"), so that minute is folded back in.
 */
export function readingSeconds(m: Pick<Match, "clockSeconds" | "clockDisplay" | "period">): number | null {
  if (m.clockSeconds == null) return null
  const added = m.clockDisplay?.match(/\+(\d+)/)
  const end = PERIOD_END[m.period ?? 0]
  if (added && end) return Math.max(m.clockSeconds, end + Number(added[1]) * 60)
  return m.clockSeconds
}

/** Seconds played right now, ticking forward from the last reading. */
export function elapsedSeconds(m: Match, at: number): number | null {
  const base = readingSeconds(m)
  if (base == null || m.clockAt == null || m.status !== "LIVE") return base
  return base + Math.min(MAX_EXTRAPOLATION_S, Math.max(0, (at - m.clockAt) / 1000))
}

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0")

/** "67:23", "45+2:05", "HT", or the minute when no clock is available. */
export function clockLabel(m: Match, at: number): string {
  if (m.status === "HT") return "HT"
  if (m.status === "FT") return "FT"
  if (m.status === "UPCOMING") return m.kickoff ?? ""
  if (m.status === "POSTPONED") return "PPD"
  const s = elapsedSeconds(m, at)
  if (s == null) return m.minute != null ? `${m.minute}'` : "LIVE"
  const end = PERIOD_END[m.period ?? 0]
  if (end && s >= end) {
    const extra = s - end
    return `${end / 60}+${Math.floor(extra / 60)}:${pad(extra % 60)}`
  }
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

/** Hook form: a clock label that updates every second. */
export function useClock(m: Match) {
  const at = useNow()
  return clockLabel(m, at)
}
