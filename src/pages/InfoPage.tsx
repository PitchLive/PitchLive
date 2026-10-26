import { teams } from "../data"
import { useLive } from "../api/LiveProvider"
import { Crest, LiveBadge } from "../components/ui"
import type { Page } from "../components/Navbar"

export type InfoPageKind = Extract<Page, "about" | "fixtures" | "help" | "terms" | "privacy">

const COPY: Record<Exclude<InfoPageKind, "fixtures">, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] }> = {
  about: {
    eyebrow: "About PitchLive",
    title: "Football, without the noise.",
    intro: "PitchLive brings live scores, league tables, club pages and match chat into one focused match-day experience.",
    sections: [
      { title: "Live first", body: "Scores for every covered competition update the moment our data feed changes, and match clocks run in real time." },
      { title: "Built for supporters", body: "Follow clubs to get goal, kick-off, half-time and full-time alerts, and talk about the game in each match's live chat." },
      { title: "Where the data comes from", body: "Fixtures, scores, tables, form and stadiums come from ESPN's public football data and refresh automatically." },
    ],
  },
  help: {
    eyebrow: "Support",
    title: "How can we help?",
    intro: "Quick answers for navigating scores, clubs, alerts and chat.",
    sections: [
      { title: "Finding a club", body: "Use search in the navigation bar. Selecting a team opens its club page, where you can follow it." },
      { title: "Live scores", body: "Live Scores lists every match for the selected day; the left-hand menu shows what's in play right now, league by league." },
      { title: "Alerts", body: "Follow a club while signed in. Goals, kick-off, half-time and full-time for its matches appear under Notifications while PitchLive is open." },
      { title: "Chat", body: "Open any match to join its live chat. You need to be signed in to post." },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of use",
    intro: "The conditions for using PitchLive.",
    sections: [
      { title: "Information only", body: "Scores and statistics come from third-party data and can be delayed or corrected after the fact. Don't rely on them for betting or other decisions with financial consequences." },
      { title: "Your account", body: "Keep your password private. You're responsible for what's posted from your account in match chats." },
      { title: "Acceptable use", body: "Don't post abusive or unlawful content, disrupt the service, or republish club and competition marks without permission." },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    intro: "What PitchLive stores about you, and why.",
    sections: [
      { title: "Account details", body: "When you sign up we store your email address, display name and a one-way hash of your password. We never store the password itself." },
      { title: "Sessions", body: "A secure, HTTP-only cookie keeps you signed in. Signing out ends the session on our servers." },
      { title: "Activity", body: "We store the clubs you follow and the chat messages you post, which other users can see alongside your display name." },
    ],
  },
}

export default function InfoPage({
  kind,
  go,
  onOpen,
}: {
  kind: InfoPageKind
  go: (page: Page) => void
  onOpen: (id: string) => void
}) {
  const { matches } = useLive()
  if (kind === "fixtures") {
    return (
      <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-6">
        <PageHeader eyebrow="Match centre" title="Fixtures & results" intro="Every live, upcoming and completed match from yesterday to tomorrow across the competitions PitchLive covers." />
        <div className="mt-7 space-y-3">
          {matches.length === 0 && <p className="card rounded-2xl px-6 py-14 text-center text-sm text-mut">No fixtures to show right now.</p>}
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => onOpen(match.id)}
              className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-line bg-panel px-4 py-4 text-left transition-colors hover:border-volt/40 hover:bg-panel-2"
            >
              <span className="flex min-w-0 items-center justify-end gap-2">
                <span className="truncate text-right text-sm font-semibold">{teams[match.home].name}</span>
                <Crest id={match.home} size={24} />
              </span>
              <span className="min-w-16 text-center">
                {match.status === "UPCOMING" ? (
                  <span className="font-mono-num text-sm font-bold text-mut">{match.kickoff}</span>
                ) : (
                  <span className="font-mono-num text-lg font-extrabold">{match.homeScore} : {match.awayScore}</span>
                )}
                <span className="mt-1 flex justify-center"><LiveBadge m={match} /></span>
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <Crest id={match.away} size={24} />
                <span className="truncate text-sm font-semibold">{teams[match.away].name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const copy = COPY[kind]
  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <div className="mt-7 space-y-3">
        {copy.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-display text-lg font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mut">{section.body}</p>
          </section>
        ))}
      </div>
      <button onClick={() => go("home")} className="mt-6 rounded-xl bg-volt px-5 py-3 text-sm font-bold text-ink">
        Back to home
      </button>
    </div>
  )
}

function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <header>
      <span className="text-[11px] font-bold uppercase tracking-widest text-volt">{eyebrow}</span>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mut">{intro}</p>
    </header>
  )
}
