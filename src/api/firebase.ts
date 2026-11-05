// Firebase Auth owns accounts (passwords, Google, resets). After a sign-in we trade the
// Firebase ID token for the API's own session cookie, so the rest of the app is unchanged.
// The SDK is loaded on demand: only the sign-in page pays for it.
import type { Auth, User as FirebaseUser } from "firebase/auth"

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)

let authPromise: Promise<{ auth: Auth; mod: typeof import("firebase/auth") }> | null = null

function load() {
  if (!firebaseConfigured) return Promise.reject(new AuthError("Sign-in isn't set up yet."))
  authPromise ??= Promise.all([import("firebase/app"), import("firebase/auth")]).then(async ([app, mod]) => {
    const auth = mod.getAuth(app.getApps()[0] ?? app.initializeApp(config))
    // The API cookie is the session; Firebase keeps nothing on the device.
    await mod.setPersistence(auth, mod.inMemoryPersistence)
    auth.useDeviceLanguage()
    return { auth, mod }
  })
  return authPromise
}

/** Start loading the SDK early (e.g. when the sign-in page opens). */
export const preloadFirebase = () => {
  if (firebaseConfigured) load().catch(() => {})
}

export class AuthError extends Error {}

export type FirebaseSignIn = { idToken: string; displayName?: string }

const token = async (user: FirebaseUser, displayName?: string): Promise<FirebaseSignIn> => ({ idToken: await user.getIdToken(true), displayName })

export async function signUpWithEmail(name: string, email: string, password: string): Promise<FirebaseSignIn & { verificationSent: boolean }> {
  const { auth, mod } = await load()
  try {
    const { user } = await mod.createUserWithEmailAndPassword(auth, email, password)
    await mod.updateProfile(user, { displayName: name }).catch(() => {})
    const verificationSent = await mod.sendEmailVerification(user).then(() => true, () => false)
    return { ...(await token(user, name)), verificationSent }
  } catch (err) {
    throw friendly(err)
  }
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseSignIn> {
  const { auth, mod } = await load()
  try {
    const { user } = await mod.signInWithEmailAndPassword(auth, email, password)
    return token(user)
  } catch (err) {
    throw friendly(err)
  }
}

/** Returns null when the visitor closes the Google window. */
export async function signInWithGoogle(): Promise<FirebaseSignIn | null> {
  const { auth, mod } = await load()
  try {
    const provider = new mod.GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    const { user } = await mod.signInWithPopup(auth, provider)
    return token(user)
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null
    throw friendly(err)
  }
}

export async function sendReset(email: string) {
  const { auth, mod } = await load()
  try {
    await mod.sendPasswordResetEmail(auth, email)
  } catch (err) {
    const code = (err as { code?: string }).code
    // Don't reveal whether an email has an account.
    if (code === "auth/user-not-found") return
    throw friendly(err)
  }
}

export async function signOutOfFirebase() {
  if (!authPromise) return
  const { auth, mod } = await authPromise
  await mod.signOut(auth).catch(() => {})
}

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-login-credentials": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
  "auth/weak-password": "Choose a stronger password: at least 8 characters.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-email": "Enter your email address first.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  "auth/account-exists-with-different-credential": "This email already signs in another way. Use your email and password instead.",
  "auth/operation-not-allowed": "That sign-in method isn't switched on yet.",
  "auth/unauthorized-domain": "Sign-in isn't allowed from this website address yet.",
}

function friendly(err: unknown): AuthError {
  const code = (err as { code?: string }).code ?? ""
  return new AuthError(MESSAGES[code] ?? "Something went wrong. Please try again.")
}
