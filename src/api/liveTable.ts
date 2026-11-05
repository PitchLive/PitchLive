import type { Match, Standing } from "../data"
import type { FormEntry } from "./client"

// Pure table logic (no app imports), so it can be tested on its own.

/** How a team's in-play (or just-finished) match is affecting its row. */
export type LiveResult = { matchId: string; status: Match["status"]; scored: number; conceded: number }

export type TableRow = Standing & {
  formDetail?: FormEntry[]
  note?: string
  noteColor?: string
  live?: LiveResult
  move?: number // places gained (+) or lost (−) versus the official table
}

export type TableGroup = { group: string | null; rows: TableRow[] }

// Each team's official games-played while a match was in progress. After full time the
// result stays in the live table only until the official table has counted it (ESPN
// updates a few minutes later), so it neither vanishes early nor gets counted twice.
const baselines = new Map<string, { home: number; away: number }>()

const pts = (r: Standing) => r.pts ?? r.w * 3 + r.d

/**
 * Flashscore-style live table: matches in progress count as if they ended now.
 * Returns the official table untouched when nothing in the league is in play.
 */
export function projectLive(groups: TableGroup[], matches: Match[], league: string): { groups: TableGroup[]; live: number } {
  const relevant = matches.filter((m) => m.league === league && (m.status === "LIVE" || m.status === "HT" || (m.status === "FT" && baselines.has(m.id))))
  if (!relevant.length) return { groups, live: 0 }

  let live = 0
  const out = groups.map((g) => {
    const rows = g.rows.map((r) => ({ ...r }))
    const byTeam = new Map(rows.map((r) => [r.team, r]))
    let touched = false

    for (const m of relevant) {
      const h = byTeam.get(m.home)
      const a = byTeam.get(m.away)
      if (!h || !a) continue // teams in different groups (or a cup tie): not a league match
      const base = baselines.get(m.id)
      if (m.status === "FT") {
        if (!base || h.p !== base.home || a.p !== base.away) {
          baselines.delete(m.id) // the official table has caught up
          continue
        }
      } else if (!base) {
        baselines.set(m.id, { home: h.p, away: a.p })
      }
      apply(h, m, m.homeScore, m.awayScore)
      apply(a, m, m.awayScore, m.homeScore)
      if (m.status !== "FT") live++
      touched = true
    }
    if (!touched) return g

    const official = new Map(g.rows.map((r, i) => [r.team, i]))
    rows.sort((x, y) => pts(y) - pts(x) || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf || official.get(x.team)! - official.get(y.team)!)
    rows.forEach((r, i) => (r.move = official.get(r.team)! - i))
    return { group: g.group, rows }
  })
  return { groups: out, live }
}

function apply(r: TableRow, m: Match, scored: number, conceded: number) {
  const before = pts(r)
  r.p += 1
  r.gf += scored
  r.ga += conceded
  if (scored > conceded) r.w += 1
  else if (scored === conceded) r.d += 1
  else r.l += 1
  r.pts = before + (scored > conceded ? 3 : scored === conceded ? 1 : 0)
  r.live = { matchId: m.id, status: m.status, scored, conceded }
}

/** Where a team sits: position (1-based), its row and group. */
export function findInTable(groups: TableGroup[], teamId: string) {
  for (const g of groups) {
    const i = g.rows.findIndex((r) => r.team === teamId)
    if (i >= 0) return { pos: i + 1, row: g.rows[i]!, group: g }
  }
  return null
}
