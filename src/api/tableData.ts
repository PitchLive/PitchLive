import { registerTeam } from "../data"
import type { ApiLeagueSummary, ApiLeagueTable } from "./client"
import type { TableGroup } from "./liveTable"

export { findInTable, projectLive, type LiveResult, type TableGroup, type TableRow } from "./liveTable"

export type LeagueTable = { groups: TableGroup[]; updatedAt: string; fetchedAt: number }

export type LeagueSummary = {
  updatedAt: string
  leaders: { group: string | null; team: string; points: number }[]
  top: { position: number; team: string; points: number; played: number }[]
}

const FORM = new Set(["W", "D", "L"])

export function toLeagueTable(res: ApiLeagueTable): LeagueTable {
  return {
    updatedAt: res.league.updatedAt,
    fetchedAt: Date.now(),
    groups: res.table.map((g) => ({
      group: g.group,
      rows: g.rows.map((r) => {
        registerTeam(r.team)
        return {
          team: r.team.id,
          p: r.played,
          w: r.won,
          d: r.drawn,
          l: r.lost,
          gf: r.goalsFor,
          ga: r.goalsAgainst,
          pts: r.points,
          form: r.form.filter((f): f is "W" | "D" | "L" => FORM.has(f)),
          formDetail: r.formDetail ?? [],
          note: r.note ?? undefined,
          noteColor: r.noteColor ?? undefined,
        }
      }),
    })),
  }
}

export function toSummary(l: ApiLeagueSummary): LeagueSummary {
  l.leaders.forEach((x) => registerTeam(x.team))
  l.top.forEach((x) => registerTeam(x.team))
  return {
    updatedAt: l.updatedAt,
    leaders: l.leaders.map((x) => ({ group: x.group, team: x.team.id, points: x.points })),
    top: l.top.map((x) => ({ position: x.position, team: x.team.id, points: x.points, played: x.played })),
  }
}
