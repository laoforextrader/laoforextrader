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
       cmdId, cmd, cmdLot, cmdAt, cmdBy, ackRound, rounds, watchUntil
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

  e.state = state
  e.doc.lastSeen = new Date().toISOString()
  e.dirty = true

  if (newRounds.length) {
    const have = e.doc.rounds ?? []
    const known = new Set(have.map(r => r.id))
    const merged = have.concat(newRounds.filter(r => !known.has(r.id)))
    e.doc.rounds = merged.slice(-MAX_ROUNDS)
    e.doc.ackRound = Math.max(e.doc.ackRound ?? 0, ...newRounds.map(r => r.id))
  }

  const mustFlush = newRounds.length > 0 || Date.now() - e.lastFlush >= FLUSH_MS
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

/** EA confirmed it ran the command — clear the queue. */
export async function clearCommand(account: string, id: number): Promise<void> {
  const e = await load(account)
  if (!e || e.doc.cmdId !== id) return
  e.doc.cmd = ""
  await sanityWrite.patch(docId(account)).set({ cmd: "" }).commit({ visibility: "async" })
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

  await sanityWrite.createOrReplace({
    _id: id,
    _type: "semiAccount",
    account,
    ownerEmail: email,
    ownerName: name ?? doc?.ownerName ?? "",
    dashKey: key,
    state: doc?.state ?? "",
    lastSeen: doc?.lastSeen,
    ackRound: doc?.ackRound ?? 0,
    rounds: doc?.rounds ?? [],
  } as any)
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
