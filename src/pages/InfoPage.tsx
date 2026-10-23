import { teams } from "../data"
import { useLive } from "../api/LiveProvider"
import { Crest, LiveBadge } from "../components/ui"
import type { Page } from "../components/Navbar"

export type InfoPageKind = Extract<Page, "news" | "about" | "fixtures" | "help" | "terms" | "privacy">

const COPY: Record<Exclude<InfoPageKind, "news" | "fixtures">, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] }> = {
  about: {
    eyebrow: "About PitchLive",
    title: "Football, without the noise.",
    intro: "PitchLive brings scores, streams, match data, and club alerts into one focused match-day experience.",
    sections: [
      { title: "Live first", body: "Follow every active fixture through fast score updates, detailed match centres, and dedicated streaming views." },
      { title: "Built for supporters", body: "Pin clubs, browse competitions, and control which moments trigger an alert." },
      { title: "A demo experience", body: "Match events, tables, squads, and streams are simulated for demonstration purposes." },
    ],
  },
  help: {
    eyebrow: "Support",
    title: "How can we help?",
    intro: "Quick answers for navigating scores, streams, alerts, and club pages.",
    sections: [
      { title: "Finding a club", body: "Use search in the navigation bar. Selecting a team opens its dedicated club profile." },
      { title: "Watching a match", body: "Open any live match or stream card, then select the Stream tab or use the player controls." },
      { title: "Managing alerts", body: "Open Notifications to enable or disable goals, kick-off reminders, full-time results, and news." },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of use",
    intro: "These terms describe the conditions for using this PitchLive demonstration.",
    sections: [
      { title: "Demo content", body: "Scores, commentary, streams, player names, and competition data may be simulated and should not be relied on as official information." },
      { title: "Acceptable use", body: "Do not attempt to disrupt the service, misuse account features, or republish protected assets without permission." },
      { title: "Availability", body: "Features may change or become unavailable as the product demonstration evolves." },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    intro: "PitchLive is designed to keep this demonstration simple and transparent.",
    sections: [
      { title: "Account forms", body: "Sign-in and registration forms are demonstrations and do not create or store a real account." },
      { title: "Preferences", body: "Temporary interface preferences are held only in the current browser session." },
      { title: "Third-party media", body: "Some photography and club artwork is loaded from credited project assets or external media providers." },
    ],
  },
}

const NEWS = [
  { category: "Matchday", title: "Eight live fixtures headline tonight’s schedule", body: "Follow the biggest games through live scores, commentary, and match centres." },
  { category: "Competitions", title: "Title races tighten across Europe", body: "Review the latest form and standings from every league represented on PitchLive." },
  { category: "Product", title: "Club search now covers 340+ teams", body: "Find clubs across 18 major competitions — from the Premier League to MLS and the Brasileirão — and open their profile in one click." },
]

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
        <PageHeader eyebrow="Match centre" title="Fixtures & results" intro="Every live, upcoming, and completed match currently tracked by PitchLive." />
        <div className="mt-7 space-y-3">
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
                <span className="mt-1 flex justify-center"><LiveBadge minute={match.minute} status={match.status} /></span>
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

  if (kind === "news") {
    return (
      <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-6">
        <PageHeader eyebrow="PitchLive newsroom" title="Latest news" intro="Matchday stories, competition updates, and product announcements." />
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {NEWS.map((article) => (
            <article key={article.title} className="rounded-2xl border border-line bg-panel p-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-volt">{article.category}</span>
              <h2 className="mt-3 font-display text-xl font-extrabold leading-tight">{article.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-mut">{article.body}</p>
              <button onClick={() => go("scores")} className="mt-5 text-sm font-bold text-cobalt hover:text-volt">
                Explore coverage
              </button>
            </article>
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
