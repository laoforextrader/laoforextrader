// Seals the secrets that were written to the PUBLIC Sanity dataset in clear
// text, and removes the plaintext.
//
//   node --env-file=.env.local scripts/migrate-seal-secrets.mjs --dry
//   node --env-file=.env.local scripts/migrate-seal-secrets.mjs
//
// Run it AFTER the code that reads sealed-or-plain is deployed. In that order
// there is no window where a running EA cannot authenticate: the deployed code
// understands both shapes, and this script only changes the shape.
//
// The crypto here mirrors lib/pii.ts exactly — same HKDF info strings, same
// AES-256-GCM envelope, same blind-index domain — because the running site
// has to be able to read what this writes. If you change one, change both.

import { createClient } from "@sanity/client"
import { createCipheriv, createHash, createHmac, hkdfSync, randomBytes } from "node:crypto"

const dry = process.argv.includes("--dry")

const secret = process.env.DATA_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ""
if (!secret) {
  console.error("neither DATA_ENCRYPTION_KEY nor NEXTAUTH_SECRET is set — refusing to run")
  process.exit(1)
}

const keyId = createHash("sha256").update(secret).digest("hex").slice(0, 8)
const subkey = purpose =>
  Buffer.from(hkdfSync("sha256", Buffer.from(secret, "utf8"), Buffer.alloc(0), `laoforextrader:${purpose}`, 32))
const b64u = b => b.toString("base64url")

const encryptPII = plain => {
  const iv = randomBytes(12)
  const c = createCipheriv("aes-256-gcm", subkey("enc"), iv)
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()])
  return `v1.${keyId}.${b64u(iv)}.${b64u(c.getAuthTag())}.${b64u(ct)}`
}
const blindIndex = (value, domain) =>
  createHmac("sha256", subkey(`mac:${domain}`)).update(value.trim().toLowerCase()).digest("hex").slice(0, 32)

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-04-25",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

let sealed = 0, skipped = 0

// ── semiAccount: dashboard keys and owner emails ────────────────────────────
const accounts = await sanity.fetch(
  `*[_type == "semiAccount"]{ _id, account, ownerEmail, ownerEmailEnc, dashKey, dashKeyEnc }`
)
console.log(`semiAccount: ${accounts.length} documents`)
for (const a of accounts) {
  const set = {}
  const unset = []
  if (a.dashKey) { set.dashKeyEnc = encryptPII(a.dashKey); unset.push("dashKey") }
  if (a.ownerEmail) {
    set.ownerEmailHash = blindIndex(a.ownerEmail, "semiOwner")
    set.ownerEmailEnc = encryptPII(a.ownerEmail)
    unset.push("ownerEmail")
  }
  if (!unset.length) { skipped++; continue }
  console.log(`  ${a.account}: sealing ${unset.join(", ")}`)
  if (!dry) await sanity.patch(a._id).set(set).unset(unset).commit({ visibility: "sync" })
  sealed++
}

// ── contestEntry: entry codes, emails, contacts ─────────────────────────────
const entries = await sanity.fetch(
  `*[_type == "contestEntry"]{ _id, mtLogin, ownerEmail, entryCode, contact }`
)
console.log(`contestEntry: ${entries.length} documents`)
for (const e of entries) {
  const set = {}
  const unset = []
  if (e.entryCode) { set.entryCodeEnc = encryptPII(e.entryCode); unset.push("entryCode") }
  if (e.ownerEmail) {
    set.ownerEmailHash = blindIndex(e.ownerEmail, "contestOwner")
    set.ownerEmailEnc = encryptPII(e.ownerEmail)
    unset.push("ownerEmail")
  }
  if (e.contact) { set.contactEnc = encryptPII(e.contact); unset.push("contact") }
  if (!unset.length) { skipped++; continue }
  console.log(`  ${e.mtLogin}: sealing ${unset.join(", ")}`)
  if (!dry) await sanity.patch(e._id).set(set).unset(unset).commit({ visibility: "sync" })
  sealed++
}

console.log(`\n${dry ? "[dry run] would seal" : "sealed"} ${sealed} document(s), ${skipped} already clean`)

// ── prove it from the outside ───────────────────────────────────────────────
// The whole point is that an anonymous reader sees nothing useful, so check
// that rather than trusting the writes.
if (!dry) {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb"
  const ds = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"
  const q = encodeURIComponent(
    '*[_type in ["semiAccount","contestEntry"]]{ "k": dashKey, "c": entryCode, "e": ownerEmail }'
  )
  const res = await fetch(`https://${pid}.api.sanity.io/v2023-05-03/data/query/${ds}?query=${q}`)
  const json = await res.json()
  const leaks = (json.result ?? []).filter(r => r.k || r.c || r.e)
  console.log(leaks.length === 0
    ? "verified from outside: no plaintext key, code or email is readable anonymously"
    : `STILL LEAKING on ${leaks.length} document(s)`)
  process.exit(leaks.length ? 1 : 0)
}
