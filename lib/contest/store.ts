import { createHash, randomInt } from "crypto"
import { sanityWrite } from "@/lib/sanityWrite"

// ─────────────────────────────────────────────────────────────────────────────
// Data layer for the demo trading contest.
//
// Two documents: `contest` (the round) and `contestEntry` (one contestant).
// The round carries every date, prize and rule, so opening the next round on
// another broker is a new document in the Studio and nothing else.
//
// Unlike the Semi dashboard there is no in-process cache here. The contest EA
// pushes once a minute, not every three seconds, and the leaderboard is read
// far more often than it is written — caching belongs in the route's own
// revalidate window, not in a lambda-local map that each instance sees
// differently.
// ─────────────────────────────────────────────────────────────────────────────

export type LocaleText = { en?: string; th?: string; lo?: string }

export interface ContestPrize { place?: number; amount?: number; label?: LocaleText }
export interface ContestRule { text?: LocaleText }

export interface Contest {
  _id: string
  title: string
  slug: string
  status: "register" | "live" | "judging" | "done"
  broker?: string
  accountType?: string
  startBalance?: number
  currency?: string
  symbol?: string
  brokerSignupUrl?: string
  registerOpenAt?: string
  startAt: string
  endAt: string
  announceAt?: string
  prizes?: ContestPrize[]
  perks?: ContestRule[]
  earlyBirdCount?: number
  rules?: ContestRule[]
  maxEntries?: number
  winners?: Array<{ place?: number; verifiedProfit?: number; note?: string; entry?: any }>
}

/** A leaderboard row. Deliberately free of email, contact and entry code. */
export interface BoardRow {
  _id: string
  entryNo?: number
  displayName: string
  mtLogin: string
  country?: string
  equity?: number
  balance?: number
  profit?: number
  profitPct?: number
  maxDDPct?: number
  trades?: number
  openPositions?: number
  deposits?: number
  status?: string
  lastSeen?: string
}

const CONTEST_FIELDS = `
  _id, title, "slug": slug.current, status, broker, accountType, startBalance,
  currency, symbol, brokerSignupUrl, registerOpenAt, startAt, endAt, announceAt,
  prizes, perks, earlyBirdCount, rules, maxEntries,
  winners[]{ place, verifiedProfit, note, entry->{ _id, displayName, mtLogin, country, profit, profitPct } }
`

/**
 * The round the site should be showing.
 *
 * A round that is still running or being judged always wins over a finished
 * one, even if a later round has already been created for registration — so
 * during the 2-3 judging days the homepage still shows the race people care
 * about, and round 2 is reachable by its own URL.
 */
export async function currentContest(): Promise<Contest | null> {
  return sanityWrite.fetch<Contest | null>(
    `*[_type == "contest" && status in ["live", "judging"]] | order(startAt desc)[0]{${CONTEST_FIELDS}}`
  ).then(async live =>
    live ?? sanityWrite.fetch<Contest | null>(
      `*[_type == "contest" && status == "register"] | order(startAt asc)[0]{${CONTEST_FIELDS}}`
    )
  ).then(async open =>
    open ?? sanityWrite.fetch<Contest | null>(
      `*[_type == "contest" && status == "done"] | order(endAt desc)[0]{${CONTEST_FIELDS}}`
    )
  )
}

export async function contestBySlug(slug: string): Promise<Contest | null> {
  return sanityWrite.fetch<Contest | null>(
    `*[_type == "contest" && slug.current == $slug][0]{${CONTEST_FIELDS}}`, { slug }
  )
}

/** Every round, newest first — for the archive strip. */
export async function allContests(): Promise<Contest[]> {
  return sanityWrite.fetch<Contest[]>(
    `*[_type == "contest"] | order(startAt desc){${CONTEST_FIELDS}}`
  )
}

/**
 * The leaderboard for a round, best profit first.
 *
 * Disqualified entries are dropped; everyone else is shown, including those
 * who blew the account. Hiding them would make the board a lie about what a
 * martingale does over ten days, and the owner's own rule is that the numbers
 * are reported as they are.
 */
export async function leaderboard(contestId: string): Promise<BoardRow[]> {
  const rows = await sanityWrite.fetch<BoardRow[]>(
    `*[_type == "contestEntry" && contest._ref == $id && status != "disqualified"]{
       _id, entryNo, displayName, mtLogin, country, equity, balance, profit, profitPct,
       maxDDPct, trades, openPositions, deposits, status, lastSeen
     }`,
    { id: contestId }
  )
  return rows.sort((a, b) => (b.profit ?? -Infinity) - (a.profit ?? -Infinity))
}

