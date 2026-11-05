import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { registerTeam, teams, type Match } from "../data"
import { leagueByName, leagueBySlug, registerLeague } from "../leagueInfo"
import { ApiError, api, liveSocketUrl, type ApiMatch, type ChatMessage, type LiveEvent, type MatchDetails, type User } from "./client"
import { elapsedSeconds, readingSeconds } from "./clock"
import { signOutOfFirebase, type FirebaseSignIn } from "./firebase"
import { toLeagueTable, toSummary, type LeagueSummary, type LeagueTable } from "./tableData"

/** Events for one match: chat messages, live details (stats, line-ups, commentary) and socket errors. */
export type MatchFeedEvent = { type: "chat"; message: ChatMessage } | { type: "details"; details: MatchDetails } | { type: "error"; error: string }
type ChatListener = (e: MatchFeedEvent) => void

export type Alert = { id: string; matchId: string; kind: "goal" | "kickoff" | "ht" | "ft"; title: string; body: string; at: number; read: boolean }

type LiveState = {
  /** null while the first API check is running; false when the service can't be reached. */
  online: boolean | null
  /** True until the first batch of matches has arrived. */
  matchesLoading: boolean
  connected: boolean
  user: User | null
  matches: Match[]
  getMatch: (id: string) => Match | undefined
  loadMatch: (id: string) => Promise<ChatMessage[]>
  loadTeamMatches: (teamId: string) => Promise<void>
  favorites: Set<string>
  toggleFavorite: (teamId: string) => Promise<"ok" | "signin">
  alerts: Alert[]
  unreadAlerts: number
  markAlertsRead: () => void
  /** Finish a Firebase sign-in: the API checks the token and starts our session. */
  completeSignIn: (signIn: FirebaseSignIn) => Promise<void>
  logout: () => Promise<void>
  watchMatch: (matchId: string, listener: ChatListener) => () => void
  sendChat: (matchId: string, body: string) => boolean
  /** League tables by league name, from the API. */
  tables: Record<string, LeagueTable>
  tableErrors: Record<string, string>
  loadTable: (league: string, force?: boolean) => Promise<void>
  /** Leaders and top three of every league, by league name. */
  summaries: Record<string, LeagueSummary>
  /** A league's season results (latest first) or fixtures (soonest first). */
  fetchLeagueMatches: (league: string, kind: "results" | "fixtures") => Promise<Match[]>
}

const LiveContext = createContext<LiveState | null>(null)

export function useLive() {
  const ctx = useContext(LiveContext)
  if (!ctx) throw new Error("useLive must be used inside <LiveProvider>")
  return ctx
}


// A cached table is reused this long; table events from the server force a refresh anyway.
const TABLE_TTL_MS = 60_000

// A new reading only moves the running clock back if it's well behind (a real correction):
// ESPN's clock is often minute-precise, and every poll would otherwise snap 67:40 back to 67:00.
const CLOCK_CORRECTION_S = 90

function toMatch(a: ApiMatch, prev: Match | undefined, receivedAt: number): Match {
  registerTeam(a.home)
  registerTeam(a.away)
  const next: Match = {
    id: a.id,
    league: a.leagueId ? (leagueBySlug[a.leagueId]?.name ?? (a.leagueName ? registerLeague({ slug: a.leagueId, name: a.leagueName }).name : "Other competitions")) : "Other competitions",
    home: a.home.id,
    away: a.away.id,
    homeScore: a.homeScore,
    awayScore: a.awayScore,
    status: a.status,
    minute: a.minute ?? undefined,
    kickoff: new Date(a.kickoff).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
    kickoffAt: a.kickoff,
    venue: a.venue ?? undefined,
    hasStream: a.hasStream,
    period: a.period ?? undefined,
    clockSeconds: a.clockSeconds ?? undefined,
    clockDisplay: a.clockDisplay ?? undefined,
    clockAt: receivedAt - a.clockAgeMs,
  }
  // Remember when a goal arrives so score rows can flash, Flashscore-style.
  if (prev) {
    next.lastGoalAt = prev.lastGoalAt
    next.lastGoalSide = prev.lastGoalSide
    if (next.homeScore > prev.homeScore) [next.lastGoalAt, next.lastGoalSide] = [receivedAt, "home"]
    else if (next.awayScore > prev.awayScore) [next.lastGoalAt, next.lastGoalSide] = [receivedAt, "away"]
  }
  if (prev && prev.status === "LIVE" && next.status === "LIVE" && prev.period === next.period) {
    const running = elapsedSeconds(prev, receivedAt)
    const reading = readingSeconds(next)
    if (running != null && reading != null && running >= reading && running - reading < CLOCK_CORRECTION_S) {
      next.clockSeconds = prev.clockSeconds
      next.clockDisplay = prev.clockDisplay
      next.clockAt = prev.clockAt
    }
  }
  return next
}

