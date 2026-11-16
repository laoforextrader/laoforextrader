import { sanityWrite } from "@/lib/sanityWrite"
import { codeOf, type Contest } from "@/lib/contest/store"

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
  acct?: { login?: number; server?: string; company?: string; currency?: string; leverage?: number; symbol?: string }
  money?: { balance?: number; equity?: number; margin?: number; free?: number }
  contest?: {
    startBalance?: number      // balance before the first trade of the account
    deposits?: number          // added after the round started
    withdrawals?: number
    peakEquity?: number
    maxDDPct?: number          // measured tick by tick by the EA
    trades?: number            // closed deals
    lots?: number              // total volume traded
  }
  positions?: { count?: number; lots?: number; floating?: number }
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

export interface SaveResult {
  profit: number
  status: string
  newFlags: Flag[]
}

/**
 * Apply one heartbeat to an entry document.
 *
 * Returns what the reply needs. Writes are a patch, never createOrReplace:
 * the entry holds fields this route never sees (owner email, contact, the
 * entry code itself) and replacing the document would drop them — the same
 * mistake that once cost the Semi dashboard its equity curve.
 */
export async function applyHeartbeat(
  entry: any, contest: Contest, p: EaPayload
): Promise<SaveResult> {
  const now = new Date()
  const expected = contest.startBalance ?? 0
  const reported = p.contest?.startBalance ?? 0
  const equity = p.money?.equity ?? 0
  const balance = p.money?.balance ?? 0

  // The start balance that counts is the contest's own, so a demo funded with
  // the wrong amount cannot quietly compete on a different scale.
  const profit = contestProfit(p, expected)

  const flags: Flag[] = []
  const had = (kind: string) => (entry.flags ?? []).some((f: any) => f?.kind === kind)

  if (expected > 0 && reported > 0 && Math.abs(reported - expected) / expected > 0.01 && !had("start-balance")) {
    flags.push(flag("start-balance",
      `EA reports a starting balance of ${reported.toFixed(2)}, the round is ${expected.toFixed(2)}`))
  }
  if ((p.contest?.deposits ?? 0) > 0 && !had("deposit")) {
    flags.push(flag("deposit",
      `${(p.contest?.deposits ?? 0).toFixed(2)} deposited after the start — profit is counted without it`))
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

  // Equity curve, sampled server-side: the EA already sends both numbers on
  // every beat and keeps no history of its own.
  let series: Array<[number, number, number]> = []
  try {
    const parsed = entry.series ? JSON.parse(entry.series) : []
    if (Array.isArray(parsed)) series = parsed
  } catch { series = [] }
  const t = Math.floor(now.getTime() / 1000)
  const last = series.length ? series[series.length - 1] : null
  if (!last || t - last[0] >= SERIES_MS / 1000) {
    series.push([t, +equity.toFixed(2), +balance.toFixed(2)])
    series = series.slice(-MAX_SERIES)
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
    deposits: +(p.contest?.deposits ?? 0).toFixed(2),
    withdrawals: +(p.contest?.withdrawals ?? 0).toFixed(2),
    lastSeen: now.toISOString(),
    series: JSON.stringify(series),
    status,
  }
  if (!entry.firstSeen) {
    set.firstSeen = now.toISOString()
    set.startBalance = reported || expected
    if (p.acct?.server) set.mtServer = p.acct.server
  }

  const patch = sanityWrite.patch(entry._id).set(set)
  if (flags.length) patch.setIfMissing({ flags: [] }).append("flags", flags)
  await patch.commit({ visibility: "async" })

  return { profit, status, newFlags: flags }
}

/** Where this entry stands right now, for the EA to show on its panel. */
export async function rankOf(contestId: string, entryId: string, profit: number) {
  const rows = await sanityWrite.fetch<Array<{ _id: string; profit?: number }>>(
    `*[_type == "contestEntry" && contest._ref == $id && status != "disqualified"]{ _id, profit }`,
    { id: contestId }
  )
  const better = rows.filter(r => r._id !== entryId && (r.profit ?? -Infinity) > profit).length
  return { rank: better + 1, entries: rows.length }
}

/** The entry for one MT5 login in one round, with the fields this route needs. */
export async function entryByLogin(contestId: string, login: string) {
  const entry = await sanityWrite.fetch<any>(
    `*[_type == "contestEntry" && contest._ref == $id && mtLogin == $login][0]{
       _id, entryCodeEnc, status, firstSeen, flags, series, startBalance
     }`,
    { id: contestId, login }
  )
  // Unsealed in memory for the signature check only; it is never written back
  // or returned to the caller's response.
  return entry ? { ...entry, entryCode: codeOf(entry) } : null
}
