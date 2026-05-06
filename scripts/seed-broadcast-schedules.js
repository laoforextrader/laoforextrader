/**
 * Seed default broadcast schedules in Sanity:
 *   - ea-daily   (daily   at 21:00 ICT)
 *   - ea-weekly  (weekly  Saturday at 20:00 ICT)
 *   - ea-monthly (monthly day 1 at 21:00 ICT)
 *
 * Re-running upserts (createOrReplace by deterministic _id), so values
 * already changed in Studio (e.g. enabled=false) WILL be overwritten.
 * Use carefully or run once.
 *
 * Run: node scripts/seed-broadcast-schedules.js
 */
require("dotenv").config({ path: ".env.local" })
const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const schedules = [
  {
    _id: "broadcast-ea-daily",
    _type: "broadcastSchedule",
    key: "ea-daily",
    title: "EA Daily Report",
    enabled: true,
    template: "ea-summary",
    period: "daily",
    hour: 21,
    notes: "ສົ່ງສະຫຼຸບກຳໄລ EA ປະຈຳວັນ ທຸກວັນ 21:00 ICT",
  },
  {
    _id: "broadcast-ea-weekly",
    _type: "broadcastSchedule",
    key: "ea-weekly",
    title: "EA Weekly Report",
    enabled: true,
    template: "ea-summary",
    period: "weekly",
    hour: 20,
    dayOfWeek: 6, // Saturday
    notes: "ສົ່ງສະຫຼຸບກຳໄລ EA ປະຈຳອາທິດ ວັນເສົາ 20:00 ICT",
  },
  {
    _id: "broadcast-ea-monthly",
    _type: "broadcastSchedule",
    key: "ea-monthly",
    title: "EA Monthly Report",
    enabled: true,
    template: "ea-summary",
    period: "monthly",
    hour: 21,
    dayOfMonth: 1, // 1st of month
    notes: "ສົ່ງສະຫຼຸບກຳໄລ EA ປະຈຳເດືອນ ມື້ທີ 1 ຂອງເດືອນ 21:00 ICT",
  },
]

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ ບໍ່ພົບ SANITY_API_TOKEN")
    process.exit(1)
  }
  let ok = 0, fail = 0
  for (const s of schedules) {
    try {
      // Use createIfNotExists so we don't overwrite Studio edits
      await client.createIfNotExists(s)
      console.log(`✅ ${s.key} — ${s.title}`)
      ok++
    } catch (e) {
      console.error(`❌ ${s.key}:`, e.message)
      fail++
    }
  }
  console.log(`\n${ok} ok, ${fail} fail`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
