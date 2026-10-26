import { useState } from "react"
import type { Page } from "../components/Navbar"
import { useLive } from "../api/LiveProvider"
import { photos } from "../imports/photos"
import googleLogo from "../imports/icons/google.svg"
import appleLogo from "../imports/icons/apple.svg"

export default function SignIn({ go }: { go: (p: Page) => void }) {
  const { online, login, register, matches } = useLive()
  const [mode, setMode] = useState<"in" | "up">("in")
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const liveCount = matches.filter((m) => m.status === "LIVE" || m.status === "HT").length

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === "in") await login(email, password)
      else await register(email, password, name)
      go("home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: `url(${photos.stadiumNight})`, backgroundSize: "cover", backgroundPosition: "center 20%" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />
      <div className="relative mx-auto flex max-w-[440px] flex-col px-4 py-10 sm:px-6">
        <div className="mb-6 text-center">
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-3 py-1 text-[11px] font-bold text-live">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-live" /> LIVE NOW · {liveCount} {liveCount === 1 ? "MATCH" : "MATCHES"}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight">{mode === "in" ? "Welcome back" : "Join PITCHLIVE"}</h1>
          <p className="mt-1.5 text-sm text-mut">
            {mode === "in" ? "Sign in to follow clubs and join the live chat." : "Create an account to follow clubs and chat during matches."}
          </p>
        </div>

        {/* Segmented toggle */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-line bg-panel/60 p-1">
          {(["in", "up"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={`rounded-lg py-2 text-sm font-bold transition-colors ${mode === m ? "bg-volt text-ink" : "text-mut hover:text-fg"}`}
            >
              {m === "in" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="card space-y-3 rounded-2xl p-6">
          {online === false && (
            <p className="rounded-xl border border-amber/30 bg-amber/10 px-3 py-2.5 text-[13px] text-amber">
              Accounts are unavailable right now — the PitchLive service can&rsquo;t be reached.
            </p>
          )}
          {mode === "up" && (
            <Field label="Display name" type="text" placeholder="Alex Morgan" value={name} onChange={setName} autoComplete="nickname" minLength={2} maxLength={40} />
          )}
          <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" />

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-mut">
              Password
              {mode === "up" && <span className="font-normal text-mut-2">At least 8 characters</span>}
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-line bg-ink-2 px-3 py-2.5 focus-within:border-volt/50">
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                minLength={mode === "up" ? 8 : undefined}
                required
                className="w-full bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-[11px] font-bold text-mut hover:text-fg">
                {show ? "HIDE" : "SHOW"}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-live/30 bg-live/10 px-3 py-2.5 text-[13px] text-live">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || online === false}
            className="mt-1 w-full rounded-xl bg-volt py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_20px_rgba(61,255,136,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            {busy ? "Please wait…" : mode === "in" ? "Sign In" : "Create Account"}
          </button>

          <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-wider text-mut-2">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SocialBtn label="Google" icon={googleLogo} />
            <SocialBtn label="Apple" icon={appleLogo} />
          </div>
        </form>

        <p className="mt-5 text-center text-[12px] text-mut-2">
          By continuing you agree to our{" "}
          <button onClick={() => go("terms")} className="text-cobalt hover:underline">
            Terms
          </button>
          {" & "}
          <button onClick={() => go("privacy")} className="text-cobalt hover:underline">
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  minLength,
  maxLength,
}: {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  minLength?: number
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-mut">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        required
        className="w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-sm text-fg placeholder:text-mut-2 focus:border-volt/50 focus:outline-none"
      />
    </label>
  )
}

// Social sign-in isn't wired to a provider yet.
function SocialBtn({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      disabled
      title={`${label} sign-in is coming soon`}
      className="flex items-center justify-center gap-2 rounded-xl border border-line bg-ink-2 py-2.5 text-sm font-semibold text-fg opacity-60"
    >
      <img src={icon} alt="" className="h-5 w-5" />
      {label}
      <span className="text-[10px] font-medium text-mut-2">soon</span>
    </button>
  )
}
