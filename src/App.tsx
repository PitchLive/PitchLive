import { useState } from "react"
import Navbar, { type Page } from "./components/Navbar"
import ScoreTicker from "./components/ScoreTicker"
import Home from "./pages/Home"
import Scores from "./pages/Scores"
import Competitions from "./pages/Competitions"
import Streaming from "./pages/Streaming"
import MatchDetail from "./pages/MatchDetail"
import Team from "./pages/Team"
import SignIn from "./pages/SignIn"
import Notifications from "./pages/Notifications"
import InfoPage, { type InfoPageKind } from "./pages/InfoPage"
import { LiveProvider, useLive } from "./api/LiveProvider"
import logo from "./imports/Gemini_Generated_Image_gjm08ggjm08ggjm0.png"

export default function App() {
  return (
    <LiveProvider>
      <Shell />
    </LiveProvider>
  )
}

function Shell() {
  const { matches } = useLive()
  const [page, setPage] = useState<Page>("home")
  const [matchId, setMatchId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [league, setLeague] = useState<string | null>(null)

  function openLeague(name: string | null) {
    setLeague(name)
    setPage("competitions")
    window.scrollTo({ top: 0 })
  }

  function go(p: Page) {
    setLeague(null)
    setPage(p)
    setMatchId(null)
    window.scrollTo({ top: 0 })
  }

  function openMatch(id: string) {
    setMatchId(id)
    setPage("match")
    window.scrollTo({ top: 0 })
  }

  function openTeam(id: string) {
    setTeamId(id)
    setPage("team")
    window.scrollTo({ top: 0 })
  }

  const liveMatch = matches.find((m) => m.featured) ?? matches.find((m) => m.status === "LIVE") ?? matches[0]

  return (
    <div className="min-h-screen bg-ink text-fg">
      <Navbar page={page} go={go} onTeam={openTeam} onLeague={openLeague} />
      <ScoreTicker onOpen={openMatch} />

      <main className="pb-24">
        {page === "home" && <Home onOpen={openMatch} onLeague={(l) => openLeague(l || null)} />}
        {page === "scores" && <Scores onOpen={openMatch} onTeam={openTeam} go={go} />}
        {page === "competitions" && <Competitions onTeam={openTeam} league={league} setLeague={openLeague} />}
        {page === "streaming" && <Streaming onOpen={openMatch} go={go} />}
        {page === "match" && matchId && <MatchDetail id={matchId} onTeam={openTeam} go={go} back={() => go("scores")} />}
        {page === "team" && teamId && (
          <Team id={teamId} onOpen={openMatch} onTeam={openTeam} onLeague={openLeague} onSignIn={() => go("signin")} back={() => (league ? openLeague(league) : go("scores"))} />
        )}
        {page === "signin" && <SignIn go={go} />}
        {page === "notifications" && <Notifications onOpen={openMatch} go={go} />}
        {(["news", "about", "fixtures", "help", "terms", "privacy"] as Page[]).includes(page) && (
          <InfoPage kind={page as InfoPageKind} go={go} onOpen={openMatch} />
        )}
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <img src={logo} alt="PITCHLIVE" className="h-10 w-auto object-contain" />
          <p className="text-[12px] text-mut-2">
            Tables &amp; club data: ESPN snapshot. Live match scores are simulated. Not affiliated with any competition.
          </p>
          <div className="flex gap-4 text-[13px] text-mut">
            <button className="hover:text-fg" onClick={() => go("about")}>About</button>
            <button className="hover:text-fg" onClick={() => go("fixtures")}>Fixtures</button>
            <button className="hover:text-fg" onClick={() => go("help")}>Help</button>
          </div>
        </div>
      </footer>

      {/* Floating watch-live button */}
      {page !== "match" && liveMatch && (
        <button
          onClick={() => openMatch(liveMatch.id)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-volt px-5 py-3.5 font-bold text-ink shadow-[0_8px_30px_rgba(61,255,136,0.45)] transition-transform hover:scale-105"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-live" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
          </span>
          Watch Live
        </button>
      )}
    </div>
  )
}
