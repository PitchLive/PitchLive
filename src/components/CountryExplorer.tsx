import { useEffect, useMemo, useState } from "react"
import { teams } from "../data"

export type RemoteLeague = {
  idLeague: string
  strLeague: string
  strLeagueAlternate?: string
  intDivision?: string
  idCup?: string
  strCurrentSeason?: string
}

type RemoteTeam = {
  idTeam: string
  strTeam: string
  strLeague: string
  strBadge?: string
  strStadium?: string
  strLocation?: string
  intFormedYear?: string
  strDescriptionEN?: string
}

const COUNTRY_ALIASES: Record<string, string> = {
  "Côte d'Ivoire": "Ivory Coast",
  Czechia: "Czech Republic",
  Türkiye: "Turkey",
}

const FEATURED_LEAGUES: Record<string, RemoteLeague[]> = {
  "United States:Basketball": [{ idLeague: "4387", strLeague: "NBA", intDivision: "0", idCup: "0" }],
  "United States:Ice Hockey": [{ idLeague: "4380", strLeague: "NHL", intDivision: "0", idCup: "0" }],
  "United States:American Football": [{ idLeague: "4391", strLeague: "NFL", intDivision: "0", idCup: "0" }],
  "United States:Baseball": [{ idLeague: "4424", strLeague: "MLB", intDivision: "0", idCup: "0" }],
}

export async function fetchCountryLeagues(country: string, sport: string, signal?: AbortSignal) {
  const activeSport = sport?.trim() || "Football"
  const sourceCountry = COUNTRY_ALIASES[country] ?? country
  const sourceSport = activeSport === "Football" ? "Soccer" : activeSport
  const response = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=${encodeURIComponent(sourceCountry)}&s=${encodeURIComponent(sourceSport)}`,
    { signal },
  )
  if (!response.ok) throw new Error("Unable to load leagues")
  const payload = await response.json()
  let rawLeagues = (payload.countries ?? []) as RemoteLeague[]
  if (rawLeagues.length === 0 && activeSport === "Tennis") {
    const globalResponse = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?s=${encodeURIComponent(sourceSport)}`,
      { signal },
    )
    const globalPayload = globalResponse.ok ? await globalResponse.json() : { countries: [] }
    rawLeagues = (globalPayload.countries ?? []) as RemoteLeague[]
  }
  const featured = FEATURED_LEAGUES[`${country}:${activeSport}`] ?? []
  return [...featured, ...rawLeagues.filter((league) => !featured.some((item) => item.idLeague === league.idLeague))]
    .filter((league) => league.strLeague && league.idLeague)
    .sort((a, b) => {
      const aCup = a.idCup === "1" ? 1 : 0
      const bCup = b.idCup === "1" ? 1 : 0
      return aCup - bCup || Number(a.intDivision || 99) - Number(b.intDivision || 99) || a.strLeague.localeCompare(b.strLeague)
    })
}

