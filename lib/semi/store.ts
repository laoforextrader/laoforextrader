import { createHash } from "crypto"
import { sanityWrite } from "@/lib/sanityWrite"

// ─────────────────────────────────────────────────────────────────────────────
// Storage for the Semi EA dashboard.
//
// Two different write rates share one document, which is the whole reason this
// file exists:
//
//   • the EA pushes its state every 3s while someone is watching the dashboard,
//   • Sanity is a content store, not a telemetry sink.
//
// So the live snapshot is kept in a module-level cache and only *flushed* to
// Sanity every FLUSH_MS — or immediately when something that must not be lost
// arrives (closed rounds, a mode change, the guard firing). Reads prefer the
// cache and fall back to the document, so a lambda that has never seen this
// account still answers correctly.
//
// The cache is per-instance and deliberately best-effort. Nothing depends on
// it: losing it costs at most FLUSH_MS of freshness, never a command and never
// a closed round.
// ─────────────────────────────────────────────────────────────────────────────

const FLUSH_MS = 15_000          // throttle for the live snapshot
const WATCH_MS = 20_000          // how long one dashboard poll counts as "watching"
const MAX_ROUNDS = 200           // closed rounds kept per account
const CMD_TTL_MS = 60_000        // a queued command older than this is dropped

// Equity/balance curve. The EA already sends both numbers on every heartbeat,
// so the server samples them here instead of asking the EA for history it does
// not keep. One sample every SERIES_MS, capped at MAX_SERIES points — that is
// ~14 hours of curve in about 13 KB of JSON, small enough to live in the same
// document as everything else.
const SERIES_MS = 120_000
const MAX_SERIES = 420

/** One point of the equity curve: [unix seconds, equity, balance]. */
export type SemiSample = [number, number, number]

export interface SemiRound {
  id: number; side: string; opened: number; closed: number
  depth: number; lots: number; pl: number; by: string
}

export interface SemiDoc {
  _id: string
  account: string
  ownerEmail?: string
  ownerName?: string
  dashKey?: string
  state?: string
  lastSeen?: string
  cmdId?: number
  cmd?: string
  cmdLot?: number
  cmdAt?: string
  cmdBy?: string
  ackRound?: number
  rounds?: SemiRound[]
  series?: string          // JSON of SemiSample[] — see SERIES_MS above
  watchUntil?: string
}

interface CacheEntry {
  doc: SemiDoc
  state: any           // parsed live state from the EA
  lastFlush: number
  dirty: boolean
}

// `globalThis` so the cache survives hot reloads in dev and module re-eval.
const mem: Map<string, CacheEntry> =
  (globalThis as any).__semiCache ?? ((globalThis as any).__semiCache = new Map())

export const docId = (account: string) => `semi-${account}`
export const hashKey = (key: string) =>
  createHash("sha256").update(key.trim().toUpperCase()).digest("hex")

/** SHA256(body + key) — the signature the EA sends in X-RM-Sign. */
export const signBody = (body: string, key: string) =>
  createHash("sha256").update(body + key, "utf8").digest("hex")

async function fetchDoc(account: string): Promise<SemiDoc | null> {
  return sanityWrite.fetch<SemiDoc | null>(
    `*[_id == $id][0]{
       _id, account, ownerEmail, ownerName, dashKey, state, lastSeen,
       cmdId, cmd, cmdLot, cmdAt, cmdBy, ackRound, rounds, series, watchUntil
     }`,
    { id: docId(account) }
  )
}

/** Doc + live state, preferring the in-process cache. */
export async function load(account: string): Promise<CacheEntry | null> {
  const hit = mem.get(account)
  if (hit) return hit
  const doc = await fetchDoc(account)
  if (!doc) return null
  let state: any = null
  try { state = doc.state ? JSON.parse(doc.state) : null } catch { state = null }
  const entry: CacheEntry = { doc, state, lastFlush: Date.now(), dirty: false }
  mem.set(account, entry)
  return entry
}

/** True while a dashboard has polled recently — the EA speeds up to 3s. */
export function isWatched(e: CacheEntry): boolean {
  const until = e.doc.watchUntil ? Date.parse(e.doc.watchUntil) : 0
  return until > Date.now()
}