const name = (id: string) => teams[id]?.name ?? id
const line = (m: Match) => `${name(m.home)} ${m.homeScore}–${m.awayScore} ${name(m.away)}`

/** Match events worth telling a follower about. */
function alertsFor(prev: Match, next: Match, at: number): Alert[] {
  const base = { matchId: next.id, at, read: false }
  const out: Alert[] = []
  if (next.homeScore > prev.homeScore || next.awayScore > prev.awayScore) {
    const scorer = next.homeScore > prev.homeScore ? next.home : next.away
    const min = next.minute != null ? ` · ${next.minute}'` : ""
    out.push({ ...base, id: `${next.id}-goal-${next.homeScore}-${next.awayScore}`, kind: "goal", title: `GOAL · ${name(scorer)}`, body: `${line(next)}${min}` })
  }
  if (prev.status === "UPCOMING" && next.status === "LIVE")
    out.push({ ...base, id: `${next.id}-kickoff`, kind: "kickoff", title: "Kick-off", body: `${name(next.home)} vs ${name(next.away)}` })
  if (prev.status === "LIVE" && next.status === "HT") out.push({ ...base, id: `${next.id}-ht`, kind: "ht", title: "Half-time", body: line(next) })
  if (prev.status !== "FT" && next.status === "FT") out.push({ ...base, id: `${next.id}-ft`, kind: "ft", title: "Full-time", body: line(next) })
  return out
}

const utcDay = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)

