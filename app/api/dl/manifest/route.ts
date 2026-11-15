import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// What the installer asks for first: the current version, size and SHA-256 of
// every build, plus the presets and manuals that ship with each one.
//
// The file behind it is public/ea/dist/manifest.json, written by the EA repo's
// Tools/mk_publish.py together with the binaries it describes — so a manifest
// can never name a version that was not uploaded in the same step.
//
// This route exists instead of letting the installer read the static file
// because the static file is cached at the edge by deployment, and `no-store`
// here is the difference between "customer installs the fix" and "customer
// installs whatever the CDN still had". The payload is ~1 KB.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin

  try {
    const res = await fetch(`${origin}/ea/dist/manifest.json`, { cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const manifest = await res.json()

    return NextResponse.json(manifest, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "manifest unavailable", detail: msg }, { status: 503 })
  }
}
