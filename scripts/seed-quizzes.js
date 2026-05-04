// seed-quizzes.js
// ນຳເຂົ້າ Quiz ທຸກ 6 ໊ ຫ ົ ວ ຂ ້ ໍ ໄ ປ Sanity
// ວິທີໃຊ້: node scripts/seed-quizzes.js

const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "f8cr9afb",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const quizzes = [
  {
    "title": "Quiz 1: Forex ພື້ນຖານ",
    "slug": "q1",
    "level": "basic",
    "requiresLogin": false,
    "order": 1,
    "icon": "🌱",
    "color": "10B981",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Forex ຫຍໍ້ມາຈາກຫຍັງ?",
        "choices": {
          "a": "Foreign Exchange",
          "b": "Forward Exchange",
          "c": "Financial Exchange"
        },
        "correctAnswer": "a"
      },
      {
        "question": "ຕະຫຼາດ Forex ເປີດກຈັກຊົ່ວໂມງຕໍ່ວັນ?",
        "choices": {
          "a": "12 ຊົ່ວໂມງ",
          "b": "18 ຊົ່ວໂມງ",
          "c": "24 ຊົ່ວໂມງ"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Currency Pair EUR/USD ແມ່ນຫຍັງ?",
        "choices": {
          "a": "EUR ຄື Base, USD ຄື Quote",
          "b": "USD ຄື Base, EUR ຄື Quote",
          "c": "ທັງສອງເທົ່າກັນ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Pip ໃນ EUR/USD ແມ່ນຫຍັງ?",
        "choices": {
          "a": "0.001",
          "b": "0.0001",
          "c": "0.01"
        },
        "correctAnswer": "b"
      },
      {
        "question": "1 Standard Lot ເທົ່າກັບເທົ່າໃດ?",
        "choices": {
          "a": "10,000 Units",
          "b": "100,000 Units",
          "c": "1,000 Units"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Leverage 1:100 ໝາຍຄວາມວ່າແນວໃດ?",
        "choices": {
          "a": "ທຶນ $1 ຄວບຄຸມ $10",
          "b": "ທຶນ $1 ຄວບຄຸມ $100",
          "c": "ທຶນ $1 ຄວບຄຸມ $1,000"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Bid Price ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ລາຄາທີ່ທ່ານ Buy",
          "b": "ລາຄາທີ່ທ່ານ Sell",
          "c": "ລາຄາກາງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Spread ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ກຳໄລຂອງ Broker",
          "b": "ສ່ວນຕ່າງ Ask-Bid",
          "c": "ຄ່າ Commission"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Long Position ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ຄາດລາຄາລົງ",
          "b": "ຄາດລາຄາຂຶ້ນ",
          "c": "ຖື Position ດົນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຕະຫຼາດ Forex ມູນຄ່າຕໍ່ວັນເທົ່າໃດ?",
        "choices": {
          "a": "$1 ລ້ານລ້ານ",
          "b": "$7.5 ລ້ານລ້ານ",
          "c": "$500 ພັນລ້ານ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Stop Loss ໃຊ້ເພື່ອຫຍັງ?",
        "choices": {
          "a": "ເພີ່ມກຳໄລ",
          "b": "ຈຳກັດຄວາມສ່ຽງ",
          "c": "ຫຼຸດ Spread"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Major Pair ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Pair ທີ່ມີ USD",
          "b": "Pair ທີ່ນິຍົມທີ່ສຸດ",
          "c": "ທັງສອງຂໍ້"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Take Profit ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ຈຸດເລີ່ມຕົ້ນ Trade",
          "b": "ຈຸດອອກກຳໄລ",
          "c": "ຈຸດຂາດທຶນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Demo Account ດີຢ່າງໃດ?",
        "choices": {
          "a": "ໃຊ້ເງິນຈິງ",
          "b": "ທົດສອບໂດຍບໍ່ສ່ຽງ",
          "c": "ກຳໄລໄດ້ຈິງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Margin Call ເກີດຂຶ້ນເມື່ອໃດ?",
        "choices": {
          "a": "ກຳໄລສູງ",
          "b": "ທຶນໃກ້ໝົດ",
          "c": "Trade ຫຼາຍເກີນ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 2: Candlestick ພື້ນຖານ",
    "slug": "q2",
    "level": "basic",
    "requiresLogin": false,
    "order": 2,
    "icon": "🌱",
    "color": "10B981",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Candlestick ມີຂໍ້ມູນຈັກຢ່າງ?",
        "choices": {
          "a": "2 (Open, Close)",
          "b": "3 (Open, High, Close)",
          "c": "4 (Open, High, Low, Close)"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Candle ສີຂຽວໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ລາຄາລົງ",
          "b": "ລາຄາຂຶ້ນ",
          "c": "ລາຄາ Flat"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Doji ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ຕະຫຼາດຂຶ້ນແຮງ",
          "b": "ຕະຫຼາດລັງເລ",
          "c": "ຕະຫຼາດລົງແຮງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Hammer ເກີດຫຼັງ Trend ໃດ?",
        "choices": {
          "a": "Uptrend",
          "b": "Sideways",
          "c": "Downtrend"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Shooting Star ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bullish Reversal",
          "b": "Bearish Reversal",
          "c": "Continuation"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Engulfing Pattern ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Candle ໜຶ່ງກິນ Candle ກ່ອນ",
          "b": "Candle ດຽວກັນ",
          "c": "Candle ນ້ອຍລົງ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Wick/Shadow ຄືສ່ວນໃດ?",
        "choices": {
          "a": "ສ່ວນ Body",
          "b": "ເສັ້ນເທິງລຸ່ມ",
          "c": "ສີຂອງ Candle"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Morning Star ມີຈັກ Candle?",
        "choices": {
          "a": "1",
          "b": "2",
          "c": "3"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Spinning Top ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Trend ຊັດເຈນ",
          "b": "ຕະຫຼາດລັງເລ",
          "c": "Breakout"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Pin Bar ທີ່ດີ Wick ຕ້ອງຍາວກວ່າ Body ຈັກເທົ່າ?",
        "choices": {
          "a": "1 ເທົ່າ",
          "b": "2 ເທົ່າ",
          "c": "3 ເທົ່າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Evening Star ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bullish",
          "b": "Bearish",
          "c": "Sideways"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Inside Bar ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Breakout ແຮງ",
          "b": "ຕະຫຼາດ Compress",
          "c": "Trend ຊັດເຈນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Marubozu ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Candle ທີ່ບໍ່ມີ Wick",
          "b": "Candle ດຳ",
          "c": "Candle ນ້ອຍ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Three White Soldiers ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bearish",
          "b": "Bullish ແຮງ",
          "c": "Reversal ລົງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Timeframe ໃດໜ້າເຊື່ອຖືທີ່ສຸດ?",
        "choices": {
          "a": "M1",
          "b": "M15",
          "c": "H4/Daily"
        },
        "correctAnswer": "c"
      }
    ]
  },
  {
    "title": "Quiz 3: Support & Resistance",
    "slug": "q3",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 3,
    "icon": "⚡",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Support ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ລາຄາສູງສຸດ",
          "b": "ລະດັບທີ່ລາຄາມັກຢຸດລົງ",
          "c": "ເສັ້ນ Trend"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Role Reversal ແມ່ນຫຍັງ?",
        "choices": {
          "a": "S/R ປ່ຽນໜ້າທີ່",
          "b": "Trend ປ່ຽນ",
          "c": "Pattern ກັບ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Key Level ທີ່ດີຄວນ Reject ຢ່າງໜ້ອຍຈັກຄັ້ງ?",
        "choices": {
          "a": "1 ຄັ້ງ",
          "b": "2+ ຄັ້ງ",
          "c": "5+ ຄັ້ງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Breakout ທີ່ໜ້າເຊື່ອຖືຕ້ອງມີຫຍັງ?",
        "choices": {
          "a": "Candle ນ້ອຍ",
          "b": "Volume ສູງ",
          "c": "Wick ຍາວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "False Breakout ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Break ຈິງ",
          "b": "Break ແລ້ວກັບ",
          "c": "Trend ໃໝ່"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Round Number ໃດສຳຄັນສຳລັບ EUR/USD?",
        "choices": {
          "a": "1.0750",
          "b": "1.1000",
          "c": "1.0823"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Resistance ທີ່ຖືກ Break ຂຶ້ນກາຍເປັນຫຍັງ?",
        "choices": {
          "a": "Resistance ໃໝ່",
          "b": "Support",
          "c": "ບໍ່ປ່ຽນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "S/R Zone ດີກວ່າ S/R Line ຢ່າງໃດ?",
        "choices": {
          "a": "ລະອຽດກວ່າ",
          "b": "ກວ້າງກວ່າຍອມຮັບ Noise",
          "c": "ງ່າຍກວ່າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Timeframe ໃດ S/R ໜ້າເຊື່ອຖື?",
        "choices": {
          "a": "M5",
          "b": "H1",
          "c": "Daily"
        },
        "correctAnswer": "c"
      },
      {
        "question": "ຄວນວາງ Stop Loss ໄວ້ຈຸດໃດ?",
        "choices": {
          "a": "ໃນ Zone",
          "b": "ນອກ Zone",
          "c": "ຈຸດ Entry"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Previous High ຂອງອາທິດມີຄວາມສຳຄັນຢ່າງໃດ?",
        "choices": {
          "a": "ທຳມະດາ",
          "b": "ເປັນ Key Level",
          "c": "ບໍ່ສຳຄັນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Confluence ໃນ Trading ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ສັນຍານດຽວ",
          "b": "ຫຼາຍສັນຍານຢູ່ດຽວກັນ",
          "c": "Trend ດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ATH (All-Time High) ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Average High",
          "b": "ລາຄາສູງສຸດຕະຫຼອດການ",
          "c": "ລາຄາສູງວັນນີ້"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Entry ຢູ່ໃດດີທີ່ສຸດ?",
        "choices": {
          "a": "ໄກ S/R",
          "b": "ທີ່ S/R + Confirm",
          "c": "ທຸກທີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Retest ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ທົດສອບ System",
          "b": "ລາຄາກັບມາທົດສອບ Level",
          "c": "ສ້າງໃໝ່"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 4: Indicators & Tools",
    "slug": "q4",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 4,
    "icon": "⚡",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "MA200 ໃຊ້ເພື່ອຫຍັງ?",
        "choices": {
          "a": "Entry Signal",
          "b": "ດູ Long-term Trend",
          "c": "ວັດ Volume"
        },
        "correctAnswer": "b"
      },
      {
        "question": "RSI > 70 ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Oversold",
          "b": "Overbought",
          "c": "Neutral"
        },
        "correctAnswer": "b"
      },
      {
        "question": "MACD Line Cross Signal Line ຂຶ້ນ = ?",
        "choices": {
          "a": "Sell",
          "b": "Buy",
          "c": "Neutral"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Bollinger Bands ໃຊ້ວັດຫຍັງ?",
        "choices": {
          "a": "Momentum",
          "b": "Volatility",
          "c": "Volume"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Golden Cross ແມ່ນຫຍັງ?",
        "choices": {
          "a": "MA50 Cross MA200 ຂຶ້ນ",
          "b": "MA50 Cross MA200 ລົງ",
          "c": "RSI Cross 50"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Fibonacci 61.8% ເອີ້ນຊື່ວ່າ?",
        "choices": {
          "a": "Silver Ratio",
          "b": "Golden Ratio",
          "c": "Platinum Ratio"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Stochastic ດີສຳລັບຕະຫຼາດໃດ?",
        "choices": {
          "a": "Trending",
          "b": "Ranging",
          "c": "Breakout"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ATR ໃຊ້ວັດຫຍັງ?",
        "choices": {
          "a": "Direction",
          "b": "Volatility",
          "c": "Momentum"
        },
        "correctAnswer": "b"
      },
      {
        "question": "EMA ຕ່າງກັບ SMA ແນວໃດ?",
        "choices": {
          "a": "ດຽວກັນ",
          "b": "EMA ຕອບສະໜອງໄວກວ່າ",
          "c": "SMA ໄວກວ່າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Divergence ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Indicator ກົງກັບລາຄາ",
          "b": "ລາຄາແລະ Indicator ຕ່າງກັນ",
          "c": "Trend ດຽວກັນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Volume ສູງ + Breakout ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Fake Breakout",
          "b": "Breakout ໜ້າເຊື່ອຖື",
          "c": "Sideways"
        },
        "correctAnswer": "b"
      },
      {
        "question": "RSI Period ມາດຕະຖານຄືເທົ່າໃດ?",
        "choices": {
          "a": "9",
          "b": "14",
          "c": "21"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Death Cross ແມ່ນຫຍັງ?",
        "choices": {
          "a": "MA50 ຂຶ້ນເທິງ MA200",
          "b": "MA50 ລົງຕ່ຳກວ່າ MA200",
          "c": "RSI < 30"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Parabolic SAR ໃຊ້ເພື່ອຫຍັງ?",
        "choices": {
          "a": "Entry",
          "b": "Trailing Stop",
          "c": "Volume"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Indicator ທີ່ Lagging ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ໄວກວ່າລາຄາ",
          "b": "ຊ້າກວ່າລາຄາ",
          "c": "ດຽວກັນ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 5: Risk Management & Psychology",
    "slug": "q5",
    "level": "advanced",
    "requiresLogin": true,
    "order": 5,
    "icon": "🔥",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Rule 1% ໝາຍຄວາມວ່າແນວໃດ?",
        "choices": {
          "a": "ກຳໄລ 1% ຕໍ່ວັນ",
          "b": "Risk ສູງສຸດ 1% ຕໍ່ Trade",
          "c": "Lot 1% ຂອງ Balance"
        },
        "correctAnswer": "b"
      },
      {
        "question": "R:R 1:2 ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Risk $1 ຫວັງ $1",
          "b": "Risk $1 ຫວັງ $2",
          "c": "Risk $2 ຫວັງ $1"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Win Rate 40% + R:R 1:2 = ?",
        "choices": {
          "a": "ຂາດທຶນ",
          "b": "ກຳໄລ",
          "c": "Break Even"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Drawdown 50% ຕ້ອງກຳໄລຈັກ % ຈຶ່ງຄືນ?",
        "choices": {
          "a": "50%",
          "b": "100%",
          "c": "25%"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Revenge Trading ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Trade ຕາມ Plan",
          "b": "Trade ດ້ວຍ Emotion ຫຼັງຂາດທຶນ",
          "c": "Trade ໄວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "FOMO ໃນ Trading ແມ່ນຫຍັງ?",
        "choices": {
          "a": "Fear of Missing Out",
          "b": "Focus on Money",
          "c": "Forward Order"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Position Sizing ດີທີ່ສຸດອີງຕາມຫຍັງ?",
        "choices": {
          "a": "Feeling",
          "b": "SL Distance + Risk %",
          "c": "ທຶນທັງໝົດ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Correlated Pairs ສ່ຽງແນວໃດ?",
        "choices": {
          "a": "ກຳໄລຫຼາຍ",
          "b": "Double Risk ໂດຍບໍ່ຮູ້",
          "c": "ໂອກາດດີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Overtrading ເກີດຈາກຫຍັງ?",
        "choices": {
          "a": "System ດີ",
          "b": "Discipline ຕ່ຳ",
          "c": "Leverage ສູງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Max Daily Loss Limit ມີໄວ້ເພື່ອຫຍັງ?",
        "choices": {
          "a": "ຫຼຸດ Spread",
          "b": "ປ້ອງກັນ Emotional Trading",
          "c": "ເພີ່ມ Lot"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Kelly Criterion ໃຊ້ຄຳນວນຫຍັງ?",
        "choices": {
          "a": "Entry",
          "b": "Optimal Position Size",
          "c": "Stop Loss"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Pyramid Trading ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ຊື້ Lot ໃຫຍ່ຂຶ້ນຕະຫຼອດ",
          "b": "ເພີ່ມ Position ເມື່ອກຳໄລ",
          "c": "ຫຼຸດ Risk"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Process-oriented ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ສົນໃຈກຳໄລທຸກ Trade",
          "b": "ສົນໃຈປະຕິບັດຕາມ Plan",
          "c": "ສົນໃຈ Win Rate"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Trading Journal ຊ່ວຍແນວໃດ?",
        "choices": {
          "a": "ຫຼຸດ Tax",
          "b": "ຮຽນຮູ້ຈາກຂໍ້ຜິດພາດ",
          "c": "ເພີ່ມ Lot"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Trader ທີ່ດີຄວນເຮັດຫຍັງເມື່ອຂາດທຶນຕິດຕໍ່?",
        "choices": {
          "a": "Revenge Trade",
          "b": "ຢຸດ + ວິເຄາະ",
          "c": "ເພີ່ມ Lot"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 6: Trading Strategy",
    "slug": "q6",
    "level": "advanced",
    "requiresLogin": true,
    "order": 6,
    "icon": "🔥",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Swing Trading ຖື Position ດົນເທົ່າໃດ?",
        "choices": {
          "a": "15ນາທີ",
          "b": "ວັນດຽວ",
          "c": "2-7 ວັນ"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Scalping ຕ້ອງການຫຍັງທີ່ສຳຄັນ?",
        "choices": {
          "a": "Spread ສູງ",
          "b": "Spread ຕ່ຳ + Execution ໄວ",
          "c": "Leverage ຕ່ຳ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Trend Following ດີໃນຕະຫຼາດໃດ?",
        "choices": {
          "a": "Ranging",
          "b": "Trending",
          "c": "Volatile"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Buy the Rumor, Sell the Fact ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ຊື້ຕາມຂ່າວ",
          "b": "ຕະຫຼາດຕີລາຄາລ່ວງໜ້າ",
          "c": "ຊື້ທຸກຂ່າວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "London-NY Overlap ຊ່ວງໃດ (ລາວ)?",
        "choices": {
          "a": "07:00-10:00",
          "b": "14:00-17:00",
          "c": "19:00-23:00"
        },
        "correctAnswer": "c"
      },
      {
        "question": "NFP ອອກວັນໃດ?",
        "choices": {
          "a": "ທຸກວັນສຸດທ້າຍ",
          "b": "ທຸກວັນສຸກທຳອິດ",
          "c": "ທຸກວັນພຸດ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Carry Trade ກຳໄລຈາກຫຍັງ?",
        "choices": {
          "a": "Price Movement",
          "b": "Interest Rate Differential",
          "c": "Spread"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Mean Reversion ດີໃນຕະຫຼາດໃດ?",
        "choices": {
          "a": "Trending",
          "b": "Ranging/Sideways",
          "c": "Breakout"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Top-Down Analysis ແມ່ນຫຍັງ?",
        "choices": {
          "a": "ໃຊ້ Indicator ຫຼາຍ",
          "b": "ວິເຄາະຈາກ TF ໃຫຍ່ໄປນ້ອຍ",
          "c": "ໃຊ້ຫຼາຍ Pair"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Breakout Strategy ທີ່ດີຕ້ອງມີ?",
        "choices": {
          "a": "Volume ຕ່ຳ",
          "b": "Volume ສູງ + Candle Close",
          "c": "Wick ຍາວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Grid Trading ເໝາະຕະຫຼາດໃດ?",
        "choices": {
          "a": "Trending ແຮງ",
          "b": "Ranging",
          "c": "Low Volume"
        },
        "correctAnswer": "b"
      },
      {
        "question": "DCA ໃນ Forex ຕ່າງກັບ Crypto ຢ່າງໃດ?",
        "choices": {
          "a": "ດຽວກັນ",
          "b": "Forex ສ່ຽງກວ່າຍ້ອນບໍ່ມີ Intrinsic Value",
          "c": "Crypto ສ່ຽງກວ່າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Prop Firm Challenge ຕ້ອງການຫຍັງ?",
        "choices": {
          "a": "ກຳໄລໄວ",
          "b": "Consistent + ຮັກສາ Drawdown",
          "c": "Lot ໃຫຍ່"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Backtesting ທີ່ດີຄວນໃຊ້ຂໍ້ມູນຈັກປີ?",
        "choices": {
          "a": "3 ເດືອນ",
          "b": "1-3 ປີ",
          "c": "10 ປີຂຶ້ນໄປ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Over-optimization ໃນ Backtest ເກີດຄວາມສ່ຽງໃດ?",
        "choices": {
          "a": "ກຳໄລຫຼາຍ",
          "b": "ໄດ້ຜົນໃນອະດີດແຕ່ຜົນ Real ຕ່ຳ",
          "c": "System ໄວ"
        },
        "correctAnswer": "b"
      }
    ]
  }
]

async function seedQuizzes() {
  console.log("🚀 ນຳເຂົ້າ Quiz ທຸກ 6 ໊ ຫ ົ ວ ຂ ້ ໍ...")
  let ok = 0, fail = 0
  for (const quiz of quizzes) {
    try {
      const doc = {
        ...quiz,
        _type: 'quiz',
        _id: `quiz-${quiz.slug}`,
      }
      await client.createOrReplace(doc)
      console.log(`✅ ${quiz.title} (${quiz.totalQuestions} ຂໍ້)`)
      ok++
    } catch(e) {
      console.error(`❌ ${quiz.title}:`, e.message)
      fail++
    }
  }
  console.log(`\n✅ ສຳເລັດ: ${ok} | ❌ ລົ້ມ: ${fail}`)
}

seedQuizzes().catch(console.error)
