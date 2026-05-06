// seed-quizzes-batch2.js
// Quiz 7-18 (12 ໝວດໃໝ່)
// node scripts/seed-quizzes-batch2.js

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
    "title": "Quiz 7: Broker Selection",
    "slug": "q7",
    "level": "basic",
    "requiresLogin": true,
    "order": 7,
    "icon": "🏦",
    "color": "10B981",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Regulated Broker ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ໃຫ້ Bonus ຫຼາຍ",
          "b": "ຖືກກວດສອບໂດຍໜ່ວຍງານລັດ",
          "c": "Spread ຕ່ຳ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Regulatory Body ທີ່ໜ້າເຊື່ອຖືທີ່ສຸດ?",
        "choices": {
          "a": "CySEC",
          "b": "FCA (UK)",
          "c": "IFSC"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ECN Broker ຕ່າງກັບ Market Maker ແນວໃດ?",
        "choices": {
          "a": "ECN ກຳໄລຈາກ Spread",
          "b": "ECN ສົ່ງ Order ໄປຕະຫຼາດຈິງ",
          "c": "ECN ໃຫ້ Leverage ສູງກວ່າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Negative Balance Protection ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ຫ້າມ Balance ຕິດລົບ",
          "b": "Balance ບໍ່ຕ່ຳກວ່າ 0",
          "c": "ໄດ້ Bonus ເມື່ອ Balance ຕ່ຳ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Spread ທີ່ດີສຳລັບ EUR/USD ຄືຈັກ Pips?",
        "choices": {
          "a": "5+ Pips",
          "b": "0-2 Pips",
          "c": "10 Pips"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Broker ໃດທີ່ LFT ແນະນຳສຳລັບ EA?",
        "choices": {
          "a": "Broker ໃຫ Bonus ຫຼາຍ",
          "b": "Broker ECN + VPS ຟຣີ",
          "c": "Broker Spread ສູງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Slippage ຄືຫຍັງ?",
        "choices": {
          "a": "ກຳໄລຈາກ Spread",
          "b": "ຄວາມຕ່າງລາຄາ Order vs Execution",
          "c": "ຄ່າ Swap"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Swap-Free Account ເໝາະສຳລັບໃຜ?",
        "choices": {
          "a": "Scalper",
          "b": "ຜູ້ຖື Position ຂ້າມຄືນ",
          "c": "Day Trader"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Deposit Bonus ຄວນລະວັງຫຍັງ?",
        "choices": {
          "a": "ເງື່ອນໄຂ Withdrawal ຂອງ Bonus",
          "b": "ຈຳນວນ Bonus",
          "c": "ຊ່ອງທາງ Deposit"
        },
        "correctAnswer": "a"
      },
      {
        "question": "ທ່ານຄວນ Test Broker ດ້ວຍ?",
        "choices": {
          "a": "Real Account ທັນທີ",
          "b": "Demo Account ກ່ອນ",
          "c": "ຖາມໝູ່"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Execution Type ທີ່ Scalper ຕ້ອງການ?",
        "choices": {
          "a": "Requote ດຸ",
          "b": "Instant/Market Execution ໄວ",
          "c": "Pending Order ດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Leverage ສູງ ດີ ຫຼື ບໍ່ດີ?",
        "choices": {
          "a": "ດີສະເໝີ",
          "b": "ສ່ຽງສູງຂຶ້ນ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຕ້ອງກວດ Broker ໃນ Website ໃດ?",
        "choices": {
          "a": "Google",
          "b": "WikiFX / Broker ລາຍຊື່ Regulator",
          "c": "YouTube"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ການ Withdraw ໃຊ້ BCEL ໄດ້ ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Broker ໃຫ Bonus ຫຼາຍ",
          "b": "Broker ຮອງຮັບທະນາຄານລາວ",
          "c": "Broker Bonus Free"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນເລືອກ Broker ໂດຍອີງຕາມ?",
        "choices": {
          "a": "ໝູ່ແນະນຳດຽວ",
          "b": "ຫຼາຍປັດໄຈ: Regulation+Spread+Support",
          "c": "Bonus ສູງສຸດ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 8: Chart Patterns",
    "slug": "q8",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 8,
    "icon": "📊",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Head and Shoulders ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bullish Continuation",
          "b": "Bearish Reversal",
          "c": "Sideways"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Double Top ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bullish",
          "b": "Bearish Reversal",
          "c": "Neutral"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Cup and Handle ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bearish",
          "b": "Bullish Continuation",
          "c": "Reversal ລົງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Ascending Triangle ສ່ວນໃຫຍ່ Breakout ໄປທາງໃດ?",
        "choices": {
          "a": "ລົງ",
          "b": "ຂຶ້ນ",
          "c": "Sideways"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Descending Triangle ສ່ວນໃຫຍ່ Breakout ໄປທາງໃດ?",
        "choices": {
          "a": "ຂຶ້ນ",
          "b": "Sideways",
          "c": "ລົງ"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Flag Pattern ຄືຫຍັງ?",
        "choices": {
          "a": "Reversal Pattern",
          "b": "Continuation Pattern",
          "c": "Neutral"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Wedge Pattern ມີຈັກປະເພດ?",
        "choices": {
          "a": "1",
          "b": "2 (Rising + Falling)",
          "c": "3"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Rising Wedge ສ່ວນໃຫຍ່ Breakout ໄປທາງໃດ?",
        "choices": {
          "a": "ຂຶ້ນ",
          "b": "ລົງ",
          "c": "Sideways"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Pennant ຕ່າງຈາກ Flag ແນວໃດ?",
        "choices": {
          "a": "ດຽວກັນ",
          "b": "Pennant ໃຫຍ່ກວ່າ",
          "c": "Pennant ມີ Converging Lines"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Rounding Bottom ສັນຍານຫຍັງ?",
        "choices": {
          "a": "Bearish",
          "b": "Bullish Reversal",
          "c": "Continuation"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Trade Pattern ເມື່ອໃດ?",
        "choices": {
          "a": "ເຫັນ Pattern ທັນທີ",
          "b": "Candle Close ຢືນຢັນ Breakout",
          "c": "ເດົາ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Triple Top ຕ່າງຈາກ Double Top ແນວໃດ?",
        "choices": {
          "a": "ດຽວກັນ",
          "b": "Triple Top ຢືນຢັນຫຼາຍກວ່າ",
          "c": "Triple Top Bullish"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Target ຂອງ Head and Shoulders ຄຳນວນຈາກ?",
        "choices": {
          "a": "ຄວາມສູງຂອງ Head ຈາກ Neckline",
          "b": "ສຸ່ມ",
          "c": "Close ຂອງ Candle"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Symmetrical Triangle ຈະ Breakout ໄປທາງໃດ?",
        "choices": {
          "a": "ຂຶ້ນສະເໝີ",
          "b": "ຕາມ Trend ກ່ອນໜ້າ",
          "c": "ລົງສະເໝີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Volume ຄວນເປັນແນວໃດຕອນ Breakout?",
        "choices": {
          "a": "ຕ່ຳ",
          "b": "ສູງ",
          "c": "ດຽວກັນ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 9: Fundamental Analysis",
    "slug": "q9",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 9,
    "icon": "📰",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "GDP ສູງ ສົ່ງຜົນດີຕໍ່າຄ່າເງິນແນວໃດ?",
        "choices": {
          "a": "ອ່ອນລົງ",
          "b": "ແຂງຄ່າຂຶ້ນ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Inflation ສູງ Central Bank ມັກເຮັດຫຍັງ?",
        "choices": {
          "a": "ຫຼຸດດອກເບ້ຍ",
          "b": "ຂຶ້ນດອກເບ້ຍ",
          "c": "ຢູ່ຊື່ໆ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "NFP ຄືຫຍັງ?",
        "choices": {
          "a": "Non-Farm Payrolls",
          "b": "National Finance Policy",
          "c": "Net Foreign Position"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Hawkish Central Bank ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "ດອກເບ້ຍຂຶ້ນ",
          "b": "ດອກເບ້ຍລົງ",
          "c": "ເງິນເຟີ້"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Dovish ໝາຍຄວາມວ່າແນວໃດ?",
        "choices": {
          "a": "ເງິນເຟີ້ສູງ",
          "b": "ນະໂຍບາຍດອກເບ້ຍຕ່ຳ",
          "c": "GDP ສູງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Trade Balance ເກີນດຸນ ດີຕໍ່ຄ່າເງິນແນວໃດ?",
        "choices": {
          "a": "ອ່ອນ",
          "b": "ແຂງ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "CPI ວັດຫຍັງ?",
        "choices": {
          "a": "ການຈ້າງງານ",
          "b": "ດັດຊະນີລາຄາຜູ້ບໍລິໂພກ",
          "c": "GDP"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Fed Funds Rate ຄືຫຍັງ?",
        "choices": {
          "a": "ອັດຕາດອກເບ້ຍ US",
          "b": "ອັດຕາ Inflation US",
          "c": "ຈຳນວນ Jobs"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Risk-On ສະພາວະ Trader ມັກ Buy ຫຍັງ?",
        "choices": {
          "a": "USD, JPY, Gold",
          "b": "AUD, NZD, Stocks",
          "c": "ທຸກຢ່າງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Risk-Off ສະພາວະ Trader ມັກ Buy ຫຍັງ?",
        "choices": {
          "a": "AUD, NZD",
          "b": "USD, JPY, Gold",
          "c": "Crypto"
        },
        "correctAnswer": "b"
      },
      {
        "question": "FOMC Meeting ສຳຄັນຍ້ອນ?",
        "choices": {
          "a": "ປະກາດ GDP",
          "b": "ປະກາດນະໂຍບາຍດອກເບ້ຍ",
          "c": "ປະກາດ NFP"
        },
        "correctAnswer": "b"
      },
      {
        "question": "PPI ວັດຫຍັງ?",
        "choices": {
          "a": "ລາຄາຜູ້ຜະລິດ",
          "b": "ລາຄາຜູ້ບໍລິໂພກ",
          "c": "GDP"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Unemployment Rate ຕ່ຳ ດີຕໍ່ຄ່າເງິນແນວໃດ?",
        "choices": {
          "a": "ອ່ອນລົງ",
          "b": "ແຂງຄ່າຂຶ້ນ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Economic Calendar ໃຊ້ເຮັດຫຍັງ?",
        "choices": {
          "a": "ເບິ່ງ Chart",
          "b": "ຕິດຕາມຂ່າວ Economic",
          "c": "ເລືອກ Broker"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Trade ຕອນ High-Impact News ແນວໃດ?",
        "choices": {
          "a": "Trade ທຸກຂ່າວ",
          "b": "ລະວັງ/ຫຼີກ ຫຼື ຮູ້ Strategy",
          "c": "ເພີ່ມ Lot"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 10: EA & Automated Trading",
    "slug": "q10",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 10,
    "icon": "🤖",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "EA ຫຍໍ້ມາຈາກ?",
        "choices": {
          "a": "Expert Advisor",
          "b": "Electronic Algorithm",
          "c": "Execution Auto"
        },
        "correctAnswer": "a"
      },
      {
        "question": "MQL4 ໃຊ້ໃນ Platform ໃດ?",
        "choices": {
          "a": "MT5",
          "b": "MT4",
          "c": "cTrader"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Backtest ດີ ໝາຍຄວາມວ່າ EA ຈະດີໃນ Real?",
        "choices": {
          "a": "ແນ່ນອນ",
          "b": "ບໍ່ຮັບປະກັນ",
          "c": "ດີສະເໝີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "VPS ຈຳເປັນສຳລັບ EA ຍ້ອນ?",
        "choices": {
          "a": "Spread ຕ່ຳ",
          "b": "EA ຕ້ອງ Online 24/5",
          "c": "ໃຫ Bonus"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Forward Test ຄືຫຍັງ?",
        "choices": {
          "a": "Backtest ດ້ວຍ Data ເກົ່າ",
          "b": "Test ດ້ວຍ Data ໃໝ່ Real-time",
          "c": "Optimize Parameters"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Optimization ໃນ MT4 ໃຊ້ເຮັດຫຍັງ?",
        "choices": {
          "a": "ຫຼຸດ Spread",
          "b": "ຫາ Parameter ທີ່ດີທີ່ສຸດ",
          "c": "ເພີ່ມ Lot"
        },
        "correctAnswer": "b"
      },
      {
        "question": "EA SGride ຂອງ LFT ໃຊ້ Strategy ໃດ?",
        "choices": {
          "a": "Scalping",
          "b": "Grid Trading",
          "c": "Trend Following"
        },
        "correctAnswer": "b"
      },
      {
        "question": "EA MegiHedge ຂອງ LFT ໃຊ້ Strategy ໃດ?",
        "choices": {
          "a": "Grid",
          "b": "Hedging",
          "c": "Martingale ດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Copy Trade ຄືຫຍັງ?",
        "choices": {
          "a": "Trade ດ້ວຍ EA",
          "b": "ກ໊ອບ Trade ຈາກ Master Account",
          "c": "Backtest"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Drawdown ໃນ EA ທີ່ດີຄວນ?",
        "choices": {
          "a": "ສູງ",
          "b": "ຕ່ຳ ຕ່ຳກວ່າ 20%",
          "c": "ບໍ່ສຳຄັນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Profit Factor > 1.5 ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "EA ຂາດທຶນ",
          "b": "EA ກຳໄລ 1.5 ຕໍ່ທຸກ $1 ຂາດທຶນ",
          "c": "ບໍ່ດີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "EA ດີຕ້ອງ Test ໃນ Market ໃດ?",
        "choices": {
          "a": "Trending ດຽວ",
          "b": "ຫຼາຍ Market Conditions",
          "c": "Bull Market ດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Lot Size ທີ່ EURUSD 0.01 ມູນຄ່າຕໍ່ Pip?",
        "choices": {
          "a": "$1",
          "b": "$0.1",
          "c": "$10"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Run EA ດ້ວຍ Account ປະເພດ?",
        "choices": {
          "a": "ສຸ່ມ",
          "b": "ECN Account Spread ຕ່ຳ",
          "c": "Cent Account ສະເໝີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຖ້າ EA ຂາດທຶນ 3 ອາທິດຕິດ ຄວນ?",
        "choices": {
          "a": "ເພີ່ມ Lot",
          "b": "ຢຸດ ກວດສອບ",
          "c": "ໃຊ້ EA ໃໝ່"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 11: Market Sessions",
    "slug": "q11",
    "level": "basic",
    "requiresLogin": false,
    "order": 11,
    "icon": "🕐",
    "color": "10B981",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Forex ເປີດ 24 ຊົ່ວໂມງ 5 ວັນ ວັນໃດປິດ?",
        "choices": {
          "a": "ວັນພຸດ-ພະຫັດ",
          "b": "ວັນເສົາ-ອາທິດ",
          "c": "ວັນສຸກ-ເສົາ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Session ທີ່ Active ທີ່ສຸດ?",
        "choices": {
          "a": "Tokyo",
          "b": "London-New York Overlap",
          "c": "Sydney"
        },
        "correctAnswer": "b"
      },
      {
        "question": "London Session ເລີ່ມຈັກໂມງ (GMT)?",
        "choices": {
          "a": "00:00",
          "b": "08:00",
          "c": "16:00"
        },
        "correctAnswer": "b"
      },
      {
        "question": "New York Session ເລີ່ມຈັກໂມງ (GMT)?",
        "choices": {
          "a": "08:00",
          "b": "13:00",
          "c": "20:00"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Tokyo Session ເລີ່ມຈັກໂມງ (GMT)?",
        "choices": {
          "a": "00:00",
          "b": "08:00",
          "c": "13:00"
        },
        "correctAnswer": "a"
      },
      {
        "question": "ຊ່ວງ London-NY Overlap ດີທີ່ສຸດ ຍ້ອນ?",
        "choices": {
          "a": "Spread ສູງ",
          "b": "Volume ແລະ Liquidity ສູງ",
          "c": "ສຸ່ມ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "EUR/USD Active ທີ່ສຸດໃນ Session ໃດ?",
        "choices": {
          "a": "Tokyo",
          "b": "London",
          "c": "Sydney"
        },
        "correctAnswer": "b"
      },
      {
        "question": "AUD/USD Active ທີ່ສຸດໃນ Session ໃດ?",
        "choices": {
          "a": "London",
          "b": "Sydney-Tokyo",
          "c": "New York"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຊ່ວງ Noon Lull ຄືຫຍັງ?",
        "choices": {
          "a": "ຕະຫຼາດ Active",
          "b": "ຊ່ວງງຽບລະຫວ່າງ London-NY",
          "c": "ຕະຫຼາດ Crash"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Scalper ຄວນ Trade ໃນ Session ໃດ?",
        "choices": {
          "a": "Sydney",
          "b": "London-NY Overlap",
          "c": "ທຸກ Session"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ລາວເວລາ GMT+7 London 08:00 GMT = ຈັກໂມງລາວ?",
        "choices": {
          "a": "13:00",
          "b": "15:00",
          "c": "08:00"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ວັນທີ Daylight Saving ປ່ຽນ Session Time?",
        "choices": {
          "a": "ປ່ຽນ",
          "b": "ບໍ່ປ່ຽນ",
          "c": "ສ່ວນໃຫຍ່ປ່ຽນ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Spread ສູງທີ່ສຸດໃນ Session ໃດ?",
        "choices": {
          "a": "London",
          "b": "Sydney (ງຽບ)",
          "c": "New York"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Gold (XAUUSD) Active ທີ່ສຸດໃນ Session ໃດ?",
        "choices": {
          "a": "Tokyo",
          "b": "London-NY",
          "c": "Sydney"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນຫຼີກລ່ຽງ Trade ຊ່ວງໃດ?",
        "choices": {
          "a": "London Open",
          "b": "ກ່ອນ NFP / ຂ່າວໃຫຍ່",
          "c": "Monday Open"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 12: Money & Macro Economics",
    "slug": "q12",
    "level": "advanced",
    "requiresLogin": true,
    "order": 12,
    "icon": "🌍",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Quantitative Easing (QE) ສົ່ງຜົນຕໍ່ Currency ແນວໃດ?",
        "choices": {
          "a": "ແຂງຄ່າ",
          "b": "ອ່ອນຄ່າ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Yield Curve Inversion ສັນຍານຫຍັງ?",
        "choices": {
          "a": "ເສດຖະກິດເຕີບໂຕ",
          "b": "ອາດຈະເກີດ Recession",
          "c": "ດອກເບ້ຍຂຶ້ນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "DXY ຄືຫຍັງ?",
        "choices": {
          "a": "Dollar ທຽບ Gold",
          "b": "Dollar Index ທຽບ 6 Currency",
          "c": "Dollar ທຽບ Euro ຢ່າງດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ເມື່ອ DXY ຂຶ້ນ EUR/USD ຈະເປັນແນວໃດ?",
        "choices": {
          "a": "ຂຶ້ນ",
          "b": "ລົງ",
          "c": "ຄົງທີ່"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Bond Yield ສູງ ດີຕໍ່ Currency ໃດ?",
        "choices": {
          "a": "Currency ຂອງ Bond ນັ້ນ",
          "b": "ທຸກ Currency",
          "c": "USD ຢ່າງດຽວ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Stagflation ຄືຫຍັງ?",
        "choices": {
          "a": "ເຕີບໂຕ+ເງິນເຟີ້ສູງ",
          "b": "ເຕີບໂຕຊ້າ+ເງິນເຟີ້ສູງ",
          "c": "ເຕີບໂຕໄວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ເມື່ອ Fed ຂຶ້ນດອກເບ້ຍ USD ຈະເປັນແນວໃດ?",
        "choices": {
          "a": "ອ່ອນ",
          "b": "ແຂງ",
          "c": "ຄົງທີ່"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Current Account Deficit ສົ່ງຜົນຫຍັງ?",
        "choices": {
          "a": "Currency ອ່ອນ",
          "b": "Currency ແຂງ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Gold ແລະ USD ມີ Correlation ແນວໃດ?",
        "choices": {
          "a": "Positive",
          "b": "Negative",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Crisis ນັກລົງທຶນ ມັກໄປ Safe Haven ໃດ?",
        "choices": {
          "a": "AUD, NZD",
          "b": "USD, JPY, Gold",
          "c": "Crypto"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Purchasing Power Parity (PPP) ໃຊ້ວັດຫຍັງ?",
        "choices": {
          "a": "Volatility",
          "b": "ລາຄາທີ່ຄວນເປັນຂອງສະກຸນເງິນ",
          "c": "Volume"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Recession ອັດຕາດອກເບ້ຍຈະເປັນແນວໃດ?",
        "choices": {
          "a": "ຂຶ້ນ",
          "b": "ລົງ",
          "c": "ຄົງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Carry Trade ສ່ຽງໃນ Risk-Off ຍ້ອນຫຍັງ?",
        "choices": {
          "a": "ດອກເບ້ຍສູງ",
          "b": "Unwinding ໄວ ທຳລາຍ Position",
          "c": "Spread ສູງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໂດລາສະຫະລັດ ເປັນ Reserve Currency ຄືຫຍັງ?",
        "choices": {
          "a": "ທຸກຄົນ Trade ດ້ວຍ USD",
          "b": "ໃຊ້ Forex ຫຼາຍ",
          "c": "ສ່ວນໃຫຍ່ຮັກສາ USD ສຳຮອງ"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Global Risk Sentiment ກ່ຽວຂ້ອງກັບ Forex ແນວໃດ?",
        "choices": {
          "a": "ບໍ່ກ່ຽວ",
          "b": "ສົ່ງຜົນໃຫ້ສະກູນເງິນເຄື່ອນໄຫວ",
          "c": "ກ່ຽວສະເພາະ Crypto"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 13: Price Action Advanced",
    "slug": "q13",
    "level": "advanced",
    "requiresLogin": true,
    "order": 13,
    "icon": "📈",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Order Block ຄືຫຍັງ?",
        "choices": {
          "a": "Support ທຳມະດາ",
          "b": "ບ່ອນ Smart Money ວາງ Order",
          "c": "Indicator Signal"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Fair Value Gap (FVG) ຄືຫຍັງ?",
        "choices": {
          "a": "Gap ໃນ Chart",
          "b": "ຊ່ອງວ່າງ Liquidity ທີ່ລາຄາມັກກັບ",
          "c": "Double Top"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Break of Structure (BOS) ຄືຫຍັງ?",
        "choices": {
          "a": "ລາຄາ Sideways",
          "b": "Trend ໃໝ່ເລີ່ມ",
          "c": "Reversal ທັນທີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Change of Character (ChoCh) ຄືຫຍັງ?",
        "choices": {
          "a": "BOS ຄືກັນ",
          "b": "Continuation",
          "c": "ສັນຍານ Reversal ທຳອິດ"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Liquidity Sweep ຄືຫຍັງ?",
        "choices": {
          "a": "ລາຄາ Breakout ຈິງ",
          "b": "ດຶງ Stop Loss ກ່ອນ Reverse",
          "c": "Volume ສູງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Smart Money ໝາຍຄວາມວ່າ?",
        "choices": {
          "a": "Retail Trader",
          "b": "ສະຖາບັນ/Bank ໃຫຍ່",
          "c": "EA"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Imbalance ໃນ Price Action ຄືຫຍັງ?",
        "choices": {
          "a": "ຕະຫຼາດ Balanced",
          "b": "Sideways",
          "c": "ຊ່ອງທີ່ Efficient Market ຕ້ອງ Fill"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Premium Zone ຄືຫຍັງ?",
        "choices": {
          "a": "ລາຄາຕ່ຳ",
          "b": "ລາຄາສູງກວ່າ Equilibrium",
          "c": "Neutral"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Discount Zone ດີສຳລັບ?",
        "choices": {
          "a": "Sell",
          "b": "Buy",
          "c": "Neutral"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Inducement ໃນ SMC ຄືຫຍັງ?",
        "choices": {
          "a": "ທຸກ Signal",
          "b": "ການ Fake ດຶງ Retail ເຂົ້ານຳ",
          "c": "Volume Signal"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ICT Killzone ຄືຫຍັງ?",
        "choices": {
          "a": "ທຸກ Session",
          "b": "ຊ່ວງ High Probability Entry",
          "c": "Indicator"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Mitigation Block ຄືຫຍັງ?",
        "choices": {
          "a": "Order Block ທີ່ Partially Filled",
          "b": "Order Block ທີ່ Tested ຄັ້ງທຳອິດ",
          "c": "Support ທົ່ວໄປ"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Market Structure Shift ທີ່ H4 ໝາຍເຖິງ?",
        "choices": {
          "a": "ສຸ່ມ",
          "b": "Trend ຂອງ H4 ປ່ຽນ",
          "c": "M1 ປ່ຽນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ວິທີ Confirm Order Block ທີ່ດີ?",
        "choices": {
          "a": "ໃຊ້ MA",
          "b": "ລໍຖ້າ Reaction + Volume",
          "c": "ໃຊ້ RSI"
        },
        "correctAnswer": "b"
      },
      {
        "question": "SMC ຕ່າງຈາກ Traditional TA ແນວໃດ?",
        "choices": {
          "a": "ດຽວກັນ",
          "b": "SMC ເບິ່ງ Institutional Flow",
          "c": "SMC ໃຊ້ Indicator ຫຼາຍ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 14: Cryptocurrency & Forex",
    "slug": "q14",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 14,
    "icon": "₿",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Bitcoin ແລະ USD Correlate ກັນແນວໃດ?",
        "choices": {
          "a": "Positive ສະເໝີ",
          "b": "Negative ໃນ Risk-Off",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Crypto Market ເປີດແນວໃດ?",
        "choices": {
          "a": "24/5",
          "b": "24/7",
          "c": "ຕາມ Exchange"
        },
        "correctAnswer": "b"
      },
      {
        "question": "DeFi ຄືຫຍັງ?",
        "choices": {
          "a": "Decentralized Finance",
          "b": "Digital Finance",
          "c": "Dollar Finance"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Stablecoin ຄືຫຍັງ?",
        "choices": {
          "a": "Crypto Volatile",
          "b": "Crypto ຜູກກັບ Fiat",
          "c": "Bitcoin ປະເພດໜຶ່ງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Halving ຂອງ Bitcoin ສົ່ງຜົນແນວໃດ?",
        "choices": {
          "a": "ໃຫ Miner ໄດ Reward ຫຼາຍ",
          "b": "ຫຼຸດ Supply ໃໝ່ → ລາຄາມັກຂຶ້ນ",
          "c": "ລາຄາລົງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Forex ຕ່າງຈາກ Crypto ແນວໃດ?",
        "choices": {
          "a": "Forex Decentralized",
          "b": "Forex ມີ Regulator + ມີ Liquidity ສູງກວ່າ",
          "c": "ຄືກັນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Altcoin ຄືຫຍັງ?",
        "choices": {
          "a": "Bitcoin",
          "b": "ທຸກ Crypto ນອກຈາກ Bitcoin",
          "c": "Stablecoin"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Market Cap ຂອງ Crypto ຄໍານວນແນວໃດ?",
        "choices": {
          "a": "Price × Volume",
          "b": "Price × Total Supply",
          "c": "Price × 1000"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Crypto Exchange ທີ່ໃຫຍ່ທີ່ສຸດ (Volume)?",
        "choices": {
          "a": "Coinbase",
          "b": "Binance",
          "c": "Kraken"
        },
        "correctAnswer": "b"
      },
      {
        "question": "On-chain Analysis ໃຊ້ວັດຫຍັງ?",
        "choices": {
          "a": "Price Action",
          "b": "Activity ໃນ Blockchain",
          "c": "Volume ໃນ Exchange"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Bull Market Crypto ໃດ Outperform?",
        "choices": {
          "a": "Bitcoin ດຽວ",
          "b": "Altcoin ມັກ Outperform",
          "c": "Stablecoin"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Whale ໃນ Crypto ໝາຍເຖິງຫຍັງ?",
        "choices": {
          "a": "ຜູ້ Trading ໄວ",
          "b": "ຜູ້ຖື Crypto ຈໍານວນຫຼາຍ",
          "c": "Exchange"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Gas Fee ໃນ Ethereum ຄືຫຍັງ?",
        "choices": {
          "a": "ຄ່ານ້ຳມັນ",
          "b": "ຄ່າ Transaction ໃນ Network",
          "c": "Swap Fee"
        },
        "correctAnswer": "b"
      },
      {
        "question": "FOMO ໃນ Crypto ອັນຕະລາຍ ຍ້ອນ?",
        "choices": {
          "a": "ຊື້ໃນ Dip",
          "b": "ຊື້ Top + Panic Sell Bottom",
          "c": "ຊື້ຊ້າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Forex Trader ທີ່ຢາກ Trade Crypto ຄວນ?",
        "choices": {
          "a": "ໃຊ້ Leverage ສູງທັນທີ",
          "b": "ເລີ່ມ Spot, ຮຽນ Crypto Market ກ່ອນ",
          "c": "ບໍ່ Trade Crypto"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 15: Trading Journal & Review",
    "slug": "q15",
    "level": "advanced",
    "requiresLogin": true,
    "order": 15,
    "icon": "📓",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Trading Journal ຕ້ອງບັນທຶກຫຍັງ?",
        "choices": {
          "a": "ກຳໄລຢ່າງດຽວ",
          "b": "Entry, Exit, Reason, Emotion, Result",
          "c": "ຊື່ Pair ຢ່າງດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Win Rate 60% + R:R 1:1 = ?",
        "choices": {
          "a": "ຂາດທຶນ",
          "b": "ກຳໄລ",
          "c": "Break Even"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Expectancy Formula ຄື?",
        "choices": {
          "a": "Win% × AvgWin - Loss% × AvgLoss",
          "b": "Win% ÷ Loss%",
          "c": "AvgWin ÷ AvgLoss"
        },
        "correctAnswer": "a"
      },
      {
        "question": "ການ Review Trade ຄວນເຮັດຫຼືບໍ່?",
        "choices": {
          "a": "ບໍ່ຈຳເປັນ",
          "b": "ທຸກອາທິດ/ເດືອນ",
          "c": "ປີລະຄັ້ງ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຖ້າ Win Rate ຕ່ຳ ແຕ່ R:R ດີ ຄວນເຮັດແນວໃດ?",
        "choices": {
          "a": "ເລີກ Trade",
          "b": "ຮັກສາ System ຢ່າ Overfit",
          "c": "ຫຼຸດ R:R"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Consecutive Losses ສູງ ໝາຍເຖິງ?",
        "choices": {
          "a": "System ຜິດ",
          "b": "ອາດ Drawdown ຊ່ວງກວດ Market",
          "c": "ເພີ່ມ Lot"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Grade Trade ແນວໃດ?",
        "choices": {
          "a": "A-F ຕາມ Process",
          "b": "ຕາມກຳໄລ-ຂາດທຶນ",
          "c": "ບໍ່ Grade"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Setup ທີ່ດີ ໃນ Journal ໝາຍເຖິງຫຍັງ?",
        "choices": {
          "a": "Trade ທຸກ Signal",
          "b": "ຕາມ Rule + Criteria ທີ່ຊັດເຈນ",
          "c": "ໃຊ້ Feeling"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຂ້ໍ ຜິດພາດທີ່ Journal ມັນພໍ້?",
        "choices": {
          "a": "ຂ່າວ",
          "b": "Pattern ຜິດຊ້ຳ, Emotional Trading",
          "c": "ລາຄາ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Screenshot Chart ໃນ Journal ບໍ?",
        "choices": {
          "a": "ບໍ່ຈຳເປັນ",
          "b": "ໃຊ້ Visual Review",
          "c": "ໃຊ້ Broker Statement ຢ່າງດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Monthly Review ຄວນເບິ່ງຫຍັງ?",
        "choices": {
          "a": "ກຳໄລຢ່າງດຽວ",
          "b": "Win Rate, R:R, Pair, Session, Mistakes",
          "c": "Chart Pattern ຢ່າງດຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຖ້າ Journal ສະແດງ Trade ຕອນ London ດີທີ່ສຸດ?",
        "choices": {
          "a": "ບໍ່ສຳຄັນ",
          "b": "Focus Trade ໃນ London",
          "c": "Trade ທຸກ Session"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Drawdown ໃນ Journal ຊ່ວຍຫຍັງ?",
        "choices": {
          "a": "ບໍ່ຊ່ວຍ",
          "b": "ຮູ້ Max Risk ໃນ Worst Period",
          "c": "ຫຼຸດ Win Rate"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄວນ Share Journal ກັບໃຜແນ່?",
        "choices": {
          "a": "ທຸກຄົນ",
          "b": "Mentor/Community ທີ່ Constructive",
          "c": "ບໍ່ Share"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ເປົ້າໝາຍ Journal ທີ່ດີທີ່ສຸດ?",
        "choices": {
          "a": "ໂອ້ອວດ",
          "b": "ຮຽນຮູ້ + Improve Process",
          "c": "ເກັບ Record ເພື່ອເສຍອາກອນ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 16: Prop Trading & Career",
    "slug": "q16",
    "level": "advanced",
    "requiresLogin": true,
    "order": 16,
    "icon": "🏆",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Prop Firm ທີ່ໜ້າເຊື່ອຖືຄວນກວດຫຍັງ?",
        "choices": {
          "a": "Reviews + Payout History + Regulation",
          "b": "Google ຢ່າງດຽວ",
          "c": "YouTube"
        },
        "correctAnswer": "a"
      },
      {
        "question": "Challenge Fee ທີ່ຈ່າຍ?",
        "choices": {
          "a": "ໄດ້ຄືນສະເໝີ",
          "b": "ບໍ່ໄດ້ຄືນຖ້າ Fail",
          "c": "ໄດ້ຄືນຖ້າ Pass"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ການ Scale Account ໃນ Prop ໝາຍເຖິງ?",
        "choices": {
          "a": "ຫຼຸດ Lot",
          "b": "ເພີ່ມ Funding ຕາມ Performance",
          "c": "ຫຼຸດ Target"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Max Drawdown ໃນ Challenge ຄືແນວໃດ?",
        "choices": {
          "a": "ເກີນໄດ້",
          "b": "ບໍ່ສຳຄັນ",
          "c": "ຫ້າມເກີນ ຖ້າເກີນຄື Fail"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Consistency Rule ໃນ Prop ຄືຫຍັງ?",
        "choices": {
          "a": "Trade ທຸກວັນ",
          "b": "ກຳໄລໃນ 1 ວັນ ຕ້ອງບໍ່ເກີນ % ທີ່ກຳໜົດ",
          "c": "ຮັກສາ Lot"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Prop ຖ້າ News Trading ຖືກຫ້າມບໍ?",
        "choices": {
          "a": "Trade ທຸກຂ່າວ",
          "b": "ຫຼີກລ່ຽງຊ່ວງ High Impact News",
          "c": "ບໍ່ສົນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Trader ຈະໄດ້ Payout ແນວໃດ?",
        "choices": {
          "a": "ທຸກວັນ",
          "b": "ທຸກ 30 ວັນ ຕາມ Profit Split",
          "c": "ທຸກ Trade"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ການ Hedge ໃນ Prop ຄວນເຮັດແນວໃດ?",
        "choices": {
          "a": "ເຮັດສະເໝີ",
          "b": "ກວດ Rule ຂອງ Firm ກ່ອນ",
          "c": "ຫ້າມທຸກ Firm"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃຊ້ EA ໃນ Prop ໄດ້ບໍ?",
        "choices": {
          "a": "ບໍ່ໄດ້ທຸກ Firm",
          "b": "ໄດ້ທຸກ Firm",
          "c": "ຂຶ້ນຢູ່ກັບ Rule ຂອງ Firm"
        },
        "correctAnswer": "c"
      },
      {
        "question": "Trader ທີ່ Fail Challenge ຄວນເຮັດແນວໃດ?",
        "choices": {
          "a": "ເລີ່ມ Challenge ໃຫມ່ທັນທີ",
          "b": "ວິເຄາະ ແກ້ System ກ່ອນ Retry",
          "c": "ປ່ຽນ Firm"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Freelance Trader ຕ່າງ Prop Trader ແນວໃດ?",
        "choices": {
          "a": "ຄືກັນ",
          "b": "Prop ໃຊ້ທຶນ Firm, Freelance ໃຊ້ທຶນຕົນເອງ",
          "c": "Prop ຟຣີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ການ Trade ເປັນ Career ຕ້ອງເຮັດແນວໃດ?",
        "choices": {
          "a": "Lucky ດຽວ",
          "b": "Track Record + Discipline + Capital",
          "c": "ຮຽນ 1 ອາທິດ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ລາຍໄດ້ Trader ທີ່ Consistent ໝາຍເຖິງ?",
        "choices": {
          "a": "ກຳໄລທຸກເດືອນ 100%",
          "b": "ກຳໄລ Average ດີ Long-term",
          "c": "ບໍ່ຂາດທຶນ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ການ Mentor ຊ່ວຍ Trader ແນວໃດ?",
        "choices": {
          "a": "ໃຫ Tips ທຸກ Trade",
          "b": "ລຸດ Learning Curve + Avoid Mistakes",
          "c": "ໃຫ້ Signal"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຂີດຈຳກັດ Trader ທີ່ໃຫຍ່ທີ່ສຸດ?",
        "choices": {
          "a": "Capital",
          "b": "Psychology + Discipline",
          "c": "Broker"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 17: Gold & Commodities",
    "slug": "q17",
    "level": "intermediate",
    "requiresLogin": true,
    "order": 17,
    "icon": "🥇",
    "color": "F59E0B",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "XAUUSD ຄືຫຍັງ?",
        "choices": {
          "a": "Silver/USD",
          "b": "Gold/USD",
          "c": "Platinum/USD"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Gold ມັກຂຶ້ນໃນ?",
        "choices": {
          "a": "Risk-On",
          "b": "Risk-Off / ຄວາມບໍ່ແນ່ນອນ",
          "c": "Bull Market"
        },
        "correctAnswer": "b"
      },
      {
        "question": "1 Troy Ounce ຂອງ Gold ເທົ່າກັບ?",
        "choices": {
          "a": "28.35 g",
          "b": "31.1 g",
          "c": "100 g"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ຄ່າ Pip ຂອງ XAUUSD 1 Lot ຕໍ່ $1?",
        "choices": {
          "a": "$1",
          "b": "$10",
          "c": "$100"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Gold ແລະ USD ມີ Correlation?",
        "choices": {
          "a": "Positive",
          "b": "Negative",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Oil Price ຂຶ້ນ ສົ່ງຜົນຕໍ່ Inflation?",
        "choices": {
          "a": "ຫຼູດ",
          "b": "ສູງຂຶ້ນ",
          "c": "ບໍ່ກ່ຽວ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "CAD ກ່ຽວກັບ Oil ແນວໃດ?",
        "choices": {
          "a": "ບໍ່ກ່ຽວ",
          "b": "CAD ມັກຂຶ້ນຕາມ Oil",
          "c": "CAD ລົງຕາມ Oil"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Silver Symbol ໃນ MT4?",
        "choices": {
          "a": "XAGEUR",
          "b": "XAGUSD",
          "c": "SILUSD"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Gold ໃຊ້ Hedge ຫຍັງ?",
        "choices": {
          "a": "Inflation + ຄວາມຜັນຜວນ",
          "b": "Spread",
          "c": "Volume"
        },
        "correctAnswer": "a"
      },
      {
        "question": "ຊ່ວງ London-NY Gold Active ຍ້ອນຫຍັງ?",
        "choices": {
          "a": "Tokyo Trade Gold ຫຼາຍ",
          "b": "London Commodities + NY Futures",
          "c": "Sydney"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ATR Gold ສ່ວນໃຫຍ່ປະມານເທົ່າໃດຕໍ່ວັນ?",
        "choices": {
          "a": "$5-10",
          "b": "$10-30+",
          "c": "$1"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ການ Trade Gold ຕ້ອງລະວັງ?",
        "choices": {
          "a": "Spread ຖ່າງ",
          "b": "Spread ສູງ + Volatility ສູງ",
          "c": "ເວລາ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "OPEC ສົ່ງຜົນຕໍ່ຫຍັງ?",
        "choices": {
          "a": "Gold",
          "b": "Oil",
          "c": "Silver"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Commodity Currency ຄືຫຍັງ?",
        "choices": {
          "a": "USD",
          "b": "AUD, CAD, NZD",
          "c": "EUR"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Hyperinflation Gold ປົກກະຕິເປັນແນວໃດ?",
        "choices": {
          "a": "ລົງ",
          "b": "ຂຶ້ນ",
          "c": "ຄົງ"
        },
        "correctAnswer": "b"
      }
    ]
  },
  {
    "title": "Quiz 18: Options & Derivatives",
    "slug": "q18",
    "level": "advanced",
    "requiresLogin": true,
    "order": 18,
    "icon": "📉",
    "color": "EF4444",
    "totalQuestions": 15,
    "questions": [
      {
        "question": "Options Contract ໃຫ້ Right ຫຍັງ?",
        "choices": {
          "a": "ຕ້ອງ Buy/Sell",
          "b": "ສິດ (ບໍ່ແມ່ນໜ້າທີ່) Buy/Sell",
          "c": "ໃຫ້ Loan"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Call Option ໃຫ Right?",
        "choices": {
          "a": "ຂາຍ",
          "b": "ຊື້",
          "c": "Hedge"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Put Option ໃຊ້ Hedge?",
        "choices": {
          "a": "Long Position",
          "b": "Short Position",
          "c": "ທຸກ Position"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Premium ຂອງ Options ຄືຫຍັງ?",
        "choices": {
          "a": "Strike Price",
          "b": "ລາຄາຊື້ Options",
          "c": "ກຳໄລ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Strike Price ຄືຫຍັງ?",
        "choices": {
          "a": "ລາຄາຕະຫຼາດ",
          "b": "ລາຄາທີ່ Contract ຕົກລົງ",
          "c": "Premium"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Futures ຕ່າງ Options ແນວໃດ?",
        "choices": {
          "a": "ຄືກັນ",
          "b": "Futures ບັງຄັບ Execute, Options ບໍ່ບັງຄັບ",
          "c": "Futures ຖືກກວ່າ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Options Greeks Delta ໝາຍເຖິງ?",
        "choices": {
          "a": "ເວລາ Decay",
          "b": "ການປ່ຽນ Option Price ຕາມ Underlying",
          "c": "Volatility"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Implied Volatility ສູງ Options Premium?",
        "choices": {
          "a": "ຕ່ຳ",
          "b": "ສູງ",
          "c": "ຄົງທີ່"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Expiration Date ໃນ Options ຄືຫຍັງ?",
        "choices": {
          "a": "ວັນ Buy",
          "b": "ວັນ Options ໝົດອາຍຸ",
          "c": "ວັນ Profit"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Forex Options ໃຊ Hedge ໃນ Business ແນວໃດ?",
        "choices": {
          "a": "Speculation",
          "b": "Lock Exchange Rate ໃນອະນາຄົດ",
          "c": "ຫຼຸດ Spread"
        },
        "correctAnswer": "b"
      },
      {
        "question": "CFD ຄືຫຍັງ?",
        "choices": {
          "a": "Commodity For Dollar",
          "b": "Contract For Difference",
          "c": "Currency For Dollar"
        },
        "correctAnswer": "b"
      },
      {
        "question": "CFD ໃນ Forex ໝາຍເຖິງຫຍັງ?",
        "choices": {
          "a": "ຊື້/ຂາຍ Asset ຈິງ",
          "b": "Speculate ໃນ Price Movement ໂດຍບໍ່ໄດ້ Asset ຈິງ",
          "c": "ຝາກ Margin"
        },
        "correctAnswer": "b"
      },
      {
        "question": "Swap Rate ໃນ Futures ຄື?",
        "choices": {
          "a": "ຄືກັນກັບ Forex Swap",
          "b": "Cost of Carry",
          "c": "ຟຣີ"
        },
        "correctAnswer": "b"
      },
      {
        "question": "VIX ໃຊ້ວັດຫຍັງ?",
        "choices": {
          "a": "Forex Volume",
          "b": "Market Volatility/Fear Index",
          "c": "Gold Price"
        },
        "correctAnswer": "b"
      },
      {
        "question": "ໃນ Risk Management Options ໃຊ້ວັດຫຍັງ?",
        "choices": {
          "a": "Speculation ດຽວ",
          "b": "Hedging + Speculation",
          "c": "ໃຊ້ວັດ Forex"
        },
        "correctAnswer": "b"
      }
    ]
  }
]

async function seed() {
  console.log("🚀 Seeding 12 Quiz ໃໝ່...")
  let ok = 0, fail = 0
  for (const quiz of quizzes) {
    try {
      await client.createOrReplace({
        ...quiz,
        _type: "quiz",
        _id: `quiz-${quiz.slug}`,
      })
      console.log(`✅ ${quiz.title} (${quiz.totalQuestions} ຂໍ້)`)
      ok++
    } catch(e) {
      console.error(`❌ ${quiz.title}:`, e.message)
      fail++
    }
  }
  console.log(`\n✅ ສຳເລັດ: ${ok} | ❌ ລົ້ມ: ${fail}`)
}
seed().catch(console.error)
