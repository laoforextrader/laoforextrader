import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { load, markWatching, readSeries, watchedCommand, pendingCommand, emailOf } from "@/lib/semi/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

//  When each account's watchUntil was last written, per instance.
const watchPinged: Map<string, number> =
  (globalThis as any).__semiWatchPinged ?? ((globalThis as any).__semiWatchPinged = new Map())

// What the dashboard polls. Also the signal that someone is watching: every
// call extends watchUntil, which the EA reads in its next reply and speeds up
// to a 3-second heartbeat. Stop looking and it slows down on its own.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign in first" }, { status: 401 })

  const url = new URL(req.url)
  const account = url.searchParams.get("acc")?.trim()
  const waiting = url.searchParams.get("w") === "1"
  if (!account) return NextResponse.json({ error: "missing acc" }, { status: 400 })

  const entry = await load(account)
  if (!entry) return NextResponse.json({ error: "account not found" }, { status: 404 })
  //  emailOf(), because a sealed account has no plaintext ownerEmail.
  if (emailOf(entry.doc) !== email) {
    // Same answer as "not found" on purpose: never confirm that an account
    // number exists to someone who does not own it.
    return NextResponse.json({ error: "account not found" }, { status: 404 })
  }

  //  The watch ping is a write. Polling every 3 seconds wrote it twenty
  //  times a minute to keep a flag alive for twenty seconds, so it is
  //  refreshed on a timer instead. Fire and forget: a failed ping must
  //  not fail the read.
  const now = Date.now()
  if ((watchPinged.get(account) ?? 0) < now - 12_000) {
    watchPinged.set(account, now)
    markWatching(account).catch(() => {})
  }

  const last = entry.doc.lastSeen ? Date.parse(entry.doc.lastSeen) : 0
  const ageSec = last ? Math.round((Date.now() - last) / 1000) : null

  return NextResponse.json({
    account,
    owner: entry.doc.ownerName ?? null,
    online: ageSec !== null && ageSec < 90,   // EA's slowest beat is 30s
    ageSec,
    state: entry.state ?? null,
    rounds: (entry.doc.rounds ?? []).slice(-50).reverse(),
    series: readSeries(entry),
    //  Re-reading the command queue from Sanity is only worth a request
    //  while the browser is actually waiting for one to be picked up.
    //  The page says so with ?w=1; otherwise the cached view answers.
    pendingCmd: waiting
      ? await watchedCommand(account, entry)
      : pendingCommand(entry)?.cmd ?? null,
  })
}
