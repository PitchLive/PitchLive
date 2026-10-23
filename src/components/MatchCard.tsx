import { teams, type Match } from "../data"
import { Crest, LiveBadge, StatChip, fmtViewers } from "./ui"

export default function MatchCard({ match, onOpen }: { match: Match; onOpen: (id: string) => void }) {
  const home = teams[match.home]
  const away = teams[match.away]
  const upcoming = match.status === "UPCOMING"
  const isLive = match.status === "LIVE"

  return (
    <button
      onClick={() => onOpen(match.id)}
      className="card card-hover group relative w-full overflow-hidden rounded-2xl p-4 text-left"
    >
      {isLive && (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-live/70 to-transparent" />
      )}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LiveBadge minute={match.minute} status={match.status} />
          {upcoming && (
            <span className="font-mono-num text-[13px] font-semibold text-fg">{match.kickoff}</span>
          )}
        </div>
        {isLive && match.viewers ? (
          <span className="flex items-center gap-1 text-[11px] text-mut">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            </svg>
            {fmtViewers(match.viewers)}
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <TeamRow id={match.home} name={home.name} score={match.homeScore} show={!upcoming} lead={match.homeScore > match.awayScore && !upcoming} />
        <TeamRow id={match.away} name={away.name} score={match.awayScore} show={!upcoming} lead={match.awayScore > match.homeScore && !upcoming} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-mut-2">{match.league}</span>
        <div className="flex items-center gap-3">
          <StatChip kind="card" value={(match.homeCards ?? 0) + (match.awayCards ?? 0)} tone="amber" />
          <StatChip kind="sub" value={match.subs ?? 0} tone="cobalt" />
          <span className="text-mut-2 transition-transform group-hover:translate-x-0.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  )
}

function TeamRow({ id, name, score, show, lead }: { id: string; name: string; score: number; show: boolean; lead: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Crest id={id} size={22} />
      <span className={`flex-1 truncate text-[15px] ${lead ? "font-bold text-fg" : "font-medium text-fg/85"}`}>{name}</span>
      {show && (
        <span className={`font-mono-num text-xl leading-none ${lead ? "font-bold text-volt" : "font-semibold text-fg"}`}>
          {score}
        </span>
      )}
    </div>
  )
}
