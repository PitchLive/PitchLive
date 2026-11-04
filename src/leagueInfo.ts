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

export type Region = "Big Five" | "Europe" | "Continental" | "Americas" | "Asia" | "Other" | "International"

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
  /** Not one of the curated leagues: opened from the country menu. */
  extra?: boolean
  cup?: boolean
  women?: boolean
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
export const leagueBySlug: Record<string, LeagueInfo> = Object.fromEntries(leagueCatalog.map((l) => [l.slug, l]))

/** Adds a competition reached through the country menu (or seen on a match) so links and tables work for it. */
export function registerLeague(l: { slug: string; name: string; short?: string; country?: string; logo?: string | null; cup?: boolean; women?: boolean }) {
  if (leagueBySlug[l.slug]) return leagueBySlug[l.slug]!
  const info: LeagueInfo = {
    slug: l.slug,
    name: l.name,
    short: l.short ?? l.name,
    country: l.country ?? "",
    code: l.slug.split(".")[0]!.toUpperCase(),
    region: l.country === "World" ? "International" : "Other",
    founded: 0,
    recordHolder: "",
    accent: "#3d7bff",
    logo: l.logo ?? undefined,
    blurb: "",
    extra: true,
    cup: l.cup,
    women: l.women,
  }
  leagueBySlug[l.slug] = info
  leagueByName[l.name] = info
  return info
}

export const REGIONS: Region[] = ["Big Five", "Continental", "Europe", "Americas", "Asia"]

export function seasonLabel(league: string) {
  return feedLeagues[league]?.season.match(/^\d{4}(-\d{2})?/)?.[0] ?? ""
}

// The bundled snapshot is only used for which clubs are in which league this season.
// Standings themselves always come live from the API (see api/useLeagueTable.ts).
function snapshotGroups(league: string): TableGroup[] {
  return leagueTables[league] ?? []
}

/** Clubs in a league this season (membership, not standings). */
export function clubsIn(league: string): string[] {
  return snapshotGroups(league).flatMap((g) => g.rows.map((r) => r.team))
}

export function detailsFor(teamId: string) {
  return teamDetails[teamId]
}

// Domestic league a club currently plays in (falls back to its first listed competition).
export function domesticLeague(teamId: string): string | undefined {
  const leagues = teamDetails[teamId]?.leagues ?? []
  return leagues.find((l) => !l.startsWith("UEFA")) ?? leagues[0]
}
