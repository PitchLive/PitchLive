import { useEffect, useMemo, useState } from "react"
import type { Match } from "../data"
import { useLive } from "./LiveProvider"

/**
 * A league's season: results (latest first) and fixtures (soonest first). Fetched once per
 * league, then kept current with live updates, so a match that kicks off or ends moves
 * between the two lists without a reload.
 */
export function useLeagueMatches(league: string) {
  const { online, matches: liveMatches, fetchLeagueMatches } = useLive()
  const [season, setSeason] = useState<Match[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!online) return
    let cancelled = false
    setSeason(null)
    setError(false)
    Promise.all([fetchLeagueMatches(league, "results"), fetchLeagueMatches(league, "fixtures")])
      .then(([r, f]) => !cancelled && setSeason([...r, ...f]))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [league, online, fetchLeagueMatches])

  return useMemo(() => {
    // Live versions win over the season snapshot.
    const byId = new Map((season ?? []).map((m) => [m.id, m]))
    for (const m of liveMatches) if (m.league === league) byId.set(m.id, m)
    const all = [...byId.values()]
    const at = (m: Match) => m.kickoffAt ?? ""
    return {
      loading: online !== false && season === null && !error,
      error: online === false || error,
      live: all.filter((m) => m.status === "LIVE" || m.status === "HT").sort((a, b) => at(a).localeCompare(at(b))),
      results: all.filter((m) => m.status === "FT").sort((a, b) => at(b).localeCompare(at(a))),
      // Scheduled matches by date; postponed ones (no new date yet) at the end.
      fixtures: [
        ...all.filter((m) => m.status === "UPCOMING").sort((a, b) => at(a).localeCompare(at(b))),
        ...all.filter((m) => m.status === "POSTPONED").sort((a, b) => at(a).localeCompare(at(b))),
      ],
    }
  }, [season, liveMatches, league, online, error])
}
