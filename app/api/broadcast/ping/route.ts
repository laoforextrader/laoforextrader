import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Minimal diagnostic route — no chromium, no Sanity, no env required.
// If THIS 404s after deploy, the broadcast subtree itself isn't shipping.
export async function GET() {
  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    node: process.version,
    env: {
      hasLineToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasBroadcastSecret: !!process.env.BROADCAST_SECRET,
      hasSanityToken: !!process.env.SANITY_API_TOKEN,
      hasCronSecret: !!process.env.CRON_SECRET,
    },
  })
}