function normalize(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(fc|afc|cf|ssc|sc|club)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export default function CountryExplorer({
  country,
  flag,
  sport,
  initialLeagueId,
  onTeam,
  onBack,
}: {
  country: string
  flag: string
  sport?: string
  initialLeagueId?: string
  onTeam: (id: string) => void
  onBack: () => void
}) {
  const activeSport = sport?.trim() || "Football"
  const [leagues, setLeagues] = useState<RemoteLeague[]>([])
  const [leagueId, setLeagueId] = useState("")
  const [clubs, setClubs] = useState<RemoteTeam[]>([])
  const [selectedClub, setSelectedClub] = useState<RemoteTeam | null>(null)
  const [loadingLeagues, setLoadingLeagues] = useState(true)
  const [loadingClubs, setLoadingClubs] = useState(false)
  const [error, setError] = useState("")

  const localTeams = useMemo(() => {
    const entries = Object.values(teams)
    return new Map(entries.map((team) => [normalize(team.name), team]))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoadingLeagues(true)
    setLeagues([])
    setLeagueId("")
    setClubs([])
    setSelectedClub(null)
    setError("")

    fetchCountryLeagues(country, activeSport, controller.signal)
      .then((available) => {
        setLeagues(available)
        const primary = available.find((league) => league.idLeague === initialLeagueId)
          ?? available.find((league) => league.idCup !== "1" && (league.intDivision === "0" || league.intDivision === "1"))
          ?? available.find((league) => league.idCup !== "1")
          ?? available[0]
        setLeagueId(primary?.idLeague ?? "")
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError("League data is not available for this country yet.")
      })
      .finally(() => setLoadingLeagues(false))

    return () => controller.abort()
  }, [country, activeSport, initialLeagueId])

  useEffect(() => {
    if (!leagueId) return
    const controller = new AbortController()
    setLoadingClubs(true)
    setClubs([])
    setSelectedClub(null)
    fetch(`https://www.thesportsdb.com/api/v1/json/3/lookup_all_teams.php?id=${leagueId}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load teams")
        return response.json()
      })
      .then((payload) => {
        const availableTeams = ((payload.teams ?? []) as RemoteTeam[]).filter((team) => typeof team.strTeam === "string" && team.strTeam.length > 0)
        setClubs(availableTeams)
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError("Team data is not available for this league yet.")
      })
      .finally(() => setLoadingClubs(false))
    return () => controller.abort()
  }, [leagueId])

  const activeLeague = leagues.find((league) => league.idLeague === leagueId)

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-line bg-panel p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-3xl leading-none">{flag}</span>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-volt">Country {activeSport}</span>
            <h1 className="truncate font-display text-2xl font-black">{country}</h1>
            <p className="text-sm text-mut">{leagues.length} {activeSport.toLowerCase()} competition{leagues.length === 1 ? "" : "s"} available</p>
          </div>
        </div>
        <button onClick={onBack} className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-mut hover:text-fg">
          Back to scores
        </button>
      </div>

      {loadingLeagues && <StatusCard text="Loading leagues…" />}
      {!loadingLeagues && error && leagues.length === 0 && <StatusCard text={error} />}
      {!loadingLeagues && !error && leagues.length === 0 && <StatusCard text={`No tracked ${activeSport.toLowerCase()} competitions were found for ${country}.`} />}

      {leagues.length > 0 && (
        <>
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            {leagues.map((league) => (
              <button
                key={league.idLeague}
                onClick={() => setLeagueId(league.idLeague)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                  leagueId === league.idLeague
                    ? "border-volt bg-volt/10 text-volt"
                    : "border-line bg-panel/60 text-mut hover:border-volt/30 hover:text-fg"
                }`}
              >
                {league.strLeague}
              </button>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-line bg-panel/50">
            <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-3">
              <div>
                <h2 className="font-display font-bold">{activeLeague?.strLeague}</h2>
                <p className="text-[11px] text-mut">{activeLeague?.strCurrentSeason || "Current season"} · {clubs.length} teams</p>
              </div>
            </div>

            {selectedClub && (
              <div className="border-b border-line bg-ink-2/60 p-4">
                <div className="flex items-start gap-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white/[0.04]">
                    {selectedClub.strBadge ? <img src={selectedClub.strBadge} alt="" className="h-12 w-12 object-contain" /> : <span className="font-display font-black text-mut">{selectedClub.strTeam.slice(0, 3).toUpperCase()}</span>}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-black">{selectedClub.strTeam}</h3>
                    <p className="text-sm text-mut">{selectedClub.strLeague}</p>
                    <p className="mt-1 text-[12px] text-mut-2">
                      {[selectedClub.strLocation, selectedClub.strStadium, selectedClub.intFormedYear && `Founded ${selectedClub.intFormedYear}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button onClick={() => setSelectedClub(null)} className="ml-auto text-sm text-mut hover:text-fg" aria-label="Close team details">×</button>
                </div>
              </div>
            )}

            {loadingClubs ? (
              <StatusCard text="Loading teams…" />
            ) : (
              <div className="grid gap-px bg-line-soft sm:grid-cols-2 xl:grid-cols-3">
                {clubs.map((club) => {
                  const local = activeSport === "Football" ? localTeams.get(normalize(club.strTeam)) : undefined
                  return (
                    <button
                      key={club.idTeam}
                      onClick={() => local ? onTeam(local.id) : setSelectedClub(club)}
                      className="flex min-w-0 items-center gap-3 bg-panel px-4 py-3 text-left transition-colors hover:bg-panel-2"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
                        {club.strBadge ? <img src={club.strBadge} alt="" className="h-8 w-8 object-contain" /> : <span className="text-[10px] font-bold text-mut">{club.strTeam.slice(0, 3).toUpperCase()}</span>}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-fg">{club.strTeam}</span>
                        <span className="block truncate text-[11px] text-mut">{local ? "Open PitchLive profile" : club.strLeague}</span>
                      </span>
                    </button>
                  )
                })}
                {!loadingClubs && clubs.length === 0 && (
                  <div className="col-span-full bg-panel">
                    <StatusCard text={activeSport === "Tennis" ? "This is an individual tour, so it does not publish a club roster." : "No teams were returned for this competition."} />
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function StatusCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-line bg-panel/50 px-5 py-14 text-center text-sm text-mut">{text}</div>
}
