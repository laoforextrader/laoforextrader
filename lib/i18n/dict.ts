import type { Lang } from "@/lib/i18n/lang"

//  The site's furniture, in three languages.
//
//  Furniture only: menus, buttons, labels, the lines a form says back to
//  you. Articles, lessons and broker reviews are content and live in Sanity
//  — they are not in here and never should be, or every new article would
//  mean a code change.
//
//  Lao is the source. When a string is added it is written in Lao first and
//  the other two follow, because a Thai sentence translated from English
//  that was translated from Lao ends up saying something nobody meant.
//
//  Trading terms stay in English in all three (lot, spread, equity, EA,
//  Stop Loss, Grid) — see lib/i18n/lang.ts.

export interface Strings {
  nav: {
    broker: string; ea: string; signal: string; lessons: string
    education: string; quizzes: string; news: string; analysis: string; tools: string
    search: string; menu: string; language: string
  }
  auth: {
    login: string; account: string; signOut: string
    joinTitle: string; joinLead: string
    fillTitle: string; fillLead: string
    google: string; orFill: string
    name: string; email: string; phone: string; avatar: string
    avatarHint: string; terms: string; termsLink: string
    submit: string; sending: string; close: string
    mailedTitle: string; mailedLead: string; mailedSpam: string
    searchCountry: string
    err: {
      name: string; email: string; phone: string; terms: string
      tooMany: string; mail: string; imageBig: string; imageType: string
      upload: string; save: string; network: string
    }
  }
  gate: {
    lockedTitle: string; lockedLead: string
    profileTitle: string; profileLead: string
    open: string; fill: string; readTerms: string
  }
  footer: {
    content: string; tools: string; about: string
    broker: string; education: string; analysis: string; news: string
    aboutUs: string; contact: string; privacy: string
    tagline: string; madeWith: string; riskNote: string
  }
  updates: { all: string; today: string; yesterday: string; daysAgo: string }
}

const lo: Strings = {
  nav: {
    broker: "ໂບຣກເກີ", ea: "EA System", signal: "Signal", lessons: "ບົດຮຽນ",
    education: "ການສຶກສາ", quizzes: "Quizzes", news: "ຂ່າວ", analysis: "ວິເຄາະ", tools: "ເຄື່ອງມື",
    search: "ຄົ້ນຫາ", menu: "ເມນູ", language: "ພາສາ",
  },
  auth: {
    login: "ເຂົ້າສູ່ລະບົບ", account: "ບັນຊີຂອງຂ້ອຍ", signOut: "ອອກຈາກລະບົບ",
    joinTitle: "ສະໝັກສະມາຊິກ",
    joinLead: "ຕື່ມຂໍ້ມູນແລ້ວກົດສະໝັກ ຫຼື ໃຊ້ Google ເພື່ອຕື່ມໃຫ້ໄວຂຶ້ນ",
    fillTitle: "ຕື່ມຂໍ້ມູນສະມາຊິກ",
    fillLead: "ເຫຼືອອີກສອງສາມຊ່ອງ ແລ້ວກົດສະໝັກ",
    google: "ເຂົ້າດ້ວຍ Google", orFill: "ຫຼື ຕື່ມເອງ",
    name: "ຊື່", email: "ອີເມວ", phone: "ເບີໂທ", avatar: "ຮູບໂປຣໄຟລ໌",
    avatarHint: "ກົດຮູບເພື່ອປ່ຽນ ຫຼື + ເພື່ອອັບໂຫຼດ",
    terms: "ຂ້ອຍໄດ້ອ່ານ ແລະ ຍອມຮັບ", termsLink: "ເງື່ອນໄຂການໃຊ້ງານ",
    submit: "ສະໝັກ", sending: "ກຳລັງສົ່ງ...", close: "ປິດ",
    mailedTitle: "ກວດອີເມວຂອງທ່ານ",
    mailedLead: "ເປີດອີເມວແລ້ວກົດລິງກ໌ເພື່ອຢືນຢັນ ແລະ ເຂົ້າສູ່ລະບົບ — ລິງກ໌ໃຊ້ໄດ້ຄັ້ງດຽວ ພາຍໃນ 24 ຊົ່ວໂມງ.",
    mailedSpam: "ບໍ່ເຫັນອີເມວ? ກວດກ່ອງ Spam ນຳ.",
    searchCountry: "ຄົ້ນຫາປະເທດ",
    err: {
      name: "ກະລຸນາໃສ່ຊື່", email: "ອີເມວບໍ່ຖືກຕ້ອງ", phone: "ເບີໂທບໍ່ຖືກຕ້ອງ",
      terms: "ຕ້ອງຕິກຍອມຮັບເງື່ອນໄຂກ່ອນ",
      tooMany: "ລອງໃໝ່ພາຍຫຼັງ ສົ່ງຫຼາຍເທື່ອເກີນໄປ", mail: "ສົ່ງອີເມວບໍ່ສຳເລັດ ລອງໃໝ່",
      imageBig: "ຮູບໃຫຍ່ເກີນໄປ", imageType: "ຮັບສະເພາະ JPG, PNG ຫຼື WebP",
      upload: "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ", save: "ບັນທຶກບໍ່ສຳເລັດ ລອງໃໝ່",
      network: "ເຊື່ອມຕໍ່ບໍ່ໄດ້ ລອງໃໝ່",
    },
  },
  gate: {
    lockedTitle: "ສ່ວນນີ້ຕ້ອງລັອກອິນກ່ອນ",
    lockedLead: "ລິງກ໌ດາວໂຫຼດ ແລະ ຄຳສັ່ງຕິດຕັ້ງ EA ເປີດໃຫ້ສະມາຊິກທີ່ລັອກອິນ ແລະ ຍອມຮັບເງື່ອນໄຂການໃຊ້ແລ້ວເທົ່ານັ້ນ",
    profileTitle: "ຕື່ມຂໍ້ມູນສະມາຊິກກ່ອນ",
    profileLead: "ເຫຼືອອີກສອງສາມຊ່ອງ — ຊື່, ເບີໂທ ແລະ ຍອມຮັບເງື່ອນໄຂ ແລ້ວລິງກ໌ດາວໂຫຼດ ແລະ ຄຳສັ່ງຕິດຕັ້ງຈະສະແດງຂຶ້ນ",
    open: "ລັອກອິນ", fill: "ຕື່ມຂໍ້ມູນ", readTerms: "ອ່ານເງື່ອນໄຂ",
  },
  footer: {
    content: "ເນື້ອຫາ", tools: "ເຄື່ອງມື", about: "LFT",
    broker: "ລີວິວ Broker", education: "ການສຶກສາ", analysis: "ວິເຄາະ", news: "ຂ່າວ",
    aboutUs: "ກ່ຽວກັບ", contact: "ຕິດຕໍ່", privacy: "ນະໂຍບາຍ",
    tagline: "ແຫຼ່ງຂໍ້ມູນ Forex #1 ສຳລັບ Trader ລາວ",
    madeWith: "ສ້າງເພື່ອ Trader ລາວ",
    riskNote: "ການລົງທຶນມີຄວາມສ່ຽງ · ໃຊ້ຂໍ້ມູນດ້ວຍຄວາມລະມັດລະວັງ",
  },
  updates: { all: "ເບິ່ງທັງໝົດ", today: "ມື້ນີ້", yesterday: "ມື້ວານ", daysAgo: "ມື້ກ່ອນ" },
}