export async function entryCount(contestId: string): Promise<number> {
  return sanityWrite.fetch<number>(
    `count(*[_type == "contestEntry" && contest._ref == $id])`, { id: contestId }
  )
}

/** This user's entry in this round, or null. Includes the code: it is theirs. */
export async function myEntry(email: string, contestId: string) {
  return sanityWrite.fetch<any>(
    `*[_type == "contestEntry" && contest._ref == $id && ownerEmail == $email][0]{
       _id, entryNo, displayName, mtLogin, mtServer, entryCode, status, lastSeen,
       profit, profitPct, equity
     }`,
    { id: contestId, email }
  )
}

// ── Entry code ───────────────────────────────────────────────────────────────
// Eight characters, no dashes, from an alphabet with the look-alikes removed
// (no O/0, I/1, S/5). People retype this off a web page into an MT5 input box,
// and the dashboard-key incident of 2026-11-16 was exactly this class of
// problem: the string the human types has to be the string the EA signs with,
// with nothing in between that can be written two ways.
const ALPHABET = "ABCDEFGHJKLMNPQRTUVWXYZ2346789"

export function newEntryCode(): string {
  let s = ""
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)]
  return s
}

/** Upper-cased, stripped of everything that is not in the alphabet's range. */
export const normCode = (code: string) =>
  String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")

/** SHA256(body + code) — the signature the contest EA sends in X-RM-Sign. */
export const signBody = (body: string, code: string) =>
  createHash("sha256").update(body + code, "utf8").digest("hex")

// ── Registration ─────────────────────────────────────────────────────────────

export type RegisterInput = {
  contestId: string
  email: string
  displayName: string
  contact: string
  country: string
  mtLogin: string
  mtServer: string
  startBalance: number
}

export type RegisterResult =
  | { ok: true; code: string; entryNo: number; earlyBird: boolean }
  | { ok: false; reason: "already-registered" | "login-taken" | "closed" | "full" }

/**
 * Register one contestant.
 *
 * Two uniqueness rules, both checked here rather than in the route so a second
 * caller (admin tooling, a later signup page) cannot skip them: one entry per
 * Google account per round, and one entry per MT5 login per round. The MT5
 * check is the one that matters — a second Google account is free, a second
 * demo account with the same login number does not exist.
 */
export async function registerEntry(input: RegisterInput): Promise<RegisterResult> {
  const { contestId, email, mtLogin } = input

  const contest = await sanityWrite.fetch<Contest | null>(
    `*[_type == "contest" && _id == $id][0]{${CONTEST_FIELDS}}`, { id: contestId }
  )
  if (!contest || contest.status !== "register") return { ok: false, reason: "closed" }

  const dupe = await sanityWrite.fetch<{ mine: number; login: number }>(
    `{
      "mine":  count(*[_type == "contestEntry" && contest._ref == $id && ownerEmail == $email]),
      "login": count(*[_type == "contestEntry" && contest._ref == $id && mtLogin == $login])
    }`,
    { id: contestId, email, login: mtLogin }
  )
  if (dupe.mine > 0) return { ok: false, reason: "already-registered" }
  if (dupe.login > 0) return { ok: false, reason: "login-taken" }

  const taken = await entryCount(contestId)
  if (contest.maxEntries && taken >= contest.maxEntries) return { ok: false, reason: "full" }

  const entryNo = taken + 1
  const code = newEntryCode()

  await sanityWrite.create({
    _type: "contestEntry",
    contest: { _type: "reference", _ref: contestId },
    entryNo,
    ownerEmail: email,
    displayName: input.displayName,
    contact: input.contact,
    country: input.country,
    mtLogin,
    mtServer: input.mtServer,
    startBalance: input.startBalance,
    entryCode: code,
    status: "pending",
    profit: 0,
    profitPct: 0,
    trades: 0,
  } as any)

  // entryNo is a convenience for display. The perk is decided by creation
  // order, which Sanity timestamps for us, so two people registering in the
  // same second cannot both think they are number five.
  const earlyBird = entryNo <= (contest.earlyBirdCount ?? 0)
  return { ok: true, code, entryNo, earlyBird }
}

/** Creation-ordered logins that earned the early-bird perk, for the admin. */
export async function earlyBirdWinners(contestId: string, howMany: number) {
  if (howMany <= 0) return []
  return sanityWrite.fetch<Array<{ displayName: string; mtLogin: string; contact: string }>>(
    `*[_type == "contestEntry" && contest._ref == $id] | order(_createdAt asc)[0...$n]{
       displayName, mtLogin, contact
     }`,
    { id: contestId, n: howMany }
  )
}
