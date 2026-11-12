import { NextResponse } from "next/server"
import { load, saveState, pendingCommand, isWatched, signBody, type SemiRound } from "@/lib/semi/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// The EA's single round trip: it posts its state and gets back whatever the
// dashboard queued for it, in the same response.
//
// Why one request and not two: MQL5's WebRequest blocks the EA thread while it
// waits. Two calls (push state, then poll for commands) block it twice per
// beat. Merged, the command latency equals the heartbeat interval for free.
//
// Auth: the EA never sends the dashboard key. It sends SHA256(body + key) in
// X-RM-Sign, and we recompute it from the key the owner typed when linking the
// account. A leaked request body therefore proves nothing and replays nothing
// new (ts is checked below).
export async function POST(req: Request) {
  const account = req.headers.get("x-rm-account")?.trim()
  const sign = req.headers.get("x-rm-sign")?.trim().toLowerCase()
  if (!account || !sign) {
    return NextResponse.json({ error: "missing account or signature" }, { status: 400 })
  }

  // Read the body as text: the signature covers these exact bytes.
  const raw = await req.text()
  if (raw.length > 64_000) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 })
  }

  const entry = await load(account)
  if (!entry || !entry.doc.dashKey) {
    // Not linked yet — the owner has to sign in on the site and enter the key.
    return NextResponse.json({ error: "account not linked" }, { status: 404 })
  }

  if (signBody(raw, entry.doc.dashKey) !== sign) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  // Replay guard. The EA stamps server time; allow a wide skew because broker
  // server time is not the web server's clock, only the window matters.
  const ts = Number(body?.ts) * 1000
  if (ts && Math.abs(Date.now() - ts) > 10 * 60 * 1000) {
    return NextResponse.json({ error: "stale timestamp" }, { status: 400 })
  }

  const rounds: SemiRound[] = Array.isArray(body?.rounds)
    ? body.rounds.filter((r: any) => r && typeof r.id === "number")
    : []

  const saved = await saveState(account, body, rounds)
  if (!saved) return NextResponse.json({ error: "account not linked" }, { status: 404 })

  const cmd = pendingCommand(saved)
  return NextResponse.json({
    id: cmd?.id ?? 0,
    cmd: cmd?.cmd ?? "",
    lot: cmd?.lot ?? 0,
    ackRound: saved.doc.ackRound ?? 0,
    watching: isWatched(saved),
  })
}
