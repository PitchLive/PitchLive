import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { matches as demoMatches, teams, type Match } from "../data"
import { leagueCatalog } from "../leagueInfo"
import { ApiError, api, liveSocketUrl, type ApiMatch, type ApiTeamSummary, type ChatMessage, type LiveEvent, type User } from "./client"

export type ChatEvent = { type: "chat"; message: ChatMessage } | { type: "error"; error: string }
type ChatListener = (e: ChatEvent) => void

type LiveState = {
  /** null while the first API check is running; false means demo data is shown. */
  online: boolean | null
  connected: boolean
  user: User | null
  matches: Match[]
  getMatch: (id: string) => Match | undefined
  loadMatch: (id: string) => Promise<ChatMessage[]>
  loadTeamMatches: (teamId: string) => Promise<void>
  favorites: Set<string>
  toggleFavorite: (teamId: string) => Promise<"ok" | "signin">
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  watchMatch: (matchId: string, listener: ChatListener) => () => void
  sendChat: (matchId: string, body: string) => boolean
}

const LiveContext = createContext<LiveState | null>(null)

export function useLive() {
  const ctx = useContext(LiveContext)
  if (!ctx) throw new Error("useLive must be used inside <LiveProvider>")
  return ctx
}

const leagueNameBySlug = new Map(leagueCatalog.map((l) => [l.slug, l.name]))
const demoById = new Map(demoMatches.map((m) => [m.id, m]))

// Clubs the server discovers (cup opponents, promoted sides) aren't in the bundled list yet.
function registerTeam(t: ApiTeamSummary) {
  if (!teams[t.id]) teams[t.id] = { id: t.id, name: t.name, short: t.short, city: "", color: t.color, color2: t.color2, logo: t.logo ?? undefined }
}

function toMatch(a: ApiMatch): Match {
  registerTeam(a.home)
  registerTeam(a.away)
  return {
    id: a.id,
    league: leagueNameBySlug.get(a.leagueId ?? "") ?? "Other competitions",
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
  }
}

const utcDay = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)

export function LiveProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null)
  const [connected, setConnected] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [byId, setById] = useState<Map<string, Match>>(new Map())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const socketRef = useRef<WebSocket | null>(null)
  const topicsRef = useRef(new Set<string>(["scores"]))
  const listenersRef = useRef(new Map<string, Set<ChatListener>>())

  const upsert = useCallback((list: ApiMatch[]) => {
    if (!list.length) return
    setById((prev) => {
      const next = new Map(prev)
      for (const a of list) next.set(a.id, toMatch(a))
      return next
    })
  }, [])

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
        await refreshMatches()
      })
      .catch(() => !cancelled && setOnline(false))
    return () => {
      cancelled = true
    }
  }, [refreshMatches])

  // Favourites follow the signed-in user.
  useEffect(() => {
    setFavorites(new Set())
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
        if (attempt > 0) refreshMatches().catch(() => {}) // catch up on anything missed
        attempt = 0
        setConnected(true)
        for (const topic of topicsRef.current) ws.send(JSON.stringify({ type: "subscribe", topic }))
      }
      ws.onmessage = (raw) => {
        const e = JSON.parse(raw.data) as LiveEvent
        if (e.type === "match") upsert([e.match])
        else if (e.type === "chat") listenersRef.current.get(e.message.matchId)?.forEach((l) => l(e))
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

    return () => {
      closedByUs = true
      clearTimeout(retry)
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [online, user?.id, upsert, refreshMatches])

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
      if (!online || demoById.has(id)) return []
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

  const value = useMemo<LiveState>(() => {
    const list = online ? [...byId.values()].sort((a, b) => (a.kickoffAt ?? "").localeCompare(b.kickoffAt ?? "")) : demoMatches
    return {
      online,
      connected,
      user,
      matches: list,
      getMatch: (id) => byId.get(id) ?? demoById.get(id),
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
      login: async (email, password) => setUser((await api.login(email, password)).user),
      register: async (email, password, displayName) => setUser((await api.register(email, password, displayName)).user),
      logout: async () => {
        await api.logout().catch(() => {})
        setUser(null)
      },
      watchMatch,
      sendChat: (matchId, body) => send({ type: "chat", matchId, body }),
    }
  }, [online, connected, user, byId, favorites, loadMatch, loadTeamMatches, watchMatch])

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>
}
