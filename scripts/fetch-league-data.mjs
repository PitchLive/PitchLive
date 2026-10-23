// Pulls current tables + club details for major leagues from ESPN public endpoints
// and writes src/generated/leagueData.ts. Run with: npm run data:leagues
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const LEAGUES = [
  ["eng.1", "Premier League"],
  ["esp.1", "La Liga"],
  ["ita.1", "Serie A"],
  ["ger.1", "Bundesliga"],
  ["fra.1", "Ligue 1"],
  ["eng.2", "EFL Championship"],
  ["uefa.champions", "UEFA Champions League"],
  ["uefa.europa", "UEFA Europa League"],
  ["ned.1", "Eredivisie"],
  ["por.1", "Primeira Liga"],
  ["tur.1", "Süper Lig"],
  ["sco.1", "Scottish Premiership"],
  ["bel.1", "Belgian Pro League"],
  ["ksa.1", "Saudi Pro League"],
  ["usa.1", "MLS"],
  ["mex.1", "Liga MX"],
  ["bra.1", "Brasileirão"],
  ["arg.1", "Liga Profesional"],
]

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url.replace("http://", "https://"))
      if (r.ok) return await r.json()
    } catch {}
    await new Promise((r) => setTimeout(r, 500 * (i + 1)))
  }
  return null
}

async function pool(items, n, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const k = i++
        out[k] = await fn(items[k], k)
      }
    }),
  )
  return out
}

// Existing ids in the project
const src = fs.readFileSync(path.join(ROOT, "src/data.ts"), "utf8") + fs.readFileSync(path.join(ROOT, "src/additionalTeams.ts"), "utf8")
const existing = [...src.matchAll(/\{ id: "([^"]+)", name: "([^"]+)"/g)].map((m) => ({ id: m[1], name: m[2] }))
const byEspn = new Map()
for (const e of existing) {
  const m = e.id.match(/-(\d+)$/)
  if (m) byEspn.set(m[1], e.id)
}
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(fc|cf|afc|ssc|ac|as|sc|the|hove|albion|&)\b/g, "")
    .replace(/[^a-z]/g, "")
const coreByName = new Map(existing.filter((e) => !/-\d+$/.test(e.id)).map((e) => [norm(e.name), e.id]))
const ALIASES = { intermilan: "int", internazionale: "int", acmilan: "mil", milan: "mil", napoli: "nap", barcelona: "bar", brighton: "bha", bayernmunich: "bay", parissaintgermain: "psg", monaco: "mon", sevilla: "sev", alnassr: "nas", tottenhamhotspur: "tot", atleticomadrid: "atm", ajax: "ned-ajax", ajaxamsterdam: "ned-ajax" }

const teams = new Map() // espnId -> team
const tables = {}
const leagueMeta = {}

for (const [slug, label] of LEAGUES) {
  const s = await get(`https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`)
  if (!s) {
    console.log("FAILED", slug)
    continue
  }
  const groups = s.children?.length ? s.children : [s]
  let season = 0
  tables[label] = groups.map((g) => {
    season = g.standings.season ?? season
    return {
      group: groups.length > 1 ? g.name : undefined,
      rows: g.standings.entries.map((e) => {
        const st = Object.fromEntries(e.stats.map((x) => [x.name, x.value]))
        const t = e.team
        if (!teams.has(t.id))
          teams.set(t.id, {
            espnId: t.id,
            name: t.displayName,
            short: t.abbreviation,
            location: t.location,
            logo: t.logos?.[0]?.href,
            leagues: [],
            slug,
          })
        const tm = teams.get(t.id)
        if (!tm.leagues.includes(label)) tm.leagues.push(label)
        return {
          espnId: t.id,
          p: st.gamesPlayed ?? 0,
          w: st.wins ?? 0,
          d: st.ties ?? 0,
          l: st.losses ?? 0,
          gf: st.pointsFor ?? 0,
          ga: st.pointsAgainst ?? 0,
          pts: st.points ?? 0,
          note: e.note?.description,
          noteColor: e.note?.color,
        }
      }),
    }
  })
  leagueMeta[label] = { slug, season: s.children?.[0]?.standings?.seasonDisplayName ?? String(season), name: s.name }
  const sb = await get(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`)
  const logos = sb?.leagues?.[0]?.logos ?? []
  leagueMeta[label].logo = (logos.find((l) => l.rel?.includes("dark")) ?? logos[0])?.href
  leagueMeta[label].year = season
  console.log(slug, groups.length, "groups", tables[label].reduce((a, g) => a + g.rows.length, 0), "rows")
}

// Per-team details from the core API (first league the team appears in = its domestic league
// for everything except clubs only seen in UEFA tables)
const all = [...teams.values()]
await pool(all, 16, async (t) => {
  const year = leagueMeta[t.leagues[0]].year
  const d = await get(`https://sports.core.api.espn.com/v2/sports/soccer/leagues/${t.slug}/seasons/${year}/teams/${t.espnId}?lang=en&region=us`)
  if (!d) return
  t.color = d.color
  t.color2 = d.alternateColor
  t.stadium = d.venue?.fullName
  t.city = d.venue?.address?.city
  t.country = d.venue?.address?.country
  t.form = d.form
})

