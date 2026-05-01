// seed-education-batch3.js
// ນຳເຂົ້າ 10 ບົດຮຽນ education batch 3
// ວິທີໃຊ້: node scripts/seed-education-batch3.js

const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function block(text, style = "normal") {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 9),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 9), text, marks: [] }],
  }
}
const h2 = t => block(t, "h2")
const h3 = t => block(t, "h3")
const p  = t => block(t, "normal")
const bullets = items => items.map(text => ({
  _type: "block", _key: Math.random().toString(36).slice(2, 9),
  style: "normal", listItem: "bullet", level: 1, markDefs: [],
  children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 9), text, marks: [] }],
}))
const numbers = items => items.map(text => ({
  _type: "block", _key: Math.random().toString(36).slice(2, 9),
  style: "normal", listItem: "number", level: 1, markDefs: [],
  children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 9), text, marks: [] }],
}))

const articles = [

  // 1. automated-trading-intro
  {
    _type: "article",
    title: "Automated Trading: EA, Bot, Copy Trade ຕ່າງກັນຢ່າງໃດ?",
    slug: { _type: "slug", current: "automated-trading-intro" },
    category: "education",
    excerpt: "Automated Trading ມີ 3 ຮູບແບບຫຼັກ: EA (Expert Advisor), Trading Bot ແລະ Copy Trade ແຕ່ລະຮູບແບບເໝາະກັບໃຜ ແລະ ໃຊ້ຢ່າງໃດ?",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Automated Trading ແມ່ນຫຍັງ?"),
      p("Automated Trading ຄືການໃຊ້ Software/Algorithm Trade ໂດຍອັດຕະໂນມັດ ແທນທີ່ຈະໃຊ້ຄົນ ໂດຍໃຊ້ກົດ ແລະ Parameter ທີ່ກຳນົດໄວ້ລ່ວງໜ້າ"),
      p("ຂໍ້ດີ: ບໍ່ມີ Emotion, Trade ໄດ້ 24/5, ປະຕິບັດ Strategy ໄດ້ Consistent ກວ່າຄົນ"),

      h2("3 ຮູບແບບຫຼັກ"),

      h3("1. EA (Expert Advisor)"),
      p("EA ຄື Script ທີ່ຕິດຕັ້ງໃນ MT4/MT5 ແລ້ວ Trade ອັດຕະໂນມັດໃນ Account ຂອງທ່ານ"),
      ...bullets([
        "ຕິດຕັ້ງໃນ MT4/MT5 ໂດຍກົງ",
        "Trade ຢູ່ Account ຂອງທ່ານເອງ",
        "ຕ້ອງ VPS ໃຫ້ EA ວິ່ງ 24/5",
        "ຄວບຄຸມໄດ້ 100%: ເລືອກ Pair, Lot, Risk ເອງ",
        "ຕົວຢ່າງ: TheRocket EA SGride ຂອງ LFT",
      ]),

      h3("2. Trading Bot"),
      p("Bot ຄ້າຍ EA ແຕ່ວ່າ Run ຢູ່ Platform ຂອງ Third-party ບໍ່ຕ້ອງ MT4/MT5"),
      ...bullets([
        "Run ຢູ່ Cloud ບໍ່ຕ້ອງ VPS",
        "ຕ້ອງ API ຂອງ Broker",
        "ນິຍົມໃນ Crypto (Binance, OKX)",
        "ສ່ວນຫຼາຍ Forex ໃຊ້ EA ຫຼາຍກວ່າ Bot",
      ]),

      h3("3. Copy Trade"),
      p("Copy Trade ຄືການ Copy Order ຈາກ Trader ຄົນອື່ນ (Master) ໄປ Account ຂອງທ່ານ (Follower) ອັດຕະໂນມັດ"),
      ...bullets([
        "ບໍ່ຕ້ອງຮຽນ Strategy: ເລືອກ Master ທີ່ດີ",
        "ສ່ວນຫຼາຍ ເຊັ່ນ Exness Social, XM Copy",
        "Master ໄດ້ Commission ຈາກ Follower",
        "ຄວາມສ່ຽງ: Master Trade ໄດ້ຮັບຜ ົ ນ Master Trade ຂາດທຶນ ທ່ານກໍ ຂາດທຶນ",
      ]),

      h2("ປຽບທຽບ 3 ຮູບແບບ"),
      ...bullets([
        "EA: ຄວບຄຸມສູງ ຕ້ອງຮຽນ ຕ້ອງ VPS ກຳໄລຂຶ້ນກັບ EA ຄຸນນະພາບ",
        "Bot: ງ່າຍກວ່າ EA ເໝາະ Crypto ຫຼາຍກວ່າ Forex",
        "Copy Trade: ງ່າຍທີ່ສຸດ ບໍ່ຕ້ອງຮຽນ ແຕ່ Depend ຄົນອື່ນ",
      ]),

      h2("ຄວາມສ່ຽງ Automated Trading"),
      ...bullets([
        "⚠️ EA/Bot ຂາດທຶນ: ບໍ່ມີ System ທີ່ ກຳໄລ 100% ສະເໝີ",
        "⚠️ Over-optimization: EA ເຮັດວຽກໃນ Backtest ດີ ແຕ່ Real ຜ ົ ນ ຕ່ຳ",
        "⚠️ Copy Trader ປ່ຽນ Style: Master ອາດ Trade ຕ່າງຈາກ Track Record",
        "⚠️ Technical Failure: VPS Down, Connection ຂາດ",
        "⚠️ Scam EA: EA ຫຼາຍໂຕໃຊ້ Martingale ທ ີ່ Blow Account ແນ່ນອນ",
      ]),

      h2("ວິທີເລືອກ EA ທີ່ດີ"),
      ...numbers([
        "ມີ Live Track Record ຢ່າງໜ້ອຍ 6-12 ເດືອນ (ບໍ່ໃຊ້ Backtest ດຽວ)",
        "Drawdown ສູງສຸດ < 20-30%",
        "Consistent ກຳໄລທຸກເດືອນ ບໍ່ Spike ໜຶ່ງເດືອນ",
        "ບໍ່ໃຊ້ Martingale ຫຼື Grid ທີ່ Uncapped",
        "Transparent: ເຫັນ Trade History ຈິງ",
      ]),

      h2("TheRocket EA ຂອງ LFT"),
      ...bullets([
        "EA SGride: Grid Strategy ທີ່ມີ Risk Management",
        "EA MegiHedge: Hedging Strategy",
        "Live Track Record: ເຫັນໄດ້ທີ່ ໜ້າ EA System",
        "ຕ ິ ດ ຕ ານ ໄ ດ ້ ທ ຸ ກ ວ ັ ນ ຜ ່ ານ Telegram LFT",
      ]),
    ],
  },

  // 2. crypto-vs-forex
  {
    _type: "article",
    title: "Crypto vs Forex: ຄວນເລືອກເທຣດຫຍັງດີກວ່າ?",
    slug: { _type: "slug", current: "crypto-vs-forex" },
    category: "education",
    excerpt: "Crypto ແລະ Forex ຕ່າງກັນໃນດ້ານ Volatility, ຕະຫຼາດ, ຄ່າໃຊ້ຈ່າຍ ແລະ ຄວາມສ່ຽງ ຮຽນຮູ້ວ່າຮູບແບບໃດເໝາະກັບທ່ານ",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ຕະຫຼາດ Crypto ແລະ Forex ຕ່າງກັນຫຍັງ?"),
      p("ທັງ Crypto ແລະ Forex ຊ ື ້ ຂ າ ຍ ອ ອ ນ ລ າ ຍ ຜ ່ ານ Broker ແຕ ່ ມ ີ ຄ ວ າ ມ ແ ຕ ກ ຕ ່ ານ ສ ຳ ຄ ັ ນ ຫ ຼ າ ຍ ດ ້ ານ"),

      h2("ປຽບທຽບ Crypto vs Forex"),

      h3("ຂະໜາດຕະຫຼາດ"),
      ...bullets([
        "Forex: $7.5 ລ້ານລ້ານ USD/ວັນ — ໃຫຍ່ທີ່ສຸດໃນໂລກ",
        "Crypto: $100-200 ພັນລ້ານ USD/ວັນ — ນ້ອຍກວ່າ Forex ຫຼາຍ",
        "Forex ມີ Liquidity ສູງກວ່າ Spread ຕ່ຳກວ່າ",
      ]),

      h3("ເວລາຊື້ຂາຍ"),
      ...bullets([
        "Forex: ຈັນ-ສຸກ 24 ຊົ່ວໂມງ ວ ັ ນ ເ ສ າ ລ ້ ານ ປ ິ ດ",
        "Crypto: 24/7 ລ ວ ມ Weekend ແ ລ ະ ວ ັ ນ ຫ ຍ ຸ ດ",
        "Crypto Trade ໄດ ້ Weekend ດ ີ ສ ຳ ລ ັ ບ ຜ ູ ້ ທ ີ ່ ວ ່ ານ ທ ຳ ມ ານ",
      ]),

      h3("Volatility"),
      ...bullets([
        "Forex: EUR/USD ເຄ ື ່ ອ ນ ໄ ຫ ວ 50-100 Pips/ວ ັ ນ ປ ົ ກ ກ ະ ຕ ິ",
        "Crypto: BTC ເຄ ື ່ ອ ນ ໄ ຫ ວ 1-5% ຕ ໍ ່ ວ ັ ນ ໃ ນ ຊ ່ ວ ງ ງ ຽ ບ",
        "Crypto Volatile ສ ູ ງ ກ ວ່ ານ: ກ ຳ ໄ ລ ໄ ວ ຂ າ ດ ທ ຶ ນ ກ ໍ ໄ ວ",
      ]),

      h3("Regulation ແລະ ຄວາມປອດໄພ"),
      ...bullets([
        "Forex: Regulated ດ ີ FCA, ASIC, CySEC ຄ ້ ຸ ມ ຄ ອ ງ",
        "Crypto: Regulation ຍ ັ ງ ບ ໍ ່ ຊ ັ ດ ເ ຈ ນ ໃ ນ ຫ ຼ າ ຍ ປ ະ ເ ທ ດ",
        "Crypto Exchange Hack ໄ ດ ້: Mt.Gox, FTX Collapse",
        "Forex Broker Regulated ລ ູ ກ ຄ ້ ານ ໄ ດ ້ ຮ ັ ບ ຄ ວ າ ມ ຄ ້ ຸ ມ ຄ ອ ງ",
      ]),

      h3("Leverage"),
      ...bullets([
        "Forex: ສ ູ ງ ສ ຸ ດ 1:1000 (ໃ ນ Offshore Broker)",
        "Crypto: ສ ່ ວ ນ ໃ ຫ ຍ ່ 1:10 ຫ ຼ ື 1:20 ສ ຳ ລ ັ ບ Retail",
        "Forex Leverage ສ ູ ງ ກ ວ່ ານ ຫ ຼ າ ຍ",
      ]),

      h3("ຄ່າໃຊ້ຈ່າຍ"),
      ...bullets([
        "Forex: Spread 0.5-3 Pips + Commission (ECN)",
        "Crypto: Taker/Maker Fee 0.1-0.5%, ລ ວ ມ Gas Fee",
        "Forex ຕ ່ ຳ ກ ວ່ ານ ສ ຳ ລ ັ ບ High Frequency Trading",
      ]),

      h2("ຄວນເລືອກຫຍັງ?"),
      ...bullets([
        "✅ Forex ດ ີ ກ ວ່ ານ ຖ ້ ານ: ຕ ້ ອ ງ ການ Leverage ສ ູ ງ, ຕ ້ ອ ງ ການ Regulation, Trade ລ ູ ນ ແ ຮ ງ ກ ວ່ ານ",
        "✅ Crypto ດ ີ ກ ວ່ ານ ຖ ້ ານ: Trade Weekend, ສ ົ ນ ໃ ຈ Blockchain Technology, ຕ ້ ອ ງ ການ Volatility ສ ູ ງ",
        "💡 ສ ຳ ລ ັ ບ Beginner ລ ານ: Forex ມ ີ ໂ ຄ ງ ສ ້ ານ ດ ີ ກ ວ່ ານ Crypto ໃ ນ ດ ້ ານ Education ແ ລ ະ Tool",
        "💡 ຫ ຼ າ ຍ Trader Trade ທ ັ ງ ສ ອ ງ ຢ ່ ານ: Forex ໃ ນ ອ ານ ທ ິ ດ Crypto ໃ ນ Weekend",
      ]),
    ],
  },

  // 3. taxes-forex-lao
  {
    _type: "article",
    title: "ພາສີ Forex ໃນລາວ: ຕ້ອງລາຍງານຫຍັງ?",
    slug: { _type: "slug", current: "taxes-forex-lao" },
    category: "education",
    excerpt: "Trader ລ ານ ຫ ຼ າ ຍ ຄ ົ ນ ບ ໍ ່ ຮ ູ ້ ກ ່ ຽ ວ ກ ັ ບ ຮ ີ ດ ກ ຳ ພ າ ສ ີ ຈ າ ກ ການ Trade Forex ຮ ຽ ນ ຮ ູ ້ ໂ ດ ຍ ສ ັ ງ ເ ຂ ບ ວ ່ ານ ຕ ້ ອ ງ ລ ານ ງ ານ ຫ ຍ ັ ງ",
    readTime: 8,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ໝາຍເຫດສຳຄັນ"),
      p("⚠️ ຂໍ້ມູນຂ້າງລຸ່ມນີ້ເປັນຂໍ້ມູນທົ່ວໄປ ບໍ່ແມ່ນຄຳແນະນຳດ້ານກົດໝາຍ ກ່ອນຕັດສິນໃຈຄວນປຶກສາຜູ້ຊ່ຽວຊານດ້ານກົດໝາຍຫຼືພາສີໃນລາວ"),

      h2("ສະຖານະການ Forex ໃນລາວ"),
      p("ສປປ ລາວ ຍ ັ ງ ບ ໍ ່ ມ ີ ກ ົ ດ ໝ າ ຍ ສ ະ ເ ພ າ ະ ກ ຽ ່ ວ ກ ັ ບ ການ Trade Forex Online ຢ ່ ານ ຊ ັ ດ ເ ຈ ນ Broker ທ ີ ່ ຄ ົ ນ ລ ານ ໃ ຊ ້ ສ ່ ວ ນ ໃ ຫ ຍ ່ ເ ປ ັ ນ Offshore Broker ທ ີ ່ Registered ຢ ູ ່ ຕ ່ ານ ປ ະ ເ ທ ດ"),

      h2("ກຳໄລ Forex ຕ້ອງເສຍພາສີໄຫມ?"),
      p("ໂດ ຍ ທ ີ ່ ຕ ່ ານ ໃ ນ ທ ານ ງ ທ ິ ດ ສ ະ ດ ີ: ກ ຳ ໄ ລ ຈ າ ກ ການ ລ ົ ງ ທ ຶ ນ ຫ ຼ ື ສ ້ ານ ລ ານ ຍ ໄ ດ ້ ໃ ດ ໆ ໃ ນ ລ ານ ຄ ວ ນ ຢ ູ ່ ໃ ນ ຂ ່ ານ ຂ ອ ງ ການ ໃ ຫ ້ ພ ານ ສ ີ ຕ ານ ລາ ຍ ໄ ດ ້ ບ ຸ ກ ຄ ົ ນ"),
      ...bullets([
        "ລາຍໄດ້ບຸກຄົນ (Personal Income Tax): ໃ ນ ລ ານ ອ ັ ດ ຕ ານ 0-25% ຂ ຶ ້ ນ ກ ັ ບ ລ ານ ຍ ໄ ດ ້",
        "ຍ ັ ງ ບ ໍ ່ ມ ີ ກ ໍ ລ ະ ນ ີ ທ ີ ່ ຊ ັ ດ ເ ຈ ນ ກ ຽ ່ ວ ກ ັ ບ Forex ໃ ນ ລ ານ",
        "ຄ ວ ນ ປ ຶ ກ ສ ານ ນ ັ ກ ກ ານ ບ ັ ນ ຊ ີ / ທ ນ າ ຍ ຄ ວ າ ມ",
      ]),

      h2("ຄຳແນະນຳປະຕິບັດ"),
      ...numbers([
        "ບ ັ ນ ທ ຶ ກ ທ ຸ ກ Transaction: ວ ັ ນ ທ ີ ຝ າ ກ ຖ ອ ນ ກ ຳ ໄ ລ ຂ ານ ທ ຶ ນ",
        "Statement ຈ າ ກ Broker: Save ໄ ວ ້ ທ ຸ ກ ເ ດ ື ອ ນ",
        "Exchange Rate: ບ ັ ນ ທ ຶ ກ ອ ັ ດ ຕ ານ ແ ລ ກ ປ ່ ຽ ນ ຕ ອ ນ ຖ ອ ນ",
        "ປ ຶ ກ ສ ານ ຜ ູ ້ ຊ ່ ຽ ວ ຊ ານ: ຖ ້ ານ ມ ີ ກ ຳ ໄ ລ ສ ູ ງ",
        "ຢ ່ ານ ຖ ອ ນ ໃ ຫ ຍ ່ ດ ຽ ວ: ແ ບ ່ ງ ຖ ອ ນ ຫ ຼ ານ ຄ ັ ້ ງ ຊ ່ ວ ຍ ໄ ດ ້ ໃ ນ ດ ້ ານ Compliance",
      ]),

      h2("ສ ະ ຫ ຼ ຸ ບ"),
      p("ໃ ນ ຕ ອ ນ ນ ີ ້ ກ ານ ບ ັ ງ ຄ ັ ບ ໃ ຊ ້ ກ ົ ດ ໝ ານ ພ ານ ສ ີ ກ ຽ ່ ວ ກ ັ ບ Forex Online ໃ ນ ລ ານ ຍ ັ ງ ບ ໍ ່ ຊ ັ ດ ເ ຈ ນ ແ ຕ ່ ການ ບ ັ ນ ທ ຶ ກ ຂ ້ ໍ ມ ູ ນ ທ ຸ ກ Transaction ໄ ວ ້ ຈ ະ ຊ ່ ວ ຍ ທ ່ ານ ໃ ນ ອ ະ ນ ານ ຄ ົ ດ ໄ ດ ້ ດ ີ"),
    ],
  },

  // 4. roadmap-becoming-trader
  {
    _type: "article",
    title: "Roadmap: ຈາກ Beginner → Professional Trader ໃຊ້ເວລາຫຼາຍແຄ?",
    slug: { _type: "slug", current: "roadmap-becoming-trader" },
    category: "education",
    excerpt: "ເສ ັ ້ ນ ທ ານ ກ ານ ເ ຕ ີ ບ ໂ ຕ ຈ າ ກ Beginner ຫ າ Professional Trader ໃ ຊ ້ ເ ວ ລ ານ ຫ ຼ ານ ແ ຄ ? ແ ລ ະ ຕ ້ ອ ງ ຮ ຽ ນ ຮ ູ ້ ຫ ຍ ັ ງ ໃ ນ ແ ຕ ່ ລ ະ ຂ ັ ້ ນ?",
    readTime: 14,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ຄ ວ າ ມ ຈ ິ ງ: ການ ເ ປ ັ ນ Professional Trader"),
      p("ຄ ວ າ ມ ຈ ິ ງ ທ ີ ່ ຫ ຼ າ ຍ ຄ ົ ນ ບ ໍ ່ ຢ ານ ຍ ອ ມ ຮ ັ ບ: ການ ເ ປ ັ ນ Profitable Trader ໃ ຊ ້ ເ ວ ລ ານ 1-3 ປ ີ ຂ ຶ ້ ນ ໄ ປ ບ ໍ ່ ແ ມ ່ ນ 1-2 ເ ດ ື ອ ນ"),
      p("ແ ຕ ່ ຖ ້ ານ ຮ ຽ ນ ຢ ່ ານ ຖ ູ ກ ທ ານ ງ ໃ ຊ ້ ກ ານ ຮ ຽ ນ ຮ ູ ້ ທ ີ ່ ດ ີ ແ ລ ະ ມ ີ Mentor ທ ີ ່ ດ ີ ສ ານ ມ ານ ດ ຶ ງ ລ ະ ຍ ະ ເ ວ ລ ານ ນ ັ ້ ນ ໃ ຫ ້ ສ ັ ້ ນ ລ ົ ງ"),

      h2("Phase 1: Beginner (0-3 ເດືອນ)"),
      p("ເ ປ ົ ້ ານ ໝ ານ: ຮ ຽ ນ ພ ື ້ ນ ຖ ານ ໃ ຫ ້ ຄ ົ ບ"),
      ...bullets([
        "✅ ຮຽນ: Forex ແ ມ ່ ນ ຫ ຍ ັ ງ, Pip, Lot, Leverage, Margin",
        "✅ ຮຽນ: Candlestick, Support/Resistance, Trend",
        "✅ ຕ ິ ດ ຕ ານ ຕ ັ ້ ງ MT4/MT5 ທ ົ ດ ລ ອ ງ Demo",
        "✅ ຮ ູ ້ ຈ ັ ກ Economic Calendar ແ ລ ະ ຂ ່ ານ ສ ຳ ຄ ັ ນ",
        "❌ ຢ ່ ານ: ໃ ສ ່ ເ ງ ິ ນ ຈ ິ ງ ໃ ນ Phase ນ ີ ້",
      ]),

      h2("Phase 2: Developing (3-12 ເດືອນ)"),
      p("ເ ປ ົ ້ ານ ໝ ານ: ຊ ອ ກ Strategy ທ ີ ່ ໃ ຊ ້ ໄ ດ ້"),
      ...bullets([
        "✅ Demo Trade ດ ້ ວ ຍ Strategy ໜ ຶ ່ ງ ຢ ່ ານ ໜ ້ ອ ຍ 3 ເ ດ ື ອ ນ",
        "✅ Trading Journal: ບ ັ ນ ທ ຶ ກ ທ ຸ ກ Trade",
        "✅ ຮ ຽ ນ Risk Management ຢ ່ ານ ຈ ິ ງ ຈ ັ ງ",
        "✅ ຮ ຽ ນ Trading Psychology",
        "✅ ເ ລ ີ ່ ມ Micro Account ($50-100) ຖ ້ ານ Demo ດ ີ ສ ະ ໝ ໍ ່ ສ ານ",
        "❌ ຢ ່ ານ: ປ ່ ຽ ນ Strategy ທ ຸ ກ ອ ານ ທ ິ ດ",
      ]),

      h2("Phase 3: Consistent (1-2 ປ ີ)"),
      p("ເ ປ ົ ້ ານ ໝ ານ: ກ ຳ ໄ ລ Consistent 3-6 ເ ດ ື ອ ນ ຕ ິ ດ ຕ ່ ອ"),
      ...bullets([
        "✅ Real Account ທ ຶ ນ $500-2,000",
        "✅ Win Rate ສ ະ ໝ ໍ ່ ສ ານ > 45% ກ ັ ບ R:R ດ ີ",
        "✅ ຄ ວ ບ ຄ ຸ ມ Emotion ໄ ດ ້ ດ ີ ຂ ຶ ້ ນ",
        "✅ Drawdown < 10% ຕ ່ ໍ ເ ດ ື ອ ນ",
        "✅ ມ ີ Trading Plan ທ ີ ່ ເ ຮ ັ ດ ວ ຽ ກ",
      ]),

      h2("Phase 4: Professional (2-3+ ປ ີ)"),
      p("ເ ປ ົ ້ ານ ໝ ານ: ລ ້ ຽ ງ ຊ ີ ບ ໄ ດ ້ ຈ າ ກ Forex"),
      ...bullets([
        "✅ Track Record 1+ ປ ີ ທ ີ ່ Verifiable",
        "✅ ຂ ຽ ນ ລ ານ ຍ ໄ ດ ້ ຈ ິ ງ ຈ ານ ກ Forex",
        "✅ Drawdown ຕ ່ ຳ ສ ະ ໝ ໍ ່ ສ ານ < 15%",
        "✅ ມ ີ Process ທ ີ ່ ຊ ັ ດ ເ ຈ ນ",
        "✅ ອ ານ ຈ ກ ານ ລ ົ ງ ທ ຶ ນ ໃ ຫ ຍ ່ ຂ ຶ ້ ນ",
      ]),

      h2("ສ ານ ເ ຫ ດ ທ ີ ່ ຫ ຼ າ ຍ ຄ ົ ນ ລ ້ ມ ເ ຫ ຼ ວ"),
      ...bullets([
        "❌ ຮ ຽ ນ ໄ ວ ເ ກ ີ ນ ໄ ປ: ໂ ດ ດ ໃ ສ ່ Real ກ ່ ອ ນ Demo ໃ ຫ ້ ດ ີ",
        "❌ ທ ຶ ນ ໜ ້ ອ ຍ ເ ກ ີ ນ: Over-leverage ເ ພ ື ່ ອ ກ ຳ ໄ ລ ໄ ວ",
        "❌ ຂ ານ ທ ຶ ນ ໃ ຫ ຍ ່ ໜ ຶ ່ ງ ຄ ັ ້ ງ: ທ ໍ ລ ໍ ລ ະ ການ ແ ລ ້ ວ ຢ ຸ ດ",
        "❌ ບ ໍ ່ ມ ີ Journal: ບ ໍ ່ ຮ ູ ້ ວ ່ ານ ຜ ິ ດ ຢ ູ ່ ໃ ສ",
        "❌ Emotion: Revenge Trade, FOMO, Greed",
      ]),

      h2("ຄ ຳ ແ ນ ະ ນ ຳ ສ ຳ ລ ັ ບ Trader ລ ານ"),
      ...bullets([
        "ຕ ິ ດ ຕ ານ ໃ ຊ ້ ຊ ຸ ມ ຊ ົ ນ: Telegram LFT, LaoForexTrader Community",
        "ຮ ຽ ນ ຈ າ ກ ຜ ູ ້ ທ ີ ່ Profitable ຈ ິ ງ ໆ ກ ່ ວ ນ YouTube Random",
        "Mentor: ຊ ອ ກ Mentor ທ ີ ່ ມ ີ Track Record ຈ ິ ງ",
        "ຮ ຽ ນ ພ ານ ສ ານ ລ ານ: Content LFT ທ ຸ ກ ໂ ຕ ຟ ຣ ີ",
        "ອ ົ ດ ທ ົ ນ: ສ ານ ເ ດ ດ ຈ ຳ ຄ ື ຄ ວ າ ມ ຍ ່ ານ ໃ ຈ ບ ໍ ່ ແ ມ ່ ນ ຄ ວ າ ມ ສ ານ ມ ານ ດ",
      ]),
    ],
  },

  // 5. psychology-of-trading
  {
    _type: "article",
    title: "Trading Psychology: ຄວບຄຸມ Emotion ໃຫ້ Trade ໄດ້ Consistent",
    slug: { _type: "slug", current: "psychology-of-trading" },
    category: "education",
    excerpt: "Trading Psychology ຄ ື ສ ານ ເ ຫ ດ ໃ ຫ ຍ ່ ທ ີ ່ ສ ຸ ດ ທ ີ ່ Trader ຂ ານ ທ ຶ ນ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ຄ ວ ບ ຄ ຸ ມ Fear, Greed, Revenge Trade",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ເປ ັ ນ ຫ ຍ ັ ງ Psychology ຈ ຶ ່ ງ ສ ຳ ຄ ັ ນ?"),
      p("ການ ສຶ ກ ສ ານ ຂ ອ ງ Van Tharp ພ ົ ບ ວ ່ ານ: 60% ຂ ອ ງ ຄ ວ າ ມ ສ ຳ ເ ລ ັ ດ ໃ ນ Trading ຂ ຶ ້ ນ ກ ັ ບ Psychology 30% ຂ ຶ ້ ນ ກ ັ ບ Money Management ແ ລ ະ 10% ຂ ຶ ້ ນ ກ ັ ບ Strategy"),
      p("ນ ັ ກ Trade ຫ ຼ າ ຍ ຄ ົ ນ ມ ີ Strategy ດ ີ ແ ຕ ່ Emotion ທ ຳ ລ ານ ທ ຸ ກ ຢ ່ ານ"),

      h2("Emotion ທີ ່ ສ ້ ານ ບ ັ ນ ຫ ານ ໃ ຫ ຍ ່ ທ ີ ່ ສ ຸ ດ"),

      h3("1. Fear (ຄ ວ າ ມ ກ ຽ ວ)"),
      ...bullets([
        "Fear of Loss: ອ ອ ກ Trade ໄ ວ ກ ່ ອ ນ Target ຮ ອ ດ",
        "Fear of Missing Out (FOMO): ໂ ດ ດ ເ ຂ ົ ້ ານ Trade ໂ ດ ຍ ບ ໍ ່ ມ ີ Setup",
        "Fear After Loss: ກ ຽ ວ Trade ຫ ຼ ັ ງ ຂ ານ ທ ຶ ນ ໃ ຫ ຍ ່",
      ]),

      h3("2. Greed (ຄ ວ າ ມ ໂ ລ ບ)"),
      ...bullets([
        "Over-Trading: Trade ຫ ຼ ານ ເ ກ ີ ນ ໄ ປ ຢ ານ ໃ ຫ ້ ຮ ອ ດ Target",
        "Over-Leveraging: Lot ໃ ຫ ຍ ່ ເ ກ ີ ນ ໄ ປ ຢ ານ ກ ຳ ໄ ລ ໄ ວ",
        "ບ ໍ ່ ອ ອ ກ: ຖ ື Position ຍ ານ ກ ວ່ ານ Plan",
      ]),

      h3("3. Revenge Trading"),
      ...bullets([
        "ຫ ຼ ັ ງ ຂ ານ ທ ຶ ນ Trade ໄ ວ ທ ັ ນ ທ ີ ເ ພ ື ່ ອ ຄ ື ນ ທ ຶ ນ",
        "ສ ່ ວ ນ ໃ ຫ ຍ ່ ຂ ານ ທ ຶ ນ ຊ ້ ານ ກ ວ່ ານ ໃ ນ ການ Revenge",
        "ສ ານ ເ ຫ ດ ທ ົ ່ ວ ໄ ປ ຂ ອ ງ Account Blow",
      ]),

      h3("4. Overconfidence"),
      ...bullets([
        "ຫ ຼ ັ ງ Winning Streak ເ ພ ີ ່ ມ Risk ຫ ຼ ານ ເ ກ ີ ນ ໄ ປ",
        "ຄ ິ ດ ວ ່ ານ ຕ ົ ນ ເ ອ ງ ຮ ູ ້ ທ ຸ ກ ຢ ່ ານ ແ ລ ້ ວ",
        "ບ ໍ ່ ຢ ຽ ກ ລ ະ ວ ັ ງ Risk ອ ີ ກ",
      ]),

      h2("ວ ິ ທ ີ ຈ ັ ດ ການ Emotion"),
      h3("1. Trading Rules ທ ີ ່ ເ ຄ ັ່ ງ ຄ ັ ດ"),
      ...bullets([
        "ຂ ຽ ນ Rules ລ ວ ງ ໜ ້ ານ: Entry, Exit, Risk ທ ຸ ກ ຢ ່ ານ",
        "ປ ະ ຕ ິ ບ ັ ດ ຕ ານ Rules ໂ ດ ຍ ບ ໍ ່ ຂ ຶ ້ ນ ກ ັ ບ Emotion",
        "ຢ ຸ ດ Trade ເ ມ ື ່ ອ ຮ ອ ດ Daily Loss Limit",
      ]),

      h3("2. Trading Journal"),
      ...bullets([
        "ບ ັ ນ ທ ຶ ກ Emotion ໃ ນ ທ ຸ ກ Trade: ຮ ູ ້ ສ ຶ ກ ຫ ຍ ັ ງ ກ ່ ອ ນ/ຫ ຼ ັ ງ",
        "Pattern ຈ ະ ສ ະ ແ ດ ງ ໃ ຫ ້ ເ ຫ ັ ນ ວ ່ ານ Emotion ໃ ດ ສ ້ ານ ບ ັ ນ ຫ ານ",
        "ກ ວ ດ Journal ທ ຸ ກ ອ ານ ທ ິ ດ",
      ]),

      h3("3. ຫ ຼ ຸ ດ Stress"),
      ...bullets([
        "Trade ດ ້ ວ ຍ Lot ທ ີ ່ ບ ໍ ່ ເ ຄ ຣ ຽ ດ: ຖ ້ ານ ກ ັ ງ ວ ົ ນ Lot ໃ ຫ ຍ ່ ກ ວ່ ານ",
        "ຢ ່ ານ Trade ດ ້ ວ ຍ ທ ຶ ນ ທ ີ ່ ສ ູ ນ ເ ສ ຍ ບ ໍ ່ ໄ ດ ້",
        "ພ ັ ກ: ຖ ້ ານ ຂ ານ ທ ຶ ນ ຕ ິ ດ ຕ ່ ໍ 3 ວ ັ ນ ໃ ຫ ້ ພ ັ ກ 1-2 ວ ັ ນ",
      ]),

      h3("4. Process-Oriented ບ ໍ ່ ໃ ຊ ້ Result-Oriented"),
      p("Trader ທ ີ ່ ດ ີ ໃ ຫ ້ ຄ ວ າ ມ ສ ຳ ຄ ັ ນ ກ ັ ບ: ປ ະ ຕ ິ ບ ັ ດ ຕ ານ Plan ຖ ູ ກ ຕ ້ ອ ງ ໄ ຫ ມ? ຫ ຼ ື ຜ ົ ນ ຂ ອ ງ ແ ຕ ່ ລ ະ Trade ບ ໍ ່ ສ ຳ ຄ ັ ນ ສ ານ ຂ ອ ງ ດ ີ ຈ ະ ຕ ານ ມ າ ເ ອ ງ"),

      h2("ສ ັ ນ ຍ ານ ທ ີ ່ ຕ ້ ອ ງ ຢ ຸ ດ Trade"),
      ...bullets([
        "ຮ ູ ້ ສ ຶ ກ Angry ຫ ຼ ັ ງ ຂ ານ ທ ຶ ນ",
        "ຢ ານ Trade ທ ຸ ກ Candle",
        "ຂ ານ ທ ຶ ນ Daily Limit ແ ລ ້ ວ ຍ ັ ງ ຢ ານ ດ ຶ ງ ທ ຶ ນ ຄ ື ນ",
        "ບ ໍ ່ ສ ານ ມ ານ ດ ຕ ິ ດ ຕ ານ Plan ໄ ດ ້",
        "ຄ ິ ດ ຖ ຶ ງ ແ ຕ ່ ເ ງ ິ ນ ທ ີ ່ ຂ ານ ທ ຶ ນ ໄ ປ",
      ]),
    ],
  },

  // 6. risk-management-basics
  {
    _type: "article",
    title: "Risk Management ພື ້ ນ ຖ ານ: ຮ ັ ກ ສ ານ ທ ຶ ນ ໃ ຫ ້ ຢ ູ ່ ໃ ນ ຕ ະ ຫ ຼ ານ",
    slug: { _type: "slug", current: "risk-management-basics" },
    category: "education",
    excerpt: "Risk Management ຄ ື ທ ັ ກ ສ ານ ທ ີ ່ ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ ສ ຳ ລ ັ ບ Trader ທ ຸ ກ ລ ະ ດ ັ ບ ຮ ຽ ນ ຮ ູ ້ Rule 1-2% ແ ລ ະ ວ ິ ທ ີ ຮ ັ ກ ສ ານ Account ໃ ຫ ້ ຢ ູ ່",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ເ ປ ັ ນ ຫ ຍ ັ ງ Risk Management ຈ ຶ ່ ງ ສ ຳ ຄ ັ ນ?"),
      p("ນ ັ ກ Trade ທ ີ ່ ດ ີ ທ ີ ່ ສ ຸ ດ ໃ ນ ໂ ລ ກ ບ ໍ ່ ໄ ດ ້ ຊ ະ ນ ະ ທ ຸ ກ Trade ແ ຕ ່ ພ ວ ກ ເ ຂ ົ ານ ມ ີ Risk Management ທ ີ ່ ດ ີ ທ ຳ ໃ ຫ ້ ກ ຳ ໄ ລ ຕ ່ ໍ ເ ນ ື ່ ອ ງ"),
      p("ຕ ົ ວ ຢ ່ ານ: Win Rate 40% ກ ັ ບ R:R 1:3 ຍ ັ ງ ກ ຳ ໄ ລ ໄ ດ ້! ຊ ະ ນ ານ 4 ຈ າ ກ 10 Trade ກ ຳ ໄ ລ 4×3 = 12 Units ຂ ານ ທ ຶ ນ 6×1 = 6 Units ກ ຳ ໄ ລ ສ ຸ ດ ທ ້ ານ = 6 Units"),

      h2("Rule 1%: ຫ ຼ ັ ກ ການ ພ ື ້ ນ ຖ ານ"),
      p("ຢ ່ ານ Risk ເ ກ ີ ນ 1-2% ຂ ອ ງ Account ຕ ່ ໍ 1 Trade:"),
      ...bullets([
        "Account $1,000 → Risk ສ ູ ງ ສ ຸ ດ $10-20 ຕ ່ ໍ Trade",
        "Account $5,000 → Risk ສ ູ ງ ສ ຸ ດ $50-100 ຕ ່ ໍ Trade",
        "ໃ ຊ ້ Rule ນ ີ ້ ທ ຸ ກ Trade ບ ໍ ່ ວ ່ ານ ໝ ້ ັ ນ ໃ ຈ ສ ້ ານ ໃ ດ",
        "ຊ ະ ນ ານ ຕ ່ ໍ ເ ນ ື ່ ອ ງ Account ຈ ະ ເ ຕ ີ ບ ໂ ຕ",
      ]),

      h2("Stop Loss: ບ ໍ ່ ເ ລ ື ອ ກ ໄ ດ ້"),
      ...bullets([
        "ທ ຸ ກ Trade ຕ ້ ອ ງ ມ ີ Stop Loss ກ ່ ອ ນ Enter",
        "ວ ານ Stop Loss ກ ່ ອ ນ: ໃ ນ ທ ານ ງ ວ ິ ທ ີ",
        "ຢ ່ ານ ເ ລ ື່ ອ ນ Stop ໃ ຫ ້ ໃ ຫ ຍ ່ ຂ ຶ ້ ນ: ເ ວ ້ ນ Trailing Stop",
        "Stop = ຈ ຸ ດ ທ ີ ່ Theory ຜ ິ ດ ຢ ່ ານ ຕ ່ ຳ ເ ທ ່ ານ ທ ີ ່ ລ ານ ຄ ານ ຮ ອ ດ",
        "Stop ໂ ດ ຍ ອ ີ ງ ATR: Stop = ATR × 1.5-2",
      ]),

      h2("R:R Ratio (Risk:Reward)"),
      p("R:R ຄ ື ອ ັ ດ ຕ ານ ສ ່ ວ ນ ລ ະ ຫ ວ ່ ານ ຄ ວ າ ມ ສ ່ ຽ ງ ແ ລ ະ ກ ຳ ໄ ລ ທ ີ ່ ຄ ານ ດ ຫ ວ ັ ງ:"),
      ...bullets([
        "R:R 1:1 = Risk $10 ຫ ວ ັ ງ ກ ຳ ໄ ລ $10",
        "R:R 1:2 = Risk $10 ຫ ວ ັ ງ ກ ຳ ໄ ລ $20",
        "R:R 1:3 = Risk $10 ຫ ວ ັ ງ ກ ຳ ໄ ລ $30",
        "ຢ ່ ານ Trade ດ ້ ວ ຍ R:R ຕ ່ ຳ ກ ວ່ ານ 1:1.5",
        "R:R 1:2+ ໃ ຊ ້ ກ ັ ບ Win Rate 40%+ ກ ໍ ກ ຳ ໄ ລ",
      ]),

      h2("Position Sizing ສ ູ ດ"),
      ...numbers([
        "ກ ຳ ນ ົ ດ Risk Amount: Account × Risk % (1%)",
        "ກ ຳ ນ ົ ດ Stop Loss: ຈ ຳ ນ ວ ນ Pips",
        "Lot Size = Risk Amount / (Stop Pips × Pip Value)",
        "ຕ ົ ວ ຢ ່ ານ: Account $1000, Risk 1% = $10, SL 30 Pips",
        "Lot = $10 / (30 × $1) = 0.33 Lot → ໃ ຊ ້ 0.3 Lot",
      ]),

      h2("ກ ານ ຄ ຸ ້ ມ ຄ ອ ງ Drawdown"),
      ...bullets([
        "Drawdown 10%: ປ ົ ກ ກ ະ ຕ ິ ກ ວ ດ Strategy",
        "Drawdown 15-20%: Reduce Lot Size ລ ົ ງ 50%",
        "Drawdown 25%+: ຢ ຸ ດ Trade ກ ວ ດ ສ ອ ບ ທ ຸ ກ ຢ ່ ານ",
        "ຫ ຼ ັ ງ Drawdown 20%: ຕ ້ ອ ງ ກ ຳ ໄ ລ 25% ຈ ຶ ່ ງ ຄ ື ນ ສ ູ ່ ເ ດ ີ ມ",
        "ຫ ຼ ັ ງ Drawdown 50%: ຕ ້ ອ ງ ກ ຳ ໄ ລ 100% ຈ ຶ ່ ງ ຄ ື ນ!",
      ]),
    ],
  },

  // 7. scalping-strategy
  {
    _type: "article",
    title: "Scalping Strategy: ກ ຳ ໄ ລ 5-20 Pips ຕ ່ ໍ Trade",
    slug: { _type: "slug", current: "scalping-strategy" },
    category: "education",
    excerpt: "Scalping ຄ ື ການ Trade ໄ ວ ທ ີ ່ ສ ຸ ດ ກ ຳ ໄ ລ 5-20 Pips ຕ ່ ໍ Trade ທ ຳ ຫ ຼ ານ Trade ຕ ່ ໍ ວ ັ ນ ຮ ຽ ນ ຮ ູ ້ ວ ່ ານ ເ ໝ ານ ະ ກ ັ ບ ທ ່ ານ ໄ ຫ ມ",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Scalping ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Scalping ຄ ື Style ການ Trade ທ ີ ່ ໄ ວ ທ ີ ່ ສ ຸ ດ ຖ ື Position ພ ຽ ງ ວ ິ ນ ານ ທ ີ - ນ ານ ທ ີ ກ ຳ ໄ ລ 5-20 Pips ຕ ່ ໍ Trade ແ ລ ະ ທ ຳ ຫ ຼ ານ Trade/ວ ັ ນ"),
      p("Scalper ຕ ້ ອ ງ ການ: Spread ຕ ່ ຳ, Execution ໄ ວ, ສ ະ ມ າ ທ ິ ສ ູ ງ, ແ ລ ະ ເ ວ ລ ານ ຫ ຼ ານ ຢ ູ ່ ໜ ້ ານ Screen"),

      h2("Scalping ເ ໝ ານ ະ ກ ັ ບ ໃ ຜ?"),
      ...bullets([
        "✅ ຄ ົ ນ ທ ີ ່ ມ ີ ເ ວ ລ ານ ຢ ູ ່ ໜ ້ ານ Chart 4-8 ຊ ົ ່ ວ ໂ ມ ງ/ວ ັ ນ",
        "✅ ຄ ົ ນ ທ ີ ່ ຕ ັ ດ ສ ິ ນ ໃ ຈ ໄ ວ ບ ໍ ່ ຊ ້ ານ",
        "✅ ຄ ົ ນ ທ ີ ່ ຄ ວ ບ ຄ ຸ ມ Emotion ໄ ດ ້ ດ ີ",
        "❌ ຄ ົ ນ ທ ີ ່ ມ ີ ວ ຽ ກ ທ ຳ ງ ານ ປ ະ ຈ ຳ",
        "❌ Beginner: Scalping ຍ ານ ເ ກ ີ ນ ໄ ປ",
        "❌ ຄ ົ ນ ທ ີ ່ Stress ງ ່ ານ",
      ]),

      h2("ຕ ້ ອ ງ ການ ຫ ຍ ັ ງ ສ ຳ ລ ັ ບ Scalping?"),
      ...bullets([
        "ECN Broker: Spread ຕ ່ ຳ EUR/USD < 0.5 Pip",
        "Low Latency: ການ ເ ຊ ື ່ ອ ມ ຕ ່ ໍ ໄ ວ ຫ ຼ ື VPS ໃ ກ ້ Server",
        "Timeframe M1/M5: Chart ໄ ວ ທ ີ ່ ສ ຸ ດ",
        "Platform: MT4/MT5 ຫ ຼ ື cTrader",
        "Screen ຫ ຼ ານ: ເ ຫ ັ ນ ຫ ຼ ານ Chart ພ ້ ອ ມ ກ ັ ນ",
      ]),

      h2("Scalping Setup ທ ີ ່ ນ ິ ຍ ົ ມ"),
      h3("Setup 1: EMA Scalp"),
      ...numbers([
        "ໃ ຊ ້ EMA 8 ແ ລ ະ EMA 21 ໃ ນ M5",
        "EMA 8 Cross EMA 21 ຂ ຶ ້ ນ = Buy Signal",
        "EMA 8 Cross EMA 21 ລ ົ ງ = Sell Signal",
        "Confirm ດ ້ ວ ຍ MACD Histogram",
        "Target 10-15 Pips, Stop 8-10 Pips",
      ]),

      h3("Setup 2: S/R Scalp"),
      ...numbers([
        "ກ ຳ ນ ົ ດ Key S/R ໃ ນ H1",
        "ລ ໍ ລ ານ ຄ ານ ມ ານ ຫ ານ S/R ໃ ນ M5",
        "ໃ ຊ ້ Candle Pattern Confirm",
        "Entry ດ ້ ວ ຍ Limit Order",
        "Target: 10-20 Pips, Stop: 5-8 Pips",
      ]),

      h2("ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ ທ ົ ່ ວ ໄ ປ"),
      ...bullets([
        "❌ Over-Trading: Trade ຫ ຼ ານ ເ ກ ີ ນ ໄ ປ ຈ ົ ນ Spread ກ ິ ນ ກ ຳ ໄ ລ",
        "❌ Revenge Scalping: ຂ ານ ທ ຶ ນ ແ ລ ້ ວ Trade ໄ ວ ຢ ານ ຄ ື ນ",
        "❌ Spread ສ ູ ງ: Scalp ດ ້ ວ ຍ Market Maker Spread ກ ວ ້ ານ = ຂ ານ ທ ຶ ນ",
        "❌ ໃ ນ ຊ ່ ວ ງ ງ ຽ ບ: Scalp ຊ ່ ວ ງ Session ທ ີ ່ ຄ ຶ ກ ຄ ື ້ ນ ເ ທ ່ ານ ນ ັ ້ ນ",
        "❌ ບ ໍ ່ ມ ີ Stop: Scalp ຕ ້ ອ ງ Stop ເ ຄ ັ່ ງ ທ ີ ່ ສ ຸ ດ",
      ]),
    ],
  },

  // 8. price-action-trading
  {
    _type: "article",
    title: "Price Action Trading: Trade ໂ ດ ຍ ບ ໍ ່ ໃ ຊ ້ Indicator",
    slug: { _type: "slug", current: "price-action-trading" },
    category: "education",
    excerpt: "Price Action ຄ ື ການ ອ ານ ຕ ະ ຫ ຼ ານ ຈ າ ກ ການ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຂ ອ ງ ລ ານ ຄ ານ ລ ້ ວ ນ ໆ ໂ ດ ຍ ບ ໍ ່ ໃ ຊ ້ Indicator ກ ານ ທ ີ ່ ຕ ້ ອ ງ ໃ ຊ ້ ຄ ວ ານ ມ ຄ ິ ດ ສ ູ ງ ກ ວ່ ານ",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Price Action ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Price Action Trading ຄ ື ການ ວ ິ ເ ຄ ານ ະ ແ ລ ະ Trade ໂ ດ ຍ ໃ ຊ ້ ເ ພ ີ ່ ງ ການ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຂ ອ ງ ລ ານ ຄ ານ (Bare Chart) ບ ໍ ່ ໃ ຊ ້ Indicator ໃ ດ"),
      p("ຮ ີ ດ ກ ຳ: ລ ານ ຄ ານ ສ ະ ທ ້ ອ ນ ທ ຸ ກ ຂ ້ ໍ ມ ູ ນ ໃ ນ ຕ ະ ຫ ຼ ານ Indicator ແ ມ ່ ນ ຂ ້ ໍ ມ ູ ນ ທ ີ ່ ຊ ້ ານ (Lagging) ລ ານ ຄ ານ ຈ ິ ງ ໆ ບ ໍ ່ ຊ ້ ານ"),

      h2("ເ ຄ ື ່ ອ ງ ມ ື Price Action"),
      h3("1. Candlestick Patterns"),
      ...bullets([
        "Pin Bar: Wick ຍ ານ ສ ະ ແ ດ ງ Rejection",
        "Inside Bar: Consolidation ກ ່ ອ ນ Breakout",
        "Engulfing: Reversal ທ ີ ່ ແ ຮ ງ",
        "Doji: ຕ ະ ຫ ຼ ານ ລ ັ ງ ເ ລ",
      ]),

      h3("2. Market Structure"),
      ...bullets([
        "Higher Highs/Higher Lows = Uptrend",
        "Lower Highs/Lower Lows = Downtrend",
        "Break of Structure (BOS) = ທ ິ ດ ທ ານ ປ ່ ຽ ນ",
        "Change of Character (ChoCh) = ສ ັ ນ ຍ ານ Reversal",
      ]),

      h3("3. Supply ແ ລ ະ Demand Zones"),
      ...bullets([
        "Demand Zone: ບ ່ ອ ນ ທ ີ ່ ຜ ູ ້ ຊ ື ້ ສ ົ ນ ໃ ຈ ຫ ຼ ານ = Support ທ ີ ່ ແ ຮ ງ",
        "Supply Zone: ບ ່ ອ ນ ທ ີ ່ ຜ ູ ້ ຂ ານ ສ ົ ນ ໃ ຈ ຫ ຼ ານ = Resistance ທ ີ ່ ແ ຮ ງ",
        "ຊ ອ ກ Zone ທ ີ ່ ລ ານ ຄ ານ ອ ອ ກ ໄ ວ (Explosive Move)",
      ]),

      h2("Price Action Setup ທ ີ ່ ນ ິ ຍ ົ ມ"),
      h3("Pin Bar Reversal"),
      ...numbers([
        "ຫ ານ Pin Bar ຢ ູ ່ Key S/R Level",
        "Pin Bar ຕ ້ ອ ງ ມ ີ Wick ຢ ່ ານ ໜ ້ ອ ຍ 2/3 ຂ ອ ງ Candle",
        "Body ໜ ້ ອ ຍ ຢ ູ ່ ທ ານ ງ ດ ້ ານ ທ ີ ່ ຈ ະ ໄ ປ",
        "Entry: Break ຂ ອ ງ Nose ຂ ອ ງ Pin Bar",
        "Stop: ຢ ູ ່ ປ າ ຍ Wick",
      ]),

      h3("Inside Bar Breakout"),
      ...numbers([
        "ຫ ານ Inside Bar: Candle ທ ີ ່ 2 ຢ ູ ່ ໃ ນ Candle ທ ຳ ອ ິ ດ ທ ັ ງ ໝ ົ ດ",
        "Inside Bar = ຕ ະ ຫ ຼ ານ Compress ກ ຳ ລ ັ ງ",
        "Entry: Break ຂ ອ ງ High/Low ຂ ອ ງ Mother Bar",
        "Stop: ຝ ່ ານ ຕ ່ ານ ຂ ອ ງ Inside Bar",
        "Target: ອ ີ ງ ATR × 2",
      ]),

      h2("ຂ ້ ໍ ດ ີ ຂ ອ ງ Price Action"),
      ...bullets([
        "✅ ລ ານ ຄ ານ ບ ໍ ່ ຊ ້ ານ: ເ ຫ ັ ນ Signal ກ ່ ອ ນ Indicator",
        "✅ ໃ ຊ ້ ໄ ດ ້ ທ ຸ ກ Timeframe ແ ລ ະ Market",
        "✅ ເ ຂ ົ ້ ານ ໃ ຈ ຕ ະ ຫ ຼ ານ ໄ ດ ້ ຈ ິ ງ ໆ",
        "❌ ໃ ຊ ້ ເ ວ ລ ານ ຮ ຽ ນ ດ ົ ນ ກ ວ່ ານ Indicator",
        "❌ Subjective: ແ ຕ ່ ລ ະ ຄ ົ ນ ອ ານ ຕ ່ ານ ກ ັ ນ ໄ ດ ້",
      ]),
    ],
  },

  // 9. risk-reward-ratio
  {
    _type: "article",
    title: "Risk/Reward Ratio: ຕ ົ ວ ເ ລ ກ ທ ີ ່ ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ",
    slug: { _type: "slug", current: "risk-reward-ratio" },
    category: "education",
    excerpt: "Risk/Reward Ratio ຄ ື ຕ ົ ວ ເ ລ ກ ທ ີ ່ ກ ຳ ນ ົ ດ ວ ່ ານ ທ ່ ານ ຈ ະ ກ ຳ ໄ ລ ໄ ດ ້ ໃ ນ ໄ ລ ຍ ານ ຍ ານ ໂ ດ ຍ ບ ໍ ່ ຂ ຶ ້ ນ ກ ັ ບ Win Rate",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("R:R ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Risk/Reward Ratio (R:R) ຄ ື ອ ັ ດ ຕ ານ ສ ່ ວ ນ ລ ະ ຫ ວ ່ ານ ຈ ຳ ນ ວ ນ ທ ີ ່ ທ ່ ານ ຍ ອ ມ ສ ່ ຽ ງ (Stop Loss) ແ ລ ະ ຈ ຳ ນ ວ ນ ທ ີ ່ ທ ່ ານ ຫ ວ ັ ງ (Take Profit)"),
      p("R:R 1:2 ໝ ານ ຄ ວ ານ ມ ວ ່ ານ: ທ ່ ານ Risk $10 ເ ພ ື ່ ອ ຫ ວ ັ ງ ກ ຳ ໄ ລ $20"),

      h2("ຄ ວ ານ ມ ສ ຳ ຄ ັ ນ ຂ ອ ງ R:R"),
      p("ຕ ົ ວ ຢ ່ ານ Win Rate 40% ກ ັ ບ R:R ຕ ່ ານ ງ ໆ:"),
      ...bullets([
        "R:R 1:1 + Win 40% = ຂ ານ ທ ຶ ນ: (4×1) - (6×1) = -2",
        "R:R 1:2 + Win 40% = ກ ຳ ໄ ລ: (4×2) - (6×1) = +2",
        "R:R 1:3 + Win 40% = ກ ຳ ໄ ລ ດ ີ: (4×3) - (6×1) = +6",
        "R:R 1:3 + Win 33% = Break Even!",
      ]),

      h2("ຄ ຳ ນ ວ ນ R:R"),
      ...numbers([
        "ກ ຳ ນ ົ ດ Entry Price",
        "ກ ຳ ນ ົ ດ Stop Loss Distance (Pips/USD)",
        "ກ ຳ ນ ົ ດ Target Distance (Pips/USD)",
        "R:R = Target Distance / Stop Distance",
        "ຕ ົ ວ ຢ ່ ານ: Stop 30 Pips, Target 90 Pips → R:R = 90/30 = 1:3",
      ]),

      h2("R:R ຕ ່ ຳ ສ ຸ ດ ທ ີ ່ ຄ ວ ນ ໃ ຊ ້"),
      ...bullets([
        "Beginner: R:R 1:1.5 ຢ ່ ານ ໜ ້ ອ ຍ",
        "Intermediate: R:R 1:2",
        "Advanced Swing: R:R 1:3+",
        "ຢ ່ ານ Trade ດ ້ ວ ຍ R:R < 1:1",
      ]),

      h2("Win Rate ທ ີ ່ ຕ ້ ອ ງ ການ ຕ ານ ມ R:R"),
      ...bullets([
        "R:R 1:1 → ຕ ້ ອ ງ Win > 50%",
        "R:R 1:2 → ຕ ້ ອ ງ Win > 33%",
        "R:R 1:3 → ຕ ້ ອ ງ Win > 25%",
        "R:R 1:5 → ຕ ້ ອ ງ Win > 17%",
        "R:R ສ ູ ງ = ຕ ້ ອ ງ Win Rate ໜ ້ ອ ຍ ລ ົ ງ",
      ]),

      h2("ຊ ອ ກ Target ຕ ານ ມ R:R"),
      ...bullets([
        "Stop 20 Pips, Target R:R 1:2 → Target = 40 Pips",
        "Stop 50 Pips, Target R:R 1:3 → Target = 150 Pips",
        "ໃ ຊ ້ Fibonacci Extension ຫ ຼ ື Previous High/Low",
        "ຢ ່ ານ ຕ ັ ້ ງ Target ທ ີ ່ ມ ີ S/R ຂ ວ ານ ທ ານ ງ",
      ]),
    ],
  },

  // 10. market-structure-basics
  {
    _type: "article",
    title: "Market Structure: ຮ ຽ ນ ຮ ູ ້ ໂ ຄ ງ ສ ້ ານ ຕ ະ ຫ ຼ ານ",
    slug: { _type: "slug", current: "market-structure-basics" },
    category: "education",
    excerpt: "Market Structure ຄ ື ພ ື ້ ນ ຖ ານ ຂ ອ ງ Price Action Trading ຮ ຽ ນ ຮ ູ ້ HH HL LH LL ແ ລ ະ ວ ິ ທ ີ ໃ ຊ ້ ໃ ນ ການ Trade",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Market Structure ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Market Structure ຄ ື ໂ ຄ ງ ສ ້ ານ ຂ ອ ງ ການ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຂ ອ ງ ລ ານ ຄ ານ ໃ ນ ຮ ູ ບ ແ ບ ບ Highs ແ ລ ະ Lows ທ ີ ່ ສ ້ ານ ຂ ຶ ້ ນ ໃ ນ Chart"),
      p("ການ ເ ຂ ົ ້ ານ ໃ ຈ Market Structure ເ ປ ັ ນ ທ ັ ກ ສ ານ ຫ ຼ ັ ກ ຂ ອ ງ Price Action Trader"),

      h2("3 ສ ະ ຖ ານ ະ ຂ ອ ງ ຕ ະ ຫ ຼ ານ"),
      h3("1. Uptrend (ຂ ຶ ້ ນ)"),
      ...bullets([
        "Higher High (HH): Swing High ໃ ໝ ່ ສ ູ ງ ກ ວ່ ານ ເ ກ ່ ານ",
        "Higher Low (HL): Swing Low ໃ ໝ ່ ສ ູ ງ ກ ວ່ ານ ເ ກ ່ ານ",
        "Strategy: Buy ໃ ນ ຊ ່ ວ ງ Pullback (HL)",
        "ບ ໍ ່ Short ໃ ນ Uptrend ທ ີ ່ ແ ຮ ງ",
      ]),

      h3("2. Downtrend (ລ ົ ງ)"),
      ...bullets([
        "Lower High (LH): Swing High ໃ ໝ ່ ຕ ່ ຳ ກ ວ່ ານ ເ ກ ່ ານ",
        "Lower Low (LL): Swing Low ໃ ໝ ່ ຕ ່ ຳ ກ ວ່ ານ ເ ກ ່ ານ",
        "Strategy: Sell ໃ ນ ຊ ່ ວ ງ Pullback (LH)",
        "ບ ໍ ່ Buy ໃ ນ Downtrend ທ ີ ່ ແ ຮ ງ",
      ]),

      h3("3. Sideways/Range"),
      ...bullets([
        "ລ ານ ຄ ານ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ໃ ນ Range ທ ີ ່ ກ ຳ ນ ົ ດ",
        "HH ແ ລ ະ HL ບ ໍ ່ ຊ ັ ດ ເ ຈ ນ",
        "Strategy: Range Trading ຊ ື ້ Support ຂ ານ Resistance",
        "ລ ໍ Breakout ຈ າ ກ Range ກ ່ ອ ນ Trend Trade",
      ]),

      h2("Break of Structure (BOS)"),
      p("BOS ຄ ື ເ ມ ື ່ ອ ລ ານ ຄ ານ Break ຜ ່ ານ Swing High/Low ສ ຳ ຄ ັ ນ ສ ະ ແ ດ ງ ການ ປ ່ ຽ ນ ທ ິ ດ ທ ານ ທ ີ ່ ອ ານ ດ ຈ ະ ເ ກ ີ ດ ຂ ຶ ້ ນ"),
      ...bullets([
        "BOS ໃ ນ Uptrend: ລ ານ ຄ ານ Break ຕ ່ ຳ ກ ວ່ ານ HL ສ ຸ ດ ທ ້ ານ = ອ ານ ດ Trend ຈ ະ ກ ລ ັ ບ",
        "BOS ໃ ນ Downtrend: ລ ານ ຄ ານ Break ສ ູ ງ ກ ວ່ ານ LH ສ ຸ ດ ທ ້ ານ = ອ ານ ດ Trend ຈ ະ ກ ລ ັ ບ",
        "ຢ ່ ານ Counter-Trade ໂ ດ ຍ ບ ໍ ່ ມ ີ BOS Confirm",
      ]),

      h2("Change of Character (ChoCh)"),
      p("ChoCh ຄ ື ຮ ູ ບ ແ ບ ບ ທ ີ ່ ໃ ໝ ່ ກ ວ່ ານ BOS ທ ີ ່ ສ ະ ແ ດ ງ ການ ປ ່ ຽ ນ Structure ທ ີ ່ ຊ ັ ດ ເ ຈ ນ ກ ວ່ ານ"),
      ...bullets([
        "ໃ ຊ ້ ຢ ັ ້ ງ ຢ ື ນ ການ ກ ລ ັ ບ Trend",
        "ນ ິ ຍ ົ ມ ໃ ນ Smart Money Concept (SMC)",
        "ຮ ຽ ນ ຮ ູ ້ ຮ ່ ວ ມ ກ ັ ບ Order Blocks ແ ລ ະ FVG",
      ]),

      h2("ການ ໃ ຊ ້ Market Structure ໃ ນ ການ Trade"),
      ...numbers([
        "ກ ຳ ນ ົ ດ Structure ໃ ນ Higher Timeframe ກ ່ ອ ນ",
        "ຫ ານ ໂ ອ ກ ານ ດ Trade ໃ ນ ທ ິ ດ ທ ານ Structure",
        "ລ ໍ Pullback ກ ່ ອ ນ Entry",
        "Stop ຢ ູ ່ ຕ ່ ຳ ກ ວ່ ານ Swing Low (Long) ຫ ຼ ື ສ ູ ງ ກ ວ່ ານ Swing High (Short)",
        "Target: Swing High/Low ຖ ັ ດ ໄ ປ",
      ]),
    ],
  },
]

async function importArticles() {
  console.log("🚀 ເລ ີ ່ ມ ນ ຳ ເ ຂ ົ ້ ານ Batch 3 (10 ບ ົ ດ ຮ ຽ ນ)...")
  let success = 0, failed = 0

  for (const article of articles) {
    try {
      await client.createOrReplace({
        ...article,
        _id: `article-${article.slug.current}`,
      })
      console.log(`✅ ${article.title}`)
      success++
    } catch (err) {
      console.error(`❌ ${article.title}:`, err.message)
      failed++
    }
  }

  console.log(`\n══════════════════════════════`)
  console.log(`✅ ສ ຳ ເ ລ ັ ດ: ${success} ບ ົ ດ`)
  if (failed > 0) console.log(`❌ ລ ົ ້ ມ ເ ຫ ຼ ວ: ${failed} ບ ົ ດ`)
  console.log(`══════════════════════════════`)
}

importArticles().catch(console.error)
