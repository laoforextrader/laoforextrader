// Unsubscribe links have to work for someone who is not logged in, may be
// reading in a different browser, and must never require them to type their
// address back in — Gmail's one-click unsubscribe POSTs the URL with no user
// present at all.
//
// The token is `<emailHash>.<signature>`. Both halves are derived from the
// address, so nothing readable travels in the URL, and the signature stops
// anyone from unsubscribing a stranger by guessing hashes.

import { blindIndex } from "@/lib/pii"

export function unsubscribeToken(emailHash: string): string {
  return `${emailHash}.${blindIndex(emailHash, "unsubscribe")}`
}

/** Returns the emailHash the token vouches for, or null if it doesn't verify. */
export function verifyUnsubscribeToken(token: string): string | null {
  const [emailHash, signature] = (token ?? "").split(".")
  if (!emailHash || !signature) return null
  try {
    return blindIndex(emailHash, "unsubscribe") === signature ? emailHash : null
  } catch {
    return null
  }
}

export function unsubscribeUrl(emailHash: string, base = "https://www.laoforextrader.com"): string {
  return `${base}/api/newsletter/unsubscribe?t=${unsubscribeToken(emailHash)}`
}
