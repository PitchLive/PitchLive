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

// New page: back to the top, and move focus to the content so screen readers announce it.
function toTop() {
  window.scrollTo({ top: 0 })
  document.getElementById("main")?.focus({ preventScroll: true })
}

function Shell() {
  const { matches, online } = useLive()
  const [page, setPage] = useState<Page>("home")
  const [matchId, setMatchId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [league, setLeague] = useState<string | null>(null)

  function openLeague(name: string | null) {
    setLeague(name)
    setPage("competitions")
    toTop()
  }

  function go(p: Page) {
    setLeague(null)
    setPage(p)
    setMatchId(null)
    toTop()
  }

  function openMatch(id: string) {
    setMatchId(id)
    setPage("match")
    toTop()
  }

  function openTeam(id: string) {
    setTeamId(id)
    setPage("team")
    toTop()
  }

  const liveCount = matches.filter((m) => m.status === "LIVE" || m.status === "HT").length

  return (
    <div className="min-h-screen bg-ink text-fg">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar page={page} go={go} onTeam={openTeam} onLeague={openLeague} />
      <ScoreTicker onOpen={openMatch} onAll={() => go("scores")} />
      {online === false && (
        <div className="border-b border-amber/30 bg-amber/10 px-4 py-2 text-center text-[13px] text-amber">
          Live scores are unavailable right now. We&rsquo;ll reconnect automatically.
        </div>
      )}

      <main id="main" tabIndex={-1} className="pb-24 outline-none">
        {page === "home" && <Home onOpen={openMatch} onLeague={(l) => openLeague(l || null)} go={go} />}
        {page === "scores" && <Scores onOpen={openMatch} onTeam={openTeam} onLeague={openLeague} go={go} />}
        {page === "competitions" && <Competitions onTeam={openTeam} onOpen={openMatch} league={league} setLeague={openLeague} />}
        {page === "streaming" && <Streaming onOpen={openMatch} go={go} />}
        {page === "match" && matchId && <MatchDetail id={matchId} onTeam={openTeam} onOpen={openMatch} onLeague={openLeague} go={go} back={() => go("scores")} />}
        {page === "team" && teamId && (
          <Team id={teamId} onOpen={openMatch} onTeam={openTeam} onLeague={openLeague} onSignIn={() => go("signin")} back={() => (league ? openLeague(league) : go("scores"))} />
        )}
        {page === "signin" && <SignIn go={go} />}
        {page === "notifications" && <Notifications onOpen={openMatch} go={go} />}
        {(["about", "fixtures", "help", "terms", "privacy"] as Page[]).includes(page) && (
          <InfoPage kind={page as InfoPageKind} go={go} onOpen={openMatch} />
        )}
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <button onClick={() => go("home")} aria-label="PitchLive home" className="shrink-0">
            <img src={logo} alt="PITCHLIVE" className="h-10 w-auto object-contain" />
          </button>
          <p className="text-[12px] text-mut-2">
            Scores, fixtures and tables: ESPN. Not affiliated with any club or competition.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-mut">
            <button className="hover:text-fg" onClick={() => go("about")}>About</button>
            <button className="hover:text-fg" onClick={() => go("fixtures")}>Fixtures</button>
            <button className="hover:text-fg" onClick={() => go("help")}>Help</button>
            <button className="hover:text-fg" onClick={() => go("terms")}>Terms</button>
            <button className="hover:text-fg" onClick={() => go("privacy")}>Privacy</button>
          </div>
        </div>
      </footer>

      {/* Floating live-now button */}
      {page !== "scores" && liveCount > 0 && (
        <button
          onClick={() => go("scores")}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-volt px-5 py-3.5 font-bold text-ink shadow-[0_8px_30px_rgba(61,255,136,0.45)] transition-transform hover:scale-105"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-live" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
          </span>
          {liveCount} live now
        </button>
      )}
    </div>
  )
}
