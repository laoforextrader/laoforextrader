/**
 * Seed Brokers Script — LaoForexTrader
 * ใส่ข้อมูล Broker ตัวอย่าง 6 ตัวเข้า Sanity
 *
 * วิธีใช้:
 * node scripts/seed-brokers.js
 */

const { createClient } = require("@sanity/client")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   "production",
  apiVersion: "2025-04-25",
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
})

const BROKERS = [
  {
    _id:    "broker-xm",
    name:   "XM Global",
    slug:   "xm-global",
    website: "https://www.xm.com",
    rating:  4.8,
    ratingBreakdown: { stability: 5, deposit: 4.5, spread: 4.5, support: 5, promotion: 5 },
    pros: [
      "ຝາກ-ຖອນ BCEL, JDB ໄດ້",
      "ໂບນັດ $30 ຟຣີ ສຳລັບຜູ້ເລີ່ມ",
      "Support ພາສາລາວ/ໄທ 24/5",
      "Spread ຕ່ຳ ເລີ່ມ 0.6 pip",
      "Regulated CySEC, ASIC, IFSC",
    ],
    cons: [
      "ບໍ່ຮອງຮັບ US clients",
      "Withdrawal ໃຊ້ເວລາ 1-3 ວັນ",
    ],
    minDeposit:  "$5",
    maxLeverage: "1:1000",
    regulators:  ["CySEC", "ASIC", "IFSC"],
    platforms:   ["MT4", "MT5", "WebTrader"],
    laoDeposit:  true,
    featured:    true,
    badge:       "top",
    excerpt:     "XM Global ເປັນ Broker ທີ່ໄດ້ຮັບຄວາມນິຍົມສູງສຸດໃນລາວ ຮອງຮັບຝາກ-ຖອນ BCEL ໂດຍກົງ ມີໂບນັດ $30 ຟຣີ ແລະ Spread ຕ່ຳ",
    body: [
      { _type: "block", _key: "b1", style: "h2", children: [{ _type: "span", _key: "s1", text: "ພາບລວມ XM Global", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b2", style: "normal", children: [{ _type: "span", _key: "s2", text: "XM Global ກໍ່ຕັ້ງໃນປີ 2009 ເປັນໜຶ່ງໃນ Broker Forex ທີ່ໃຫຍ່ທີ່ສຸດໃນໂລກ ມີລູກຄ້າກວ່າ 5 ລ້ານຄົນທົ່ວໂລກ ໄດ້ຮັບລາງວັນດີເດັ່ນຫຼາຍລາງວັນ ແລະ ໄດ້ຮັບໃບອະນຸຍາດຈາກ CySEC ແລະ ASIC", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b3", style: "h2", children: [{ _type: "span", _key: "s3", text: "ການຝາກ-ຖອນເງິນ", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b4", style: "normal", children: [{ _type: "span", _key: "s4", text: "ສຳລັບ Trader ລາວ ສາມາດຝາກ-ຖອນຜ່ານ BCEL One, JDB Mobile ໄດ້ໂດຍກົງ ຄ່າທຳນຽມ 0% ຖອນ Min $5 ເຂົ້າ-ອອກໄວ ພາຍໃນ 1-3 ວັນທຳການ", marks: [] }], markDefs: [] },
    ],
  },
  {
    _id:    "broker-exness",
    name:   "Exness",
    slug:   "exness",
    website: "https://www.exness.com",
    rating:  4.7,
    ratingBreakdown: { stability: 5, deposit: 5, spread: 4.5, support: 4.5, promotion: 4 },
    pros: [
      "ຖອນເງິນ Instant 24/7",
      "Spread ຕ່ຳທີ່ສຸດ ເລີ່ມ 0.0 pip",
      "Leverage ບໍ່ຈຳກັດ (Unlimited)",
      "Regulated FCA, CySEC, FSA",
      "ຝາກ-ຖອນ ຫຼາກຫຼາຍຊ່ອງທາງ",
    ],
    cons: [
      "ບໍ່ມີ Bonus ສຳລັບ account ໃໝ່",
      "Customer support ບາງຄັ້ງຊ້າ",
    ],
    minDeposit:  "$1",
    maxLeverage: "Unlimited",
    regulators:  ["FCA", "CySEC", "FSA", "CBCS"],
    platforms:   ["MT4", "MT5", "Exness App"],
    laoDeposit:  true,
    featured:    true,
    badge:       "recommended",
    excerpt:     "Exness ເດັ່ນດ້ວຍການຖອນເງິນ Instant 24/7 Spread ຕ່ຳທີ່ສຸດ ແລະ Leverage ບໍ່ຈຳກັດ ເໝາະສຳລັບ Trader ທີ່ຕ້ອງການ Execution ໄວ",
    body: [
      { _type: "block", _key: "b1", style: "h2", children: [{ _type: "span", _key: "s1", text: "ພາບລວມ Exness", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b2", style: "normal", children: [{ _type: "span", _key: "s2", text: "Exness ກໍ່ຕັ້ງໃນປີ 2008 ໄດ້ຮັບການຍອມຮັບທົ່ວໂລກໃນດ້ານຄວາມໂປ່ງໃສ ໄວໃນການ Execution ແລະ ການຖອນເງິນ Instant ທີ່ໄວທີ່ສຸດໃນອຸດສາຫະກຳ", marks: [] }], markDefs: [] },
    ],
  },
  {
    _id:    "broker-icmarkets",
    name:   "IC Markets",
    slug:   "ic-markets",
    website: "https://www.icmarkets.com",
    rating:  4.6,
    ratingBreakdown: { stability: 5, deposit: 4, spread: 5, support: 4.5, promotion: 3.5 },
    pros: [
      "Raw Spread ຕ່ຳທີ່ສຸດ 0.0 pip",
      "Execution ໄວ < 1ms",
      "Regulated ASIC, CySEC",
      "ເໝາະສຳລັບ Scalping, EA",
    ],
    cons: [
      "ບໍ່ມີ Bonus",
      "ຝາກຂັ້ນຕ່ຳ $200",
      "ບໍ່ຮອງຮັບ BCEL ໂດຍກົງ",
    ],
    minDeposit:  "$200",
    maxLeverage: "1:500",
    regulators:  ["ASIC", "CySEC", "SCB"],
    platforms:   ["MT4", "MT5", "cTrader"],
    laoDeposit:  false,
    featured:    true,
    badge:       "recommended",
    excerpt:     "IC Markets ເດັ່ນດ້ວຍ Raw Spread ຕ່ຳທີ່ສຸດ ເໝາະສຳລັບ Scalper ແລະ ຜູ້ໃຊ້ EA (Expert Advisor) ທີ່ຕ້ອງການ Execution ໄວ",
    body: [
      { _type: "block", _key: "b1", style: "h2", children: [{ _type: "span", _key: "s1", text: "ພາບລວມ IC Markets", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b2", style: "normal", children: [{ _type: "span", _key: "s2", text: "IC Markets ກໍ່ຕັ້ງໃນ Australia ປີ 2007 ໄດ້ຮັບຮາງວັນ Best ECN Broker ຫຼາຍປີ ມີ Spread ເລີ່ມ 0.0 pip ໃນ Raw account ແລະ Server ຕັ້ງຢູ່ NY4, LD5 ໃກ້ກັບ Liquidity Provider", marks: [] }], markDefs: [] },
    ],
  },
  {
    _id:    "broker-fbs",
    name:   "FBS",
    slug:   "fbs",
    website: "https://fbs.com",
    rating:  4.3,
    ratingBreakdown: { stability: 4, deposit: 4.5, spread: 4, support: 4.5, promotion: 5 },
    pros: [
      "ໂບນັດ 100% ທຸກຄັ້ງທີ່ຝາກ",
      "ຝາກຂັ້ນຕ່ຳ $1 ເທົ່ານັ້ນ",
      "ຮອງຮັບ Local payment ລາວ",
      "Cent account ສຳລັບ Beginner",
    ],
    cons: [
      "Spread ສູງກວ່າ Broker ອື່ນ",
      "Regulated IFSC ເທົ່ານັ້ນ",
      "ຄ່ານາຍໜ້າສູງ",
    ],
    minDeposit:  "$1",
    maxLeverage: "1:3000",
    regulators:  ["IFSC", "CySEC"],
    platforms:   ["MT4", "MT5", "FBS App"],
    laoDeposit:  true,
    featured:    false,
    badge:       "new",
    excerpt:     "FBS ເໝາະສຳລັບ Beginner ທີ່ມີທຶນໜ້ອຍ ຝາກຂັ້ນຕ່ຳ $1 ມີ Bonus 100% ແລະ Cent account ໃຫ້ຝຶກເທຣດ",
    body: [
      { _type: "block", _key: "b1", style: "h2", children: [{ _type: "span", _key: "s1", text: "ພາບລວມ FBS", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b2", style: "normal", children: [{ _type: "span", _key: "s2", text: "FBS ກໍ່ຕັ້ງໃນປີ 2009 ເປັນ Broker ທີ່ນິຍົມໃນ Southeast Asia ໂດຍສະເພາະໃນກຸ່ມ Beginner ທີ່ຕ້ອງການທຶນໜ້ອຍ", marks: [] }], markDefs: [] },
    ],
  },
  {
    _id:    "broker-aximtrade",
    name:   "Aximtrade",
    slug:   "aximtrade",
    website: "https://aximtrade.com",
    rating:  4.2,
    ratingBreakdown: { stability: 4, deposit: 4.5, spread: 4, support: 4, promotion: 4.5 },
    pros: [
      "ໂບນັດ Welcome $50 ຟຣີ",
      "ຮອງຮັບ Crypto deposit",
      "Cent account ສຳລັບ Beginner",
      "ຝາກ-ຖອນ Local bank ໄດ້",
    ],
    cons: [
      "Regulated IFSC ເທົ່ານັ້ນ",
      "Platform ໜ້ອຍກວ່າ Broker ໃຫຍ່",
    ],
    minDeposit:  "$1",
    maxLeverage: "1:2000",
    regulators:  ["IFSC"],
    platforms:   ["MT4"],
    laoDeposit:  true,
    featured:    false,
    badge:       "new",
    excerpt:     "Aximtrade ເໝາະສຳລັບ Beginner ຊາວລາວ ມີ Welcome Bonus $50 ຟຣີ ຮອງຮັບ Crypto ແລະ Local bank",
    body: [
      { _type: "block", _key: "b1", style: "h2", children: [{ _type: "span", _key: "s1", text: "ພາບລວມ Aximtrade", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b2", style: "normal", children: [{ _type: "span", _key: "s2", text: "Aximtrade ເປັນ Broker ທີ່ເຕີບໂຕໄວໃນ Southeast Asia ໂດຍສະເພາະໃນ Myanmar, Laos ແລະ Cambodia ດ້ວຍ Promotion ທີ່ດຶງດູດ", marks: [] }], markDefs: [] },
    ],
  },
  {
    _id:    "broker-iuxmarket",
    name:   "IUX Market",
    slug:   "iux-market",
    website: "https://iuxmarket.com",
    rating:  4.1,
    ratingBreakdown: { stability: 4, deposit: 4.5, spread: 4, support: 4, promotion: 4 },
    pros: [
      "ຮອງຮັບ PromptPay, QR Code",
      "ຝາກ-ຖອນໄວ ພາຍໃນ 5 ນາທີ",
      "Cent account",
      "Thai/Lao Support",
    ],
    cons: [
      "Regulated SVG ເທົ່ານັ້ນ",
      "ບໍ່ເປັນທີ່ຮູ້ຈັກໃນ EU/US",
    ],
    minDeposit:  "$1",
    maxLeverage: "1:1000",
    regulators:  ["SVG FSA"],
    platforms:   ["MT4", "MT5"],
    laoDeposit:  true,
    featured:    false,
    badge:       null,
    excerpt:     "IUX Market ເໝາະສຳລັບ Trader ລາວ-ໄທ ຮອງຮັບ Local payment ຫຼາຍຊ່ອງທາງ ຖອນໄວພາຍໃນ 5 ນາທີ",
    body: [
      { _type: "block", _key: "b1", style: "h2", children: [{ _type: "span", _key: "s1", text: "ພາບລວມ IUX Market", marks: [] }], markDefs: [] },
      { _type: "block", _key: "b2", style: "normal", children: [{ _type: "span", _key: "s2", text: "IUX Market ເປັນ Broker ທີ່ເໝາາຈ Trader ລາວ ແລະ ໄທ ໂດຍສະເພາະ ຮອງຮັບ Local payment ຫຼາຍຊ່ອງທາງ ຖອນໄວ ແລະ Support ພາສາລາວ-ໄທ", marks: [] }], markDefs: [] },
    ],
  },
]

async function seedBrokers() {
  console.log("🚀 ເລີ່ມ import Broker ເຂົ້າ Sanity...")
  console.log("📡 Project:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
  console.log("")

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.log("❌ ບໍ່ພົບ NEXT_PUBLIC_SANITY_PROJECT_ID ໃນ .env.local")
    process.exit(1)
  }

  if (!process.env.SANITY_API_TOKEN) {
    console.log("❌ ບໍ່ພົບ SANITY_API_TOKEN ໃນ .env.local")
    process.exit(1)
  }

  let success = 0
  let failed  = 0

  for (const broker of BROKERS) {
    const doc = {
      _id:   broker._id,
      _type: "broker",
      name:  broker.name,
      slug:  { _type: "slug", current: broker.slug },
      website:     broker.website,
      rating:      broker.rating,
      ratingBreakdown: broker.ratingBreakdown,
      pros:        broker.pros,
      cons:        broker.cons,
      minDeposit:  broker.minDeposit,
      maxLeverage: broker.maxLeverage,
      regulators:  broker.regulators,
      platforms:   broker.platforms,
      laoDeposit:  broker.laoDeposit,
      featured:    broker.featured,
      badge:       broker.badge,
      excerpt:     broker.excerpt,
      body:        broker.body,
    }

    try {
      await client.createOrReplace(doc)
      console.log("  ✓ " + broker.name + " (" + broker.rating + "/5" + (broker.featured ? " ★ featured" : "") + ")")
      success++
    } catch (err) {
      console.log("  ✗ " + broker.name + " — " + err.message)
      failed++
    }
  }

  console.log("")
  console.log("═══════════════════════════════════")
  console.log("✅ Import ສຳເລັດ : " + success + " Brokers")
  if (failed > 0)
    console.log("❌ ລົ້ມເຫຼວ     : " + failed + " Brokers")
  console.log("═══════════════════════════════════")
  console.log("")
  console.log("👉 ເປີດ localhost:3000/broker ເພື່ອເບິ່ງຜົນ")
  console.log("👉 ຈັດການໃນ Sanity Studio: localhost:3333")
}

seedBrokers().catch(function(err) {
  console.log("❌ Error:", err.message)
  process.exit(1)
})
