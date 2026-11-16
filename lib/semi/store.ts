import { createHash } from "crypto"
import { sanityWrite } from "@/lib/sanityWrite"
import { blindIndex, encryptPII, decryptPII } from "@/lib/pii"

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
  //  Deliberately awkward names. These two hold the pre-2026-11-16
  //  plaintext, and nothing outside keyOf()/emailOf() may read them: the
  //  names are what makes the compiler say so.
  legacyOwnerEmailPlain?: string
  legacyDashKeyPlain?: string
  ownerEmailHash?: string
  ownerEmailEnc?: string
  ownerName?: string
  dashKeyEnc?: string
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

// -- Key shape ---------------------------------------------------------------
// The EA generates the key WITH dashes (MakeWebKey writes XXXX-XXXX-XXXX-XXXX)
// and signs every heartbeat with that exact string. The owner retypes it off
// the panel and may well leave the dashes out, and storing that verbatim broke
// the account in both directions at once: the EA's signature never matched
// (401, panel reads "key mismatch") and re-entering the dashed key was refused
// by the exact comparison below (409), so the owner could not escape either way.
//
// Keys are therefore COMPARED without dashes and always STORED in the dashed
// form the EA actually signs with.
export const compactKey = (key: string) => String(key ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")
export const canonKey = (key: string) => compactKey(key).replace(/(.{4})(?=.)/g, "$1-")
export const sameKey = (a: string, b: string) =>
  compactKey(a).length > 0 && compactKey(a) === compactKey(b)

// ── Sealed storage ──────────────────────────────────────────────────────────
// This Sanity dataset is PUBLIC (see lib/pii.ts): a dashboard key written in
// the clear is readable by anyone who lifts the project id out of the page
// source, and with it they could impersonate that account's EA. Keys are
// sealed with AES-GCM; the owner's email is stored as a blind index for
// lookups plus a sealed copy to read back.
//
// Documents written before 2026-11-16 still hold plaintext. Every reader here
// is sealed-first with a fallback, so nothing breaks mid-migration.

/** The dashboard key for this account, however it happens to be stored. */
export function keyOf(doc: SemiDoc): string {
  if (doc.dashKeyEnc) {
    try { return decryptPII(doc.dashKeyEnc) } catch { /* fall back to legacy */ }
  }
  return doc.legacyDashKeyPlain ?? ""
}

/** The owner's email, however it happens to be stored. */
export function emailOf(doc: SemiDoc): string {
  if (doc.ownerEmailEnc) {
    try { return decryptPII(doc.ownerEmailEnc) } catch { /* fall back */ }
  }
  return doc.legacyOwnerEmailPlain ?? ""
}

/** The fields that store an owner's email safely, plaintext dropped. */
export function sealEmail(email: string) {
  return {
    ownerEmailHash: blindIndex(email, "semiOwner"),
    ownerEmailEnc: encryptPII(email),
    ownerEmail: null,
  }
}

/** SHA256(body + key) — the signature the EA sends in X-RM-Sign. */
export const signBody = (body: string, key: string) =>
  createHash("sha256").update(body + key, "utf8").digest("hex")

async function fetchDoc(account: string): Promise<SemiDoc | null> {
  return sanityWrite.fetch<SemiDoc | null>(
    `*[_id == $id][0]{
       _id, account, ownerEmailHash, ownerEmailEnc, ownerName, dashKeyEnc,
       "legacyOwnerEmailPlain": ownerEmail, "legacyDashKeyPlain": dashKey,
       state, lastSeen,
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

  const owner = doc ? emailOf(doc) : ""
  if (owner && owner !== email) {
    return { ok: false, reason: "already-linked" }
  }
  const storedKey = doc ? keyOf(doc) : ""
  if (storedKey && !sameKey(storedKey, key)) {
    return { ok: false, reason: "bad-key" }
  }

  // Stored in the EA's own dashed form no matter how it was typed, which also
  // upgrades an account that was linked with a bare key before this fix.
  const stored = canonKey(key)

  if (doc) {
    // Re-entering the key is now routine — it happens after every "Exit
    // dashboard" and when the 30-day cookie lapses. createOrReplace would
    // silently drop every field not listed here, taking the equity curve and
    // any queued command with it, so an existing account is patched instead.
    await sanityWrite
      .patch(id)
      .set({
        ...sealEmail(email),
        dashKeyEnc: encryptPII(stored),
        dashKey: null,
        ownerName: name ?? doc.ownerName ?? "",
      })
      .commit({ visibility: "async" })
  } else {
    await sanityWrite.createOrReplace({
      _id: id,
      _type: "semiAccount",
      account,
      ...sealEmail(email),
      ownerName: name ?? "",
      dashKeyEnc: encryptPII(stored),
      state: "",
      ackRound: 0,
      rounds: [],
    } as any)
  }
  mem.delete(account)
  return { ok: true }
}

/**
 * Write the key back sealed, and drop the plaintext copy.
 *
 * Called from the heartbeat path, so a failure here must never fail the beat:
 * the signature is already verified by the time we arrive, and the next
 * heartbeat tries again.
 */
async function sealKey(account: string, e: CacheEntry, key: string): Promise<void> {
  e.doc.dashKeyEnc = encryptPII(key)
  e.doc.legacyDashKeyPlain = undefined
  try {
    await sanityWrite.patch(docId(account))
      .set({ dashKeyEnc: e.doc.dashKeyEnc })
      .unset(["dashKey"])
      .commit({ visibility: "async" })
    console.log("[semi] " + account + ": dashboard key sealed")
  } catch (err) {
    console.error("[semi] sealing the dashboard key failed", err)
  }
}

/**
 * Check the EA heartbeat signature against the stored key, tolerating a key
 * that was stored in a different dash form, and repairing the document when
 * that is what happened.
 *
 * Accounts linked before the fix above hold a dashless key the EA can never
 * match, and their owners could not re-link (linkAccount refused the dashed
 * key). They heal themselves here, on the next heartbeat, with nobody having
 * to touch the data by hand. Only the dash form is forgiven: the key material
 * still has to be exactly right.
 */
export async function verifySignature(
  account: string, e: CacheEntry, raw: string, sign: string
): Promise<boolean> {
  const stored = keyOf(e.doc)
  if (!stored) return false
  if (signBody(raw, stored) === sign) {
    //  A document still holding the key in the clear is sealed on the first
    //  heartbeat that proves it, so there is never a window where the EA
    //  cannot authenticate.
    if (e.doc.legacyDashKeyPlain) await sealKey(account, e, stored)
    return true
  }

  for (const cand of [canonKey(stored), compactKey(stored)]) {
    if (!cand || cand === stored) continue
    if (signBody(raw, cand) !== sign) continue
    await sealKey(account, e, cand)
    return true
  }
  return false
}

/** Accounts this signed-in user may see. */
export async function accountsOf(
  email: string
): Promise<Array<{ account: string; lastSeen?: string; keyTail?: string }>> {
  // Matches either the blind index (new) or the plaintext (pre-migration).
  const rows = await sanityWrite.fetch<Array<{ account: string; lastSeen?: string; legacyDashKeyPlain?: string; dashKeyEnc?: string }>>(
    `*[_type == "semiAccount" && (ownerEmailHash == $hash || ownerEmail == $email)]{
       account, lastSeen, dashKeyEnc, "legacyDashKeyPlain": dashKey
     } | order(account asc)`,
    { hash: blindIndex(email, "semiOwner"), email }
  )
  //  The last four characters of the key, for the owner's own accounts only.
  //  Someone whose browser is not unlocked needs to tell which key goes with
  //  which account; four characters do that without being the key.
  return rows.map(r => {
    const key = keyOf(r as SemiDoc)
    return { account: r.account, lastSeen: r.lastSeen, keyTail: key ? key.slice(-4) : undefined }
  })
}
