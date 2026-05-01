// seed-education-batch2.js
// ນຳເຂົ້າ 10 ບົດຮຽນ education batch 2
// ວິທີໃຊ້: node scripts/seed-education-batch2.js

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
function h2(text) { return block(text, "h2") }
function h3(text) { return block(text, "h3") }
function p(text) { return block(text, "normal") }
function bullets(items) {
  return items.map(text => ({
    _type: "block", _key: Math.random().toString(36).slice(2, 9),
    style: "normal", listItem: "bullet", level: 1, markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 9), text, marks: [] }],
  }))
}
function numbers(items) {
  return items.map(text => ({
    _type: "block", _key: Math.random().toString(36).slice(2, 9),
    style: "normal", listItem: "number", level: 1, markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 9), text, marks: [] }],
  }))
}

const articles = [

  // ────────────────────────────────────────────────────────────
  // 1. Swing Trading
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Swing Trading: ຖື Position 2-7 ວັນ ເໝາະສຳລັບຄົນທຳງານ",
    slug: { _type: "slug", current: "swing-trading-strategy" },
    category: "education",
    excerpt: "Swing Trading ຄື Strategy ທີ່ເໝາະທີ່ສຸດສຳລັບຄົນທີ່ມີວຽກທຳ ບໍ່ຕ້ອງເຝົ້າ Chart ຕລອດ ຖື Position 2-7 ວັນ ທຳກຳໄລຈາກການເຄື່ອນໄຫວຂະໜາດກາງ",
    readTime: 14,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Swing Trading ແມ່ນຫຍັງ?"),
      p("Swing Trading ຄື Style ການ Trade ທີ່ຖື Position ໄວ້ລະຫວ່າງ 2-7 ວັນ (ບາງຄັ້ງຮອດ 2-3 ອາທິດ) ເພື່ອທຳກຳໄລຈາກ 'Swing' ຫຼື ການແກວ່ງຂອງລາຄາ ໃນຕະຫຼາດ"),
      p("ຕ່າງຈາກ Day Trading ທີ່ຕ້ອງເຝົ້າ Chart ຕລອດ Swing Trader ຕ້ອງການແຄ່ 1-2 ຊົ່ວໂມງຕໍ່ວັນ ໃນຕອນເຊົ້າ ຫຼື ຕອນຄ່ຳ ເໝາະທີ່ສຸດສຳລັບຄົນທີ່ມີວຽກປະຈຳ"),

      h2("ເປັນຫຍັງ Swing Trading ຈຶ່ງນິຍົມ?"),
      ...bullets([
        "✅ ບໍ່ຕ້ອງເຝົ້າ Chart ຕລອດ: ເຫັນ Setup ຕອນຄ່ຳ ວາງ Order ຕອນກ່ຽງຄືນ",
        "✅ Timeframe H4/Daily: Noise ໜ້ອຍ Signal ດີກວ່າ M1/M5",
        "✅ Risk/Reward ດີ: ຮັບ 100-300 Pips ຕໍ່ Trade",
        "✅ Spread ບໍ່ສຳຄັນຫຼາຍ: ຖື Position ຍາວ Spread 2-3 Pips ບໍ່ກະທົບ",
        "✅ ເໝາະ Beginner-Intermediate: ມີເວລາວິເຄາະ ບໍ່ Panic ງ່າຍ",
      ]),

      h2("Swing Trading ໃຊ້ Timeframe ໃດ?"),
      p("Swing Trader ໃຊ້ Multiple Timeframe Analysis:"),
      ...bullets([
        "Weekly (W1): ເບິ່ງ Trend ຫຼັກ ຂອງຕະຫຼາດ",
        "Daily (D1): ຫາ Setup ຫຼັກ ແລະ S/R ທີ່ສຳຄັນ",
        "H4: ຢັ້ງຢືນ Pattern ແລະ ກຳນົດ Entry Point",
        "H1: Fine-tune Entry ໃຫ້ Precise ກວ່າ (Optional)",
      ]),

      h2("Swing Trading Strategy ທີ່ນິຍົມ"),

      h3("Strategy 1: Trend Swing"),
      p("ຫຼັກການ: ເທຣດຕາມ Trend ຫຼັກ ຊື້ເວລາ Pullback ໃນ Uptrend ຂາຍເວລາ Pullback ໃນ Downtrend"),
      ...numbers([
        "ກຳນົດ Trend Daily: ລາຄາ > MA200 = Uptrend",
        "ລໍ Pullback ມາ ຫາ MA50 ຫຼື Fibonacci 38-61.8%",
        "ຫາ Bullish Candle Pattern (Hammer, Engulfing)",
        "Entry Buy ກັບ Stop ຕ່ຳກວ່າ Swing Low",
        "Target: Previous High ຫຼື Fibonacci Extension",
      ]),

      h3("Strategy 2: Range Swing"),
      p("ຫຼັກການ: ຕະຫຼາດ Sideways ຊື້ Support ຂາຍ Resistance"),
      ...numbers([
        "ກຳນົດ Range: High ແລະ Low ທີ່ຊັດເຈນ",
        "ຊື້ຢູ່ Support + Candle Confirm",
        "ຂາຍຢູ່ Resistance + Candle Confirm",
        "Stop Loss ຢູ່ ນອກ Range",
        "ອອກ Position ກ່ອນ Midpoint ຂອງ Range",
      ]),

      h3("Strategy 3: Breakout Swing"),
      p("ຫຼັກການ: ລໍ Breakout ຈາກ Pattern ແລ້ວ ຕາມ Momentum"),
      ...numbers([
        "ຫາ Consolidation Pattern: Triangle, Rectangle, Flag",
        "ລໍ Candle Close ເທິງ/ລຸ່ມ Pattern ດ້ວຍ Volume ສູງ",
        "Entry ຫຼັງ Retest ຂອງ Breakout Level",
        "Stop Loss ຢູ່ ໃນ Pattern",
        "Target: Height ຂອງ Pattern",
      ]),

      h2("ເຄື່ອງມື Indicator ທີ່ Swing Trader ໃຊ້"),
      ...bullets([
        "Moving Average (MA20, MA50, MA200): ທິດ Trend ແລະ Dynamic Support",
        "RSI (14): ຫາ Oversold/Overbought Zones",
        "MACD: Confirm Momentum ແລະ Divergence",
        "Fibonacci Retracement: ຫາ Pullback Level",
        "ATR (14): ວາງ Stop Loss ອີງຕາມ Volatility ຕົວຈິງ",
        "Volume: ຢັ້ງຢືນ Breakout ແລະ Reversal",
      ]),

      h2("Risk Management ສຳລັບ Swing Trading"),
      ...bullets([
        "Risk ຕໍ່ Trade: ບໍ່ເກີນ 1-2% ຂອງ Account",
        "Stop Loss: ໄລຍະ 50-150 Pips ຂຶ້ນກັບ Pair ແລະ Timeframe",
        "Risk/Reward ຢ່າງໜ້ອຍ 1:2 (Risk 50 Pips ຮັບ 100+ Pips)",
        "ຫຼາຍສຸດ 3-5 Trades ໃນເວລາດຽວກັນ",
        "Weekend Risk: ຖ້ານຶກວ່ານຶກກັງວົນ ໃຫ້ Reduce Position ຕອນ ວັນສຸກ",
      ]),

      h2("ຕາຕະລາງວັນຂອງ Swing Trader"),
      ...bullets([
        "ເຊົ້າ (15-30 ນາທີ): ກວດ Overnight Gap, ຂ່າວ, ກວດ Position",
        "ຄ່ຳ (30-60 ນາທີ): ວິເຄາະ Daily Candle, ຫາ Setup ໃໝ່, ວາງ Order",
        "ທ່ຽງ: ເບິ່ງ H4 ຖ້າ ມີ Signal ສຳຄັນ (Optional)",
        "ວັນສຸກ: Review ທຸກ Position ຕັດສິນໃຈ Hold Weekend ຫຼື ບໍ່",
      ]),

      h2("ຂໍ້ຜິດພາດທົ່ວໄປ"),
      ...bullets([
        "❌ ປ່ຽນ Timeframe ກາງທາງ: ເຫັນ M15 ຫຼ້ວ Panic ອອກ",
        "❌ ບໍ່ ອົດທົນ: ອອກ Trade ໄວ ກ່ອນ Target",
        "❌ Over-leverage: ຖື Position ຂ້າມຄືນດ້ວຍ Lot ໃຫຍ່ເກີນ",
        "❌ ບໍ່ ຮັ່ນໃຈ S/R: Trade ໃນ Chop Zone",
        "❌ ລືມ Rollover/Swap: ຄິດໄລ Swap ທຸກຄືນດ້ວຍ",
      ]),

      h2("ສະຫຼຸບ: Swing Trading ເໝາະກັບໃຜ?"),
      ...bullets([
        "✅ ຄົນທີ່ມີວຽກປະຈຳ ໄວ້ 1-2 ຊົ່ວໂມງ/ວັນ",
        "✅ Trader ທີ່ Emotion ດີ ອົດທົນ ໄດ້",
        "✅ ຄົນທີ່ຮຽນ TA ພອ້ 3-6 ເດືອນ",
        "❌ ຄົນທີ່ຕ້ອງ ຮູ້ ຜົນ ທຸກ ວັນ",
        "❌ ຄົນ ທີ່ ຕ້ອງ ການ Quick Money",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 2. Breakout Strategy
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Breakout Strategy: Entry ທີ່ Break S/R ຫຼື Pattern",
    slug: { _type: "slug", current: "breakout-strategy" },
    category: "education",
    excerpt: "Breakout Strategy ຄືການ Trade ເມື່ອລາຄາ Break ຜ່ານ Support, Resistance ຫຼື Chart Pattern ດ້ວຍ Volume ສູງ ເໝາະທີ່ສຸດໃນຕະຫຼາດທີ່ Trending",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Breakout ແມ່ນຫຍັງ?"),
      p("Breakout ເກີດຂຶ້ນເມື່ອລາຄາ Break ຜ່ານ Level ສຳຄັນ ເຊັ່ນ Support, Resistance, ຫຼື Chart Pattern ດ້ວຍ Momentum ທີ່ແຮງ ສ່ວນຫຼາຍ Breakout ສ່ງ ສັນຍານການເລີ່ມຕົ້ນຂອງ Trend ໃໝ່"),
      p("Breakout Strategy ນິຍົມໃນທຸກ Timeframe ແຕ່ Breakout ໃນ Daily/Weekly ໜ້າເຊື່ອຖືກວ່າ M5/M15 ຫຼາຍ"),

      h2("ປະເພດ Breakout"),
      h3("1. Resistance Breakout (Bullish)"),
      p("ລາຄາ Break ຂຶ້ນເທິງ Resistance → ສັນຍານ Long/Buy ລາຄາ ໃໝ່ ທີ່ ສູງ ກ ວ່ າ ກ ່ ອ ນ ກ າ ຍ ເ ປ ັ ນ Support ໃ ໝ ່ (Role Reversal)"),

      h3("2. Support Breakdown (Bearish)"),
      p("ລາຄາ Break ລົງລຸ່ມ Support → ສັນຍານ Short/Sell Support ເກົ່າ ກາຍ ເ ປ ັ ນ Resistance ໃ ໝ ່"),

      h3("3. Pattern Breakout"),
      ...bullets([
        "Triangle (Ascending/Descending/Symmetrical): ລໍ Break ຈາກ Trendline",
        "Rectangle/Channel: ລໍ Break ຈາກ Range",
        "Head & Shoulders: ລໍ Break Neckline",
        "Double Top/Bottom: ລໍ Break ຈາກ Neckline",
        "Cup & Handle: Break ຈາກ Rim ຂອງ Cup",
      ]),

      h2("ວິທີ Trade Breakout ທີ່ຖືກຕ້ອງ"),
      h3("Step 1: ກຳນົດ Level ທີ່ຈະ Break"),
      ...bullets([
        "ໃຊ້ Daily/H4 ກຳນົດ Key S/R Level",
        "Level ທີ່ Reject ຫຼາຍຄັ້ງ = ສຳຄັນກວ່າ",
        "Round Numbers ເຊັ່ນ 1.1000, 2000 ສຳຄັນ",
        "Previous High/Low ຂອງ ອາທິດ/ເດືອນ ສຳຄັນ",
      ]),

      h3("Step 2: ກຳນົດ Breakout Criteria"),
      ...bullets([
        "Candle Close ຢູ່ເທິງ Resistance (ບໍ່ພຽງແຕ່ Wick))",
        "Volume ສູງກວ່າ Average 1.5-2 ເທົ່າ",
        "Breakout ໃນ Session ທີ່ Active (London/NY)",
        "ຫຼີກລ່ຽງ Breakout ດ້ວຍ Spread ກວ້າງ ຊ່ວງ Quiet",
      ]),

      h3("Step 3: Entry Options"),
      ...bullets([
        "Aggressive Entry: ຊື້/ຂາຍທັນທີ ເມື່ອ Candle Close Break",
        "Conservative Entry: ລໍ Retest ຂອງ Level ທີ່ Break ແລ້ວ Entry",
        "Retest Entry ດີກວ່າ: Risk ໜ້ອຍ Confirmation ສູງ",
      ]),

      h3("Step 4: Stop Loss ແລະ Target"),
      ...bullets([
        "Stop Loss: ໃສ່ໄວ້ ໃນ Pattern ຫຼື ຕ່ຳກວ່າ Level ທີ່ Break",
        "Target 1: Height ຂອງ Pattern (Measured Move)",
        "Target 2: Fibonacci Extension 127.2% ຫຼື 161.8%",
        "Target 3: Previous High/Low ສຳຄັນ",
      ]),

      h2("False Breakout ແມ່ນຫຍັງ? ລະວັງ!"),
      p("False Breakout (ຫຼື Fakeout) ຄືເມື່ອລາຄາ Break Level ແຕ່ແລ້ວ ກັບຄືນ ທັນທີ ເຮັດໃຫ້ Trader ທີ່ Entry ຖືກ Stopped Out"),
      ...bullets([
        "ສາເຫດ: Volume ຕ່ຳ, Manipulation ຈາກ Institutions",
        "ລະວັງ: ຊ່ວງ Quiet Session, ກ່ອນ ຂ່າວ ໃຫຍ່",
        "ປ້ອງກັນ: ລໍ Candle Close ແທນ Wick Break",
        "ລໍ Retest: ເຫັນ Retest ຈາກ ດ້ານໃໝ່ ກ່ອນ Entry",
        "ໃຊ້ Volume Confirm: Breakout ດ້ວຍ Volume ໜ້ອຍ = ສ່ຽງ Fakeout",
      ]),

      h2("Chart Pattern ທີ່ Breakout ດ້ວຍ"),
      h3("Ascending Triangle → Bullish Breakout"),
      p("Higher Lows + Flat Resistance → ຊ່ອງ Coiling Energy → Break ຂຶ້ນ Target = Height ຂອງ Triangle"),

      h3("Descending Triangle → Bearish Breakdown"),
      p("Lower Highs + Flat Support → Break ລົງ Target = Height ຂອງ Triangle"),

      h3("Symmetrical Triangle → Breakout ທາງໃດກໍໄດ້"),
      p("Lower Highs + Higher Lows → ລໍທິດ Trend ຫຼັກ ກຳນົດ Direction"),

      h3("Rectangle / Consolidation"),
      p("ລາຄາ ຢູ່ Range ດົນ → Energy ສະສົມ → Break ດ້ວຍ Volume ສູງ → Target = Height ຂອງ Rectangle"),

      h2("ຂໍ້ຜິດພາດທົ່ວໄປ"),
      ...bullets([
        "❌ Entry ຈາກ Wick Break ບໍ່ Candle Close: ສ່ຽງ Fakeout",
        "❌ ບໍ່ ກວດ Volume: Breakout ບໍ່ ມີ Volume = ອ່ອນ",
        "❌ Target ໄວ ເກີນ: ຕ້ອງໃຫ້ລາຄາ ວິ່ງ ໄດ້",
        "❌ Trade ທຸກ Breakout: ເລືອກ Key Level ທີ່ ສຳ ຄັນ",
        "❌ Stop Tight ເກີນ: ໃຫ້ Stop ຢູ່ ນອກ Pattern",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. Trend Following
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Trend Following: ເທຣດຕາມ Trend ວິທີທີ່ຊະນະໃນໄລຍະຍາວ",
    slug: { _type: "slug", current: "trend-following-strategy" },
    category: "education",
    excerpt: "The Trend is Your Friend ວິທີການ Trade ທີ່ ໃຊ້ Trend ເປັນ Guide ຖືກ ກວ່າ Counter-Trend ສະ ເໝີ ຮຽນຮູ້ Trend Following ໃຫ້ ຖືກ ຕ້ອງ",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("ເປັນຫຍັງ Trend Following ຈຶ່ງໄດ້ຜົນ?"),
      p("ຕະຫຼາດ Forex ມີ Trend ປະມານ 30% ຂອງເວລາ ແລະ Sideways ປະມານ 70% ແຕ່ Trend Phase ໃຫ້ Movement ທີ່ໃຫຍ່ທີ່ສຸດ Trend Follower ອົດທົນ ລໍ ຫຼັງຈາກ Trade ໃນ Trend ຈຶ່ງ ສາ ມາດ ທຳ ກຳ ໄລ ໄດ້ ດີ"),
      p("ນັກ Trade ມືອາຊີບ ທີ່ ດີ ທີ່ ສຸດ ໃນ ໂລກ ເຊັ່ນ Paul Tudor Jones, George Soros ຕ່າງ ໃຊ້ Trend Following ເປັນ Core Strategy"),

      h2("ກຳນົດ Trend ຢ່າງໃດ?"),
      h3("ວິທີ 1: Higher Highs & Higher Lows (Uptrend)"),
      p("Uptrend: ລາຄາ ສ້າງ Higher High (HH) ແລະ Higher Low (HL) ຕໍ່ ເນື່ອງ"),
      p("Downtrend: ລາຄາ ສ້າງ Lower High (LH) ແລະ Lower Low (LL) ຕໍ່ ເນື່ອງ"),
      p("Sideways: ບໍ່ ມີ Pattern ທີ່ ຊັດ ເຈນ"),

      h3("ວິທີ 2: Moving Average"),
      ...bullets([
        "ລາຄາ > MA200 Daily = Uptrend (Long-term)",
        "ລາຄາ < MA200 Daily = Downtrend",
        "MA50 > MA200 = Golden Cross = ສັນ ຍານ Bullish",
        "MA50 < MA200 = Death Cross = ສັນ ຍານ Bearish",
        "ລາ ຄາ ຢູ່ ເທິງ MA20 H4 = Short-term Uptrend",
      ]),

      h3("ວິທີ 3: ADX Indicator"),
      ...bullets([
        "ADX > 25: Trending Market ດີ ສຳ ລັບ Trend Following",
        "ADX > 40: Strong Trend",
        "ADX < 20: Sideways/Choppy ຫຼີກ ລ່ຽງ Trend Strategy",
        "+DI > -DI: Uptrend",
        "-DI > +DI: Downtrend",
      ]),

      h2("Trend Following Setup"),
      h3("Setup 1: Pullback Entry (ດີ ທີ່ ສຸດ)"),
      ...numbers([
        "ຢືນ ຢັນ Uptrend ດ້ວຍ HH/HL ໃນ Daily",
        "ລໍ Pullback ລົງ ມາ ຫາ MA20/MA50 ຫຼື Fibonacci 38-50%",
        "ຫາ Bullish Signal ໃນ H4: Hammer, Engulfing, Pin Bar",
        "Entry Buy ກັບ Stop ຕ່ຳ ກວ່າ Swing Low ຫຼ້າ ສຸດ",
        "Target: Previous High ຫຼື Fibonacci 127-161%",
      ]),

      h3("Setup 2: Breakout Entry"),
      ...numbers([
        "ຢືນ ຢັນ Trend",
        "ລໍ Consolidation / Pause ໃນ Trend",
        "Break ຈາກ Consolidation ດ້ວຍ Volume ສູງ",
        "Entry ຫຼັງ Break Confirm",
        "Stop ໃນ Consolidation Zone",
      ]),

      h2("Trailing Stop ເພີ່ມ ກຳ ໄລ"),
      p("Trailing Stop ຄື Stop Loss ທີ່ ເລື່ອນ ຕາມ ລາ ຄາ ເພື່ອ Lock ກຳ ໄລ ຂະ ນະ ທີ່ ຍັງ ຖື Trend:"),
      ...bullets([
        "ATR Trailing Stop: Stop = ລາ ຄາ - (ATR × 2-3)",
        "MA Trailing: ປິດ ເມື່ອ ລາ ຄາ Close ຕ່ຳ ກ ວ່ າ MA20 Daily",
        "Swing Low Trailing: ເລື່ອນ Stop ຂຶ້ນ ຕາມ ທຸກ Higher Low",
        "Parabolic SAR: ປ ່ ຽ ນ Dot ຂ້ ອ ງ = ອ ອ ກ Trade",
      ]),

      h2("Top-Down Analysis ສຳ ລັບ Trend Following"),
      ...numbers([
        "Monthly: ທິດ Trend ໃຫຍ່ USD ແຂງ ຫຼື ອ່ອນ?",
        "Weekly: Trend ຂອງ Pair ຫຼັກ",
        "Daily: Setup ຫຼັກ S/R ສຳ ຄັນ",
        "H4: Entry Signal ແລະ Pattern",
        "ຢ່າ Trade ຕ້ານ Trend ຂອງ Timeframe ທີ່ ສູງ ກ ວ່ າ",
      ]),

      h2("ຂໍ້ ຜິດ ພາດ ທົ່ວ ໄປ"),
      ...bullets([
        "❌ Trade ຕ້ານ Trend: Counter-Trend ຍາກ ກ ວ່ າ ສຳ ລັບ Beginner",
        "❌ ໂດດ ເຂົ້າ Trade ຕອນ Trend ໄດ້ ໄປ ຫຼາຍ ແລ້ວ: ລໍ Pullback",
        "❌ Stop Tight ໃນ Trending Market: Trend ດຶງ ກ ່ ອ ນ ຈ ຶ ່ ງ ວ ິ ່ ງ",
        "❌ ປ່ຽນ Direction ທຸກ ທີ Candle ກ ລ ັ ບ: ຕ້ອງ ເຊື່ອ ໃນ Trend",
        "❌ ບໍ່ ໃຊ້ Trailing Stop: ກຳ ໄລ ໃຫຍ່ ຫາຍ ໝົດ",
      ]),

      h2("ຕາຕະ ລາງ ກວດ ທຸກ ອາ ທິດ"),
      ...bullets([
        "ວັນ ຈັນ: ກວດ Weekly Candle, ກຳ ນົດ Bias ອາ ທິດ ນີ້",
        "ທຸກ ຄ່ຳ: ກວດ Daily Candle ແລ່ ນ ຕາມ ຫຼື ຕ້ານ Trend?",
        "ທຸກ H4 ໃໝ່: ກວດ Setup Pullback ຫຼື ບໍ່",
        "ວັນ ສຸກ: Review ທຸກ Position, ກຳ ນົດ Weekend Plan",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. News Trading
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "News Trading: ເທຣດ NFP, FOMC ໃຊ້ Strategy ໃດ?",
    slug: { _type: "slug", current: "news-trading-strategy" },
    category: "education",
    excerpt: "ຂ່າວ ເສດ ຖ ກິດ ສ່ງ ຜົນ ໃຫ້ ລາ ຄາ ເຄື່ອນ ໄຫວ ຮຸນ ແຮງ ຮຽນ ຮູ້ ວິ ທີ Trade ຂ່າວ NFP, FOMC, CPI ດ້ວຍ Strategy ທີ່ ປອດ ໄພ",
    readTime: 12,
    publishedAt: new Date().toISOString(),
    body: [
      h2("News Trading ແມ່ນ ຫຍັງ?"),
      p("News Trading ຄື ການ Trade ໂດຍ ໃຊ້ ຂ່າວ ເສດ ຖ ກິດ ເປັນ Catalyst ຂ່າວ ໃຫຍ່ ເຊັ່ນ NFP, FOMC, CPI ອາດ ທຳ ໃຫ້ ລາ ຄາ ເຄື່ອນ 100-500 Pips ໃນ ນາ ທີ ດຽວ"),
      p("ສຳ ລັບ Beginner: ຍຸດ ທະ ສາດ ທີ່ ດີ ທີ່ ສຸດ ຄື ຫຼີກ ລ່ຽງ ຂ່າວ ໃຫຍ່ ສຳ ລັບ Advanced: ໃຊ້ Specific Strategy ທີ່ ຄຳ ນຶງ ຄວາມ ສ່ຽງ ສູງ"),

      h2("ຂ່າວ ທີ່ ສ່ງ ຜົນ ສູງ ທີ່ ສຸດ"),
      h3("🇺🇸 NFP (Non-Farm Payroll)"),
      ...bullets([
        "ເວ ລາ: ທຸກ ວັນ ສຸກ ທຳ ອິດ ຂອງ ເດືອນ 19:30 ລາວ",
        "ສ່ງ ຜົນ: ທຸກ USD Pair ໂດຍ ສ ະ ເພາະ EUR/USD, USD/JPY, XAUUSD",
        "Actual > Forecast: USD ແຂງ",
        "Actual < Forecast: USD ອ່ອນ",
        "Movement ປົກ ກະ ຕິ: 50-150 Pips",
      ]),

      h3("🏦 FOMC Meeting"),
      ...bullets([
        "ເວ ລາ: ທຸກ 6 ອາ ທິດ 01:00-02:00 ລາວ",
        "ທີ່ ສຳ ຄັນ: ການ ຕັດ ສິນ ດອກ ເບ້ຍ ແລະ Statement",
        "ຂຶ້ນ ດອກ: USD ແຂງ",
        "ລົງ ດອກ: USD ອ່ອນ",
        "Hawkish Statement: USD ແຂງ",
        "Dovish Statement: USD ອ່ອນ",
      ]),

      h3("📊 CPI (Inflation)"),
      ...bullets([
        "ເວ ລາ: ທຸກ ເດືອນ ກາງ ເດືອນ 19:30 ລາວ",
        "CPI ສູງ ກ ວ່ າ ຄາດ: Fed ອາດ ຂຶ້ນ ດອກ → USD ແຂງ",
        "CPI ຕ່ຳ ກ ວ່ າ ຄາດ: Fed ອາດ ລົງ ດອກ → USD ອ່ອນ",
      ]),

      h2("ຍຸດ ທະ ສາດ News Trading"),
      h3("Strategy 1: Fade the Spike (ສຳ ລັບ Advanced)"),
      p("ຫຼັງ ຂ່າວ ອອກ ລາ ຄາ Spike ໄວ ຫຼາຍ ຄັ້ງ ລາ ຄາ ດຶງ ກ ລ ັ ບ ໃນ 5-15 ນາ ທີ:"),
      ...numbers([
        "ລໍ ຂ່າວ ອອກ ແລ້ວ ເບິ່ງ Spike Direction",
        "ລໍ Spike ສຸດ ເຫັນ Rejection Candle",
        "Fade (Trade ຕ້ານ Spike) ໃນ M5",
        "Stop ຢູ່ Spike High/Low",
        "Target: 50-80% Retrace ຂອງ Spike",
      ]),

      h3("Strategy 2: Trade the Trend After News"),
      p("ລໍ ຫຼັງ ຂ່າວ 30-60 ນາ ທີ ໃຫ້ ຕະ ຫຼາດ Calm ລົງ ແລ້ວ Trade ທາງ ທີ່ ຂ່າວ ສ່ງ ຜົນ:"),
      ...numbers([
        "NFP ດີ ກ ວ່ າ ຄາດ → USD ແຂງ → ຫາ Setup Sell EUR/USD",
        "ລໍ ຈາກ 20:00 ເຖິງ 21:00",
        "ຫາ Bearish Pattern ໃນ M15/H1",
        "Entry Sell ຢູ່ Resistance ໃໝ່",
        "Stop ຢູ່ Spike High",
      ]),

      h3("Strategy 3: ຫຼີກ ລ່ຽງ ຂ່າວ (ດີ ທີ່ ສຸດ ສຳ ລັບ Beginner)"),
      ...bullets([
        "ກວດ Economic Calendar ທຸກ ເຊົ້າ",
        "ບໍ່ Open Trade ໃໝ່ 30 ນາ ທີ ກ່ອນ Red News",
        "ຖ້າ ມີ Position ຢູ່ → Reduce Lot ຫຼື Close",
        "ລໍ ຫຼັງ ຂ່າວ 15-30 ນາ ທີ ກ່ອນ Trade",
        "Safe ທີ່ ສຸດ ສຳ ລັບ Beginner",
      ]),

      h2("ຄວາມ ສ່ຽງ ຂອງ News Trading"),
      ...bullets([
        "⚠️ Slippage: ລາ ຄາ Entry ອາດ ຫ່ າ ງ ຈາກ ທີ່ ຕ້ອງ ການ ຫຼາຍ",
        "⚠️ Spread ກ ວ້ າ ງ: Broker ຫຼາຍ ແຫ່ງ ຂະ ຫຍາຍ Spread ໃນ ຊ່ວງ ຂ່າວ",
        "⚠️ Stop Hunt: Spike ດຶງ Stop ກ່ອນ ແລ້ວ ກ ລ ັ ບ",
        "⚠️ Buy Rumor Sell Fact: ຂ່າວ ດີ ລາ ຄາ ຍັງ ລົງ ໄດ້",
        "⚠️ Market ຕ ີ ລາ ຄາ Ahead: ຂ່າວ ດີ ຖ ້ າ ຕ ່ ຳ ກ ວ່ າ ທີ່ ຄາດ ໄວ້ ຫຼາຍ → ລາ ຄາ ຂຶ້ນ",
      ]),

      h2("ສ ະ ຫ ລ ຸ ບ"),
      ...bullets([
        "Beginner: ຫຼີກ ລ່ຽງ Trade ໃນ ຊ່ວງ High Impact News",
        "Intermediate: ລໍ ຫຼັງ ຂ່າວ 30-60 ນາ ທີ Trade Trend",
        "Advanced: Fade the Spike ດ້ວຍ Risk Management ເຄັ່ງ ຄັດ",
        "ທຸກ Level: ກວດ Calendar ທຸກ ວັນ ຮູ້ ຂ່າວ ໃດ ກຳ ລັງ ຈະ ອອກ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. Mean Reversion
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Mean Reversion Strategy: ເທຣດ Overextended Market",
    slug: { _type: "slug", current: "mean-reversion-strategy" },
    category: "education",
    excerpt: "Mean Reversion ຄື ການ Trade ເມື່ອ ລາ ຄາ ໄດ້ ໄປ ໄກ ເກີນ ໄປ ຈາກ Average ແລ້ວ ຈະ ດຶງ ກ ລ ັ ບ ຮຽນ ຮູ້ ວິ ທີ ໃຊ້ RSI, Bollinger Bands ໃນ Strategy ນີ້",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Mean Reversion ແມ່ນ ຫຍັງ?"),
      p("Mean Reversion ອີງ ໃສ່ ທ ິ ດ ສ ະ ດ ີ ວ່ າ: ລາ ຄາ ທີ່ ໄດ້ ໄປ ໄກ ຈາກ 'ຄ່ າ ກ ານ' (Mean/Average) ມັກ ຈ ະ ດ ຶ ງ ກ ລ ັ ບ ຄ ື ນ ສ ູ ່ ຄ່ ານ ສ ະ ເ ໝ ີ"),
      p("ໃນ Sideways Market Mean Reversion ໄດ້ ຜົນ ດີ ຫຼາຍ ແຕ່ ໃນ Strong Trend ອາດ ຂາດ ທ ຶ ນ ຮ ຸ ນ ແ ຮ ງ"),

      h2("ເຄື່ອງ ມື Mean Reversion"),
      h3("1. RSI (Relative Strength Index)"),
      ...bullets([
        "RSI > 70: Overbought → ລາ ຄາ ອ າ ດ ລ ົ ງ (ໂອ ກາດ Sell)",
        "RSI < 30: Oversold → ລາ ຄາ ອ າ ດ ຂ ຶ ້ ນ (ໂອ ກາດ Buy)",
        "RSI ດ ີ ສ ຳ ລ ັ ບ Sideways Market",
        "ໃນ Strong Trend RSI ຢ ູ່ Overbought ດ ົ ນ ໄດ້",
        "ໃຊ້ RSI Divergence ຮ ່ ວ ມ ກ ັ ນ ດ ີ ກ ວ່ າ",
      ]),

      h3("2. Bollinger Bands"),
      ...bullets([
        "Upper Band: ລາ ຄາ ອ າ ດ ຖ ື ກ ດ ຶ ງ ກ ລ ັ ບ (Resistance))",
        "Lower Band: ລາ ຄາ ອ າ ດ ດ ຶ ງ ຂ ຶ ້ ນ (Support)",
        "Middle Band (MA20): Mean ທ ີ່ ລ າ ຄ າ ດ ຶ ງ ກ ລ ັ ບ ຫ າ",
        "Bandwidth ກ ວ້ າ ງ: Volatility ສ ູ ງ Reversal ອ ່ ອ ນ",
        "Bandwidth ແ ຄ ບ: Volatility ຕ ່ ຳ Reversal ແ ຮ ງ ກ ວ່ າ",
      ]),

      h3("3. Stochastic Oscillator"),
      ...bullets([
        "Stochastic > 80: Overbought",
        "Stochastic < 20: Oversold",
        "ດ ີ ກ ວ່ າ RSI ໃ ນ ຕ ະ ຫ ຼ າ ດ Sideways",
        "ໃຊ້ %K Cross %D ເ ປ ັ ນ Trigger",
      ]),

      h2("Mean Reversion Strategy Setup"),
      h3("Setup 1: RSI + S/R"),
      ...numbers([
        "ກຳ ນົດ ວ່ າ ຕ ະ ຫ ຼ າ ດ Sideways (ບ ໍ່ Trending)",
        "ລໍ RSI ຮ ອ ດ < 30 (Oversold) ຢ ູ່ Support",
        "ລໍ Bullish Candle Confirm (Pin Bar, Hammer)",
        "Entry Buy Stop ຕ ່ ຳ ກ ວ່ າ Candle Low",
        "Target: Middle Bollinger Band ຫ ຼ ື Resistance",
      ]),

      h3("Setup 2: Bollinger Band Bounce"),
      ...numbers([
        "ລໍ ລາ ຄາ ເ ດ ີ ນ ທ າງ ຫ າ Upper/Lower Band",
        "ລໍ Rejection Candle ທ ີ່ Band",
        "Entry ຕ ້ ານ ທ ິ ດ Band (Buy ທ ີ່ Lower, Sell ທ ີ່ Upper)",
        "Stop ຢ ູ່ ນ ອ ກ Band",
        "Target: Middle Band (MA20)",
      ]),

      h2("ເມື່ອ ໃດ ບ ໍ່ ຄວນ ໃຊ້ Mean Reversion"),
      ...bullets([
        "❌ Strong Trend: RSI Overbought ໃນ Strong Uptrend ໄດ້ ຕໍ່",
        "❌ ຫຼັງ ຂ່າວ ໃຫຍ່: Momentum ໃໝ່ ທຳ ໃຫ້ Mean Shift",
        "❌ Breakout Confirmed: ລາ ຄາ ທ ະ ລ ຸ ດ ້ ວ ຍ Volume ສ ູ ງ",
        "❌ New All-Time High: ບ ໍ່ ມ ີ Resistance ເ ກ ົ ່ າ",
      ]),

      h2("ສ ະ ຫ ຼ ຸ ບ"),
      p("Mean Reversion ເ ໝ າ ະ ໃ ນ Ranging/Sideways Market ໃ ນ ຕ ະ ຫ ຼ າ ດ Trending ໃ ຫ ້ ໃ ຊ ້ Trend Following ດ ີ ກ ວ່ າ ທ ົ ດ ລ ອ ງ ດ ້ ວ ຍ Demo ຈ ົ ນ ໝ ້ ັ ນ ໃ ຈ ກ່ ອ ນ Real"),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 6. Grid Trading
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Grid Trading Strategy: ຄວນໃຊ້ ຫຼື ຫຼີກລ່ຽງ?",
    slug: { _type: "slug", current: "grid-trading-explained" },
    category: "education",
    excerpt: "Grid Trading ຄື Strategy ທີ່ວາງ Order ເປັນ Grid ທັງ Buy ແລະ Sell ທຳກຳໄລຈາກການ Oscillate ຂອງລາຄາ ໃຊ້ໃນ EA ຂອງ LFT ດ້ວຍ",
    readTime: 13,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Grid Trading ແມ່ນ ຫຍັງ?"),
      p("Grid Trading ຄື Strategy ທີ່ ວາງ ຊຸດ ຂອງ Buy Orders ແລະ Sell Orders ໃນ ໄລ ຍະ ລາ ຄາ ທີ່ ກ ຳ ນົດ ໄວ້ ລ ່ ວ ງ ໜ ້ າ ຄ ື ດ ັ ່ ງ 'ຕາ ຂ່ າ ຍ' (Grid) ທ ີ່ ດ ັ ກ ລ າ ຄ າ"),
      p("ຕົວ ຢ່ າ ງ: EUR/USD ຢ ູ່ 1.0800 ວ າ ງ Buy ທ ຸ ກ 20 Pips ລ ົ ງ ໄ ປ ແ ລ ະ Sell ທ ຸ ກ 20 Pips ຂ ຶ ້ ນ ໄ ປ ເ ມ ື່ ອ ລ າ ຄ າ ເ ຄ ື່ ອ ນ ໄ ຫ ວ Order ໃ ດ ໜ ຶ ່ ງ ຈ ະ ຖ ື ກ ຕ ັ ດ ຢ ູ່ ສ ະ ເ ໝ ີ"),

      h2("ປ ະ ເ ພ ດ Grid Trading"),
      h3("1. Pure Grid (Neutral Grid)"),
      ...bullets([
        "ວາງ ທ ັ ງ Buy ແ ລ ະ Sell Order ຢ ່ າ ງ ສ ະ ເ ໝ ີ ກ ັ ນ",
        "ທ ຳ ກ ຳ ໄ ລ ຈ າ ກ ລ າ ຄ າ ທ ີ່ ແ ກ ວ ່ ງ (Ranging Market)",
        "ບ ໍ່ ຕ ້ ອ ງ ວ ິ ເ ຄ າ ະ ທ ິ ດ ທ າ ງ ລ າ ຄ າ",
        "ສ ່ ຽ ງ ເ ມ ື່ ອ ລ າ ຄ າ Trend ທ າ ງ ດ ຽ ວ",
      ]),

      h3("2. Directional Grid"),
      ...bullets([
        "ວາງ Grid ທ າ ງ ດ ຽ ວ (ສ ່ ວ ນ ໃ ຫ ຍ ່ Buy ໃ ນ Uptrend)",
        "ໃ ຊ ້ Trend Analysis ກ ຳ ນ ົ ດ ທ ິ ດ ທ າ ງ",
        "ຄ ວ າ ມ ສ ່ ຽ ງ ໜ ້ ອ ຍ ກ ວ່ າ Pure Grid ໃ ນ Trending Market",
        "EA SGride ຂ ອ ງ LFT ໃ ຊ ້ Directional Grid Strategy",
      ]),

      h2("ຂ ້ ໍ ດ ີ ຂ ອ ງ Grid Trading"),
      ...bullets([
        "✅ ທ ຳ ກ ຳ ໄ ລ ຈ າ ກ Ranging Market ທ ີ່ Trader ຫ ຼ າ ຍ ຄ ົ ນ ຂ າ ດ ທ ຶ ນ",
        "✅ ອ ັ ດ ຕ ະ ໂ ນ ມ ັ ດ: ບ ໍ່ ຕ ້ ອ ງ ເ ຝ ົ ້ າ Chart ຕ ລ ອ ດ",
        "✅ ບ ໍ່ ຕ ້ ອ ງ ວ ິ ເ ຄ າ ະ ທ ິ ດ ທ າ ງ ໃ ນ Pure Grid",
        "✅ ທ ຳ ກ ຳ ໄ ລ ທ ຸ ກ ວ ັ ນ ໃ ນ ຕ ະ ຫ ຼ າ ດ ທ ີ່ ແ ກ ວ ່ ງ",
      ]),

      h2("ຄ ວ າ ມ ສ ່ ຽ ງ ທ ີ່ ຕ ້ ອ ງ ຮ ູ ້"),
      ...bullets([
        "⚠️ Unlimited Loss Risk: ຖ ້ ານ ລ າ ຄ າ Trend ທ າ ງ ດ ຽ ວ Order ສ ່ ວ ນ ໜ ຶ ່ ງ ຂ າ ດ ທ ຶ ນ ຕ ລ ອ ດ",
        "⚠️ Margin Call: Grid ຫ ຼ າ ຍ Level + Leverage ສ ູ ງ = Margin Call ໄ ວ",
        "⚠️ ຕ ້ ອ ງ ທ ຶ ນ ຫ ຼ າ ຍ: ຕ ້ ອ ງ Buffer ທ ຶ ນ ພ ໍ ສ ຳ ລ ັ ບ ທ ຸ ກ Level",
        "⚠️ Black Swan Events: ຂ ່ າ ວ ໃ ຫ ຍ່ Trend ໄ ກ Wipe ທ ຸ ກ ອ ີ ກ",
      ]),

      h2("ວ ິ ທ ີ ໃ ຊ ້ Grid Trading ຢ ່ າ ງ ປ ອ ດ ໄ ພ"),
      ...numbers([
        "ທ ຶ ນ ພ ໍ: ຕ ້ ອ ງ ມ ີ Buffer ຢ ່ າ ງ ໜ ້ ອ ຍ 3 ເ ທ ົ ່ າ ຂ ອ ງ Initial Margin",
        "Grid Size ເ ໝ າ ະ ສ ົ ມ: ບ ໍ່ ແ ຄ ບ ເ ກ ີ ນ ໄ ປ (ໃ ຊ ້ ATR ກ ຳ ນ ົ ດ)",
        "ກ ຳ ນ ົ ດ Stop Loss: ມ ີ Maximum Loss ທ ີ່ ຍ ອ ມ ຮ ັ ບ ໄ ດ ້",
        "ໃ ຊ ້ ໃ ນ Pair ທ ີ່ Ranging: EUR/USD, GBP/USD ໃ ນ ຊ ່ ວ ງ Sideways",
        "Monitor ສ ະ ເ ໝ ີ: ກ ວ ດ ທ ຸ ກ ວ ັ ນ ຢ ່ ານ ປ ະ ໃ ຫ ້ ວ ິ ່ ງ ຕ ່ ຳ ກ ວ່ ານ ທ ຶ ນ",
      ]),

      h2("TheRocket EA SGride ຂ ອ ງ LFT"),
      p("TheRocket EA SGride ຂ ອ ງ LaoForexTrader ໃ ຊ ້ Directional Grid Strategy ທ ີ່ ມ ີ Risk Management ເ ຄ ັ່ ງ ຄ ັ ດ:"),
      ...bullets([
        "ໃ ຊ ້ Trend Filter ກ ່ ອ ນ ວ າ ງ Grid",
        "ມ ີ Maximum Drawdown Limit",
        "ທ ຳ ກ ຳ ໄ ລ +500% ໃ ນ 7 ເ ດ ືອ ນ ຈ າ ກ Live Account",
        "ຕ ິ ດ ຕ າ ມ ຜ ົ ນ ງ ານ Live ໄ ດ ້ ທ ີ່ ໜ ້ າ EA System",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 7. Carry Trade
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Carry Trade: ກຳໄລຈາກ Interest Rate Differential",
    slug: { _type: "slug", current: "carry-trade-strategy" },
    category: "education",
    excerpt: "Carry Trade ຄື Strategy ທີ່ ກ ຳ ໄ ລ ຈ າ ກ ສ ່ ວ ນ ຕ່ າ ງ ຂ ອ ງ ດ ອ ກ ເ ບ ້ ຍ ລ ະ ຫ ວ ່ ານ 2 ສ ະ ກ ຸ ນ ເ ງ ິ ນ ໂ ດ ຍ ກ ູ ້ ດ ອ ກ ເ ບ ້ ຍ ຕ ່ ຳ ລ ົ ງ ທ ຶ ນ ດ ອ ກ ເ ບ ້ ຍ ສ ູ ງ",
    readTime: 11,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Carry Trade ແມ່ນ ຫຍັງ?"),
      p("Carry Trade ຄ ື ການ ກ ູ ້ ເ ງ ິ ນ ໃ ນ ສ ະ ກ ຸ ນ ທ ີ່ ດ ອ ກ ເ ບ ້ ຍ ຕ ່ ຳ (ເ ຊ ່ ນ JPY) ແ ລ ະ ລ ົ ງ ທ ຶ ນ ໃ ນ ສ ະ ກ ຸ ນ ທ ີ່ ດ ອ ກ ເ ບ ້ ຍ ສ ູ ງ ກ ວ່ ານ (ເ ຊ ່ ນ AUD, NZD) ກ ຳ ໄ ລ ຄ ື ສ ່ ວ ນ ຕ ່ ານ ຂ ອ ງ ດ ອ ກ ເ ບ ້ ຍ + ການ ເ ຄ ື່ ອ ນ ໄ ຫ ວ ຂ ອ ງ ລ າ ຄ າ"),
      p("ໃ ນ Forex Carry Trade ສ ະ ແ ດ ງ ຜ ່ ານ Positive Swap ເ ທ ດ ຊ ່ ວ ງ ຄ ື ນ ທ ່ ານ ໄ ດ ້ ຮ ັ ບ ດ ອ ກ ເ ບ ້ ຍ ທ ຸ ກ ຄ ື ນ"),

      h2("Pair ທີ່ ໃ ຊ ້ Carry Trade"),
      ...bullets([
        "AUD/JPY: AUD ດ ອ ກ ສ ູ ງ JPY ດ ອ ກ ຕ ່ ຳ = Positive Swap ໃ ນ ການ Buy",
        "NZD/JPY: ຄ ້ າ ຍ AUD/JPY",
        "GBP/JPY: GBP ດ ອ ກ ສ ູ ງ ກ ວ່ ານ JPY",
        "USD/JPY: USD ດ ອ ກ ສ ູ ງ ກ ວ່ ານ JPY",
        "ກ ວ ດ Swap Rate ທ ່ ານ Broker ກ ່ ອ ນ ສ ະ ເ ໝ ີ",
      ]),

      h2("ວ ິ ທ ີ ຄ ຳ ນ ວ ນ Carry Trade ກ ຳ ໄ ລ"),
      p("ຕ ົ ວ ຢ ່ ານ: Buy AUD/JPY 1 Lot ດ ອ ກ AUD 4.35%, JPY 0.1%"),
      ...bullets([
        "Interest Rate Differential: 4.35% - 0.1% = 4.25% ຕ ໍ່ ປ ີ",
        "1 Lot AUD/JPY = 100,000 AUD",
        "Carry Income ຕ ໍ່ ປ ີ: 100,000 × 4.25% = $4,250",
        "ຕ ໍ່ ວ ັ ນ: $4,250 / 365 = $11.6/ວ ັ ນ",
        "ຕ ໍ່ ເ ດ ື ອ ນ: $11.6 × 30 = $348/ເ ດ ື ອ ນ",
      ]),

      h2("ຄ ວ າ ມ ສ ່ ຽ ງ Carry Trade"),
      ...bullets([
        "⚠️ ການ ປ ່ ຽ ນ ດ ອ ກ ເ ບ ້ ຍ: Fed ລ ົ ງ ດ ອ ກ = Carry Income ຫ ຼ ຸ ດ",
        "⚠️ Risk Off Events: ຕ ອ ນ Crisis ນ ັ ກ ລ ົ ງ ທ ຶ ນ Unwind Carry → JPY ແ ຂ ງ ຮ ຸ ນ ແ ຮ ງ",
        "⚠️ Currency Risk: ລ າ ຄ າ AUD/JPY ລ ົ ງ ກ ິ ນ Carry Income ທ ັ ງ ໝ ົ ດ",
        "⚠️ Leverage Risk: Margin Call ຖ ້ ານ ລ າ ຄ າ ໄ ປ ຕ ້ ານ",
      ]),

      h2("ໃ ຊ ້ Carry Trade ຢ ່ ານ ປ ອ ດ ໄ ພ"),
      ...numbers([
        "Trade ໃ ນ ທ ິ ດ ທ າ ງ Trend: ຊ ື ້ AUD/JPY ໃ ນ Uptrend ເ ທ ່ ານ ນ ັ້ ນ",
        "Leverage ຕ ່ ຳ: ໃ ຊ ້ 1:10 ຫ ຼ ື 1:20 ເ ທ ່ ານ ນ ັ້ ນ",
        "ຕ ິ ດ ຕ າ ມ Risk Sentiment: Risk On → Carry ດ ີ, Risk Off → ອ ອ ກ",
        "ກ ວ ດ Central Bank: ດ ອ ກ ຈ ະ ປ ່ ຽ ນ ໄ ໝ?",
        "Position ນ ້ ອ ຍ ໆ ຫ ຼ າ ຍ Pair: ກ ະ ຈ າ ຍ ຄ ວ າ ມ ສ ່ ຽ ງ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 8. DCA
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "DCA ໃນ Forex: ໃຊ້ Dollar-Cost Averaging ຢ່າງໃດ?",
    slug: { _type: "slug", current: "dca-dollar-cost-averaging" },
    category: "education",
    excerpt: "DCA (Dollar-Cost Averaging) ໃ ນ Forex ຄ ື ການ ແ ບ ່ ງ ຊ ື ້ ຫ ຼ າ ຍ ຄ ັ້ ງ ເ ພ ື່ ອ ເ ສ ລ ່ ຍ ລ າ ຄ າ Entry ແ ຕ ່ ບ ໍ່ ຄ ື DCA ໃ ນ Crypto/ຫ ຸ ້ ນ ຕ ້ ອ ງ ໃ ຊ ້ ຢ ່ ານ ລ ະ ວ ັ ງ",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("DCA ໃ ນ Forex ຕ ່ ານ ກ ັ ນ ກ ັ ບ Crypto/ຫ ຸ ້ ນ"),
      p("DCA (Dollar-Cost Averaging) ໃ ນ ຕ ະ ຫ ຼ າ ດ ຫ ຸ ້ ນ/Crypto: ຊ ື ້ ທ ຸ ກ ເ ດ ື ອ ນ ໂ ດ ຍ ກ ໍ ່ ລ ້ ວ ຍ ລ າ ຄ າ ໃ ດ ກ ໍ ່ ຕ າ ມ ຍ ້ ອ ນ Asset ມ ີ ທ ຸ ກ ໂ ຕ ໃ ນ ໄ ລ ຍ ະ ຍ ານ"),
      p("DCA ໃ ນ Forex: ຕ ່ ານ ກ ັ ນ! ໃ ນ Forex ລ າ ຄ າ ບ ໍ່ ໄ ດ ້ ໄ ປ ທ າ ງ ດ ຽ ວ ສ ະ ເ ໝ ີ ການ ຊ ື ້ ເ ພ ີ ່ ມ ໃ ນ ທ າ ງ ທ ີ່ ຂ າ ດ ທ ຶ ນ ບ ໍ່ ໄ ດ ້ ຜ ົ ນ ສ ະ ເ ໝ ີ"),

      h2("ເ ມ ື່ ອ ໃ ດ DCA ໃ ນ Forex ໄ ດ ້ ຜ ົ ນ?"),
      ...bullets([
        "✅ ໃ ນ Strong Uptrend: ຊ ື ້ ເ ພ ີ ່ ມ ທ ຸ ກ Pullback",
        "✅ ຢ ູ່ Key Support: ຫ ຼ າ ຍ Level ທ ີ່ S/R ສ ຳ ຄ ັ ນ",
        "✅ ດ ້ ວ ຍ Pyramid: ຊ ື ້ Lot ໃ ຫ ຍ ່ ທ ຳ ອ ິ ດ ຊ ື ້ ໜ ້ ອ ຍ ລ ົ ງ ທ ຸ ກ Level",
        "✅ ກ ຳ ນ ົ ດ Max Position: ສ ູ ງ ສ ຸ ດ ຈ ະ ຊ ື ້ ທ ຳ ໝ ົ ດ",
      ]),

      h2("ວ ິ ທ ີ DCA ທ ີ່ ຖ ູ ກ ຕ ້ ອ ງ"),
      h3("Pyramid Strategy (DCA ທ ີ ່ ດ ີ ທ ີ ່ ສ ຸ ດ)"),
      ...numbers([
        "ຢ ືນ ຢ ັ ນ Uptrend ໃ ນ Daily",
        "Entry ທ ຳ ອ ິ ດ 0.3 Lot ຢ ູ່ Support ທ ຳ ອ ິ ດ",
        "ຖ ້ ານ ລ າ ຄ າ ລ ົ ງ ຮ ອ ດ Support ຕ ໍ ່ ໄ ປ ຊ ື ້ ເ ພ ີ ່ ມ 0.2 Lot",
        "Support ສ ຸ ດ ທ ້ າ ຍ ຊ ື ້ 0.1 Lot (Lot ໜ ້ ອ ຍ ລ ົ ງ ທ ຸ ກ Level)",
        "Stop Loss ລ ວ ມ ທ ຸ ກ Position ຢ ູ່ ຕ ່ ຳ ກ ວ່ ານ Support ສ ຸ ດ ທ ້ າ ຍ",
      ]),

      h2("DCA ທ ີ ່ ຜ ິ ດ — Martingale"),
      p("Martingale ຄ ື ການ Double Lot ທ ຸ ກ ຄ ັ ້ ງ ທ ີ ່ ຂ າ ດ ທ ຶ ນ:"),
      ...bullets([
        "❌ 0.1 → 0.2 → 0.4 → 0.8 → 1.6 Lot ຂ ຶ ້ ນ ໄ ປ ເ ລ ື ່ ອ ຍ ໆ",
        "❌ Streak ຂ າ ດ ທ ຶ ນ 10 ຄ ັ ້ ງ ທ ຶ ນ ໝ ົ ດ!",
        "❌ Strategy ນ ີ ້ Blow ທ ຶ ນ ໃ ນ ທ ີ ່ ສ ຸ ດ ສ ະ ເ ໝ ີ",
        "❌ EA ຫ ຼ າ ຍ ໂ ຕ ທ ີ ່ ຂ າ ຍ ໃ ຊ ້ Martingale ລ ະ ວ ັ ງ!",
      ]),

      h2("DCA vs Single Entry"),
      ...bullets([
        "DCA ໃ ນ Trend: ເ ສ ລ ່ ຍ ລ າ ຄ າ Entry ດ ີ ກ ວ່ ານ ຊ ື ້ ຈ ຸ ດ ດ ຽ ວ ຜ ິ ດ",
        "Single Entry ທ ີ ່ ດ ີ: Risk ໜ ້ ອ ຍ ກ ວ່ ານ DCA (ຕ ້ ອ ງ ກ ຳ ນ ົ ດ Stop ຊ ັ ດ ເ ຈ ນ)",
        "DCA ໃ ນ Sideways: ສ ່ ຽ ງ ຫ ຼ າ ຍ ລ າ ຄ າ ຍ ັ ງ ລ ົ ງ ໄ ດ ້ ຕ ໍ ່",
        "ສ ຳ ລ ັ ບ Beginner: Single Entry + Stop Loss ງ ່ ານ ກ ວ່ ານ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 9. Position Trading
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Position Trading: ຖື Order ຫຼາຍ ອາທິດ ຫຼື ເດືອນ",
    slug: { _type: "slug", current: "position-trading-longterm" },
    category: "education",
    excerpt: "Position Trading ຄ ື Style ການ Trade ທ ີ ່ ຖ ື Position ຍ ານ ທ ີ ່ ສ ຸ ດ ເ ໝ ານ ະ ການ ລ ົ ງ ທ ຶ ນ ຫ ຼ ານ ກ ວ່ ານ Trading ຕ ້ ອ ງ ກ ານ ທ ຶ ນ ຫ ຼ ານ ຄ ວ າ ມ ອ ົ ດ ທ ົ ນ ສ ູ ງ",
    readTime: 10,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Position Trading ແມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Position Trading ຄ ື Style ທ ີ ່ ຖ ື Trade ຈ າ ກ ຫ ຼ າ ຍ ອ ານ ທ ິ ດ ຮ ອ ດ ຫ ຼ າ ຍ ເ ດ ື ອ ນ ຫ ຼ ື ບ ານ ທ ີ ເ ບ ີ ້ ງ ໃ ສ ່ Macro Trend ທ າ ງ ດ ້ ານ ເ ສ ດ ຖ ກ ິ ດ ຂ ອ ງ ປ ະ ເ ທ ດ ຫ ຼ ື ພ າ ກ ພ ື ້ ນ"),
      p("ຕ ົ ວ ຢ ່ ານ: ຄ ານ ໄ ດ ້ ວ ່ ານ Fed ຈ ະ ຂ ຶ ້ ນ ດ ອ ກ ຕ ລ ອ ດ ປ ີ → Buy USD/JPY ຖ ື ຫ ຼ າ ຍ ເ ດ ື ອ ນ"),

      h2("ຕ ານ ກ ັ ນ ກ ັ ບ Style ອ ື ່ ນ"),
      ...bullets([
        "Scalping: ວ ິ ນ າ ທ ີ - ນ ານ ທ ີ, 5-30 Pips",
        "Day Trading: ໃ ນ ວ ັ ນ ດ ຽ ວ, 20-80 Pips",
        "Swing Trading: 2-7 ວ ັ ນ, 50-200 Pips",
        "Position Trading: ອ ານ ທ ິ ດ-ເ ດ ື ອ ນ, 200-2000+ Pips",
      ]),

      h2("ເ ຄ ື ່ ອ ງ ມ ື Position Trader"),
      h3("Fundamental Analysis (ສ ຳ ຄ ັ ນ ທ ີ ່ ສ ຸ ດ)"),
      ...bullets([
        "Interest Rate Policy: ທ ະ ນ ານ ຄ ານ ກ ານ ຂ ຶ ້ ນ/ລ ົ ງ ດ ອ ກ?",
        "GDP Growth: ເ ສ ດ ຖ ກ ິ ດ ຂ ອ ງ ປ ະ ເ ທ ດ ດ ີ ຂ ຶ ້ ນ ຫ ຼ ື ຊ ້ ານ?",
        "Inflation Trends: CPI ຢ ູ່ ລ ະ ດ ັ ບ ໃ ດ?",
        "Trade Balance: ໄ ດ ້ ດ ຸ ນ ຫ ຼ ື ຂ າ ດ ດ ຸ ນ?",
        "Political Stability: ໝ ້ ັ ນ ຄ ົ ງ ຫ ຼ ື ບ ໍ ່?",
      ]),

      h3("Technical Analysis (ສ ຳ ລ ັ ບ Entry/Exit)"),
      ...bullets([
        "Weekly/Monthly Chart: Trend ຫ ຼ ັ ກ",
        "Key S/R ໃ ນ Weekly: ຈ ຸ ດ Entry ໃ ຫ ຍ ່",
        "MA200 Daily: ທ ິ ດ ທ ານ Long-term",
        "Fibonacci: ຊ ອ ກ Retracement ສ ຳ ລ ັ ບ Entry",
      ]),

      h2("ຕ ົ ວ ຢ ່ ານ Position Trade"),
      p("ສ ະ ຖ ານ ກ ານ: ປ ີ 2022-2023 Fed ຂ ຶ ້ ນ ດ ອ ກ ຕ ລ ອ ດ, BOJ ບ ໍ ່ ຂ ຶ ້ ນ ດ ອ ກ"),
      ...numbers([
        "FA: USD ຈ ະ ແ ຂ ງ ກ ວ່ ານ JPY ຍ ້ ອ ນ ສ ່ ວ ນ ຕ ່ ານ ດ ອ ກ ເ ບ ້ ຍ",
        "TA: USD/JPY ຢ ູ່ ເ ທ ິ ງ MA200, Weekly Uptrend ຊ ັ ດ ເ ຈ ນ",
        "Entry: Buy USD/JPY ທ ີ ່ 130.00",
        "Stop: ຕ ່ ຳ ກ ວ່ ານ 125.00 (500 Pips)",
        "Target: 150.00 (2000 Pips) ໃ ຊ ້ ເ ວ ລ ານ 12-18 ເ ດ ື ອ ນ",
      ]),

      h2("ຄ ວ າ ມ ສ ່ ຽ ງ Position Trading"),
      ...bullets([
        "⚠️ Swap ຄ ່ ານ ທ ຳ ນ ຽ ມ ຂ ້ ານ ຄ ື ນ: ສ ະ ສ ົ ມ ຫ ຼ ານ ໃ ນ ໄ ລ ຍ ະ ຍ ານ",
        "⚠️ Capital Tie-Up: ທ ຶ ນ ຖ ື ກ ຜ ູ ກ ຂ ານ ດ ໂ ດ ຍ Margin",
        "⚠️ Black Swan: ຂ ່ ານ ໃ ຫ ຍ ່ Reverse Trend",
        "⚠️ ຕ ້ ອ ງ ທ ຶ ນ ຫ ຼ ານ: Stop ຫ ຼ ານ Pips = ຕ ້ ອ ງ Buffer",
      ]),

      h2("ສ ະ ຫ ຼ ຸ ບ"),
      ...bullets([
        "Position Trading ເ ໝ ານ ະ Investor ຫ ຼ ານ ກ ວ່ ານ Trader",
        "ຕ ້ ອ ງ ຮ ູ ້ Fundamental Analysis ດ ີ",
        "ທ ຶ ນ ຫ ຼ ານ + Leverage ຕ ່ ຳ + ຄ ວ າ ມ ອ ົ ດ ທ ົ ນ ສ ູ ງ",
        "ໄ ດ ້ ຜ ົ ນ ດ ີ ໃ ນ ຊ ່ ວ ງ ຕ ະ ຫ ຼ ານ Trending ໄ ລ ຍ ານ ຍ ານ",
      ]),
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 10. Trading Plan
  // ────────────────────────────────────────────────────────────
  {
    _type: "article",
    title: "Trading Plan ຕົວຢ່ານ: ລ້ຽງຊີບຈາກ Forex ຢ່ານ Systematic",
    slug: { _type: "slug", current: "trading-plan-template" },
    category: "education",
    excerpt: "Trading Plan ຄ ື ສ ິ ່ ງ ທ ີ ່ ແ ຍ ກ Professional Trader ກ ັ ບ Gambler ຮ ຽ ນ ຮ ູ ້ ວ ິ ທ ີ ສ ້ ານ Trading Plan ທ ີ ່ ໃ ຊ ້ ໄ ດ ້ ຈ ິ ງ",
    readTime: 15,
    publishedAt: new Date().toISOString(),
    body: [
      h2("Trading Plan ແ ມ ່ ນ ຫ ຍ ັ ງ?"),
      p("Trading Plan ຄ ື ເ ອ ກ ະ ສ ານ ທ ີ ່ ກ ຳ ນ ົ ດ ທ ຸ ກ ດ ້ ານ ຂ ອ ງ ການ Trade ຂ ອ ງ ທ ່ ານ ຢ ່ ານ ຊ ັ ດ ເ ຈ ນ ມ ັ ນ ຄ ື ກ ົ ດ ສ ານ ທ ່ ານ ເ ອ ງ ທ ີ ່ ທ ່ ານ ຕ ້ ອ ງ ປ ະ ຕ ິ ບ ັ ດ ຕ ານ ທ ຸ ກ ກ ານ"),
      p("Trader ທ ີ ່ ປ ະ ສ ົ ບ ຄ ວ າ ມ ສ ຳ ເ ລ ັ ດ 100% ມ ີ Trading Plan ທ ີ ່ ຊ ັ ດ ເ ຈ ນ Trader ທ ີ ່ ຂ ານ ທ ຶ ນ ສ ່ ວ ນ ໃ ຫ ຍ ່ ທ ີ ່ ສ ຸ ດ Trade ໂ ດ ຍ Emotion ບ ໍ ່ ມ ີ Plan"),

      h2("ສ ່ ວ ນ ປ ະ ກ ອ ບ ຂ ອ ງ Trading Plan"),
      h3("1. Market ແ ລ ະ Timeframe"),
      ...bullets([
        "ຂ ້ ອ ຍ Trade: EUR/USD, XAUUSD (ເ ລ ື ອ ກ 1-3 Pair ເ ທ ່ ານ ນ ັ ້ ນ)",
        "Timeframe ຫ ຼ ັ ກ: H4 (Swing Trading)",
        "Timeframe Entry: H1",
        "Session: London-NY Overlap (19:00-23:00 ລ ານ)",
      ]),

      h3("2. Strategy ທ ີ ່ ໃ ຊ ້"),
      ...bullets([
        "Strategy: Trend Following + Pullback Entry",
        "ເ ຂ ົ ້ ານ ຕ ່ ານ ເ ມ ື ່ ອ: Daily Uptrend + H4 Pullback ຮ ອ ດ MA50 + Bullish Candle",
        "ບ ໍ ່ Trade ເ ມ ື ່ ອ: ADX < 20, ກ່ ອ ນ Red News 30 ນ ານ ທ ີ",
        "ຊ ອ ກ Setup ຫ ຼ ານ ທ າ ງ Top-Down: Weekly → Daily → H4",
      ]),

      h3("3. Entry Rules"),
      ...numbers([
        "Daily Trend ຊ ັ ດ ເ ຈ ນ (HH/HL ຫ ຼ ື ລ ານ ຄ ານ > MA200)",
        "H4 Pullback ຮ ອ ດ MA50 ຫ ຼ ື Fibonacci 38-61.8%",
        "RSI H4 ຕ ່ ຳ ກ ວ່ ານ 50 (ອ ່ ອ ນ ກ ວ່ ານ ປ ົ ກ ກ ະ ຕ ິ)",
        "Bullish Candle Pattern ໃ ນ H1 (Hammer, Engulfing)",
        "Volume ຂ ຶ ້ ນ ໃ ນ Candle Entry",
      ]),

      h3("4. Exit Rules"),
      ...bullets([
        "Stop Loss: ຕ ່ ຳ ກ ວ່ ານ Swing Low ຫ ຼ ່ ານ ສ ຸ ດ + 5 Pips Buffer",
        "Take Profit 1 (50%): Previous High ຫ ຼ ື R:R 1:1.5",
        "Take Profit 2 (50%): Fibonacci 161.8% ຫ ຼ ື Trailing Stop",
        "Trailing Stop: ເ ລ ື ່ ອ ນ ຕ ານ ທ ຸ ກ Higher Low",
        "ອ ອ ກ ທ ຸ ກ Position ຖ ້ ານ Daily Close ຕ ່ ຳ ກ ວ່ ານ MA50",
      ]),

      h3("5. Risk Management"),
      ...bullets([
        "Risk ຕ ໍ ່ Trade: 1% ຂ ອ ງ Account",
        "Maximum Open Trades: 3",
        "Maximum Daily Loss: 2% → ຢ ຸ ດ Trade ວ ັ ນ ນ ັ ້ ນ",
        "Maximum Weekly Loss: 4% → ພ ັ ກ ຈ ົ ນ ຮ ອ ດ ອ ານ ທ ິ ດ ໜ ້ ານ",
        "Leverage ໃ ຊ ້ ສ ູ ງ ສ ຸ ດ: 1:100 (ໃ ຊ ້ Lot ໜ ້ ອ ຍ)",
      ]),

      h3("6. ຕ ານ ຕ ານ ລ ານ ປ ະ ຈ ຳ ວ ັ ນ"),
      ...bullets([
        "06:30: ກ ວ ດ ຂ ່ ານ ເ ສ ດ ຖ ກ ິ ດ ແ ລ ະ Economic Calendar",
        "07:00: ວ ິ ເ ຄ ານ ະ Daily/H4 Chart ຫ ານ Setup",
        "ຕ ລ ອ ດ ວ ັ ນ: ກ ວ ດ Position ທ ຸ ກ 4 ຊ ົ ່ ວ ໂ ມ ງ",
        "19:00: ເ ລ ີ ່ ມ Active Trading Session",
        "22:00: ກ ວ ດ ທ ຸ ກ Trade ກ ຳ ນ ົ ດ ການ ສ ຳ ລ ັ ບ ຄ ່ ຳ ຄ ື ນ",
        "23:30: ບ ັ ນ ທ ຶ ກ Trading Journal",
      ]),

      h3("7. Trading Journal"),
      ...bullets([
        "Date/Time: ວ ັ ນ ທ ີ ເ ວ ລ ານ Entry/Exit",
        "Pair & Direction: EUR/USD Long",
        "Setup: ເ ຫ ດ ຜ ົ ນ ທ ີ ່ Trade",
        "Entry/SL/TP: ລ ານ ຄ ານ ຊ ັ ດ ເ ຈ ນ",
        "Result: P&L ຂ ອ ງ Trade ນ ີ ້",
        "Lesson: ຮ ຽ ນ ຮ ູ ້ ຫ ຍ ັ ງ ຈ ານ ກ Trade ນ ີ ້?",
      ]),

      h2("Trading Plan Template ສ ຳ ລ ັ ບ Beginner"),
      p("ດ ານ ວ ໂ ຫ ຼ ດ Template ໄ ດ ້ ທ ີ ່ ໂ ຕ ກ ານ Telegram LFT ຫ ຼ ື ສ ານ ງ ົ ນ Plan ຂ ອ ງ ທ ່ ານ ເ ອ ງ ໂ ດ ຍ ໃ ຊ ້ Template ຂ ານ ງ ເ ທ ິ ງ ນ ີ ້"),
      ...bullets([
        "ໃ ຊ ້ Google Docs ຫ ຼ ື Notion ເ ຮ ັ ດ Plan ຂ ອ ງ ທ ່ ານ",
        "ອ ່ ານ Plan ທ ຸ ກ ເ ຊ ົ ້ ານ ກ ່ ອ ນ ເ ລ ີ ່ ມ Trade",
        "Review ທ ຸ ກ ເ ດ ື ອ ນ ປ ຽ ນ ສ ິ ່ ງ ທ ີ ່ ບ ໍ ່ ໄ ດ ້ ຜ ົ ນ",
        "ຢ ່ ານ Trade ນ ອ ກ Plan ສ ະ ເ ໝ ີ",
      ]),
    ],
  },
]

async function importArticles() {
  console.log("🚀 ເລີ ່ ມ ນ ຳ ເ ຂ ົ ້ ານ Batch 2 (10 ບ ົ ດ ຮ ຽ ນ)...")
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
