import infoIcon from "../imports/icons/info.svg"
import calendarIcon from "../imports/icons/calendar.svg"
import starIcon from "../imports/icons/star.svg"
import playIcon from "../imports/icons/play.svg"
import scoreboardIcon from "../imports/icons/scoreboard.svg"
import americanFootballIcon from "../imports/sports/americanfootball.svg"
import cricketIcon from "../imports/sports/cricket.svg"
import rugbyIcon from "../imports/sports/rugby.svg"
import baseballIcon from "../imports/sports/baseball.svg"
import favoritesIcon from "../imports/sports/favorites.svg"
import footballIcon from "../imports/sports/football.svg"
import basketballIcon from "../imports/sports/basketball.svg"
import tennisIcon from "../imports/sports/tennis.svg"
import hockeyIcon from "../imports/sports/icehockey.svg"
import volleyballIcon from "../imports/sports/volleyball.svg"
import handballIcon from "../imports/sports/handball.svg"
import moreIcon from "../imports/sports/more.svg"
import premierLeague from "../imports/logos/english-premier-league.svg"
import eflLogo from "../imports/logos/efl-championship.svg"
import netherlandsFlag from "../imports/logos/netherlands.png"
import cafLogo from "../imports/logos/caf.png"
import uclLogo from "../imports/logos/uefa-champions-league.svg"
import uelLogo from "../imports/logos/uefa-europa-league.svg"
import superCupLogo from "../imports/logos/uefa-super-cup.svg"
import cafChampionsLeagueLogo from "../imports/logos/caf-champions-league.svg"
import bundesligaLogo from "../imports/logos/bundesliga.svg"
import laLigaLogo from "../imports/logos/la-liga.svg"
import ligue1Logo from "../imports/logos/ligue-1.svg"
import serieALogo from "../imports/logos/serie-a.svg"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { teams, type Match } from "../data"
import { useLive } from "../api/LiveProvider"
import { leagueByName } from "../leagueInfo"
import { Crest } from "../components/ui"
import type { Page } from "../components/Navbar"
import CountryExplorer, { type RemoteLeague } from "../components/CountryExplorer"
import CountryRailItem from "../components/CountryRailItem"
import { countries, countryFlag } from "../countries"

type Filter = "all" | "live" | "finished" | "scheduled"
type PinnedCountryLeague = { country: string; sport: string; league: RemoteLeague }

// Flags are either an emoji, an imported image URL, or "world" (confederation globe).
function LeagueIcon({ flag, size = 20 }: { flag: string; size?: number }) {
  const isImg = /\.(svg|png|jpe?g|webp)(\?|$)|^data:|^\//.test(flag)
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-md bg-white/[0.06] ring-1 ring-white/10"
      style={{ width: size, height: size }}
    >
      {isImg ? (
        <img src={flag} alt="" className="h-[72%] w-[72%] object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
      ) : flag === "world" ? (
        <svg viewBox="0 0 24 24" className="h-[70%] w-[70%] text-cobalt" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z" />
        </svg>
      ) : (
        <span className="leading-none" style={{ fontSize: size * 0.62 }}>{flag}</span>
      )}
    </span>
  )
}

const LEAGUE_META: Record<string, { flag: string; country: string }> = {
  "Premier League": { flag: premierLeague, country: "ENGLAND" },
  "La Liga": { flag: laLigaLogo, country: "SPAIN" },
  "Serie A": { flag: serieALogo, country: "ITALY" },
  Bundesliga: { flag: bundesligaLogo, country: "GERMANY" },
  "EFL Championship": { flag: eflLogo, country: "ENGLAND" },
  "Ligue 1": { flag: ligue1Logo, country: "FRANCE" },
  "UEFA Champions League": { flag: uclLogo, country: "EUROPE" },
}

