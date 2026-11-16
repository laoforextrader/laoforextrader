// Why did "Connect" do nothing?
//
//   node --env-file=.env.local scripts/semi-link-doctor.mjs <mt5 login>
//
// Read-only. Shows what the account document actually looks like, which of
// the two shapes (sealed or legacy plaintext) it is in, and whether the
// lookup the dashboard uses after linking — accountsOf — would find it.
// Writes nothing, so it is safe to run while a customer is on the page.

import { createClient } from "@sanity/client"
import { createHash, createHmac, hkdfSync, createDecipheriv } from "node:crypto"

const login = process.argv[2]
if (!login) {
  console.error("usage: node --env-file=.env.local scripts/semi-link-doctor.mjs <mt5 login>")
  process.exit(1)
}

const secret = process.env.DATA_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ""
const keyId = secret ? createHash("sha256").update(secret).digest("hex").slice(0, 8) : ""
const subkey = p => Buffer.from(hkdfSync("sha256", Buffer.from(secret, "utf8"), Buffer.alloc(0), `laoforextrader:${p}`, 32))
const blindIndex = (v, d) => createHmac("sha256", subkey(`mac:${d}`)).update(v.trim().toLowerCase()).digest("hex").slice(0, 32)
const decryptPII = blob => {
  const [version, kid, iv, tag, ct] = String(blob).split(".")
  if (version !== "v1") throw new Error("not a sealed value")
  if (kid !== keyId) throw new Error(`sealed with key ${kid}, this env has ${keyId}`)
  const d = createDecipheriv("aes-256-gcm", subkey("enc"), Buffer.from(iv, "base64url"))
  d.setAuthTag(Buffer.from(tag, "base64url"))
  return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]).toString("utf8")
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-04-25",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

console.log(`env: DATA_ENCRYPTION_KEY ${process.env.DATA_ENCRYPTION_KEY ? "set" : "NOT set"} · ` +
            `NEXTAUTH_SECRET ${process.env.NEXTAUTH_SECRET ? "set" : "NOT set"} · key id ${keyId || "—"}`)

const doc = await sanity.fetch(
  `*[_id == $id][0]{
     _id, account, ownerEmail, ownerEmailHash, ownerEmailEnc, ownerName,
     dashKey, dashKeyEnc, lastSeen, "hasState": defined(state) && state != ""
   }`,
  { id: `semi-${login}` }
)

if (!doc) {
  console.log(`\nNo document for semi-${login}.`)
  console.log("So the link never got as far as writing — or it wrote and failed.")
  const any = await sanity.fetch(`count(*[_type == "semiAccount"])`)
  console.log(`(${any} semiAccount documents exist in total)`)
  process.exit(0)
}

console.log(`\ndocument : ${doc._id}`)
console.log(`account  : ${doc.account}`)
console.log(`owner    : ${doc.ownerName || "—"}`)
console.log(`last seen: ${doc.lastSeen || "never"}   state stored: ${doc.hasState ? "yes" : "no"}`)

console.log("\nshape:")
console.log(`  ownerEmail      (plain)  : ${doc.ownerEmail ? "present" : "—"}`)
console.log(`  ownerEmailHash  (index)  : ${doc.ownerEmailHash ? doc.ownerEmailHash.slice(0, 12) + "…" : "—"}`)
console.log(`  ownerEmailEnc   (sealed) : ${doc.ownerEmailEnc ? "present" : "—"}`)
console.log(`  dashKey         (plain)  : ${doc.dashKey ? "PRESENT — readable by anyone" : "—"}`)
console.log(`  dashKeyEnc      (sealed) : ${doc.dashKeyEnc ? "present" : "—"}`)

let email = ""
if (doc.ownerEmailEnc) {
  try { email = decryptPII(doc.ownerEmailEnc); console.log(`\nsealed email opens fine`) }
  catch (e) { console.log(`\nCANNOT OPEN THE SEALED EMAIL: ${e.message}`) }
} else if (doc.ownerEmail) {
  email = doc.ownerEmail
}

let key = ""
if (doc.dashKeyEnc) {
  try { key = decryptPII(doc.dashKeyEnc); console.log(`sealed key opens fine (${key.length} chars)`) }
  catch (e) { console.log(`CANNOT OPEN THE SEALED KEY: ${e.message}`) }
} else if (doc.dashKey) {
  key = doc.dashKey
}

// The lookup /semi runs right after linking. If this comes back empty the
// page shows the link form again — which looks exactly like "nothing
// happened" to whoever pressed Connect.
if (email) {
  const rows = await sanity.fetch(
    `*[_type == "semiAccount" && (ownerEmailHash == $hash || ownerEmail == $email)]{ account }`,
    { hash: blindIndex(email, "semiOwner"), email }
  )
  console.log(`\naccountsOf() for this owner returns: ${rows.length ? rows.map(r => r.account).join(", ") : "NOTHING"}`)
  if (!rows.length) {
    console.log("  -> /semi would show the link form again, with no error. That is the bug.")
  }
} else {
  console.log("\nNo owner email on the document at all — the link never completed.")
}
