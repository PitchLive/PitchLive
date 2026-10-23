import { feedLeagues, leagueTables, teamDetails, type TableGroup } from "./generated/leagueData"
import bundesligaLogo from "./imports/logos/bundesliga.svg"
import laLigaLogo from "./imports/logos/la-liga.svg"
import ligue1Logo from "./imports/logos/ligue-1.svg"
import serieALogo from "./imports/logos/serie-a.svg"
import premierLeagueLogo from "./imports/logos/english-premier-league.svg"
import eflLogo from "./imports/logos/efl-championship.svg"
import uclLogo from "./imports/logos/uefa-champions-league.svg"
import uelLogo from "./imports/logos/uefa-europa-league.svg"

export type Region = "Big Five" | "Europe" | "Continental" | "Americas" | "Asia"

export type LeagueInfo = {
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

// Curated facts that rarely change. Tables and clubs come from the generated ESPN snapshot.
const CATALOG: Omit<LeagueInfo, "logo">[] = [
  { name: "Premier League", short: "EPL", country: "England", code: "ENG", region: "Big Five", founded: 1992, recordHolder: "Manchester United", accent: "#a855f7", blurb: "The most-watched league on the planet — 20 clubs, 38 rounds, three go down." },
  { name: "La Liga", short: "LIGA", country: "Spain", code: "ESP", region: "Big Five", founded: 1929, recordHolder: "Real Madrid", accent: "#ff5a4e", blurb: "Spain's top flight, home of El Clásico and a technical, possession-first style." },
  { name: "Serie A", short: "SA", country: "Italy", code: "ITA", region: "Big Five", founded: 1898, recordHolder: "Juventus", accent: "#3d7bff", blurb: "Tactical chess in Italy's top division, from San Siro to the Stadio Maradona." },
  { name: "Bundesliga", short: "BL", country: "Germany", code: "GER", region: "Big Five", founded: 1963, recordHolder: "Bayern Munich", accent: "#ff3b4e", blurb: "18 clubs, packed terraces and the highest average attendance in world football." },
  { name: "Ligue 1", short: "L1", country: "France", code: "FRA", region: "Big Five", founded: 1932, recordHolder: "Paris Saint-Germain", accent: "#d9f23d", blurb: "France's elite division and Europe's leading talent factory." },
  { name: "UEFA Champions League", short: "UCL", country: "Europe", code: "UEFA", region: "Continental", founded: 1955, recordHolder: "Real Madrid", accent: "#4f8cff", blurb: "Europe's elite club competition — a 36-team league phase into the knockouts." },
  { name: "UEFA Europa League", short: "UEL", country: "Europe", code: "UEFA", region: "Continental", founded: 1971, recordHolder: "Sevilla", accent: "#ff8a1f", blurb: "UEFA's second-tier club competition, with a Champions League spot for the winner." },
  { name: "EFL Championship", short: "EFL", country: "England", code: "ENG", region: "Europe", founded: 2004, recordHolder: "—", accent: "#38bdf8", blurb: "England's relentless second tier: 24 clubs, 46 games and the richest play-off in football." },
  { name: "Eredivisie", short: "ERE", country: "Netherlands", code: "NED", region: "Europe", founded: 1956, recordHolder: "Ajax", accent: "#ff6b2c", blurb: "Total football's home, built on attacking play and youth development." },
  { name: "Primeira Liga", short: "LP", country: "Portugal", code: "POR", region: "Europe", founded: 1934, recordHolder: "Benfica", accent: "#22c55e", blurb: "Portugal's top flight, dominated by Benfica, Porto and Sporting CP." },
  { name: "Süper Lig", short: "SL", country: "Türkiye", code: "TUR", region: "Europe", founded: 1959, recordHolder: "Galatasaray", accent: "#ef4444", blurb: "Some of Europe's loudest stadiums and the fierce Istanbul derbies." },
  { name: "Scottish Premiership", short: "SPFL", country: "Scotland", code: "SCO", region: "Europe", founded: 2013, recordHolder: "Celtic / Rangers", accent: "#8b5cf6", blurb: "12 clubs, a split after 33 games and the Old Firm rivalry at its heart." },
  { name: "Belgian Pro League", short: "JPL", country: "Belgium", code: "BEL", region: "Europe", founded: 1895, recordHolder: "Anderlecht", accent: "#f59e0b", blurb: "Belgium's top flight, with a championship play-off to settle the title." },
  { name: "Saudi Pro League", short: "SPL", country: "Saudi Arabia", code: "KSA", region: "Asia", founded: 1976, recordHolder: "Al Hilal", accent: "#10b981", blurb: "Big-name signings and fast-rising ambitions in the Gulf." },
  { name: "MLS", short: "MLS", country: "USA & Canada", code: "USA", region: "Americas", founded: 1996, recordHolder: "LA Galaxy", accent: "#60a5fa", blurb: "Two conferences, 30 clubs and the MLS Cup Playoffs to crown a champion." },
  { name: "Liga MX", short: "LMX", country: "Mexico", code: "MEX", region: "Americas", founded: 1943, recordHolder: "Club América", accent: "#34d399", blurb: "Apertura and Clausura tournaments, each settled by the Liguilla play-offs." },
  { name: "Brasileirão", short: "BRA", country: "Brazil", code: "BRA", region: "Americas", founded: 1959, recordHolder: "Palmeiras", accent: "#facc15", blurb: "Brazil's 20-team Série A — flair, pressure and huge crowds." },
  { name: "Liga Profesional", short: "LPF", country: "Argentina", code: "ARG", region: "Americas", founded: 1891, recordHolder: "River Plate", accent: "#7dd3fc", blurb: "Argentina's top flight, home of the Superclásico between Boca and River." },
]

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
