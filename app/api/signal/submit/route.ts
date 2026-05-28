// Same-origin proxy for the Pro-signal slip submission.
//
// The customer's browser POSTs here (same origin as the page) instead of
// directly to the separate trs-signal-api.vercel.app backend. A direct
// cross-origin POST forces a CORS preflight (OPTIONS + POST = two round trips
// to a far-region server) which drops easily on flaky Lao mobile networks and
// surfaced as the "Load failed" / network-error red box. Routing through this
// server-to-server hop removes CORS/preflight from the browser path entirely;
// the unreliable leg becomes a fast, reliable call inside Vercel's network.
//
// Upstream status + JSON body are passed through unchanged so the form keeps
// handling auto_approved / pending_id / 409-duplicate exactly as before.

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const UPSTREAM =
  process.env.TRS_SUBMIT_API || process.env.NEXT_PUBLIC_TRS_SUBMIT_API || ""

const UPSTREAM_TIMEOUT_MS = 25000

export async function POST(req: NextRequest) {
  // No backend wired (e.g. local dev without the env) — signal the form to
  // fall back to its manual-review success flow rather than hard-failing.
  if (!UPSTREAM) {
    return NextResponse.json({ ok: false, not_configured: true }, { status: 503 })
  }

  const body = await req.text()

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: ctrl.signal,
    })
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
