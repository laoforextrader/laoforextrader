import { NextResponse } from "next/server"
import { load, saveState, takeCommand, isWatched, signBody, type SemiRound } from "@/lib/semi/store"

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

  // Replay guard. The EA stamps UTC (TimeGMT, not TimeCurrent — broker server
  // time runs hours off UTC and silently failed every push here). The window
  // is wide enough to tolerate a user's clock being out by half an hour, which
  // is common on home machines, while still refusing a captured old body.
  const ts = Number(body?.ts) * 1000
  const skew = ts ? Math.abs(Date.now() - ts) : 0
  if (ts && skew > 30 * 60 * 1000) {
    return NextResponse.json({
      error: "stale timestamp — send ts as UTC (TimeGMT), or fix the clock",
      skewMinutes: Math.round(skew / 60000),
    }, { status: 400 })
  }

  const rounds: SemiRound[] = Array.isArray(body?.rounds)
    ? body.rounds.filter((r: any) => r && typeof r.id === "number")
    : []

  const saved = await saveState(account, body, rounds)
  if (!saved) return NextResponse.json({ error: "account not linked" }, { status: 404 })

  const cmd = await takeCommand(account, saved)
  return NextResponse.json({
    id: cmd?.id ?? 0,
    cmd: cmd?.cmd ?? "",
    lot: cmd?.lot ?? 0,
    ackRound: saved.doc.ackRound ?? 0,
    watching: isWatched(saved),
  })
}