export async function markWatching(account: string): Promise<void> {
  const e = await load(account)
  if (!e) return
  const until = new Date(Date.now() + WATCH_MS).toISOString()
  e.doc.watchUntil = until
  // Written straight through: the EA may be polling a different instance and
  // this is the only way the signal reaches it.
  await sanityWrite.patch(docId(account)).set({ watchUntil: until }).commit({ visibility: "async" })
}

/**
 * Store one EA heartbeat. Returns the pending command (if any) for the reply.
 * `force` skips the throttle — used when rounds arrive or the state changes in
 * a way the dashboard must not miss.
 */
export async function saveState(
  account: string,
  state: any,
  newRounds: SemiRound[]
): Promise<CacheEntry | null> {
  const e = await load(account)
  if (!e) return null

  //  Taken before the snapshot is replaced: a change in mode or in either
  //  side's state has to reach Sanity now, not at the next 15-second flush.
  //  Other lambda instances read the document when their own cache is older,
  //  and a dashboard that polls one of those would otherwise be shown the
  //  previous mode — which looks exactly like the panel flipping back.
  const sig = (v: any) =>
    String(v?.state?.mode ?? "") + "|" +
    (Array.isArray(v?.sides) ? v.sides.map((d: any) => `${d?.side}:${d?.state}`).join(",") : "")
  const before = sig(e.state)

  e.state = state
  e.doc.lastSeen = new Date().toISOString()
  e.dirty = true

  // Sample the curve. Equity without balance is half the story — the gap
  // between the two lines IS the floating P/L, which is what the owner is
  // looking for when they ask "how is it going".
  const eq = state?.money?.equity
  const bal = state?.money?.balance
  if (typeof eq === "number" && typeof bal === "number") {
    const series = readSeries(e)
    const now = Math.floor(Date.now() / 1000)
    const last = series.length ? series[series.length - 1] : null
    if (!last || now - last[0] >= SERIES_MS / 1000) {
      series.push([now, +eq.toFixed(2), +bal.toFixed(2)])
      e.doc.series = JSON.stringify(series.slice(-MAX_SERIES))
    }
  }

  if (newRounds.length) {
    const have = e.doc.rounds ?? []
    const known = new Set(have.map(r => r.id))
    const merged = have.concat(newRounds.filter(r => !known.has(r.id)))
    e.doc.rounds = merged.slice(-MAX_ROUNDS)
    e.doc.ackRound = Math.max(e.doc.ackRound ?? 0, ...newRounds.map(r => r.id))
  }

  const mustFlush = newRounds.length > 0 || before !== sig(state)
                 || Date.now() - e.lastFlush >= FLUSH_MS
  if (mustFlush) await flush(account, e)
  return e
}

async function flush(account: string, e: CacheEntry): Promise<void> {
  e.lastFlush = Date.now()
  e.dirty = false
  const s = e.state ?? {}
  try {
    await sanityWrite
      .patch(docId(account))
      .set({
        state: JSON.stringify(s),
        lastSeen: e.doc.lastSeen,
        symbol: s?.acct?.symbol ?? null,
        mode: s?.state?.mode ?? null,
        equity: typeof s?.money?.equity === "number" ? s.money.equity : null,
        ackRound: e.doc.ackRound ?? 0,
        series: e.doc.series ?? null,
        rounds: (e.doc.rounds ?? []).map((r, i) => ({ _key: `r${r.id ?? i}`, _type: "semiRound", ...r })),
      })
      .commit({ visibility: "async" })
  } catch (err) {
    // A Sanity hiccup must never break the EA's heartbeat: the cache still
    // holds the newest state and the next flush will carry it.
    console.error("[semi] flush failed", err)
    e.dirty = true
  }
}