const th: Strings = {
  nav: {
    broker: "โบรกเกอร์", ea: "EA System", signal: "Signal", lessons: "บทเรียน",
    education: "การศึกษา", quizzes: "Quizzes", news: "ข่าว", analysis: "วิเคราะห์", tools: "เครื่องมือ",
    search: "ค้นหา", menu: "เมนู", language: "ภาษา",
  },
  auth: {
    login: "เข้าสู่ระบบ", account: "บัญชีของฉัน", signOut: "ออกจากระบบ",
    joinTitle: "สมัครสมาชิก",
    joinLead: "กรอกข้อมูลแล้วกดสมัคร หรือใช้ Google เพื่อกรอกให้เร็วขึ้น",
    fillTitle: "กรอกข้อมูลสมาชิก",
    fillLead: "เหลืออีกสองสามช่อง แล้วกดสมัคร",
    google: "เข้าด้วย Google", orFill: "หรือกรอกเอง",
    name: "ชื่อ", email: "อีเมล", phone: "เบอร์โทร", avatar: "รูปโปรไฟล์",
    avatarHint: "กดที่รูปเพื่อเปลี่ยน หรือ + เพื่ออัปโหลด",
    terms: "ฉันได้อ่านและยอมรับ", termsLink: "เงื่อนไขการใช้งาน",
    submit: "สมัคร", sending: "กำลังส่ง...", close: "ปิด",
    mailedTitle: "ตรวจอีเมลของคุณ",
    mailedLead: "เปิดอีเมลแล้วกดลิงก์เพื่อยืนยันและเข้าสู่ระบบ — ลิงก์ใช้ได้ครั้งเดียว ภายใน 24 ชั่วโมง",
    mailedSpam: "ไม่เห็นอีเมล? ตรวจกล่อง Spam ด้วย",
    searchCountry: "ค้นหาประเทศ",
    err: {
      name: "กรุณาใส่ชื่อ", email: "อีเมลไม่ถูกต้อง", phone: "เบอร์โทรไม่ถูกต้อง",
      terms: "ต้องติ๊กยอมรับเงื่อนไขก่อน",
      tooMany: "ส่งหลายครั้งเกินไป ลองใหม่ภายหลัง", mail: "ส่งอีเมลไม่สำเร็จ ลองใหม่",
      imageBig: "รูปใหญ่เกินไป", imageType: "รับเฉพาะ JPG, PNG หรือ WebP",
      upload: "อัปโหลดรูปไม่สำเร็จ", save: "บันทึกไม่สำเร็จ ลองใหม่",
      network: "เชื่อมต่อไม่ได้ ลองใหม่",
    },
  },
  gate: {
    lockedTitle: "ส่วนนี้ต้องเข้าสู่ระบบก่อน",
    lockedLead: "ลิงก์ดาวน์โหลดและคำสั่งติดตั้ง EA เปิดให้เฉพาะสมาชิกที่เข้าสู่ระบบและยอมรับเงื่อนไขแล้วเท่านั้น",
    profileTitle: "กรอกข้อมูลสมาชิกก่อน",
    profileLead: "เหลืออีกสองสามช่อง — ชื่อ เบอร์โทร และยอมรับเงื่อนไข แล้วลิงก์ดาวน์โหลดกับคำสั่งติดตั้งจะแสดงขึ้น",
    open: "เข้าสู่ระบบ", fill: "กรอกข้อมูล", readTerms: "อ่านเงื่อนไข",
  },
  footer: {
    content: "เนื้อหา", tools: "เครื่องมือ", about: "LFT",
    broker: "รีวิว Broker", education: "การศึกษา", analysis: "วิเคราะห์", news: "ข่าว",
    aboutUs: "เกี่ยวกับ", contact: "ติดต่อ", privacy: "นโยบาย",
    tagline: "แหล่งข้อมูล Forex #1 สำหรับเทรดเดอร์ลาว",
    madeWith: "สร้างเพื่อเทรดเดอร์ลาว",
    riskNote: "การลงทุนมีความเสี่ยง · ใช้ข้อมูลด้วยความระมัดระวัง",
  },
  updates: { all: "ดูทั้งหมด", today: "วันนี้", yesterday: "เมื่อวาน", daysAgo: "วันก่อน" },
}