export function LiveProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null)
  const [matchesLoaded, setMatchesLoaded] = useState(false)
  const [connected, setConnected] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [byId, setById] = useState<Map<string, Match>>(new Map())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [tables, setTables] = useState<Record<string, LeagueTable>>({})
  const [tableErrors, setTableErrors] = useState<Record<string, string>>({})
  const [summaries, setSummaries] = useState<Record<string, LeagueSummary>>({})
  const tablesRef = useRef(tables)
  tablesRef.current = tables
  const tableInflight = useRef(new Map<string, Promise<void>>())
  const summariesTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const byIdRef = useRef(byId)
  const favoritesRef = useRef(favorites)
  favoritesRef.current = favorites
  const socketRef = useRef<WebSocket | null>(null)
  const topicsRef = useRef(new Set<string>(["scores"]))
  const listenersRef = useRef(new Map<string, Set<ChatListener>>())

  /** Merge API matches into the store. `notify` raises alerts for followed clubs (live pushes only). */
  const upsert = useCallback((list: ApiMatch[], notify = false) => {
    if (!list.length) return
    const receivedAt = Date.now()
    const next = new Map(byIdRef.current)
    const raised: Alert[] = []
    for (const a of list) {
      const prev = next.get(a.id)
      const m = toMatch(a, prev, receivedAt)
      next.set(a.id, m)
      const followed = favoritesRef.current.has(m.home) || favoritesRef.current.has(m.away)
      if (notify && prev && followed) raised.push(...alertsFor(prev, m, receivedAt))
    }
    byIdRef.current = next
    setById(next)
    if (raised.length)
      setAlerts((old) => [...raised.filter((r) => !old.some((o) => o.id === r.id)).reverse(), ...old].slice(0, 50))
  }, [])

  const loadTable = useCallback(async (league: string, force = false) => {
    const slug = leagueByName[league]?.slug
    if (!slug) return
    const cached = tablesRef.current[league]
    if (!force && cached && Date.now() - cached.fetchedAt < TABLE_TTL_MS) return
    let pending = tableInflight.current.get(league)
    if (!pending) {
      pending = api
        .league(slug)
        .then((res) => {
          const table = toLeagueTable(res)
          setTables((prev) => ({ ...prev, [league]: table }))
          setTableErrors((prev) => {
            if (!(league in prev)) return prev
            const next = { ...prev }
            delete next[league]
            return next
          })
        })
        .catch((err) => setTableErrors((prev) => ({ ...prev, [league]: err instanceof Error ? err.message : "Table unavailable" })))
        .finally(() => tableInflight.current.delete(league))
      tableInflight.current.set(league, pending)
    }
    return pending
  }, [])

  const refreshSummaries = useCallback(async () => {
    const { leagues } = await api.leagues()
    setSummaries(Object.fromEntries(leagues.map((l) => [l.name, toSummary(l)])))
  }, [])

  /** Re-read every table on screen, plus the leaders. Used after reconnects and tab switches. */
  const refreshTables = useCallback(() => {
    refreshSummaries().catch(() => {})
    for (const league of Object.keys(tablesRef.current)) loadTable(league, true)
  }, [loadTable, refreshSummaries])

  const refreshMatches = useCallback(async () => {
    const days = await Promise.all([-1, 0, 1].map((o) => api.matches(utcDay(o))))
    upsert(days.flatMap((d) => d.matches))
  }, [upsert])

  // Initial check: is the API there, and who is signed in?
  useEffect(() => {
    let cancelled = false
    api
      .me()
      .then(async ({ user }) => {
        if (cancelled) return
        setUser(user)
        setOnline(true)
        refreshSummaries().catch(() => {})
        await refreshMatches().finally(() => setMatchesLoaded(true))
      })
      .catch(() => !cancelled && setOnline(false))
    return () => {
      cancelled = true
    }
  }, [refreshMatches, refreshSummaries])

  // Favourites follow the signed-in user.
  useEffect(() => {
    setFavorites(new Set())
    setAlerts([])
    if (!user) return
    let stale = false // a slow response must not land after sign-out or an account switch
    api
      .favorites()
      .then(({ teams: list }) => {
        if (stale) return
        list.forEach(registerTeam)
        setFavorites(new Set(list.map((t) => t.id)))
      })
      .catch(() => {})
    return () => {
      stale = true
    }
  }, [user])

  // One socket for scores and chat. Reopened when the user changes so it carries the new session.
  useEffect(() => {
    if (!online) return
    let closedByUs = false
    let retry: ReturnType<typeof setTimeout> | undefined
    let attempt = 0

    const open = () => {
      const ws = new WebSocket(liveSocketUrl())
      socketRef.current = ws
      ws.onopen = () => {
        if (attempt > 0) {
          // Catch up on anything missed while disconnected.
          refreshMatches().catch(() => {})
          refreshTables()
        }
        attempt = 0
        setConnected(true)
        for (const topic of topicsRef.current) ws.send(JSON.stringify({ type: "subscribe", topic }))
      }
      ws.onmessage = (raw) => {
        const e = JSON.parse(raw.data) as LiveEvent
        if (e.type === "match") upsert([e.match], true)
        else if (e.type === "chat") listenersRef.current.get(e.message.matchId)?.forEach((l) => l(e))
        else if (e.type === "details") listenersRef.current.get(e.details.matchId)?.forEach((l) => l(e))
        else if (e.type === "table") {
          // Re-read that table if anything is showing it, and the leaders shortly after (batched).
          const league = leagueBySlug[e.leagueId]?.name
          if (league && tablesRef.current[league]) loadTable(league, true)
          clearTimeout(summariesTimer.current)
          summariesTimer.current = setTimeout(() => refreshSummaries().catch(() => {}), 1500)
        }
        else if (e.type === "error") listenersRef.current.forEach((set) => set.forEach((l) => l(e)))
      }
      ws.onclose = () => {
        setConnected(false)
        if (socketRef.current === ws) socketRef.current = null
        if (closedByUs) return
        retry = setTimeout(open, Math.min(15_000, 1000 * 2 ** attempt++))
      }
    }
    open()

    // Browsers throttle background tabs; resync as soon as the page is visible again.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      refreshMatches().catch(() => {})
      refreshTables()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      closedByUs = true
      clearTimeout(retry)
      document.removeEventListener("visibilitychange", onVisible)
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [online, user?.id, upsert, refreshMatches, refreshTables, loadTable, refreshSummaries])

  const send = (msg: unknown) => {
    const ws = socketRef.current
    if (ws?.readyState !== WebSocket.OPEN) return false
    ws.send(JSON.stringify(msg))
    return true
  }

  const watchMatch = useCallback((matchId: string, listener: ChatListener) => {
    const topic = `match:${matchId}`
    if (!listenersRef.current.has(matchId)) listenersRef.current.set(matchId, new Set())
    listenersRef.current.get(matchId)!.add(listener)
    if (!topicsRef.current.has(topic)) {
      topicsRef.current.add(topic)
      send({ type: "subscribe", topic })
    }
    return () => {
      const set = listenersRef.current.get(matchId)
      set?.delete(listener)
      if (set?.size) return
      listenersRef.current.delete(matchId)
      topicsRef.current.delete(topic)
      send({ type: "unsubscribe", topic })
    }
  }, [])

  const loadMatch = useCallback(
    async (id: string) => {
      if (!online) return []
      const { match, chat } = await api.match(id)
      upsert([match])
      return chat
    },
    [online, upsert],
  )

  const loadTeamMatches = useCallback(
    async (teamId: string) => {
      if (online) upsert((await api.teamMatches(teamId)).matches)
    },
    [online, upsert],
  )

  const fetchLeagueMatches = useCallback(async (league: string, kind: "results" | "fixtures") => {
    const slug = leagueByName[league]?.slug
    if (!slug) return []
    const { matches: list } = await api.leagueMatches(slug, kind)
    const now = Date.now()
    return list.map((a) => toMatch(a, byIdRef.current.get(a.id), now))
  }, [])

  const value = useMemo<LiveState>(() => {
    const list = [...byId.values()].sort((a, b) => (a.kickoffAt ?? "").localeCompare(b.kickoffAt ?? ""))
    return {
      online,
      matchesLoading: online === null || (online === true && !matchesLoaded),
      connected,
      user,
      matches: list,
      getMatch: (id) => byId.get(id),
      loadMatch,
      loadTeamMatches,
      favorites,
      toggleFavorite: async (teamId) => {
        if (!user) return "signin"
        const had = favorites.has(teamId)
        const flip = (on: boolean) =>
          setFavorites((prev) => {
            const next = new Set(prev)
            on ? next.add(teamId) : next.delete(teamId)
            return next
          })
        flip(!had)
        try {
          await (had ? api.removeFavorite(teamId) : api.addFavorite(teamId))
        } catch (err) {
          flip(had)
          if (err instanceof ApiError && err.status === 401) {
            setUser(null)
            return "signin"
          }
        }
        return "ok"
      },
      alerts,
      unreadAlerts: alerts.filter((a) => !a.read).length,
      markAlertsRead: () => setAlerts((list) => (list.some((a) => !a.read) ? list.map((a) => ({ ...a, read: true })) : list)),
      completeSignIn: async ({ idToken, displayName }) => setUser((await api.firebaseSignIn(idToken, displayName)).user),
      logout: async () => {
        await Promise.all([api.logout().catch(() => {}), signOutOfFirebase()])
        setUser(null)
      },
      watchMatch,
      sendChat: (matchId, body) => send({ type: "chat", matchId, body }),
      tables,
      tableErrors,
      loadTable,
      summaries,
      fetchLeagueMatches,
    }
  }, [online, matchesLoaded, connected, user, byId, favorites, alerts, loadMatch, loadTeamMatches, watchMatch, tables, tableErrors, loadTable, summaries, fetchLeagueMatches])

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>
}
