import { NextResponse } from "next/server"
import { currentContest, signBody, normCode } from "@/lib/contest/store"
import { applyHeartbeat, entryByLogin, rankOf, type EaPayload } from "@/lib/contest/ea"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// The contest EA's heartbeat: one POST a minute per contestant.
//
// Auth is the same scheme as the Semi dashboard — the entry code never
// travels, only SHA256(body + code) in X-RM-Sign — with one difference that
// matters here: the code is issued by the website, so a contestant cannot
// claim an account that is not theirs by typing a number. The signature only
// verifies against the code we gave them for the login they registered.
export async function POST(req: Request) {
  const login = req.headers.get("x-rm-account")?.trim()
  const sign = req.headers.get("x-rm-sign")?.trim().toLowerCase()
  if (!login || !sign) {
    return NextResponse.json({ error: "missing account or signature" }, { status: 400 })
  }

  const raw = await req.text()
  if (raw.length > 64_000) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 })
  }

  const contest = await currentContest()
  if (!contest || contest.status === "done") {
    return NextResponse.json({ error: "no round is running" }, { status: 404 })
  }

  const entry = await entryByLogin(contest._id, login)
  if (!entry?.entryCode) {
    return NextResponse.json({ error: "account not registered for this round" }, { status: 404 })
  }
  if (entry.status === "disqualified") {
    return NextResponse.json({ error: "entry disqualified" }, { status: 403 })
  }

  // Compared against the code as stored and as normalised, so a code that was
  // saved with a stray space or dash still verifies. Only the shape is
  // forgiven, never the characters — the dashKey incident of 2026-11-16 is
  // what this guards against.
  const code = entry.entryCode as string
  if (signBody(raw, code) !== sign && signBody(raw, normCode(code)) !== sign) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 })
  }

  let body: EaPayload
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  // Replay guard. The EA stamps UTC (TimeGMT); broker server time runs hours
  // off and silently failed every push when the Semi dashboard tried it.
  const ts = Number(body?.ts) * 1000
  const skew = ts ? Math.abs(Date.now() - ts) : 0
  if (ts && skew > 30 * 60 * 1000) {
    return NextResponse.json({
      error: "stale timestamp — send ts as UTC (TimeGMT), or fix the clock",
      skewMinutes: Math.round(skew / 60000),
    }, { status: 400 })
  }

  const saved = await applyHeartbeat(entry, contest, body)
  const { rank, entries } = await rankOf(contest._id, entry._id, saved.profit)

  return NextResponse.json({
    ok: true,
    rank,
    entries,
    profit: +saved.profit.toFixed(2),
    status: saved.status,
    endsAt: contest.endAt,
    startsAt: contest.startAt,
    // The panel locks itself on this, so the owner can move the start date in
    // Sanity without anyone reinstalling an EA. Open only while the round is
    // actually running: before the start there is nothing to trade for, and a
    // trade placed early is the one thing the approval screen checks for.
    locked: contest.status !== "live" ||
            (!!contest.startAt && Date.now() < Date.parse(contest.startAt)),
    // So the EA can show "3 days left" without trusting the local clock.
    serverTime: Math.floor(Date.now() / 1000),
    // Anything the server wants the contestant to see on the panel.
    notice: saved.newFlags.length ? saved.newFlags[0].note : "",
  })
}
