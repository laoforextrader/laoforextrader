import { sanityWrite } from "@/lib/sanityWrite"
import { blindIndex } from "@/lib/pii"
import { codeOf, type Contest } from "@/lib/contest/store"
import { memo, forget } from "@/lib/memo"

// ─────────────────────────────────────────────────────────────────────────────
// What the contest EA sends, and what the server does with it.
//
// The EA posts once a minute. That is slow enough to write straight through to
// Sanity without the throttling the Semi dashboard needs, and the leaderboard
// reads are cached at the route, so there is no in-process cache here to go
// stale differently on each lambda.
//
// Every number that decides the ranking is derived here, not trusted from the
// payload's own arithmetic: the EA reports balance, equity and the deposit
// history it can see, and the server computes the profit from those. An EA
// that lies about `profit` therefore changes nothing; one that lies about
// balance and equity is caught by the investor-password check on the top 5.
// ─────────────────────────────────────────────────────────────────────────────

export interface EaPayload {
  ts?: number
  acct?: {
    login?: number; server?: string; company?: string; currency?: string
    leverage?: number; symbol?: string; demo?: boolean; algoOn?: boolean
    /** Account holder name as the broker has it (KYC), for duplicate hunting. */
    name?: string
  }
  money?: { balance?: number; equity?: number; margin?: number; free?: number }
  contest?: {
    startBalance?: number      // balance before the first trade of the account
    deposits?: number          // added after the round started
    withdrawals?: number
    peakEquity?: number
    maxDDPct?: number          // measured tick by tick by the EA
    trades?: number            // closed deals
    lots?: number              // total volume traded
    /**
     * Every balance deal except the account's first funding, as
     * [unix seconds, amount] — negative for a withdrawal.
     *
     * The EA sends them all and judges none of them: only the server
     * knows when the round starts, and that is what decides whether a
     * top-up is part of the starting capital or a deposit that has to
     * come back out of the score.
     */
    balOps?: Array<[number, number]>
  }
  positions?: { count?: number; lots?: number; floating?: number }
  /**
   * The EA's own dashboard key, sent only on this channel.
   *
   * It is generated on the machine the EA runs on and never leaves it,
   * which is fine for a customer at their own PC and useless for a
   * contestant whose VPS we built for them. Sent here, the website links
   * the account itself and the key can be messaged to its owner.
   */
  dash?: { key?: string }
}

export interface EaReply {
  ok: true
  rank: number
  entries: number
  profit: number
  status: string
  endsAt: string
  serverTime: number
}

/** A flag the admin should look at. Same shape as the schema's array. */
type Flag = { _key: string; _type: "contestFlag"; at: string; kind: string; note: string }

const flag = (kind: string, note: string): Flag => ({
  _key: `${kind}-${Date.now().toString(36)}`,
  _type: "contestFlag",
  at: new Date().toISOString(),
  kind,
  note,
})

const SERIES_MS = 5 * 60_000      // one equity point every five minutes
const MAX_SERIES = 3_500          // ten trading days at that rate, with room over

/**
 * The number the board is sorted by.
 *
 * Equity, not balance: a contestant holding a basket 40 levels deep has not
 * made that money yet, and this system's whole character is floating loss.
 * Deposits added after the start are subtracted — on a demo account they are
 * free and unlimited, so without this the contest would measure who clicked
 * "top up" most often.
 */
export function contestProfit(p: EaPayload, startBalance: number): number {
  const equity = p.money?.equity ?? 0
  const deposits = p.contest?.deposits ?? 0
  const withdrawals = p.contest?.withdrawals ?? 0
  return equity - startBalance - deposits + withdrawals
}

/**
 * What the account was funded with before the round, and what was added or
 * taken out after it began.
 *
 * `startBalance` from the EA is the first funding deal of the account's
 * life, which is not the same thing as its starting capital: a demo opened
 * with 10,000 and topped up to 100,000 before the start reports 10,000. Its
 * capital is the net of everything paid in before the gun, so that is what
 * is compared against the round and shown on the approval screen.
 */
