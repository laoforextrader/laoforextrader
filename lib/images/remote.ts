// Point a news thumbnail at our own origin.
//
// Every remote news image on the site goes through here, so there is one
// place that decides how they are served and one place to change if the
// proxy is ever signed or swapped for a CDN.

/**
 * The URL to put in `src` for an image hosted by a news outlet.
 *
 * Returns null for a missing or malformed URL so the caller can render its
 * placeholder, rather than emitting `<img src="">` — which browsers treat as
 * a request for the current page and which quietly doubles the page load.
 */
export function newsImageSrc(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed.startsWith("https://")) return null
  return `/api/img?u=${encodeURIComponent(trimmed)}`
}
