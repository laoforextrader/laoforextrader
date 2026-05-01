// seed-education-batch1.js
// ນຳເຂົ້າ 10 ບທຮຽນ education ເຂົ້າ Sanity
// ວິທີໃຊ້: node seed-education-batch1.js

const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ຟັງຊັນສ້າງ block content ມາດຕະຖານ Sanity
function block(text, style = "normal") {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text, marks: [] }],
  }
}

function heading2(text) { return block(text, "h2") }
function heading3(text) { return block(text, "h3") }
function normal(text) { return block(text, "normal") }

function bulletList(items) {
  return items.map(item => ({
    _type: "block",
    _key: Math.random().toString(36).slice(2),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text: item, marks: [] }],
  }))
}

function numberList(items) {
  return items.map(item => ({
    _type: "block",
    _key: Math.random().toString(36).slice(2),
    style: "normal",
    listItem: "number",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2), text: item, marks: [] }],
  }))
}

// ===== ບທຮຽນທັງ 10 =====

const articles = [

  // ────────────────────────────────────────────────────────────
  // 1. Forex ແມ່ນຫຍັງ?
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Forex ແມ່ນຫຍັງ? ຕະຫຼາດການເງິນທີ່ໃຫຍ່ທີ່ສຸດໃນໂລກ",
    slug: { _type: "slug", current: "what-is-forex" },
    category: "education",
    excerpt: "Forex ຫຼື Foreign Exchange ຄືຕະຫຼາດແລກປ່ຽນເງິນຕາທີ່ໃຫຍ່ທີ່ສຸດໃນໂລກ ມູນຄ່າການຊື້ຂາຍກວ່າ $7.5 ລ້ານລ້ານ USD ຕໍ່ວັນ ຮຽນຮູ້ວ່າ Forex ເຮັດວຽກແນວໃດ ແລະ ເປັນຫຍັງຄົນລາວຫຼາຍຄົນຈຶ່ງສົນໃຈ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Forex ແມ່ນຫຍັງ?"),
      normal("Forex (Foreign Exchange) ຫຼື FX ຄືຕະຫຼາດການຊື້ຂາຍສະກຸນເງິນ ເຊັ່ນ USD, EUR, JPY, GBP ໂດຍຜ່ານ Broker ອອນລາຍ ຕະຫຼາດນີ້ເປີດ 24 ຊົ່ວໂມງ 5 ວັນຕໍ່ອາທິດ ແລະ ມີມູນຄ່າການຊື້ຂາຍສູງເຖິງ $7.5 ລ້ານລ້ານ USD ຕໍ່ວັນ"),
      normal("ຕ່າງຈາກຕະຫຼາດຫຸ້ນທີ່ຊື້ຂາຍໃນຕະຫຼາດສູນກາງ Forex ບໍ່ມີສູນກາງ (Decentralized) ການຊື້ຂາຍເກີດຂຶ້ນຜ່ານ Network ຂອງ Banks, Brokers ແລະ ນັກລົງທຶນທົ່ວໂລກ"),

      heading2("ຕະຫຼາດ Forex ໃຫຍ່ຂະໜາດໃດ?"),
      normal("ເພື່ອໃຫ້ເຂົ້າໃຈຂະໜາດຂອງ Forex ລອງປຽບທຽບ:"),
      ...bulletList([
        "ຕະຫຼາດ Forex: $7,500,000,000,000 (7.5 ລ້ານລ້ານ) USD ຕໍ່ວັນ",
        "ຕະຫຼາດຫຸ້ນ NYSE (ໃຫຍ່ທີ່ສຸດໃນໂລກ): $22,000,000,000 (22 ພັນລ້ານ) USD ຕໍ່ວັນ",
        "ຕະຫຼາດ Forex ໃຫຍ່ກວ່າຕະຫຼາດຫຸ້ນ ປະມານ 340 ເທົ່າ!",
      ]),
      normal("ຂະໜາດດັ່ງກ່າວໝາຍຄວາມວ່າ ບໍ່ມີໃຜຄວບຄຸມລາຄາໄດ້ຄົນດຽວ ທຳໃຫ້ຕະຫຼາດ Forex ໂປ່ງໃສ ແລະ ຍາກທີ່ຈະ Manipulate"),

      heading2("ໃຜຊື້ຂາຍໃນ Forex?"),
      ...bulletList([
        "Central Banks (ທະນາຄານກາງ): Fed, ECB, BOJ ຊື້ຂາຍເພື່ອຄຸ້ມຄອງຄ່າເງິນ",
        "Commercial Banks: JP Morgan, Goldman Sachs ຊື້ຂາຍເພື່ອລູກຄ້າ",
        "Hedge Funds: ທຶນຂະໜາດໃຫຍ່ຊ່ວຍຫາກຳໄລ",
        "Retail Traders (ຄົນທົ່ວໄປ): ຄືພວກເຮົາ ໃຊ້ Broker ອອນລາຍ",
        "ບໍລິສັດ (Corporations): ຊື້ຂາຍເງິນຕາເພື່ອ Hedge ຄວາມສ່ຽງ",
      ]),

      heading2("Forex ເຮັດວຽກແນວໃດ?"),
      normal("ໃນ Forex ທ່ານ ຊື້/ຂາຍ Currency Pair ເຊັ່ນ EUR/USD ສະເໝີ:"),
      ...numberList([
        "EUR ຄື Base Currency (ສະກຸນທີ່ທ່ານຊື້/ຂາຍ)",
        "USD ຄື Quote Currency (ສະກຸນທີ່ໃຊ້ຈ່າຍ)",
        "ລາຄາ 1.0850 ໝາຍຄວາມວ່າ EUR 1 = USD 1.0850",
        "ຖ້າທ່ານຄາດວ່າ EUR ຈະແຂງ → ຊື້ (Buy/Long) EUR/USD",
        "ຖ້າທ່ານຄາດວ່າ EUR ຈະອ່ອນ → ຂາຍ (Sell/Short) EUR/USD",
      ]),

      heading2("ເວລາຊື້ຂາຍ Forex"),
      normal("Forex ເປີດ 24 ຊົ່ວໂມງ ແຕ່ວ່ານທີ່ຄຶກຄື້ນຕ່າງກັນ:"),
      ...bulletList([
        "Sydney Session: 04:00-13:00 (ລາວ) — ງຽບ, Spread ສູງ",
        "Tokyo Session: 07:00-16:00 (ລາວ) — JPY pairs ເຄື່ອນໄຫວດີ",
        "London Session: 14:00-23:00 (ລາວ) — ຄຶກຄື້ນທີ່ສຸດ EUR/GBP",
        "New York Session: 19:00-04:00 (ລາວ) — USD pairs ເຄື່ອນໄຫວດີ",
        "London+NY Overlap: 19:00-23:00 (ລາວ) — ດີທີ່ສຸດສຳລັບ Trader ລາວ",
      ]),

      heading2("ເປັນຫຍັງຄົນລາວຫຼາຍຄົນຈຶ່ງສົນໃຈ Forex?"),
      ...bulletList([
        "ເລີ່ມຕົ້ນດ້ວຍທຶນໜ້ອຍ: Broker ຫຼາຍແຫ່ງຍອມຮັບເງິນຝາກຕ່ຳ $10-50",
        "ເຮັດວຽກໄດ້ຈາກທຸກທີ່: ຕ້ອງການແຕ່ Internet ແລະ ສະມາດໂຟນ",
        "ກຳໄລໄດ້ທັງ Up ແລະ Down: ບໍ່ຄືຫຸ້ນທີ່ກຳໄລໄດ້ສະເພາະຕອນຂຶ້ນ",
        "Leverage ສູງ: ຄວບຄຸມທຶນຫຼາຍກວ່າທຶນຕົວຈິງ (ລະວັງ! ມີຄວາມສ່ຽງ)",
        "ຕະຫຼາດໃຫຍ່: ຂໍ້ມູນຂ່າວສານຫຼາຍ ຮຽນຮູ້ໄດ້ຟຣີ",
      ]),

      heading2("Forex ມີຄວາມສ່ຽງໄຫມ?"),
      normal("ມີຄວາມສ່ຽງສູງມາກ! ສະຖິຕິທົ່ວໂລກສະແດງໃຫ້ເຫັນວ່າ:"),
      ...bulletList([
        "70-80% ຂອງ Retail Traders ຂາດທຶນໃນໄລຍະຍາວ",
        "Leverage ສາມາດທຳໃຫ້ຂາດທຶນໄວກວ່າທຶນຕົວຈິງ",
        "ຄວາມໄ່ສະຖຽນລະພາບທາງດ້ານ Emotional ຄືສາເຫດຫຼັກ",
      ]),
      normal("ແຕ່ Trader ທີ່ຮຽນຮູ້ຢ່າງຈິງຈັງ ມີ Risk Management ທີ່ດີ ແລະ ສ້າງ Trading Plan ກ່ອນ ສາມາດເອົາຊະນະ Odds ເຫຼົ່ານີ້ໄດ້"),

      heading2("ສະຫຼຸບ: Forex ເໝາະກັບໃຜ?"),
      ...bulletList([
        "✅ ຄົນທີ່ຮຽນຮູ້ຢ່າງຈິງຈັງ ບໍ່ໄດ້ຊອກ Quick Money",
        "✅ ຄົນທີ່ຄວບຄຸມ Emotion ໄດ້ ບໍ່ Panic ງ່າຍ",
        "✅ ຄົນທີ່ມີເວລາ ຮຽນ ແລະ ຝຶກ ຢ່າງໜ້ອຍ 3-6 ເດືອນ",
        "❌ ຄົນທີ່ຊອກ Passive Income ໄວໆ ໂດຍບໍ່ຮຽນ",
        "❌ ຄົນທີ່ເອົາທຶນ Savings ທີ່ຈຳເປັນມາໃຊ້",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 2. ວິທີເລືອກ Broker
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "ວິທີເລືອກ Broker Forex ທີ່ດີ ຫຼີກລ່ຽງ Scam",
    slug: { _type: "slug", current: "forex-broker-how-to-choose" },
    category: "education",
    excerpt: "ການເລືອກ Broker ທີ່ຜິດອາດທຳໃຫ້ສູນເສຍທຶນທັງໝົດ ຮຽນຮູ້ 7 ຫຼັກການເລືອກ Broker ທີ່ດີ ແລະ ສັນຍານອັນຕະລາຍທີ່ຕ້ອງຫຼີກລ່ຽງ",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("ເປັນຫຍັງການເລືອກ Broker ຈຶ່ງສຳຄັນ?"),
      normal("Broker ຄືຕົວກາງລະຫວ່າງທ່ານ ແລະ ຕະຫຼາດ Forex ຖ້າເລືອກ Broker ທີ່ຜິດ ທ່ານອາດ:"),
      ...bulletList([
        "ບໍ່ສາມາດຖອນເງິນໄດ້",
        "ຖືກ Manipulate ລາຄາ (Stop Hunting)",
        "ສູນເສຍທຶນທັງໝົດຈາກ Scam Broker",
        "ຖືກຄິດ Spread/Commission ສູງເກີນໄປ",
      ]),

      heading2("7 ສິ່ງທີ່ຕ້ອງກວດສອບກ່ອນເລືອກ Broker"),

      heading3("1. ໃບອະນຸຍາດ (Regulation)"),
      normal("ໃບອະນຸຍາດຄືສິ່ງທຳອິດທີ່ຕ້ອງກວດ Broker ທີ່ດີຕ້ອງມີໃບອະນຸຍາດຈາກ:"),
      ...bulletList([
        "FCA (UK) — ເຊື່ອຖືໄດ້ສູງທີ່ສຸດ",
        "ASIC (Australia) — ເຊື່ອຖືໄດ້ສູງ",
        "CySEC (Cyprus/EU) — ດີ",
        "FSA/FSC (Offshore) — ລະວັງ ກວດໃຫ້ລະອຽດ",
        "ບໍ່ມີໃບອະນຸຍາດ — ຫຼີກລ່ຽງທັນທີ!",
      ]),

      heading3("2. ປະເພດ Broker: Market Maker vs ECN/STP"),
      normal("Market Maker: Broker ສ້າງຕະຫຼາດເອງ ອາດມີ Conflict of Interest ກັບ Trader"),
      normal("ECN/STP: Broker ສົ່ງ Order ໄປຕະຫຼາດຈິງ Spread ຕ່ຳ ແຕ່ມີ Commission"),
      normal("ສຳລັບ Beginner: Market Maker ທີ່ Regulated ດີກໍໃຊ້ໄດ້ ສຳລັບ Professional: ECN ດີກວ່າ"),

      heading3("3. Spread ແລະ Commission"),
      ...bulletList([
        "Spread ຄືຄ່າໃຊ້ຈ່າຍຫຼັກ ຕ່ຳ = ດີ",
        "EUR/USD Spread ທີ່ດີ: 0.0-1.5 Pips",
        "XAUUSD Spread ທີ່ດີ: 0.2-3.0 USD",
        "Commission ECN: $2-7 ຕໍ່ Lot ສອງທາງ",
      ]),

      heading3("4. ການຝາກ-ຖອນ ສຳລັບຄົນລາວ"),
      ...bulletList([
        "ຮອງຮັບ BCEL, LDB, BIC Bank — ສຳຄັນທີ່ສຸດ",
        "ຮອງຮັບ Skrill, Neteller, Crypto — ທາງເລືອກ",
        "ເວລາຖອນໄວ: ພາຍໃນ 24 ຊົ່ວໂມງ",
        "ຄ່າທຳນຽມຖອນ: ໜ້ອຍ ຫຼື ຟຣີ",
      ]),

      heading3("5. Leverage ທີ່ເໝາະສົມ"),
      ...bulletList([
        "Beginner: 1:100 ຫາ 1:500 — ພໍດີ",
        "Leverage ສູງເກີນ (1:2000+) — ລະວັງ!",
        "Leverage ສູງ = ກຳໄລໄວ ແຕ່ຂາດທຶນໄວຄືກັນ",
      ]),

      heading3("6. Platform ທີ່ໃຊ້"),
      ...bulletList([
        "MT4 — ທົ່ວໄປທີ່ສຸດ ໃຊ້ງ່າຍ ມີ Indicator ຫຼາຍ",
        "MT5 — ອັບໂກ່ຣດຈາກ MT4 ມີ Timeframe ຫຼາຍກວ່າ",
        "cTrader — ເໝາະ ECN Trader",
        "Mobile App — ໃຫ້ download ທົດລອງກ່ອນ",
      ]),

      heading3("7. Support ພາສາລາວ/ໄທ"),
      ...bulletList([
        "Chat Support ຕອບໄວ ພາຍໃນ 1-5 ນາທີ",
        "ມີ Live Chat 24/5",
        "ມີເນື້ອຫາ/ວິດີໂອ ພາສາລາວ/ໄທ",
        "ໃຫ້ຮ່ວມ Group/Community ຂອງ Broker",
      ]),

      heading2("⚠️ ສັນຍານ Scam Broker ທີ່ຕ້ອງລະວັງ"),
      ...bulletList([
        "ສັນຍາກຳໄລ 100% ຫຼື ຮັບປະກັນກຳໄລ — ບໍ່ມີໃນຕະຫຼາດຈິງ!",
        "Bonus ຫຼາຍເກີນໄປ ແຕ່ຖອນໄດ້ຍາກ",
        "ບໍ່ມີໃບອະນຸຍາດ ຫຼື ໃບອະນຸຍາດ Fake",
        "ຮຽກຮ້ອງໃຫ້ສົ່ງ ID ຫຼາຍເກີນໄປ ກ່ອນຖອນ",
        "Web ໃໝ່ ປ່ຽນຊື່ເລື້ອຍໆ",
        "ບໍ່ສາມາດ Contact Support ໄດ້",
      ]),

      heading2("Broker ແນະນຳສຳລັບຄົນລາວ"),
      ...bulletList([
        "XM Global: ເໝາະ Beginner, ຮອງຮັບ BCEL, Regulated ASIC/CySEC",
        "Exness: Spread ຕ່ຳ, ຖອນໄວ, ຮອງຮັບ Local Bank",
        "Markets4you: Bonus ດີ, ຮອງຮັບ BCEL",
        "IUX: App ສວຍ, ຮອງຮັບ PromptPay/BCEL",
      ]),
      normal("ລີວິວ Broker ລາຍລະອຽດ ເຂົ້າໄປເບິ່ງໃນຫ້ອງ Broker Review ຂອງພວກເຮົາໄດ້ເລີຍ"),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. Candlestick
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Candlestick ອ່ານຢ່າງໃດ? ພື້ນຖານທີ່ຕ້ອງຮູ້",
    slug: { _type: "slug", current: "candlestick-basics" },
    category: "education",
    excerpt: "Candlestick ຄືເຄື່ອງມືສຳຄັນທີ່ Trader ທຸກຄົນຕ້ອງຮູ້ ຮຽນຮູ້ວ່າ Candle ແຕ່ລະອັນບອກຫຍັງ ແລະ Pattern ໃດທີ່ສຳຄັນທີ່ສຸດ",
    readTime: 15,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Candlestick ແມ່ນຫຍັງ?"),
      normal("Candlestick (ທຽນ) ຄືຮູບແບບສະແດງລາຄາທີ່ນຳໃຊ້ໃນ Chart ຕົ້ນກຳເນີດຈາກຍີ່ປຸ່ນ 300 ກວ່າປີທີ່ຜ່ານມາ Candle ແຕ່ລະ​ອັນ​ສ​ະ​ແດງ​ໃຫ້ 4 ຂໍ້​ມູນ​ໃນ Timeframe ນັ້ນ:"),
      ...bulletList([
        "Open (O): ລາຄາເປີດ",
        "High (H): ລາຄາສູງສຸດ",
        "Low (L): ລາຄາຕ່ຳສຸດ",
        "Close (C): ລາຄາປິດ",
      ]),

      heading2("ສ່ວນປະກອບຂອງ Candlestick"),
      normal("Body (ກ້ານທຽນ): ພື້ນທີ່ລະຫວ່າງ Open ແລະ Close"),
      normal("Wick/Shadow (ໄຂ/ຫາງ): ເສັ້ນບາງໆ ດ້ານເທິງ ແລະ ລຸ່ມ Body ສະແດງ High/Low"),
      ...bulletList([
        "Candle ສີຂຽວ (Bullish): Close > Open — ຜູ້ຊື້ຊະນະ",
        "Candle ສີແດງ (Bearish): Close < Open — ຜູ້ຂາຍຊະນະ",
        "Body ໃຫຍ່: ແຮງຊື້/ຂາຍ ແຮງ",
        "Body ນ້ອຍ: ຕະຫຼາດ ບໍ່ແນ່ນອນ",
      ]),

      heading2("Candlestick Pattern ທີ່ສຳຄັນທີ່ສຸດ"),

      heading3("🕯️ Doji — ຕະຫຼາດລັງເລ"),
      normal("Doji ຄື Candle ທີ່ Open ≈ Close Body ນ້ອຍຫຼືບໍ່ມີ ໝາຍຄວາມວ່າຕະຫຼາດລັງເລ ບໍ່ຮູ້ຈະໄປທາງໃດ"),
      ...bulletList([
        "ຫຼັງ Downtrend: ອາດ Reverse ຂຶ້ນ",
        "ຫຼັງ Uptrend: ອາດ Reverse ລົງ",
        "ຢ່າ Trade ທັນທີ ລໍຄ້ອຍ Confirm ກ່ອນ",
      ]),

      heading3("🔨 Hammer — ສັນຍານ Bullish Reversal"),
      normal("Hammer ມີ Body ນ້ອຍຢູ່ດ້ານເທິງ ມີ Wick ຍາວດ້ານລຸ່ມ (2-3 ເທົ່າ Body) ເກີດຫຼັງ Downtrend"),
      ...bulletList([
        "Wick ຍາວ = ຜູ້ຂາຍ Push ລາຄາລົງ ແຕ່ຜູ້ຊື້ດຶງກັບຂຶ້ນ",
        "ສັນຍານວ່າ ຜູ້ຊື້ເລີ່ມຄວບຄຸມ",
        "ຢ່າ Trade ດ້ວຍ Hammer ດຽວ ລໍ Confirm Candle ຕໍ່ໄປ",
      ]),

      heading3("⭐ Engulfing Pattern — ສັນຍານ Reversal ແຮງ"),
      normal("Bullish Engulfing: Candle ສີຂຽວ ໃຫຍ່ກວ່າ Candle ສີແດງກ່ອນໜ້າ ສັນຍານ Reversal ຂຶ້ນ"),
      normal("Bearish Engulfing: Candle ສີແດງ ໃຫຍ່ກວ່າ Candle ສີຂຽວກ່ອນໜ້າ ສັນຍານ Reversal ລົງ"),

      heading3("⭐ Morning Star / Evening Star — Reversal 3 Candle"),
      normal("Morning Star (3 Candle):"),
      ...numberList([
        "Candle ສີແດງໃຫຍ່ (Downtrend)",
        "Candle ນ້ອຍ/Doji (ລັງເລ)",
        "Candle ສີຂຽວໃຫຍ່ (ຜູ້ຊື້ຄວບຄຸມ) → ສັນຍານ Buy",
      ]),

      heading3("📊 Shooting Star — Bearish Reversal"),
      normal("Shooting Star ມີ Body ນ້ອຍດ້ານລຸ່ມ Wick ຍາວດ້ານເທິງ ເກີດຫຼັງ Uptrend ສັນຍານ Sell"),

      heading2("ວິທີໃຊ້ Candlestick ໃຫ້ຖືກຕ້ອງ"),
      ...numberList([
        "ເບິ່ງ Trend ຫຼັກ ກ່ອນ — ຢ່າ Trade ຕ້ານ Trend ຈາກ Candle Pattern ດຽວ",
        "ຈຸດ S/R — Pattern ທີ່ເກີດຢູ່ Support/Resistance ໜ້າເຊື່ອຖືກວ່າ",
        "Volume — Candle Pattern + Volume ສູງ = ແຮງກວ່າ",
        "Timeframe — H4/Daily Pattern ໜ້າເຊື່ອຖືກວ່າ M5/M15",
        "Confirm ສະເໝີ — ລໍ Candle ຕໍ່ໄປຢັ້ງຢືນ",
      ]),

      heading2("ຂໍ້ຜິດພາດທົ່ວໄປ"),
      ...bulletList([
        "❌ Trade ຈາກ Pattern ດຽວ ໂດຍບໍ່ເບິ່ງ Context",
        "❌ ໃຊ້ Candle Pattern ໃນ Timeframe ນ້ອຍ M1/M5 — Noise ຫຼາຍ",
        "❌ ບໍ່ຕັ້ງ Stop Loss",
        "❌ ຈຳ Pattern ຫຼາຍເກີນ ຮຽນ 5-7 Pattern ທີ່ສຳຄັນ ໃຊ້ໃຫ້ຄ່ອງ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. Support & Resistance
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Support ແລະ Resistance ຄືຫຍັງ? ຊອກຫາຢ່າງໃດ?",
    slug: { _type: "slug", current: "support-resistance-basics" },
    category: "education",
    excerpt: "Support ແລະ Resistance ຄືເຄື່ອງມື Technical Analysis ທີ່ສຳຄັນທີ່ສຸດ ຮຽນຮູ້ວ່າຊອກຫາ ແລະ ໃຊ້ S/R ໃຫ້ຖືກຕ້ອງ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Support ແລະ Resistance ແມ່ນຫຍັງ?"),
      normal("Support ຄື ລະດັບລາຄາທີ່ຕະຫຼາດ ມັກ 'ຢຸດລົງ' ເພາະມີຜູ້ຊື້ລໍຢູ່ຫຼາຍ ຄືດັ່ງ 'ພື້ນ' ທີ່ດັກໄວ້ ຈຶ່ງຍາກທີ່ຈະຫຼຸດລົງຕໍ່"),
      normal("Resistance ຄື ລະດັບລາຄາທີ່ຕະຫຼາດ ມັກ 'ຢຸດຂຶ້ນ' ເພາະມີຜູ້ຂາຍລໍຢູ່ຫຼາຍ ຄືດັ່ງ 'ເພດານ' ທີ່ ຈຶ່ງຍາກທີ່ຈະທະລຸຂຶ້ນ"),

      heading2("ເປັນຫຍັງ S/R ຈຶ່ງໄດ້ຜົນ?"),
      normal("S/R ໄດ້ຜົນເພາະ ຈິດຕະວິທະຍາຂອງຕະຫຼາດ:"),
      ...bulletList([
        "ຜູ້ທີ່ຊື້ໃກ້ Support ຈະ Buy ຕື່ມ ຖ້າລາຄາກັບມາ",
        "ຜູ້ທີ່ Short ຢູ່ Resistance ຈະ Sell ຕື່ມ ຖ້າລາຄາຂຶ້ນມາ",
        "ຜູ້ທີ່ Miss Trade ຈະລໍໂອກາດຊື້ຢູ່ Support ຕໍ່ໄປ",
        "ຕ່ອນທຶນ (Institutional Traders) ຕັ້ງ Order ໄວ້ຢູ່ Level ເຫຼົ່ານີ້",
      ]),

      heading2("ວິທີຊອກ Support/Resistance"),

      heading3("ວິທີ 1: ເບິ່ງ Swing Highs/Lows"),
      ...numberList([
        "ໃຊ້ Daily ຫຼື H4 Chart",
        "ຫາຈຸດ High ທີ່ລາຄາ Reject ລົງ (Resistance)",
        "ຫາຈຸດ Low ທີ່ລາຄາ Bounce ຂຶ້ນ (Support)",
        "Level ທີ່ Reject ຫຼາຍຄັ້ງ = ແຮງກວ່າ",
      ]),

      heading3("ວິທີ 2: Round Numbers"),
      normal("ຕະຫຼາດ ມັກ Respect ຕົວເລກ ກົມ ເຊັ່ນ 1.1000, 1.1500, 2000, 2100 ສຳລັບ Gold ເນື່ອງຈາກ Trader ຈຳນວນຫຼາຍ ຕັ້ງ Order ຢູ່ Level ເຫຼົ່ານີ້"),

      heading3("ວິທີ 3: Previous High/Low"),
      ...bulletList([
        "ຈຸດ High ເດືອນກ່ອນ ກາຍເປັນ Resistance ເດືອນນີ້",
        "ຈຸດ Low ປີກ່ອນ ກາຍເປັນ Support ທີ່ ແຮງ",
        "All-Time High / All-Time Low ແຮງທີ່ສຸດ",
      ]),

      heading2("ກົດການ Role Reversal"),
      normal("ກົດ​ສຳ​ຄັນ​ທີ່ Trader ທຸກ​ຄົນ​ຕ້ອງ​ຮູ້:"),
      ...bulletList([
        "Support ທີ່ Break ລົງ → ກາຍ​ເປັນ Resistance",
        "Resistance ທີ່ Break ຂຶ້ນ → ກາຍ​ເປັນ Support",
        "ຮຽກ​ວ່າ 'Role Reversal' ຫຼື 'Polarity'",
      ]),
      normal("ຕົວຢ່າງ: Gold ອຍູ່ທີ່ $2000 ເປັນ Resistance ດົນ ເມື່ອ Break ຂຶ້ນ $2000 ກາຍ​ເປັນ Support ໃໝ່"),

      heading2("ວິທີ Trade ດ້ວຍ S/R"),

      heading3("Strategy 1: Bounce Trading"),
      ...numberList([
        "ລໍລາຄາເຂົ້າໃກ້ Support (ໃນ Uptrend)",
        "ລໍ Candlestick Confirm (Hammer, Engulfing)",
        "Entry Buy ຢູ່ Support",
        "Stop Loss ຢູ່ຕ່ຳກວ່າ Support",
        "Target: Resistance ຖັດໄປ",
      ]),

      heading3("Strategy 2: Breakout Trading"),
      ...numberList([
        "ລໍ Candle Close ເທິງ Resistance (ດ້ວຍ Volume ສູງ)",
        "Entry Buy ຫຼັງ Breakout Confirm",
        "Stop Loss ຢູ່ຕ່ຳກວ່າ Resistance ທີ່ Break",
        "Target: Measure ດ້ວຍ Pattern Height",
      ]),

      heading2("ຂໍ້ຜິດພາດທົ່ວໄປ"),
      ...bulletList([
        "❌ ມອງ S/R ເປັນ ເສັ້ນ ແທນທີ່ຈະເປັນ Zone ລາຄາ",
        "❌ Trade ທຸກ S/R ທີ່ເຫັນ — ເລືອກ Level ທີ່ ສຳຄັນຈິງໆ",
        "❌ ຫ້ອຍ S/R ທີ່ Timeframe ນ້ອຍ ໂດຍລືມ Daily Level",
        "❌ ບໍ່ Update S/R ຕາມ ຂໍ້ມູນໃໝ່",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. Pip ແລະ Lot Size
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Pip ແລະ Lot Size ແມ່ນຫຍັງ? ຄຳນວນກຳໄລ-ຂາດທຶນ",
    slug: { _type: "slug", current: "pip-lot-size-explained" },
    category: "education",
    excerpt: "ເຂົ້າໃຈ Pip ແລະ Lot Size ເພື່ອຄຳນວນ Risk ແລະ Reward ໄດ້ຢ່າງຖືກຕ້ອງ ທຸກ Trade ຕ້ອງຮູ້ຫຍັງກ່ອນ Enter",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Pip ແມ່ນຫຍັງ?"),
      normal("Pip (Percentage in Point) ຄືໜ່ວຍວັດແທກການເຄື່ອນໄຫວຂອງລາຄາໃນ Forex ສ່ວນຫຼາຍ Pip ຄື ຕຳແໜ່ງທີ 4 ຫຼັງຈຸດທົດສະນິຍົມ ສຳລັບ Pair ທົ່ວໄປ"),
      ...bulletList([
        "EUR/USD: 1.08501 → 1.08511 = ຂຶ້ນ 1 Pip",
        "USD/JPY: 154.001 → 154.011 = ຂຶ້ນ 1 Pip (ຕຳແໜ່ງ 2 ຫຼັງຈຸດ)",
        "XAUUSD: 2318.00 → 2319.00 = ຂຶ້ນ 100 Pips (1 USD)",
      ]),

      heading2("Pipette ຄືຫຍັງ?"),
      normal("Pipette ຄື 0.1 Pip ຫຼື ຕຳແໜ່ງທີ 5 ຫຼັງຈຸດ Broker ສ່ວນຫຼາຍສະແດງ 5 ຕຳແໜ່ງ ສຳລັບ Pair ທົ່ວໄປ"),

      heading2("Lot Size ແມ່ນຫຍັງ?"),
      normal("Lot Size ຄືຂະໜາດຂອງ Order ທີ່ທ່ານຊື້/ຂາຍ:"),
      ...bulletList([
        "1 Standard Lot = 100,000 Units ຂອງ Base Currency",
        "1 Mini Lot = 10,000 Units (0.1 Lot)",
        "1 Micro Lot = 1,000 Units (0.01 Lot)",
      ]),

      heading2("Pip Value ຄຳນວນແນວໃດ?"),
      normal("ສຳລັບ EUR/USD (ແລະ Pair ທີ່ Quote ດ້ວຍ USD):"),
      ...bulletList([
        "1 Standard Lot (1.0): 1 Pip = $10",
        "1 Mini Lot (0.1): 1 Pip = $1",
        "1 Micro Lot (0.01): 1 Pip = $0.10",
      ]),
      normal("ສຳລັບ XAUUSD (Gold):"),
      ...bulletList([
        "1 Lot: $1 (1 point) = $100",
        "0.1 Lot: $1 (1 point) = $10",
        "0.01 Lot: $1 (1 point) = $1",
      ]),

      heading2("ຄຳນວນກຳໄລ/ຂາດທຶນ"),
      normal("ສູດ: ກຳໄລ/ຂາດທຶນ = Pips ×​ Pip Value × Lot Size"),
      normal("ຕົວຢ່າງ:"),
      ...bulletList([
        "Buy EUR/USD 0.1 Lot ໄດ້ 50 Pips → $1 × 50 = $50 ກຳໄລ",
        "Sell EUR/USD 0.5 Lot ໄດ້ 30 Pips → $10 × 30 × 0.5 = $150 ກຳໄລ",
        "Buy XAUUSD 0.01 Lot ໄດ້ $20 → $1 × 20 = $20 ກຳໄລ",
      ]),

      heading2("ຄຳນວນ Lot Size ທີ່ເໝາະສົມ"),
      normal("Rule ທອງ: ຢ່າ Risk ເກີນ 1-2% ຂອງ Account ຕໍ່ 1 Trade"),
      ...numberList([
        "ກຳນົດ Risk ເປັນ % ຂອງ Account ເຊັ່ນ 1% ຂອງ $1,000 = $10",
        "ວາງ Stop Loss ກ່ອນ ເຊັ່ນ 30 Pips",
        "Lot Size = Risk Amount / (Stop Loss Pips × Pip Value)",
        "= $10 / (30 × $1) = 0.33 Lot (ໃຊ້ 0.3 Lot)",
      ]),

      heading2("Position Size Calculator"),
      normal("ໃຊ້ Position Size Calculator ອອນລາຍ ທີ່ LFT ໄດ້ງ່າຍ ສ້ຽນຈຳສູດ ຈຳໃຫ້ໄດ້ 3 ຢ່າງ:"),
      ...bulletList([
        "Risk % ຂອງ Account (1-2%)",
        "ໄລຍະ Stop Loss (Pips)",
        "Pip Value ຕາມ Lot ທີ່ໃຊ້",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 6. Leverage & Margin
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Leverage ແລະ Margin ແມ່ນຫຍັງ? ໃຊ້ຢ່າງໄລ?",
    slug: { _type: "slug", current: "leverage-margin-explained" },
    category: "education",
    excerpt: "Leverage ຄືດາບສອງຄົມ ໃຊ້ຖືກກຳໄລໄວ ໃຊ້ຜິດຂາດທຶນໄວ ຮຽນຮູ້ Leverage ແລະ Margin ໃຫ້ເຂົ້າໃຈກ່ອນ Trade",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Leverage ແມ່ນຫຍັງ?"),
      normal("Leverage ຄື ການ ຢືມ ທຶນ ຈາກ Broker ເພື່ອ ຄວບ​ຄຸມ Position ໃຫຍ່ ກວ່າ ທຶນ ຈິງ ຂອງ ທ່ານ"),
      ...bulletList([
        "Leverage 1:100 = ທຶນ $100 → ຄວບຄຸມ $10,000",
        "Leverage 1:500 = ທຶນ $100 → ຄວບຄຸມ $50,000",
        "Leverage 1:1000 = ທຶນ $100 → ຄວບຄຸມ $100,000",
      ]),

      heading2("Margin ແມ່ນຫຍັງ?"),
      normal("Margin ຄື ເງິນ Deposit ທີ່ Broker ກັກ ໄວ້ ເພື່ອ ເປັນ ປະກັນ ໃນ ຂະນະ ທີ່ ທ່ານ Trade"),
      normal("ສູດ: Required Margin = Trade Size / Leverage"),
      ...bulletList([
        "Trade 1 Lot EUR/USD ($100,000) Leverage 1:100 → Margin = $1,000",
        "Trade 0.1 Lot ($10,000) Leverage 1:500 → Margin = $20",
        "Margin ທີ່ເຫຼືອ = Free Margin = ໃຊ້ Trade ໄດ້ອີກ",
      ]),

      heading2("Leverage ໄດ້ ແລະ ເສຍ ຄືກັນ"),
      normal("ຕົວຢ່າງ Leverage 1:100 ທຶນ $1,000:"),
      ...bulletList([
        "Trade 1 Lot EUR/USD ລາຄາຂຶ້ນ 50 Pips → ກຳໄລ $500 (50% ຂອງ Account!)",
        "Trade 1 Lot EUR/USD ລາຄາລົງ 50 Pips → ຂາດທຶນ $500 (ເສຍ 50%!)",
        "ຖ້າ ລາຄາ ລົງ 100 Pips → ຂາດທຶນ $1,000 = ສູນ ທຶນ ທັງ ໝົດ!",
      ]),

      heading2("Margin Call ແລະ Stop Out"),
      normal("Margin Call: Broker ແຈ້ງ ເຕືອນ ເມື່ອ Equity ຕ່ຳ ກວ່າ Margin Level ທີ່ ກຳ ນົດ (ສ່ວນ ຫຼາຍ 100%)"),
      normal("Stop Out: Broker ປິດ Position ອັດ ຕະ ໂນ ມັດ ເພື່ອ ຮັກ ສາ Margin (ສ່ວນ ຫຼາຍ 20-50%)"),
      ...bulletList([
        "Margin Level = (Equity / Used Margin) × 100%",
        "Equity $800 / Used Margin $1000 = 80% Margin Level = Danger!",
        "ຕ້ອງ Add ທຶນ ຫຼື ປິດ Position ກ່ອນ Stop Out",
      ]),

      heading2("Leverage ທີ່ ເໝາະ ສົມ ສຳ ລັບ ຄົນ ລາວ"),
      ...bulletList([
        "Beginner ທຶນ < $500: ໃຊ້ Leverage ຕ່ຳ 1:10 ຫາ 1:50",
        "Intermediate ທຶນ $500-$5,000: 1:50 ຫາ 1:100",
        "Advanced: ຕາມ Strategy ສ່ວນຫຼາຍ 1:100 ຫາ 1:200",
        "ບໍ່ ຄວນ ໃຊ້ Full Leverage ສະ ເໝີ ໃຊ້ 5-20% ຂອງ Leverage ທີ່ ມີ",
      ]),

      heading2("ຫຼັກ ການ ໃຊ້ Leverage ຢ່າງ ປອດ ໄພ"),
      ...numberList([
        "ຢ່າ Risk ເກີນ 1-2% ຂອງ Account ຕໍ່ Trade",
        "ຕັ້ງ Stop Loss ທຸກ Trade",
        "ຢ່າ Over-Trade: ຮັກ ສາ Free Margin > 200%",
        "Leverage ສູງ ≠ ກຳ ໄລ ສູງ: ໃຊ້ Lot Size ນ້ອຍ ດ້ວຍ Leverage ສູງ ໄດ້ ຜົນ ດຽວ ກັນ",
        "Demo ກ່ອນ ສະ ເໝີ: ທົດ ລອງ ຢ່າງ ໜ້ອຍ 3 ເດືອນ ກ່ອນ Real",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 7. Long vs Short
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Long vs Short, Buy vs Sell ໃນ Forex ຕ່າງກັນຫຍັງ?",
    slug: { _type: "slug", current: "long-short-buy-sell" },
    category: "education",
    excerpt: "ຄຳທີ່ Trader ໃໝ່ມັກສັບ​ສົນ Long Short Buy Sell ຮຽນຮູ້ຄວາມໝາຍ ແລະ ວິທີ ທຳ ກຳ ໄລ ທັງ ຕອນ ຂຶ້ນ ແລະ ລົງ",
    readTime: 8,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Long ແລະ Short ໃນ Forex"),
      normal("Long (Buy): ທ່ານ ຄາດ ວ່າ ລາຄາ ຈະ ຂຶ້ນ → ຊື້ ທຳ ອິດ ຂາຍ ທ້າຍ"),
      normal("Short (Sell): ທ່ານ ຄາດ ວ່າ ລາຄາ ຈະ ລົງ → ຂາຍ ທຳ ອິດ ຊື້ ທ້າຍ"),
      normal("ໃນ Forex ທ່ານ ສາ ມາດ ທຳ ກຳ ໄລ ໄດ້ ທັງ ສອງ ທາງ ຕ່າງ ຈາກ ຕະ ຫຼາດ ຫຸ້ນ ທຳ ດາ ທີ່ ກຳ ໄລ ໄດ້ ສະ ເພາະ ຕອນ ຂຶ້ນ"),

      heading2("ຕົວຢ່າງ Long (Buy)"),
      ...numberList([
        "EUR/USD ລາຄາ 1.0800",
        "ທ່ານ ຄາດ EUR ຈະ ແຂງ → Buy 0.1 Lot",
        "ລາຄາ ຂຶ້ນ ໄປ 1.0850 = ຂຶ້ນ 50 Pips",
        "ກຳ ໄລ = 50 × $1 = $50",
        "ທ່ານ Close (Sell) ເພື່ອ ທຳ ກຳ ໄລ",
      ]),

      heading2("ຕົວຢ່າງ Short (Sell)"),
      ...numberList([
        "EUR/USD ລາຄາ 1.0850",
        "ທ່ານ ຄາດ EUR ຈະ ອ່ອນ → Sell 0.1 Lot",
        "ລາຄາ ລົງ ໄປ 1.0800 = ລົງ 50 Pips",
        "ກຳ ໄລ = 50 × $1 = $50",
        "ທ່ານ Close (Buy) ເພື່ອ ທຳ ກຳ ໄລ",
      ]),

      heading2("Bid ແລະ Ask ຄືຫຍັງ?"),
      normal("ທ່ານ ຈະ ເຫັນ ລາຄາ 2 ຕົວ ສະ ເໝີ:"),
      ...bulletList([
        "Bid: ລາຄາ ທີ່ Broker ຮັບ ຊື້ = ທ່ານ ໃຊ້ Sell",
        "Ask: ລາຄາ ທີ່ Broker ຂາຍ = ທ່ານ ໃຊ້ Buy",
        "Spread = Ask - Bid = ຄ່າ ທຳ ນຽມ ທາງ ອ້ອມ",
        "ຕົວ ຢ່າງ: Bid 1.0849 / Ask 1.0851 → Spread = 2 Pips",
      ]),

      heading2("Swap/Rollover ຄືຫຍັງ?"),
      normal("ຖ້າ ທ່ານ ຖື Position ຂ້າມ ຄືນ (ເກີນ 22:00 GMT) Broker ຈະ ຄິດ ຄ່າ Swap:"),
      ...bulletList([
        "Positive Swap: ທ່ານ ໄດ້ ຮັບ ເງິນ (ກ  ຳ ໄລ ຈາກ Interest Rate)",
        "Negative Swap: ທ່ານ ຈ່າຍ ເງິນ (ຄ່າ ທຳ ນຽມ ຂ້າມ ຄືນ)",
        "Carry Trade Strategy ໃຊ້ Positive Swap ທຳ ກຳ ໄລ",
        "Day Trader ທີ່ ປິດ ທຸກ Trade ໃນ ວັນ ດຽວ ບໍ່ ຖືກ Swap",
      ]),

      heading2("ຄຳ ສັ່ງ ທີ່ ໃຊ້ ໃນ MT4/MT5"),
      ...bulletList([
        "Market Order: ຊື້/ຂາຍ ທັນ ທີ ລາຄາ ຕະ ຫຼາດ",
        "Limit Order: ລໍ ຊື້/ຂາຍ ທີ່ ລາຄາ ທີ່ ທ່ານ ກຳ ນົດ",
        "Stop Order: ສັ່ງ ຊື້/ຂາຍ ເມື່ອ ລາຄາ Break ຜ່ານ Level",
        "Stop Loss: ປິດ Order ອັດ ຕະ ໂນ ມັດ ຖ້າ ຂາດ ທຶນ ຮອດ ລະ ດັບ ທີ່ ກຳ ນົດ",
        "Take Profit: ປິດ Order ອັດ ຕະ ໂນ ມັດ ຖ້າ ກຳ ໄລ ຮອດ ລະ ດັບ ທີ່ ກຳ ນົດ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 8. Forex Market Sessions
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Forex Market Sessions: London, NY, Tokyo ຄວນ ເທຣດ ຊ່ວງ ໃດ?",
    slug: { _type: "slug", current: "forex-market-sessions" },
    category: "education",
    excerpt: "ຕະ ຫຼາດ Forex ເປີດ 24 ຊົ່ວ ໂມງ ແຕ່ ບໍ່ ແມ່ນ ທຸກ ຊ່ວງ ຈະ ດີ ເທົ່າ ກັນ ຮຽນ ຮູ້ ຊ່ວງ ເວລາ ທີ່ ດີ ທີ່ ສຸດ ສຳ ລັບ Trader ລາວ",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("ຕະ ຫຼາດ Forex ເປີດ 24 ຊົ່ວ ໂມງ"),
      normal("Forex ບໍ່ ມີ ຕະ ຫຼາດ ກາງ ດຽວ ແຕ່ ໃຊ້ Network ຂອງ Banks ທົ່ວ ໂລກ ທຳ ໃຫ້ ຊື້ ຂາຍ ໄດ້ ຕລອດ 24 ຊົ່ວ ໂມງ ຈັນ-ສຸກ (Weekend ຕະ ຫຼາດ ປິດ)"),
      normal("ແຕ່ ລະ Session ມີ ລັກ ສະ ນະ ຕ່າງ ກັນ ຄຶກ ຄື້ນ ຕ່າງ ກັນ ແລະ Currency Pair ທີ່ ເໝາະ ສົມ ຕ່າງ ກັນ"),

      heading2("4 Session ຫຼັກ ຂອງ ໂລກ"),

      heading3("🇦🇺 Sydney Session: 04:00-13:00 ລາວ"),
      ...bulletList([
        "ຄຶກ ຄື້ນ ໜ້ອຍ ທີ່ ສຸດ",
        "AUD, NZD Pairs ເໝາະ ສົມ ທີ່ ສຸດ",
        "Spread ສູງ ກວ່າ Session ອື່ນ",
        "ບໍ່ ແນະ ນຳ ສຳ ລັບ Beginner",
      ]),

      heading3("🇯🇵 Tokyo Session: 07:00-16:00 ລາວ"),
      ...bulletList([
        "ຄຶກ ຄື້ນ ປານ ກາງ",
        "JPY Pairs ເໝາະ ສົມ: USD/JPY, EUR/JPY, GBP/JPY",
        "ຂ່າວ ຍີ່ ປຸ່ນ BOJ ສ່ງ ຜົນ Session ນີ້",
        "ລາວ ເວລາ 07:00-16:00 ສະ ດວກ ດີ",
      ]),

      heading3("🇬🇧 London Session: 14:00-23:00 ລາວ"),
      ...bulletList([
        "ຄຶກ ຄື້ນ ທີ່ ສຸດ ໃນ ໂລກ",
        "EUR, GBP Pairs ເຄື່ອນ ໄຫວ ດີ ທີ່ ສຸດ",
        "Volume ສູງ Spread ຕ່ຳ",
        "ຄຳ ຄວນ ເທຣດ ສຳ ລັບ EUR/USD, GBP/USD",
      ]),

      heading3("🇺🇸 New York Session: 19:00-04:00 ລາວ"),
      ...bulletList([
        "ຄຶກ ຄື້ນ ສູງ ໂດຍ ສະ ເພາະ USD Pairs",
        "ຂ່າວ ສຳ ຄັນ: NFP, CPI, FOMC ອອກ Session ນີ້",
        "USD/CAD, USD/JPY ເໝາະ ສົມ",
        "ສາ ຍ ດຶກ ສຳ ລັບ Trader ລາວ (19:00-04:00)",
      ]),

      heading2("⭐ ຊ່ວງ ທີ່ ດີ ທີ່ ສຸດ: London-NY Overlap"),
      normal("19:00-23:00 ລາວ ຄື ຊ່ວງ ທີ່ London ແລະ New York ເປີດ ພ້ອມ ກັນ:"),
      ...bulletList([
        "Volume ສູງ ທີ່ ສຸດ ຂອງ ວັນ",
        "Spread ຕ່ຳ ທີ່ ສຸດ",
        "ການ ເຄື່ອນ ໄຫວ ຊັດ ເຈນ ທີ່ ສຸດ",
        "EUR/USD, GBP/USD, XAUUSD ດີ ທີ່ ສຸດ",
        "ຊ່ວງ ເວລາ ນີ້ ເໝາະ ກັບ Trader ລາວ ທີ່ ເຮັດ ວຽກ ກາງ ວັນ",
      ]),

      heading2("ຕາຕະ ລາງ Session ເວລາ ລາວ (UTC+7)"),
      ...bulletList([
        "Sydney: 04:00 - 13:00",
        "Tokyo: 07:00 - 16:00",
        "Tokyo-London Overlap: 14:00 - 16:00",
        "London: 14:00 - 23:00",
        "London-NY Overlap: 19:00 - 23:00 ⭐ ດີ ທີ່ ສຸດ",
        "New York: 19:00 - 04:00",
      ]),

      heading2("ຄວນ ເທຣດ Pair ໃດ ໃນ Session ໃດ?"),
      ...bulletList([
        "Tokyo: USD/JPY, EUR/JPY, GBP/JPY",
        "London: EUR/USD, GBP/USD, EUR/GBP",
        "New York: USD/CAD, USD/CHF, XAUUSD",
        "London+NY: EUR/USD, GBP/USD, XAUUSD ⭐",
      ]),

      heading2("ຊ່ວງ ທີ່ ຄວນ ຫຼີກ ລ່ຽງ"),
      ...bulletList([
        "ຊ່ວງ ລ່ຽງ Session: ລາຄາ ເຄື່ອນ ໄຫວ ໜ້ອຍ Spread ສູງ",
        "ວັນ ສຸກ ຕອນ ສາຍ: ຕະ ຫຼາດ ສ່ຽງ Thin Volume",
        "ກ່ອນ ຂ່າວ ສຳ ຄັນ: ລາຄາ ອາດ Spike ໄດ້",
        "Weekend: ຕະ ຫຼາດ ປິດ ທ່ານ ຄຸ້ມ ຄອງ Risk ໄດ້",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 9. Fundamental vs Technical
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Fundamental vs Technical Analysis ຕ່າງ ກັນ ຫຍັງ?",
    slug: { _type: "slug", current: "fundamental-vs-technical" },
    category: "education",
    excerpt: "Trader ຄວນ ໃຊ້ Fundamental ຫຼື Technical Analysis? ຮຽນ ຮູ້ ຄວາມ ແຕກ ຕ່າງ ແລະ ວິທີ ໃຊ້ ທັງ ສອງ ຮ່ວມ ກັນ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Technical Analysis (TA) ຄືຫຍັງ?"),
      normal("Technical Analysis ຄື ການ ວິ ເຄາະ ລາຄາ ໂດຍ ໃຊ້ Chart, Indicator ແລະ Pattern ໃນ ອະ ດີດ ເພື່ອ ຄາດ ເດົາ ທິດ ທາງ ລາຄາ ໃນ ອະ ນາ ຄົດ"),
      normal("ໝັ້ນ ໃຈ ໃນ ທິດ ສະ ດີ: ລາຄາ ໃນ ອະ ດີດ ສ້າງ Pattern ທີ່ ຊ້ຳ ຄືນ ເພາະ ຈິດ ຕະ ວິ ທະ ຍາ ຂອງ ຕະ ຫຼາດ ບໍ່ ປ່ຽນ ແປງ"),

      heading3("ເຄື່ອງ ມື TA ທີ່ ນິ ຍົມ"),
      ...bulletList([
        "Candlestick Chart: ສ້ຽນ Pattern ລາຄາ",
        "Support/Resistance: ຈຸດ ສຳ ຄັນ ຂອງ ຕະ ຫຼາດ",
        "Moving Average (MA): ທິດ Trend ຫຼັກ",
        "RSI, MACD, Stochastic: Momentum Indicator",
        "Bollinger Bands, ATR: Volatility",
        "Fibonacci: ລະ ດັບ Retracement/Extension",
      ]),

      heading2("Fundamental Analysis (FA) ຄືຫຍັງ?"),
      normal("Fundamental Analysis ຄື ການ ວິ ເຄາະ ປັດ ໄຈ ທາງ ເສດ ຖ ກິດ ນະ ໂຍ ບາຍ ດ້ານ ການ ເງິນ ແລະ ການ ເມືອງ ທີ່ ສ່ງ ຜົນ ຕໍ່ ລາຄາ"),

      heading3("ປັດ ໄຈ FA ສຳ ຄັນ"),
      ...bulletList([
        "Interest Rate (ດອກ ເບ້ຍ): ທະ ນາ ຄານ ກາງ ຂຶ້ນ ດອກ → ເງິນ ຕາ ແຂງ",
        "GDP (ການ ເຕີບ ໂຕ ທາງ ເສດ ຖ ກິດ): ດີ → ເງິນ ຕາ ແຂງ",
        "Inflation (ເງິນ ເຟີ້): ສູງ → Fed ຂຶ້ນ ດອກ → USD ແຂງ",
        "Employment (NFP): ດີ → USD ແຂງ",
        "Trade Balance: ເກີນ ດຸນ → ເງິນ ຕາ ແຂງ",
        "Political Stability: ໝັ້ນ ຄົງ → ເງິນ ຕາ ໝັ້ນ ຄົງ",
      ]),

      heading2("ຂໍ້ ດີ ແລະ ຂໍ້ ເສຍ"),
      heading3("Technical Analysis"),
      ...bulletList([
        "✅ ເຫັນ ຜົນ ໄວ ໃຊ້ Entry/Exit ໄດ້ ຊັດ ເຈນ",
        "✅ ໃຊ້ ໄດ້ ກັບ ທຸກ Timeframe ແລະ ທຸກ Market",
        "✅ ມີ Rule ຊັດ ເຈນ ສ້າງ System ໄດ້",
        "❌ ບໍ່ ຄາດ ເດົາ ຂ່າວ ໃຫຍ່ ໄດ້",
        "❌ ໃຊ້ Indicator ຫຼາຍ ເກີນ → Confusion",
      ]),

      heading3("Fundamental Analysis"),
      ...bulletList([
        "✅ ຄາດ ເດົາ ທິດ ທາງ ໄລ ຍະ ຍາວ ໄດ້ ດີ",
        "✅ ຮູ້ Catalyst ທີ່ ສ່ງ ຜົນ ຕໍ່ ລາຄາ",
        "❌ ຂ່າວ ດີ ລາຄາ ຍັງ ລົງ ໄດ້ (Buy the Rumor Sell the Fact)",
        "❌ ຍາກ ສຳ ລັບ Beginner",
        "❌ ຕ້ອງ ຕິດ ຕາມ ຂ່າວ ຢ່າງ ໃກ້ ຊິດ",
      ]),

      heading2("ໃຊ້ ທັງ ສອງ ຮ່ວມ ກັນ ດີ ທີ່ ສຸດ"),
      normal("Trader ທີ່ ປະ ສົບ ຄວາມ ສຳ ເລັດ ໃຊ້ ທັງ ສອງ ຮ່ວມ ກັນ:"),
      ...numberList([
        "FA ກຳ ນົດ ທິດ ທາງ ຫຼັກ: USD ແຂງ ຫຼື ອ່ອນ?",
        "TA ກຳ ນົດ Entry/Exit: ຊື້ ທີ່ Support ຫຼື Breakout?",
        "FA ກ ຳ ນົດ Bias, TA ຊ່ວຍ Timing",
      ]),
      normal("ຕົວ ຢ່າງ: Fed ຂຶ້ນ ດອກ (FA: USD ແຂງ) → ຫາ Setup Buy USD/JPY ຢູ່ Support (TA)"),

      heading2("ສຳ ລັບ Beginner ຄວນ ເລີ່ມ ຈາກ ໃດ?"),
      ...bulletList([
        "ເລີ່ມ Technical Analysis ກ່ອນ: ຮຽນ Chart, S/R, Candle",
        "ຕິດ ຕາມ Economic Calendar: ຮູ້ ວັນ ຂ່າວ ສຳ ຄັນ",
        "ຫຼີກ ລ່ຽງ Trade ໃນ ຊ່ວງ ຂ່າວ ໃຫຍ່ ກ່ອນ",
        "ຄ່ອຍ ເພີ່ມ FA ໃນ ຂະ ນະ ທີ່ TA ໝັ້ນ ຄົງ ແລ້ວ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 10. Economic Calendar
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Economic Calendar ຄວນ Follow ຂ່າວ ໃດ? ສຳ ຄັນ ທີ່ ສຸດ",
    slug: { _type: "slug", current: "economic-calendar-guide" },
    category: "education",
    excerpt: "ຂ່າວ ເສດ ຖ ກິດ ສ່ງ ຜົນ ຕໍ່ ຕະ ຫຼາດ Forex ຢ່າງ ຫຼາຍ ຮຽນ ຮູ້ ຂ່າວ ໃດ ທີ່ ສຳ ຄັນ ທີ່ ສຸດ ແລະ ວິທີ ໃຊ້ Economic Calendar",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      heading2("Economic Calendar ແມ່ນ ຫຍັງ?"),
      normal("Economic Calendar ຄື ຕາ ຕະ ລາງ ກຳ ນົດ ການ ຂອງ ຂ່າວ ເສດ ຖ ກິດ ສຳ ຄັນ ທີ່ ຈະ ປ່ອຍ ອອກ ໃນ ອະ ນາ ຄົດ Trader ໃຊ້ Calendar ນີ້ ເພື່ອ ກຽມ ຕົວ ສຳ ລັບ ການ ເຄື່ອນ ໄຫວ ຂອງ ຕະ ຫຼາດ"),

      heading2("ຂ່າວ ທີ່ ສ່ງ ຜົນ ສູງ ທີ່ ສຸດ"),

      heading3("🇺🇸 ຂ່າວ USD (ສຳ ຄັນ ທີ່ ສຸດ ໃນ ໂລກ)"),
      ...bulletList([
        "NFP (Non-Farm Payroll): ທຸກ ວັນ ສຸກ ທຳ ອິດ ຂອງ ເດືອນ ສ່ງ ຜົນ ທຸກ Pair",
        "FOMC Meeting: ທຸກ 6 ອາ ທິດ Fed ຕັດ ສິນ ດອກ ເບ້ຍ",
        "CPI (Inflation): ທຸກ ເດືອນ ດັດ ຊະ ນີ ເງິນ ເຟີ້",
        "GDP: ທຸກ ໄຕ ມາດ ການ ເຕີບ ໂຕ ທາງ ເສດ ຖ ກິດ",
        "Retail Sales: ການ ໃຊ້ ຈ່າຍ ຜູ້ ບໍ ລິ ໂພກ",
      ]),

      heading3("🇪🇺 ຂ່າວ EUR"),
      ...bulletList([
        "ECB Meeting: ທະ ນາ ຄານ ກາງ ເອີ ລ ອບ ຕັດ ສິນ ດອກ ເບ້ຍ",
        "German CPI/GDP: ເຢຍ ລ ມ ນີ ຄື ເສດ ຖ ກິດ ໃຫຍ່ ສຸດ ໃນ EU",
        "Eurozone PMI: ດັດ ຊະ ນີ ການ ຜະ ລິດ",
      ]),

      heading3("🇬🇧 ຂ່າວ GBP"),
      ...bulletList([
        "BOE Meeting: ທະ ນາ ຄານ ກາງ UK ຕັດ ສິນ ດອກ ເບ້ຍ",
        "UK CPI/GDP: ເສດ ຖ ກິດ UK",
        "UK Employment: ສ້ຽນ GBP ໄດ້ ດີ",
      ]),

      heading3("🇯🇵 ຂ່າວ JPY"),
      ...bulletList([
        "BOJ Meeting: ທະ ນາ ຄານ ກາງ ຍີ່ ປຸ່ນ ສ່ງ ຜົນ USD/JPY ສູງ",
        "Japan CPI/GDP",
        "Tankan Survey: ດັດ ຊະ ນີ ທຸ ລະ ກິດ ຍີ່ ປຸ່ນ",
      ]),

      heading2("ວິທີ ອ່ານ Economic Calendar"),
      ...bulletList([
        "Forecast: ຄ່າ ທີ່ ຕະ ຫຼາດ ຄາດ ຫວັງ",
        "Actual: ຄ່າ ຕົວ ຈິງ ທີ່ ປ່ອຍ ອອກ",
        "Previous: ຄ່າ ເດືອນ/ໄຕ ມາດ ກ່ອນ ໜ້າ",
        "Actual > Forecast → ດີ ກວ່າ ຄາດ → ເງິນ ຕາ ນັ້ນ ມັກ ແຂງ",
        "Actual < Forecast → ຕ່ຳ ກວ່າ ຄາດ → ເງິນ ຕາ ນັ້ນ ມັກ ອ່ອນ",
      ]),

      heading2("Impact Level"),
      ...bulletList([
        "🔴 High Impact: ສ່ງ ຜົນ ຫຼາຍ ລາຄາ ອາດ Spike ສູງ",
        "🟡 Medium Impact: ສ່ງ ຜົນ ປານ ກາງ",
        "⚪ Low Impact: ສ່ງ ຜົນ ໜ້ອຍ",
        "ສຳ ລັບ Beginner: ສ່ຽງ ຂ່າວ Red (High Impact) ເທົ່າ ນັ້ນ",
      ]),

      heading2("ຍຸດ ທະ ສາດ ໃຊ້ Economic Calendar"),

      heading3("Strategy 1: ຫຼີກ ລ່ຽງ ຂ່າວ"),
      ...bulletList([
        "ກວດ Calendar ທຸກ ເຊົ້າ",
        "ຖ້າ ມີ High Impact News → ບໍ່ Open Trade ໃໝ່ ກ່ອນ ຂ່າວ 30 ນາ ທີ",
        "ຖ້າ ມີ Position ຢູ່ → ຫຼຸດ Lot ຫຼື Close ກ່ອນ ຂ່າວ",
        "ດີ ທີ່ ສຸດ ສຳ ລັບ Beginner",
      ]),

      heading3("Strategy 2: News Trading"),
      ...bulletList([
        "ລໍ ຂ່າວ ອອກ ແລ້ວ ເບິ່ງ Spike",
        "Trade ທາງ ທີ່ Spike ຫຼຸດ ລົງ ກັບ ມາ (Fade the Spike)",
        "ຕ້ອງ ການ Execution ໄວ ຫຼາຍ",
        "ສຳ ລັບ Trader ທີ່ ມີ ປະ ສົບ ການ ເທົ່າ ນັ້ນ",
      ]),

      heading2("Websites ສຳ ລັບ Economic Calendar"),
      ...bulletList([
        "Forex Factory (forexfactory.com) — ດີ ທີ່ ສຸດ ຟຣີ",
        "Investing.com — ຂໍ້ ມູນ ຄົບ",
        "DailyFX Economic Calendar",
        "MT4/MT5 ມີ News Feed ໃນ ໂປ ຣ ແກ ຣ ມ",
      ]),
    ],
  },
]

// ===== ນຳ ເຂົ້າ =====

async function importArticles() {
  console.log("🚀 ເລີ່ມ ນຳ ເຂົ້າ 10 ບົດ ຮຽນ Education...")

  let success = 0
  let failed = 0

  for (const article of articles) {
    try {
      await client.createOrReplace({
        ...article,
        _id: `article-${article.slug.current}`,
      })
      console.log(`✅ ${article.title}`)
      success++
    } catch (err) {
      console.error(`❌ ${article.title}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n══════════════════════════════`)
  console.log(`✅ ສຳ ເລັດ: ${success} ບົດ`)
  if (failed > 0) console.log(`❌ ລົ້ມ ເຫຼວ: ${failed} ບົດ`)
  console.log(`══════════════════════════════`)
}

importArticles().catch(console.error)
