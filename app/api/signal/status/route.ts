// Same-origin proxy for the Pro-signal payment status check.
//
// The success page polls this to learn when a pending slip gets approved (and
// to pick up the auto-issued invite link). Like the submit call, polling the
// separate trs-signal-api backend directly is a cross-origin call to a
// far-region host that drops on flaky mobile networks — so we proxy it
// server-to-server and keep the browser leg same-origin.

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const UPSTREAM_BASE = (() => {
  const url = process.env.TRS_SUBMIT_API || process.env.NEXT_PUBLIC_TRS_SUBMIT_API || ""
  if (!url) return ""
  return url.replace(/\/api\/payment\/submit\/?$/, "")
})()

const UPSTREAM_TIMEOUT_MS = 15000

export async function GET(req: NextRequest) {
  if (!UPSTREAM_BASE) {
    return NextResponse.json({ ok: false, not_configured: true }, { status: 503 })
  }

  const id = req.nextUrl.searchParams.get("id") ?? ""
  const token = req.nextUrl.searchParams.get("token") ?? ""
  if (!id || !token) {
    return NextResponse.json({ ok: false, error: "missing id/token" }, { status: 400 })
  }

  const target =
    `${UPSTREAM_BASE}/api/payment/status?id=${encodeURIComponent(id)}` +
    `&token=${encodeURIComponent(token)}`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const upstream = await fetch(target, { signal: ctrl.signal })
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "upstream_unreachable" },
      { status: 504 },
    )
  } finally {
    clearTimeout(timer)
  }
}
