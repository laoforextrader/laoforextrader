// Add one rule to a contest round, in all three languages.
//
//   node scripts/contest-add-rule.mjs                 -> show the round's rules
//   node scripts/contest-add-rule.mjs --add no-early-trading
//
// Rules live on the `contest` document, not in the code, so they can be
// reworded in the Studio between rounds. This script exists because adding
// one by hand means typing the same sentence three times into three locale
// fields and getting the `_key` right — and a rule with a duplicated key
// silently disappears from the array.
//
// It patches, never replaces: `append` on the existing array, after checking
// the key is not already there. Running it twice is a no-op.

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

// The rules this script knows how to add. Keyed by the `_key` they take in
// the array, so a second run can tell that one is already there.
const LIBRARY = {
  "no-early-trading": {
    en: "Do not trade before the contest starts. The contest EA is locked until the start time — opening any order before it, by hand or with another EA, forfeits the entry and takes it out of the contest.",
    th: "ห้ามเทรดก่อนวันเริ่มแข่งขันเด็ดขาด · EA จะล็อกไว้จนถึงเวลาเริ่ม ถ้ามีการเปิดออเดอร์ก่อน ไม่ว่าจะด้วยมือหรือ EA ตัวอื่น ถือว่าหมดสิทธิ์และออกจากการแข่งขันทันที",
    lo: "ຫ້າມເທຣດກ່ອນວັນເລີ່ມແຂ່ງຂັນເດັດຂາດ · EA ຈະລັອກໄວ້ຈົນຮອດເວລາເລີ່ມ ຖ້າມີການເປີດອໍເດີກ່ອນ ບໍ່ວ່າຈະດ້ວຍມື ຫຼື EA ໂຕອື່ນ ຖືວ່າໝົດສິດ ແລະ ອອກຈາກການແຂ່ງຂັນທັນທີ",
  },
}

const slug = process.argv.find(a => a.startsWith("--round="))?.slice(8)
const addKey = process.argv[process.argv.indexOf("--add") + 1]

const round = await client.fetch(
  slug
    ? `*[_type == "contest" && slug.current == $slug][0]{ _id, title, status, rules }`
    : `*[_type == "contest" && status in ["register","live","judging"]] | order(startAt desc)[0]{ _id, title, status, rules }`,
  { slug: slug ?? null },
)

if (!round) {
  console.log("no round found")
  process.exit(1)
}

console.log(`${round.title} (${round.status})`)
for (const r of round.rules ?? []) console.log(`  [${r._key}] ${r.text?.lo ?? r.text?.en ?? ""}`)

if (!process.argv.includes("--add")) {
  console.log("\nnothing added — pass --add <key>, one of: " + Object.keys(LIBRARY).join(", "))
  process.exit(0)
}

const text = LIBRARY[addKey]
if (!text) {
  console.log(`\nunknown rule "${addKey}" — known: ${Object.keys(LIBRARY).join(", ")}`)
  process.exit(1)
}
if ((round.rules ?? []).some(r => r._key === addKey)) {
  console.log(`\n"${addKey}" is already on this round`)
  process.exit(0)
}

// Placed second: it belongs next to "trade with the contest EA only", which
// is the rule it completes, rather than at the bottom where the procedural
// ones live.
await client
  .patch(round._id)
  .setIfMissing({ rules: [] })
  .insert("after", "rules[0]", [{ _key: addKey, _type: "rule", text }])
  .commit({ visibility: "sync" })

console.log(`\nadded "${addKey}" to ${round.title}`)
