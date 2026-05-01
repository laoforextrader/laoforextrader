// seed-batch5-final.js
// ນຳເຂົ້າທຸກບົດທີ່ຍັງເຫຼືອ: Education ສຸດທ້າຍ + EA-Tools ທັງໝົດ
// ວິທີໃຊ້: node scripts/seed-batch5-final.js

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

  // ══════════════════════════════════════════
  // EDUCATION — ບົດທີ່ຍັງເຫຼືອ
  // ══════════════════════════════════════════

  // 1. backtesting-basics
  {
    _type: "article",
    title: "Backtesting: ທົດສອບ Strategy ກ່ອນໃຊ້ເງິນຈິງ",
    slug: { _type: "slug", current: "backtesting-basics" },
    category: "education",
    excerpt: "Backtesting ຄືການທົດສອບ Strategy ກ ັ ບ ຂ ້ ໍ ມ ູ ນ ລ ານ ຄ ານ ໃ ນ ອ ະ ດ ີ ດ ກ ່ ອ ນ ໃ ຊ ້ ເ ງ ິ ນ ຈ ິ ງ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ Backtest ຢ ່ ານ ຖ ູ ກ ຕ ້ ອ ງ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Backtesting ແມ່ນຫຍັງ?"),
      p("Backtesting ຄ ື ການ ທ ົ ດ ສ ອ ບ Trading Strategy ໂ ດ ຍ ໃ ຊ ້ ຂ ້ ໍ ມ ູ ນ ລ ານ ຄ ານ ໃ ນ ອ ະ ດ ີ ດ ເ ພ ື ່ ອ ດ ູ ວ ່ ານ Strategy ຈ ະ ໄ ດ ້ ຜ ົ ນ ແ ນ ວ ໃ ດ ຖ ້ ານ ໃ ຊ ້ ໃ ນ ອ ະ ດ ີ ດ"),
      p("ກ ່ ອ ນ ໃ ສ ່ ເ ງ ິ ນ ຈ ິ ງ ໃ ດ ໆ Backtest ກ ່ ອ ນ ສ ະ ເ ໝ ີ — ນ ີ ້ ຄ ື ກ ົ ດ ຂ ອ ງ Professional Trader"),
      h2("ວິທີ Backtest"),
      h3("Manual Backtesting"),
      ...numbers([
        "ເ ປ ີ ດ Chart ໃ ນ Timeframe ທ ີ ່ ໃ ຊ ້",
        "Scroll ກ ລ ັ ບ ໄ ປ 1-2 ປ ີ",
        "ເ ດ ີ ນ Candle ທ ີ ລ ະ ອ ັ ນ ໂ ດ ຍ ໃ ຊ ້ F12",
        "ໃ ສ ່ Trade ຕ ານ ມ Rules ຂ ອ ງ Strategy",
        "ບ ັ ນ ທ ຶ ກ ທ ຸ ກ Trade ໃ ນ Spreadsheet",
      ]),
      h3("Automated Backtesting (MT4/MT5 Strategy Tester)"),
      ...numbers([
        "ເ ປ ີ ດ MT4 → View → Strategy Tester",
        "ເ ລ ື ອ ກ EA ແ ລ ະ Pair",
        "ກ ຳ ນ ົ ດ ຊ ່ ວ ງ ເ ວ ລ ານ (1-5 ປ ີ)",
        "ກ ດ Start ແ ລ ະ ລ ໍ ຜ ົ ນ",
        "ອ ່ ານ Report: Profit Factor, Drawdown, Win Rate",
      ]),
      h2("ຕ ົ ວ ຊ ີ ້ ວ ັ ດ ທ ີ ່ ສ ຳ ຄ ັ ນ"),
      ...bullets([
        "Profit Factor > 1.5: ດ ີ (ກ ຳ ໄ ລ 1.5x ຕ ່ ໍ ທ ຸ ກ $1 ຂ ານ ທ ຶ ນ)",
        "Max Drawdown < 20%: ຄ ວ ານ ມ ສ ່ ຽ ງ ຍ ອ ມ ຮ ັ ບ ໄ ດ ້",
        "Win Rate > 45% ກ ັ ບ R:R 1:2+: Strategy ໃ ຊ ້ ໄ ດ ້",
        "Trades ພ ໍ ຊ ລ ່ ຳ: ຢ ່ ານ ໜ ້ ອ ຍ ກ ວ່ ານ 100 Trade",
        "Consecutive Losses: ສ ູ ງ ສ ຸ ດ ຕ ິ ດ ຕ ່ ໍ ກ ັ ນ ຫ ຼ ານ ແ ຄ?",
      ]),
      h2("Over-fitting ລ ະ ວ ັ ງ!"),
      p("Over-fitting ຄ ື ການ Optimize Strategy ໃ ຫ ້ ເ ໝ ານ ະ ກ ັ ບ ຂ ້ ໍ ມ ູ ນ ໃ ນ ອ ະ ດ ີ ດ ຈ ົ ນ ເ ກ ີ ນ ໄ ປ ທ ຳ ໃ ຫ ້ In-Sample ດ ີ ແ ຕ ່ Out-of-Sample ຜ ົ ນ ຕ ່ ຳ"),
      ...bullets([
        "ໃ ຊ ້ Walk-Forward Testing: Test ໃ ນ ຂ ້ ໍ ມ ູ ນ ທ ີ ່ ບ ໍ ່ ໄ ດ ້ ໃ ຊ ້ Optimize",
        "ຂ ້ ໍ ມ ູ ນ ໃ ນ ຊ ່ ວ ງ ຕ ່ ານ ງ ໆ: Bull, Bear, Sideways Market",
        "Parameter ໜ ້ ອ ຍ: Parameter ຫ ຼ ານ = Over-fit ງ ່ ານ",
        "Out-of-Sample: Reserve 20-30% ຂ ອ ງ ຂ ້ ໍ ມ ູ ນ ສ ຳ ລ ັ ບ Test ສ ຸ ດ ທ ້ ານ",
      ]),
      h2("ຂ ້ ໍ ຈ ຳ ກ ັ ດ Backtesting"),
      ...bullets([
        "⚠️ Past ≠ Future: ຜ ົ ນ ໃ ນ ອ ະ ດ ີ ດ ບ ໍ ່ ຮ ັ ບ ປ ະ ກ ັ ນ ອ ານ ຄ ົ ດ",
        "⚠️ Slippage ແ ລ ະ Spread: Manual Backtest ມ ັ ກ ບ ໍ ່ ຄ ຳ ນ ວ ນ",
        "⚠️ Data Quality: ຕ ້ ອ ງ ໃ ຊ ້ Tick Data ທ ີ ່ ດ ີ",
        "⚠️ Emotional Factor: Backtest ບ ໍ ່ ສ ານ ມ ານ ດ Simulate Emotion ໄ ດ ້",
      ]),
    ],
  },

  // 2. bid-ask-spread-explained
  {
    _type: "article",
    title: "Bid, Ask ແລະ Spread: ຄ ່ ານ ໃ ຊ ້ ຈ ່ ານ ຈ ິ ງ ໃ ນ Forex",
    slug: { _type: "slug", current: "bid-ask-spread-explained" },
    category: "education",
    excerpt: "Spread ຄ ື ຄ ່ ານ ໃ ຊ ້ ຈ ່ ານ ທ ຳ ອ ິ ດ ທ ີ ່ ທ ່ ານ ເ ສ ຍ ທ ຸ ກ Trade ຮ ຽ ນ ຮ ູ ້ Bid Ask Spread ແ ລ ະ ວ ິ ທ ີ ຫ ຼ ຸ ດ ຄ ່ ານ ໃ ຊ ້ ຈ ່ ານ",
    readTime: 8,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Bid ແລະ Ask ແມ່ນຫຍັງ?"),
      p("ໃ ນ MT4/MT5 ທ ່ ານ ຈ ະ ເ ຫ ັ ນ ລ ານ ຄ ານ 2 ຕ ົ ວ ສ ະ ເ ໝ ີ:"),
      ...bullets([
        "Bid: ລ ານ ຄ ານ ທ ີ ່ ທ ່ ານ Sell ໄ ດ ້ (ລ ານ ຄ ານ ຕ ່ ຳ ກ ວ່ ານ)",
        "Ask: ລ ານ ຄ ານ ທ ີ ່ ທ ່ ານ Buy ໄ ດ ້ (ລ ານ ຄ ານ ສ ູ ງ ກ ວ່ ານ)",
        "Spread = Ask - Bid = ຄ ່ ານ ໃ ຊ ້ ຈ ່ ານ ຂ ອ ງ Broker",
      ]),
      h2("Spread ສ ົ ງ ຜ ົ ນ ຕ ່ ໍ ກ ຳ ໄ ລ ຢ ່ ານ ໃ ດ?"),
      p("ທ ຸ ກ ຄ ັ ້ ງ ທ ີ ່ ທ ່ ານ Open Trade ທ ່ ານ ເ ລ ີ ່ ມ ດ ້ ວ ຍ ຕ ິ ດ ລ ົ ບ ເ ທ ່ ານ ກ ັ ບ Spread ທ ັ ນ ທ ີ:"),
      ...bullets([
        "EUR/USD Spread 1.5 Pips, 0.1 Lot → ເ ສ ຍ $0.15 ທ ັ ນ ທ ີ",
        "XAUUSD Spread 3 Points, 0.1 Lot → ເ ສ ຍ $3 ທ ັ ນ ທ ີ",
        "Scalper Trade 50 ຄ ັ ້ ງ/ວ ັ ນ: Spread ສ ະ ສ ົ ມ ຫ ຼ ານ",
        "Spread ຄ ື ລ ານ ຍ ໄ ດ ້ ຂ ອ ງ Broker ໂ ດ ຍ ກ ົ ງ",
      ]),
      h2("ປ ະ ເ ພ ດ Spread"),
      h3("Fixed Spread"),
      ...bullets(["Spread ຄ ົ ງ ທ ີ ່ ສ ະ ເ ໝ ີ ໃ ນ ທ ຸ ກ ສ ະ ຖ ານ ະ ການ", "ດ ີ ສ ຳ ລ ັ ບ ຊ ່ ວ ງ ຂ ່ ານ ໃ ຫ ຍ ່ ທ ີ ່ Spread ມ ັ ກ ຂ ະ ຫ ຍ ານ ຍ", "ໃ ຊ ້ ໃ ນ Market Maker Broker"]),
      h3("Variable Spread"),
      ...bullets(["Spread ຕ ່ ຳ ໃ ນ ຊ ່ ວ ງ Liquid (London/NY)", "Spread ສ ູ ງ ໃ ນ ຊ ່ ວ ງ ງ ຽ ບ ຫ ຼ ື ຂ ່ ານ ໃ ຫ ຍ ່", "ECN/STP Broker ໃ ຊ ້ Variable Spread"]),
      h2("Spread ທ ີ ່ ດ ີ ສ ຳ ລ ັ ບ ແ ຕ ່ ລ ະ Pair"),
      ...bullets([
        "EUR/USD: 0.0-1.5 Pips = ດ ີ",
        "GBP/USD: 0.5-2.5 Pips = ດ ີ",
        "USD/JPY: 0.3-1.5 Pips = ດ ີ",
        "XAUUSD: 0.2-3.0 USD = ດ ີ",
        "Exotic Pairs: 5-50+ Pips = ສ ູ ງ ຫ ຼ ານ",
      ]),
      h2("ວ ິ ທ ີ ຫ ຼ ຸ ດ ຄ ່ ານ Spread"),
      ...bullets([
        "ໃ ຊ ້ ECN Broker: Spread ຕ ່ ຳ ກ ວ່ ານ Market Maker",
        "Trade ໃ ນ ຊ ່ ວ ງ Liquid: London-NY Overlap",
        "ຫ ຼ ີ ກ ລ ່ ຽ ງ ຊ ່ ວ ງ ງ ຽ ບ: Sydney, ຄ ື ນ ດ ຶ ກ",
        "Trade Pair ທ ີ ່ Liquid: EUR/USD ດ ີ ທ ີ ່ ສ ຸ ດ",
        "ຢ ່ ານ Scalp ໃ ນ Pair Spread ກ ວ ້ ານ",
      ]),
    ],
  },

  // 3. correlation-forex
  {
    _type: "article",
    title: "Correlation ໃນ Forex: ເຂົ້າໃຈ ຄ ວ ານ ມ ສ ໍ າ ພ ັ ນ ລ ະ ຫ ວ ່ ານ Pair",
    slug: { _type: "slug", current: "correlation-forex" },
    category: "education",
    excerpt: "Forex Correlation ຊ ່ ວ ຍ ຫ ຼ ຸ ດ ຄ ວ ານ ມ ສ ່ ຽ ງ ແ ລ ະ ຊ ອ ກ ໂ ອ ກ ານ ດ Trade ຮ ຽ ນ ຮ ູ ້ Positive Negative Correlation ແ ລ ະ ວ ິ ທ ີ ໃ ຊ ້",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Correlation ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Correlation ໃ ນ Forex ຄ ື ຄ ວ ານ ມ ສ ໍ າ ພ ັ ນ ລ ະ ຫ ວ ່ ານ ການ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຂ ອ ງ Currency Pair ສ ອ ງ Pair ວ ັ ດ ດ ້ ວ ຍ Correlation Coefficient (+1 ຫ ານ -1)"),
      h2("ປ ະ ເ ພ ດ Correlation"),
      h3("Positive Correlation (+0.7 ຫ ານ +1.0)"),
      p("Pair ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ໃ ນ ທ ິ ດ ດ ຽ ວ ກ ັ ນ:"),
      ...bullets([
        "EUR/USD ແ ລ ະ GBP/USD: Correlation ສ ູ ງ ~0.85",
        "ທ ັ ງ ສ ອ ງ ມ ັ ກ ຂ ຶ ້ ນ/ລ ົ ງ ພ ້ ອ ມ ກ ັ ນ",
        "Buy ທ ັ ງ ສ ອ ງ = Double Risk",
      ]),
      h3("Negative Correlation (-0.7 ຫ ານ -1.0)"),
      p("Pair ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຕ ່ ານ ກ ັ ນ:"),
      ...bullets([
        "EUR/USD ແ ລ ະ USD/CHF: ~-0.90",
        "EUR/USD ຂ ຶ ້ ນ → USD/CHF ລ ົ ງ",
        "Buy EUR/USD + Buy USD/CHF = ຊ ົ ດ ກ ັ ນ ເ ກ ື ອ ບ ໝ ົ ດ",
      ]),
      h2("Correlation ທ ີ ່ ສ ຳ ຄ ັ ນ"),
      ...bullets([
        "EUR/USD ກ ັ ບ GBP/USD: +0.85 (ທ ານ ງ ດ ຽ ວ)",
        "EUR/USD ກ ັ ບ USD/CHF: -0.90 (ຕ ່ ານ ທ ານ ງ)",
        "AUD/USD ກ ັ ບ Gold (XAUUSD): +0.80 (ທ ານ ງ ດ ຽ ວ)",
        "USD/JPY ກ ັ ບ Stock Market: +0.70 (Risk On/Off)",
        "EUR/USD ກ ັ ບ DXY (USD Index): -0.95 (ຕ ່ ານ ທ ານ ງ)",
      ]),
      h2("ວ ິ ທ ີ ໃ ຊ ້ Correlation"),
      h3("1. ຫ ຼ ີ ກ ລ ່ ຽ ງ Over-exposure"),
      ...bullets(["ຢ ່ ານ Buy EUR/USD + Buy GBP/USD + Buy AUD/USD ພ ້ ອ ມ ກ ັ ນ", "ທ ຸ ກ Pair Correlated ກ ັ ບ USD ທ ານ ງ ດ ຽ ວ = Trade ດ ຽ ວ ໃ ຫ ຍ ່", "ກ ະ ຈ ານ ຍ Risk: ໃ ຊ ້ Pair ທ ີ ່ Correlation ຕ ່ ຳ"]),
      h3("2. Confirm ທ ິ ດ Trend"),
      ...bullets(["EUR/USD ຂ ຶ ້ ນ + GBP/USD ຂ ຶ ້ ນ = USD ອ ່ ອ ນ ຢ ັ ້ ງ ຢ ື ນ", "EUR/USD ຂ ຶ ້ ນ ແ ຕ ່ GBP/USD ລ ົ ງ = ບ ໍ ່ ຊ ັ ດ ເ ຈ ນ ລ ະ ວ ັ ງ", "ໃ ຊ ້ DXY ຢ ັ ້ ງ ຢ ື ນ ທ ິ ດ USD"]),
      h3("3. Hedge"),
      ...bullets(["Buy EUR/USD + Buy USD/CHF = ຕ ້ ານ ກ ັ ນ ລ ດ ຄ ວ ານ ມ ສ ່ ຽ ງ", "ໃ ຊ ້ ໃ ນ ຊ ່ ວ ງ ຕ ະ ຫ ຼ ານ ບ ໍ ່ ແ ນ ່ ນ ອ ນ", "ຄ ວ ນ ສ ຶ ກ ສ ານ ເ ພ ີ ່ ມ ກ ່ ອ ນ ໃ ຊ ້"]),
    ],
  },

  // 4. divergence-trading
  {
    _type: "article",
    title: "Divergence Trading: ຊ ອ ກ Reversal ກ ່ ອ ນ ຕ ະ ຫ ຼ ານ",
    slug: { _type: "slug", current: "divergence-trading" },
    category: "education",
    excerpt: "Divergence ຄ ື ໜ ຶ ່ ງ ໃ ນ Setup ທ ີ ່ ດ ີ ທ ີ ່ ສ ຸ ດ ສ ຳ ລ ັ ບ Reversal Trading ຮ ຽ ນ ຮ ູ ້ Regular ແ ລ ະ Hidden Divergence",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Divergence ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Divergence ເ ກ ີ ດ ຂ ຶ ້ ນ ເ ມ ື ່ ອ ລ ານ ຄ ານ ແ ລ ະ Indicator ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ຕ ່ ານ ທ ານ ງ ກ ັ ນ ສ ະ ແ ດ ງ ວ ່ ານ Momentum ກ ຳ ລ ັ ງ ອ ່ ອ ນ ລ ົ ງ ກ ່ ອ ນ ທ ີ ່ ລ ານ ຄ ານ ຈ ະ ກ ລ ັ ບ"),
      h2("Regular Divergence (Reversal Signal)"),
      h3("Bullish Regular Divergence"),
      p("ລ ານ ຄ ານ: Lower Low | Indicator (RSI/MACD): Higher Low → ສ ັ ນ ຍ ານ Buy"),
      ...bullets([
        "ຜ ູ ້ ຂ ານ ດ ຶ ງ ລ ານ ຄ ານ ໄ ວ ຂ ຶ ້ ນ ຕ ່ ໍ ໆ ແ ຕ ່ Momentum ຫ ຼ ຸ ດ",
        "ສ ັ ນ ຍ ານ ວ ່ ານ ຜ ູ ້ ຊ ື ້ ກ ຳ ລ ັ ງ ເ ພ ີ ່ ມ ຂ ຶ ້ ນ",
        "ໃ ຊ ້ ໃ ນ ຊ ່ ວ ງ Oversold ທ ີ ່ Support",
      ]),
      h3("Bearish Regular Divergence"),
      p("ລ ານ ຄ ານ: Higher High | Indicator: Lower High → ສ ັ ນ ຍ ານ Sell"),
      ...bullets([
        "ລ ານ ຄ ານ ຂ ຶ ້ ນ ໃ ໝ ່ ແ ຕ ່ Momentum ຫ ຼ ຸ ດ",
        "ສ ັ ນ ຍ ານ ວ ່ ານ Uptrend ກ ຳ ລ ັ ງ ໝ ົ ດ ແ ຮ ງ",
        "ໃ ຊ ້ ຢ ູ່ Resistance ທ ີ ່ Overbought",
      ]),
      h2("Hidden Divergence (Trend Continuation)"),
      h3("Bullish Hidden Divergence"),
      p("ລ ານ ຄ ານ: Higher Low | Indicator: Lower Low → Uptrend ຍ ັ ງ ດ ຳ ເ ນ ີ ນ"),
      h3("Bearish Hidden Divergence"),
      p("ລ ານ ຄ ານ: Lower High | Indicator: Higher High → Downtrend ຍ ັ ງ ດ ຳ ເ ນ ີ ນ"),
      h2("Indicator ທ ີ ່ ໃ ຊ ້"),
      ...bullets([
        "RSI (14): ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ ໃ ຊ ້ ງ ່ ານ",
        "MACD Histogram: ດ ູ ການ ປ ່ ຽ ນ Momentum",
        "Stochastic: ດ ີ ໃ ນ Ranging Market",
        "OBV (On-Balance Volume): ໃ ຊ ້ Volume Confirm",
      ]),
      h2("ວ ິ ທ ີ Trade Divergence"),
      ...numbers([
        "ຫ ານ Divergence ໃ ນ H4 ຫ ຼ ື Daily",
        "Confirm ດ ້ ວ ຍ Candle Pattern ທ ີ ່ S/R",
        "Entry ຫ ຼ ັ ງ Confirm Candle",
        "Stop: ຢ ູ ່ ຕ ່ ຳ ກ ວ່ ານ Low (Bullish) / ສ ູ ງ ກ ວ່ ານ High (Bearish)",
        "Target: ຈ ຸ ດ ເ ລ ີ ່ ມ ຕ ົ ້ ນ ຂ ອ ງ Divergence",
      ]),
    ],
  },

  // 5. drawdown-recovery
  {
    _type: "article",
    title: "Drawdown ແ ລ ະ Recovery: ຟ ື ້ ນ ຟ ູ Account ຫ ຼ ັ ງ ຂ ານ ທ ຶ ນ",
    slug: { _type: "slug", current: "drawdown-recovery" },
    category: "education",
    excerpt: "Drawdown ຄ ື ສ ິ ່ ງ ທ ີ ່ ທ ຸ ກ Trader ຕ ້ ອ ງ ປ ະ ສ ົ ບ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ຄ ຳ ນ ວ ນ Drawdown ແ ລ ະ Plan ການ Recovery ທ ີ ່ ຖ ູ ກ ຕ ້ ອ ງ",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Drawdown ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Drawdown ຄ ື ການ ຫ ຼ ຸ ດ ລ ົ ງ ຂ ອ ງ Account Balance ຈ າ ກ ຈ ຸ ດ ສ ູ ງ ສ ຸ ດ Peak ໄ ປ ສ ູ ່ ຈ ຸ ດ ຕ ່ ຳ ສ ຸ ດ Trough ກ ່ ອ ນ ທ ີ ່ ຈ ະ ກ ລ ັ ບ ຂ ຶ ້ ນ ໃ ໝ ່"),
      h2("ຄ ຳ ນ ວ ນ Drawdown"),
      ...bullets([
        "Drawdown% = (Peak - Trough) / Peak × 100",
        "Peak $10,000 → Trough $8,500 → DD = 15%",
        "Max Drawdown: DD ສ ູ ງ ສ ຸ ດ ທ ີ ່ ເ ຄ ີ ຍ ເ ກ ີ ດ",
        "Current Drawdown: DD ທ ີ ່ ກ ຳ ລ ັ ງ ເ ກ ີ ດ ຢ ູ ່ ໃ ນ ຕ ອ ນ ນ ີ ້",
      ]),
      h2("ລ ະ ດ ັ ບ Drawdown ແ ລ ະ ການ ຮ ັ ບ ມ ື"),
      ...bullets([
        "0-10%: ປ ົ ກ ກ ະ ຕ ິ ດ ຳ ເ ນ ີ ນ ຕ ່ ໍ ຕ ານ ມ Plan",
        "10-20%: ກ ວ ດ Strategy ຫ ຼ ຸ ດ Lot Size 25%",
        "20-30%: ຢ ຸ ດ ຊ ົ ່ ວ ຄ ານ ວ ກ ວ ດ ສ ອ ບ ທ ຸ ກ ຢ ່ ານ",
        "30%+: ຢ ຸ ດ ທ ັ ນ ທ ີ ກ ວ ດ ສ ອ ບ ກ ່ ອ ນ ກ ລ ັ ບ ມ ານ",
      ]),
      h2("ຄ ວ ານ ມ ຈ ິ ງ ຂ ອ ງ Drawdown"),
      ...bullets([
        "DD 10% → ຕ ້ ອ ງ ກ ຳ ໄ ລ 11.1% ຈ ຶ ່ ງ ຄ ື ນ",
        "DD 20% → ຕ ້ ອ ງ ກ ຳ ໄ ລ 25% ຈ ຶ ່ ງ ຄ ື ນ",
        "DD 50% → ຕ ້ ອ ງ ກ ຳ ໄ ລ 100% ຈ ຶ ່ ງ ຄ ື ນ!",
        "DD 80% → ຕ ້ ອ ງ ກ ຳ ໄ ລ 400%!!",
      ]),
      h2("Recovery Plan"),
      ...numbers([
        "ຢ ຸ ດ Trade: ໃ ຫ ້ ຈ ິ ດ ໃ ຈ ສ ົ ງ ບ ລ ົ ງ ກ ່ ອ ນ",
        "ວ ິ ເ ຄ ານ ະ ສ ານ ເ ຫ ດ: ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ ທ ີ ່ ໃ ດ?",
        "ຫ ຼ ຸ ດ Lot Size: ໃ ຊ ້ 50% ຂ ອ ງ Lot ເ ດ ີ ມ",
        "Trade Demo: ທ ົ ດ ສ ອ ບ ໃ ໝ ່ ກ ່ ອ ນ Real",
        "ຄ ່ ອ ຍ ເ ພ ີ ່ ມ Lot: ເ ມ ື ່ ອ Consistent ຄ ື ນ",
      ]),
    ],
  },

  // 6. money-management-plan
  {
    _type: "article",
    title: "Money Management: ຈ ັ ດ ການ ທ ຶ ນ ໃ ຫ ້ ຢ ູ ່ ໃ ນ ຕ ະ ຫ ຼ ານ ຍ ານ",
    slug: { _type: "slug", current: "money-management-plan" },
    category: "education",
    excerpt: "Money Management ທ ີ ່ ດ ີ ຄ ື ສ ິ ່ ງ ທ ີ ່ ແ ຍ ກ Trader ທ ີ ່ ຢ ູ ່ ລ ອ ດ ກ ັ ບ ຄ ົ ນ ທ ີ ່ Blow Account ຮ ຽ ນ ຮ ູ ້ ຫ ຼ ັ ກ ການ ຈ ັ ດ ການ ທ ຶ ນ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Money Management ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Money Management (MM) ຄ ື ລ ະ ບ ົ ບ ການ ຈ ັ ດ ການ ທ ຶ ນ ໃ ນ Account ທ ຸ ກ ດ ້ ານ ທ ັ ງ Lot Size, Risk ຕ ່ ໍ Trade, Max Loss/Day ແ ລ ະ Position Sizing"),
      h2("ຫ ຼ ັ ກ ການ MM ທ ີ ່ ສ ຳ ຄ ັ ນ"),
      h3("1% Rule"),
      ...bullets([
        "Risk ສ ູ ງ ສ ຸ ດ 1% ຂ ອ ງ Account ຕ ່ ໍ 1 Trade",
        "Account $1,000 → Risk ສ ູ ງ ສ ຸ ດ $10",
        "ແ ມ ້ Streak ຂ ານ ທ ຶ ນ 20 Trade ຕ ິ ດ → ຍ ັ ງ ເ ຫ ຼ ື ອ 82%",
        "ລ ະ ວ ັ ງ: 2% Rule ອ ານ ດ ສ ຳ ລ ັ ບ ຜ ູ ້ ໄ ດ ້ ຜ ົ ນ ດ ີ ສ ະ ໝ ໍ ່ ສ ານ",
      ]),
      h3("Daily Loss Limit"),
      ...bullets([
        "ຕ ັ ້ ງ Limit ຂ ານ ທ ຶ ນ ຕ ່ ໍ ວ ັ ນ: 2-3%",
        "ຮ ອ ດ Limit → ຢ ຸ ດ Trade ທ ັ ນ ທ ີ ວ ັ ນ ນ ັ ້ ນ",
        "ຢ ່ ານ ດ ຶ ງ ທ ຶ ນ ຄ ື ນ Revenge Trade",
        "ກ ລ ັ ບ ມ ານ Trade ວ ັ ນ ຕ ່ ໍ ໄ ປ ດ ້ ວ ຍ ຈ ິ ດ ໃ ຈ ສ ົ ງ ບ",
      ]),
      h3("Maximum Concurrent Trades"),
      ...bullets([
        "Beginner: ສ ູ ງ ສ ຸ ດ 2-3 Trade ພ ້ ອ ມ ກ ັ ນ",
        "Intermediate: 3-5 Trade",
        "ໃ ຫ ້ ແ ຕ ່ ລ ະ Trade ມ ີ ຄ ວ ານ ມ ສ ່ ຽ ງ ໜ ້ ອ ຍ ລ ົ ງ ຖ ້ ານ Trade ຫ ຼ ານ",
        "ຄ ຳ ນ ຶ ງ Correlation: ຢ ່ ານ ຖ ື Pair ທ ີ ່ Correlated ຫ ຼ ານ ເ ກ ີ ນ",
      ]),
      h2("Kelly Criterion"),
      p("ສ ູ ດ Kelly ຄ ຳ ນ ວ ນ Size ທ ີ ່ Optimal:"),
      p("f* = W - (1-W)/R, W = Win Rate, R = Reward/Risk Ratio"),
      ...bullets([
        "W = 0.50, R = 2 → f* = 0.50 - 0.50/2 = 25%",
        "ໃ ນ ທ ານ ງ ປ ະ ຕ ິ ບ ັ ດ: ໃ ຊ ້ 1/4 Kelly = 6.25%",
        "Kelly ເ ຕ ັ ມ ຢ ່ ານ ເ ດ: Volatility ສ ູ ງ ເ ກ ີ ນ",
      ]),
      h2("Pyramiding (ເ ພ ີ ່ ມ Position ໃ ນ Trend)"),
      ...bullets([
        "ເ ພ ີ ່ ມ Lot ເ ມ ື ່ ອ Trade ກ ຳ ໄ ລ ແ ລ ວ Trend ຊ ັ ດ ເ ຈ ນ",
        "Position ໃ ໝ ່ ຕ ້ ອ ງ ນ ້ ອ ຍ ກ ວ່ ານ ຂ ອ ງ ເ ດ ີ ມ",
        "SL ເ ລ ື ່ ອ ນ ຂ ຶ ້ ນ ທ ຸ ກ ຄ ັ ້ ງ",
        "ທ ຳ ໃ ຫ ້ R:R ລ ວ ມ ດ ີ ຂ ຶ ້ ນ",
      ]),
    ],
  },

  // 7. prop-firm-trading
  {
    _type: "article",
    title: "Prop Firm Trading: ເ ທ ຣ ດ ດ ້ ວ ຍ ທ ຶ ນ ຂ ອ ງ ບ ໍ ລ ິ ສ ັ ດ",
    slug: { _type: "slug", current: "prop-firm-trading" },
    category: "education",
    excerpt: "Prop Firm ຊ ່ ວ ຍ ໃ ຫ ້ Trader ທ ີ ່ ມ ີ ທ ັ ກ ສ ານ ໄ ດ ້ ໃ ຊ ້ ທ ຶ ນ ໃ ຫ ຍ ່ ໂ ດ ຍ ບ ໍ ່ ຕ ້ ອ ງ ໃ ສ ່ ທ ຶ ນ ຂ ອ ງ ຕ ົ ວ ເ ອ ງ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ຜ ່ ານ Challenge",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Prop Firm ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Proprietary Trading Firm (Prop Firm) ຄ ື ບ ໍ ລ ິ ສ ັ ດ ທ ີ ່ ໃ ຫ ້ Trader ທ ີ ່ ຜ ່ ານ Challenge ໃ ຊ ້ ທ ຶ ນ ຂ ອ ງ ບ ໍ ລ ິ ສ ັ ດ Trade ໂ ດ ຍ ແ ບ ່ ງ ກ ຳ ໄ ລ ກ ັ ນ 70-90%"),
      h2("ວ ິ ທ ີ ເ ຮ ັ ດ ວ ຽ ກ"),
      ...numbers([
        "ສ ະ ໝ ັ ກ Challenge: ຈ ່ ານ ຄ ່ ານ ທ ົ ດ ສ ອ ບ $100-1,000",
        "ຜ ່ ານ Challenge: ກ ຳ ໄ ລ Target ໃ ນ ເ ວ ລ ານ ທ ີ ່ ກ ຳ ນ ົ ດ",
        "ໄ ດ ້ Funded Account: ຮ ັ ບ ທ ຶ ນ $10K-$200K+",
        "Trade ແ ລ ະ ແ ບ ່ ງ ກ ຳ ໄ ລ: 70-90% ຂ ອ ງ Trader",
      ]),
      h2("Prop Firm ທ ີ ່ ນ ິ ຍ ົ ມ"),
      ...bullets([
        "FTMO: ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ Target 10%, DD 10%",
        "The5ers: ງ ່ ານ ກ ວ່ ານ ທ ານ ງ Scaling",
        "MyForexFunds: ຜ ່ ານ ໄ ດ ້ ໄ ວ ກ ວ່ ານ",
        "Topstep: ສ ຳ ລ ັ ບ Futures ດ ້ ວ ຍ",
        "E8 Funding, Instant Funding ໆ: ທ າ ງ ເ ລ ື ອ ກ",
      ]),
      h2("ກ ົ ດ ທ ົ ່ ວ ໄ ປ ຂ ອ ງ Challenge"),
      ...bullets([
        "Profit Target: 8-10% ໃ ນ 30-90 ວ ັ ນ",
        "Max Daily Drawdown: 4-5%",
        "Max Total Drawdown: 8-10%",
        "Min Trading Days: 5-10 ວ ັ ນ",
        "ຢ ່ ານ Trade ໃ ນ ຊ ່ ວ ງ ຂ ່ ານ ໃ ຫ ຍ ່: ກ ົ ດ ຂ ອ ງ ຫ ຼ ານ Firm",
      ]),
      h2("Strategy ສ ຳ ລ ັ ບ Pass Challenge"),
      ...bullets([
        "Risk ຕ ່ ຳ: 0.5-1% ຕ ່ ໍ Trade ຫ ຼ າ ຍ ກ ວ່ ານ Real",
        "Consistent: ກ ຳ ໄ ລ ນ ້ ອ ຍ ໆ ທ ຸ ກ ວ ັ ນ",
        "ຢ ່ ານ Rush: ກ ຳ ໄ ລ 0.5-1% ຕ ່ ໍ ວ ັ ນ ພ ໍ",
        "ຫ ຼ ີ ກ ລ ່ ຽ ງ ຂ ່ ານ ໃ ຫ ຍ ່: NFP FOMC ລ ະ ວ ັ ງ",
        "Drawdown ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ: ຜ ່ ານ DD ຄ ື ຈ ົ ບ",
      ]),
      h2("ຂ ້ ໍ ຄ ວ ນ ລ ະ ວ ັ ງ"),
      ...bullets([
        "⚠️ Challenge Fee ບ ໍ ່ ໄ ດ ້ ຄ ື ນ ຖ ້ ານ ລ ົ ້ ມ",
        "⚠️ Scam Firms: ກ ວ ດ ຊ ື ່ ສ ຽ ງ ກ ່ ອ ນ ສ ະ ໝ ັ ກ",
        "⚠️ Slippage ສ ູ ງ: Prop ຫ ຼ ານ ໃ ຊ ້ Simulated Account",
        "⚠️ ຕ ້ ອ ງ ມ ີ Track Record ກ ່ ອ ນ: ຢ ່ ານ ທ ຳ Challenge ດ ້ ວ ຍ ທ ່ ານ Beginner",
      ]),
    ],
  },

  // 8. swap-rollover
  {
    _type: "article",
    title: "Swap/Rollover: ຄ ່ ານ ຂ ້ ານ ຄ ື ນ ທ ີ ່ Trader ຫ ຼ ານ ຄ ົ ນ ລ ືມ",
    slug: { _type: "slug", current: "swap-rollover" },
    category: "education",
    excerpt: "Swap ຫ ຼ ື Rollover ຄ ື ຄ ່ ານ ທ ຳ ນ ຽ ມ ທ ີ ່ ເ ກ ີ ດ ຂ ຶ ້ ນ ເ ມ ື ່ ອ ຖ ື Position ຂ ້ ານ ຄ ື ນ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ຄ ຳ ນ ວ ນ ແ ລ ະ ໃ ຊ ້ Swap ໃ ຫ ້ ເ ປ ັ ນ ປ ະ ໂ ຍ ດ",
    readTime: 9,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Swap ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Swap (ຫ ຼ ື Rollover) ຄ ື ຄ ່ ານ ທ ຳ ນ ຽ ມ ທ ີ ່ Broker ຄ ິ ດ (ຫ ຼ ື ຈ ່ ານ ໃ ຫ ້) ທ ຸ ກ ຄ ື ນ ເ ມ ື ່ ອ ທ ່ ານ ຖ ື Position ຂ ້ ານ ຄ ື ນ 22:00 GMT"),
      p("ທ ີ ່ ມ ານ: ໃ ນ Forex ທ ່ ານ ກ ູ ້ ສ ະ ກ ຸ ນ ໜ ຶ ່ ງ ແ ລ ະ ລ ົ ງ ທ ຶ ນ ໃ ນ ອ ີ ກ ສ ະ ກ ຸ ນ ໜ ຶ ່ ງ Swap ຄ ື ສ ່ ວ ນ ຕ ່ ານ ດ ອ ກ ເ ບ ້ ຍ"),
      h2("Positive vs Negative Swap"),
      ...bullets([
        "Positive Swap: ທ ່ ານ ຮ ັ ບ ເ ງ ິ ນ ທ ຸ ກ ຄ ື ນ (Carry Trade)",
        "Negative Swap: ທ ່ ານ ຈ ່ ານ ເ ງ ິ ນ ທ ຸ ກ ຄ ື ນ",
        "Wednesday Swap: ຄ ິ ດ 3 ເ ທ ່ ານ ທ ີ ່ ຄ ື ນ ວ ັ ນ ພ ຸ ດ (Weekend Settlement)",
        "Islamic Account: Swap-Free ສ ຳ ລ ັ ບ ຜ ູ ້ ທ ີ ່ ຮ ັ ກ ສ ານ ສ າ ສ ານ ອ ິ ດ ສ ລ ານ",
      ]),
      h2("ຕ ົ ວ ຢ ່ ານ Swap"),
      ...bullets([
        "Buy AUD/JPY 1 Lot: Swap +$5/ຄ ື ນ (Positive)",
        "Sell AUD/JPY 1 Lot: Swap -$7/ຄ ື ນ (Negative)",
        "ຖ ື 30 ວ ັ ນ: +$150 ຫ ຼ ື -$210 ຈ າ ກ Swap ດ ຽ ວ",
        "Scalper ທ ີ່ ປ ິ ດ ທ ຸ ກ ວ ັ ນ: Swap ບ ໍ ່ ສ ໍ າ ຄ ັ ນ",
      ]),
      h2("ໃ ຊ ້ Swap ໃ ຫ ້ ເ ປ ັ ນ ປ ະ ໂ ຍ ດ"),
      h3("Carry Trade Strategy"),
      ...bullets([
        "ຊ ອ ກ Pair ທ ີ ່ Positive Swap ໃ ຫ ຍ ່ ທ ີ ່ ສ ຸ ດ",
        "AUD/JPY, NZD/JPY ຖ ື ໄ ລ ຍ ານ ຍ ານ",
        "ກ ຳ ໄ ລ ຈ າ ກ ທ ັ ງ ລ ານ ຄ ານ ແ ລ ະ Swap",
        "ສ ່ ຽ ງ: Currency Risk ສ ່ ຽ ງ ເ ຄ ື ່ ອ ນ ໄ ຫ ວ ລ ານ ຄ ານ",
      ]),
      h2("ກ ວ ດ Swap ຂ ອ ງ Broker"),
      ...bullets([
        "MT4: View → Market Watch → ຄ ລ ິ ກ ຂ ວ ານ ທ ີ ່ Pair → Properties",
        "ເ ປ ຣ ຽ ບ ທ ຽ ບ Swap ລ ະ ຫ ວ ່ ານ Broker",
        "Swap ບ ໍ ່ ຄ ົ ງ ທ ີ ່: ປ ່ ຽ ນ ຕ ານ ມ ດ ອ ກ ເ ບ ້ ຍ Central Bank",
      ]),
    ],
  },

  // 9. timeframe-selection
  {
    _type: "article",
    title: "ເ ລ ື ອ ກ Timeframe ທ ີ ່ ເ ໝ ານ ະ ກ ັ ບ Style ຂ ອ ງ ທ ່ ານ",
    slug: { _type: "slug", current: "timeframe-selection" },
    category: "education",
    excerpt: "Timeframe ທ ີ ່ ຜ ິ ດ ຄ ື ໜ ຶ ່ ງ ໃ ນ ສ ານ ເ ຫ ດ ທ ີ ່ Trader ຫ ຼ ານ ຄ ົ ນ ຂ ານ ທ ຶ ນ ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ເ ລ ື ອ ກ Timeframe ໃ ຫ ້ ເ ໝ ານ ະ",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Timeframe ມ ີ ຫ ຍ ັ ງ ແ ດ່?"),
      ...bullets([
        "M1, M5: Scalping ໃ ຊ ້ ເ ວ ລ ານ ຫ ຼ ານ Noise ສ ູ ງ",
        "M15, M30: Day Trading ຄ ຶ ກ ຄ ື ້ ນ ດ ີ",
        "H1: Day-Swing ລ ະ ຫ ວ ່ ານ ກ ານ ງ",
        "H4: Swing Trading ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ",
        "D1 (Daily): Position/Swing ໄ ລ ຍ ານ ຍ ານ",
        "W1, MN: Position Trading / Investor",
      ]),
      h2("ເ ລ ື ອ ກ Timeframe ຕ ານ ມ Style"),
      h3("Scalping (M1-M5)"),
      ...bullets(["ຕ ້ ອ ງ ການ: ເ ວ ລ ານ ຫ ຼ ານ, Emotion ດ ີ, ECN Broker", "ຄ ວ ານ ມ ຍ ານ: ສ ູ ງ ທ ີ ່ ສ ຸ ດ", "ຮ ຽ ນ ວ ່ ານ ຍ າ ກ ສ ຳ ລ ັ ບ Beginner"]),
      h3("Day Trading (M15-H1)"),
      ...bullets(["ຕ ້ ອ ງ ການ: 2-4 ຊ ົ ່ ວ ໂ ມ ງ/ວ ັ ນ", "ຄ ວ ານ ມ ຍ ານ: ປ ານ ກ ານ ງ", "ດ ີ ສ ຳ ລ ັ ບ ຄ ົ ນ ທ ີ ່ ຕ ້ ອ ງ ການ ເ ຫ ັ ນ ຜ ົ ນ ທ ຸ ກ ວ ັ ນ"]),
      h3("Swing Trading (H4-D1)"),
      ...bullets(["ຕ ້ ອ ງ ການ: 1-2 ຊ ົ ່ ວ ໂ ມ ງ/ວ ັ ນ", "ດ ີ ທ ີ ່ ສ ຸ ດ ສ ຳ ລ ັ ບ ຄ ົ ນ ທ ຳ ງ ານ ປ ະ ຈ ຳ", "Noise ໜ ້ ອ ຍ Signal ດ ີ ກ ວ່ ານ"]),
      h3("Position Trading (D1-W1)"),
      ...bullets(["ຕ ້ ອ ງ ການ: ໜ ້ ອ ຍ ກ ວ່ ານ 30 ນ ານ ທ ີ/ວ ັ ນ", "ຕ ້ ອ ງ ທ ຶ ນ ຫ ຼ ານ ແ ລ ະ ຄ ວ ານ ມ ອ ົ ດ ທ ົ ນ ສ ູ ງ"]),
      h2("Multiple Timeframe Analysis"),
      p("ທ ຸ ກ Trader ຄ ວ ນ ໃ ຊ ້ ຢ ່ ານ ໜ ້ ອ ຍ 2 Timeframe:"),
      ...numbers([
        "Higher TF: ດ ູ Trend ຫ ຼ ັ ກ ແ ລ ະ Bias",
        "Trading TF: ຫ ານ Setup ຫ ຼ ັ ກ",
        "Entry TF: Fine-tune Entry (Optional)",
        "ຕ ົ ວ ຢ ່ ານ: Daily Trend + H4 Setup + H1 Entry",
      ]),
      h2("ຂ ້ ໍ ຜ ິ ດ ພ ານ ດ"),
      ...bullets([
        "❌ ໃ ຊ ້ TF ນ ້ ອ ຍ ໂ ດ ຍ ລ ຶ ມ TF ໃ ຫ ຍ ່",
        "❌ ປ ່ ຽ ນ TF ທ ຸ ກ ທ ີ ທ ີ ່ ບ ໍ ່ ໄ ດ ້ ຜ ົ ນ",
        "❌ Scalp ໃ ນ M1 ທ ັ ນ ທ ີ ໂ ດ ຍ ບ ໍ ່ ຮ ຽ ນ ທ ຳ ອ ິ ດ",
      ]),
    ],
  },

  // ══════════════════════════════════════════
  // EA-TOOLS — ທ ຸ ກ 3 ບ ົ ດ
  // ══════════════════════════════════════════

  // EA 1. what-is-expert-advisor-ea
  {
    _type: "article",
    title: "EA (Expert Advisor) ແ ມ ່ ນ ຫ ຍ ັ ງ? ເ ຮ ັ ດ ວ ຽ ກ ແ ນ ວ ໃ ດ?",
    slug: { _type: "slug", current: "what-is-expert-advisor-ea" },
    category: "ea-tools",
    excerpt: "Expert Advisor (EA) ຄ ື ໂ ປ ຣ ແ ກ ຣ ມ Trade ອ ັ ດ ຕ ະ ໂ ນ ມ ັ ດ ໃ ນ MT4/MT5 ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ EA ເ ຮ ັ ດ ວ ຽ ກ ການ ຕ ິ ດ ຕ ັ ້ ງ ແ ລ ະ ຂ ້ ໍ ໄ ດ ້ ປ ຣ ຽ ບ ທ ຽ ບ",
    readTime: 14,
    publishedAt: new Date().toISOString(),
    body: [
      h2("EA ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Expert Advisor (EA) ຫ ຼ ື Robot Trading ຄ ື ໂ ປ ຣ ແ ກ ຣ ມ ທ ີ ່ ຂ ຽ ນ ໃ ນ ພ ານ ສ ານ MQL4/MQL5 ທ ຳ ງ ານ ຢ ູ ່ ໃ ນ MT4/MT5 ໂ ດ ຍ ອ ິ ດ ສ ະ ຫ ລ ະ ໂ ດ ຍ ບ ໍ ່ ຕ ້ ອ ງ ໃ ຫ ້ Trader ນ ່ ານ ຢ ູ ່ ໜ ້ ານ ຈ ໍ"),
      p("EA ສ ານ ມ ານ ດ ວ ິ ເ ຄ ານ ະ Chart, ກ ຳ ນ ົ ດ Entry/Exit, ຕ ັ ້ ງ SL/TP ແ ລ ະ ຄ ຳ ນ ວ ນ Lot Size ໂ ດ ຍ ອ ັ ດ ຕ ະ ໂ ນ ມ ັ ດ"),
      h2("EA ເ ຮ ັ ດ ວ ຽ ກ ແ ນ ວ ໃ ດ?"),
      ...numbers([
        "Broker ສ ່ ງ ຂ ້ ໍ ມ ູ ນ ລ ານ ຄ ານ ໃ ໝ ່ ທ ຸ ກ Tick",
        "EA ຮ ັ ບ ຂ ້ ໍ ມ ູ ນ ແ ລ ະ ກ ວ ດ ສ ອ ບ ຕ ານ ມ Rules ທ ີ ່ ຂ ຽ ນ",
        "ຖ ້ ານ ເ ງ ື ່ ອ ນ ໄ ຂ ຄ ົ ບ → Open/Close Trade ທ ັ ນ ທ ີ",
        "ຄ ຳ ນ ວ ນ SL/TP ແ ລ ະ Lot ຕ ານ ມ Parameter",
        "ທ ຳ ໃ ໝ ່ ທ ຸ ກ Candle ໃ ໝ ່ ຫ ຼ ື ທ ຸ ກ Tick",
      ]),
      h2("ປ ະ ເ ພ ດ EA"),
      h3("Trend Following EA"),
      ...bullets(["Trade ຕ ານ ມ ທ ິ ດ Trend ໃ ຊ ້ MA Cross, Breakout ໆ", "ໄ ດ ້ ຜ ົ ນ ດ ີ ໃ ນ Trending Market", "ຂ ານ ທ ຶ ນ ໃ ນ Sideways"]),
      h3("Grid EA"),
      ...bullets(["ວ ານ Grid ຂ ອ ງ Orders ທ ັ ງ Buy ແ ລ ະ Sell", "ທ ຳ ກ ຳ ໄ ລ ຈ ານ ກ ການ ແ ກ ວ ່ ງ ຂ ອ ງ ລ ານ ຄ ານ", "TheRocket EA SGride ຂ ອ ງ LFT ໃ ຊ ້ Strategy ນ ີ ້"]),
      h3("Scalping EA"),
      ...bullets(["Trade ໄ ວ ໃ ນ M1/M5 ກ ຳ ໄ ລ ນ ້ ອ ຍ ໆ ຫ ຼ ານ ຄ ັ ້ ງ", "ຕ ້ ອ ງ VPS ທ ີ ່ ຕ ິ ດ ກ ັ ບ Server Broker", "Spread ຕ ້ ອ ງ ຕ ່ ຳ ຫ ຼ ານ"]),
      h3("Hedging EA"),
      ...bullets(["ວ ານ Position ທ ັ ງ Buy ແ ລ ະ Sell ພ ້ ອ ມ ກ ັ ນ", "TheRocket EA MegiHedge ຂ ອ ງ LFT ໃ ຊ ້ Strategy ນ ີ ້", "ຫ ຼ ຸ ດ ຄ ວ ານ ມ ສ ່ ຽ ງ ໃ ນ ຊ ່ ວ ງ ຕ ະ ຫ ຼ ານ ຜ ົ ນ ຜ ວ"]),
      h2("ຂ ້ ໍ ດ ີ ຂ ອ ງ EA"),
      ...bullets([
        "✅ ບ ໍ ່ ມ ີ Emotion: Trade ຕ ານ ມ Rules ສ ະ ເ ໝ ີ",
        "✅ 24/5: ທ ຳ ງ ານ ຕ ລ ອ ດ ບ ໍ ່ ຕ ້ ອ ງ ເ ຝ ົ ້ ານ",
        "✅ ໄ ວ: Execute ໃ ນ Milliseconds",
        "✅ Backtest ໄ ດ ້: ທ ົ ດ ສ ອ ບ Strategy ໄ ດ ້ ກ ່ ອ ນ",
      ]),
      h2("ຂ ້ ໍ ສ ຽ ງ ຂ ອ ງ EA"),
      ...bullets([
        "⚠️ Strategy ຜ ິ ດ: EA ຈ ະ ຂ ານ ທ ຶ ນ ຢ ່ ານ Consistent",
        "⚠️ Over-optimized: ດ ີ ໃ ນ Backtest ແ ຕ ່ ຜ ົ ນ ຕ ່ ຳ Real",
        "⚠️ VPS ຕ ້ ອ ງ ໃ ຊ ້ ຕ ລ ອ ດ ຄ ່ ານ ໃ ຊ ້ ຈ ່ ານ",
        "⚠️ Broker ດ ີ: ຕ ້ ອ ງ ECN ທ ີ ່ Fast Execution",
      ]),
      h2("ການ ຕ ິ ດ ຕ ັ ້ ງ EA ໃ ນ MT4"),
      ...numbers([
        "Download ໄ ຟ ລ ໌ .ex4 ຫ ຼ ື .mq4",
        "MT4 → File → Open Data Folder → MQL4 → Experts",
        "Copy ໄ ຟ ລ ໌ ໄ ວ ້ ທ ີ ່ Experts Folder",
        "Restart MT4 ຫ ຼ ື Refresh Navigator",
        "Drag EA ໄ ວ ທ ີ ່ Chart ທ ີ ່ ຕ ້ ອ ງ ການ",
        "ຕ ັ ້ ງ Parameter ແ ລ ະ Enable Auto Trading",
      ]),
    ],
  },

  // EA 2. mt4-vs-mt5-comparison
  {
    _type: "article",
    title: "MT4 ທ ຽ ບ MT5: ຄ ວ ນ ໃ ຊ ້ Platform ໃ ດ?",
    slug: { _type: "slug", current: "mt4-vs-mt5-comparison" },
    category: "ea-tools",
    excerpt: "MT4 ແ ລ ະ MT5 ຕ ່ ານ ກ ັ ນ ຢ ່ ານ ໃ ດ? ຮ ຽ ນ ຮ ູ ້ ຂ ້ ໍ ດ ີ ຂ ້ ໍ ເ ສ ຍ ຂ ອ ງ ແ ຕ ່ ລ ະ Platform ແ ລ ະ ຄ ວ ນ ໃ ຊ ້ Platform ໃ ດ ສ ຳ ລ ັ ບ EA",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("MT4 (MetaTrader 4)"),
      p("MT4 ສ ້ ານ ງ ໃ ນ ປ ີ 2005 ໂ ດ ຍ MetaQuotes ເ ປ ັ ນ Platform ທ ີ ່ ນ ິ ຍ ົ ມ ທ ີ ່ ສ ຸ ດ ໃ ນ ໂ ລ ກ ສ ຳ ລ ັ ບ Retail Forex Trader"),
      h3("ຂ ້ ໍ ດ ີ MT4"),
      ...bullets(["ທ ົ ່ ວ ໄ ປ ທ ີ ່ ສ ຸ ດ: Broker ເ ກ ື ອ ບ ທ ຸ ກ ແ ຫ ່ ງ ໃ ຊ ້", "EA ຫ ຼ ານ: Community ແ ລ ະ Marketplace ໃ ຫ ຍ ່", "ໃ ຊ ້ ງ ່ ານ: Interface ຄ ຸ ້ ນ ເ ຄ ີ ຍ", "ຂ ້ ໍ ມ ູ ນ ຫ ຼ ານ ໃ ນ ອ ີ ນ ເ ຕ ີ ຣ ເ ນ ັ ດ", "ໃ ຊ ້ ກ ັ ບ VPS ງ ່ ານ"]),
      h3("ຂ ້ ໍ ເ ສ ຍ MT4"),
      ...bullets(["Timeframe ຈ ຳ ກ ັ ດ: M1 M5 M15 M30 H1 H4 D1 W1 MN", "ບ ໍ ່ ມ ີ Market Depth (DOM)", "Hedging ຈ ຳ ກ ັ ດ ໃ ນ ບ ານ ງ Broker"]),
      h2("MT5 (MetaTrader 5)"),
      p("MT5 ສ ້ ານ ງ ໃ ນ ປ ີ 2010 ເ ປ ັ ນ Version ໃ ໝ ່ ທ ີ ່ ມ ີ ຄ ວ ານ ສ ານ ມ ານ ດ ຫ ຼ ານ ກ ວ່ ານ MT4 ແ ຕ ່ ຍ ັ ງ ໃ ຊ ້ ທ ົ ່ ວ ໄ ປ ໜ ້ ອ ຍ ກ ວ່ ານ"),
      h3("ຂ ້ ໍ ດ ີ MT5"),
      ...bullets(["Timeframe ຫ ຼ ານ ກ ວ່ ານ: ເ ພ ີ ່ ມ M2 M3 M4 M6 M10 M12 H2 H3 H6 H8 H12", "Market Depth (DOM): ເ ຫ ັ ນ Order Book", "Better Backtesting: Tick Data ດ ີ ກ ວ່ ານ", "Multi-Currency Pairs ໃ ນ ຄ ັ ້ ງ ດ ຽ ວ", "ສ ານ ມ ານ ດ Trade ຫ ຸ ້ ນ ໄ ດ ້ ດ ້ ວ ຍ"]),
      h3("ຂ ້ ໍ ເ ສ ຍ MT5"),
      ...bullets(["EA MT4 ໃ ຊ ້ ໃ ນ MT5 ໄ ດ ້ ຍ ານ: ຕ ້ ອ ງ Convert", "Netting System: ໃ ນ ບ ານ ງ Broker ບ ໍ ່ ໃ ຫ ້ Hedge", "ຮ ຽ ນ ໃ ໝ ່: ຄ ວ ນ ເ ລ ີ ່ ມ ຕ ້ ນ ດ ້ ວ ຍ MT4"]),
      h2("ຄ ວ ນ ໃ ຊ ້ Platform ໃ ດ?"),
      ...bullets([
        "Beginner: MT4 — ໃ ຊ ້ ງ ່ ານ ຂ ້ ໍ ມ ູ ນ ຫ ຼ ານ",
        "Swing Trader: MT4 ຫ ຼ ື MT5",
        "EA Developer: MT5 — Backtesting ດ ີ ກ ວ່ ານ",
        "Scalper: MT4 — Execution ໄ ວ ກ ວ່ ານ",
        "TheRocket EA ຂ ອ ງ LFT: ໃ ຊ ້ MT4",
      ]),
      h2("ການ ດ ານ ວ ໂ ຫ ຼ ດ ແ ລ ະ ຕ ິ ດ ຕ ັ ້ ງ"),
      ...numbers([
        "ໄ ປ ທ ີ ່ ເ ວ ັ ບ Broker ທ ່ ານ ໃ ຊ ້ ຢ ູ ່",
        "ຊ ອ ກ Download MT4/MT5",
        "ຕ ິ ດ ຕ ັ ້ ງ ແ ລ ະ Login ດ ້ ວ ຍ Account ຂ ອ ງ Broker",
        "ທ ົ ດ ລ ອ ງ Demo ກ ່ ອ ນ Real ສ ະ ເ ໝ ີ",
      ]),
    ],
  },

  // EA 3. vps-for-forex-ea
  {
    _type: "article",
    title: "VPS Forex ແ ມ ່ ນ ຫ ຍ ັ ງ? ຄ ວ ນ ໃ ຊ ້ VPS ໃ ດ ສ ຳ ລ ັ ບ EA?",
    slug: { _type: "slug", current: "vps-for-forex-ea" },
    category: "ea-tools",
    excerpt: "VPS (Virtual Private Server) ຈ ຳ ເ ປ ັ ນ ສ ຳ ລ ັ ບ Trader ທ ີ ່ ໃ ຊ ້ EA ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ເ ລ ື ອ ກ VPS ທ ີ ່ ດ ີ ທ ີ ່ ສ ຸ ດ ສ ຳ ລ ັ ບ MT4/MT5",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("VPS ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("VPS (Virtual Private Server) ຄ ື Server ທ ີ ່ ທ ່ ານ ເ ຊ ົ ່ ານ ໃ ຊ ້ ທ ້ ອ ງ ຖ ິ ່ ນ ຢ ູ ່ Data Center ທ ີ ່ Online 24/7 ທ ຳ ໃ ຫ ້ MT4/MT5 ແ ລ ະ EA ວ ິ ່ ງ ຕ ລ ອ ດ ໂ ດ ຍ ບ ໍ ່ ຕ ້ ອ ງ ເ ປ ີ ດ ຄ ອ ມ ຂ ອ ງ ທ ່ ານ"),
      h2("ເ ປ ັ ນ ຫ ຍ ັ ງ ຈ ຶ ່ ງ ຕ ້ ອ ງ VPS?"),
      ...bullets([
        "EA ຕ ້ ອ ງ ວ ິ ່ ງ 24/5: ຄ ອ ມ ທ ່ ານ ບ ່ ອ ນ ທ ຸ ກ ຄ ົ ນ ປ ິ ດ",
        "Internet ຂ າ ດ: ລ ານ ຄ ານ ເ ກ ີ ດ SL ຖ ູ ກ Execute ໂ ດ ຍ Broker",
        "Latency ຕ ່ ຳ: VPS ຢ ູ ່ ໃ ກ ້ Broker Server = Execution ໄ ວ",
        "Scalping EA: ຕ ້ ອ ງ Execution ໄ ວ ຫ ຼ ານ",
        "Safety: MT4 ວ ິ ່ ງ ສ ະ ເ ໝ ີ ບ ໍ ່ Crash",
      ]),
      h2("Spec ທ ີ ່ ຕ ້ ອ ງ ການ ສ ຳ ລ ັ ບ EA VPS"),
      ...bullets([
        "OS: Windows Server 2012/2016/2019",
        "RAM: 2GB ຂ ຶ ້ ນ ໄ ປ (4GB ຖ ້ ານ ໃ ຊ ້ ຫ ຼ ານ EA)",
        "CPU: 2 Core ຂ ຶ ້ ນ ໄ ປ",
        "SSD: 50GB+ ສ ຳ ລ ັ ບ MT4 ແ ລ ະ Data",
        "Location: ໃ ກ ້ Broker Server (ສ ່ ວ ນ ໃ ຫ ຍ ່ ຢ ູ ່ ເ ຢ ື ອ ລ ະ ມ ານ / UK / US)",
        "Uptime: 99.9%+",
      ]),
      h2("VPS ທ ີ ່ ນ ິ ຍ ົ ມ ສ ຳ ລ ັ ບ Forex"),
      ...bullets([
        "Contabo: ຖ ູ ກ ທ ີ ່ ສ ຸ ດ €5/ເ ດ ື ອ ນ ດ ີ ສ ຳ ລ ັ ບ Beginner",
        "Vultr: ໄ ວ $6-12/ເ ດ ື ອ ນ Server ທ ົ ່ ວ ໂ ລ ກ",
        "ForexVPS.net: ສ ະ ເ ພ າ ະ Forex Low Latency",
        "BeeksFX: Forex-Specific ຄ ຸ ນ ນ ະ ພ ານ ບ ສ ູ ງ",
        "Broker Free VPS: XM ແ ລ ະ Exness ໃ ຫ ້ VPS ຟ ຣ ີ ສ ຳ ລ ັ ບ ລ ູ ກ ຄ ້ ານ ທ ີ ່ ມ ີ Volume ສ ູ ງ",
      ]),
      h2("ຂ ັ ້ ນ ຕ ອ ນ ຕ ັ ້ ງ VPS ສ ຳ ລ ັ ບ MT4"),
      ...numbers([
        "ສ ະ ໝ ັ ກ VPS ແ ລ ະ ໄ ດ ້ IP/Username/Password",
        "Remote Desktop (Windows) ຫ ຼ ື RDP App (Mac/Mobile)",
        "Connect ເ ຂ ົ ້ ານ VPS ໂ ດ ຍ ໃ ຊ ້ Remote Desktop",
        "Download ແ ລ ະ ຕ ິ ດ ຕ ັ ້ ງ MT4 ໃ ນ VPS",
        "Login MT4 ດ ້ ວ ຍ Account Broker",
        "Copy EA ແ ລ ະ Activate",
        "VPS ຈ ະ ວ ິ ່ ງ 24/7 ແ ມ ້ ທ ່ ານ ປ ິ ດ ຄ ອ ມ",
      ]),
      h2("ຄ ່ ານ ໃ ຊ ້ ຈ ່ ານ VPS"),
      ...bullets([
        "Budget: $5-15/ເ ດ ື ອ ນ ສ ຳ ລ ັ ບ 1 EA",
        "Mid: $15-30/ເ ດ ື ອ ນ ສ ຳ ລ ັ ບ ຫ ຼ ານ EA",
        "Premium: $30-100+/ເ ດ ື ອ ນ Low Latency Forex VPS",
        "Broker Free VPS: ດ ີ ທ ີ ່ ສ ຸ ດ ຖ ້ ານ ໄ ດ ້",
      ]),
    ],
  },
]

async function importArticles() {
  console.log("🚀 ເລ ີ ່ ມ ນ ຳ ເ ຂ ົ ້ ານ Batch 5 Final (Education ສ ຸ ດ ທ ້ ານ + EA-Tools ທ ຸ ກ ໝ ົ ດ)...")
  let success = 0, failed = 0

  for (const article of articles) {
    try {
      await client.createOrReplace({
        ...article,
        _id: `article-${article.slug.current}`,
      })
      console.log(`✅ [${article.category}] ${article.title}`)
      success++
    } catch (err) {
      console.error(`❌ ${article.title}:`, err.message)
      failed++
    }
  }

  console.log(`\n══════════════════════════════`)
  console.log(`✅ ສ ຳ ເ ລ ັ ດ: ${success} ບ ົ ດ`)
  if (failed > 0) console.log(`❌ ລ ົ ້ ມ ເ ຫ ຼ ວ: ${failed} ບ ົ ດ`)
  console.log(`\n🎉 ເ ສ ລ ັ ດ ທ ຸ ກ ບ ົ ດ ແ ລ ້ ວ! Education + EA-Tools ຄ ົ ບ ໝ ົ ດ`)
  console.log(`══════════════════════════════`)
}

importArticles().catch(console.error)
