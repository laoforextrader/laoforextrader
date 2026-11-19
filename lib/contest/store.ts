import { createHash, randomInt } from "crypto"
import { sanityWrite } from "@/lib/sanityWrite"
import { blindIndex, encryptPII, decryptPII } from "@/lib/pii"

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
export interface ContestSponsor { name?: string; logo?: any; url?: string; role?: LocaleText }
export type { LocaleText as ContestLocaleText }

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
  sponsors?: ContestSponsor[]
  recap?: LocaleText
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
  avatar?: string
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
  prizes, perks, earlyBirdCount, rules, sponsors, recap, maxEntries,
  winners[]{ place, verifiedProfit, note, entry->{ _id, displayName, mtLogin, country, avatar, profit, profitPct } }
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
    //  Approved and after: someone who has registered but whose account has
    //  not been checked yet is not on the public board, which is what lets
    //  the code go out early without putting an unchecked account in front
    //  of everyone.
    `*[_type == "contestEntry" && contest._ref == $id &&
       status in ["approved", "active", "flagged", "blown"]]{
       _id, entryNo, displayName, mtLogin, country, avatar, equity, balance, profit, profitPct,
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

/** Entries that still hold a seat — everyone except the cancelled ones. */
export async function liveEntryCount(contestId: string): Promise<number> {
  return sanityWrite.fetch<number>(
    `count(*[_type == "contestEntry" && contest._ref == $id && status != "cancelled"])`,
    { id: contestId }
  )
}

/**
 * Is this person on the block list?
 *
 * Any one of the three matching is enough. They are compared as blind
 * indexes, so this answers "is it the same phone" without the dataset — which
 * is public — ever holding the number itself. A block is not tied to a round:
 * the owner's rule is that a blocked person cannot enter again at all.
 */
export async function isBlocked(
  keys: { emailHash?: string; phoneHash?: string; mtLogin?: string }
): Promise<boolean> {
  const n = await sanityWrite.fetch<number>(
    `count(*[_type == "contestBlock" && (
       (defined($email) && ownerEmailHash == $email) ||
       (defined($phone) && contactHash == $phone) ||
       (defined($login) && mtLogin == $login)
     )])`,
    {
      email: keys.emailHash || null,
      phone: keys.phoneHash || null,
      login: keys.mtLogin || null,
    }
  )
  return n > 0
}

/** This user's entry in this round, or null. Includes the code: it is theirs. */
export async function myEntry(email: string, contestId: string) {
  // A person who had an entry cancelled and registered again owns two
  // documents. The live one is the answer; the cancelled one is history.
  const entry = await sanityWrite.fetch<any>(
    `*[_type == "contestEntry" && contest._ref == $id && ownerEmailHash == $hash && status != "cancelled"]
      | order(_createdAt desc)[0]{
       _id, entryNo, displayName, mtLogin, mtServer, entryCodeEnc, status, lastSeen,
       profit, profitPct, equity
     }`,
    { id: contestId, hash: blindIndex(email, "contestOwner") }
  )
  // The code is unsealed only here, for the one person it belongs to.
  return entry ? { ...entry, entryCode: codeOf(entry) } : null
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
  /** Chosen animal mark, or empty to let the board derive one. */
  avatar?: string
  startBalance: number
  /** Read-only MT5 password, so the account can be checked before approval. */
  investor: string
  /** Caller's IP, kept only as a one-way index for spotting duplicates. */
  ip?: string
}

// ── Sealed storage ──────────────────────────────────────────────────────────
// This Sanity dataset is PUBLIC (see lib/pii.ts). An entry code in the clear
// would let anyone post results as that contestant, and an investor password
// in the clear would hand out read access to their account. Both are sealed
// with AES-GCM before they are written; the email is a blind index for
// lookups plus a sealed copy.
//
// What stays readable is only what the leaderboard shows anyway: display
// name, MT5 login, country, and the numbers.

export function codeOf(entry: { entryCodeEnc?: string }): string {
  if (!entry?.entryCodeEnc) return ""
  try { return decryptPII(entry.entryCodeEnc) } catch { return "" }
}

export function investorOf(entry: { investorEnc?: string }): string {
  if (!entry?.investorEnc) return ""
  try { return decryptPII(entry.investorEnc) } catch { return "" }
}

export type RegisterResult =
  | { ok: true; code: string; entryNo: number; earlyBird: boolean }
  | { ok: false; reason: "already-registered" | "login-taken" | "phone-taken" | "closed" | "full" | "blocked" }

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

  // Three uniqueness checks, because the first two are cheap to defeat: a new
  // Gmail is free and Exness hands out demo accounts without limit. A phone
  // number is the one thing in this list that costs something to obtain, so
  // it is the check that actually bites.
  const emailHash = blindIndex(email, "contestOwner")
  const phoneHash = blindIndex(input.contact, "contestPhone")
  const ipHash = input.ip ? blindIndex(input.ip, "contestIp") : ""

  // The block list is checked before anything else and spans every round:
  // being told "this number is already registered" would invite another
  // number, which is exactly what a blocked person would try next.
  if (await isBlocked({ emailHash, phoneHash, mtLogin })) {
    return { ok: false, reason: "blocked" }
  }

  // A cancelled entry is not in the round any more, so it must not stand in
  // the way of the same person registering again — that is the whole point of
  // cancelling rather than disqualifying. Disqualified entries DO still count:
  // the rule the owner set is that cheating costs the seat.
  const dupe = await sanityWrite.fetch<{ mine: number; login: number; phone: number }>(
    `{
      "mine":  count(*[_type == "contestEntry" && contest._ref == $id && status != "cancelled" && ownerEmailHash == $hash]),
      "login": count(*[_type == "contestEntry" && contest._ref == $id && status != "cancelled" && mtLogin == $login]),
      "phone": count(*[_type == "contestEntry" && contest._ref == $id && status != "cancelled" && contactHash == $phone])
    }`,
    { id: contestId, hash: emailHash, login: mtLogin, phone: phoneHash }
  )
  if (dupe.mine > 0) return { ok: false, reason: "already-registered" }
  if (dupe.login > 0) return { ok: false, reason: "login-taken" }
  if (dupe.phone > 0) return { ok: false, reason: "phone-taken" }

  // Seats are counted as entries that still hold one. A cancelled entry gave
  // its seat back, so it must not keep the round looking full.
  const taken = await liveEntryCount(contestId)
  if (contest.maxEntries && taken >= contest.maxEntries) return { ok: false, reason: "full" }

  // The number is the registration order and must never repeat, so it comes
  // from the highest one issued rather than from how many entries exist: a
  // cancelled #4 keeps its number and the next person is #16, not #15 again.
  const highest = await sanityWrite.fetch<number>(
    `math::max(*[_type == "contestEntry" && contest._ref == $id && defined(entryNo)].entryNo)`, { id: contestId }
  )
  const entryNo = (highest ?? 0) + 1
  const code = newEntryCode()

  await sanityWrite.create({
    _type: "contestEntry",
    contest: { _type: "reference", _ref: contestId },
    entryNo,
    ownerEmailHash: emailHash,
    ownerEmailEnc: encryptPII(email),
    displayName: input.displayName,
    contactEnc: encryptPII(input.contact),
    contactHash: phoneHash,
    ipHash: ipHash || undefined,
    country: input.country,
    avatar: input.avatar || undefined,
    mtLogin,
    mtServer: input.mtServer,
    startBalance: input.startBalance,
    entryCodeEnc: encryptPII(code),
    investorEnc: input.investor ? encryptPII(input.investor) : undefined,
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
  const rows = await sanityWrite.fetch<Array<{ displayName: string; mtLogin: string; contactEnc?: string }>>(
    `*[_type == "contestEntry" && contest._ref == $id] | order(_createdAt asc)[0...$n]{
       displayName, mtLogin, contactEnc
     }`,
    { id: contestId, n: howMany }
  )
  return rows.map(r => ({
    displayName: r.displayName,
    mtLogin: r.mtLogin,
    contact: r.contactEnc ? decryptPII(r.contactEnc) : "",
  }))
}

/**
 * The top three of a round, for the archive card.
 *
 * Reads the admin's verified winners when they exist and falls back to the
 * board's own order when they do not — a round that has just closed has a
 * result days before anyone has checked it, and showing nothing until then
 * makes the archive look empty at exactly the moment people look at it.
 */
export async function podiumOf(contest: Contest): Promise<Array<{
  place: number; displayName: string; mtLogin?: string; country?: string
  avatar?: string; profit?: number; verified: boolean
}>> {
  const verified = (contest.winners ?? [])
    .filter(w => w.entry)
    .sort((a, b) => (a.place ?? 9) - (b.place ?? 9))
    .slice(0, 3)
  if (verified.length) {
    return verified.map((w, i) => ({
      place: w.place ?? i + 1,
      displayName: w.entry?.displayName ?? "\u2014",
      mtLogin: w.entry?.mtLogin,
      country: w.entry?.country,
      avatar: w.entry?.avatar,
      profit: w.verifiedProfit ?? w.entry?.profit,
      verified: true,
    }))
  }
  const rows = await leaderboard(contest._id)
  return rows.slice(0, 3).map((r, i) => ({
    place: i + 1,
    displayName: r.displayName,
    mtLogin: r.mtLogin,
    country: r.country,
    avatar: r.avatar,
    profit: r.profit,
    verified: false,
  }))
}
