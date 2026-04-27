const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const BROKERS = [
  {
    _type: "broker",
    name: "XM Global",
    slug: { _type: "slug", current: "xm-global" },
    rating: 4.8,
    minDeposit: "5",
    maxLeverage: "1:1000",
    laoDeposit: true,
    regulation: "CySEC, ASIC, FSC Belize",
    platforms: "MT4, MT5",
    spread: "0.6 pip",
    depositMethods: ["Lao Bank", "Crypto"],
    founded: "2009",
    affiliateUrl: "https://affs.click/7MdNn",
    registerUrl: "https://affs.click/xXymd",
    featured: true,
    rank: 1,
    pros: [
      "ຝາກຂັ້ນຕ່ຳພຽງ $5",
      "ໂບນັດ $30 ສຳລັບສະມາຊິກໃໝ່",
      "Leverage ສູງສຸດ 1:1000",
      "ຮອງຮັບຝາກ-ຖອນ Lao Bank",
      "ມີ MT4 ແລະ MT5",
      "Copy Trading ຟຣີ",
    ],
    cons: [
      "Spread ສູງກວ່າ ECN Broker",
      "ບໍ່ມີ cTrader",
    ],
    description: "XM Global ແມ່ນໜຶ່ງໃນ Broker ທີ່ໃຫຍ່ທີ່ສຸດໃນໂລກ ກໍ່ຕັ້ງໃນປີ 2009 ມີລູກຄ້າຫຼາຍກວ່າ 15 ລ້ານຄົນໃນ 190+ ປະເທດ. ດ້ວຍການ Regulate ຈາກ CySEC, ASIC ແລະ FSC ທຳໃຫ້ XM ເປັນທີ່ໄວ້ໃຈໄດ້ສຳລັບ Trader ລາວ. ຂໍ້ດີໂດດເດັ່ນຄືຝາກຂັ້ນຕ່ຳ $5 ແລະ ໂບນັດ $30 ສຳລັບສະມາຊິກໃໝ່.",
  },
  {
    _type: "broker",
    name: "Markets4you",
    slug: { _type: "slug", current: "markets4you" },
    rating: 4.5,
    minDeposit: "1",
    maxLeverage: "1:1000",
    laoDeposit: true,
    regulation: "FSC Mauritius, FSA",
    platforms: "MT4, MT5",
    spread: "0.1 pip",
    depositMethods: ["Lao Bank", "Lao Bank USD", "Crypto"],
    founded: "2007",
    affiliateUrl: "https://www.markets4you.online/?affid=xpkpced",
    registerUrl: "https://account.markets4you.online/th/user-registration/pro_stp_standard?account_client=mt5&affid=xpkpced",
    featured: true,
    rank: 2,
    pros: [
      "ຝາກຂັ້ນຕ່ຳພຽງ $1",
      "ຮອງຮັບ Lao Bank ແລະ Lao Bank USD",
      "Spread ຕ່ຳ ເລີ່ມ 0.1 pip",
      "ມີ MT4 ແລະ MT5",
      "ໂບນັດ Welcome ສຳລັບລູກຄ້າໃໝ່",
    ],
    cons: [
      "ຍັງບໍ່ມີ Regulation ລະດັບ Top-tier",
      "Support ພາສາລາວຈຳກັດ",
    ],
    description: "Markets4you ກໍ່ຕັ້ງໃນປີ 2007 ເປັນ Broker ທີ່ໃຫ້ Spread ຕ່ຳ ແລະ ຮອງຮັບການຝາກ-ຖອນຜ່ານ Lao Bank ທັງ LAK ແລະ USD ເໝາະສຳລັບ Trader ລາວທີ່ຕ້ອງການ Leverage ສູງດ້ວຍທຶນນ້ອຍ.",
  },
  {
    _type: "broker",
    name: "Exness",
    slug: { _type: "slug", current: "exness" },
    rating: 4.7,
    minDeposit: "10",
    maxLeverage: "1:2000",
    laoDeposit: true,
    regulation: "FCA, CySEC, FSCA, FSA Seychelles",
    platforms: "MT4, MT5, Exness Terminal",
    spread: "0.0 pip",
    depositMethods: ["Lao Bank USD", "Crypto"],
    founded: "2008",
    affiliateUrl: "https://one.exnessonelink.com/intl/th/a/tv2hiv2h",
    registerUrl: "https://one.exnessonelink.com/boarding/sign-up/303589/a/tv2hiv2h?lng=th",
    featured: true,
    rank: 3,
    pros: [
      "Leverage ສູງສຸດ 1:2000",
      "ຖອນເງິນທັນທີ ພາຍໃນ 1 ວິນາທີ",
      "Spread ຕ່ຳ ເລີ່ມ 0.0 pip",
      "Regulate ໂດຍ FCA ແລະ CySEC ລະດັບສູງ",
      "Volume ການ Trade ສູງສຸດໃນໂລກ $4.8 Trillion/ເດືອນ",
    ],
    cons: [
      "ຝາກ Lao Bank ໄດ້ສະເພາະ USD",
      "ບໍ່ເໝາະສຳລັບ Beginner",
    ],
    description: "Exness ກໍ່ຕັ້ງໃນປີ 2008 ປັດຈຸບັນເປັນ Broker ທີ່ໃຫຍ່ທີ່ສຸດໃນໂລກໂດຍ Volume. ໂດດເດັ່ນດ້ວຍການຖອນເງິນທັນທີ Leverage ສູງ 1:2000 ແລະ Spread ເລີ່ມ 0.0 pip ເໝາະສຳລັບ Trader ລາວທີ່ຕ້ອງການຖອນເງິນໄວ.",
  },
  {
    _type: "broker",
    name: "Interstellar Group",
    slug: { _type: "slug", current: "interstellar-group" },
    rating: 4.3,
    minDeposit: "50",
    maxLeverage: "1:500",
    laoDeposit: true,
    regulation: "ASIC, FSC",
    platforms: "MT4, MT5",
    spread: "0.0 pip",
    depositMethods: ["Lao Bank", "Crypto"],
    founded: "2020",
    affiliateUrl: "https://my.interstellarfx-zh.net/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs",
    registerUrl: "https://my.interstellarfx-zh.net/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs",
    featured: true,
    rank: 4,
    pros: [
      "ຮອງຮັບຝາກ-ຖອນ Lao Bank",
      "Spread ຕ່ຳ ECN ຕົວຈິງ",
      "Execution ໄວ ບໍ່ມີ Slippage",
      "ຮອງຮັບ EA / Scalping",
    ],
    cons: [
      "ຝາກຂັ້ນຕ່ຳ $50",
      "Broker ຂ້ອນຂ້າງໃໝ່ ກໍ່ຕັ້ງ 2020",
    ],
    description: "Interstellar Group ເປັນ ECN Broker ທີ່ໃຫ້ Spread ໃກ້ 0 pip ເໝາະສຳລັບ Scalper ແລະ ຜູ້ໃຊ້ EA. ຮອງຮັບການຝາກ-ຖອນຜ່ານ Lao Bank ໂດຍກົງ ເໝາະສຳລັບ Trader ລາວທີ່ຕ້ອງການ Execution ທີ່ໄວ.",
  },
  {
    _type: "broker",
    name: "Vantage",
    slug: { _type: "slug", current: "vantage" },
    rating: 4.4,
    minDeposit: "50",
    maxLeverage: "1:500",
    laoDeposit: false,
    regulation: "ASIC, FCA, CIMA, FSCA",
    platforms: "MT4, MT5, TradingView",
    spread: "0.0 pip",
    depositMethods: ["Crypto"],
    founded: "2009",
    affiliateUrl: "https://www.vantagemarkets.com/?affid=NzExNDc=&invitecode=P5bZtDbv",
    registerUrl: "https://www.vantagemarkets.com/open-live-account/?affid=NzExNDc=&invitecode=P5bZtDbv",
    featured: true,
    rank: 5,
    pros: [
      "Regulate ໂດຍ ASIC ແລະ FCA ລະດັບສູງ",
      "ຮອງຮັບ TradingView",
      "ECN Spread ເລີ່ມ 0.0 pip",
      "ຮອງຮັບ Copy Trading",
      "ບໍ່ມີ Inactivity Fee",
    ],
    cons: [
      "ຝາກ-ຖອນ Lao Bank ບໍ່ໄດ້ ໃຊ້ Crypto ເທົ່ານັ້ນ",
      "ຝາກຂັ້ນຕ່ຳ $50",
    ],
    description: "Vantage ກໍ່ຕັ້ງໃນປີ 2009 Regulate ໂດຍ ASIC ແລະ FCA ລະດັບສູງ ເຫດໃຫ້ຄວາມໜ້າເຊື່ອຖືສູງ. ໂດດເດັ່ນດ້ວຍການຮອງຮັບ TradingView ແລະ Copy Trading. ສຳລັບ Trader ລາວຕ້ອງໃຊ້ Crypto ໃນການຝາກ-ຖອນ.",
  },
  {
    _type: "broker",
    name: "IUX",
    slug: { _type: "slug", current: "iux" },
    rating: 4.2,
    minDeposit: "10",
    maxLeverage: "1:3000",
    laoDeposit: true,
    regulation: "ASIC, FSC Mauritius, FSCA",
    platforms: "MT4, MT5, IUX Trade App",
    spread: "0.0 pip",
    depositMethods: ["Lao Bank"],
    founded: "2016",
    affiliateUrl: "http://iux.com/en/register?code=NMP0eN4X",
    registerUrl: "http://iux.com/en/register?code=NMP0eN4X",
    featured: true,
    rank: 6,
    pros: [
      "Leverage ສູງສຸດ 1:3000 ສູງທີ່ສຸດ",
      "ຮອງຮັບຝາກ-ຖອນ Lao Bank",
      "ຝາກຂັ້ນຕ່ຳ $10",
      "Spread ຕ່ຳຄົງທີ່ ແມ່ນໃນຊ່ວງ News",
      "App ໃຊ້ງ່າຍ ເໝາະ Beginner",
    ],
    cons: [
      "Regulate ຍັງບໍ່ທຽບເທົ່າ Top-tier",
      "ຈຳນວນ Instrument ຈຳກັດກວ່າ Exness",
    ],
    description: "IUX (ເດີມຊື່ IUX Markets) ກໍ່ຕັ້ງໃນປີ 2016 ໂດດເດັ່ນດ້ວຍ Leverage ສູງສຸດ 1:3000 ແລະ Spread ຄົງທີ່ແມ່ນໃນຊ່ວງ News. ຮອງຮັບ Lao Bank ໂດຍກົງ ເໝາະສຳລັບ Trader ລາວທີ່ຕ້ອງການ Leverage ສູງ.",
  },
]

async function deleteOldBrokers() {
  console.log("🗑️  ລຶບ Broker ເກົ່າ...")
  const old = await client.fetch('*[_type == "broker"]._id')
  if (old.length > 0) {
    await client.delete({ query: '*[_type == "broker"]' })
    console.log(`✅ ລຶບ ${old.length} Broker ເກົ່າແລ້ວ`)
  }
}

async function seedBrokers() {
  await deleteOldBrokers()
  console.log("🚀 ເພີ່ມ Broker ໃໝ່ 6 ຕົວ...")

  for (const broker of BROKERS) {
    const result = await client.create(broker)
    console.log(`✅ ${broker.name} (${broker.rating}★) — ${result._id}`)
  }

  console.log("\n🎉 ສຳເລັດ! Broker ທັງ 6 ຕົວ ໄດ້ຖືກເພີ່ມແລ້ວ")
}

seedBrokers().catch(console.error)
