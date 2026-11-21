//  The link in a registration email, and what makes it trustworthy.
//
//  Somebody who joins without Google has proved nothing yet — anyone can type
//  anyone's address. So nothing is unlocked until they open the mailbox: the
//  form saves the profile, we mail a link, and clicking it is the proof.
//
//  Three parts, `<emailHash>.<nonce>.<signature>`:
//
//    emailHash   the blind index, so no address travels in a URL that ends
//                up in browser history and mail-scanner logs
//    nonce       random, stored on the subscriber document and cleared the
//                moment it is used — that is what makes the link single-use.
//                A purely stateless token stays valid for its whole life to
//                anyone who ever sees it, and mail gets forwarded.
//    signature   HMAC over the first two with the site key, so a hash cannot
//                be guessed or paired with a nonce of the attacker's choosing
//
//  Expiry is checked against the timestamp stored beside the nonce, not
//  against anything in the token, so a token cannot claim its own freshness.

import { randomBytes } from "node:crypto"
import { blindIndex } from "@/lib/pii"

/** How long a link stays good. Long enough for a phone checked in the evening. */
export const LINK_TTL_MS = 24 * 60 * 60 * 1000

export const newNonce = () => randomBytes(16).toString("base64url")

export function loginToken(emailHash: string, nonce: string): string {
  return `${emailHash}.${nonce}.${blindIndex(`${emailHash}:${nonce}`, "loginlink")}`
}

export function readLoginToken(token: unknown): { emailHash: string; nonce: string } | null {
  const [emailHash, nonce, sig] = String(token ?? "").split(".")
  if (!emailHash || !nonce || !sig) return null
  try {
    return blindIndex(`${emailHash}:${nonce}`, "loginlink") === sig ? { emailHash, nonce } : null
  } catch {
    return null
  }
}

export const SITE = "https://www.laoforextrader.com"

export const loginUrl = (token: string, base = SITE) =>
  `${base}/login/verify?t=${encodeURIComponent(token)}`
