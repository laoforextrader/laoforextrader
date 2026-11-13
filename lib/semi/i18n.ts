// Three languages for the Semi dashboard. English is the default: the site
// itself is Lao, but this screen is an instrument panel and its owner asked
// for English to lead.
//
// Trading terms are NOT translated — Manual/Semi/Auto, Buy/Sell, Equity, Grid
// and the rest stay in English in every language, because that is what the
// MT5 panel, the broker statement and the trader all say. Only prose moves.
// They live in TERMS and are merged into each dictionary, so adding a fourth
// language cannot accidentally translate one of them.

export type Lang = "en" | "th" | "lo"
export const LANGS: Lang[] = ["en", "th", "lo"]
export const LANG_LABEL: Record<Lang, string> = { en: "EN", th: "ไทย", lo: "ລາວ" }

const TERMS = {
  modes: ["Manual", "Semi", "Auto"] as const,
  buy: "Buy", sell: "Sell", close: "Close", stop: "Stop", closeAll: "Close all",
  firstLot: "First lot", grid: "Grid", guard: "Guard", reset: "Reset",
  equity: "Equity", floating: "Floating", balance: "Balance", today: "Today", free: "Free",
  meters: "Meters", trend: "Trend", speed: "Speed", atr: "ATR", spread: "Spread",
  level: "Level", lots: "Lots", be: "B/E", target: "Target", toGo: "To go", pl: "P/L",
  idle: "Idle", active: "Active", stopped: "Stopped", flat: "Flat",
  account: "Account", broker: "Broker", openPos: "Open positions",
  rounds: "Closed rounds", depth: "Depth", result: "Result", opened: "Opened",
  engines: "Engines", ladder: "Ladder",
}