// Domestic league = first non-UEFA league
for (const t of all) {
  t.league = t.leagues.find((l) => !l.startsWith("UEFA")) ?? t.leagues[0]
  t.id = byEspn.get(t.espnId) ?? coreByName.get(norm(t.name)) ?? ALIASES[norm(t.name)] ?? `t-${t.espnId}`
}
const mapped = all.filter((t) => !t.id.startsWith("t-")).length
console.log("teams", all.length, "mapped to existing", mapped)
console.log("core unmatched:", existing.filter((e) => !all.some((t) => t.id === e.id)).map((e) => e.name).join(", "))

const idOf = new Map(all.map((t) => [t.espnId, t.id]))
const formArr = (f) => (f ? f.split("").filter((c) => "WDL".includes(c)).slice(-5) : [])
const formOf = new Map(all.map((t) => [t.espnId, formArr(t.form)]))

const outTables = {}
for (const [label, groups] of Object.entries(tables)) {
  for (const g of groups) {
    const ordered = g.rows.every((r, i) => i === 0 || g.rows[i - 1].pts >= r.pts)
    if (!ordered) g.rows.sort((x, y) => y.pts - x.pts || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf)
  }
  outTables[label] = groups.map((g) => ({
    ...(g.group ? { group: g.group } : {}),
    rows: g.rows.map((r) => ({
      team: idOf.get(r.espnId),
      p: r.p,
      w: r.w,
      d: r.d,
      l: r.l,
      gf: r.gf,
      ga: r.ga,
      pts: r.pts,
      form: formOf.get(r.espnId),
      ...(r.note ? { note: r.note, noteColor: r.noteColor } : {}),
    })),
  }))
}

const hex = (c, fb) => (c && /^[0-9a-f]{6}$/i.test(c) ? `#${c}` : fb)
const details = {}
for (const t of all)
  details[t.id] = {
    stadium: t.stadium,
    city: t.city,
    country: t.country,
    leagues: t.leagues,
  }
const newTeams = all
  .filter((t) => t.id.startsWith("t-"))
  .map((t) => ({
    id: t.id,
    name: t.name,
    short: t.short,
    city: t.city ?? t.location,
    league: t.league,
    color: hex(t.color, "#334155"),
    color2: hex(t.color2, "#ffffff"),
    logo: t.logo,
  }))
// Remote logos for existing clubs that lack local artwork
const remoteLogos = Object.fromEntries(all.filter((t) => !t.id.startsWith("t-") && t.logo).map((t) => [t.id, t.logo]))

const header = `// AUTO-GENERATED from ESPN public soccer endpoints on ${new Date().toISOString().slice(0, 10)}.
// Tables, form and venues are a point-in-time snapshot.
import type { Team, Standing } from "../data"

export type TeamDetail = { stadium?: string; city?: string; country?: string; leagues: string[] }
export type TableGroup = { group?: string; rows: (Standing & { note?: string; noteColor?: string })[] }
export type LeagueFeed = { slug: string; season: string; logo?: string }
`
const body =
  header +
  `\nexport const feedLeagues: Record<string, LeagueFeed> = ${JSON.stringify(Object.fromEntries(Object.entries(leagueMeta).map(([k, v]) => [k, { slug: v.slug, season: v.season, logo: v.logo }])), null, 2)}\n` +
  `\nexport const feedTeams: Team[] = ${JSON.stringify(newTeams)}\n` +
  `\nexport const remoteLogos: Record<string, string> = ${JSON.stringify(remoteLogos)}\n` +
  `\nexport const teamDetails: Record<string, TeamDetail> = ${JSON.stringify(details)}\n` +
  `\nexport const leagueTables: Record<string, TableGroup[]> = ${JSON.stringify(outTables)}\n`
fs.mkdirSync(path.join(ROOT, "src/generated"), { recursive: true })
fs.writeFileSync(path.join(ROOT, "src/generated/leagueData.ts"), body.replace(/"form":\["/g, '"form":["'))
console.log("written", body.length)
