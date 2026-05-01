// seed-education-batch4.js
// ນຳເຂົ້າ 10 ບົດຮຽນ education batch 4
// ວິທີໃຊ້: node scripts/seed-education-batch4.js

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

  // 1. moving-average-guide
  {
    _type: "article",
    title: "Moving Average (MA): ໃຊ້ງ່າຍ ແຕ່ ມີ ປ ະ ສ ິ ດ ທ ິ ພ າ ບ",
    slug: { _type: "slug", current: "moving-average-guide" },
    category: "education",
    excerpt: "Moving Average ຄ ື Indicator ທ ີ ່ ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ ໃ ນ Forex ຮ ຽ ນ ຮ ູ ້ SMA, EMA ແ ລ ະ ວ ິ ທ ີ ໃ ຊ ້ ໃ ຫ ້ ຖ ູ ກ ຕ ້ ອ ງ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Moving Average ແມ່ນຫຍັງ?"),
      p("Moving Average (MA) ຄ ື Indicator ທ ີ ່ ຄ ຳ ນ ວ ນ ລ ານ ຄ ານ ສ ະ ເ ລ ່ ຍ ຂ ອ ງ ຈ ຳ ນ ວ ນ Candle ທ ີ ່ ກ ຳ ນ ົ ດ ສ ະ ແ ດ ງ ອ ອ ກ ເ ປ ັ ນ ເ ສ ັ ້ ນ ໃ ນ Chart ໃ ຊ ້ ດ ູ ທ ິ ດ Trend ຫ ຼ ັ ກ"),
      h2("ປ ະ ເ ພ ດ MA ທ ີ ່ ນ ິ ຍ ົ ມ"),
      h3("SMA (Simple Moving Average)"),
      p("ສ ະ ເ ລ ່ ຍ ລ ານ ຄ ານ Close ທ ຸ ກ Candle ເ ທ ່ ານ ກ ັ ນ ຕ ້ ອ ງ ຮ ັ ບ Weight ທ ຸ ກ Candle ເ ທ ່ ານ ກ ັ ນ ໂ ດ ຍ ບ ໍ ່ ໃ ຫ ້ ນ ້ ຳ ໜ ັ ກ ພ ິ ເ ສ ດ ກ ັ ບ Candle ຫ ຼ ້ ານ ສ ຸ ດ"),
      ...bullets(["SMA20 = ສ ະ ເ ລ ່ ຍ 20 Candle ຫ ຼ ້ ານ", "ຊ ້ ານ ກ ວ່ ານ EMA ຕ ່ ໍ ການ ຕ ອ ບ ສ ະ ໜ ອ ງ", "ໃ ຊ ້ ດ ູ Trend ໄ ລ ຍ ານ ຍ ານ: SMA100, SMA200"]),
      h3("EMA (Exponential Moving Average)"),
      p("EMA ໃ ຫ ້ ນ ້ ຳ ໜ ັ ກ ຫ ຼ ານ ກ ວ່ ານ ກ ັ ບ Candle ຫ ຼ ້ ານ ໆ ທ ຳ ໃ ຫ ້ ຕ ອ ບ ສ ະ ໜ ອ ງ ໄ ວ ກ ວ່ ານ SMA"),
      ...bullets(["EMA ນ ິ ຍ ົ ມ ໃ ນ Trend Following ແ ລ ະ Scalping", "EMA8, EMA21 ສ ຳ ລ ັ ບ Short-term", "EMA50, EMA200 ສ ຳ ລ ັ ບ Long-term"]),
      h2("MA ທ ີ ່ ໃ ຊ ້ ທ ົ ່ ວ ໄ ປ"),
      ...bullets([
        "MA20: Trend ລ ະ ສ ັ ້ ນ Dynamic Support/Resistance",
        "MA50: Trend ລ ະ ກ ານ ງ ທ ີ ່ ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ",
        "MA100: Trend ລ ະ ກ ານ ງ-ຍ ານ",
        "MA200: Trend ໄ ລ ຍ ານ ຍ ານ ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ",
      ]),
      h2("ວ ິ ທ ີ ໃ ຊ ້ MA"),
      h3("1. ດ ູ ທ ິ ດ Trend"),
      ...bullets(["ລ ານ ຄ ານ > MA200 = Uptrend ໃ ຫ ຍ ່", "ລ ານ ຄ ານ < MA200 = Downtrend ໃ ຫ ຍ ່", "MA ຊ ີ ້ ທ ານ ງ ຂ ຶ ້ ນ = Trend ຂ ຶ ້ ນ"]),
      h3("2. Dynamic Support/Resistance"),
      ...bullets(["ລ ານ ຄ ານ Pullback ມ ານ MA20/50 ໃ ນ Uptrend = ໂ ອ ກ ານ ດ Buy", "ໃ ຊ ້ Candle Confirm ກ ່ ອ ນ Entry", "Stop ຢ ູ ່ ຕ ່ ຳ ກ ວ່ ານ MA"]),
      h3("3. Golden Cross / Death Cross"),
      ...bullets(["Golden Cross: MA50 Cross MA200 ຂ ຶ ້ ນ = Bullish ໄ ລ ຍ ານ ຍ ານ", "Death Cross: MA50 Cross MA200 ລ ົ ງ = Bearish ໄ ລ ຍ ານ ຍ ານ", "Signal ຊ ້ ານ ແ ຕ ່ ໜ ້ ານ ເ ຊ ື ່ ອ ຖ ື"]),
      h2("ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ"),
      ...bullets(["❌ ໃ ຊ ້ MA ດ ຽ ວ: ໃ ຊ ້ ຮ ່ ວ ມ ກ ັ ບ S/R ແ ລ ະ Candle Pattern", "❌ MA ໃ ນ Sideways: ລ ານ ຄ ານ ຕ ັ ດ MA ຫ ຼ ານ ຄ ັ ້ ງ Signal ຫ ຼ ານ Fake", "❌ Period ຜ ິ ດ: ເ ລ ື ອ ກ Period ໃ ຫ ້ ເ ໝ ານ ະ Timeframe"]),
    ],
  },

  // 2. rsi-indicator-guide
  {
    _type: "article",
    title: "RSI Indicator: ໃ ຊ ້ ຢ ່ ານ ໃ ດ ໃ ຫ ້ ຖ ູ ກ ຕ ້ ອ ງ?",
    slug: { _type: "slug", current: "rsi-indicator-guide" },
    category: "education",
    excerpt: "RSI (Relative Strength Index) ຄ ື Momentum Indicator ທ ີ ່ ນ ິ ຍ ົ ມ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ໃ ຊ ້ RSI Overbought Oversold ແ ລ ະ Divergence",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("RSI ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("RSI (Relative Strength Index) ຄ ື Indicator ທ ີ ່ ວ ັ ດ ແ ທ ກ ຄ ວ ານ ມ ແ ຮ ງ ຂ ອ ງ ການ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ລ ານ ຄ ານ ສ ະ ແ ດ ງ ຄ ່ ານ 0-100 ສ ້ ານ ງ ໂ ດ ຍ J. Welles Wilder"),
      h2("ການ ອ ່ ານ RSI"),
      ...bullets([
        "RSI > 70: Overbought — ລ ານ ຄ ານ ຂ ຶ ້ ນ ໄ ວ ເ ກ ີ ນ ໄ ປ ອ ານ ດ ລ ົ ງ",
        "RSI < 30: Oversold — ລ ານ ຄ ານ ລ ົ ງ ໄ ວ ເ ກ ີ ນ ໄ ປ ອ ານ ດ ຂ ຶ ້ ນ",
        "RSI = 50: ເ ສ ັ ້ ນ ກ ານ ງ ໃ ນ Uptrend RSI > 50, Downtrend RSI < 50",
        "Period ມ າ ດ ຕ ະ ຖ ານ: 14",
      ]),
      h2("ວ ິ ທ ີ ໃ ຊ ້ RSI"),
      h3("1. Overbought/Oversold"),
      ...numbers(["RSI < 30 ໃ ນ Downtrend = ບ ໍ ່ Buy ຕ ອ ນ ນ ີ ້", "RSI < 30 ໃ ນ Sideways = ໂ ອ ກ ານ ດ Buy", "RSI > 70 ໃ ນ Uptrend = ອ ານ ດ ຍ ັ ງ ຂ ຶ ້ ນ ຕ ່ ໍ ໄ ດ ້", "ໃ ຊ ້ ຮ ່ ວ ມ ກ ັ ບ S/R ສ ະ ເ ໝ ີ"]),
      h3("2. RSI Divergence (ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ)"),
      p("Bullish Divergence: ລ ານ ຄ ານ ສ ້ ານ ງ Lower Low ແ ຕ ່ RSI ສ ້ ານ ງ Higher Low = ສ ັ ນ ຍ ານ ກ ລ ັ ບ ຂ ຶ ້ ນ"),
      p("Bearish Divergence: ລ ານ ຄ ານ ສ ້ ານ ງ Higher High ແ ຕ ່ RSI ສ ້ ານ ງ Lower High = ສ ັ ນ ຍ ານ ກ ລ ັ ບ ລ ົ ງ"),
      ...bullets(["Divergence ໃ ນ H4/Daily ໜ ້ ານ ເ ຊ ື ່ ອ ຖ ື ທ ີ ່ ສ ຸ ດ", "Confirm ດ ້ ວ ຍ Candle Pattern ກ ່ ອ ນ Entry", "ໜ ຶ ່ ງ ໃ ນ Setup ທ ີ ່ ດ ີ ທ ີ ່ ສ ຸ ດ ໃ ນ Technical Analysis"]),
      h3("3. RSI Centerline Cross"),
      ...bullets(["RSI Cross 50 ຂ ຶ ້ ນ = Bullish Momentum", "RSI Cross 50 ລ ົ ງ = Bearish Momentum", "ໃ ຊ ້ ຢ ັ ້ ງ ຢ ື ນ ທ ິ ດ Trend"]),
      h2("ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ"),
      ...bullets(["❌ Sell ທ ຸ ກ ຄ ັ ້ ງ RSI > 70: ໃ ນ Strong Uptrend RSI ຢ ູ ່ Overbought ດ ົ ນ", "❌ ໃ ຊ ້ RSI ດ ຽ ວ: ໃ ຊ ້ ຮ ່ ວ ມ ກ ັ ບ Price Action", "❌ Period ສ ັ ້ ນ ເ ກ ີ ນ: RSI(5) Noise ຫ ຼ ານ"]),
    ],
  },

  // 3. macd-indicator-guide
  {
    _type: "article",
    title: "MACD Indicator: ໃ ຊ ້ ຢ ່ ານ ໃ ດ ສ ຳ ລ ັ ບ Trend ແ ລ ະ Momentum",
    slug: { _type: "slug", current: "macd-indicator-guide" },
    category: "education",
    excerpt: "MACD ຄ ື Indicator ທ ີ ່ ດ ູ ທ ັ ງ Trend ແ ລ ະ Momentum ຮ ຽ ນ ຮ ູ ້ MACD Cross, Histogram ແ ລ ະ Divergence",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("MACD ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("MACD (Moving Average Convergence Divergence) ຄ ື Indicator ທ ີ ່ ສ ້ ານ ງ ຈ າ ກ ສ ່ ວ ນ ຕ ່ ານ ຂ ອ ງ EMA12 ແ ລ ະ EMA26 ແ ລ ະ ມ ີ Signal Line (EMA9 ຂ ອ ງ MACD)"),
      h2("ສ ່ ວ ນ ປ ະ ກ ອ ບ"),
      ...bullets(["MACD Line: EMA12 - EMA26", "Signal Line: EMA9 ຂ ອ ງ MACD Line", "Histogram: MACD - Signal Line (ສ ະ ແ ດ ງ ຄ ວ ານ ມ ແ ຮ ງ Momentum)"]),
      h2("ວ ິ ທ ີ ໃ ຊ ້ MACD"),
      h3("1. MACD Cross"),
      ...bullets(["MACD ຂ ຶ ້ ນ ເ ທ ິ ງ Signal Line = Buy Signal", "MACD ລ ົ ງ ລ ຸ ່ ມ Signal Line = Sell Signal", "Cross ໃ ນ Positive Zone (ຂ ຶ ້ ນ): ແ ຮ ງ ກ ວ່ ານ Negative Zone"]),
      h3("2. Histogram"),
      ...bullets(["Histogram ສ ູ ງ ຂ ຶ ້ ນ = Momentum ເ ພ ີ ່ ມ", "Histogram ຕ ່ ຳ ລ ົ ງ = Momentum ຫ ຼ ຸ ດ", "Histogram ປ ່ ຽ ນ ທ ິ ດ = ສ ັ ນ ຍ ານ Early"]),
      h3("3. MACD Divergence"),
      p("ຄ ້ ານ ຍ ກ ັ ນ ກ ັ ບ RSI Divergence ໃ ຊ ້ ຢ ັ ້ ງ ຢ ື ນ Reversal ໄ ດ ້ ດ ີ"),
      ...bullets(["Bullish Divergence: ລ ານ ຄ ານ LL ແ ຕ ່ MACD HL = ຊ ື ້", "Bearish Divergence: ລ ານ ຄ ານ HH ແ ຕ ່ MACD LH = ຂ ານ", "ໃ ຊ ້ H4/Daily ຈ ຶ ່ ງ ໜ ້ ານ ເ ຊ ື ່ ອ ຖ ື"]),
      h2("MACD ໃ ຊ ້ ຮ ່ ວ ມ ກ ັ ບ ຫ ຍ ັ ງ?"),
      ...bullets(["MACD + MA200: Trend Direction + Momentum", "MACD + S/R: Confirm Entry ທ ີ ່ Key Level", "MACD + RSI: ຢ ັ ້ ງ ຢ ື ນ Divergence ດ ້ ວ ຍ ສ ອ ງ Indicator"]),
      h2("ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ"),
      ...bullets(["❌ MACD Lagging: ຊ ້ ານ ກ ວ່ ານ ລ ານ ຄ ານ ຈ ິ ງ", "❌ ໃ ຊ ້ ໃ ນ Sideways: Crossover ຫ ຼ ານ Fake", "❌ ໃ ຊ ້ ດ ຽ ວ: ຕ ້ ອ ງ ຮ ່ ວ ມ ກ ັ ບ Price Action"]),
    ],
  },

  // 4. fibonacci-retracement
  {
    _type: "article",
    title: "Fibonacci Retracement: ຊ ອ ກ Entry ໃ ນ Pullback",
    slug: { _type: "slug", current: "fibonacci-retracement" },
    category: "education",
    excerpt: "Fibonacci Retracement ຄ ື ເ ຄ ື ່ ອ ງ ມ ື ທ ີ ່ ຊ ອ ກ ລ ະ ດ ັ ບ Support/Resistance ຊ ອ ກ Entry ໃ ນ Pullback ດ ່ ວ ຍ Ratio ທ ຳ ຊ ານ ດ",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Fibonacci ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Fibonacci Retracement ໃ ຊ ້ ຕ ົ ວ ເ ລ ກ ຈ າ ກ ລ ໍ ດ ັ ບ Fibonacci ສ ້ ານ ງ ລ ະ ດ ັ ບ % ທ ີ ່ ລ ານ ຄ ານ ມ ັ ກ Pullback/Retrace ໄ ປ ກ ່ ອ ນ ທ ີ ່ ຈ ະ ດ ຳ ເ ນ ີ ນ ຕ ່ ໍ"),
      h2("ລ ະ ດ ັ ບ Fibonacci ສ ຳ ຄ ັ ນ"),
      ...bullets([
        "23.6%: Shallow Pullback, Strong Trend",
        "38.2%: Pullback ທ ຳ ມ ະ ດ ານ Trend ຍ ັ ງ ດ ີ",
        "50.0%: ລ ະ ດ ັ ບ ທ ີ ່ ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ (ບ ໍ ່ ແ ມ ່ ນ Fibonacci ຈ ິ ງ ແ ຕ ່ ນ ິ ຍ ົ ມ)",
        "61.8%: Golden Ratio, ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ",
        "78.6%: Deep Pullback, Trend ອ ່ ອ ນ ລ ົ ງ",
      ]),
      h2("ວ ິ ທ ີ ແ ຕ ້ ມ Fibonacci"),
      ...numbers([
        "ຫ ານ Swing Low ແ ລ ະ Swing High ທ ີ ່ ຊ ັ ດ ເ ຈ ນ",
        "ໃ ນ Uptrend: ແ ຕ ້ ມ ຈ າ ກ Low → High",
        "ໃ ນ Downtrend: ແ ຕ ້ ມ ຈ າ ກ High → Low",
        "ລ ະ ດ ັ ບ % ຈ ະ ສ ະ ແ ດ ງ Support/Resistance",
      ]),
      h2("Entry Strategy ດ ້ ວ ຍ Fibonacci"),
      h3("Pullback Entry (ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ)"),
      ...numbers([
        "ຢ ືນ ຢ ັ ນ Uptrend ໃ ນ Daily",
        "ລ ໍ Pullback ລ ົ ງ ມ ານ 38.2% - 61.8%",
        "ຫ ານ Bullish Candle ທ ີ ່ Fib Level",
        "Entry Buy, Stop ຢ ູ ່ ຕ ່ ຳ ກ ວ່ ານ 78.6%",
        "Target: Previous High ຫ ຼ ື Fib Extension 127-161%",
      ]),
      h2("Fibonacci Extension"),
      ...bullets([
        "127.2%: Target ທ ຳ ອ ິ ດ ຫ ຼ ັ ງ Breakout",
        "161.8%: Target ທ ີ ່ 2",
        "261.8%: Target ໄ ລ ຍ ານ ຍ ານ",
        "ໃ ຊ ້ ວ ານ ງ Target ໃ ນ Trend Following",
      ]),
      h2("ຄ ວ ານ ມ ຜ ິ ດ ພ ານ ດ"),
      ...bullets([
        "❌ ແ ຕ ້ ມ ຜ ິ ດ: ຕ ້ ອ ງ ເ ລ ີ ່ ມ ຈ າ ກ Swing Low/High ທ ີ ່ ຊ ັ ດ ເ ຈ ນ",
        "❌ ໃ ຊ ້ ດ ຽ ວ: ຮ ່ ວ ມ ກ ັ ບ Candle Pattern ແ ລ ະ S/R",
        "❌ ທ ຸ ກ Level ສ ຳ ຄ ັ ນ: ເ ລ ື ອ ກ 38.2%, 50%, 61.8% ເ ທ ່ ານ ນ ັ ້ ນ",
      ]),
    ],
  },

  // 5. bollinger-bands-guide
  {
    _type: "article",
    title: "Bollinger Bands: ວ ັ ດ Volatility ແ ລ ະ ຊ ອ ກ Reversal",
    slug: { _type: "slug", current: "bollinger-bands-guide" },
    category: "education",
    excerpt: "Bollinger Bands ຄ ື Indicator ທ ີ ່ ໃ ຊ ້ ວ ັ ດ Volatility ຮ ຽ ນ ຮ ູ ້ Band Squeeze, Bounce ແ ລ ະ Breakout Strategy",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Bollinger Bands ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Bollinger Bands ປ ະ ກ ອ ບ ດ ້ ວ ຍ 3 ເ ສ ັ ້ ນ: Middle Band (SMA20) + Upper Band (SMA20 + 2σ) + Lower Band (SMA20 - 2σ) ໂ ດ ຍ σ ຄ ື Standard Deviation"),
      h2("ການ ອ ່ ານ Bollinger Bands"),
      ...bullets([
        "Band ກ ວ ້ ານ = Volatility ສ ູ ງ, ຕ ະ ຫ ຼ ານ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຫ ຼ ານ",
        "Band ແ ຄ ບ (Squeeze) = Volatility ຕ ່ ຳ, ອ ານ ດ Breakout ໃ ກ ້",
        "ລ ານ ຄ ານ ທ ີ ່ Upper Band = Overbought ໃ ນ Ranging Market",
        "ລ ານ ຄ ານ ທ ີ ່ Lower Band = Oversold ໃ ນ Ranging Market",
      ]),
      h2("Strategy ທ ີ ່ ນ ິ ຍ ົ ມ"),
      h3("1. Bollinger Bounce (Mean Reversion)"),
      ...numbers(["ລ ານ ຄ ານ ຂ ຶ ້ ນ ຮ ອ ດ Upper Band", "ລ ໍ Rejection Candle ທ ີ ່ Band", "Sell ໄ ປ ຫ ານ Middle Band", "ໃ ຊ ້ ໃ ນ Sideways Market ເ ທ ່ ານ ນ ັ ້ ນ"]),
      h3("2. Bollinger Squeeze Breakout"),
      ...numbers(["Band ແ ຄ ບ ດ ົ ນ = Energy ສ ະ ສ ົ ມ", "ລ ໍ Candle Break ອ ອ ກ ຈ າ ກ Band", "Breakout ທ ານ ງ ໃ ດ = Trade ທ ານ ງ ນ ັ ້ ນ", "Stop: Middle Band", "Target: Width ຂ ອ ງ Band"]),
      h3("3. Band ເ ປ ັ ນ Target"),
      ...bullets(["ໃ ນ Uptrend: Upper Band ຄ ື Target", "ໃ ນ Downtrend: Lower Band ຄ ື Target", "Trailing Stop ດ ້ ວ ຍ Middle Band"]),
      h2("ໃ ຊ ້ ຮ ່ ວ ມ ກ ັ ບ ຫ ຍ ັ ງ?"),
      ...bullets(["Bollinger + RSI: Overbought/Oversold ທ ີ ່ Band", "Bollinger + MACD: Breakout Confirm", "Bollinger + Volume: Breakout ທ ີ ່ ໜ ້ ານ ເ ຊ ື ່ ອ ຖ ື"]),
    ],
  },

  // 6. chart-patterns-guide
  {
    _type: "article",
    title: "Chart Patterns: ຮ ູ ບ ແ ບ ບ ລ ານ ຄ ານ ທ ີ ່ ສ ຳ ຄ ັ ນ",
    slug: { _type: "slug", current: "chart-patterns-guide" },
    category: "education",
    excerpt: "Chart Patterns ເ ຊ ່ ນ Head & Shoulders, Double Top/Bottom, Triangle ຊ ່ ວ ຍ ຄ ານ ດ ທ ິ ດ ທ ານ ລ ານ ຄ ານ ໄ ດ ້ ຮ ຽ ນ ຮ ູ ້ Pattern ສ ຳ ຄ ັ ນ",
    readTime: 14,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Chart Patterns ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Chart Patterns ຄ ື ຮ ູ ບ ແ ບ ບ ທ ີ ່ ສ ້ ານ ງ ຈ າ ກ ການ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ລ ານ ຄ ານ ຊ ່ ວ ຍ ຄ ານ ດ ທ ິ ດ ທ ານ ໃ ນ ອ ານ ຄ ົ ດ ແ ບ ່ ງ ເ ປ ັ ນ 2 ກ ຸ ່ ມ: Reversal Patterns ແ ລ ະ Continuation Patterns"),
      h2("Reversal Patterns"),
      h3("Head & Shoulders"),
      p("ສ ັ ນ ຍ ານ Trend ກ ລ ັ ບ ທ ີ ່ ໜ ້ ານ ເ ຊ ື ່ ອ ຖ ື ທ ີ ່ ສ ຸ ດ ຮ ູ ບ ແ ບ ບ: Left Shoulder → Head (ສ ູ ງ ທ ີ ່ ສ ຸ ດ) → Right Shoulder → Break Neckline"),
      ...bullets(["Neckline Break = Entry Sell", "Target = Head Height ຈ າ ກ Neckline", "Inverse H&S = ສ ັ ນ ຍ ານ Buy"]),
      h3("Double Top / Double Bottom"),
      p("Double Top: ລ ານ ຄ ານ ຂ ຶ ້ ນ High ດ ຽ ວ ກ ັ ນ 2 ຄ ັ ້ ງ ແ ລ ້ ວ Reject = Bearish"),
      p("Double Bottom: ລ ານ ຄ ານ ລ ົ ງ Low ດ ຽ ວ ກ ັ ນ 2 ຄ ັ ້ ງ ແ ລ ້ ວ Bounce = Bullish"),
      ...bullets(["Break Neckline = Confirm Pattern", "Target = Height ຂ ອ ງ Pattern", "ຫ ຼ ານ Reliable ໃ ນ Daily/H4"]),
      h2("Continuation Patterns"),
      h3("Flag / Pennant"),
      p("ຫ ຼ ັ ງ Strong Move ລ ານ ຄ ານ ຢ ຸ ດ ຊ ົ ່ ວ ຄ ານ ວ ໃ ນ Channel ນ ້ ອ ຍ (Flag) ຫ ຼ ື Triangle ນ ້ ອ ຍ (Pennant) ກ ່ ອ ນ ດ ຳ ເ ນ ີ ນ ຕ ່ ໍ"),
      ...bullets(["Bull Flag: Uptrend, ໜ ີ ລ ົ ງ ນ ້ ອ ຍ ໆ → Break ຂ ຶ ້ ນ", "Bear Flag: Downtrend, Bounce ຂ ຶ ້ ນ ນ ້ ອ ຍ ໆ → Break ລ ົ ງ", "Target: Flagpole Height"]),
      h3("Triangle"),
      ...bullets(["Ascending Triangle → Bullish Breakout", "Descending Triangle → Bearish Breakdown", "Symmetrical Triangle → ທ ານ ງ Trend ຫ ຼ ັ ກ"]),
      h2("ວ ິ ທ ີ Trade Pattern"),
      ...numbers(["ລ ໍ Pattern ສ ຳ ເ ລ ັ ດ ຊ ັ ດ ເ ຈ ນ", "ລ ໍ Breakout ຈ າ ກ Neckline/Boundary", "Entry ຫ ຼ ັ ງ Confirm (Retest ດ ີ ທ ີ ່ ສ ຸ ດ)", "Target: Measured Move", "Stop: ໃ ນ Pattern"]),
    ],
  },

  // 7. trend-lines-channels
  {
    _type: "article",
    title: "Trend Lines ແ ລ ະ Channels: ແ ຕ ້ ມ ຢ ່ ານ ໃ ດ ໃ ຫ ້ ຖ ູ ກ",
    slug: { _type: "slug", current: "trend-lines-channels" },
    category: "education",
    excerpt: "Trend Lines ແ ລ ະ Channels ຊ ່ ວ ຍ ດ ູ ທ ິ ດ ທ ານ Trend ແ ລ ະ ຊ ອ ກ Entry Point ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ແ ຕ ້ ມ ທ ີ ່ ຖ ູ ກ ຕ ້ ອ ງ",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Trend Line ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Trend Line ຄ ື ເ ສ ັ ້ ນ ທ ີ ່ ໂ ຍ ງ ຜ ່ ານ Swing Highs ຫ ຼ ື Swing Lows ໃ ນ Chart ສ ະ ແ ດ ງ ທ ິ ດ Trend ແ ລ ະ ເ ຮ ັ ດ ໜ ້ ານ ທ ີ ່ ເ ປ ັ ນ Dynamic Support/Resistance"),
      h2("ວ ິ ທ ີ ແ ຕ ້ ມ Trend Line"),
      h3("Uptrend Line (Support)"),
      ...numbers(["ໃ ຊ ້ Daily ຫ ຼ ື H4", "ຊ ອ ກ 2+ Swing Lows ທ ີ ່ ສ ູ ງ ຂ ຶ ້ ນ ເ ລ ື ່ ອ ຍ ໆ", "ໂ ຍ ງ ເ ສ ັ ້ ນ ຜ ່ ານ ຈ ຸ ດ ລ ຸ ່ ມ ທ ຳ ສ ຸ ດ", "ຢ ່ ານ ໃ ຫ ້ ເ ສ ັ ້ ນ ຜ ່ ານ Candle Body"]),
      h3("Downtrend Line (Resistance)"),
      ...numbers(["ຊ ອ ກ 2+ Swing Highs ທ ີ ່ ຕ ່ ຳ ລ ົ ງ ເ ລ ື ່ ອ ຍ ໆ", "ໂ ຍ ງ ເ ສ ັ ້ ນ ຜ ່ ານ ຈ ຸ ດ ສ ູ ງ ທ ຳ ສ ຸ ດ", "ທ ຸ ກ ຄ ັ ້ ງ ທ ີ ່ ລ ານ ຄ ານ ຂ ຶ ້ ນ ຮ ອ ດ ເ ສ ັ ້ ນ = ໂ ອ ກ ານ ດ Sell"]),
      h2("Channel Trading"),
      p("Channel ຄ ື ການ ແ ຕ ້ ມ Trend Line ທ ັ ງ ສ ອ ງ ດ ້ ານ (Support + Resistance) ຂ ນ ານ ກ ັ ນ"),
      ...bullets(["Ascending Channel: Buy ທ ີ ່ Lower Line, Target Upper Line", "Descending Channel: Sell ທ ີ ່ Upper Line, Target Lower Line", "Horizontal Channel (Range): ຊ ື ້ Support ຂ ານ Resistance"]),
      h2("Trend Line Break"),
      ...bullets(["ລ ານ ຄ ານ Close ຕ ່ ຳ ກ ວ່ ານ Uptrend Line = Sell Signal", "ລ ານ ຄ ານ Close ສ ູ ງ ກ ວ່ ານ Downtrend Line = Buy Signal", "ລ ໍ Retest ຂ ອ ງ ເ ສ ັ ້ ນ ທ ີ ່ Break ກ ່ ອ ນ Entry ດ ີ ທ ີ ່ ສ ຸ ດ"]),
      h2("ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ"),
      ...bullets(["❌ ແ ຕ ້ ມ ຫ ຼ ານ ເ ສ ັ ້ ນ: 1-2 ເ ສ ັ ້ ນ ທ ີ ່ ສ ຳ ຄ ັ ນ ພ ໍ", "❌ ປ ່ ຽ ນ ເ ສ ັ ້ ນ ທ ຸ ກ ທ ີ: Trend Line ຕ ້ ອ ງ Consistent", "❌ ໃ ຊ ້ ໃ ນ Timeframe ນ ້ ອ ຍ: ໃ ຊ ້ H4/Daily ກ ່ ອ ນ"]),
    ],
  },

  // 8. currency-pairs-basics
  {
    _type: "article",
    title: "Currency Pairs: Major, Minor, Exotic ຕ ່ ານ ກ ັ ນ ຫ ຍ ັ ງ?",
    slug: { _type: "slug", current: "currency-pairs-basics" },
    category: "education",
    excerpt: "Currency Pairs ໃ ນ Forex ແ ບ ່ ງ ເ ປ ັ ນ Major, Minor ແ ລ ະ Exotic ຮ ຽ ນ ຮ ູ ້ ວ ່ ານ ແ ຕ ່ ລ ະ ກ ຸ ່ ມ ເ ໝ ານ ະ ສ ຳ ລ ັ ບ Trader ລ ານ ຫ ຍ ັ ງ",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Currency Pair ຄ ື ຫ ຍ ັ ງ?"),
      p("ໃ ນ Forex ທ ່ ານ ບ ໍ ່ ໄ ດ ້ ຊ ື ້ ຂ ານ ສ ະ ກ ຸ ນ ດ ຽ ວ ທ ່ ານ ສ ະ ເ ໝ ີ ຊ ື ້ ສ ະ ກ ຸ ນ ໜ ຶ ່ ງ ແ ລ ະ ຂ ານ ອ ີ ກ ສ ະ ກ ຸ ນ ໜ ຶ ່ ງ ພ ້ ອ ມ ກ ັ ນ ນ ີ ້ ຄ ື Currency Pair"),
      h2("Major Pairs"),
      p("Major Pairs ຄ ື Pair ທ ີ ່ ມ ີ USD ທ ຸ ກ Pair Liquidity ສ ູ ງ Spread ຕ ່ ຳ ທ ີ ່ ສ ຸ ດ:"),
      ...bullets(["EUR/USD: ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ ໃ ນ ໂ ລ ກ Spread ຕ ່ ຳ", "USD/JPY: ສ ຳ ລ ັ ບ Tokyo/NY Session", "GBP/USD: Volatile ດ ີ ສ ຳ ລ ັ ບ Swing", "USD/CHF: Safe Haven Pair", "AUD/USD: ຕ ານ ມ ສ ິ ນ ຄ ້ ານ Commodity", "USD/CAD: ຕ ານ ມ ລ ານ ຄ ານ ນ ້ ຳ ມ ັ ນ", "NZD/USD: ຄ ້ ານ ຍ AUD/USD"]),
      h2("Minor Pairs (Cross Pairs)"),
      p("Minor Pairs ບ ໍ ່ ມ ີ USD ແ ຕ ່ ມ ີ ສ ະ ກ ຸ ນ Major ອ ື ່ ນ Spread ສ ູ ງ ກ ວ່ ານ Major:"),
      ...bullets(["EUR/GBP, EUR/JPY, EUR/CHF", "GBP/JPY: Volatile ສ ູ ງ ມ ານ ກ", "AUD/JPY, NZD/JPY: Carry Trade", "Spread ສ ູ ງ ກ ວ່ ານ Major ໜ ້ ອ ຍ"]),
      h2("Exotic Pairs"),
      p("Exotic ມ ີ ສ ະ ກ ຸ ນ ຈ າ ກ ປ ະ ເ ທ ດ ກ ຳ ລ ັ ງ ພ ັ ດ ທ ະ ນ ານ Spread ສ ູ ງ ຫ ຼ ານ Liquidity ຕ ່ ຳ:"),
      ...bullets(["USD/THB, USD/LAK (ຕ ານ ມ ທ ່ ານ)", "USD/SGD, USD/HKD", "USD/ZAR, USD/TRY", "ສ ຳ ລ ັ ບ Advanced Trader ເ ທ ່ ານ"]),
      h2("ຄ ວ ນ ເ ລ ີ ່ ມ ດ ້ ວ ຍ Pair ໃ ດ?"),
      ...bullets(["Beginner: EUR/USD ດ ີ ທ ີ ່ ສ ຸ ດ Spread ຕ ່ ຳ ຂ ້ ໍ ມ ູ ນ ຫ ຼ ານ", "Intermediate: ເ ພ ີ ່ ມ GBP/USD ຫ ຼ ື USD/JPY", "XAUUSD (Gold): ນ ິ ຍ ົ ມ ຫ ຼ ານ ໃ ນ ລ ານ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ດ ີ", "ຫ ຼ ານ ສ ຸ ດ 2-3 Pair ກ ່ ອ ນ"]),
    ],
  },

  // 9. order-types-sltp
  {
    _type: "article",
    title: "Order Types: Market, Limit, Stop, SL/TP ໃ ຊ ້ ຢ ່ ານ ໃ ດ?",
    slug: { _type: "slug", current: "order-types-sltp" },
    category: "education",
    excerpt: "ຄ ຳ ສ ັ ່ ງ ໃ ນ MT4/MT5 ມ ີ ຫ ຼ ານ ປ ະ ເ ພ ດ ຮ ຽ ນ ຮ ູ ້ Market Order, Limit Order, Stop Order ແ ລ ະ ການ ຕ ັ ້ ງ SL/TP",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ປ ະ ເ ພ ດ Order ໃ ນ MT4/MT5"),
      h3("1. Market Order"),
      p("ຊ ື ້/ຂ ານ ທ ັ ນ ທ ີ ທ ີ ່ ລ ານ ຄ ານ ຕ ະ ຫ ຼ ານ ປ ັ ດ ຈ ຸ ບ ັ ນ"),
      ...bullets(["ໄ ວ ທ ີ ່ ສ ຸ ດ ໄ ດ ້ Fill ທ ັ ນ ທ ີ", "ອ ານ ດ Slippage ໃ ນ ຊ ່ ວ ງ ຂ ່ ານ", "ໃ ຊ ້ ເ ມ ື ່ ອ Momentum ແ ຮ ງ ແ ລ ະ ຢ ານ Entry ທ ັ ນ ທ ີ"]),
      h3("2. Limit Order"),
      p("ຕ ັ ້ ງ ລ ານ ຄ ານ ໄ ວ ້ ລ ່ ວ ງ ໜ ້ ານ Order ຈ ະ Fill ເ ມ ື ່ ອ ລ ານ ຄ ານ ຮ ອ ດ"),
      ...bullets(["Buy Limit: ຊ ື ້ ເ ມ ື ່ ອ ລ ານ ຄ ານ ລ ົ ງ ຮ ອ ດ Level ທ ີ ່ ກ ຳ ນ ົ ດ", "Sell Limit: ຂ ານ ເ ມ ື ່ ອ ລ ານ ຄ ານ ຂ ຶ ້ ນ ຮ ອ ດ Level", "ໃ ຊ ້ Entry ຢ ູ ່ Support/Resistance ລ ່ ວ ງ ໜ ້ ານ", "ດ ີ ກ ວ່ ານ Market Order: ລ ານ ຄ ານ Entry ດ ີ ກ ວ່ ານ"]),
      h3("3. Stop Order"),
      p("Order ທ ີ ່ Trigger ເ ມ ື ່ ອ ລ ານ ຄ ານ Break ຜ ່ ານ Level"),
      ...bullets(["Buy Stop: ຊ ື ້ ເ ມ ື ່ ອ ລ ານ ຄ ານ ຂ ຶ ້ ນ ຮ ອ ດ Level (Breakout Buy)", "Sell Stop: ຂ ານ ເ ມ ື ່ ອ ລ ານ ຄ ານ ລ ົ ງ ຮ ອ ດ Level (Breakdown Sell)", "ໃ ຊ ້ Breakout Strategy"]),
      h2("Stop Loss (SL) ແ ລ ະ Take Profit (TP)"),
      ...bullets([
        "Stop Loss: ປ ິ ດ Trade ອ ັ ດ ຕ ະ ໂ ນ ມ ັ ດ ເ ມ ື ່ ອ ຂ ານ ທ ຶ ນ ຮ ອ ດ Level",
        "Take Profit: ປ ິ ດ Trade ອ ັ ດ ຕ ະ ໂ ນ ມ ັ ດ ເ ມ ື ່ ອ ກ ຳ ໄ ລ ຮ ອ ດ Level",
        "ຕ ັ ້ ງ SL/TP ທ ຸ ກ Trade ກ ່ ອ ນ Enter",
        "ຢ ່ ານ Trade ໂ ດ ຍ ບ ໍ ່ ມ ີ SL: ສ ່ ຽ ງ Margin Call",
      ]),
      h2("Trailing Stop"),
      ...bullets(["SL ທ ີ ່ ເ ລ ື ່ ອ ນ ຕ ານ ມ ລ ານ ຄ ານ ໂ ດ ຍ ອ ັ ດ ຕ ະ ໂ ນ ມ ັ ດ", "Lock ກ ຳ ໄ ລ ຂ ະ ນ ະ Trend ດ ຳ ເ ນ ີ ນ ຕ ່ ໍ", "ໃ ນ MT4: Trailing Stop ກ ຳ ນ ົ ດ ເ ປ ັ ນ Points", "ດ ີ ສ ຳ ລ ັ ບ Trend Following"]),
    ],
  },

  // 10. trading-journal
  {
    _type: "article",
    title: "Trading Journal: ເ ຄ ື ່ ອ ງ ມ ື ທ ີ ່ Trader ສ່ ວ ນ ໃ ຫ ຍ ່ ລ ື ມ ໃ ຊ ້",
    slug: { _type: "slug", current: "trading-journal" },
    category: "education",
    excerpt: "Trading Journal ຄ ື ເ ຄ ື ່ ອ ງ ມ ື ທ ີ ່ ແ ຍ ກ ລ ະ ຫ ວ ່ ານ Trader ທ ີ ່ ດ ີ ຂ ຶ ້ ນ ກ ັ ບ Trader ທ ີ ່ ວ ົ ນ ຢ ູ ່ ທ ີ ່ ເ ດ ີ ມ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ເ ຮ ັ ດ Journal ທ ີ ່ ໃ ຊ ້ ໄ ດ ້ ຈ ິ ງ",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ເ ປ ັ ນ ຫ ຍ ັ ງ Trading Journal ຈ ຶ ່ ງ ສ ຳ ຄ ັ ນ?"),
      p("ທ ຸ ກ Professional Trader ທ ີ ່ ປ ະ ສ ົ ບ ຄ ວ ານ ມ ສ ຳ ເ ລ ັ ດ ໃ ຊ ້ Trading Journal ໂ ດ ຍ ບ ໍ ່ ມ ີ Journal ທ ່ ານ ຈ ະ ເ ຮ ັ ດ ຂ ້ ໍ ຜ ິ ດ ດ ຽ ວ ກ ັ ນ ຊ ້ ຳ ໆ ໂ ດ ຍ ບ ໍ ່ ຮ ູ ້ ຕ ົ ວ"),
      h2("ສ ິ ່ ງ ທ ີ ່ ຕ ້ ອ ງ ບ ັ ນ ທ ຶ ກ"),
      ...bullets([
        "Date/Time: ວ ັ ນ ທ ີ ເ ວ ລ ານ Entry ແ ລ ະ Exit",
        "Pair & Direction: EUR/USD Long",
        "Timeframe: H4 Analysis, H1 Entry",
        "Setup: ຮ ູ ບ ແ ບ ບ ທ ີ ່ ເ ຫ ັ ນ (Breakout, Pullback ໆ)",
        "Entry/SL/TP: ລ ານ ຄ ານ ທ ຸ ກ ຈ ຸ ດ",
        "Lot Size ແ ລ ະ Risk Amount ($)",
        "Result: P&L ຂ ອ ງ Trade",
        "Emotion: ຮ ູ ້ ສ ຶ ກ ຫ ຍ ັ ງ ກ ່ ອ ນ/ລ ະ ຫ ວ ່ ານ/ຫ ຼ ັ ງ",
        "Lesson: ຮ ຽ ນ ຮ ູ ້ ຫ ຍ ັ ງ ຈ ານ ກ Trade ນ ີ ້?",
      ]),
      h2("ວ ິ ທ ີ Review Journal"),
      h3("Weekly Review"),
      ...bullets(["ດ ູ Win Rate ອ ານ ທ ິ ດ ນ ີ ້", "Trade ໃ ດ ດ ີ? ເ ປ ັ ນ ຫ ຍ ັ ງ?", "Trade ໃ ດ ຜ ິ ດ? ເ ປ ັ ນ ຫ ຍ ັ ງ?", "Emotion ສ ັ ງ ຜ ົ ນ ແ ນ ວ ໃ ດ?"]),
      h3("Monthly Review"),
      ...bullets(["P&L ລ ວ ມ ເ ດ ື ອ ນ", "Win Rate ລ ວ ມ ເ ດ ື ອ ນ", "Drawdown ສ ູ ງ ສ ຸ ດ", "Pattern ທ ີ ່ ກ ຳ ໄ ລ ແ ລ ະ ຂ ານ ທ ຶ ນ", "ປ ້ ອ ງ ກ ານ ຂ ່ ວ ມ ໃ ຫ ້ Plan ເ ດ ື ອ ນ ໜ ້ ານ"]),
      h2("ເ ຄ ື ່ ອ ງ ມ ື ສ ຳ ລ ັ ບ Journal"),
      ...bullets(["Google Sheets: ຟ ຣ ີ ໃ ຊ ້ ງ ່ ານ", "Notion: Flexible ສ ຳ ລ ັ ບ Notes", "Edgewonk, TraderSync: Journal App ສ ະ ເ ພ າ ະ", "Excel: ສ ຳ ລ ັ ບ ຄ ນ ທ ີ ່ ຊ ່ ຽ ວ ຊ ານ Excel"]),
      h2("Template ງ ່ ານ ໆ"),
      ...bullets([
        "| Date | Pair | Dir | Entry | SL | TP | Lot | R:R | Result | Emotion | Lesson |",
        "ຕ ື ມ ຫ ຼ ັ ງ ທ ຸ ກ Trade ທ ັ ນ ທ ີ ຢ ່ ານ ລ ໍ ຕ ້ ານ ຄ ື ນ",
        "Screenshot Chart ທ ຸ ກ Trade ຊ ່ ວ ຍ ໃ ຫ ້ ຮ ຽ ນ ໄ ດ ້ ດ ີ ຂ ຶ ້ ນ",
        "ໃ ຊ ້ ທ ຸ ກ ວ ັ ນ ຢ ່ ານ ຂ ້ ານ",
      ]),
    ],
  },
]

async function importArticles() {
  console.log("🚀 ເລ ີ ່ ມ ນ ຳ ເ ຂ ົ ້ ານ Batch 4 (10 ບ ົ ດ ຮ ຽ ນ)...")
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