const PROSE = {
  en: {
    dash: "Dashboard", history: "History", owner: "Owner",
    online: "Live", offline: "EA offline", updated: "updated", secAgo: "s ago",
    setup: "Before you press", fullBasket: "full ladder",
    link: "Link your account", acctNo: "MT5 account number", key: "Dashboard key",
    keyHelp: "The key is on the EA panel and in the Experts tab when the EA starts.",
    connect: "Connect", signInFirst: "Sign in to continue",
    linked: "Account linked. Waiting for the EA to report.",
    noAccounts: "No account linked yet.",
    confirmClose: "Close every open position on this account?",
    sent: "Command sent", failed: "Could not send",
    offlineNote: "The EA has not reported recently — the command expires in 60 seconds.",
    nothing: "Nothing open",
    waiting: "Waiting for the first report from the EA…",
    overCap: "Ladder is larger than this balance supports",
    guardHit: "Equity guard stopped new baskets",
    algoOff: "Algo Trading is off in MT5 — the EA cannot send orders",
    notifyTitle: "Phone alerts",
    notifyOn: "Alerts are sent to the MT5 app on your phone",
    notifyOff: "Alerts are off",
    notifyNoId: "No MetaQuotes ID in MT5 — add it under Tools → Options → Notifications",
    whyIdle: "Why it is not opening",
    signOut: "Sign out", signIn: "Sign in again",
    sessionLost: "Your sign-in has expired. Sign in again to control the EA.",
    offlineLock: "EA offline — the controls are locked until it reports again.",
    sending: "Sending…", queued: "Waiting for the EA to pick it up…", doneSent: "Done",
    curve: "Equity curve", collecting: "Collecting — the curve starts after a few minutes",
  },
  th: {
    dash: "แดชบอร์ด", history: "ประวัติ", owner: "เจ้าของบัญชี",
    online: "สด", offline: "EA ไม่ได้เชื่อมต่อ", updated: "อัปเดต", secAgo: " วิที่แล้ว",
    setup: "ตั้งค่าก่อนกด", fullBasket: "เต็มบันได",
    link: "ผูกบัญชีของคุณ", acctNo: "เลขบัญชี MT5", key: "คีย์แดชบอร์ด",
    keyHelp: "คีย์อยู่บนแผงของ EA และในแท็บ Experts ตอน EA เริ่มทำงาน",
    connect: "เชื่อมต่อ", signInFirst: "เข้าสู่ระบบก่อนใช้งาน",
    linked: "ผูกบัญชีแล้ว กำลังรอ EA ส่งข้อมูล",
    noAccounts: "ยังไม่ได้ผูกบัญชี",
    confirmClose: "ปิดไม้ทั้งหมดของบัญชีนี้ใช่ไหม",
    sent: "ส่งคำสั่งแล้ว", failed: "ส่งคำสั่งไม่สำเร็จ",
    offlineNote: "EA ยังไม่ได้ส่งข้อมูลมาสักพัก คำสั่งจะหมดอายุใน 60 วินาที",
    nothing: "ไม่มีไม้ที่เปิดอยู่",
    waiting: "กำลังรอข้อมูลชุดแรกจาก EA…",
    overCap: "บันไดใหญ่เกินทุนที่มี",
    guardHit: "Equity guard หยุดการเปิดตะกร้าใหม่แล้ว",
    algoOff: "ปุ่ม Algo Trading ใน MT5 ปิดอยู่ — EA ส่งคำสั่งไม่ได้",
    notifyTitle: "แจ้งเตือนเข้ามือถือ",
    notifyOn: "ส่งแจ้งเตือนเข้าแอป MT5 บนมือถือ",
    notifyOff: "ปิดการแจ้งเตือนอยู่",
    notifyNoId: "ยังไม่ได้ใส่ MetaQuotes ID ใน MT5 — ใส่ที่ Tools → Options → Notifications",
    whyIdle: "ทำไมยังไม่เปิดไม้",
    signOut: "ออกจากระบบ", signIn: "เข้าสู่ระบบอีกครั้ง",
    sessionLost: "การเข้าสู่ระบบหมดอายุ เข้าสู่ระบบใหม่เพื่อสั่งงาน EA",
    offlineLock: "EA ไม่ได้เชื่อมต่อ — ล็อกปุ่มควบคุมไว้จนกว่าจะส่งข้อมูลกลับมา",
    sending: "กำลังส่ง…", queued: "รอ EA มารับคำสั่ง…", doneSent: "สำเร็จ",
    curve: "เส้นการเติบโต", collecting: "กำลังเก็บข้อมูล เส้นจะขึ้นหลังผ่านไปไม่กี่นาที",
  },
  lo: {
    dash: "ແດຊບອດ", history: "ປະຫວັດ", owner: "ເຈົ້າຂອງບັນຊີ",
    online: "ສົດ", offline: "EA ບໍ່ໄດ້ເຊື່ອມຕໍ່", updated: "ອັບເດດ", secAgo: " ວິນາທີກ່ອນ",
    setup: "ຕັ້ງຄ່າກ່ອນກົດ", fullBasket: "ເຕັມຂັ້ນໄດ",
    link: "ຜູກບັນຊີຂອງທ່ານ", acctNo: "ເລກບັນຊີ MT5", key: "ກະແຈແດຊບອດ",
    keyHelp: "ກະແຈຢູ່ເທິງແຜງຂອງ EA ແລະໃນແທັບ Experts ຕອນ EA ເລີ່ມເຮັດວຽກ",
    connect: "ເຊື່ອມຕໍ່", signInFirst: "ເຂົ້າລະບົບກ່ອນໃຊ້ງານ",
    linked: "ຜູກບັນຊີແລ້ວ ກຳລັງລໍຖ້າ EA ສົ່ງຂໍ້ມູນ",
    noAccounts: "ຍັງບໍ່ໄດ້ຜູກບັນຊີ",
    confirmClose: "ປິດໄມ້ທັງໝົດຂອງບັນຊີນີ້ແມ່ນບໍ່",
    sent: "ສົ່ງຄຳສັ່ງແລ້ວ", failed: "ສົ່ງຄຳສັ່ງບໍ່ສຳເລັດ",
    offlineNote: "EA ຍັງບໍ່ໄດ້ສົ່ງຂໍ້ມູນມາໄລຍະໜຶ່ງ ຄຳສັ່ງຈະໝົດອາຍຸໃນ 60 ວິນາທີ",
    nothing: "ບໍ່ມີໄມ້ທີ່ເປີດຢູ່",
    waiting: "ກຳລັງລໍຖ້າຂໍ້ມູນຊຸດທຳອິດຈາກ EA…",
    overCap: "ຂັ້ນໄດໃຫຍ່ເກີນທຶນທີ່ມີ",
    guardHit: "Equity guard ຢຸດການເປີດກະຕ່າໃໝ່ແລ້ວ",
    algoOff: "ປຸ່ມ Algo Trading ໃນ MT5 ປິດຢູ່ — EA ສົ່ງຄຳສັ່ງບໍ່ໄດ້",
    notifyTitle: "ແຈ້ງເຕືອນເຂົ້າມືຖື",
    notifyOn: "ສົ່ງແຈ້ງເຕືອນເຂົ້າແອັບ MT5 ເທິງມືຖື",
    notifyOff: "ປິດການແຈ້ງເຕືອນຢູ່",
    notifyNoId: "ຍັງບໍ່ໄດ້ໃສ່ MetaQuotes ID ໃນ MT5 — ໃສ່ທີ່ Tools → Options → Notifications",
    whyIdle: "ເປັນຫຍັງຍັງບໍ່ເປີດໄມ້",
    signOut: "ອອກຈາກລະບົບ", signIn: "ເຂົ້າລະບົບອີກຄັ້ງ",
    sessionLost: "ການເຂົ້າລະບົບໝົດອາຍຸ ເຂົ້າລະບົບໃໝ່ເພື່ອສັ່ງງານ EA",
    offlineLock: "EA ບໍ່ໄດ້ເຊື່ອມຕໍ່ — ລັອກປຸ່ມຄວບຄຸມໄວ້ຈົນກວ່າຈະສົ່ງຂໍ້ມູນກັບມາ",
    sending: "ກຳລັງສົ່ງ…", queued: "ລໍຖ້າ EA ມາຮັບຄຳສັ່ງ…", doneSent: "ສຳເລັດ",
    curve: "ເສັ້ນການເຕີບໂຕ", collecting: "ກຳລັງເກັບຂໍ້ມູນ ເສັ້ນຈະຂຶ້ນຫຼັງຜ່ານໄປບໍ່ຫຼາຍນາທີ",
  },
}

export type Dict = typeof PROSE.en & typeof TERMS
export const DICT: Record<Lang, Dict> = {
  en: { ...PROSE.en, ...TERMS },
  th: { ...PROSE.th, ...TERMS },
  lo: { ...PROSE.lo, ...TERMS },
}

export function pickLang(raw: string | null | undefined): Lang {
  return raw === "th" || raw === "lo" ? raw : "en"
}
