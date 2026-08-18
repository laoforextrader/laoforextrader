// Keeping personal data out of a PUBLIC Sanity dataset.
//
// The `production` dataset is public — Sanity only offers private datasets on
// the paid Growth plan — so every document is readable by anyone who lifts the
// project id out of the page source. Anything identifying therefore has to be
// de-identified or encrypted BEFORE it is written.
//
// Two primitives, deliberately different:
//
//   blindIndex()  one-way. For values we only ever need to MATCH, never read
//                 back: a rate-limit key, a dedup lookup. Deterministic, so
//                 equal inputs still collide into the same bucket.
//   encryptPII()  reversible. Only for values a feature genuinely has to
//                 recover — today that is a subscriber's email, because we
//                 cannot mail someone a hash.
//
// Key material: DATA_ENCRYPTION_KEY when set, otherwise NEXTAUTH_SECRET, which
// every deploy already has. The fallback is deliberate — a missing env var
// must never degrade into writing plaintext. Both are run through HKDF so the
// MAC subkey and the AES subkey are unrelated, and the blob records a short
// fingerprint of the key it was sealed with so a later key swap fails loudly
// instead of returning garbage.

import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes } from "node:crypto"

// Read lazily, not at module load: a script that populates process.env after
// importing this file (and any runtime that injects env late) must still see it.
function secret(): string {
  return process.env.DATA_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ""
}

/** Short fingerprint of the active key, embedded in every ciphertext. */
function keyId(): string {
  return createHash("sha256").update(secret()).digest("hex").slice(0, 8)
}

function subkey(purpose: string): Buffer {
  const raw = secret()
  if (!raw) throw new Error("pii: neither DATA_ENCRYPTION_KEY nor NEXTAUTH_SECRET is set")
  return Buffer.from(hkdfSync("sha256", Buffer.from(raw, "utf8"), Buffer.alloc(0), `laoforextrader:${purpose}`, 32))
}

const b64u = (b: Buffer) => b.toString("base64url")

/** True when there is key material to work with. Callers skip the write otherwise. */
export function piiReady(): boolean {
  return secret().length > 0
}

/**
 * One-way, deterministic. `domain` separates namespaces so the same IP used
 * for two different purposes doesn't produce the same token.
 */
export function blindIndex(value: string, domain: string): string {
  return createHmac("sha256", subkey(`mac:${domain}`))
    .update(value.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32)
}

/** AES-256-GCM. Returns `v1.<kid>.<iv>.<tag>.<ciphertext>`, all base64url. */
export function encryptPII(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", subkey("enc"), iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  return `v1.${keyId()}.${b64u(iv)}.${b64u(cipher.getAuthTag())}.${b64u(ct)}`
}

/**
 * Reverse of encryptPII. Throws on a key mismatch rather than returning
 * nonsense, so a rotated key surfaces as a visible error.
 */
export function decryptPII(blob: string): string {
  const [version, kid, iv, tag, ct] = blob.split(".")
  if (version !== "v1" || !kid || !iv || !tag || !ct) throw new Error("pii: malformed ciphertext")
  if (kid !== keyId()) throw new Error(`pii: sealed with key ${kid}, current key is ${keyId()}`)

  const decipher = createDecipheriv("aes-256-gcm", subkey("enc"), Buffer.from(iv, "base64url"))
  decipher.setAuthTag(Buffer.from(tag, "base64url"))
  return Buffer.concat([decipher.update(Buffer.from(ct, "base64url")), decipher.final()]).toString("utf8")
}

/** Display helper: never let one unreadable row break a whole admin page. */
export function decryptOr(blob: string | undefined | null, fallback = "—"): string {
  if (!blob) return fallback
  try {
    return decryptPII(blob)
  } catch {
    return fallback
  }
}
