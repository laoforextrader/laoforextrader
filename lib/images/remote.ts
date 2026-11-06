// Where a news thumbnail is fetched from.
//
// Two outlets, two opposite problems, so there is no single answer:
//
//   · investinglive refuses a browser and serves a server, so its images have
//     to come through /api/img or they do not load at all.
//   · images.financemagnates.com is the mirror image — it serves browsers and
//     answers our server with 403. Putting it through the proxy turns a
//     working picture into a broken one, and the fix is NOT to dress the
//     proxy up as a browser: a site that declines automated fetching has said
//     so, and the reader's own browser is welcome to the file either way.
//
// So the proxy is opt-in per host and everything else goes direct, which is
// also what makes /api/img a closed door rather than an open one: nothing can
// ask it to fetch a host that is not on this list.
//
// Adding a feed means checking which way its CDN behaves and, only if it
// refuses browsers, adding it here.

/** Hosts that refuse browsers and therefore have to be re-served by us. */
const PROXY_HOSTS = new Set(["investinglive.com", "www.investinglive.com"])

export function needsProxy(hostname: string): boolean {
  return PROXY_HOSTS.has(hostname.toLowerCase())
}

/**
 * The URL to put in `src` for an image hosted by a news outlet.
 *
 * Returns null for a missing or malformed URL so the caller renders its
 * placeholder, rather than emitting `<img src="">` — which browsers treat as
 * a request for the current page and which quietly doubles the page load.
 */
export function newsImageSrc(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed.startsWith("https://")) return null

  let host: string
  try {
    host = new URL(trimmed).hostname
  } catch {
    return null
  }

  return needsProxy(host) ? `/api/img?u=${encodeURIComponent(trimmed)}` : trimmed
}