const en: Strings = {
  nav: {
    broker: "Brokers", ea: "EA System", signal: "Signal", lessons: "Lessons",
    education: "Education", quizzes: "Quizzes", news: "News", analysis: "Analysis", tools: "Tools",
    search: "Search", menu: "Menu", language: "Language",
  },
  auth: {
    login: "Log in", account: "My account", signOut: "Sign out",
    joinTitle: "Join",
    joinLead: "Fill this in and press join, or use Google to fill the first two.",
    fillTitle: "Finish your profile",
    fillLead: "A couple of fields left, then press join.",
    google: "Continue with Google", orFill: "or fill it in",
    name: "Name", email: "Email", phone: "Phone", avatar: "Profile picture",
    avatarHint: "Tap the mark to change it, or + to upload",
    terms: "I have read and accept the", termsLink: "terms of use",
    submit: "Join", sending: "Sending...", close: "Close",
    mailedTitle: "Check your email",
    mailedLead: "Open the mail and press the link to confirm and sign in — it works once, within 24 hours.",
    mailedSpam: "Nothing there? Check the spam folder.",
    searchCountry: "Search country",
    err: {
      name: "Please enter your name", email: "That email does not look right",
      phone: "That number does not look right",
      terms: "Please accept the terms first",
      tooMany: "Too many attempts — try again later", mail: "Could not send the email, try again",
      imageBig: "That picture is too large", imageType: "JPG, PNG or WebP only",
      upload: "Upload failed", save: "Could not save, try again",
      network: "No connection, try again",
    },
  },
  gate: {
    lockedTitle: "Members only",
    lockedLead: "The download links and the install command open for members who are signed in and have accepted the terms.",
    profileTitle: "Finish your profile first",
    profileLead: "Name, phone and the terms — then the download links and the install command appear.",
    open: "Log in", fill: "Finish profile", readTerms: "Read the terms",
  },
  footer: {
    content: "Content", tools: "Tools", about: "LFT",
    broker: "Broker reviews", education: "Education", analysis: "Analysis", news: "News",
    aboutUs: "About", contact: "Contact", privacy: "Privacy",
    tagline: "The #1 Forex resource for Lao traders",
    madeWith: "Built for Lao traders",
    riskNote: "Trading carries risk · use this information carefully",
  },
  updates: { all: "See all", today: "today", yesterday: "yesterday", daysAgo: "days ago" },
}

export const DICT: Record<Lang, Strings> = { lo, th, en }

export const t = (lang: Lang): Strings => DICT[lang] ?? DICT.lo
