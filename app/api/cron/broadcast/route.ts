import { NextResponse } from "next/server"
import { dispatchDueBroadcasts } from "@/lib/broadcast/dispatcher"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Vercel cron entry. Configured to fire every hour at :00 (see vercel.json).
// Vercel attaches Authorization: Bearer <CRON_SECRET> automatically.
//
// We also accept a manual hit with the same CRON_SECRET for debugging:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/broadcast

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // no secret configured — allow (Vercel still cron-only on prod)
  const got = req.headers.get("authorization")
  return got === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const summary = await dispatchDueBroadcasts(new Date())
    return NextResponse.json({ ok: true, ...summary })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 },
    )
  }
}
