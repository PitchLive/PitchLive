import chelseaLogo from "./imports/logos/chelsea.svg"
import brightonLogo from "./imports/logos/brighton.svg"
import villaLogo from "./imports/logos/aston-villa.svg"
import fulhamLogo from "./imports/logos/fulham.svg"
import evertonLogo from "./imports/logos/everton.svg"
import palaceLogo from "./imports/logos/crystal-palace.svg"
import brentfordLogo from "./imports/logos/brentford.svg"
import coventryLogo from "./imports/logos/coventry.svg"
import manUtdLogo from "./imports/logos/manchester-united.svg"
import manCityLogo from "./imports/logos/manchester-city.svg"
import liverpoolLogo from "./imports/logos/liverpool.svg"
import leedsLogo from "./imports/logos/leeds.svg"
import ipswichLogo from "./imports/logos/ipswich.svg"
import hullLogo from "./imports/logos/hull.svg"
import arsenalLogo from "./imports/logos/arsenal.svg"
import bournemouthLogo from "./imports/logos/bournemouth.svg"
import tottenhamLogo from "./imports/logos/tottenham.svg"
import newcastleLogo from "./imports/logos/newcastle.svg"
import sunderlandLogo from "./imports/logos/sunderland.svg"
import forestLogo from "./imports/logos/nottingham-forest.svg"
import alNassrLogo from "./imports/logos/al-nassr.svg"
import dortmundLogo from "./imports/logos/borussia-dortmund.svg"
import atleticoLogo from "./imports/logos/atletico-madrid.svg"
import interLogo from "./imports/logos/inter-milan.svg"
import napoliLogo from "./imports/logos/napoli.svg"
import psgLogo from "./imports/logos/paris-saint-germain.svg"
import juventusLogo from "./imports/logos/juventus.svg"
import barcelonaLogo from "./imports/logos/barcelona.svg"
import bayernLogo from "./imports/logos/bayern-munich.svg"
import realMadridLogo from "./imports/logos/real-madrid.svg"
import acMilanLogo from "./imports/logos/ac-milan.svg"
import monacoLogo from "./imports/logos/as-monaco.svg"
import sevillaLogo from "./imports/logos/sevilla.svg"
import { additionalTeams } from "./additionalTeams"
import { feedTeams, remoteLogos, leagueTables } from "./generated/leagueData"
import { leagueCatalog, domesticLeague } from "./leagueInfo"

export type Team = {
  id: string
  name: string
  short: string
  city: string
  league?: string
  color: string
  color2: string
  logo?: string
}

export type Match = {
  id: string
  league: string
  home: string
  away: string
  homeScore: number
  awayScore: number
  status: "LIVE" | "HT" | "FT" | "UPCOMING" | "POSTPONED"
  minute?: number
  kickoff?: string // local "HH:MM"
  kickoffAt?: string // ISO timestamp (API matches)
  venue?: string
  hasStream?: boolean
  homeCards?: number
  awayCards?: number
  subs?: number
  viewers?: number
  featured?: boolean
}

