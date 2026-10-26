import { feedLeagues, leagueTables, teamDetails, type TableGroup } from "./generated/leagueData"
import bundesligaLogo from "./imports/logos/bundesliga.svg"
import laLigaLogo from "./imports/logos/la-liga.svg"
import ligue1Logo from "./imports/logos/ligue-1.svg"
import serieALogo from "./imports/logos/serie-a.svg"
import premierLeagueLogo from "./imports/logos/english-premier-league.svg"
import eflLogo from "./imports/logos/efl-championship.svg"
import uclLogo from "./imports/logos/uefa-champions-league.svg"
import uelLogo from "./imports/logos/uefa-europa-league.svg"
import catalog from "./leagueCatalog.json"

export type Region = "Big Five" | "Europe" | "Continental" | "Americas" | "Asia"

export type LeagueInfo = {
  slug: string
  name: string
  short: string
  country: string
  code: string // ISO code (or federation) for the country chip
  region: Region
  founded: number
  recordHolder: string
  accent: string
  logo?: string
  blurb: string
}

// Curated facts that rarely change, shared with the API server.
const CATALOG = catalog as (Omit<LeagueInfo, "logo"> & { slug: string })[]

const LOCAL_LOGOS: Record<string, string> = {
  "Premier League": premierLeagueLogo,
  "La Liga": laLigaLogo,
  "Serie A": serieALogo,
  Bundesliga: bundesligaLogo,
  "Ligue 1": ligue1Logo,
  "EFL Championship": eflLogo,
  "UEFA Champions League": uclLogo,
  "UEFA Europa League": uelLogo,
}

export const leagueCatalog: LeagueInfo[] = CATALOG.map((l) => ({
  ...l,
  logo: LOCAL_LOGOS[l.name] ?? feedLeagues[l.name]?.logo,
}))

export const leagueByName: Record<string, LeagueInfo> = Object.fromEntries(leagueCatalog.map((l) => [l.name, l]))

export const REGIONS: Region[] = ["Big Five", "Continental", "Europe", "Americas", "Asia"]

export function seasonLabel(league: string) {
  return feedLeagues[league]?.season.match(/^\d{4}(-\d{2})?/)?.[0] ?? ""
}

export function tableFor(league: string): TableGroup[] {
  return leagueTables[league] ?? []
}

export function clubsIn(league: string): string[] {
  return tableFor(league).flatMap((g) => g.rows.map((r) => r.team))
}

export function detailsFor(teamId: string) {
  return teamDetails[teamId]
}

// Domestic league a club currently plays in (falls back to its first listed competition).
export function domesticLeague(teamId: string): string | undefined {
  const leagues = teamDetails[teamId]?.leagues ?? []
  return leagues.find((l) => !l.startsWith("UEFA")) ?? leagues[0]
}

export function positionIn(league: string, teamId: string) {
  for (const g of tableFor(league)) {
    const i = g.rows.findIndex((r) => r.team === teamId)
    if (i >= 0) return { pos: i + 1, row: g.rows[i], group: g }
  }
  return null
}
