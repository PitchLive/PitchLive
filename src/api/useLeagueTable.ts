import { useEffect, useMemo } from "react"
import { useLive } from "./LiveProvider"
import { projectLive, type TableGroup } from "./tableData"

export type LeagueTableView = {
  /** Live table (in-play matches counted) when `live` > 0, otherwise the official table. */
  groups: TableGroup[]
  official: TableGroup[]
  /** Number of matches in this league currently affecting the table. */
  live: number
  updatedAt: string | null
  loading: boolean
  error: string | null
}

/** A league's current table from the API, kept fresh by server table events and projected live. */
export function useLeagueTable(league: string | null | undefined): LeagueTableView {
  const { tables, tableErrors, loadTable, matches, online } = useLive()

  useEffect(() => {
    if (league && online) loadTable(league).catch(() => {})
  }, [league, online, loadTable])

  const data = league ? tables[league] : undefined
  const projected = useMemo(() => (data && league ? projectLive(data.groups, matches, league) : null), [data, matches, league])

  return {
    groups: projected?.groups ?? [],
    official: data?.groups ?? [],
    live: projected?.live ?? 0,
    updatedAt: data?.updatedAt ?? null,
    loading: !data && online !== false && !(league && tableErrors[league]),
    error: online === false ? "Tables are unavailable right now." : league && tableErrors[league] ? "This table couldn't be loaded." : null,
  }
}
