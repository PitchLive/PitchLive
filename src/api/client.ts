// Thin client for the PitchLive API (server/). Requests go to same-origin /api,
// which Vite proxies to the server in development.

export type ApiTeamSummary = { id: string; name: string; short: string; color: string; color2: string; logo: string | null }

export type ApiMatch = {
  id: string
  leagueId: string | null
  status: "UPCOMING" | "LIVE" | "HT" | "FT" | "POSTPONED"
  minute: number | null
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

export type LiveEvent =
  | { type: "hello"; user: { id: string; displayName: string } | null }
  | { type: "subscribed"; topic: string }
  | { type: "match"; match: ApiMatch }
  | { type: "chat"; message: ChatMessage }
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
  login: (email: string, password: string) => request<{ user: User }>("POST", "/api/auth/login", { email, password }),
  register: (email: string, password: string, displayName: string) =>
    request<{ user: User }>("POST", "/api/auth/register", { email, password, displayName }),
  logout: () => request<void>("POST", "/api/auth/logout"),

  matches: (date: string) => request<{ matches: ApiMatch[] }>("GET", `/api/matches?date=${date}&limit=300`),
  match: (id: string) => request<{ match: ApiMatch; chat: ChatMessage[] }>("GET", `/api/matches/${encodeURIComponent(id)}`),
  teamMatches: (id: string) => request<{ matches: ApiMatch[] }>("GET", `/api/teams/${encodeURIComponent(id)}/matches`),

  favorites: () => request<{ teams: ApiTeamSummary[] }>("GET", "/api/me/favorites"),
  addFavorite: (teamId: string) => request<void>("PUT", `/api/me/favorites/${encodeURIComponent(teamId)}`),
  removeFavorite: (teamId: string) => request<void>("DELETE", `/api/me/favorites/${encodeURIComponent(teamId)}`),
}

export const liveSocketUrl = () => `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/live`
