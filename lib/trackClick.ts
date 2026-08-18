// Client-side outbound click tracking.
//
// Fires twice on purpose:
//   1. gtag  → GA4, for the funnel/attribution view in the Google UI
//   2. beacon → /api/track/click, so /admin can show the number without a
//      Google Cloud service account
//
// Both are fire-and-forget. The link keeps its normal navigation — we never
// preventDefault, so a failed tracker can't swallow a click.

import { event } from "@/lib/gtag"

export type ClickGroup = "broker" | "ea" | "contact" | "other"

export interface TrackClickArgs {
  /** Stable id, lowercase — e.g. "broker-interstellar". Must match /^[a-z0-9][a-z0-9._-]{0,59}$/ */
  target: string
  /** Human label shown in /admin — e.g. "Interstellar Group" */
  label?: string
  group?: ClickGroup
}

/** "Vantage Markets" / "vantage-markets" / "vantage" -> "vantage" */
export function slugifyTarget(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// The same broker is reached through two different slugs: the Sanity
// `broker` doc slug (/broker pages) and the shorter CTASelector slug
// (in-article CTAs). Fold them together so /admin shows ONE row per broker
// instead of two half-counts.
const BROKER_ALIASES: Record<string, string> = {
  "xm-global": "xm",
  "interstellar-group": "interstellar",
  "vantage-markets": "vantage",
}

/** Canonical click target for a broker, from either its slug or display name. */
export function brokerTarget(slugOrName: string): string {
  const s = slugifyTarget(slugOrName)
  return `broker-${BROKER_ALIASES[s] ?? s}`
}

export function trackClick({ target, label, group = "other" }: TrackClickArgs): void {
  if (typeof window === "undefined") return

  // GA4
  event({ action: "outbound_click", category: group, label: label ?? target })

  // Own counter. sendBeacon survives the page unload that an outbound link
  // triggers; fetch+keepalive is the fallback for browsers without it.
  const payload = JSON.stringify({ target, label, group })
  try {
    const blob = new Blob([payload], { type: "application/json" })
    if (navigator.sendBeacon?.("/api/track/click", blob)) return
  } catch {
    /* fall through */
  }
  try {
    void fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    })
  } catch {
    /* tracking must never throw into the click handler */
  }
}