// Pinned sidebar leagues (static, for the Flashscore-style rail).
const PINNED = [
  { name: "Premier League", flag: premierLeague },
  { name: "MTN FA Cup", flag: "🇬🇭" },
  { name: "Serie A", flag: serieALogo },
  { name: "Eredivisie", flag: netherlandsFlag },
  { name: "La Liga", flag: laLigaLogo },
  { name: "Bundesliga", flag: bundesligaLogo },
  { name: "Ligue 1", flag: ligue1Logo },
  { name: "EFL Championship", flag: eflLogo },
  { name: "Africa Cup of Nations", flag: cafLogo },
  { name: "CAF Champions League", flag: cafChampionsLeagueLogo },
  { name: "CAF Confederation Cup", flag: "world" },
  { name: "UEFA Champions League", flag: uclLogo },
  { name: "Europa League", flag: uelLogo },
  { name: "UEFA Super Cup", flag: superCupLogo },
  { name: "World Championship", flag: "world" },
  { name: "World Cup Women", flag: "world" },
]

const SPORT_DEFAULT_COUNTRY: Record<string, string> = {
  Basketball: "United States",
  "Ice Hockey": "United States",
  Volleyball: "Italy",
  Handball: "Germany",
  "American Football": "United States",
  Rugby: "England",
  Cricket: "India",
  Baseball: "United States",
  Tennis: "United States",
}

const SPORT_LEAGUE_PINS: Record<string, { name: string; country: string }[]> = {
  Basketball: [
    { name: "NBA", country: "United States" },
    { name: "Lega Basket", country: "Italy" },
    { name: "ACB", country: "Spain" },
    { name: "LNB", country: "France" },
    { name: "Super Lig", country: "Turkey" },
  ],
  "Ice Hockey": [
    { name: "NHL", country: "United States" },
    { name: "AHL", country: "United States" },
    { name: "Liiga", country: "Finland" },
    { name: "SHL", country: "Sweden" },
  ],
  Volleyball: [
    { name: "Italian Volleyball League", country: "Italy" },
    { name: "Polish PlusLiga", country: "Poland" },
    { name: "Turkish Volleyball League", country: "Turkey" },
    { name: "Brazilian Superliga", country: "Brazil" },
  ],
  Handball: [
    { name: "Handball-Bundesliga", country: "Germany" },
    { name: "Liga ASOBAL", country: "Spain" },
    { name: "French Starligue", country: "France" },
    { name: "Danish Handball League", country: "Denmark" },
  ],
  "American Football": [
    { name: "NFL", country: "United States" },
    { name: "College Football", country: "United States" },
    { name: "CFL", country: "Canada" },
  ],
  Rugby: [
    { name: "Premiership Rugby", country: "England" },
    { name: "Top 14", country: "France" },
    { name: "Super Rugby", country: "New Zealand" },
    { name: "NRL", country: "Australia" },
  ],
  Cricket: [
    { name: "Indian Premier League", country: "India" },
    { name: "Big Bash League", country: "Australia" },
    { name: "County Championship", country: "England" },
    { name: "Pakistan Super League", country: "Pakistan" },
  ],
  Baseball: [
    { name: "MLB", country: "United States" },
    { name: "NPB", country: "Japan" },
    { name: "KBO League", country: "South Korea" },
    { name: "Mexican Baseball League", country: "Mexico" },
  ],
  Tennis: [
    { name: "ATP Tour", country: "United States" },
    { name: "WTA Tour", country: "United States" },
    { name: "Davis Cup", country: "Spain" },
  ],
}

function RailHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="mb-1.5 mt-6 flex items-center gap-2.5 border-b border-line px-2.5 pb-2.5 text-[12px] font-extrabold uppercase tracking-[0.14em] text-fg">
      <span className="text-fg">{icon}</span>
      {children}
    </h3>
  )
}

const SPORTS = [
  { name: "Favorites", icon: favoritesIcon },
  { name: "Football", icon: footballIcon },
  { name: "Basketball", icon: basketballIcon },
  { name: "Tennis", icon: tennisIcon },
  { name: "Ice Hockey", icon: hockeyIcon },
  { name: "Volleyball", icon: volleyballIcon },
  { name: "Handball", icon: handballIcon },
  { name: "American Football", icon: americanFootballIcon },
  { name: "Rugby", icon: rugbyIcon },
  { name: "Cricket", icon: cricketIcon },
  { name: "Baseball", icon: baseballIcon },
  { name: "More", icon: moreIcon },
]

