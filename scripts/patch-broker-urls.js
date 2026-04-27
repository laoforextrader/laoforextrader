/**
 * Patch existing broker documents in Sanity with affiliateUrl and registerUrl.
 * Run: SANITY_API_TOKEN=<token> node scripts/patch-broker-urls.js
 */
const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const URL_MAP = {
  "xm-global": {
    affiliateUrl: "https://affs.click/7MdNn",
    registerUrl: "https://affs.click/xXymd",
  },
  "markets4you": {
    affiliateUrl: "https://www.markets4you.online/?affid=xpkpced",
    registerUrl: "https://account.markets4you.online/th/user-registration/pro_stp_standard?account_client=mt5&affid=xpkpced",
  },
  "exness": {
    affiliateUrl: "https://one.exnessonelink.com/intl/th/a/tv2hiv2h",
    registerUrl: "https://one.exnessonelink.com/boarding/sign-up/303589/a/tv2hiv2h?lng=th",
  },
  "interstellar-group": {
    affiliateUrl: "https://my.interstellarfx-zh.net/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs",
    registerUrl: "https://my.interstellarfx-zh.net/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs",
  },
  "vantage": {
    affiliateUrl: "https://www.vantagemarkets.com/?affid=NzExNDc=&invitecode=P5bZtDbv",
    registerUrl: "https://www.vantagemarkets.com/open-live-account/?affid=NzExNDc=&invitecode=P5bZtDbv",
  },
  "iux": {
    affiliateUrl: "http://iux.com/en/register?code=NMP0eN4X",
    registerUrl: "http://iux.com/en/register?code=NMP0eN4X",
  },
}

async function patchBrokerUrls() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ ຕ້ອງໃສ່ SANITY_API_TOKEN\n   ຕົວຢ່າງ: SANITY_API_TOKEN=xxx node scripts/patch-broker-urls.js")
    process.exit(1)
  }

  const brokers = await client.fetch('*[_type == "broker"]{ _id, name, slug }')
  console.log(`🔍 ພົບ ${brokers.length} broker ໃນ Sanity\n`)

  for (const broker of brokers) {
    const slug = broker.slug?.current
    const urls = URL_MAP[slug]

    if (!urls) {
      console.log(`⚠️  ບໍ່ພົບ URL ສຳລັບ slug "${slug}" — ຂ້າມໄປ`)
      continue
    }

    await client.patch(broker._id).set(urls).commit()
    console.log(`✅ ${broker.name} — ອັບເດດ affiliateUrl + registerUrl ແລ້ວ`)
  }

  console.log("\n🎉 ສຳເລັດ! URL ທັງໝົດຖືກ patch ແລ້ວ")
}

patchBrokerUrls().catch(console.error)
