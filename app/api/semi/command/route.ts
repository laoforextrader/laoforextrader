import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { load, queueCommand } from "@/lib/semi/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Commands the EA understands. Kept as an explicit list rather than passing
// the string through: this endpoint can open real positions, so anything not
// named here is rejected before it reaches the queue.
const ACTIONS = new Set([
  "BUY", "SELL",
  "CLOSE_BUY", "CLOSE_SELL", "CLOSE_ALL",
  "STOP_BUY", "STOP_SELL",
  "MODE_MANUAL", "MODE_SEMI", "MODE_AUTO",
  "SET_LOT", "SET_GRID", "SET_GUARD", "RESET",
])

// Commands whose number means something, with the same bounds the EA clamps
// to. Rejecting here as well gives the user a real error instead of a silent
// clamp on the chart.
const RANGES: Record<string, [number, number]> = {
  BUY:       [0.01, 100],
  SELL:      [0.01, 100],
  SET_LOT:   [0.01, 100],
  SET_GRID:  [10, 5000],
  SET_GUARD: [0, 95],
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign in first" }, { status: 401 })

  let body: { account?: string; cmd?: string; lot?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const account = String(body.account ?? "").trim()
  const cmd = String(body.cmd ?? "").trim().toUpperCase()
  const lot = Number(body.lot ?? 0)

  if (!ACTIONS.has(cmd)) {
    return NextResponse.json({ error: "unknown command" }, { status: 400 })
  }
  const range = RANGES[cmd]
  if (range) {
    if (!Number.isFinite(lot) || lot < range[0] || lot > range[1]) {
      return NextResponse.json(
        { error: `value for ${cmd} must be between ${range[0]} and ${range[1]}` },
        { status: 400 }
      )
    }
  }

  const entry = await load(account)
  if (!entry || entry.doc.ownerEmail !== email) {
    return NextResponse.json({ error: "account not found" }, { status: 404 })
  }

  // A command older than a minute is dropped by the store, so an EA that was
  // offline when the button was pressed will not wake up and fire it late.
  const id = await queueCommand(account, cmd, lot, email)

  const last = entry.doc.lastSeen ? Date.parse(entry.doc.lastSeen) : 0
  const online = last > 0 && Date.now() - last < 90_000

  return NextResponse.json({
    ok: true,
    id,
    online,
    note: online ? null : "EA has not reported recently — the command expires in 60s",
  })
}