// Real clubs. Brand colours are used for the generated fallback crest;
// clubs with a supplied logo asset render that instead.
export const teams: Record<string, Team> = {
  ars: { id: "ars", name: "Arsenal", short: "ARS", city: "London", color: "#EF0107", color2: "#9C824A", logo: arsenalLogo },
  bou: { id: "bou", name: "AFC Bournemouth", short: "BOU", city: "Bournemouth", color: "#DA291C", color2: "#000000", logo: bournemouthLogo },
  sun: { id: "sun", name: "Sunderland", short: "SUN", city: "Sunderland", color: "#EB172B", color2: "#ffffff", logo: sunderlandLogo },
  nfo: { id: "nfo", name: "Nottingham Forest", short: "NFO", city: "Nottingham", color: "#DD0000", color2: "#ffffff", logo: forestLogo },
  lee: { id: "lee", name: "Leeds United", short: "LEE", city: "Leeds", color: "#FFCD00", color2: "#1D428A", logo: leedsLogo },
  ips: { id: "ips", name: "Ipswich Town", short: "IPS", city: "Ipswich", color: "#0044A9", color2: "#ffffff", logo: ipswichLogo },
  hul: { id: "hul", name: "Hull City", short: "HUL", city: "Hull", color: "#F5A12D", color2: "#000000", logo: hullLogo },
  ful: { id: "ful", name: "Fulham", short: "FUL", city: "London", color: "#000000", color2: "#ffffff", logo: fulhamLogo },
  eve: { id: "eve", name: "Everton", short: "EVE", city: "Liverpool", color: "#003399", color2: "#ffffff", logo: evertonLogo },
  cry: { id: "cry", name: "Crystal Palace", short: "CRY", city: "London", color: "#1B458F", color2: "#C4122E", logo: palaceLogo },
  bre: { id: "bre", name: "Brentford", short: "BRE", city: "London", color: "#E30613", color2: "#ffffff", logo: brentfordLogo },
  cov: { id: "cov", name: "Coventry City", short: "COV", city: "Coventry", color: "#59CBE8", color2: "#ffffff", logo: coventryLogo },
  mci: { id: "mci", name: "Manchester City", short: "MCI", city: "Manchester", color: "#6CABDD", color2: "#1C2C5B", logo: manCityLogo },
  liv: { id: "liv", name: "Liverpool", short: "LIV", city: "Liverpool", color: "#C8102E", color2: "#00B2A9", logo: liverpoolLogo },
  che: { id: "che", name: "Chelsea", short: "CHE", city: "London", color: "#034694", color2: "#001489", logo: chelseaLogo },
  tot: { id: "tot", name: "Tottenham Hotspur", short: "TOT", city: "London", color: "#132257", color2: "#ffffff", logo: tottenhamLogo },
  mun: { id: "mun", name: "Manchester United", short: "MUN", city: "Manchester", color: "#DA291C", color2: "#FBE122", logo: manUtdLogo },
  new: { id: "new", name: "Newcastle United", short: "NEW", city: "Newcastle", color: "#241F20", color2: "#ffffff", logo: newcastleLogo },
  avl: { id: "avl", name: "Aston Villa", short: "AVL", city: "Birmingham", color: "#670E36", color2: "#95BFE5", logo: villaLogo },
  bha: { id: "bha", name: "Brighton & Hove Albion", short: "BHA", city: "Brighton", color: "#0057B8", color2: "#FFCD00", logo: brightonLogo },
  rma: { id: "rma", name: "Real Madrid", short: "RMA", city: "Madrid", color: "#00529F", color2: "#FEBE10", logo: realMadridLogo },
  bar: { id: "bar", name: "FC Barcelona", short: "BAR", city: "Barcelona", color: "#A50044", color2: "#004D98", logo: barcelonaLogo },
  atm: { id: "atm", name: "Atlético Madrid", short: "ATM", city: "Madrid", color: "#CB3524", color2: "#262E62", logo: atleticoLogo },
  sev: { id: "sev", name: "Sevilla FC", short: "SEV", city: "Seville", color: "#D91A21", color2: "#000000",logo:sevillaLogo },
  juv: { id: "juv", name: "Juventus", short: "JUV", city: "Turin", color: "#000000", color2: "#ffffff", logo: juventusLogo },
  int: { id: "int", name: "Inter Milan", short: "INT", city: "Milan", color: "#010E80", color2: "#000000", logo: interLogo },
  mil: { id: "mil", name: "AC Milan", short: "MIL", city: "Milan", color: "#FB090B", color2: "#000000", logo: acMilanLogo },
  nap: { id: "nap", name: "SSC Napoli", short: "NAP", city: "Naples", color: "#12A0D7", color2: "#003C82", logo: napoliLogo },
  bay: { id: "bay", name: "Bayern Munich", short: "BAY", city: "Munich", color: "#DC052D", color2: "#0066B2", logo: bayernLogo },
  bvb: { id: "bvb", name: "Borussia Dortmund", short: "BVB", city: "Dortmund", color: "#FDE100", color2: "#000000", logo: dortmundLogo },
  psg: { id: "psg", name: "Paris Saint-Germain", short: "PSG", city: "Paris", color: "#004170", color2: "#DA291C", logo: psgLogo },
  mon: { id: "mon", name: "AS Monaco", short: "ASM", city: "Monaco", color: "#E51B22", color2: "#ffffff", logo: monacoLogo },
  nas: { id: "nas", name: "Al Nassr", short: "NAS", city: "Riyadh", league: "Saudi Pro League", color: "#F9E547", color2: "#2451A4", logo: alNassrLogo },
  ...Object.fromEntries(additionalTeams.map((team) => [team.id, team])),
  ...Object.fromEntries(feedTeams.map((team) => [team.id, team])),
}

// Tag every club with the domestic league it plays in this season, and fill
// missing artwork with the published club crest.
for (const t of Object.values(teams)) {
  t.league = domesticLeague(t.id) ?? t.league
  if (!t.logo && remoteLogos[t.id]) t.logo = remoteLogos[t.id]
}

export const leagues = leagueCatalog.map((l) => l.name)

