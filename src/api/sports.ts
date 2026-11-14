// The sports PitchLive covers. Football is "soccer" in the API (ESPN's name); "football" there
// means American football.
export type Sport = "soccer" | "tennis" | "basketball" | "hockey" | "football" | "baseball"

export const SPORTS: { key: Sport; label: string }[] = [
  { key: "soccer", label: "Football" },
  { key: "tennis", label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "hockey", label: "Ice Hockey" },
  { key: "football", label: "American Football" },
  { key: "baseball", label: "Baseball" },
]
const KEYS = new Set<string>(SPORTS.map((s) => s.key))
export const isSport = (s: unknown): s is Sport => typeof s === "string" && KEYS.has(s)
export const sportLabel = (s: Sport) => SPORTS.find((x) => x.key === s)!.label

/** The sport a league id belongs to: "basketball.nba" → basketball; football slugs ("eng.1") → soccer. */
export function sportOfLeague(id: string | null | undefined): Sport {
  const head = id?.split(".")[0] ?? ""
  return head !== "soccer" && isSport(head) ? head : "soccer"
}

export const sportOf = (m: { sport?: string | null }): Sport => (isSport(m.sport) ? m.sport : "soccer")

/** Sports where a score change is a goal worth flashing and buzzing for (not every basket). */
export const hasGoals = (s: Sport) => s === "soccer" || s === "hockey"

/** Column headings for the score by period: Q1–Q4, P1–P3, innings, sets; extras are overtime. */
export function periodLabels(sport: Sport, leagueId: string | null, count: number): string[] {
  const college = Boolean(/college-basketball|NCAA .*Basketball/i.test(leagueId ?? ""))
  const regular = sport === "hockey" ? 3 : sport === "basketball" ? (college ? 2 : 4) : sport === "football" ? 4 : sport === "baseball" ? 9 : 5
  const prefix = sport === "hockey" ? "P" : sport === "tennis" ? "S" : sport === "baseball" ? "" : college ? "H" : "Q"
  return Array.from({ length: count }, (_, i) => (i < regular ? `${prefix}${i + 1}` : sport === "baseball" ? String(i + 1) : i === regular ? "OT" : `OT${i - regular + 1}`))
}

/** ESPN's live status line, short enough for a score row: "4:21 - 3rd" → "Q3 4:21", "End of 1st" → "End Q1". */
export function liveLabel(sport: Sport, leagueId: string | null, text: string | null | undefined): string {
  if (!text) return "LIVE"
  const prefix = sport === "hockey" ? "P" : /college-basketball|NCAA .*Basketball/i.test(leagueId ?? "") ? "H" : "Q"
  const clocked = /^(\d{1,2}:\d{2}|\d{1,2}\.\d) - (?:(\d)(?:st|nd|rd|th)|(\d?OT|SO))/.exec(text)
  if (clocked) return `${clocked[2] ? prefix + clocked[2] : clocked[3]} ${clocked[1]}`
  const ended = /^End of (\d)(?:st|nd|rd|th)/.exec(text)
  if (ended) return `End ${prefix}${ended[1]}`
  return text.length > 9 ? text.slice(0, 9) : text
}

/** "Final" → "FT", "Final/OT" → "F/OT", "Final/SO" → "F/SO", "Retired" stays. */
export function finalLabel(text: string | null | undefined): string {
  if (!text || /^final$/i.test(text)) return "FT"
  return text.replace(/^Final\//i, "F/").slice(0, 8)
}
