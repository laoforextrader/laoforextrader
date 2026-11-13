import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { load, markWatching, readSeries } from "@/lib/semi/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// What the dashboard polls. Also the signal that someone is watching: every
// call extends watchUntil, which the EA reads in its next reply and speeds up
// to a 3-second heartbeat. Stop looking and it slows down on its own.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign in first" }, { status: 401 })

  const account = new URL(req.url).searchParams.get("acc")?.trim()
  if (!account) return NextResponse.json({ error: "missing acc" }, { status: 400 })

  const entry = await load(account)
  if (!entry) return NextResponse.json({ error: "account not found" }, { status: 404 })
  if (entry.doc.ownerEmail !== email) {
    // Same answer as "not found" on purpose: never confirm that an account
    // number exists to someone who does not own it.
    return NextResponse.json({ error: "account not found" }, { status: 404 })
  }

  // Fire and forget — a failed watch ping must not fail the read.
  markWatching(account).catch(() => {})

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
    pendingCmd: entry.doc.cmd || null,
  })
}