export function capitalOf(p: EaPayload, contest: Contest) {
  const startsAt = contest.startAt ? Date.parse(contest.startAt) : NaN
  //  No start date yet means the round has not begun, so nothing can be a
  //  mid-round deposit.
  const started = (whenSec: number) =>
    Number.isFinite(startsAt) && whenSec * 1000 >= startsAt

  let funded = p.contest?.startBalance ?? 0
  let deposits = 0
  let withdrawals = 0

  for (const op of p.contest?.balOps ?? []) {
    if (!Array.isArray(op) || op.length < 2) continue
    const when = Number(op[0])
    const amt = Number(op[1])
    if (!Number.isFinite(when) || !Number.isFinite(amt) || amt === 0) continue
    if (!started(when)) {
      //  Before the gun: part of the capital, whichever way it went. A demo
      //  that was emptied and refilled nets out correctly here.
      funded += amt
    } else if (amt > 0) {
      deposits += amt
    } else {
      withdrawals += -amt
    }
  }
  return { funded, deposits, withdrawals }
}

export interface SaveResult {
  profit: number
  status: string
  newFlags: Flag[]
  /** True only on the beat that wrote `firstSeen` — the owner is told once. */
  firstBeat: boolean
}

/**
 * Apply one heartbeat to an entry document.
 *
 * Returns what the reply needs. Writes are a patch, never createOrReplace:
 * the entry holds fields this route never sees (owner email, contact, the
 * entry code itself) and replacing the document would drop them — the same
 * mistake that once cost the Semi dashboard its equity curve.
 */
/**
 * Is this account name the broker's default rather than a person?
 *
 * Checked against what Exness and MT5 put there on their own: the account
 * type, the broker name, the word demo. Names are compared with spaces and
 * punctuation removed, so "Standard Account" and "standard-account" are the
 * same string.
 */
const GENERIC_HOLDER = new Set([
  "standard", "standardaccount", "standardcent", "standardcentaccount",
  "pro", "proaccount", "rawspread", "rawspreadaccount", "zero", "zeroaccount",
  "cent", "centaccount", "demo", "demoaccount", "demoaccountstandard",
  "exness", "exnesstechnologiesltd", "exnesstrial", "mt5", "metatrader5",
  "test", "testaccount", "trial", "trialaccount", "forex", "trading",
  "contest", "contestaccount", "standarddemo", "demostandard",
])

export function isGenericHolder(name: string): boolean {
  const k = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  if (k.length < 3) return true
  return GENERIC_HOLDER.has(k)
}

