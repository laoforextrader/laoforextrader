/**
 * Fill the `excerpt` field on every broker document.
 *
 * `buildBrokerMetadata` uses `broker.excerpt` as the page <meta description>
 * and falls back to "ລີວິວ <name> ຝາກຂັ້ນຕ່ຳ $<n>" when it's empty — which is
 * what all six brokers were serving. Search Console showed "interstellar
 * group" at 94 impressions / 0 clicks, and a description that thin gives a
 * searcher nothing to click for.
 *
 * Each excerpt below is built from that broker's OWN `description` field plus
 * its spread / leverage / minDeposit, trimmed to the ~155 chars Google renders.
 * Nothing here is invented — check the numbers against the Studio doc if a
 * broker changes its terms.
 *
 * Run: SANITY_API_TOKEN=<token> node scripts/patch-broker-excerpts.js
 *      SANITY_API_TOKEN=<token> node scripts/patch-broker-excerpts.js --dry
 */
const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const DRY = process.argv.includes("--dry")

// Keyed by slug.current. Keep each one 120–155 characters.
const EXCERPTS = {
  "xm-global":
    "ລີວິວ XM Global 2026 — Broker ໃຫຍ່ລະດັບໂລກ ລູກຄ້າ 15 ລ້ານຄົນ, Regulate CySEC/ASIC, Leverage 1:1000, Spread 0.6 pip, ໂບນັດ $30 ຟຣີ ສຳລັບ Trader ລາວ",

  "markets4you":
    "ລີວິວ Markets4you 2026 — ຝາກຂັ້ນຕ່ຳ $15, Leverage ສູງ 1:4000, ຮອງຮັບ Copy Trade ຕາມເທຣດເດີຜູ້ນຳ ແລະ ຝາກຖອນຜ່ານ BCEL ສຳລັບ Trader ລາວ",

  "exness":
    "ລີວິວ Exness 2026 — ຖອນເງິນທັນທີ 24/7, Spread ເລີ່ມ 0.0 pip, Leverage 1:2000, ຝາກຂັ້ນຕ່ຳ $10, Regulate FCA/CySEC ສຳລັບ Trader ລາວ",

  "interstellar-group":
    "ລີວິວ Interstellar Group 2026 — ECN Broker Spread ໃກ້ 0 pip, Leverage 1:2000, ຝາກຖອນຜ່ານ Lao Bank ໂດຍກົງ ເໝາະສຳລັບ Scalper ແລະ ຜູ້ຮັນ EA",

  "vantage":
    "ລີວິວ Vantage Markets 2026 — Regulate ASIC/FCA, Spread 0.0 pip, ຮອງຮັບ TradingView ແລະ Copy Trading, ຝາກຖອນຜ່ານ Crypto ສຳລັບ Trader ລາວ",

  "iux":
    "ລີວິວ IUX 2026 — Leverage ສູງສຸດ 1:3000, Spread ຄົງທີ່ແມ່ນໃນຊ່ວງຂ່າວ, ຝາກຂັ້ນຕ່ຳ $10, ຮອງຮັບ Lao Bank ໂດຍກົງ ສຳລັບ Trader ລາວ",
}

async function main() {
  if (!DRY && !process.env.SANITY_API_TOKEN) {
    console.error(
      "❌ ຕ້ອງໃສ່ SANITY_API_TOKEN\n" +
      "   ຕົວຢ່າງ: SANITY_API_TOKEN=xxx node scripts/patch-broker-excerpts.js\n" +
      "   ຫຼືເບິ່ງກ່ອນດ້ວຍ --dry",
    )
    process.exit(1)
  }

  for (const [slug, excerpt] of Object.entries(EXCERPTS)) {
    const len = [...excerpt].length
    const flag = len < 110 || len > 160 ? ` ⚠️ ${len} ຕົວ (ຄວນ 120–155)` : ` (${len} ຕົວ)`
    console.log(`\n${slug}${flag}\n  ${excerpt}`)
  }

  if (DRY) {
    console.log("\n— dry run, ບໍ່ໄດ້ຂຽນລົງ Sanity —")
    return
  }

  const brokers = await client.fetch('*[_type == "broker"]{ _id, name, slug, excerpt }')
  console.log(`\n🔍 ພົບ ${brokers.length} broker ໃນ Sanity\n`)

  for (const broker of brokers) {
    const slug = broker.slug?.current
    const excerpt = EXCERPTS[slug]

    if (!excerpt) {
      console.log(`⚠️  ບໍ່ພົບ excerpt ສຳລັບ slug "${slug}" — ຂ້າມໄປ`)
      continue
    }
    // Never clobber something written by hand in the Studio.
    if (broker.excerpt) {
      console.log(`⏭️  ${broker.name} — ມີ excerpt ຢູ່ແລ້ວ, ຂ້າມໄປ`)
      continue
    }

    await client.patch(broker._id).set({ excerpt }).commit()
    console.log(`✅ ${broker.name} — ໃສ່ excerpt ແລ້ວ`)
  }

  console.log("\n🎉 ສຳເລັດ! ໜ້າ /broker/* ຈະມີ meta description ເຕັມແລ້ວ")
}

main().catch(console.error)