/** The equity curve stored on this account, oldest first. Never throws. */
export function readSeries(e: CacheEntry): SemiSample[] {
  try {
    const v = e.doc.series ? JSON.parse(e.doc.series) : []
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** The command waiting for the EA, or null. Expired commands are dropped. */
export function pendingCommand(e: CacheEntry): { id: number; cmd: string; lot: number } | null {
  if (!e.doc.cmd || !e.doc.cmdId) return null
  const at = e.doc.cmdAt ? Date.parse(e.doc.cmdAt) : 0
  if (at && Date.now() - at > CMD_TTL_MS) return null
  return { id: e.doc.cmdId, cmd: e.doc.cmd, lot: e.doc.cmdLot ?? 0 }
}

/** Queue a command for the EA. Overwrites any command still waiting. */
export async function queueCommand(
  account: string, cmd: string, lot: number, by: string
): Promise<number> {
  const e = await load(account)
  if (!e) throw new Error("account not linked")
  const id = Math.floor(Date.now() / 1000)
  const at = new Date().toISOString()
  Object.assign(e.doc, { cmdId: id, cmd, cmdLot: lot, cmdAt: at, cmdBy: by })
  await sanityWrite
    .patch(docId(account))
    .set({ cmdId: id, cmd, cmdLot: lot, cmdAt: at, cmdBy: by })
    .commit({ visibility: "async" })
  return id
}

/**
 * Re-read the command fields from Sanity into this instance's cache.
 *
 * The cache cannot be trusted for these four fields, and only for these four.
 * Everything else in the document is written by whoever holds the cache; the
 * command is the one thing written by a *different* lambda — the browser that
 * queued it is almost never the instance the EA's next heartbeat lands on, and
 * `load()` returns a cached entry without ever re-reading. A command queued on
 * instance A was therefore invisible to the EA whenever its push went to
 * instance B, and the dashboard polling a third instance would keep showing it
 * as pending forever.
 */
async function syncCommand(account: string, e: CacheEntry): Promise<void> {
  try {
    const fresh = await sanityWrite.fetch<Partial<SemiDoc> | null>(
      `*[_id == $id][0]{ cmdId, cmd, cmdLot, cmdAt }`,
      { id: docId(account) }
    )
    if (fresh) Object.assign(e.doc, fresh)
  } catch {
    // A read hiccup must not stop the heartbeat; the cached copy still answers.
  }
}

/**
 * The command for the EA, taken out of the queue in the same step.
 *
 * Handing it over IS the acknowledgement. The EA applies it on the tick it
 * arrives, and leaving it queued is what made the dashboard spin forever —
 * worse, an EA restarted inside the 60s TTL would have re-run it, because the
 * EA only remembers the last command id in memory.
 */
export async function takeCommand(
  account: string, e: CacheEntry
): Promise<{ id: number; cmd: string; lot: number } | null> {
  await syncCommand(account, e)
  const cmd = pendingCommand(e)
  if (!cmd) return null
  e.doc.cmd = ""
  // sync, not async: the dashboard's very next poll reads this field to decide
  // the command has landed, and the EA must not be handed it twice.
  await sanityWrite.patch(docId(account)).set({ cmd: "" }).commit({ visibility: "sync" })
  return cmd
}

/** What the dashboard is still waiting on, expiry included. */
export async function watchedCommand(account: string, e: CacheEntry): Promise<string | null> {
  await syncCommand(account, e)
  return pendingCommand(e)?.cmd ?? null
}

/** Link an account to a signed-in owner. Returns false if someone else owns it. */
export async function linkAccount(
  account: string, key: string, email: string, name?: string
): Promise<{ ok: boolean; reason?: string }> {
  const id = docId(account)
  const doc = await fetchDoc(account)

  if (doc?.ownerEmail && doc.ownerEmail !== email) {
    return { ok: false, reason: "already-linked" }
  }
  if (doc?.dashKey && doc.dashKey !== key) {
    return { ok: false, reason: "bad-key" }
  }

  if (doc) {
    // Re-entering the key is now routine — it happens after every "Exit
    // dashboard" and when the 30-day cookie lapses. createOrReplace would
    // silently drop every field not listed here, taking the equity curve and
    // any queued command with it, so an existing account is patched instead.
    await sanityWrite
      .patch(id)
      .set({ ownerEmail: email, dashKey: key, ownerName: name ?? doc.ownerName ?? "" })
      .commit({ visibility: "async" })
  } else {
    await sanityWrite.createOrReplace({
      _id: id,
      _type: "semiAccount",
      account,
      ownerEmail: email,
      ownerName: name ?? "",
      dashKey: key,
      state: "",
      ackRound: 0,
      rounds: [],
    } as any)
  }
  mem.delete(account)
  return { ok: true }
}

/** Accounts this signed-in user may see. */
export async function accountsOf(email: string): Promise<Array<{ account: string; lastSeen?: string }>> {
  return sanityWrite.fetch(
    `*[_type == "semiAccount" && ownerEmail == $email]{ account, lastSeen } | order(account asc)`,
    { email }
  )
}
