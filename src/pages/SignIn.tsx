import { useState } from "react"
import type { Page } from "../components/Navbar"
import { photos } from "../imports/photos"
import googleLogo from '../imports/icons/google.svg'
import appleLog from '../imports/icons/apple.svg'

export default function SignIn({ go }: { go: (p: Page) => void }) {
  const [mode, setMode] = useState<"in" | "up">("in")
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: `url(${photos.stadiumNight})`, backgroundSize: "cover", backgroundPosition: "center 20%" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />
      <div className="relative mx-auto flex max-w-[440px] flex-col px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-3 py-1 text-[11px] font-bold text-live">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> LIVE NOW · 6 MATCHES
        </span>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight">
          {mode === "in" ? "Welcome back" : "Join PITCHLIVE"}
        </h1>
        <p className="mt-1.5 text-sm text-mut">
          {mode === "in" ? "Sign in to follow clubs and stream live." : "Create an account to unlock live streaming & alerts."}
        </p>
      </div>

      {/* Segmented toggle */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-line bg-panel/60 p-1">
        {(["in", "up"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg py-2 text-sm font-bold transition-colors ${
              mode === m ? "bg-volt text-ink" : "text-mut hover:text-fg"
            }`}
          >
            {m === "in" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          go("home")
        }}
        className="space-y-3 rounded-2xl border border-line bg-panel p-6"
      >
        {mode === "up" && <Field label="Full name" type="text" placeholder="Alex Morgan" />}
        <Field label="Email" type="email" placeholder="you@example.com" />

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-mut">
            Password
            {mode === "in" && (
              <button type="button" onClick={() => go("help")} className="text-cobalt hover:underline">
                Forgot?
              </button>
            )}
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-line bg-ink-2 px-3 py-2.5 focus-within:border-volt/50">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-[11px] font-bold text-mut hover:text-fg">
              {show ? "HIDE" : "SHOW"}
            </button>
          </span>
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-volt py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_20px_rgba(61,255,136,0.5)]"
        >
          {mode === "in" ? "Sign In" : "Create Account"}
        </button>

        <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-wider text-mut-2">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SocialBtn label="Google" onClick={() => go("home")} />
          <SocialBtn label="Apple" onClick={() => go("home")} />
        </div>
      </form>

      <p className="mt-5 text-center text-[12px] text-mut-2">
        By continuing you agree to our{" "}
        <button onClick={() => go("terms")} className="text-cobalt hover:underline">Terms</button>
        {" & "}
        <button onClick={() => go("privacy")} className="text-cobalt hover:underline">Privacy Policy</button>.
        Demo experience — no real account is created.
      </p>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-mut">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-sm text-fg placeholder:text-mut-2 focus:border-volt/50 focus:outline-none"
      />
    </label>
  )
}

function SocialBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-line bg-ink-2 py-2.5 text-sm font-semibold text-fg hover:border-volt/40 "
    > 
    {label==="Google"?<img 
    style={{width:"20px", marginLeft:"72px"}} src="src/imports/icons/google.svg"/>:<img style={{
      width:"20px",marginLeft:"72px"
    }} src="src/imports/icons/apple.svg"/>}
      
    </button>
  )
}
