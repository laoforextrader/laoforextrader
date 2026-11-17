// List or delete contest entries.
//
//   node scripts/contest-entries.mjs            -> list every entry
//   node scripts/contest-entries.mjs --delete   -> delete them all
//
// Used to clear the owner's own test registrations before the round opens to
// real contestants. Listing first is the point: the entry code and the
// investor password are sealed, so a deleted entry cannot be reconstructed.
import { createClient } from "@sanity/client"
import { readFileSync } from "node:fs"

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim())
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {}
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-04-25",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: "published",
})

const rows = await client.fetch(
  `*[_type == "contestEntry"] | order(_createdAt asc){
     _id, entryNo, displayName, mtLogin, mtServer, status, lastSeen,
     "createdAt": _createdAt, "round": contest->title
   }`
)

if (!rows.length) {
  console.log("no contest entries exist")
  process.exit(0)
}

for (const r of rows) {
  console.log(
    `#${r.entryNo ?? "-"}  ${r.displayName}  MT5 ${r.mtLogin} (${r.mtServer ?? "-"})  ` +
    `status=${r.status}  seen=${r.lastSeen ?? "never"}  round=${r.round ?? "-"}  ${r._id}`
  )
}
console.log(`\n${rows.length} entr${rows.length === 1 ? "y" : "ies"}`)

if (!process.argv.includes("--delete")) {
  console.log("dry run — pass --delete to remove them")
  process.exit(0)
}

// One transaction: either the round is clear or nothing changed.
const tx = client.transaction()
for (const r of rows) tx.delete(r._id)
await tx.commit({ visibility: "sync" })
console.log(`deleted ${rows.length}`)