export async function applyHeartbeat(
  entry: any, contest: Contest, p: EaPayload
): Promise<SaveResult> {
  const now = new Date()
  const expected = contest.startBalance ?? 0
  //  `reported` is only the first funding deal; what the round cares
  //  about is everything paid in before it starts.
  const { funded, deposits, withdrawals } = capitalOf(p, contest)
  const reported = funded
  const equity = p.money?.equity ?? 0
  const balance = p.money?.balance ?? 0

  // The start balance that counts is the contest's own, so a demo funded with
  // the wrong amount cannot quietly compete on a different scale.
  const profit = contestProfit({ ...p, contest: { ...p.contest, deposits, withdrawals } }, expected)

  const flags: Flag[] = []
  const had = (kind: string) => (entry.flags ?? []).some((f: any) => f?.kind === kind)

  if (expected > 0 && reported > 0 && Math.abs(reported - expected) / expected > 0.01 && !had("start-balance")) {
    flags.push(flag("start-balance",
      `EA reports a starting balance of ${reported.toFixed(2)}, the round is ${expected.toFixed(2)}`))
  }
  if (p.acct?.demo === false && !had("live-account")) {
    flags.push(flag("live-account", "this is a LIVE account, the contest is demo only"))
  }
  if (deposits > 0 && !had("deposit")) {
    flags.push(flag("deposit",
      `${deposits.toFixed(2)} deposited after the start — profit is counted without it`))
  }

  // Traded before the round began.
  //
  // The contest EA locks itself until the start time, so a trade before it
  // came either from a hand or from another EA — both of which the rules
  // forfeit the entry for. It is raised as a flag and not acted on: the
  // entry may have been registered on an account that had been used for
  // something else before, and only the owner can tell those apart by
  // looking at the history with the investor password.
  const startsAt = contest.startAt ? Date.parse(contest.startAt) : NaN
  const beforeStart = Number.isFinite(startsAt) && now.getTime() < startsAt
  const touched = (p.contest?.trades ?? 0) > 0 || (p.positions?.count ?? 0) > 0
  if (beforeStart && touched && !had("early-trade")) {
    flags.push(flag("early-trade",
      `traded before the start — ${p.contest?.trades ?? 0} closed, ${p.positions?.count ?? 0} open, ` +
      `round starts ${new Date(startsAt).toISOString()}`))
  }

  let status: string = entry.status === "disqualified" ? "disqualified" : "active"
  // An entry the admin has not approved yet still reports; it simply stays
  // out of the running until a human has looked at the account.
  if (entry.status === "pending") status = "pending"
  if (expected > 0 && equity <= expected * 0.1) {
    status = "blown"
    if (!had("blown")) flags.push(flag("blown", `equity fell to ${equity.toFixed(2)}`))
  }
  if (flags.length && status === "active") status = "flagged"

  //  How often this entry's numbers are worth storing.
  //
  //  Before the round starts nobody is racing: the only thing anyone needs
  //  from a beat is "this EA is alive and the account looks right", and that
  //  does not change in ten minutes. While the round is live the board
  //  moves, so five minutes — which is also how often the equity curve
  //  takes a point, so nothing is lost by writing no faster than that.
  //
  //  Anything that is news gets written immediately regardless: the first
  //  beat, any flag, a change of status. Those are what the owner watches
  //  for, and they must never wait behind a timer.
  const live = contest.status === "live"
  const WRITE_EVERY_MS = live ? 5 * 60_000 : 10 * 60_000
  const since = entry.lastSeen ? now.getTime() - Date.parse(entry.lastSeen) : Infinity
  const due = !(since < WRITE_EVERY_MS)

  // Equity curve, sampled server-side: the EA already sends both numbers on
  // every beat and keeps no history of its own.
  let series: Array<[number, number, number]> = []
  try {
    const parsed = entry.series ? JSON.parse(entry.series) : []
    if (Array.isArray(parsed)) series = parsed
  } catch { series = [] }
  const t = Math.floor(now.getTime() / 1000)
  const last = series.length ? series[series.length - 1] : null
  //  Only while the round is running. A curve of the days before the start
  //  is a flat line nobody opens, and sampling it would force a write.
  let sampled = false
  if (live && (!last || t - last[0] >= SERIES_MS / 1000)) {
    series.push([t, +equity.toFixed(2), +balance.toFixed(2)])
    series = series.slice(-MAX_SERIES)
    sampled = true
  }

  const set: Record<string, unknown> = {
    equity: +equity.toFixed(2),
    balance: +balance.toFixed(2),
    profit: +profit.toFixed(2),
    profitPct: expected > 0 ? +((profit / expected) * 100).toFixed(2) : 0,
    maxDDPct: +(p.contest?.maxDDPct ?? 0).toFixed(2),
    trades: p.contest?.trades ?? 0,
    lots: +(p.contest?.lots ?? 0).toFixed(2),
    openPositions: p.positions?.count ?? 0,
    deposits: +deposits.toFixed(2),
    withdrawals: +withdrawals.toFixed(2),
    lastSeen: now.toISOString(),
    series: JSON.stringify(series),
    status,
  }
  //  Refreshed on every beat, not frozen on the first one. An entry that
  //  reported before its account was topped up would otherwise carry the
  //  old number to the grave, and the approval screen would keep
  //  refusing an account that has been correct for days.
  set.startBalance = +(reported || expected).toFixed(2)
  const firstBeat = !entry.firstSeen
  if (firstBeat) set.firstSeen = now.toISOString()
  // Refreshed on every beat, not just the first: these are what the approval
  // screen checks, and a contestant who switches chart or account type after
  // being approved should show up as changed.
  if (p.acct?.server) set.mtServer = p.acct.server
  if (p.acct?.symbol) set.symbol = p.acct.symbol
  if (typeof p.acct?.demo === "boolean") set.isDemo = p.acct.demo
  if (typeof p.acct?.leverage === "number") set.leverage = p.acct.leverage
  // The broker knows who owns the account; we keep only a one-way index of
  // that name, which is enough to tell two entries apart without storing
  // anyone's identity.
  // Only a name that identifies somebody is worth indexing. Exness names a
  // demo account after its type unless the owner renames it, so "Standard"
  // arrives from nearly every entry — hashing that would raise the duplicate
  // flag on everyone at once, which is the same as it raising it on nobody.
  if (p.acct?.name && !isGenericHolder(p.acct.name)) {
    set.holderHash = blindIndex(p.acct.name, "contestHolder")
  }

  //  Clear a start-balance flag the account has since answered. The card
  //  would otherwise show a green tick and a red flag about the same number,
  //  and the owner has to decide which one to believe. Only done on a beat
  //  that raises nothing new, so a set and an append never meet in one patch.
  const staleBalance = (entry.flags ?? []).some((f: any) => f?.kind === "start-balance")
  if (!flags.length && staleBalance && expected > 0 && reported > 0 &&
      Math.abs(reported - expected) / expected <= 0.01) {
    set.flags = (entry.flags ?? []).filter((f: any) => f?.kind !== "start-balance")
  }

  //  The whole point of the timer: a beat that says nothing new costs no
  //  write at all. The EA sends its current numbers every time, so a
  //  skipped write is never a lost one — the next write carries fresher
  //  figures than the one we skipped would have.
  const newsworthy = firstBeat || flags.length > 0 || status !== entry.status || sampled
  if (!newsworthy && !due) {
    return { profit, status, newFlags: flags, firstBeat }
  }

  const patch = sanityWrite.patch(entry._id).set(set)
  if (flags.length) patch.setIfMissing({ flags: [] }).append("flags", flags)
  await patch.commit({ visibility: "async" })

  //  Keep the cached entry in step with what was just stored, so the next
  //  beat reads our own numbers rather than a copy from before the write.
  Object.assign(entry, set, flags.length ? { flags: [...(entry.flags ?? []), ...flags] } : {})
  //  The board and the rank list now hold figures older than this entry's.
  forget(`contest:board:${contest._id}`)
  forget(`contest:ranks:${contest._id}`)

  return { profit, status, newFlags: flags, firstBeat }
}

