/**
 * One-off: ກຳນົດໃຫ້ Quiz 7 ຕ້ອງລ໋ອກອິນກ່ອນ
 * Run: node scripts/patch-quiz7-requireslogin.js
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

async function run() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ ບໍ່ພົບ SANITY_API_TOKEN")
    process.exit(1)
  }

  const res = await client
    .patch("quiz-q7")
    .set({ requiresLogin: true })
    .commit()

  console.log(`✅ Quiz 7 (${res._id}) — requiresLogin: ${res.requiresLogin}`)
}

run().catch((e) => {
  console.error("❌", e.message)
  process.exit(1)
})
