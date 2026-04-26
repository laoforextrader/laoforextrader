/**
 * Reset & Seed All Content — LaoForexTrader
 * 1. ລຶບ article ເກົ່າທັງໝົດ
 * 2. ສ້າງ Author ຫຼັກ
 * 3. ສ້າງບົດຄວາມໃໝ່ທຸກໝວດ (broker/news/analysis/ea-tools)
 * 4. ສ້າງບົດຮຽນ Forex ພື້ນຖານ 50 ບົດ
 *
 * node scripts/reset-and-seed-all.js
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

function block(key, text, style) {
  return {
    _type: "block", _key: "b" + key, style: style || "normal",
    children: [{ _type: "span", _key: "s" + key, text: text, marks: [] }],
    markDefs: [],
  }
}

function h2(key, text)  { return block(key, text, "h2") }
function p(key, text)   { return block(key, text, "normal") }

// ════════════════════════════════════════
// AUTHOR
// ════════════════════════════════════════
const AUTHOR = {
  _id:   "author-lft-team",
  _type: "author",
  name:  "LFT Team",
  slug:  { _type: "slug", current: "lft-team" },
  bio:   "ທີມງານ LaoForexTrader ຜູ້ຊ່ຽວຊານດ້ານ Forex, Crypto ແລະ ຕະຫຼາດການເງິນ ສຳລັບຄົນລາວ",
}

// ════════════════════════════════════════
// BROKER ARTICLES (5 ບົດ)
// ════════════════════════════════════════
const BROKER_ARTICLES = [
  {
    id: "art-broker-1", slug: "xm-global-review-2025",
    title: "XM Global ລີວິວ 2025: ດີທີ່ສຸດສຳລັບຄົນລາວ?",
    excerpt: "ທົດສອບຈິງ XM Global ໃນປີ 2025 ດ້ານການຝາກ-ຖອນ BCEL, Spread, ໂບນັດ ແລະ Support ພາສາລາວ",
    body: [
      h2(1, "XM Global ໃນ 2025 ຍັງດີໄຫມ?"),
      p(2, "XM Global ຍັງເປັນ Broker ທີ່ໄດ້ຮັບຄວາມໄວ້ວາງໃຈຈາກ Trader ລາວຈຳນວນຫຼາຍ ໂດຍສະເພາະດ້ານການຝາກ-ຖອນຜ່ານ BCEL ແລະ Support ພາສາລາວ-ໄທ 24/5"),
      h2(3, "ການຝາກ-ຖອນ BCEL"),
      p(4, "ສາມາດຝາກເງິນຜ່ານ BCEL One App ໄດ້ໂດຍກົງ ຂັ້ນຕ່ຳ $5 ເທົ່ານັ້ນ ຖອນເຂົ້າ BCEL ພາຍໃນ 24 ຊົ່ວໂມງ ຄ່າທຳນຽມ 0% ຈາກ XM"),
      h2(5, "Spread ແລະ ຄ່ານາຍໜ້າ"),
      p(6, "Standard Account: Spread ເລີ່ມ 1.6 pip / Ultra Low: ເລີ່ມ 0.6 pip ບໍ່ມີຄ່ານາຍໜ້າ Micro Account ເໝາະສຳລັບ Beginner ທີ່ຕ້ອງການ Lot ຂະໜາດນ້ອຍ"),
      h2(7, "ໂບນັດ $30 ຟຣີ"),
      p(8, "XM ໃຫ້ No-Deposit Bonus $30 ຟຣີ ສຳລັບ Account ໃໝ່ ໃຊ້ເທຣດໄດ້ຈິງ ຖອນກຳໄລໄດ້ຕາມເງື່ອນໄຂ ເໝາະສຳລັບຜູ້ທີ່ຕ້ອງການທົດລອງກ່ອນລົງທຶນ"),
      h2(9, "ສະຫຼຸບ"),
      p(10, "XM Global ຍັງເປັນທາງເລືອກທຳອິດສຳລັບ Trader ລາວ ໂດຍສະເພາະ Beginner ທີ່ຕ້ອງການ Broker ທີ່ໄວ້ໃຈໄດ້ ມີ Support ພາສາລາວ ແລະ ຮອງຮັບ Local payment"),
    ],
  },
  {
    id: "art-broker-2", slug: "exness-review-2025",
    title: "Exness ລີວິວ 2025: ຖອນເງິນ Instant ດີຈິງໄຫມ?",
    excerpt: "ທົດສອບ Exness ດ້ານ Spread, ການຖອນ Instant 24/7 ແລະ Leverage Unlimited ທີ່ເວົ້າເຖິງຫຼາຍທີ່ສຸດ",
    body: [
      h2(1, "Exness ຖອນ Instant ຈິງຫຼືບໍ?"),
      p(2, "ທົດສອບຖອນເງິນຜ່ານ Local payment ໃນລາວ ໄດ້ຮັບເງິນພາຍໃນ 5-15 ນາທີ ທຸກຊ່ວງເວລາ ລວມທັງ Weekend ນີ້ຄືຈຸດເດັ່ນທີ່ Exness ທຳໄດ້ດີທີ່ສຸດ"),
      h2(3, "Spread ທີ່ຕ່ຳທີ່ສຸດ"),
      p(4, "Exness Raw Spread Account ມີ Spread ເລີ່ມ 0.0 pip ໃນ EURUSD ມີຄ່ານາຍໜ້າ $3.5/lot ແຕ່ລ່ວມແລ້ວຖືກກວ່າ Standard ຫຼາຍ ສຳລັບຜູ້ທີ່ເທຣດ Volume ສູງ"),
      h2(5, "Leverage Unlimited ໃຊ້ໄດ້ຈິງໄຫມ?"),
      p(6, "Exness ສະເໜີ Leverage ບໍ່ຈຳກັດ (Unlimited) ສຳລັບ Account ທີ່ Equity < $1000 ຕ້ອງລະວັງ Risk Management ໃຫ້ດີ ໃຊ້ຜິດວິທີສາມາດຂາດທຶນໄດ້ໄວ"),
      h2(7, "ສະຫຼຸບ"),
      p(8, "Exness ເໝາະສຳລັບ Trader ທີ່ Execution ໄວ ຖອນໄວ Spread ຕ່ຳ ແຕ່ຕ້ອງລະວັງ Leverage ສູງ ຕ້ອງມີ Risk Management ທີ່ດີ"),
    ],
  },
  {
    id: "art-broker-3", slug: "xm-vs-exness-2025",
    title: "XM ທຽບ Exness 2025: ເລືອກ Broker ໃດດີກວ່າ?",
    excerpt: "ປຽບທຽບ XM Global ແລະ Exness ທຸກດ້ານ ຈາກ Trader ລາວທີ່ໃຊ້ທັງສອງ Broker ຕົວຈິງ",
    body: [
      h2(1, "XM vs Exness ໃຜຊະນະ?"),
      p(2, "ທັງສອງ Broker ມີຈຸດເດັ່ນຕ່າງກັນ ບໍ່ມີຄຳຕອບທີ່ຖືກທີ່ສຸດ ຂຶ້ນຢູ່ກັບ Style ການເທຣດຂອງແຕ່ລະຄົນ"),
      h2(3, "ປຽບທຽບ Spread"),
      p(4, "XM Standard: 1.6 pip | Exness Standard: 0.3-1.0 pip — Exness ຖືກກວ່າໃນ Standard Account. XM Ultra Low: 0.6 pip | Exness Raw: 0.0 pip — Exness ຍັງຖືກກວ່າ"),
      h2(5, "ປຽບທຽບ ຝາກ-ຖອນ"),
      p(6, "XM: BCEL, JDB, Bank Transfer | Exness: BCEL, PromptPay, Crypto ທັງສອງຮອງຮັບ Local payment ແຕ່ Exness ຖອນໄວກວ່າ (Instant vs 1-3 ວັນ)"),
      h2(7, "ສຳລັບ Beginner ເລືອກໃຜ?"),
      p(8, "ຖ້າເພີ່ງເລີ່ມ: XM ດີກວ່າ ເພາະ Bonus $30 ຟຣີ Support ພາສາລາວ ດີ ຝາກຂັ້ນຕ່ຳ $5. ຖ້າ Experienced: Exness ດີກວ່າ Spread ຕ່ຳ ຖອນໄວ"),
    ],
  },
  {
    id: "art-broker-4", slug: "ic-markets-review-2025",
    title: "IC Markets ລີວິວ: ດີທີ່ສຸດສຳລັບ EA ແລະ Scalping",
    excerpt: "IC Markets ເໝາະສຳລັບ Trader ທີ່ໃຊ້ EA ຫຼື Scalping ດ້ວຍ Raw Spread 0.0 pip ແລະ Execution ໄວ <1ms",
    body: [
      h2(1, "ທຳໄມ IC Markets ດີສຳລັບ EA?"),
      p(2, "IC Markets ໃຊ້ ECN Technology ທີ່ Server ຕັ້ງຢູ່ NY4 ແລະ LD5 ໃກ້ກັບ Liquidity Provider ທຳໃຫ້ Execution ໄວ < 1ms ເໝາະທີ່ສຸດສຳລັບ EA ທີ່ Scalp ໄວ"),
      h2(3, "Raw Spread Account"),
      p(4, "Spread ເລີ່ມ 0.0 pip ໃນ EURUSD ຄ່ານາຍໜ້າ $3.5/lot ຕ່ຳກວ່າ Broker ອື່ນ ເໝາະສຳລັບ High Volume Trader ທີ່ເທຣດ 10+ Lot/ມື້"),
      h2(5, "ຂໍ້ເສຍ"),
      p(6, "ຝາກຂັ້ນຕ່ຳ $200 ສູງກວ່າ XM/Exness ບໍ່ຮອງຮັບ BCEL ໂດຍກົງ ຕ້ອງຝາກຜ່ານ Wire Transfer ຫຼື Crypto ທຳໃຫ້ Beginner ເຂົ້າຫາຍາກ"),
    ],
  },
  {
    id: "art-broker-5", slug: "broker-lao-deposit-2025",
    title: "Broker ໃດຮອງຮັບຝາກ-ຖອນ BCEL ໃນ 2025?",
    excerpt: "ລາຍຊື່ Broker Forex ທີ່ຮອງຮັບຝາກ-ຖອນຜ່ານ BCEL One, JDB Mobile ສຳລັບ Trader ລາວ",
    body: [
      h2(1, "Broker ທີ່ຮອງຮັບ BCEL ໃນ 2025"),
      p(2, "ໜຶ່ງໃນຄຳຖາມທີ່ Trader ລາວຖາມຫຼາຍທີ່ສຸດຄື: ຝາກ-ຖອນ BCEL ໄດ້ກັບ Broker ໃດ? ນີ້ແມ່ນຂໍ້ມູນທີ່ອັບເດດ"),
      h2(3, "Broker ທີ່ຮອງຮັບ BCEL"),
      p(4, "1. XM Global — BCEL One ທັງຝາກ ແລະ ຖອນ ຄ່າທຳນຽມ 0%\n2. Exness — BCEL, PromptPay ຖອນ Instant\n3. FBS — BCEL, Local Transfer\n4. Aximtrade — Local Bank ລາວ\n5. IUX Market — Local payment ລາວ-ໄທ"),
      h2(5, "ວິທີຝາກ BCEL One"),
      p(6, "ໄປທີ່ Deposit > ເລືອກ Local Bank > ເລືອກ BCEL > ຕາມ QR Code ຫຼື Account Number > ໂອນຈາກ BCEL One App > ສ່ງ Slip ຢືນຢັນ > ຮັບເງິນພາຍໃນ 15-60 ນາທີ"),
    ],
  },
]

// ════════════════════════════════════════
// NEWS ARTICLES (5 ບົດ)
// ════════════════════════════════════════
const NEWS_ARTICLES = [
  {
    id: "art-news-1", slug: "fed-rate-2025-forex-impact",
    title: "Fed ປ່ຽນດອກເບ້ຍ 2025: ສົ່ງຜົນຕໍ່ Forex ແນວໃດ?",
    excerpt: "Fed ປ່ຽນທ່າທີດ້ານດອກເບ້ຍ ທ່ານ Trader ລາວຄວນຮູ້ຫຍັງ ແລະ ຄວນເທຣດ Pair ໃດໃນຊ່ວງນີ້",
    body: [
      h2(1, "Fed ຕັດສິນໃຈຫຍັງ?"),
      p(2, "Federal Reserve ຮັກສາດອກເບ້ຍໄວ້ທີ່ 5.25-5.50% ໃນກອງປະຊຸມລ່າສຸດ ສົ່ງສັນຍານວ່າຈະຄ່ອຍໆ ຫຼຸດໃນປີ 2025 ຖ້າ Inflation ລຸດລົງຕາມເປົ້າໝາຍ"),
      h2(3, "ຜົນກະທົບຕໍ່ Forex"),
      p(4, "USD ມີແນວໂນ້ມອ່ອນຕົວ ຖ້າ Fed ຫຼຸດດອກເບ້ຍ EURUSD, GBPUSD ມີໂອກາດຂຶ້ນ ໃນຂະນະທີ່ USDJPY ອາດຫຼຸດ ຄວນຕິດຕາມ NFP ແລະ CPI ທຸກເດືອນ"),
      h2(5, "ຄວນເທຣດ Pair ໃດ?"),
      p(6, "EURUSD ແລະ XAUUSD ເໝາະໃນຊ່ວງ USD ອ່ອນ ທອງຄຳມີແນວໂນ້ມຂຶ້ນໃນຊ່ວງດອກເບ້ຍ Real ຕ່ຳ ຄວນ Buy XAUUSD ທຸກຄັ້ງທີ່ Pullback"),
    ],
  },
  {
    id: "art-news-2", slug: "gold-xauusd-outlook-2025",
    title: "ທອງຄຳ XAUUSD 2025: ຈະຂຶ້ນ $3,000 ໄດ້ໄຫມ?",
    excerpt: "ວິເຄາະທ່າທາງທອງຄຳປີ 2025 ຈາກ Goldman Sachs, JP Morgan ຄາດ $3,000 ມີໂອກາດຫຼາຍສ່ຳໃດ",
    body: [
      h2(1, "Goldman Sachs ຄາດ XAUUSD $3,000"),
      p(2, "Goldman Sachs ຄາດການວ່າ XAUUSD ຈະຂຶ້ນໄປທົດສອບ $3,000 ໃນປີ 2025 ໂດຍໄດ້ຮັບແຮງຂັບຈາກ Central Bank ຊື້ທອງ, Fed ຫຼຸດດອກເບ້ຍ ແລະ ຄວາມຕ້ອງການ Safe Haven"),
      h2(3, "ປັດໄຈສຳຄັນທີ່ຊ່ວຍ"),
      p(4, "1. Central Bank ຊື້ທອງ Record High — ຈີນ, ອິນເດຍ, Turkey ຊື້ຫຼາຍ\n2. Fed ຫຼຸດດອກເບ້ຍ — Real Yield ຕ່ຳ ຊ່ວຍທອງ\n3. ຄວາມບໍ່ແນ່ນອນ Geopolitical — ສົງຄາມ, ຄວາມຂັດແຍ່ງ"),
      h2(5, "Strategy ສຳລັບ Trader ລາວ"),
      p(6, "Buy on dip XAUUSD ໃນ Zone $2,200-2,300 Stop Loss ຕ່ຳ $2,100 Target $2,500-2,800 ໃຊ້ Lot ໜ້ອຍໆ ເທຣດ Long-term ຕາມ Trend"),
    ],
  },
  {
    id: "art-news-3", slug: "bitcoin-halving-2025",
    title: "Bitcoin Halving 2025: Trader Forex ຄວນຮູ້ຫຍັງ?",
    excerpt: "Bitcoin Halving ເກີດຂຶ້ນທຸກ 4 ປີ ສົ່ງຜົນຕໍ່ Crypto ແລະ Risk Sentiment ໃນຕະຫຼາດ Forex ດ້ວຍ",
    body: [
      h2(1, "Bitcoin Halving ແມ່ນຫຍັງ?"),
      p(2, "ທຸກໆ 4 ປີ Bitcoin ຈະ Halving — ລາງວັນ Mining ຫຼຸດລົງ 50% ຂອງໃໝ່ຮັບຮອງໜ້ອຍລົງ ຖ້າ Demand ຄົງທີ່ ລາຄາມີແນວໂນ້ມຂຶ້ນ ຕາມ Economics ພື້ນຖານ"),
      h2(3, "ຜົນຕໍ່ Forex"),
      p(4, "ຖ້າ Bitcoin ຂຶ້ນ Risk Appetite ໃນຕະຫຼາດສູງ AUDUSD, NZDUSD ມັກຂຶ້ນ JPY ອ່ອນ ຖ້າ Bitcoin ຫຼຸດ Risk-off ເຂົ້າ Safe Haven USD, JPY ແຂງ"),
      h2(5, "ຄວນຈັດການ Portfolio ແນວໃດ?"),
      p(6, "ຢ່າ Over-leverage ໃນຊ່ວງ Halving ຄວາມຜັນຜວນສູງ ໃຊ້ SL ທຸກ Order ຖ້າຕ້ອງການ Exposure Crypto ຄວນ ≤10% ຂອງ Portfolio"),
    ],
  },
  {
    id: "art-news-4", slug: "usd-lak-exchange-rate-2025",
    title: "ອັດຕາແລກປ່ຽນ USD/LAK 2025: ແນວໂນ້ມຈາກ BOL",
    excerpt: "ອັດຕາ USD/LAK ແລະ ທ່າທາງ Kip ລາວໃນ 2025 ທ່ານຄວນຮູ້ກ່ອນໂອນ ຫຼື ເທຣດ Forex",
    body: [
      h2(1, "USD/LAK ໃນ 2025"),
      p(2, "ກີບລາວ (LAK) ຍັງຢູ່ພາຍໃຕ້ຄວາມກົດດັນ ຈາກ Trade Deficit ຂອງລາວ ແລະ ຄ່າ USD ທີ່ແຂງ ອັດຕາ BOL ຢູ່ທີ່ ~21,000-22,000 LAK/USD"),
      h2(3, "ທ່ານຄວນຮູ້ຫຍັງ?"),
      p(4, "ຖ້າຝາກ Forex ຜ່ານ BCEL ຈຳນວນ USD ທີ່ໄດ້ຂຶ້ນຢູ່ກັບ Rate ຂອງ BCEL ໃນວັນນັ້ນ ຄວນຝາກໃນຊ່ວງ USD ອ່ອນ ເພື່ອໄດ້ USD ຫຼາຍກວ່າ"),
      h2(5, "Strategy"),
      p(6, "Trader ລາວທີ່ Hold ກຳໄລ USD ໄວ້ຄວນ Convert ກ່ອນ USD ຫຼຸດ ຖ້າ USD ແຂງ ກ່ອນ Convert ຊ່ວງນັ້ນ ຈະໄດ້ LAK ຫຼາຍກວ່າ"),
    ],
  },
  {
    id: "art-news-5", slug: "forex-scam-lao-2025",
    title: "ລະວັງ! Forex Scam ໃນລາວ 2025 ທີ່ຄວນຮູ້",
    excerpt: "ລາຍຊື່ Scam Forex ທີ່ລະບາດໃນລາວ ວິທີສັງເກດ ແລະ ປ້ອງກັນຕົວເອງຈາກການໂດນຫຼອກ",
    body: [
      h2(1, "Forex Scam ທົ່ວໄປໃນລາວ"),
      p(2, "ຫຼາຍຄົນສູນເສຍເງິນຈາກ Forex Scam ໃນຮູບແບບຕ່າງໆ ທັງ Signal ປອມ, Platform ປອມ, ແລະ Copy Trade ທີ່ຫຼອກລວງ"),
      h2(3, "ຮູບແບບ Scam ທີ່ພົບຫຼາຍ"),
      p(4, "1. Signal ຮ້ານ Telegram — ຮ້ອງ Win Rate 90%+ ບໍ່ເປັນຄວາມຈິງ\n2. Platform ປອມ — ບໍ່ Regulated, ຖອນໄມ່ໄດ້\n3. Managed Account — ໃຫ້ຜູ້ອື່ນເທຣດ ສ່ວນໃຫຍ່ Scam\n4. Ponzi ໃນຊື່ Forex — ສັນຍາ Return ສູງ ບໍ່ຮ່ອງຮອງ"),
      h2(5, "ວິທີປ້ອງກັນ"),
      p(6, "ໃຊ້ Broker ທີ່ Regulated (FCA, ASIC, CySEC) ທຸກເທື່ອ ຢ່າໃຫ້ຜູ້ໃດ Access ເຂົ້າ Account ຂອງທ່ານ ຖ້ານ້ຳໃຈດີເກີນ 100% ຕ້ອງລະວັງ"),
    ],
  },
]

// ════════════════════════════════════════
// ANALYSIS ARTICLES (5 ບົດ)
// ════════════════════════════════════════
const ANALYSIS_ARTICLES = [
  {
    id: "art-analysis-1", slug: "xauusd-weekly-analysis",
    title: "XAUUSD ວິເຄາະລາຍອາທິດ: Support/Resistance ສຳຄັນ",
    excerpt: "ວິເຄາະ Technical XAUUSD Zone ສຳຄັນ Trend ຫຼັກ ແລະ Setup ການເທຣດສຳລັບອາທິດນີ້",
    body: [
      h2(1, "XAUUSD Trend ລາຍອາທິດ"),
      p(2, "XAUUSD Trend ຫຼັກຍັງເປັນ Bullish ໃນ Timeframe W1 ລາຄາຢູ່ເທິງ MA200 ແລະ Uptrend Line ຈາກ 2022 ຈຸດ Support ສຳຄັນ $2,280-2,300"),
      h2(3, "Zone ສຳຄັນ"),
      p(4, "Support: $2,280 / $2,250 / $2,200\nResistance: $2,350 / $2,400 / $2,500\nຖ້າລາຄາ Break $2,350 ໄດ້ຢ່າງໜັກແໜ້ນ ໂອກາດໄປ $2,400+ ສູງ"),
      h2(5, "Setup ການເທຣດ"),
      p(6, "Buy Zone: $2,280-2,300\nStop Loss: $2,250\nTarget 1: $2,350\nTarget 2: $2,400\nRisk:Reward = 1:2 ຂຶ້ນໄປ"),
    ],
  },
  {
    id: "art-analysis-2", slug: "eurusd-monthly-analysis",
    title: "EURUSD ວິເຄາະລາຍເດືອນ: ECB vs Fed ໃຜຊະນະ?",
    excerpt: "ວິເຄາະ EURUSD ຈາກ Fundamental ແລະ Technical ທ່າທາງ ECB ແລະ Fed ໃນຊ່ວງ Q2 2025",
    body: [
      h2(1, "EURUSD ໃນ Q2 2025"),
      p(2, "EURUSD ຢູ່ໃນຊ່ວງ Consolidation ລະຫວ່າງ 1.06-1.10 Fundamental ຂຶ້ນຢູ່ກັບ ECB ຫຼຸດດອກເບ້ຍ ເທີ່ຍ ໃດກ່ອນ Fed"),
      h2(3, "Fundamental Analysis"),
      p(4, "ECB ຫຼຸດດອກເບ້ຍ 0.25% ໃນ June 2024 ເປັນທຳອິດ Fed ຍັງຮັກສາ ຖ້າ ECB ຫຼຸດຕໍ່ ໂດຍ Fed ຍັງບໍ່ຫຼຸດ EUR ຈະຮັດ"),
      h2(5, "Technical Setup"),
      p(6, "Buy ຖ້າ Break 1.0950 ຢ່າງໜັກ Target 1.1050\nSell ຖ້າ Break 1.0800 ລົງ Target 1.0700\nRSI ໃກ້ 50 ຍັງ Neutral ຕ້ອງລໍຖ້າ Signal ຊັດ"),
    ],
  },
  {
    id: "art-analysis-3", slug: "usdjpy-boj-analysis",
    title: "USDJPY ວິເຄາະ: BOJ ຈະຂຶ້ນດອກເບ້ຍ Yen ຈະແຂງໄຫມ?",
    excerpt: "ວິເຄາະ USDJPY ໃນຊ່ວງ BOJ ປ່ຽນນະໂຍບາຍ ທ່າທາງ Yen ແລະ Strategy ການເທຣດ",
    body: [
      h2(1, "BOJ ປ່ຽນນະໂຍບາຍ"),
      p(2, "Bank of Japan ຂຶ້ນດອກເບ້ຍ ສຳລັບທຳອິດໃນ 17 ປີ ສ່ງສັນຍານ End of Negative Rate ຊ່ວຍ Yen ໃນໄລຍະຍາວ"),
      h2(3, "USDJPY Technical"),
      p(4, "USDJPY ທົດສອບ Zone 151-152 ຫຼາຍຄັ້ງ ຖ້າ BOJ Intervention ຈ່ຍ ຈຸດ Break ທີ່ 148 ລົງ ໂອກາດ Sell ໄປ 142"),
      h2(5, "Strategy"),
      p(6, "Sell USDJPY ໃນ Zone 151-152 SL 154 Target 148/145 ຄວນ Follow ຂ່າວ BOJ ຢ່າງໃກ້ຊິດ Intervention ສາມາດເກີດໄດ້ທຸກເວລາ"),
    ],
  },
  {
    id: "art-analysis-4", slug: "forex-seasonal-pattern",
    title: "Seasonal Pattern Forex: ໄຕມາດ 2 ຄວນເທຣດ Pair ໃດ?",
    excerpt: "ຮູບແບບ Seasonal ທີ່ເກີດຊ້ຳໃນ Forex ທຸກໆ ປີ ຊ່ວຍ Trader ວາງແຜນໄດ້ລ່ວງໜ້າ",
    body: [
      h2(1, "Seasonal Pattern ໃນ Forex"),
      p(2, "Forex ມີຮູບແບບ Seasonal ທີ່ເກີດຊ້ຳທຸກໆ ປີ ຮູ້ Pattern ນີ້ຊ່ວຍຫຼຸດ Risk ແລະ ເພີ່ມໂອກາດກຳໄລ"),
      h2(3, "Q2 (April-June) Pattern"),
      p(4, "USD ມັກອ່ອນໃນ April-May / EURUSD ມັກ Rally ໃນ April / JPY ມັກແຂງໃນ May (Risk-off) / XAUUSD ມັກ Correction ໃນ April"),
      h2(5, "ວິທີໃຊ້ Seasonal Pattern"),
      p(6, "ໃຊ້ Pattern ເປັນ Background Bias ເທົ່ານັ້ນ ບໍ່ໃຊ້ເທຣດຢ່າງດຽວ ລວມກັບ Technical ແລະ Fundamental ຈຶ່ງ Entry"),
    ],
  },
  {
    id: "art-analysis-5", slug: "dxy-dollar-index-analysis",
    title: "Dollar Index (DXY) ວິເຄາະ: ທ່າທາງ USD ໃນ 2025",
    excerpt: "ວິເຄາະ DXY ດັດຊະນີ Dollar ທ່ວາໄປ ຊ່ວຍຄາດ USD ກ່ຽວກັບ EURUSD GBPUSD XAUUSD",
    body: [
      h2(1, "DXY ສຳຄັນຫຍັງ?"),
      p(2, "Dollar Index (DXY) ວັດຄ່າ USD ທຽບ 6 ສະກຸນເງິນຫຼັກ EUR, JPY, GBP, CAD, SEK, CHF ຖ້າ DXY ຂຶ້ນ ໝາຍຄວາມວ່າ USD ແຂງ ທອງຄຳ ແລະ Commodity ມັກຫຼຸດ"),
      h2(3, "DXY Technical"),
      p(4, "DXY Zone 102-104 ເປັນ Key Range ຖ້າ Break 106 ຂຶ້ນ USD ຈະແຂງໜັກ ກົດ EURUSD/XAUUSD ຖ້າ Break 100 ລົງ USD ຈະອ່ອນ ຊ່ວຍ EURUSD/XAUUSD"),
      h2(5, "ວິທີໃຊ້ DXY"),
      p(6, "ກ່ອນ Trade ໃດໆ Check DXY ກ່ອນ ຖ້າ DXY ຂຶ້ນ ຫຼີກລ່ຽງ Buy EURUSD/XAUUSD ຖ້າ DXY ຫຼຸດ ຫຼີກລ່ຽງ Sell EURUSD/XAUUSD"),
    ],
  },
]

// ════════════════════════════════════════
// EA/TOOLS ARTICLES (3 ບົດ)
// ════════════════════════════════════════
const EA_ARTICLES = [
  {
    id: "art-ea-1", slug: "what-is-expert-advisor-ea",
    title: "EA (Expert Advisor) ແມ່ນຫຍັງ? ເຮັດວຽກແນວໃດ?",
    excerpt: "ຮູ້ຈັກ EA Robot Forex ທີ່ເທຣດອັດຕະໂນມັດ ຂໍ້ດີ ຂໍ້ເສຍ ແລະ ຄວນໃຊ້ຫຼືບໍ?",
    body: [
      h2(1, "EA ແມ່ນຫຍັງ?"),
      p(2, "Expert Advisor (EA) ຫຼື Trading Robot ແມ່ນໂປຣແກຣມທີ່ເທຣດ Forex ອັດຕະໂນມັດ ຕາມ Rule ທີ່ກຳນົດ ໂດຍບໍ່ຕ້ອງໃຊ້ຄົນນັ່ງເທຣດ"),
      h2(3, "EA ເຮັດວຽກແນວໃດ?"),
      p(4, "EA ໃຊ້ Algorithm ໃນການຕັດສິນໃຈ Entry, Exit ອີງຕາມ Indicator, Price Action ຫຼື Pattern ທີ່ Programming ໄວ້ ຕ້ອງຕິດຕັ້ງໃນ MT4/MT5"),
      h2(5, "ຄວນໃຊ້ EA ໄຫມ?"),
      p(6, "EA ດີ ຖ້າ: Backtest ດີ ຫຼາຍ 3+ ປີ | Risk Management ດີ | ບໍ່ Overfit. EA ບໍ່ດີ ຖ້າ: Win Rate 95%+ (ບໍ່ຈິງ) | ບໍ່ມີ Drawdown ຂໍ້ມູນ | ຜູ້ຂາຍ Guarantee ກຳໄລ"),
    ],
  },
  {
    id: "art-ea-2", slug: "mt4-vs-mt5-comparison",
    title: "MT4 ທຽບ MT5: ຄວນໃຊ້ Platform ໃດ?",
    excerpt: "ປຽບທຽບ MetaTrader 4 ແລະ MetaTrader 5 ທຸກດ້ານ ຊ່ວຍຕັດສິນໃຈວ່າ Platform ໃດເໝາະສຳລັບທ່ານ",
    body: [
      h2(1, "MT4 vs MT5 ຕ່າງກັນຫຍັງ?"),
      p(2, "MT4 ຍັງນິຍົມທີ່ສຸດ ມີ EA ຫຼາຍທີ່ສຸດ Interface ງ່າຍ MT5 ໃໝ່ກວ່າ ມີ Timeframe ຫຼາຍກວ່າ ຮອງຮັບ Stock/Futures ດ້ວຍ"),
      h2(3, "ຄວນເລືອກ MT4 ຖ້າ"),
      p(4, "ໃໝ່ | ຕ້ອງການ EA ຫຼາຍ | Broker ໃຫ້ MT4 ເທົ່ານັ້ນ | Scalping ຫຼື Manual Trading"),
      h2(5, "ຄວນເລືອກ MT5 ຖ້າ"),
      p(6, "ຕ້ອງການ Hedging | ເທຣດ Stocks ດ້ວຍ | ຕ້ອງການ Depth of Market | Broker ສະໜັບສະໜູນ MT5"),
    ],
  },
  {
    id: "art-ea-3", slug: "vps-for-forex-ea",
    title: "VPS Forex ແມ່ນຫຍັງ? ຄວນໃຊ້ VPS ໃດສຳລັບ EA?",
    excerpt: "ຮູ້ຈັກ VPS (Virtual Private Server) ສຳລັບ Forex EA ວິທີເລືອກ ແລະ ຕິດຕັ້ງ",
    body: [
      h2(1, "VPS ສຳລັບ Forex ແມ່ນຫຍັງ?"),
      p(2, "VPS ແມ່ນ Server ທີ່ Run 24/7 ໂດຍບໍ່ຕ້ອງເປີດ PC ຂອງທ່ານ ເໝາະສຳລັບ EA ທີ່ຕ້ອງ Run ຕະຫຼອດ ໂດຍບໍ່ຕ້ອງກັງວົນ Disconnect"),
      h2(3, "VPS ທີ່ແນະນຳ"),
      p(4, "Cheapest: Contabo VPS S (~$5/month) | Best for Forex: ForexVPS (~$20/month) | XM Free VPS: ສຳລັບ Client XM ທີ່ Equity >$5000"),
      h2(5, "ວິທີຕິດຕັ້ງ"),
      p(6, "1. ສັ່ງ VPS Windows | 2. Remote Desktop ເຂົ້າ | 3. ດາວໂຫຼດ MT4/MT5 | 4. Login Broker | 5. Load EA | 6. VPS Run 24/7 ໂດຍອັດຕະໂນມັດ"),
    ],
  },
]

console.log("✅ Article data loaded")

// ════════════════════════════════════════
// FOREX EDUCATION 50 ບົດ
// ════════════════════════════════════════
const FOREX_LESSONS = [
  // ── ພາກທີ 1: ພື້ນຖານ Forex (10 ບົດ) ──
  { n:1,  slug:"what-is-forex",            title:"Forex ແມ່ນຫຍັງ? ຕະຫຼາດການເງິນທີ່ໃຫຍ່ທີ່ສຸດໃນໂລກ",
    body:[h2(1,"Forex ແມ່ນຫຍັງ?"),p(2,"Forex ຫຼື Foreign Exchange ແມ່ນຕະຫຼາດແລກປ່ຽນສະກຸນເງິນ ມີປະລິມານການຊື້ຂາຍ >$7.5 Trillion/ວັນ ເປັນຕະຫຼາດທີ່ໃຫຍ່ ແລະ Liquid ທີ່ສຸດໃນໂລກ"),h2(3,"ໃຜເທຣດ Forex?"),p(4,"Central Bank, Commercial Bank, Hedge Fund, Institution ແລະ Retail Trader ຄືພວກເຮົາ Retail ໃຊ້ Broker ເປັນສື່ກາງ"),h2(5,"Forex ເປີດ-ປິດ ເວລາໃດ?"),p(6,"Forex ເປີດ 24 ຊົ່ວໂມງ 5 ວັນ/ອາທິດ ແບ່ງ 4 Session: Sydney, Tokyo, London, New York ທີ່ Overlap ກັນ London+NY ຄືຊ່ວງ Active ທີ່ສຸດ")] },
  { n:2,  slug:"currency-pairs-basics",    title:"Currency Pair ແມ່ນຫຍັງ? Major, Minor, Exotic",
    body:[h2(1,"Currency Pair ແມ່ນຫຍັງ?"),p(2,"ໃນ Forex ເທຣດເປັນຄູ່ສະກຸນເງິນ ເຊັ່ນ EURUSD ໝາຍຄວາມວ່າ ຊື້ EUR ໂດຍໃຊ້ USD. Base Currency / Quote Currency"),h2(3,"Major Pairs"),p(4,"EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD Spread ຕ່ຳທີ່ສຸດ Liquid ທີ່ສຸດ"),h2(5,"ຄວນເລີ່ມຈາກ Pair ໃດ?"),p(6,"EURUSD ດີທີ່ສຸດສຳລັບ Beginner Spread ຕ່ຳ ຂໍ້ມູນຫຼາຍ ເໝາະກັບການຮຽນ Technical")] },
  { n:3,  slug:"bid-ask-spread-explained", title:"Bid, Ask, Spread ແມ່ນຫຍັງ? ຄ່ານາຍໜ້າທີ່ Trader ຕ້ອງຮູ້",
    body:[h2(1,"Bid vs Ask"),p(2,"Bid = ລາຄາທີ່ Broker ຊື້ຈາກທ່ານ (ທ່ານ Sell) | Ask = ລາຄາທີ່ Broker ຂາຍໃຫ້ທ່ານ (ທ່ານ Buy) | Spread = Ask - Bid ຄືຄ່ານາຍໜ້າ"),h2(3,"Spread ສຳຄັນຫຍັງ?"),p(4,"Spread ຄືຄ່າໃຊ້ຈ່າຍທຸກຄັ້ງທີ່ເທຣດ EURUSD Spread 1 pip ໝາຍຄວາມວ່າ ທ່ານ Start ດ້ວຍ -$10/Standard Lot"),h2(5,"ເລືອກ Broker Spread ຕ່ຳ"),p(6,"Exness Raw: 0.0 pip | IC Markets Raw: 0.0 pip | XM Ultra Low: 0.6 pip ສຳລັບ Scalper ໃຊ້ Raw Account ດີກວ່າ")] },
  { n:4,  slug:"pip-lot-size-explained",   title:"Pip ແລະ Lot Size ແມ່ນຫຍັງ? ຄຳນວນກຳໄລ-ຂາດທຶນ",
    body:[h2(1,"Pip ແມ່ນຫຍັງ?"),p(2,"Pip ຄືໜ່ວຍການເຄື່ອນໄຫວລາຄາ EURUSD 1.0800→1.0801 = 1 pip USDJPY 154.00→154.01 = 1 pip (JPY Pairs ໃຊ້ 2 Decimal)"),h2(3,"Lot Size"),p(4,"Standard Lot = 100,000 units | Mini Lot = 10,000 units | Micro Lot = 1,000 units. 1 pip Standard Lot EURUSD = $10"),h2(5,"ຄຳນວນກຳໄລ"),p(6,"ຕົວຢ່າງ: Buy EURUSD 0.1 lot, ໄດ້ 50 pip ກຳໄລ = 50 × $1 = $50 ໃຊ້ Pip Calculator ໃນ LFT Tools ຊ່ວຍຄຳນວນ")] },
  { n:5,  slug:"leverage-margin-explained",title:"Leverage ແລະ Margin ແມ່ນຫຍັງ? ໃຊ້ຢ່າງໄລ?",
    body:[h2(1,"Leverage ແມ່ນຫຍັງ?"),p(2,"Leverage ຊ່ວຍໃຫ້ທ່ານ Control ເງິນຫຼາຍກວ່າ Capital ຕົວຈິງ Leverage 1:100 = ທຶນ $1 Control ໄດ້ $100 ທັງໄດ້ ທັງສູນ ຄູນ 100"),h2(3,"Margin ແມ່ນຫຍັງ?"),p(4,"Margin ຄືເງິນ Deposit ທີ່ Broker ຄ້ຳໄວ້ Leverage 1:100, ເທຣດ 1 Lot EURUSD (~$100,000) ຕ້ອງ Margin $1,000"),h2(5,"ໃຊ້ Leverage ຢ່າງຈະຮຸ"),p(6,"Beginner: ໃຊ້ Leverage 1:10 ຫຼື 1:20 ຈຶ່ງ | Intermediate: 1:50 | Expert: ບໍ່ເກີນ 1:100 ຢ່າ Over-leverage ແມ່ນ ຂໍ້ 1 ທີ່ຂ້າ Trader")] },
  { n:6,  slug:"long-short-buy-sell",      title:"Long vs Short, Buy vs Sell ໃນ Forex ຕ່າງກັນຫຍັງ?",
    body:[h2(1,"Buy (Long) ແມ່ນຫຍັງ?"),p(2,"Buy ຫຼື Long ໝາຍຄວາມວ່າ ທ່ານຄາດຄະເນວ່າລາຄາຈະ ຂຶ້ນ ກຳໄລຖ້າລາຄາຂຶ້ນ ຂາດທຶນຖ້າລາຄາຫຼຸດ"),h2(3,"Sell (Short) ແມ່ນຫຍັງ?"),p(4,"Sell ຫຼື Short ໝາຍຄວາມວ່າ ທ່ານຄາດຄະເນວ່າລາຄາຈະ ຫຼຸດ ກຳໄລຖ້າລາຄາຫຼຸດ ຂາດທຶນຖ້າລາຄາຂຶ້ນ"),h2(5,"ໃນ Forex ສາມາດ Short ໄດ້ຟຣີ"),p(6,"ຕ່າງຈາກ Stock ທີ່ Short ຍາກ Forex ສາມາດ Buy ຫຼື Sell ໄດ້ຕະຫຼອດ ໃນຄ່ານາຍໜ້າທີ່ເທົ່າກັນ")] },
  { n:7,  slug:"forex-market-sessions",    title:"Forex Market Sessions: London, NY, Tokyo ຄວນເທຣດຊ່ວງໃດ?",
    body:[h2(1,"4 Major Sessions"),p(2,"Sydney (5:00-14:00 GMT) | Tokyo (0:00-9:00 GMT) | London (8:00-17:00 GMT) | New York (13:00-22:00 GMT) ເວລາລາວ +7 ຊົ່ວໂມງ"),h2(3,"ຊ່ວງ Active ທີ່ສຸດ"),p(4,"London-NY Overlap (13:00-17:00 GMT / 20:00-00:00 ລາວ) Volatility ສູງທີ່ສຸດ Spread ຕ່ຳທີ່ສຸດ ໂອກາດ Breakout ຫຼາຍ"),h2(5,"Beginner ຄວນເທຣດຊ່ວງໃດ?"),p(6,"London Session (15:00-21:00 ລາວ) ດີ ມີ Signal ຊັດ Volume ສູງ ຫຼີກລ່ຽງ Asia Session ເວລາ Spread ກວ້າງ ແລະ ຊ້າ")] },
  { n:8,  slug:"fundamental-vs-technical", title:"Fundamental vs Technical Analysis ຕ່າງກັນຫຍັງ?",
    body:[h2(1,"Fundamental Analysis"),p(2,"ວິເຄາະຈາກ Economic Data: GDP, Inflation (CPI), Interest Rate, NFP ຊ່ວຍເຂົ້າໃຈ ທ່ານ ທ່ວາໄປ ຊ່ວງ Long-term"),h2(3,"Technical Analysis"),p(4,"ວິເຄາະຈາກ Chart ລາຄາ: Pattern, Indicator, Support/Resistance ໃຊ້ Entry/Exit ທີ່ຊັດ ໃນ Short-term"),h2(5,"ໃຊ້ທັງສອງ"),p(6,"Professional ໃຊ້ Fundamental ໃຫ້ Bias ລ່ວງໜ້າ ແລ້ວໃຊ້ Technical ຊ່ວຍ Timing Entry ຊ່ວງທີ່ Risk:Reward ດີທີ່ສຸດ")] },
  { n:9,  slug:"economic-calendar-guide",  title:"Economic Calendar ຄວນ Follow ຂ່າວໃດ? ສຳຄັນທີ່ສຸດ",
    body:[h2(1,"ຂ່າວ High Impact"),p(2,"NFP (Non-Farm Payroll) ທຸກ Friday ທຳອິດຂອງເດືອນ | FOMC (Fed Meeting) 8x/ປີ | CPI Inflation | GDP | Central Bank Decision"),h2(3,"ວິທີໃຊ້ Economic Calendar"),p(4,"ກ່ອນຂ່າວ High Impact 30 ນາທີ: ຫຼຸດ Position ຫຼື ຢ່າ Open ໃໝ່ ຫຼັງຂ່າວ: ລໍຖ້າ Dust Settle 10-15 ນາທີ ຈຶ່ງ Entry"),h2(5,"ແຫຼ່ງ Economic Calendar"),p(6,"Forexfactory.com ດີທີ່ສຸດ ຟຣີ Investing.com ກໍ່ດີ ຕັ້ງ Alert ກ່ອນຂ່າວ High Impact ທຸກຄັ້ງ")] },
  { n:10, slug:"forex-broker-how-to-choose",title:"ວິທີເລືອກ Broker Forex ທີ່ດີ ຫຼີກລ່ຽງ Scam",
    body:[h2(1,"Broker ທີ່ດີຕ້ອງມີຫຍັງ?"),p(2,"1. Regulated (FCA, ASIC, CySEC) | 2. Spread ຕ່ຳ | 3. Withdrawal ໄວ | 4. Support ດີ | 5. ຮອງຮັບ Local Payment"),h2(3,"ສັນຍານ Scam Broker"),p(4,"Guarantee ກຳໄລ | ບໍ່ Regulated | ຖອນໄດ້ຍາກ | Bonus ເງື່ອນໄຂຫຼາຍ | ບໍ່ມີ Company Address ຈິງ"),h2(5,"ຄຳແນະນຳ"),p(6,"Beginner: XM, Exness, FBS | Advanced: IC Markets, Pepperstone ຢ່າໃຊ້ Broker ທີ່ Friends ແນະນຳ ໂດຍບໍ່ Check Regulation")] },

  // ── ພາກທີ 2: Technical Analysis (15 ບົດ) ──
  { n:11, slug:"candlestick-basics",       title:"Candlestick ອ່ານຢ່າງໃດ? ພື້ນຖານທີ່ຕ້ອງຮູ້",
    body:[h2(1,"Candlestick ປະກອບດ້ວຍຫຍັງ?"),p(2,"Body (ສ່ວນຫຼັກ), Wick/Shadow (ສ່ວນຫາງ) ແທ່ງ Green/White = ລາຄາຂຶ້ນ ແທ່ງ Red/Black = ລາຄາຫຼຸດ"),h2(3,"Candlestick ສຳຄັນ"),p(4,"Doji: Open=Close, ລັ່ງ ເລ ຕ້ອງລໍ | Hammer: Reversal ຂຶ້ນ | Shooting Star: Reversal ຫຼຸດ | Engulfing: Signal ແຮງ"),h2(5,"ຈຳໃຫ້ຂຶ້ນ"),p(6,"ໜຶ່ງ Candle ບໍ່ພຽງພໍ ໃຫ້ Confirm ດ້ວຍ Candle ຖັດໄປ ຫຼື Indicator ເສີມ ຢ່າ Entry ຕາມ Candle ດຽວ")] },
  { n:12, slug:"support-resistance-basics", title:"Support ແລະ Resistance ຄືຫຍັງ? ຊອກຫາຢ່າງໃດ?",
    body:[h2(1,"Support ແມ່ນຫຍັງ?"),p(2,"Support ຄື Zone ທີ່ລາຄາຫຼຸດມາແລ້ວ Bounce ຂຶ້ນ ຫຼາຍຄັ້ງ = ຂຶ້ນ Strong ຫຼາຍ Buyer ລໍ Zone ນີ້"),h2(3,"Resistance ແມ່ນຫຍັງ?"),p(4,"Resistance ຄື Zone ທີ່ລາຄາຂຶ້ນມາແລ້ວ Bounce ຫຼຸດ ຫຼາຍຄັ້ງ = ຂຶ້ນ Strong ຫຼາຍ Seller ລໍ Zone ນີ້"),h2(5,"ໃຊ້ S/R ໃນການເທຣດ"),p(6,"Buy ໃກ້ Support + SL ຕ່ຳ Support | Sell ໃກ້ Resistance + SL ເທິງ Resistance ເມື່ອ Break S/R: ມັກ Flip ໜ້າທີ (S→R, R→S)")] },
  { n:13, slug:"trend-lines-channels",     title:"Trend Line ແລະ Channel ຂຽນຢ່າງໃດ? ໃຊ້ Entry ຈຸດໃດ?",
    body:[h2(1,"Trend Line ຄືຫຍັງ?"),p(2,"Uptrend Line: ສ້ວຍ Higher Low ຫຼາຍຈຸດ Downtrend Line: ສ້ວຍ Lower High ຫຼາຍຈຸດ ໃຊ້ຢ່າງໜ້ອຍ 2 ຈຸດ ຢືນຢັນ"),h2(3,"Channel"),p(4,"Channel ຄື Trend Line ຄູ່ ເສັ້ນຂະໜານກັນ Upper Channel = Resistance, Lower = Support ລາຄາ Bounce ໃນ Channel ຕະຫຼອດ"),h2(5,"Entry ຈຸດໃດ?"),p(6,"Buy ທີ່ Lower Channel ໃນ Uptrend | Sell ທີ່ Upper Channel ໃນ Downtrend | Break Channel ໃຫ້ Loot Profit ທັນທີ")] },
  { n:14, slug:"moving-average-guide",     title:"Moving Average (MA) ຄືຫຍັງ? MA20, MA50, MA200",
    body:[h2(1,"Moving Average ຄືຫຍັງ?"),p(2,"MA ຄືຄ່າສະເລ່ຍລາຄາ ໃນ N ໄລຍະ MA20 = ສະເລ່ຍ 20 Candle ທ້າຍ ຊ່ວຍ Smooth ລາຄາ ເຫັນ Trend ຊັດ"),h2(3,"SMA vs EMA"),p(4,"SMA (Simple) = ສະເລ່ຍທຳມະດາ | EMA (Exponential) = ໃຫ້ Weight ຂ້ອນ EMA ຕອບສະໜອງໄວກວ່າ ນິຍົມໃຊ້ EMA"),h2(5,"ໃຊ້ MA ໃນການເທຣດ"),p(6,"Trend: ລາຄາ > MA200 = Bullish | ລາຄາ < MA200 = Bearish Golden Cross: MA50 ຕັດ MA200 ຂຶ້ນ = Buy Signal ແຮງ")] },
  { n:15, slug:"rsi-indicator-guide",      title:"RSI Indicator: ໃຊ້ Overbought/Oversold ຢ່າງຖືກຕ້ອງ",
    body:[h2(1,"RSI ຄືຫຍັງ?"),p(2,"Relative Strength Index ວັດຄວາມ Momentum ລາຄາ Range 0-100 ຄ່າ > 70 = Overbought | < 30 = Oversold"),h2(3,"ຂໍ້ຜິດພາດທົ່ວໄປ"),p(4,"RSI > 70 ≠ Sell ທັນທີ! ໃນ Strong Uptrend RSI ຄ້າງ Overbought ນານ ຢ່າ Sell ຕ້ານ Trend ໂດຍໃຊ້ RSI ດຽວ"),h2(5,"ໃຊ້ RSI ຢ່າງຖືກ"),p(6,"ໃຊ້ RSI ກັບ S/R: Buy RSI Oversold ທີ່ Support | Sell RSI Overbought ທີ່ Resistance ຫຼື ໃຊ້ RSI Divergence")] },
  { n:16, slug:"macd-indicator-guide",     title:"MACD Indicator: ໃຊ້ Signal ຢ່າງໃດໃຫ້ຖືກ?",
    body:[h2(1,"MACD ຄືຫຍັງ?"),p(2,"Moving Average Convergence Divergence ປະກອບດ້ວຍ MACD Line, Signal Line, Histogram ຊ່ວຍ ຫາ Momentum ແລະ Signal Crossover"),h2(3,"Signal ຫຼັກ"),p(4,"Bullish Crossover: MACD ຕັດ Signal ຂຶ້ນ = Buy | Bearish Crossover: MACD ຕັດ Signal ຫຼຸດ = Sell ຢ່ານຳໃຊ້ໃນ Ranging Market"),h2(5,"Divergence"),p(6,"Bullish Divergence: ລາຄາ Lower Low ແຕ່ MACD Higher Low = Reversal ຂຶ້ນ ໃຊ້ຢູ່ Support ດ້ວຍ = Signal ແຮງ")] },
  { n:17, slug:"bollinger-bands-guide",    title:"Bollinger Bands: ໃຊ້ Squeeze ແລະ Breakout",
    body:[h2(1,"Bollinger Bands ຄືຫຍັງ?"),p(2,"3 ເສັ້ນ: Upper Band, Middle Band (MA20), Lower Band ລາຄາ ສ່ວນໃຫຍ່ຢູ່ພາຍໃນ Band ທາງສະຖິຕິ"),h2(3,"Squeeze = Breakout ໃກ້ມາ"),p(4,"ຕອນ Band ຄ່ອຍ Narrow ໝາຍຄວາມ Volatility ຕ່ຳ ຕ້ອງ Prepare ສຳລັບ Breakout ໃຫຍ່ ທ່ວາຍັງບໍ່ຮູ້ທິດ"),h2(5,"ໃຊ້ BB + RSI"),p(6,"ລາຄາ Touch Lower Band + RSI < 30 = Buy Setup ລາຄາ Touch Upper Band + RSI > 70 = Sell Setup ຢ່ານຳໃຊ້ Band ດຽວ")] },
  { n:18, slug:"fibonacci-retracement",   title:"Fibonacci Retracement: ຊອກ Zone Buy/Sell ທີ່ດີ",
    body:[h2(1,"Fibonacci ຄືຫຍັງ?"),p(2,"Fibonacci Retracement ໃຊ້ Ratio 23.6%, 38.2%, 50%, 61.8%, 78.6% ຊ່ວຍຊອກ Zone ທີ່ລາຄາ Pullback ແລ້ວ Resume Trend"),h2(3,"61.8% Golden Ratio"),p(4,"Zone 61.8% ຄືສຳຄັນທີ່ສຸດ ຫຼາຍຄົນ Buy/Sell ທີ່ Zone ນີ້ ຖ້າ Bounce = Trend ຍັງ Strong ຖ້າ Break = Reversal"),h2(5,"ວິທີໃຊ້"),p(6,"ຂຽນ Fib ຈາກ Swing Low → Swing High (Uptrend) Buy Zone 38.2%-61.8% SL ຕ່ຳ 78.6% Target Swing High")] },
  { n:19, slug:"chart-patterns-guide",     title:"Chart Pattern ທີ່ Trader ຕ້ອງຮູ້: Head & Shoulders, Double Top",
    body:[h2(1,"ທຳໄມ Chart Pattern ສຳຄັນ?"),p(2,"Pattern ສ້ວຍ Psychology ຂອງ Market ທີ່ຊ້ຳໆ ໃຊ້ Recognition ກ່ຽວກັບ Head & Shoulders, Double Top/Bottom, Triangle"),h2(3,"Head & Shoulders"),p(4,"Reversal Pattern ຈາກ Uptrend → Downtrend ມີ Left Shoulder, Head, Right Shoulder ຖ້າ Break Neckline = Sell Signal ແຮງ"),h2(5,"Double Top/Bottom"),p(6,"Double Top: ລາຄາ Touch Resistance 2 ຄັ້ງ Break Support = Sell | Double Bottom: ລາຄາ Touch Support 2 ຄັ້ງ Break Resistance = Buy")] },
  { n:20, slug:"timeframe-selection",      title:"Timeframe ໃດດີ? M5, H1, D1 ຕ່າງກັນຢ່າງໃດ?",
    body:[h2(1,"ແຕ່ລະ Timeframe ດີຫຍັງ?"),p(2,"M1-M15: Scalping, Noise ຫຼາຍ, Stress ສູງ | H1-H4: ດີສຳລັບ Day Trade | D1-W1: Swing Trade, Signal ໜ້ອຍ ແຕ່ ຊັດ"),h2(3,"Multi-Timeframe Analysis"),p(4,"D1: Trend ຫຼັກ | H4: Entry Zone | H1: Entry Point ທີ່ຊັດ ຕ້ອງ Align ທຸກ TF ກ່ອນ Entry ໂອກາດ Win ສູງກວ່າ"),h2(5,"ຄຳແນະນຳ Beginner"),p(6,"ເລີ່ມ H4 ຫຼື D1 Timeframe ໃຫຍ່ Signal ຊັດ Stress ໜ້ອຍ ຄ່ອຍໆ ລົງ H1 ເມື່ອ Consistent ແລ້ວ")] },
  { n:21, slug:"price-action-trading",     title:"Price Action Trading: ເທຣດໂດຍບໍ່ຕ້ອງ Indicator",
    body:[h2(1,"Price Action ຄືຫຍັງ?"),p(2,"ເທຣດໂດຍອ່ານ ການເຄື່ອນໄຫວລາຄາ ຢ່າງດຽວ ໂດຍບໍ່ໃຊ້ Indicator ອ່ານ Candlestick, S/R, Trend ໂດຍກົງ"),h2(3,"ຂໍ້ດີ Price Action"),p(4,"ບໍ່ Lag ຄື Indicator | ອ່ານ Market ໄດ້ Real-time | ໃຊ້ໄດ້ທຸກ Timeframe | Professional ສ່ວນໃຫຍ່ໃຊ້"),h2(5,"Setup ງ່າຍໆ"),p(6,"Pin Bar ທີ່ S/R: ຖ້າ Lower Wick ຍາວ ທີ່ Support = Buy Setup ຖ້າ Upper Wick ຍາວ ທີ່ Resistance = Sell Setup")] },
  { n:22, slug:"order-types-sltp",         title:"Order Types: Market, Limit, Stop + SL/TP ຕັ້ງຢ່າງໃດ?",
    body:[h2(1,"Order Types"),p(2,"Market Order: ເທຣດທັນທີ ລາຄາຕະຫຼາດ | Limit Order: ເທຣດທີ່ລາຄາທີ່ຕ້ອງການ | Stop Order: ເທຣດທີ່ Break ລາຄາໃດໜຶ່ງ"),h2(3,"Stop Loss ສຳຄັນ"),p(4,"SL ຄືການ Cut Loss ອັດຕະໂນມັດ ຕ້ອງຕັ້ງ SL ທຸກ Order ຢ່ານຳໃຊ້ SL ທີ່ງ່ວຍ ຄວນ <=2% ຕໍ່ Trade"),h2(5,"Take Profit"),p(6,"TP ຄື Target ກຳໄລ ຕັ້ງ TP ທີ່ Resistance ຫຼີ Recent High ໃນ Uptrend Risk:Reward ຄວນ >=1:1.5 ດີກວ່າ 1:2")] },
  { n:23, slug:"divergence-trading",       title:"Divergence ຄວາມເລິກ: ວິທີໃຊ້ RSI MACD ຊອກ Reversal",
    body:[h2(1,"Divergence ຄືຫຍັງ?"),p(2,"ຕອນ ລາຄາ ກັບ Indicator ເຄື່ອນໄຫວ ທິດທາງ ຕ່າງກັນ Bullish Divergence: ລາຄາ LL ແຕ່ RSI HL = Reversal ຂຶ້ນ"),h2(3,"Bearish Divergence"),p(4,"ລາຄາ HH ແຕ່ RSI LH = Reversal ຫຼຸດ ໃຊ້ຮ່ວມກັບ Resistance ດ້ວຍ Signal ຈະ ແຮງ ຫຼາຍ"),h2(5,"ວິທີ Trade Divergence"),p(6,"ລໍຖ້າ Divergence + ຢູ່ S/R + Candle Confirmation = Entry ດ້ວຍ SL ຕ່ຳ Low Target ໃກ້ Resistance ຖັດໄປ")] },
  { n:24, slug:"ichimoku-cloud-basics",    title:"Ichimoku Cloud ເໝາະສຳລັບໃຜ? ອ່ານ Cloud ຢ່າງໃດ?",
    body:[h2(1,"Ichimoku ຄືຫຍັງ?"),p(2,"Ichimoku Kinko Hyo ເປັນ Indicator ຈາກຍີ່ປຸ່ນ ໃຊ້ ຮູ້ Trend, Momentum ແລະ S/R ໃນຄັ້ງດຽວ ຈາກ 5 ເສັ້ນ"),h2(3,"Cloud (Kumo) ອ່ານຢ່າງໃດ?"),p(4,"ລາຄາ ເທິງ Cloud = Bullish | ລາຄາ ລຸ່ມ Cloud = Bearish | ລາຄາ ໃນ Cloud = Neutral/ລໍ"),h2(5,"ຄວນໃຊ້ Ichimoku ໄຫມ?"),p(6,"ດີສຳລັບ Swing Trade ໃນ Trending Market ຕ້ອງໃຊ້ TF H4 ຂຶ້ນໄປ ສຳລັບ Beginner ຮຽນ S/R + MA ກ່ອນ")] },
  { n:25, slug:"market-structure-basics",  title:"Market Structure: Higher High, Lower Low ອ່ານ Trend ຢ່າງ Pro",
    body:[h2(1,"Market Structure ຄືຫຍັງ?"),p(2,"ອ່ານ Trend ຈາກ Swing High ແລະ Swing Low: Uptrend = HH + HL ຕໍ່ເນື່ອງ | Downtrend = LH + LL ຕໍ່ເນື່ອງ"),h2(3,"Break of Structure (BOS)"),p(4,"ຕອນ LH Break Swing High ໃນ Downtrend = Signal ຂຶ້ນ ເລີ່ມ ຄວນ SL ທຸກ Short | ຕອນ HL Break Swing Low = ຄວນ Exit Long"),h2(5,"ໃຊ້ Structure ໃນການເທຣດ"),p(6,"Trade ຕາມ Structure ສ່ວນໃຫຍ່ຈະ Win ຫຼາຍກວ່າ Trade ຕ້ານ Structure ຫ້ອຍ Buy ໃນ Downtrend ອ່ອນ")] },

  // ── ພາກທີ 3: Risk Management (10 ບົດ) ──
  { n:26, slug:"risk-management-basics",   title:"Risk Management: ກົດ 2% ທີ່ Trader ທຸກຄົນຕ້ອງຮູ້",
    body:[h2(1,"ທຳໄມ Risk Management ສຳຄັນ?"),p(2,"Professional ທຸກຄົນເວົ້າ: 'ປ້ອງກັນທຶນ' ກ່ອນ 'ຫາກຳໄລ' ຖ້າທຶນໝົດ ເທຣດຕໍ່ບໍ່ໄດ້ ກຳໄລ 50% ຕ້ອງ +100% ຄືນ"),h2(3,"ກົດ 2% ຕໍ່ Trade"),p(4,"ສູນເສຍ ≤2% ຕໍ່ Trade ທຶນ $1,000 SL ≤$20 ທຶນ $5,000 SL ≤$100 ຖ້ານຳໃຊ້ ຄ່ຽວ 10 ໄລ ໃຊ້ທຸນ 80% ຍັງ"),h2(5,"Position Sizing"),p(6,"Lot = (Balance × 2%) ÷ (SL ໃນ USD) ໃຊ້ LFT Lot Calculator ຊ່ວຍຄຳນວນ ຢ່ານຳໃຊ້ Lot Fixed ໂດຍບໍ່ຄິດ")] },
  { n:27, slug:"drawdown-recovery",        title:"Drawdown ຄືຫຍັງ? ຟື້ນຕົວຈາກ Drawdown ຢ່າງໃດ?",
    body:[h2(1,"Drawdown ຄືຫຍັງ?"),p(2,"Drawdown ຄືການຫຼຸດຂອງ Portfolio ຈາກ Peak ສູງສຸດ Drawdown 50% ໝາຍຄວາມວ່າ ຕ້ອງ +100% ຄືນທຶນ"),h2(3,"Max Drawdown ທີ່ຍອມຮັບໄດ້"),p(4,"Professional Fund: ≤20% Drawdown ຄືຂີດຈຳກັດ Personal Account: ≤30% ຖ້າ >30% ຄວນ Stop ທົບທວນ Strategy"),h2(5,"ຟື້ນຕົວ"),p(6,"ຫຼຸດ Lot Size | ທົບທວນ Strategy | ບໍ່ Revenge Trade | Journaling | ຮຽນຮູ້ຈາກ ການຂາດທຶນ ທຸກຄັ້ງ")] },
  { n:28, slug:"risk-reward-ratio",        title:"Risk:Reward Ratio ຄວນໃຊ້ 1:1 ຫຼື 1:2? ຄິດໄລ່ຢ່າງໃດ?",
    body:[h2(1,"Risk:Reward ຄືຫຍັງ?"),p(2,"ຖ້າ SL = 50 pip TP = 100 pip → R:R = 1:2 ໝາຍຄວາມວ່າ ຮ່ວຍ 2 ເທົ່າ ຂອງທີ່ສ່ຽງ ໃນ Win Rate 50% ຍັງໄດ້ກຳໄລ"),h2(3,"ໄຕ່ຕ່ອງ"),p(4,"Win Rate 50% × R:R 1:2 = Profitable | Win Rate 40% × R:R 1:2 = Profitable | Win Rate 33% × R:R 1:3 = Breakeven"),h2(5,"ຄວນໃຊ້ R:R ໃດ?"),p(6,"ຂັ້ນຕ່ຳ 1:1.5 ດີ | ຄາດ 1:2 ດີທີ່ສຸດ | ຖ້າ Market ຊ່ວຍ 1:3+ ດີຫຼາຍ ຢ່ານຳໃຊ້ R:R ຕ່ຳ ກ່ວາ 1:1")] },
  { n:29, slug:"psychology-of-trading",    title:"Psychology ການເທຣດ: ຄວບຄຸມ Emotion ຢ່າງໃດ?",
    body:[h2(1,"ທຳໄມ Psychology ສຳຄັນ?"),p(2,"80% ຂອງ Trader ຂາດທຶນ ສ່ວນໃຫຍ່ບໍ່ໄດ້ຂາດທຶນຈາກ Strategy ທີ່ຜິດ ແຕ່ຈາກ Emotion: FOMO, Greed, Fear"),h2(3,"Emotion ທີ່ຂ້າ Trader"),p(4,"FOMO: Entry ຊ້າ ທ້ວງ Trend | Revenge Trade: ເທຣດດ່ວນ ຫຼັງຂາດທຶນ | Over-confidence: ຫຼັງ Win ຕໍ່ເນື່ອງ"),h2(5,"ວິທີຄວບຄຸມ"),p(6,"ມີ Trading Plan | ຂຽນ Journal | ໃຊ້ Checklist ກ່ອນ Entry | ພັກ ຫຼັງ Loss 2-3 ຄັ້ງ ຕໍ່ເນື່ອງ | ຢ່ານຳໃຊ້ Emotion")] },
  { n:30, slug:"trading-journal",          title:"Trading Journal: ຂຽນ Journal ຊ່ວຍ Improve ໄດ້ຈິງ",
    body:[h2(1,"ທຳໄມຕ້ອງ Journal?"),p(2,"Professional Trader ທຸກຄົນຂຽນ Journal ຊ່ວຍ Track ຜົນງານ ຮຽນຮູ້ຈາກຄວາມຜິດພາດ ແລະ ຊອກ Pattern ທີ່ Win"),h2(3,"Journal ຄວນມີຫຍັງ?"),p(4,"Date | Pair | Direction (B/S) | Lot | Entry/Exit | SL/TP | Actual PnL | Reason Entry | ຮຽນຮູ້ຫຍັງ?"),h2(5,"Journal App ແນະນຳ"),p(6,"TraderVue.com (ຟຣີ Basic) | TradingDiary Pro | Google Sheets (ຟຣີ) ຂຽນທຸກ Trade ຮ່ຽວ 90 ວັນ ຈະເຫັນ Pattern ຊັດ")] },
  { n:31, slug:"correlation-forex",        title:"Correlation ລະຫວ່າງ Currency Pairs: ລະວັງ Over-exposure",
    body:[h2(1,"Correlation ໃນ Forex"),p(2,"Positive Correlation: EURUSD ຂຶ້ນ GBPUSD ມັກຂຶ້ນດ້ວຍ (Corr ~0.8) | Negative: EURUSD ຂຶ້ນ USDCHF ມັກຫຼຸດ"),h2(3,"Over-exposure"),p(4,"Buy EURUSD + Buy GBPUSD + Buy AUDUSD ພ້ອມກັນ = ໝາຍຄວາມວ່າ Sell USD 3 ຄູ່ Risk ຈິງ 3 ເທົ່າ"),h2(5,"ລະວັງ"),p(6,"ຢ່ານຳໃຊ້ Pair Correlated ສູງ ຫຼາຍ ຄູ່ ພ້ອມກັນ ໂດຍບໍ່ຮູ້ ຕ້ອງ Count ເປັນ Position ດຽວ")] },
  { n:32, slug:"money-management-plan",    title:"Money Management Plan: ວາງແຜນທຶນ Forex ຢ່າງ Pro",
    body:[h2(1,"ທຳໄມຕ້ອງ MM Plan?"),p(2,"ເທຣດ Forex ໂດຍບໍ່ມີ Plan = ໄປ Casino ແຕ່ Pro Trader ທຸກຄົນມີ Rule ທີ່ຊັດ ທຸນ ໃດ, ຢ່ຳໃດ, Rule ຢ່ງໃດ"),h2(3,"ຕົວຢ່າງ MM Plan"),p(4,"ທຶນ $1,000 | Risk 2%/Trade | Max 3 Positions | Stop Trading ຖ້າ -10%/Week | Review ທຸກ Sunday"),h2(5,"ກຳນົດ Hard Rules"),p(6,"ຖ້າ Drawdown 20%: ຫຼຸດ Lot 50% | ຖ້າ Drawdown 30%: Stop Trade 1 ອາທິດ | ຢ່ານຳໃຊ້ Rule ເດັ່ນໆ ຄວນ Strict")] },
  { n:33, slug:"swap-rollover",            title:"Swap/Rollover ຄືຫຍັງ? ມີຜົນຕໍ່ Trader ໃດ?",
    body:[h2(1,"Swap ແມ່ນຫຍັງ?"),p(2,"Swap ຄືຄ່າຝາກຄ້າງຄືນ (Overnight Fee) ຖ້ານຳໃຊ້ Position ຄ້າງ 00:00 Server Time Positive Swap = ໄດ້ | Negative = ຈ່າຍ"),h2(3,"Swap ສຳຄັນໃຜ?"),p(4,"Scalper/Day Trader: ບໍ່ Swap ເພາະ Close ທຸກ Order ກ່ອນ ໝົດ | Swing Trader: ຕ້ອງ Check ເພາະ Hold 3-7 ວັນ+"),h2(5,"Swap-Free Account"),p(6,"ຫຼາຍ Broker ໃຫ້ Islamic Account (Swap-Free) ສຳລັບຜູ້ທີ່ Swing Trade ຫຼື Hold ດົນ Check ກັບ Broker ກ່ອນ")] },
  { n:34, slug:"backtesting-basics",       title:"Backtesting ແມ່ນຫຍັງ? ທົດສອບ Strategy ກ່ອນໃຊ້ເງິນຈິງ",
    body:[h2(1,"Backtesting ຄືຫຍັງ?"),p(2,"ທົດສອບ Strategy ກັບ Historical Data ໃນອະດີດ ກ່ອນ Trade ຈິງ ຊ່ວຍ ຮູ້ Win Rate, Drawdown ຂອງ Strategy"),h2(3,"ວິທີ Backtest"),p(4,"MT4: Strategy Tester | Replay Mode | Manual Backtest ໂດຍ Scroll Chart ກັບ ກ່ອນ Test ຢ່າງໜ້ອຍ 100-200 Trades"),h2(5,"Warning"),p(6,"Backtest ໄດ້ດີ ≠ Forward Test ດີ ເສຮ Overfitting ສ່ວນໃຫຍ່ Backtest 3 ປີ+ Forward Test 3 ເດືອນ ກ່ອນ Trade ເງິນຈິງ")] },
  { n:35, slug:"prop-firm-trading",        title:"Prop Firm ຄືຫຍັງ? ເທຣດ Capital ຜູ້ອື່ນ ຮັບ % ກຳໄລ",
    body:[h2(1,"Prop Firm ຄືຫຍັງ?"),p(2,"Proprietary Trading Firm ໃຫ້ Capital ທ່ານ ເທຣດ ທ່ານຮັບ 70-90% ກຳໄລ FTMO, The5%ers, Funded Next ເປັນ Prop ທີ່ຮູ້ຈັກ"),h2(3,"Challenge ຄືຫຍັງ?"),p(4,"ຕ້ອງຜ່ານ Evaluation: Win >8% ໃນ 30 ວັນ Drawdown < 5% Daily / 10% Max ຜ່ານແລ້ວໄດ້ Capital 10K-200K USD"),h2(5,"ເໝາະສຳລັບໃຜ?"),p(6,"Trader ທີ່ Consistent ຢ່າງໜ້ອຍ 6 ເດືອນ ມີ Win Rate 45%+ ແລະ R:R >1:2 Beginner ຢ່ານຳໃຊ້ ຍາກ")] },

  // ── ພາກທີ 4: Strategy ລ່ວງໜ້າ (15 ບົດ) ──
  { n:36, slug:"scalping-strategy",        title:"Scalping Strategy: ເທຣດ M5 ກຳໄລ 5-20 Pip/Trade",
    body:[h2(1,"Scalping ຄືຫຍັງ?"),p(2,"ຍຸດທະວິທີ ເທຣດໄວ 1-30 ນາທີ ກຳໄລ 5-20 pip ຕໍ່ Trade ເທຣດ 10-30 ຄັ້ງ/ວັນ ຕ້ອງການ Broker Spread ຕ່ຳ + Execution ໄວ"),h2(3,"Setup Scalping"),p(4,"Timeframe: M5/M15 | EMA 8+21 Crossover | RSI 14 | ເທຣດ ຕອນ London Session ຫຼື NY Session"),h2(5,"ຄວາມເສ່ຍງ"),p(6,"Stress ສູງ | ຄ່ານາຍໜ້າ ສູງລ່ວມ | ຕ້ອງ Monitor ຕະຫຼອດ ບໍ່ເໝາະ ກັບ ຄົນທີ່ມີວຽກ Full-time")] },
  { n:37, slug:"swing-trading-strategy",   title:"Swing Trading: ຖື Position 2-7 ວັນ ເໝາະສຳລັບຄົນທຳງານ",
    body:[h2(1,"Swing Trading ຄືຫຍັງ?"),p(2,"ຖື Position 2-7 ວັນ ເທຣດ TF H4/D1 ກຳໄລ 50-200 pip ຕໍ່ Trade ໃຊ້ເວລາ ≤30 ນາທີ/ວັນ ເໝາະ ກັບ ຄົນທຳງານ Full-time"),h2(3,"Swing Setup ງ່າຍ"),p(4,"D1 Trend + H4 Pullback + H1 Candle Confirmation = Entry SL ຕ່ຳ Swing Low TP ທີ່ Swing High ຫຼື R:R 1:2+"),h2(5,"ຂໍ້ດີ"),p(6,"Stress ໜ້ອຍ | ຄ່ານາຍໜ້າ ໜ້ອຍ | ໃຊ້ Analysis ຊ້ຳໆ ໄດ້ | ເໝາະ ສ່ວນໃຫຍ່ Professional ໃຊ້ Swing Trade")] },
  { n:38, slug:"breakout-strategy",        title:"Breakout Strategy: Entry ທີ່ Break S/R ຫຼື Pattern",
    body:[h2(1,"Breakout ຄືຫຍັງ?"),p(2,"ລາຄາ Break ລ່ວງ Support, Resistance, ຫຼື Chart Pattern ຢ່າງ ໜັກ Volume ສູງ ເປັນ Signal ທ່ວາໄປ"),h2(3,"False Breakout"),p(4,"ລາຄາ Break ຄືນ ເຂົ້າ Range ກ່ຽວກັບ 40-50% ຂອງ Breakout ໃຊ້ Close Candle ຢືນຢັນ ບໍ່ Entry ທີ່ Wick Break"),h2(5,"Breakout Setup"),p(6,"ລໍ Close ທ, ​ຫຼາຍ Timeframe Candle | Entry Retest Zone | SL ໃນ Range | TP 1.5-2× ຂອງ Range Width")] },
  { n:39, slug:"trend-following-strategy", title:"Trend Following: ເທຣດຕາມ Trend ວິທີທີ່ຊະນະໃນໄລຍະຍາວ",
    body:[h2(1,"'Trend is your friend'"),p(2,"ຄຳສອນ ທີ່ Simple ທີ່ສຸດ ແຕ່ ຖືກ ທີ່ສຸດ ໃນ Forex ເທຣດ ຕາມ Trend ໄດ້ກຳໄລ ຫຼາຍ ກ່ວາ ຕ້ານ Trend ສ່ວນໃຫຍ່"),h2(3,"ຊອກ Trend"),p(4,"MA200 ຊ່ວຍ: ລາຄາ > MA200 = Buy Only | ລາຄາ < MA200 = Sell Only | Market Structure HH/HL = Uptrend"),h2(5,"Entry ຢ່ໍ"),p(6,"Entry ທີ່ Pullback ໄປ S/R ຫຼື MA ໃຫ້ R:R ດີ ຫຼີກລ່ຽງ Buy ທີ່ Resistance, Sell ທີ່ Support ຖ້ານ Trend ຂ້ານ")] },
  { n:40, slug:"news-trading-strategy",    title:"News Trading: ເທຣດ NFP, FOMC ໃຊ້ Strategy ໃດ?",
    body:[h2(1,"News Trading ຄວນລ້ຳ?"),p(2,"ອັນຕະລາຍ ສຳລັບ Beginner Slippage, Spread ກວ້າງ ຕອນຂ່າວ 5-20 pip ໃນ 1 ວິນາທີ ຖ້າ ຜ່ານ ທຸ ລ່ວງ ໜ້າ"),h2(3,"Strategy ອ້ອມ"),p(4,"ຫຼຸດ Position ກ່ອນຂ່າວ | ຫຼັງຂ່າວ ລໍ 10-15 ນາທີ ແລ້ວ Follow ທິດທາງ | Straddle ຕ້ອງ Broker ຮອງຮັບ"),h2(5,"ຂ່າວທີ່ Impact ໃຫຍ່"),p(6,"NFP (1st Fri/Month) | FOMC (8x/year) | CPI | Central Bank Decision ທຸກ ອັນ ນີ້ ເອົາ ໃສ່ Calendar ກ່ອນ")] },
  { n:41, slug:"mean-reversion-strategy",  title:"Mean Reversion Strategy: ເທຣດ Overextended Market",
    body:[h2(1,"Mean Reversion ຄືຫຍັງ?"),p(2,"ແນວຄວາມຄິດ: ລາຄາທີ່ Move ໄກ ຈາກ ສະເລ່ຍ ມັກ Revert ກັບ ສ່ວນໃຫຍ່ ໃຊ້ Bollinger Bands ວັດ Overextension"),h2(3,"Setup"),p(4,"ລາຄາ Touch/Close ນອກ BB | RSI Oversold/Overbought | ຢູ່ Key S/R = Entry Counter Trend ດ້ວຍ SL ຕ່ຳ"),h2(5,"ຄວາມເສ່ຍງ"),p(6,"ຖ້າ Trend ໜັກ ລາຄາ ອາດ ຄ້າງ Oversold/Overbought ດົນ Mean Reversion ຈະ Failed ໃຊ້ ໃນ Ranging Market ດີກວ່າ")] },
  { n:42, slug:"grid-trading-explained",   title:"Grid Trading Strategy: ຄວນໃຊ້ ຫຼື ຫຼີກລ່ຽງ?",
    body:[h2(1,"Grid Trading ຄືຫຍັງ?"),p(2,"ວາງ Buy ແລະ Sell Orders ເປັນ Grid ທຸກ X pip ອັດຕະໂນມັດ ກຳໄລໃນ Ranging Market ອັນຕະລາຍໃນ Trending Market"),h2(3,"ຂໍ້ດີ-ຂໍ້ເສຍ"),p(4,"ຂໍ້ດີ: ອັດຕະໂນມັດ, ກຳໄລ Ranging Market | ຂໍ້ເສຍ: Drawdown ໃຫຍ່ຕອນ Trend, Account Blown ທ່ານໄດ້ອ່ານ"),h2(5,"ຄຳແນະນຳ"),p(6,"Grid Trading ອັນຕະລາຍ ສຳລັບ ຄົນທີ່ ບໍ່ Understand Fully ຫ້ານ ໃຊ້ Lot ໃຫຍ່ ຫຼື Grid ໃຫຍ່ ໂດຍ ບໍ່ Backtest")] },
  { n:43, slug:"carry-trade-strategy",     title:"Carry Trade: ກຳໄລຈາກ Interest Rate Differential",
    body:[h2(1,"Carry Trade ຄືຫຍັງ?"),p(2,"ກູ້ ສະກຸນດອກເບ້ຍ ຕ່ຳ (JPY, CHF) ລົງທຶນ ໃນ ສະກຸນດອກເບ້ຍ ສູງ (AUD, NZD) ກຳໄລຈາກ Positive Swap"),h2(3,"ຕົວຢ່າງ"),p(4,"Buy AUDJPY: AUD ດອກເບ້ຍ 4.35% JPY ດອກເບ້ຍ 0.1% ໄດ້ Swap ≈4.25%/ປີ ກຳໄລຈາກ Swap ທຸກຄືນ"),h2(5,"ຄວາມເສ່ຍງ"),p(6,"ຖ້າ Risk-off AUD ຫຼຸດ JPY ແຂງ Carry Trade ຂາດທຶນ ໄວ ຕ້ອງ Hedge ຫຼື Cut Loss ຖ້າ Signal Risk-off")] },
  { n:44, slug:"dca-dollar-cost-averaging",title:"DCA ໃນ Forex: ໃຊ້ Dollar-Cost Averaging ຢ່າງໃດ?",
    body:[h2(1,"DCA ໃນ Forex"),p(2,"Buy ຫຼາຍ ຄັ້ງ ທີ່ຫຼາກຫຼາຍ ລາຄາ ໃນ Uptrend ສ້ວຍ Average Entry ທີ່ດີ ໃຊ້ ໃນ Long-term Investment ຫຼາຍ ກ່ວາ Short-term"),h2(3,"ຕ່າງຈາກ Averaging Down"),p(4,"Averaging Down = DCA ໃນ Downtrend ອັນຕະລາຍ ທີ່ສຸດ! ຫ້ານ DCA ໃນ Downtrend ທຸ ທ່ານ ທີ່ Manual"),h2(5,"ວິທີ DCA ຢ່າງໄລ"),p(6,"DCA ຕາມ ແຜນ: ທຸກ X ວັນ ເພີ່ມ Position ໃນ Uptrend ທີ່ S/R | ລວມ Total Risk ທຸກ Position ຢ່ານຳໃຊ້ > 5% ທຶນ")] },
  { n:45, slug:"position-trading-longterm",title:"Position Trading: ຖື Order ຫຼາຍ ອາທິດ ຫຼື ເດືອນ",
    body:[h2(1,"Position Trading ຄືຫຍັງ?"),p(2,"ຖື Order ຫຼາຍ ອາທິດ ຫາ ຫຼາຍ ເດືອນ ໃຊ້ TF W1/MN ຕາມ Macro Trend ໃຫຍ່ Swap ສຳຄັນ ທີ່ສຸດ"),h2(3,"ຕ້ອງການ ຫຍັງ?"),p(4,"ຄວາມ ເຂົ້າໃຈ Fundamental ດີ ອ່ານ Central Bank ໄດ້ SL ໃຫຍ່ 200-500 pip ທຶນ ຕ້ອງ ສູງ ກ່ວາ"),h2(5,"ເໝາະ ໃຜ?"),p(6,"ນັກລົງທຶນ ຫຼາຍ ກ່ວາ Trader ຄົນ ທີ່ ມີ Full-time Job ແລະ ທຶນ ພໍ ສ່ວນໃຫຍ່ ໃຊ້ ຮ່ວມ ກັບ Swing Trade")] },
  { n:46, slug:"trading-plan-template",    title:"Trading Plan ຕົວຢ່າງ: ລ້ຽງ ຈາກ Forex ຢ່າງ Systematic",
    body:[h2(1,"ທຳໄມ ຕ້ອງ Trading Plan?"),p(2,"ບໍ່ມີ Plan = Gambler ມີ Plan = Trader Plan ຊ່ວຍ ປ້ອງກັນ ຕັດສິນໃຈ ບ້ ໂດຍ Emotion ແລະ ທົດສອບ ໄດ້"),h2(3,"ຕົວຢ່າງ Trading Plan"),p(4,"Strategy: Swing Trade H4/D1 | Risk/Trade: 1.5% | Max Open: 3 | Session: London | Pairs: EURUSD XAUUSD | Stop: -10%/Week"),h2(5,"ທົບທວນ"),p(6,"ທົບທວນ Plan ທຸກ ເດືອນ ຖ້າ ຜ່ານ 3 ເດືອນ ທີ່ Profitable ໃຫ້ Scale Up ທຶນ ຢ່ານຳໃຊ້ Plan ທີ່ ບໍ່ Test ກ່ອນ")] },
  { n:47, slug:"automated-trading-intro",  title:"Automated Trading: EA, Bot, Copy Trade ຕ່າງກັນຢ່າງໃດ?",
    body:[h2(1,"ການ ເທຣດ ອັດຕະໂນມັດ"),p(2,"EA/Robot: Code ໂດຍ Programmer, ຕິດຕັ້ງ MT4/5 | Copy Trade: ສຳເນົາ Trade ຈາກ Master | Signal Service: ສ່ງ ສັນຍານ"),h2(3,"ຂໍ້ດີ-ຂໍ້ເສຍ"),p(4,"ຂໍ້ດີ: ບໍ່ Emotion, Run 24/7 | ຂໍ້ເສຍ: EA ທີ່ Backtest ດີ ອາດ Fail ໃນ Real Market ຕ້ອງ Monitor"),h2(5,"ຄຳ ເຕືອນ"),p(6,"Forex Robot ທີ່ Sell Online 90% Scam ຫຼື Overfit ຖ້ານ ຕ້ອງການ EA ຮຽນ Code MQL ເອງ ຫຼື ໃຊ້ Free EA ທີ່ MQL5 Market")] },
  { n:48, slug:"crypto-vs-forex",          title:"Crypto vs Forex: ຄວນ ເລືອກ ເທຣດ ຫຍັງ ດີ ກ່ວາ?",
    body:[h2(1,"Crypto vs Forex"),p(2,"Forex: Regulated, Stable, Spread ຕ່ຳ, ເທຣດ 24/5 | Crypto: Volatile ສູງ, 24/7, Unregulated ຫຼາຍ, ຂຶ້ນ-ລົງ ໃຫຍ່"),h2(3,"ຜົນຕໍ່ Trader"),p(4,"Crypto ໄດ້ ຫຼາຍ ໄວ ສູນ ຫຼາຍ ໄວ ດ້ວຍ Forex ກ່ວາ ສ່ວນໃຫຍ່ ຖ້ານ Beginner ເລີ່ມ Forex ກ່ອນ"),h2(5,"ທ່ານ ຄວນ"),p(6,"ຮຽນ Forex ກ່ອນ ເຂົ້າໃຈ Basis ທຸກ ດ້ານ ແລ້ວ ຄ່ອຍ Add Crypto ໃນ Portfolio ຢ່ານ All-in Crypto ໃນ Bull Run")] },
  { n:49, slug:"taxes-forex-lao",          title:"ພາສີ Forex ໃນ ລາວ: ຕ້ອງ ລາຍງານ ຫຍັງ?",
    body:[h2(1,"ພາສີ Forex ໃນ ລາວ"),p(2,"ປັດຈຸບັນ ລາວ ຍັງ ບໍ່ ມີ ກົດໝາຍ ພາສີ Forex ທີ່ ຊັດ ສຳລັບ Retail Trader ແຕ່ ຄວນ ທຳ ຄວາມ ເຂົ້າໃຈ ກ່ອນ"),h2(3,"ຄຳ ແນະ ນຳ"),p(4,"ຖ່ານ ຖອນ ເງິນ ຫຼາຍ ຄວນ ຮັກສາ Records ກ່ຽວກັບ Deposit/Withdraw ທຸກ ຄັ້ງ ຊ່ວຍ ໃນ ອະນາຄົດ"),h2(5,"ຄວນ ໄຖ່ ຜູ້ ຊ່ຽວ ຊານ"),p(6,"ຖ້ານ ກຳ ໄລ ສູງ ດ້ວຍ ຄວນ ໄຖ່ ນັກ ການ ເງິນ ຫຼື ທະນາຍ ທ້ອງ ຖິ່ນ LaoForexTrader ບໍ່ ແມ່ນ ທີ່ ປຶກ ສາ ການ ເງິນ ທາງ ກົດ ໝາຍ")] },
  { n:50, slug:"roadmap-becoming-trader",  title:"Roadmap: ຈາກ Beginner → Professional Trader ໃຊ້ ເວລາ ຫຼາຍ ແຄ?",
    body:[h2(1,"Roadmap Trader"),p(2,"Month 1-3: ຮຽນ Basic, Demo Account | Month 4-6: Live ທຶນ ໜ້ອຍ $100-500 | Month 7-12: ປ່ຽນ Strategy, Consistent | Year 2+: Scale Up"),h2(3,"ຄວາມ ຈິງ ທີ່ ຕ້ອງ ຮູ້"),p(4,"80% ຂາດ ທຶນ ໃນ 1 ປີ ທຳ ອິດ ຄວາມ ຈິງ ຂອງ Forex ໃຊ້ ເວລາ 2-3 ປີ ຈຶ່ງ Consistent Pro ທຸກ ຄົນ ຜ່ານ ໄລ ຍະ ຂາດ ທຶນ"),h2(5,"ສຳ ເລັດ ໄດ້ ຖ້ານ"),p(6,"ຮຽນ ທຸກ ວັນ | Journal ທຸກ Trade | ຢ່ານ ຂາດ ທຶນ ຫຼາຍ | ຖາມ ເມື່ອ ບໍ່ ເຂົ້າໃຈ | ຕິດ ຕາມ LaoForexTrader ສຳ ລັບ ຂໍ້ ມູນ ໃໝ່ ທຸກ ວັນ")] },
]

// ════════════════════════════════════════
// MAIN FUNCTION
// ════════════════════════════════════════
async function resetAndSeed() {
  console.log("🚀 LaoForexTrader — Reset & Seed All Content")
  console.log("📡 Project:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
  console.log("")

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.log("❌ ກວດສອບ .env.local:")
    console.log("   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxx")
    console.log("   SANITY_API_TOKEN=sk-xxxxx")
    process.exit(1)
  }

  // ── Step 1: ລຶບ article ເກົ່າ ──
  console.log("🗑  ລຶບ article ເກົ່າທັງໝົດ...")
  try {
    const old = await client.fetch('*[_type == "article"]{ _id }')
    for (const doc of old) {
      await client.delete(doc._id)
    }
    console.log("   ລຶບ " + old.length + " articles ແລ້ວ\n")
  } catch(e) { console.log("   ⚠ ລຶບ ໄດ້ບໍ່ ໝົດ:", e.message) }

  // ── Step 2: Author ──
  console.log("✍️  ສ້າງ Author...")
  await client.createOrReplace(AUTHOR)
  console.log("   ✓ LFT Team\n")

  // ── Step 3: Broker articles ──
  console.log("🏦 ສ້າງ Broker Articles (" + BROKER_ARTICLES.length + " ບົດ)...")
  for (const a of BROKER_ARTICLES) {
    await client.createOrReplace({
      _id: a.id, _type: "article",
      title: a.title, slug: { _type:"slug", current: a.slug },
      excerpt: a.excerpt, category: "broker",
      publishedAt: new Date().toISOString(),
      featured: a.id === "art-broker-1",
      readTime: 5,
      body: a.body,
      author: { _type:"reference", _ref: "author-lft-team" },
    })
    console.log("   ✓ " + a.title.slice(0,55))
  }

  // ── Step 4: News articles ──
  console.log("\n📰 ສ້າງ News Articles (" + NEWS_ARTICLES.length + " ບົດ)...")
  for (const a of NEWS_ARTICLES) {
    await client.createOrReplace({
      _id: a.id, _type: "article",
      title: a.title, slug: { _type:"slug", current: a.slug },
      excerpt: a.excerpt, category: "news",
      publishedAt: new Date().toISOString(), readTime: 4,
      body: a.body,
      author: { _type:"reference", _ref: "author-lft-team" },
    })
    console.log("   ✓ " + a.title.slice(0,55))
  }

  // ── Step 5: Analysis articles ──
  console.log("\n📊 ສ້າງ Analysis Articles (" + ANALYSIS_ARTICLES.length + " ບົດ)...")
  for (const a of ANALYSIS_ARTICLES) {
    await client.createOrReplace({
      _id: a.id, _type: "article",
      title: a.title, slug: { _type:"slug", current: a.slug },
      excerpt: a.excerpt, category: "analysis",
      publishedAt: new Date().toISOString(), readTime: 4,
      body: a.body,
      author: { _type:"reference", _ref: "author-lft-team" },
    })
    console.log("   ✓ " + a.title.slice(0,55))
  }

  // ── Step 6: EA articles ──
  console.log("\n🤖 ສ້າງ EA/Tools Articles (" + EA_ARTICLES.length + " ບົດ)...")
  for (const a of EA_ARTICLES) {
    await client.createOrReplace({
      _id: a.id, _type: "article",
      title: a.title, slug: { _type:"slug", current: a.slug },
      excerpt: a.excerpt, category: "ea-tools",
      publishedAt: new Date().toISOString(), readTime: 4,
      body: a.body,
      author: { _type:"reference", _ref: "author-lft-team" },
    })
    console.log("   ✓ " + a.title.slice(0,55))
  }

  // ── Step 7: Forex Lessons 50 ບົດ ──
  console.log("\n🎓 ສ້າງ Forex ພື້ນຖານ 50 ບົດ...")
  for (const lesson of FOREX_LESSONS) {
    const date = new Date()
    date.setDate(date.getDate() - (50 - lesson.n))
    await client.createOrReplace({
      _id: "edu-" + lesson.n,
      _type: "article",
      title: lesson.title,
      slug: { _type:"slug", current: lesson.slug },
      excerpt: lesson.body.filter(b => b.style === "normal")[0]?.children[0]?.text?.slice(0,200) || "",
      category: "education",
      publishedAt: date.toISOString(),
      featured: lesson.n === 1,
      readTime: Math.ceil(3 + lesson.n * 0.05),
      body: lesson.body,
      author: { _type:"reference", _ref: "author-lft-team" },
    })
    process.stdout.write("   ✓ ບົດ " + lesson.n + ": " + lesson.title.slice(0,45) + "\n")
  }

  // ── Summary ──
  const total = BROKER_ARTICLES.length + NEWS_ARTICLES.length + ANALYSIS_ARTICLES.length + EA_ARTICLES.length + FOREX_LESSONS.length
  console.log("")
  console.log("═══════════════════════════════════════════")
  console.log("✅ ສ້າງ Content ທັງໝົດ ສຳ ເລັດ!")
  console.log("   🏦 Broker Articles  : " + BROKER_ARTICLES.length + " ບົດ")
  console.log("   📰 News Articles    : " + NEWS_ARTICLES.length + " ບົດ")
  console.log("   📊 Analysis         : " + ANALYSIS_ARTICLES.length + " ບົດ")
  console.log("   🤖 EA/Tools         : " + EA_ARTICLES.length + " ບົດ")
  console.log("   🎓 Forex ພື້ນຖານ    : " + FOREX_LESSONS.length + " ບົດ")
  console.log("   ────────────────────────────────────────")
  console.log("   📚 ລວມທັງໝົດ        : " + total + " ບົດ")
  console.log("═══════════════════════════════════════════")
  console.log("")
  console.log("👉 ເປີດ localhost:3000 ເພື່ອເບິ່ງຜົນ")
  console.log("👉 Sanity Studio: localhost:3333")
}

resetAndSeed().catch(function(err) {
  console.log("❌ Error:", err.message)
  process.exit(1)
})