export const matches: Match[] = [
  { id: "m1", league: "UEFA Champions League", home: "ars", away: "rma", homeScore: 2, awayScore: 1, status: "LIVE", minute: 67, homeCards: 1, awayCards: 2, subs: 4, viewers: 1842030, featured: true },
  { id: "m2", league: "Premier League", home: "liv", away: "bou", homeScore: 0, awayScore: 0, status: "LIVE", minute: 23, homeCards: 0, awayCards: 1, subs: 0, viewers: 924110 },
  { id: "m3", league: "Premier League", home: "mci", away: "che", homeScore: 3, awayScore: 2, status: "LIVE", minute: 81, homeCards: 2, awayCards: 3, subs: 5, viewers: 678900 },
  { id: "m4", league: "Premier League", home: "new", away: "avl", homeScore: 1, awayScore: 1, status: "HT", minute: 45, homeCards: 1, awayCards: 0, subs: 1, viewers: 410220 },
  { id: "m5", league: "La Liga", home: "bar", away: "sev", homeScore: 2, awayScore: 0, status: "LIVE", minute: 58, homeCards: 0, awayCards: 1, subs: 3, viewers: 1205000 },
  { id: "m6", league: "La Liga", home: "atm", away: "rma", homeScore: 1, awayScore: 3, status: "LIVE", minute: 72, homeCards: 1, awayCards: 1, subs: 4, viewers: 1883000 },
  { id: "m7", league: "Serie A", home: "juv", away: "nap", homeScore: 0, awayScore: 0, status: "UPCOMING", kickoff: "20:45", viewers: 0 },
  { id: "m8", league: "Serie A", home: "int", away: "mil", homeScore: 0, awayScore: 0, status: "UPCOMING", kickoff: "21:00", viewers: 0 },
  { id: "m9", league: "Bundesliga", home: "bay", away: "bvb", homeScore: 2, awayScore: 2, status: "FT", viewers: 0 },
  { id: "m11", league: "Premier League", home: "tot", away: "sun", homeScore: 0, awayScore: 0, status: "UPCOMING", kickoff: "17:30", viewers: 0 },
  { id: "m12", league: "Premier League", home: "nfo", away: "mun", homeScore: 1, awayScore: 0, status: "LIVE", minute: 38, homeCards: 1, awayCards: 1, subs: 0, viewers: 352400 },
  { id: "m13", league: "EFL Championship", home: "lee", away: "hul", homeScore: 2, awayScore: 1, status: "LIVE", minute: 54, homeCards: 1, awayCards: 2, subs: 2, viewers: 214300 },
  { id: "m14", league: "EFL Championship", home: "ips", away: "lee", homeScore: 0, awayScore: 0, status: "UPCOMING", kickoff: "19:45", viewers: 0 },
  { id: "m15", league: "Premier League", home: "ful", away: "eve", homeScore: 1, awayScore: 2, status: "FT", viewers: 0 },
  { id: "m16", league: "Premier League", home: "cry", away: "bre", homeScore: 0, awayScore: 0, status: "UPCOMING", kickoff: "20:00", viewers: 0 },
  { id: "m17", league: "EFL Championship", home: "cov", away: "hul", homeScore: 3, awayScore: 1, status: "FT", viewers: 0 },
  { id: "m10", league: "Ligue 1", home: "psg", away: "mon", homeScore: 1, awayScore: 0, status: "FT", viewers: 0 },
]

export type StreamCard = {
  id: string
  match: string
  league: string
  quality: "HD" | "4K" | "FHD"
  live: boolean
  viewers: number
  kickoff?: string
  thumb: string
}

export const streams: StreamCard[] = [
  { id: "s1", match: "m1", league: "UEFA Champions League", quality: "4K", live: true, viewers: 1842030, thumb: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=450&fit=crop&auto=format" },
  { id: "s2", match: "m5", league: "La Liga", quality: "HD", live: true, viewers: 1205000, thumb: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=450&fit=crop&auto=format" },
  { id: "s3", match: "m3", league: "Premier League", quality: "4K", live: true, viewers: 678900, thumb: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop&auto=format" },
  { id: "s4", match: "m6", league: "La Liga", quality: "FHD", live: true, viewers: 1883000, thumb: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=450&fit=crop&auto=format" },
  { id: "s5", match: "m2", league: "Premier League", quality: "HD", live: true, viewers: 924110, thumb: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=450&fit=crop&auto=format" },
  { id: "s6", match: "m7", league: "Serie A", quality: "4K", live: false, kickoff: "20:45", viewers: 0, thumb: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=450&fit=crop&auto=format" },
  { id: "s7", match: "m8", league: "Serie A", quality: "HD", live: false, kickoff: "21:00", viewers: 0, thumb: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800&h=450&fit=crop&auto=format" },
  { id: "s8", match: "m4", league: "Premier League", quality: "FHD", live: true, viewers: 410220, thumb: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop&auto=format" },
]

export type Standing = {
  team: string
  p: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts?: number
  form: ("W" | "D" | "L")[]
}

// Flattened single-table view per competition (MLS conferences etc. are concatenated).
export const leagueStandings: Record<string, Standing[]> = Object.fromEntries(
  Object.entries(leagueTables).map(([k, groups]) => [k, groups.flatMap((g) => g.rows)]),
)

export const standings: Standing[] = leagueStandings["Premier League"]

export const commentary = [
  { min: "67'", type: "goal", text: "GOAL! The home side restore their lead — a thumping half-volley from the edge of the box after a scrappy corner." },
  { min: "63'", type: "sub", text: "Substitution for the visitors. Fresh legs up top as they chase the equaliser." },
  { min: "58'", type: "card", text: "Yellow card shown for a cynical trip on the counter-attack." },
  { min: "51'", type: "goal", text: "The visitors level it! A composed finish low into the corner after a lovely one-two." },
  { min: "46'", type: "info", text: "Second half is underway. No changes at the interval." },
  { min: "34'", type: "goal", text: "GOAL! The home side break the deadlock with a towering header from the set piece." },
]
