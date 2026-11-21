import { NextResponse } from "next/server"
import { headers } from "next/headers"

//  Which country this request came from, so the phone field opens on the
//  right flag instead of on Laos for everybody.
//
//  Vercel resolves the IP at the edge and hands us the two-letter code, so
//  there is no lookup to do and no third-party geo service to call — which
//  also means no address of the reader's leaves the site. A guess, not a
//  fact: VPNs and roaming SIMs exist, which is why it only sets the default
//  and the picker stays open to anything.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const h = await headers()
  const code =
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    ""
  const country = /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : ""
  return NextResponse.json({ country }, {
    //  Per-visitor and cheap; a short private cache keeps a page that asks
    //  twice from paying twice without pinning one reader's country onto
    //  the next one.
    headers: { "Cache-Control": "private, max-age=600" },
  })
}
