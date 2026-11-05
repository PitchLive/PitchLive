// Thin client for the PitchLive API (server/). Requests go to same-origin /api,
// which Vite proxies to the server in development.

export type ApiTeamSummary = { id: string; name: string; short: string; color: string; color2: string; logo: string | null }

export type ApiMatch = {
  id: string
  leagueId: string | null
  leagueName?: string | null
  status: "UPCOMING" | "LIVE" | "HT" | "FT" | "POSTPONED"
  minute: number | null
  period: number | null
  clockSeconds: number | null
  clockDisplay: string | null
  clockAgeMs: number
  kickoff: string
  venue: string | null
  homeScore: number
  awayScore: number
  home: ApiTeamSummary
  away: ApiTeamSummary
  hasStream: boolean
}

export type User = { id: string; email: string; displayName: string }

export type ChatMessage = { id: number; matchId: string; body: string; createdAt: string; user: { id: string; displayName: string } }

type Side = "home" | "away"

export type StatRow = { key: string; label: string; home: string; away: string }

export type LineupPlayer = {
  id: string
  name: string
  shortName: string
  number: string | null
  position: string | null
  formationPlace: number | null
  starter: boolean
  subbedIn: string | null
  subbedOut: string | null
  goals: number
  ownGoals: number
  yellow: boolean
  red: boolean
}

export type Lineup = { formation: string | null; starters: LineupPlayer[]; bench: LineupPlayer[] }

export type MatchEvent = { id: string; type: string; minute: string; period: number | null; side: Side | null; players: string[]; text: string }

export type CommentaryLine = { seq: number; minute: string; type: string | null; side: Side | null; text: string }

export type MatchDetails = {
  matchId: string
  stats: StatRow[]
  lineups: { home: Lineup; away: Lineup } | null
  events: MatchEvent[]
  commentary: CommentaryLine[]
  updatedAt: string
}

/** One of a team's last five results, oldest first. */
export type FormEntry = { result: "W" | "D" | "L"; matchId: string; opponentId: string; home: boolean; scored: number; conceded: number; kickoff: string }

export type ApiStandingRow = {
  position: number
  team: ApiTeamSummary
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
  formDetail?: FormEntry[]
  note: string | null
  noteColor: string | null
}

export type ApiLeagueTable = {
  league: { id: string; name: string; season: string | null; updatedAt: string }
  table: { group: string | null; rows: ApiStandingRow[] }[]
}

export type ApiLeagueSummary = {
  id: string
  name: string
  updatedAt: string
  clubCount: number
  leaders: { group: string | null; points: number; team: ApiTeamSummary }[]
  top: { position: number; played: number; points: number; team: ApiTeamSummary }[]
}

/** A competition from the country menu. */
export type CatalogLeague = { slug: string; name: string; short: string; country: string; season: number | null; cup: boolean; women: boolean; logo: string | null }

export type ApiTeam = ApiTeamSummary & {
  city: string | null
  country: string | null
  stadium: string | null
  leagueId: string | null
  competitions: { league: { id: string; name: string; short: string } }[]
}

export type LiveEvent =
  | { type: "hello"; user: { id: string; displayName: string } | null }
  | { type: "subscribed"; topic: string }
  | { type: "match"; match: ApiMatch }
  | { type: "chat"; message: ChatMessage }
  | { type: "details"; details: MatchDetails }
  | { type: "table"; leagueId: string }
  | { type: "error"; error: string }

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "Can't reach PitchLive right now. Check your connection.")
  }
  // A static host without the API answers /api/* with the HTML app shell.
  const isJson = res.headers.get("content-type")?.includes("application/json")
  if (res.status === 204) return undefined as T
  if (!isJson) throw new ApiError(0, "The PitchLive service is offline.")
  const data = await res.json()
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`)
  return data as T
}

export const api = {
  me: () => request<{ user: User | null }>("GET", "/api/auth/me"),
  /** Trade a Firebase ID token for the API session cookie. */
  firebaseSignIn: (idToken: string, displayName?: string) => request<{ user: User }>("POST", "/api/auth/firebase", { idToken, displayName }),
  logout: () => request<void>("POST", "/api/auth/logout"),

  leagues: () => request<{ leagues: ApiLeagueSummary[] }>("GET", "/api/leagues"),
  countries: () => request<{ countries: { country: string; leagues: number }[] }>("GET", "/api/countries"),
  countryLeagues: (country: string) => request<{ leagues: CatalogLeague[] }>("GET", `/api/countries/${encodeURIComponent(country)}/leagues`),
  team: (id: string) => request<{ team: ApiTeam }>("GET", `/api/teams/${encodeURIComponent(id)}`),
  league: (slug: string) => request<ApiLeagueTable>("GET", `/api/leagues/${encodeURIComponent(slug)}`),

  leagueMatches: (slug: string, kind: "results" | "fixtures") =>
    request<{ matches: ApiMatch[] }>("GET", `/api/leagues/${encodeURIComponent(slug)}/matches?kind=${kind}`),

  matches: (date: string) => request<{ matches: ApiMatch[] }>("GET", `/api/matches?date=${date}&limit=300`),
  match: (id: string) => request<{ match: ApiMatch; chat: ChatMessage[] }>("GET", `/api/matches/${encodeURIComponent(id)}`),
  details: (id: string) => request<{ details: MatchDetails }>("GET", `/api/matches/${encodeURIComponent(id)}/details`),
  teamMatches: (id: string) => request<{ matches: ApiMatch[] }>("GET", `/api/teams/${encodeURIComponent(id)}/matches`),

  favorites: () => request<{ teams: ApiTeamSummary[] }>("GET", "/api/me/favorites"),
  addFavorite: (teamId: string) => request<void>("PUT", `/api/me/favorites/${encodeURIComponent(teamId)}`),
  removeFavorite: (teamId: string) => request<void>("DELETE", `/api/me/favorites/${encodeURIComponent(teamId)}`),
}

export const liveSocketUrl = () => `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/live`
