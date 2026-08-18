/**
 * One-shot migration: strip or seal every readable personal detail already
 * sitting in the PUBLIC `production` dataset.
 *
 * Sanity only offers private datasets on the paid Growth plan, so the dataset
 * stays world-readable and the data itself has to stop being legible. What was
 * exposed, and what happens to it:
 *
 *   subscriber    49  email + name        → emailHash + emailEnc + nameEnc
 *   chatQuota     40  raw IP in `key`     → deleted (daily counters, disposable)
 *   chatSession    6  email + name        → unset (userId already identifies)
 *   like          17  userEmail           → unset (nothing ever read it)
 *   comment        2  userEmail           → unset (userName is the public part)
 *   adminMessage   2  name/email/IP/UA    → sealed; IP + UA unset
 *   supportThread  0  name/email/IP/UA    → sealed; IP + UA unset
 *
 * Imports lib/pii.ts directly — the same code the running app uses — so the
 * blind index computed here is guaranteed to match the one the sign-in path
 * computes later. A re-implementation would silently drift and every returning
 * member would be inserted a second time.
 *
 * Run: npx tsx scripts/harden-pii.ts --dry     (report only, writes nothing)
 *      npx tsx scripts/harden-pii.ts
 */
import { createClient } from "@sanity/client"
import { readFileSync } from "node:fs"
import { blindIndex, decryptPII, encryptPII, piiReady } from "../lib/pii"

// tsx doesn't load .env.local the way Next does.
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z_0-9]+)=(.*)$/.exec(line.trim())
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const DRY = process.argv.includes("--dry")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const seal = (v: unknown) => (typeof v === "string" && v.trim() ? encryptPII(v) : undefined)

async function main() {
  if (!process.env.SANITY_API_TOKEN) throw new Error("SANITY_API_TOKEN missing")
  if (!piiReady()) throw new Error("DATA_ENCRYPTION_KEY (or NEXTAUTH_SECRET) missing")

  // Prove the key round-trips before touching anything.
  const probe = "round-trip@example.com"
  if (decryptPII(encryptPII(probe)) !== probe) throw new Error("encrypt/decrypt does not round-trip")
  console.log(`🔐 key OK${DRY ? "  (dry run — nothing will be written)" : ""}\n`)

  let sealed = 0, stripped = 0, deleted = 0

  // ── subscriber ────────────────────────────────────────────────────────────
  const subs = await client.fetch<any[]>(
    `*[_type == "subscriber" && (defined(email) || defined(name) || defined(userImage))]{ _id, email, name }`,
  )
  console.log(`subscriber      : ${subs.length} with readable fields`)
  for (const s of subs) {
    if (!s.email) continue
    const patch = {
      emailHash: blindIndex(String(s.email).trim().toLowerCase(), "subscriber"),
      emailEnc: encryptPII(String(s.email).trim().toLowerCase()),
      ...(s.name ? { nameEnc: encryptPII(String(s.name)) } : {}),
    }
    if (!DRY) {
      await client.patch(s._id).set(patch).unset(["email", "name", "userImage"]).commit()
    }
    sealed++
  }

  // ── like / comment / chatSession: fields nothing ever read ────────────────
  for (const [type, fields] of [
    ["like", ["userEmail"]],
    ["comment", ["userEmail"]],
    ["chatSession", ["userEmail", "userName"]],
  ] as [string, string[]][]) {
    const docs = await client.fetch<any[]>(
      `*[_type == $type && (${fields.map((f) => `defined(${f})`).join(" || ")})]{ _id }`,
      { type },
    )
    console.log(`${type.padEnd(16)}: ${docs.length} to strip (${fields.join(", ")})`)
    for (const d of docs) {
      if (!DRY) await client.patch(d._id).unset(fields).commit()
      stripped++
    }
  }

  // ── adminMessage / supportThread: seal contact details, drop IP + UA ──────
  for (const type of ["adminMessage", "supportThread"]) {
    const docs = await client.fetch<any[]>(
      `*[_type == $type]{ _id, name, email, contactHandle }`,
      { type },
    )
    const dirty = docs.filter((d) => d.name || d.email || d.contactHandle)
    console.log(`${type.padEnd(16)}: ${docs.length} docs, ${dirty.length} with contact details`)
    for (const d of docs) {
      const set: Record<string, string> = {}
      const nameEnc = seal(d.name); if (nameEnc) set.nameEnc = nameEnc
      const emailEnc = seal(d.email); if (emailEnc) set.emailEnc = emailEnc
      const contactEnc = seal(d.contactHandle); if (contactEnc) set.contactEnc = contactEnc
      if (!DRY) {
        await client.patch(d._id).set(set).unset(["name", "email", "contactHandle", "ip", "userAgent"]).commit()
      }
      if (Object.keys(set).length) sealed++
      else stripped++
    }
  }

  // ── chatQuota: the key holds a raw IP. These are one-day counters, so the
  //    honest fix is to throw them away rather than migrate them. Worst case a
  //    guest who chatted today gets their allowance back.
  const quotas = await client.fetch<any[]>(`*[_type == "chatQuota"]{ _id }`)
  console.log(`chatQuota       : ${quotas.length} to delete`)
  for (const q of quotas) {
    if (!DRY) await client.delete(q._id)
    deleted++
  }

  console.log(
    `\n${DRY ? "would seal" : "sealed"} ${sealed} · ${DRY ? "would strip" : "stripped"} ${stripped} · ` +
    `${DRY ? "would delete" : "deleted"} ${deleted}`,
  )
  if (DRY) console.log("— dry run, nothing written —")
}

main().catch((e) => { console.error("❌", e.message); process.exit(1) })
