// UI strings for the contest pages, in the site's three languages.
//
// Only the furniture lives here. Everything the owner may want to reword
// between rounds — rules, prizes, perks — comes from the `contest` document
// in Sanity, already written in all three languages.
//
// Trading terms stay in English in every language, the same rule the Semi
// dashboard follows: that is what MT5, the broker statement and the trader
// all say.

export type Lang = "en" | "th" | "lo"
export const LANGS: Lang[] = ["en", "th", "lo"]
export const LANG_LABEL: Record<Lang, string> = { en: "EN", th: "ไทย", lo: "ລາວ" }

export function pickLang(v: unknown): Lang {
  return v === "th" || v === "lo" || v === "en" ? v : "lo"
}

/** Pull one language out of a Sanity locale object, falling back sensibly. */
export function loc(v: { en?: string; th?: string; lo?: string } | undefined, lang: Lang): string {
  if (!v) return ""
  return v[lang] || v.en || v.lo || v.th || ""
}

const TERMS = {
  equity: "Equity", balance: "Balance", profit: "Profit", drawdown: "Drawdown",
  lots: "Lots", trades: "Trades", demo: "Demo", broker: "Broker", server: "Server",
  login: "Login", vps: "VPS", ea: "EA",
}

const PROSE = {
  en: {
    pageTitle: "Demo Trading Contest",
    tagline: "Trade a demo account with our Semi EA. Biggest profit wins.",
    register: "Register",
    registerOpen: "Registration is open",
    registerClosed: "Registration is closed",
    startsIn: "Starts in", endsIn: "Ends in", resultsIn: "Results in",
    live: "Running now", judging: "Checking results", finished: "Finished",
    prizes: "Prizes", perks: "Early bird", rules: "Rules", leaderboard: "Leaderboard",
    rank: "Rank", trader: "Trader", account: "Account", lastSeen: "Last update",
    noEntries: "No one on the board yet. The first numbers appear when the EA starts sending.",
    unverified: "Live numbers come from each contestant's EA and are not verified yet. The top 5 are checked with a read-only investor password before the result is announced.",
    howTitle: "How to join",
    how: [
      "Open an Exness account — skip this if you already have one.",
      "Create a Standard DEMO account in MT5.",
      "Top the demo up to the starting balance in the requirements below. Everyone starts from the same number.",
      "Register here with your Google account — you get an entry code straight away.",
      "Install the contest EA, put the entry code in its settings, and leave it running before the start time.",
    ],
    myEntry: "Your entry", yourCode: "Your entry code", copied: "Copied",
    signInFirst: "Sign in with Google to register",
    name: "Name shown on the board", contact: "Telegram or WhatsApp", country: "Country",
    mtLogin: "MT5 account number", mtServer: "MT5 server",
    submit: "Get my entry code", submitting: "Registering…",
    doneTitle: "You are registered",
    doneBody: "Keep this code. Put it in the contest EA's settings — it is how the board knows the account is yours.",
    errAlready: "You have already registered for this round.",
    errLogin: "That MT5 account number is already registered.",
    errClosed: "Registration for this round is closed.",
    errFull: "This round is full.",
    errGeneric: "Something went wrong. Try again.",
    earlyBirdYou: "You are in the first few — the VPS perk is yours.",
    winners: "Winners", verified: "verified", spotsLeft: "spots left",
    openAccount: "Open an Exness account", requirements: "Requirements to enter",
    startingBalance: "Starting balance",
    archive: "Past rounds", viewRound: "View round",
    days: "d", hours: "h", minutes: "m", seconds: "s",
    waitingEa: "waiting for EA", blown: "account blown", flagged: "under review",
  },
  th: {
    pageTitle: "การแข่งขันเทรดบัญชีเดโม",
    tagline: "เทรดบัญชีเดโมด้วย Semi EA ของเรา ใครกำไรสูงสุดคือผู้ชนะ",
    register: "ลงทะเบียน",
    registerOpen: "เปิดรับลงทะเบียน",
    registerClosed: "ปิดรับลงทะเบียนแล้ว",
    startsIn: "เริ่มในอีก", endsIn: "เหลืออีก", resultsIn: "ประกาศผลในอีก",
    live: "กำลังแข่ง", judging: "กำลังตรวจผล", finished: "จบแล้ว",
    prizes: "รางวัล", perks: "สิทธิพิเศษผู้สมัครก่อน", rules: "กติกา", leaderboard: "กระดานอันดับ",
    rank: "อันดับ", trader: "ผู้เข้าแข่งขัน", account: "บัญชี", lastSeen: "อัปเดตล่าสุด",
    noEntries: "ยังไม่มีใครบนกระดาน ตัวเลขแรกจะขึ้นเมื่อ EA เริ่มส่งข้อมูล",
    unverified: "ตัวเลขบนกระดานมาจาก EA ของผู้เข้าแข่งขันแต่ละคน ยังไม่ผ่านการตรวจสอบ · 5 อันดับแรกจะถูกตรวจด้วย investor password แบบอ่านอย่างเดียวก่อนประกาศผล",
    howTitle: "วิธีเข้าร่วม",
    how: [
      "เปิดบัญชี Exness — ถ้ามีอยู่แล้วข้ามข้อนี้ได้เลย",
      "สร้างบัญชีเดโมประเภท Standard ใน MT5",
      "เติมเงินเดโมให้เท่ากับทุนเริ่มต้นในข้อกำหนดด้านล่าง ทุกคนเริ่มที่ตัวเลขเดียวกัน",
      "ลงทะเบียนที่หน้านี้ด้วยบัญชี Google ของคุณ รับรหัสผู้แข่งทันที",
      "ติดตั้ง EA สำหรับการแข่งขัน ใส่รหัสผู้แข่งในช่องตั้งค่า แล้วเปิดทิ้งไว้ก่อนเวลาเริ่มแข่ง",
    ],
    myEntry: "การลงทะเบียนของคุณ", yourCode: "รหัสผู้แข่งของคุณ", copied: "คัดลอกแล้ว",
    signInFirst: "เข้าสู่ระบบด้วย Google เพื่อลงทะเบียน",
    name: "ชื่อที่แสดงบนกระดาน", contact: "Telegram หรือ WhatsApp", country: "ประเทศ",
    mtLogin: "เลขบัญชี MT5", mtServer: "เซิร์ฟเวอร์ MT5",
    submit: "รับรหัสผู้แข่ง", submitting: "กำลังลงทะเบียน…",
    doneTitle: "ลงทะเบียนเรียบร้อย",
    doneBody: "เก็บรหัสนี้ไว้ ใส่ในช่องตั้งค่าของ EA สำหรับการแข่งขัน รหัสนี้คือสิ่งที่บอกกระดานว่าบัญชีนี้เป็นของคุณ",
    errAlready: "คุณลงทะเบียนรอบนี้ไปแล้ว",
    errLogin: "เลขบัญชี MT5 นี้มีคนลงทะเบียนแล้ว",
    errClosed: "รอบนี้ปิดรับลงทะเบียนแล้ว",
    errFull: "รอบนี้เต็มแล้ว",
    errGeneric: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง",
    earlyBirdYou: "คุณอยู่ในกลุ่มผู้สมัครกลุ่มแรก ได้สิทธิ์ VPS ฟรี",
    winners: "ผู้ชนะ", verified: "ตรวจแล้ว", spotsLeft: "สิทธิ์ที่เหลือ",
    openAccount: "เปิดบัญชี Exness", requirements: "ข้อกำหนดการสมัคร",
    startingBalance: "ทุนเริ่มต้น",
    archive: "รอบที่ผ่านมา", viewRound: "ดูรอบนี้",
    days: "วัน", hours: "ชม.", minutes: "นาที", seconds: "วิ",
    waitingEa: "รอ EA ส่งข้อมูล", blown: "ล้างพอร์ต", flagged: "รอตรวจสอบ",
  },
  lo: {
    pageTitle: "ການແຂ່ງຂັນເທຣດບັນຊີເດໂມ",
    tagline: "ເທຣດບັນຊີເດໂມດ້ວຍ Semi EA ຂອງພວກເຮົາ ໃຜກຳໄລສູງສຸດຄືຜູ້ຊະນະ",
    register: "ລົງທະບຽນ",
    registerOpen: "ເປີດຮັບລົງທະບຽນ",
    registerClosed: "ປິດຮັບລົງທະບຽນແລ້ວ",
    startsIn: "ເລີ່ມໃນອີກ", endsIn: "ເຫຼືອອີກ", resultsIn: "ປະກາດຜົນໃນອີກ",
    live: "ກຳລັງແຂ່ງ", judging: "ກຳລັງກວດຜົນ", finished: "ຈົບແລ້ວ",
    prizes: "ລາງວັນ", perks: "ສິດທິພິເສດຜູ້ສະໝັກກ່ອນ", rules: "ກະຕິກາ", leaderboard: "ກະດານອັນດັບ",
    rank: "ອັນດັບ", trader: "ຜູ້ເຂົ້າແຂ່ງຂັນ", account: "ບັນຊີ", lastSeen: "ອັບເດດລ່າສຸດ",
    noEntries: "ຍັງບໍ່ມີໃຜເທິງກະດານ ຕົວເລກທຳອິດຈະຂຶ້ນເມື່ອ EA ເລີ່ມສົ່ງຂໍ້ມູນ",
    unverified: "ຕົວເລກເທິງກະດານມາຈາກ EA ຂອງຜູ້ເຂົ້າແຂ່ງຂັນແຕ່ລະຄົນ ຍັງບໍ່ໄດ້ກວດສອບ · 5 ອັນດັບທຳອິດຈະຖືກກວດດ້ວຍ investor password ແບບອ່ານຢ່າງດຽວກ່ອນປະກາດຜົນ",
    howTitle: "ວິທີເຂົ້າຮ່ວມ",
    how: [
      "ເປີດບັນຊີ Exness — ຖ້າມີຢູ່ແລ້ວຂ້າມຂໍ້ນີ້ໄດ້ເລີຍ",
      "ສ້າງບັນຊີເດໂມປະເພດ Standard ໃນ MT5",
      "ເຕີມເງິນເດໂມໃຫ້ເທົ່າກັບທຶນເລີ່ມຕົ້ນໃນຂໍ້ກຳນົດຂ້າງລຸ່ມ ທຸກຄົນເລີ່ມທີ່ຕົວເລກດຽວກັນ",
      "ລົງທະບຽນທີ່ໜ້ານີ້ດ້ວຍບັນຊີ Google ຂອງທ່ານ ຮັບລະຫັດຜູ້ແຂ່ງທັນທີ",
      "ຕິດຕັ້ງ EA ສຳລັບການແຂ່ງຂັນ ໃສ່ລະຫັດຜູ້ແຂ່ງໃນຊ່ອງຕັ້ງຄ່າ ແລ້ວເປີດຖິ້ມໄວ້ກ່ອນເວລາເລີ່ມແຂ່ງ",
    ],
    myEntry: "ການລົງທະບຽນຂອງທ່ານ", yourCode: "ລະຫັດຜູ້ແຂ່ງຂອງທ່ານ", copied: "ສຳເນົາແລ້ວ",
    signInFirst: "ເຂົ້າສູ່ລະບົບດ້ວຍ Google ເພື່ອລົງທະບຽນ",
    name: "ຊື່ທີ່ສະແດງເທິງກະດານ", contact: "Telegram ຫຼື WhatsApp", country: "ປະເທດ",
    mtLogin: "ເລກບັນຊີ MT5", mtServer: "ເຊີບເວີ MT5",
    submit: "ຮັບລະຫັດຜູ້ແຂ່ງ", submitting: "ກຳລັງລົງທະບຽນ…",
    doneTitle: "ລົງທະບຽນຮຽບຮ້ອຍ",
    doneBody: "ເກັບລະຫັດນີ້ໄວ້ ໃສ່ໃນຊ່ອງຕັ້ງຄ່າຂອງ EA ສຳລັບການແຂ່ງຂັນ ລະຫັດນີ້ຄືສິ່ງທີ່ບອກກະດານວ່າບັນຊີນີ້ເປັນຂອງທ່ານ",
    errAlready: "ທ່ານລົງທະບຽນຮອບນີ້ໄປແລ້ວ",
    errLogin: "ເລກບັນຊີ MT5 ນີ້ມີຄົນລົງທະບຽນແລ້ວ",
    errClosed: "ຮອບນີ້ປິດຮັບລົງທະບຽນແລ້ວ",
    errFull: "ຮອບນີ້ເຕັມແລ້ວ",
    errGeneric: "ເກີດຂໍ້ຜິດພາດ ລອງໃໝ່ອີກຄັ້ງ",
    earlyBirdYou: "ທ່ານຢູ່ໃນກຸ່ມຜູ້ສະໝັກກຸ່ມທຳອິດ ໄດ້ສິດ VPS ຟຣີ",
    winners: "ຜູ້ຊະນະ", verified: "ກວດແລ້ວ", spotsLeft: "ສິດທິທີ່ເຫຼືອ",
    openAccount: "ເປີດບັນຊີ Exness", requirements: "ຂໍ້ກຳນົດການສະໝັກ",
    startingBalance: "ທຶນເລີ່ມຕົ້ນ",
    archive: "ຮອບທີ່ຜ່ານມາ", viewRound: "ເບິ່ງຮອບນີ້",
    days: "ມື້", hours: "ຊມ.", minutes: "ນາທີ", seconds: "ວິ",
    waitingEa: "ລໍ EA ສົ່ງຂໍ້ມູນ", blown: "ລ້າງພອດ", flagged: "ລໍກວດສອບ",
  },
}

export const DICT: Record<Lang, typeof PROSE.en & typeof TERMS> = {
  en: { ...PROSE.en, ...TERMS },
  th: { ...PROSE.th, ...TERMS },
  lo: { ...PROSE.lo, ...TERMS },
}
