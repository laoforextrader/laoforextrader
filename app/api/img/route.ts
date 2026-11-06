// Re-serve a remote news thumbnail from our own origin.
//
// News outlets block hotlinking. investinglive returns the image happily to a
// server request and refuses the same URL when a browser asks for it, and
// `referrerPolicy="no-referrer"` does not help — so the thumbnails on /news
// and in the homepage rail were blank boxes. Fetching server-side and
// streaming the bytes is what actually works.
//
// It is NOT a general-purpose proxy, and the guards below are the whole
// reason it is safe to expose:
//
//   · https only, and the host must be one of the few on the allow-list in
//     lib/images/remote.ts. A proxy that will fetch anything on request —
//     http://169.254.169.254/, or someone else's bandwidth bill — is an SSRF
//     hole into the deployment's own network and an open relay besides.
//   · the response must actually be an image, and it is capped. Without that
//     this is an open file-relay with our bandwidth bill attached.
//   · one day of immutable cache, because a news thumbnail never changes and
//     the point is to pay for each image once.
//
// It is unsigned, and does not need to be: with a fixed host allow-list there
// is nothing useful to point it at. A signature would also need a shared
// secret, and a required new env var is a thing that breaks every image in
// production the day someone forgets it.

import { NextResponse } from "next/server"
import { needsProxy } from "@/lib/images/remote"

export const runtime = "nodejs"

const MAX_BYTES = 8 * 1024 * 1024
const TIMEOUT_MS = 8000

/** Hostnames that must never be fetched on a caller's behalf. */
function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) {
    return true
  }
  // IPv6 loopback / link-local / unique-local
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true
  // IPv4 literals in the private and link-local ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])]
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 169 && b === 254) return true
    if (a === 100 && b >= 64 && b <= 127) return true
  }
  return false
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("u")
  if (!raw) return new NextResponse("missing u", { status: 400 })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new NextResponse("bad url", { status: 400 })
  }
  // The host allow-list in lib/images/remote.ts is the real gate: this route
  // will only ever fetch an outlet we have decided needs re-serving, so it is
  // not a general-purpose proxy for anyone who finds the URL. The private-host
  // check stays as a second line in case that list ever grows carelessly.
  if (target.protocol !== "https:" || isPrivateHost(target.hostname) || !needsProxy(target.hostname)) {
    return new NextResponse("forbidden", { status: 403 })
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        // The same identification the feed fetchers use. A default fetch UA
        // is what several CDNs reject.
        "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    })
    if (!upstream.ok) return new NextResponse("upstream error", { status: 502 })

    const type = upstream.headers.get("content-type") ?? ""
    if (!type.startsWith("image/")) return new NextResponse("not an image", { status: 415 })

    const declared = Number(upstream.headers.get("content-length") ?? 0)
    if (declared > MAX_BYTES) return new NextResponse("too large", { status: 413 })

    const buf = await upstream.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) return new NextResponse("too large", { status: 413 })

    return new NextResponse(buf, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new NextResponse("fetch failed", { status: 502 })
  }
}