/** Where this entry stands right now, for the EA to show on its panel. */
export async function rankOf(contestId: string, entryId: string, profit: number) {
  //  Everyone's profit, to place this one. Cached for 20 seconds: with
  //  twenty EAs beating once a minute this query ran twenty times a
  //  minute to answer a number that moves in steps of minutes.
  const rows = await memo(`contest:ranks:${contestId}`, 20_000, () =>
    sanityWrite.fetch<Array<{ _id: string; profit?: number }>>(
      `*[_type == "contestEntry" && contest._ref == $id && status != "disqualified"]{ _id, profit }`,
      { id: contestId }
    ))
  const better = rows.filter(r => r._id !== entryId && (r.profit ?? -Infinity) > profit).length
  return { rank: better + 1, entries: rows.length }
}

/** The entry for one MT5 login in one round, with the fields this route needs. */
/**
 * The entry for one MT5 login, kept for a minute.
 *
 * applyHeartbeat updates this same object in place when it writes, so a
 * cached copy never falls behind what we ourselves last stored. What it
 * can be late on is a change made by the admin screen — a disqualify
 * takes up to a minute to reach the EA, which is a minute of a round
 * that lasts ten days.
 */
export async function entryByLogin(contestId: string, login: string) {
  return memo(`contest:entry:${contestId}:${login}`, 60_000,
              () => entryByLoginFresh(contestId, login))
}

async function entryByLoginFresh(contestId: string, login: string) {
  const entry = await sanityWrite.fetch<any>(
    `*[_type == "contestEntry" && contest._ref == $id && mtLogin == $login][0]{
       _id, entryCodeEnc, status, firstSeen, flags, series, startBalance,
       displayName, ownerEmailEnc, lastSeen
     }`,
    { id: contestId, login }
  )
  // Unsealed in memory for the signature check only; it is never written back
  // or returned to the caller's response.
  return entry ? { ...entry, entryCode: codeOf(entry) } : null
}
