import { useEffect, useState } from "react"
import type { Page } from "../components/Navbar"
import { useLive } from "../api/LiveProvider"
import { firebaseConfigured, preloadFirebase, sendReset, signInWithEmail, signInWithGoogle, signUpWithEmail, type FirebaseSignIn } from "../api/firebase"
import { photos } from "../imports/photos"

type Mode = "in" | "up" | "reset"

const COPY: Record<Mode, { title: string; lede: string; submit: string }> = {
  in: { title: "Welcome back", lede: "Sign in to follow clubs and join the live chat.", submit: "Sign In" },
  up: { title: "Join PITCHLIVE", lede: "Create an account to follow clubs and chat during matches.", submit: "Create Account" },
  reset: { title: "Reset your password", lede: "Enter your email and we'll send you a link to choose a new password.", submit: "Send Reset Link" },
}

export default function SignIn({ go }: { go: (p: Page) => void }) {
  const { online, completeSignIn, matches } = useLive()
  const [mode, setMode] = useState<Mode>("in")
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<"form" | "google" | null>(null)
  const [welcome, setWelcome] = useState<{ email: string; verificationSent: boolean } | null>(null)

  useEffect(preloadFirebase, [])

  const liveCount = matches.filter((m) => m.status === "LIVE" || m.status === "HT").length
  const unavailable = online === false || !firebaseConfigured
  const copy = COPY[mode]

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setNotice(null)
  }

  async function finish(signIn: FirebaseSignIn) {
    await completeSignIn(signIn)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy("form")
    try {
      if (mode === "reset") {
        await sendReset(email)
        setNotice(`If ${email} has a PitchLive account, a reset link is on its way. Check your inbox.`)
      } else if (mode === "in") {
        await finish(await signInWithEmail(email, password))
        go("home")
      } else {
        const res = await signUpWithEmail(name, email, password)
        await finish(res)
        setWelcome({ email, verificationSent: res.verificationSent })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setBusy(null)
    }
  }

  async function google() {
    setError(null)
    setNotice(null)
    setBusy("google")
    try {
      const res = await signInWithGoogle()
      if (!res) return
      await finish(res)
      go("home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setBusy(null)
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
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight">{welcome ? "You're in" : copy.title}</h1>
          <p className="mt-1.5 text-sm text-mut">{welcome ? "Your PitchLive account is ready." : copy.lede}</p>
        </div>

        {welcome ? (
          <div className="card space-y-4 rounded-2xl p-6 text-center">
            <p className="text-sm text-fg">
              {welcome.verificationSent ? (
                <>
                  We sent a link to <strong>{welcome.email}</strong>. Open it to verify your email, so you can always get back into your account.
                </>
              ) : (
                <>You're signed in as {welcome.email}.</>
              )}
            </p>
            <button onClick={() => go("scores")} className="w-full rounded-xl bg-volt py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_20px_rgba(61,255,136,0.5)]">
              Go to live scores
            </button>
          </div>
        ) : (
          <>
            {mode !== "reset" && (
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-line bg-panel/60 p-1" role="tablist">
                {(["in", "up"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => switchMode(m)}
                    className={`rounded-lg py-2 text-sm font-bold transition-colors ${mode === m ? "bg-volt text-ink" : "text-mut hover:text-fg"}`}
                  >
                    {m === "in" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            <div className="card space-y-3 rounded-2xl p-6">
              {unavailable && (
                <p className="rounded-xl border border-amber/30 bg-amber/10 px-3 py-2.5 text-[13px] text-amber">
                  {online === false ? "Accounts are unavailable right now: the PitchLive service can't be reached." : "Sign-in is being set up. Check back soon."}
                </p>
              )}

              {mode !== "reset" && (
                <>
                  <button
                    type="button"
                    onClick={google}
                    disabled={busy !== null || unavailable}
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-fg py-2.5 text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <GoogleMark />
                    {busy === "google" ? "Opening Google…" : "Continue with Google"}
                  </button>
                  <div className="flex items-center gap-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-mut-2">
                    <span className="h-px flex-1 bg-line" />
                    or with email
                    <span className="h-px flex-1 bg-line" />
                  </div>
                </>
              )}

              <form onSubmit={submit} className="space-y-3">
                {mode === "up" && (
                  <Field label="Display name" type="text" placeholder="Alex Morgan" value={name} onChange={setName} autoComplete="nickname" minLength={2} maxLength={40} />
                )}
                <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" />

                {mode !== "reset" && (
                  <label className="block">
                    <span className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-mut">
                      Password
                      {mode === "up" ? (
                        <span className="font-normal text-mut-2">At least 8 characters</span>
                      ) : (
                        <button type="button" onClick={() => switchMode("reset")} className="font-semibold text-cobalt hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </span>
                    <span className="flex items-center gap-2 rounded-xl border border-line bg-ink-2 px-3 py-2.5 focus-within:border-volt/50">
                      <input
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "in" ? "current-password" : "new-password"}
                        minLength={mode === "up" ? 8 : undefined}
                        maxLength={200}
                        required
                        className="w-full bg-transparent text-sm text-fg placeholder:text-mut-2 focus:outline-none"
                      />
                      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="text-[11px] font-bold text-mut hover:text-fg">
                        {show ? "HIDE" : "SHOW"}
                      </button>
                    </span>
                  </label>
                )}

                {error && (
                  <p role="alert" className="rounded-xl border border-live/30 bg-live/10 px-3 py-2.5 text-[13px] text-live">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" className="rounded-xl border border-volt/30 bg-volt/10 px-3 py-2.5 text-[13px] text-volt">
                    {notice}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy !== null || unavailable}
                  className="mt-1 w-full rounded-xl bg-volt py-3 text-sm font-bold text-ink transition-shadow hover:shadow-[0_0_20px_rgba(61,255,136,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                >
                  {busy === "form" ? "Please wait…" : copy.submit}
                </button>
              </form>

              {mode === "reset" && (
                <button type="button" onClick={() => switchMode("in")} className="w-full py-1 text-center text-[13px] font-semibold text-cobalt hover:underline">
                  Back to sign in
                </button>
              )}
            </div>

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
          </>
        )}
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
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
