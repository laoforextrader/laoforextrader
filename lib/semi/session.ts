import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

// The dashboard session — separate from the website's Google session on
// purpose.
//
// Signing in with Google says who you are on laoforextrader.com. It does not
// say you are at the controls of a live trading account. That second step is
// typing the dashboard key, and this cookie is what remembers it. So "Sign
// out" on the control panel drops you back to the key screen without touching
// the website login, which is what the owner asked for and also the safer of
// the two: a shared or borrowed browser loses the controls, not the account.
//
// The cookie carries no secret. It is `account.expiry.hmac`, signed with
// NEXTAUTH_SECRET, and the account it names is checked against the signed-in
// user's own accounts on every request — so a stolen cookie is useless without
// that user's Google session as well.

const COOKIE = "semi_dash"
const REMEMBER_DAYS = 30

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET
  if (!s) throw new Error("NEXTAUTH_SECRET is required to sign the dashboard session")
  return s
}

function sign(account: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${account}.${exp}`).digest("base64url")
}

function sameString(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** The account this browser has unlocked, or null. Never throws. */
export async function dashSession(): Promise<string | null> {
  try {
    const raw = (await cookies()).get(COOKIE)?.value
    if (!raw) return null
    const [account, expRaw, mac] = raw.split(".")
    if (!account || !expRaw || !mac) return null
    const exp = Number(expRaw)
    if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null
    if (!sameString(mac, sign(account, exp))) return null
    return account
  } catch {
    return null
  }
}

/**
 * Open a dashboard session for this account.
 * `remember` keeps it for 30 days; without it the cookie dies with the browser
 * session, which is the right default on a phone someone else might pick up.
 */
export async function openDashSession(account: string, remember: boolean): Promise<void> {
  const days = remember ? REMEMBER_DAYS : 1
  const exp = Math.floor(Date.now() / 1000) + days * 86400
  const jar = await cookies()
  jar.set(COOKIE, `${account}.${exp}.${sign(account, exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // No maxAge at all = a session cookie, gone when the browser closes.
    ...(remember ? { maxAge: REMEMBER_DAYS * 86400 } : {}),
  })
}

export async function closeDashSession(): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
}

export const REMEMBER_DAYS_LABEL = REMEMBER_DAYS