type IconTone = "muted" | "active" | "amber" | "cobalt"

const ICON_FILTERS: Record<IconTone, string> = {
  muted: "brightness(0) invert(1)",
  active: "brightness(0) saturate(100%) invert(88%) sepia(84%) saturate(1024%) hue-rotate(74deg) brightness(104%) contrast(101%)",
  amber: "brightness(0) saturate(100%) invert(76%) sepia(82%) saturate(1375%) hue-rotate(344deg) brightness(103%) contrast(102%)",
  cobalt: "brightness(0) saturate(100%) invert(49%) sepia(94%) saturate(3993%) hue-rotate(213deg) brightness(101%) contrast(101%)",
}

// Render uploaded SVGs directly. CSS masking turns stroke-only files into solid
// squares in some embedded previews, while an image preserves their line art.
function SportIcon({ src, className = "", tone = "muted" }: { src: string; className?: string; tone?: IconTone }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={`shrink-0 object-contain ${tone === "muted" ? "opacity-55" : ""} ${className}`}
      style={{ filter: ICON_FILTERS[tone] }}
    />
  )
}

export default function Scores({ onOpen, onTeam, go }: { onOpen: (id: string) => void; onTeam: (id: string) => void; go: (page: Page) => void }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [pinned, setPinned] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)
  const [pinnedCountryLeagues, setPinnedCountryLeagues] = useState<PinnedCountryLeague[]>([])
  const [dayOffset, setDayOffset] = useState(0)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [favs, setFavs] = useState<Record<string, boolean>>({})
  const { matches, user, favorites, toggleFavorite } = useLive()
  const myTeams = [...favorites].filter((id) => teams[id])
  const follow = async (id: string) => {
    if ((await toggleFavorite(id)) === "signin") go("signin")
  }
  const [picking, setPicking] = useState(false)
  const [sport, setSport] = useState("Football")
  const [countryQuery, setCountryQuery] = useState("")
  const sportsRef = useRef<HTMLDivElement>(null)
  const [sportScroll, setSportScroll] = useState({ left: false, right: true })

  const updateSportScroll = () => {
    const el = sportsRef.current
    if (!el) return
    setSportScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }

  const scrollSports = (direction: -1 | 1) => {
    const el = sportsRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.max(240, el.clientWidth * 0.65), behavior: "smooth" })
  }

  useEffect(() => {
    updateSportScroll()
    window.addEventListener("resize", updateSportScroll)
    return () => window.removeEventListener("resize", updateSportScroll)
  }, [])

  const grouped = useMemo(() => {
    const day = new Date()
    day.setDate(day.getDate() + dayOffset)
    const sameDay = (iso: string) => new Date(iso).toDateString() === day.toDateString()
    const list = matches
      .filter((m) => (m.kickoffAt ? sameDay(m.kickoffAt) : dayOffset === 0))
      .filter((m) => (pinned ? m.league === pinned : true))
      .filter((m) => (sport === "Favorites" ? favs[m.id] || favorites.has(m.home) || favorites.has(m.away) : true))
      .filter((m) => {
        if (filter === "live") return m.status === "LIVE" || m.status === "HT"
        if (filter === "finished") return m.status === "FT"
        if (filter === "scheduled") return m.status === "UPCOMING"
        return true
      })
    const map = new Map<string, Match[]>()
    for (const m of list) {
      if (!map.has(m.league)) map.set(m.league, [])
      map.get(m.league)!.push(m)
    }
    return [...map.entries()]
  }, [matches, filter, pinned, dayOffset, sport, favs, favorites])

  const liveCount = matches.filter((m) => m.status === "LIVE" || m.status === "HT").length
  const selectedDate = new Date()
  selectedDate.setDate(selectedDate.getDate() + dayOffset)
  const dateLabel = selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })
  const relativeDay = dayOffset === 0 ? "TODAY" : dayOffset === -1 ? "YESTERDAY" : dayOffset === 1 ? "TOMORROW" : ""
  const visibleCountries = countries.filter((item) => item.name.toLowerCase().includes(countryQuery.toLowerCase()))
  const explorerCountry = country ?? SPORT_DEFAULT_COUNTRY[sport] ?? null
  const selectedCountry = countries.find((item) => item.name === explorerCountry)
  const sportLeaguePins = SPORT_LEAGUE_PINS[sport]

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
      {/* Sports category strip */}
      <div className="mb-5 flex items-center gap-2">
        <button
          onClick={() => scrollSports(-1)}
          disabled={!sportScroll.left}
          aria-label="Previous sports"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-panel/70 text-lg text-fg transition-colors hover:border-volt/40 hover:text-volt disabled:pointer-events-none disabled:opacity-25"
        >
          ‹
        </button>
        <div
          ref={sportsRef}
          onScroll={updateSportScroll}
          className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto rounded-2xl border border-line bg-panel/50 p-1.5"
        >
          {SPORTS.map((s) => {
            const active = sport === s.name
            return (
              <button
                key={s.name}
                onClick={(event) => {
                  setSport(s.name)
                  setCountry(null)
                  setExpandedCountry(null)
                  setSelectedLeagueId(null)
                  setPinned(null)
                  event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
                }}
                className={`group flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-volt/12 text-volt ring-1 ring-volt/35 shadow-[0_0_20px_-6px_rgba(61,255,136,0.55)]"
                    : "text-mut hover:bg-panel-2 hover:text-fg"
                }`}
              >
                <SportIcon src={s.icon} tone={active ? "active" : "muted"} className={`h-4 w-4 transition-transform ${active ? "" : "group-hover:scale-110"}`} />
                {s.name !== "More" && <span>{s.name}</span>}
                {s.name === "More" && <span className="sr-only">More sports</span>}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => scrollSports(1)}
          disabled={!sportScroll.right}
          aria-label="Next sports"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-panel/70 text-lg text-fg transition-colors hover:border-volt/40 hover:text-volt disabled:pointer-events-none disabled:opacity-25"
        >
          ›
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[236px_1fr]">
        {/* Pinned leagues rail */}
        <aside className="hidden lg:block">
          <div className="no-scrollbar sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pb-8">
            <h2 className="mb-2 flex items-center gap-2 px-2.5 text-[11px] font-bold uppercase tracking-widest text-mut-2">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-volt" fill="currentColor">
                <path d="M16 3v2l-2 2v4l4 3v2h-5v5l-1 2-1-2v-5H5v-2l4-3V7L7 5V3z" />
              </svg>
              Pinned Leagues
            </h2>
            <nav className="space-y-px">
              {pinnedCountryLeagues
                .filter((item) => item.sport === sport)
                .map((item) => {
                  const countryInfo = countries.find((entry) => entry.name === item.country)
                  return (
                    <div key={`${item.sport}-${item.country}-${item.league.idLeague}`} className="group flex items-center rounded-lg hover:bg-panel/60">
                      <button
                        onClick={() => {
                          setCountry(item.country)
                          setSelectedLeagueId(item.league.idLeague)
                          setPinned(null)
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px] font-medium text-fg/90"
                      >
                        <LeagueIcon flag={countryInfo ? countryFlag(countryInfo.code) : "world"} />
                        <span className="truncate">{item.league.strLeague}</span>
                      </button>
                      <button
                        onClick={() => setPinnedCountryLeagues((items) => items.filter((pin) => !(pin.sport === item.sport && pin.country === item.country && pin.league.idLeague === item.league.idLeague)))}
                        className="mr-1 grid h-7 w-7 place-items-center text-volt opacity-70 hover:opacity-100"
                        aria-label={`Unpin ${item.league.strLeague}`}
                      >
                        <PinIcon filled />
                      </button>
                    </div>
                  )
                })}
              {!sportLeaguePins && (
                <RailButton active={pinned === null && country === null} onClick={() => { setPinned(null); setCountry(null) }}>
                  <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-volt/15 text-[12px] text-volt ring-1 ring-volt/30">★</span>
                  <span className="truncate">All competitions</span>
                </RailButton>
              )}
              {sportLeaguePins
                ? sportLeaguePins.map((item) => {
                    const countryInfo = countries.find((entry) => entry.name === item.country)
                    return (
                      <RailButton
                        key={item.name}
                        active={explorerCountry === item.country}
                        onClick={() => {
                          setCountry(item.country)
                          setSelectedLeagueId(null)
                          setPinned(null)
                        }}
                      >
                        <LeagueIcon flag={countryInfo ? countryFlag(countryInfo.code) : "world"} />
                        <span className="truncate">{item.name}</span>
                      </RailButton>
                    )
                  })
                : PINNED.map((l) => {
                    const selectable = matches.some((m) => m.league === l.name)
                    return (
                      <RailButton key={l.name} active={pinned === l.name} dim={!selectable} onClick={() => { setPinned(l.name); setCountry(null) }}>
                        <LeagueIcon flag={l.flag} />
                        <span className="truncate">{l.name}</span>
                      </RailButton>
                    )
                  })}
            </nav>

            {(sport === "Football" || sport === "Favorites") && (
              <>
                <RailHeading icon={<SportIcon src={starIcon} tone="amber" className="h-4 w-4" />}>
                  My Teams
                </RailHeading>
                <div className="space-y-px">
                  {myTeams.map((id) => (
                    <div key={id} className="group flex items-center rounded-lg pr-1 hover:bg-panel/60">
                      <button onClick={() => onTeam(id)} className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px] font-medium text-fg/90">
                        <Crest id={id} size={18} />
                        <span className="truncate">{teams[id].name}</span>
                      </button>
                      <button
                        onClick={() => follow(id)}
                        className="grid h-6 w-6 place-items-center rounded text-mut-2 opacity-0 transition-opacity hover:text-live group-hover:opacity-100"
                        aria-label={`Remove ${teams[id].name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {!user && (
                    <button onClick={() => go("signin")} className="w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] text-mut hover:bg-panel/60 hover:text-fg">
                      Sign in to follow clubs
                    </button>
                  )}
                  {user && <button
                    onClick={() => setPicking((v) => !v)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-extrabold uppercase tracking-[0.12em] text-live hover:bg-live/10"
                  >
                    <span className={`grid h-[22px] w-[22px] place-items-center text-lg leading-none transition-transform ${picking ? "rotate-45" : ""}`}>+</span>
                    Add the team
                  </button>}
                  {user && picking && (
                    <div className="mt-1 max-h-56 overflow-y-auto rounded-xl border border-line bg-ink-2 p-1">
                      {Object.values(teams)
                        .filter((t) => !myTeams.includes(t.id))
                        .sort((x, y) => x.name.localeCompare(y.name))
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={() => follow(t.id)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[12.5px] text-fg/85 hover:bg-panel hover:text-fg"
                          >
                            <Crest id={t.id} size={20} />
                            <span className="truncate">{t.name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <RailHeading icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1.2" /><circle cx="4" cy="12" r="1.2" /><circle cx="4" cy="18" r="1.2" /></svg>}>
                  Rankings
                </RailHeading>
                <RailButton onClick={() => go("competitions")}>
                  <LeagueIcon flag="world" />
                  <span className="truncate">FIFA</span>
                </RailButton>
              </>
            )}

            <h3 className="mb-1.5 mt-7 border-b border-line px-2.5 pb-2.5 text-[12px] font-extrabold uppercase tracking-[0.14em] text-fg">Countries</h3>
            <input
              value={countryQuery}
              onChange={(event) => setCountryQuery(event.target.value)}
              placeholder="Find a country…"
              className="mb-2 w-full rounded-lg border border-line bg-ink-2 px-2.5 py-2 text-[12px] text-fg placeholder:text-mut-2 focus:border-volt/40 focus:outline-none"
            />
            <div className="space-y-px">
              {visibleCountries.map((item) => (
                <CountryRailItem
                  key={item.code}
                  name={item.name}
                  flag={countryFlag(item.code)}
                  sport={sport}
                  expanded={expandedCountry === item.name}
                  activeLeagueId={country === item.name ? selectedLeagueId : null}
                  pinnedIds={new Set(
                    pinnedCountryLeagues
                      .filter((pin) => pin.sport === sport && pin.country === item.name)
                      .map((pin) => pin.league.idLeague),
                  )}
                  onToggle={() => setExpandedCountry((current) => current === item.name ? null : item.name)}
                  onSelect={(league) => {
                    setCountry(item.name)
                    setSelectedLeagueId(league.idLeague)
                    setPinned(null)
                  }}
                  onPin={(league) => {
                    setPinnedCountryLeagues((items) => {
                      const exists = items.some((pin) => pin.sport === sport && pin.country === item.name && pin.league.idLeague === league.idLeague)
                      if (exists) return items.filter((pin) => !(pin.sport === sport && pin.country === item.name && pin.league.idLeague === league.idLeague))
                      return [...items, { country: item.name, sport, league }]
                    })
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Match feed */}
        <div>
          {explorerCountry && selectedCountry && sport !== "Favorites" && sport !== "More" ? (
            <CountryExplorer
              country={explorerCountry}
              flag={countryFlag(selectedCountry.code)}
              sport={sport}
              initialLeagueId={selectedLeagueId ?? undefined}
              onTeam={onTeam}
              onBack={() => {
                setCountry(null)
                if (sport !== "Football") setSport("Football")
              }}
            />
          ) : (
            <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(["all", "live", "finished", "scheduled"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-bold capitalize transition-colors ${
                    filter === f
                      ? f === "live"
                        ? "bg-live text-white"
                        : "bg-volt text-ink"
                      : "bg-panel/60 text-mut hover:text-fg"
                  }`}
                >
                  {f}
                  {f === "live" && (
                    <span className={`rounded px-1 text-[10px] ${filter === f ? "bg-white/25" : "bg-live/20 text-live"}`}>
                      {liveCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-line bg-panel/60 px-1 py-1 text-[13px]">
              <button onClick={() => setDayOffset((day) => day - 1)} className="grid h-7 w-7 place-items-center rounded text-mut hover:text-fg" aria-label="Previous day">‹</button>
              <span className="flex items-center gap-2 px-2 font-semibold text-fg">
                <SportIcon src={calendarIcon} tone="active" className="h-4 w-4" />
                {dateLabel} {relativeDay}
              </span>
              <button onClick={() => setDayOffset((day) => day + 1)} className="grid h-7 w-7 place-items-center rounded text-mut hover:text-fg" aria-label="Next day">›</button>
            </div>
          </div>

          <div className="space-y-3">
            {(sport === "Football" || sport === "Favorites") && grouped.map(([lg, ms]) => {
              const info = leagueByName[lg]
              const meta = LEAGUE_META[lg] ?? (info?.logo ? { flag: info.logo, country: info.country.toUpperCase() } : { flag: "⚽", country: "" })
              const isCollapsed = collapsed[lg]
              return (
                <section key={lg} className="overflow-hidden rounded-2xl border border-line bg-panel/50 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-line bg-gradient-to-r from-panel-2 to-ink-2/70 px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <LeagueIcon flag={meta.flag} size={22} />
                      <span className="truncate text-[13px] font-bold">
                        {meta.country && <span className="text-mut">{meta.country}: </span>}
                        {lg}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => go("competitions")} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold text-cobalt hover:bg-cobalt/10">
                        <SportIcon src={scoreboardIcon} tone="cobalt" className="h-3.5 w-3.5" />
                        Standings
                      </button>
                      <button
                        onClick={() => setCollapsed((c) => ({ ...c, [lg]: !c[lg] }))}
                        className="grid h-6 w-6 place-items-center rounded text-mut hover:text-fg"
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                      >
                        <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {!isCollapsed &&
                    ms.map((m) => (
                      <MatchRow
                        key={m.id}
                        m={m}
                        fav={!!favs[m.id]}
                        onFav={() => setFavs((f) => ({ ...f, [m.id]: !f[m.id] }))}
                        onOpen={onOpen}
                        onTeam={onTeam}
                      />
                    ))}
                </section>
              )
            })}
            {sport !== "Football" && (sport !== "Favorites" || grouped.length === 0) && (
              <div className="grid place-items-center gap-3 rounded-2xl border border-line bg-panel/50 py-16 text-center">
                <SportIcon src={SPORTS.find((x) => x.name === sport)!.icon} className="h-10 w-10" />
                <p className="text-mut">{sport === "Favorites" ? "Star a match or follow a club to see it here." : `${sport} coverage is coming soon.`}</p>
              </div>
            )}
            {sport === "Football" && grouped.length === 0 && (
              <p className="rounded-2xl border border-line bg-panel/50 py-16 text-center text-mut">
                {dayOffset !== 0 ? `No tracked matches on ${dateLabel}.` : "No matches for this filter."}
              </p>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchRow({ m, fav, onFav, onOpen, onTeam }: { m: Match; fav: boolean; onFav: () => void; onOpen: (id: string) => void; onTeam: (id: string) => void }) {
  const live = m.status === "LIVE" || m.status === "HT"
  const done = m.status === "FT"
  const timeLabel = m.status === "UPCOMING" ? m.kickoff : m.status === "HT" ? "HT" : live ? `${m.minute}'` : "FT"

  return (
    <div className={`group relative flex items-stretch border-t border-line-soft transition-colors first:border-t-0 hover:bg-panel-2/60 ${live ? "bg-live/[0.03]" : ""}`}>
      {live && <span className="absolute inset-y-0 left-0 w-0.5 bg-live" />}
      <button onClick={onFav} className={`grid w-9 shrink-0 place-items-center transition-colors ${fav ? "text-amber" : "text-mut-2/50 hover:text-amber"}`} aria-label={fav ? "Remove favourite" : "Favourite"} aria-pressed={fav}>
        <SportIcon src={starIcon} tone={fav ? "amber" : "muted"} className={`h-3.5 w-3.5 transition-transform ${fav ? "scale-110" : ""}`} />
      </button>

      <button
        onClick={() => onOpen(m.id)}
        className={`grid w-14 shrink-0 place-items-center text-center font-mono-num text-[12px] font-semibold ${live ? "text-live" : "text-mut"}`}
        aria-label="Match details"
      >
        {timeLabel}
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-2.5 pr-3">
        <ScoreLine id={m.home} score={m.homeScore} show={!(m.status === "UPCOMING")} win={done && m.homeScore > m.awayScore} live={live} onTeam={onTeam} />
        <ScoreLine id={m.away} score={m.awayScore} show={!(m.status === "UPCOMING")} win={done && m.awayScore > m.homeScore} live={live} onTeam={onTeam} />
      </div>

      <button
        onClick={() => onOpen(m.id)}
        className="grid w-11 shrink-0 place-items-center border-l border-line-soft text-mut-2 group-hover:text-volt"
        aria-label={live ? "Watch live" : "Match info"}
      >
        <span className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${live ? "bg-volt/15 text-volt" : "group-hover:bg-panel"}`}>
          <SportIcon src={live ? playIcon : infoIcon} tone={live ? "active" : "muted"} className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  )
}

function ScoreLine({ id, score, show, win, live, onTeam }: { id: string; score: number; show: boolean; win: boolean; live: boolean; onTeam: (id: string) => void }) {
  const t = teams[id]
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onTeam(id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left hover:text-volt">
        <Crest id={id} size={18} />
        <span className={`flex-1 truncate text-[13px] ${win ? "font-bold text-fg" : "font-medium text-fg/85"}`}>{t.name}</span>
      </button>
      {show && (
        <span className={`w-6 text-right font-mono-num text-[14px] ${live ? "font-bold text-volt" : win ? "font-bold text-fg" : "font-semibold text-mut"}`}>
          {score}
        </span>
      )}
    </div>
  )
}

function PinIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M15 4.5 19.5 9l-3 1.5-3 3L12 18l-1.5-1.5L6 21l-1.5-1.5 4.5-4.5L7.5 13l3-3L12 6.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RailButton({ children, active, dim, onClick }: { children: ReactNode; active?: boolean; dim?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors ${
        active ? "bg-panel text-fg before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-volt" : "text-fg/80 hover:bg-panel/60 hover:text-fg"
      } ${dim ? "opacity-60" : ""}`}
    >
      {children}
    </button>
  )
}
