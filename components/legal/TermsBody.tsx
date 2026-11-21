"use client"

import { useT, useLang } from "@/components/i18n/LangProvider"
import { TERMS_VERSION } from "@/lib/terms"
import type { Lang } from "@/lib/i18n/lang"

//  The terms, in all three languages.
//
//  This page is the one piece of prose that has to be translated properly
//  rather than left in Lao: the join form asks people to tick "I have read
//  and accept", and a tick on a page somebody cannot read is not consent.
//
//  Written Lao first and translated, not the other way round — the Lao text
//  is the one the owner approved and the one that says what the EA actually
//  does.

interface Section { title: string; body: string[] }

const HEAD: Record<Lang, { kicker: string; h1a: string; h1b: string; warnTitle: string; warn: string; version: string }> = {
  lo: {
    kicker: "Terms", h1a: "ເງື່ອນໄຂ", h1b: "ການໃຊ້ງານ", warnTitle: "ອ່ານກ່ອນ",
    warn: "EA ນີ້ເປັນລະບົບ grid ທີ່ບໍ່ມີ Stop Loss ຕໍ່ໄມ້ ແລະ ສາມາດເສຍເງິນທັງບັນຊີໄດ້. ໃຫ້ໃຊ້ພຽງເງິນທີ່ທ່ານຍອມເສຍໄດ້ທັງໝົດ.",
    version: "ສະບັບ",
  },
  th: {
    kicker: "Terms", h1a: "เงื่อนไข", h1b: "การใช้งาน", warnTitle: "อ่านก่อน",
    warn: "EA นี้เป็นระบบ grid ที่ไม่มี Stop Loss ต่อไม้ และสามารถเสียเงินทั้งบัญชีได้ ให้ใช้เฉพาะเงินที่คุณยอมเสียได้ทั้งหมด",
    version: "ฉบับ",
  },
  en: {
    kicker: "Terms", h1a: "Terms", h1b: "of use", warnTitle: "Read this first",
    warn: "This EA is a grid system with no stop loss on any trade, and it can lose the whole account. Use only money you are prepared to lose entirely.",
    version: "Version",
  },
}

const SECTIONS: Record<Lang, Section[]> = {
  lo: [
    {
      title: "1. ການຍອມຮັບເງື່ອນໄຂ",
      body: [
        "ເມື່ອທ່ານຕິກຊ່ອງ “ຂ້ອຍໄດ້ອ່ານ ແລະ ຍອມຮັບເງື່ອນໄຂການໃຊ້ງານ” ຕອນສະໝັກສະມາຊິກ ແມ່ນຖືວ່າທ່ານຍອມຮັບທຸກຂໍ້ໃນໜ້ານີ້ ລວມທັງສາມຂໍ້ຂ້າງລຸ່ມນີ້.",
        "ໜຶ່ງ — ທ່ານຍິນຍອມໃຫ້ພວກເຮົາສົ່ງຂ່າວສານ, ການອັບເດດ ແລະ ຂໍ້ມູນຂອງເວັບໄປທາງອີເມວທີ່ທ່ານລົງທະບຽນໄວ້. ທຸກອີເມວມີລິງກ໌ຍົກເລີກຢູ່ທ້າຍ ແລະ ຍົກເລີກໄດ້ທຸກເວລາໂດຍບໍ່ກະທົບສິດອື່ນ.",
        "ສອງ — ທ່ານຮັບຮູ້ ແລະ ຍອມຮັບຄວາມສ່ຽງຂອງການເທຣດ ແລະ ການລົງທຶນ ວ່າສາມາດເສຍເງິນໄດ້ທັງໝົດ ແລະ ຜົນງານໃນອະດີດບໍ່ແມ່ນຄຳສັນຍາຂອງອະນາຄົດ.",
        "ສາມ — ຖ້າທ່ານດາວໂຫຼດ ຫຼື ໃຊ້ EA ຂອງພວກເຮົາ ທ່ານຍອມຮັບຂໍ້ 2 ຫາ ຂໍ້ 5 ຂ້າງລຸ່ມນີ້ດ້ວຍ.",
        "ການເປັນສະມາຊິກບໍ່ໄດ້ບັງຄັບວ່າຕ້ອງໃຊ້ EA. ຂໍ້ທີ່ກ່ຽວກັບ EA ມີຜົນສະເພາະເມື່ອທ່ານໃຊ້ມັນເທົ່ານັ້ນ.",
      ],
    },
    {
      title: "2. EA ນີ້ເຮັດວຽກແນວໃດ",
      body: [
        "EA ຂອງ TheRocket ເປັນລະບົບ grid ທີ່ເປີດໄມ້ເພີ່ມເປັນຊັ້ນໆເມື່ອລາຄາແລ່ນສວນທາງ ແລ້ວປິດທັງຕະກະຣ້າພ້ອມກັນເມື່ອລວມແລ້ວເປັນກຳໄລ. ມັນບໍ່ມີ Stop Loss ຕໍ່ໄມ້ — ນີ້ແມ່ນການອອກແບບ ບໍ່ແມ່ນຄວາມຜິດພາດ.",
        "ຕັ້ງແຕ່ 2026-11-22 ມີ input ຊື່ EquityFloorPct ໃຫ້ທ່ານຕັ້ງເສັ້ນພື້ນຕັດຂາດທຶນເອງໄດ້. ຄ່າເລີ່ມຕົ້ນແມ່ນ 0 ຄື ບໍ່ມີເສັ້ນພື້ນ ແລະ ຮັບຄວາມສ່ຽງເຕັມ 100% ຂອງບັນຊີ.",
      ],
    },
    {
      title: "3. ຄວາມສ່ຽງ — ອ່ານໃຫ້ຈົບກ່ອນໃຊ້",
      body: [
        "ລະບົບແບບນີ້ສາມາດເສຍເງິນທັງບັນຊີໄດ້ ແລະ ເຄີຍເກີດຂຶ້ນແລ້ວໃນການທົດສອບຍ້ອນຫຼັງ. ເມື່ອລາຄາແລ່ນໄປທາງດຽວເປັນໄລຍະໄກໂດຍບໍ່ຫຍໍ້ກັບ ຕະກະຣ້າຈະຖືກລາກຈົນເຕັມຂັ້ນໄດ ແລ້ວຂາດທຶນລອຍຈະໂຕຕໍ່ໄປໂດຍບໍ່ມີຈຸດຢຸດ.",
        "ຕົວເລກກຳໄລທຸກຕົວທີ່ສະແດງຢູ່ໃນເວັບນີ້ມາຈາກຊ່ວງເວລາສະເພາະ ແລະ ບໍ່ແມ່ນຄຳສັນຍາວ່າອະນາຄົດຈະເປັນແບບນັ້ນ. ຕະຫຼາດທີ່ຕ່າງອອກໄປໃຫ້ຜົນຕ່າງອອກໄປ.",
        "ການຕັ້ງເສັ້ນພື້ນຕັດຂາດທຶນບໍ່ໄດ້ແປວ່າປອດໄພຂຶ້ນ. ການວັດຜົນຂອງພວກເຮົາພົບວ່າທຸກຄັ້ງທີ່ໃສ່ເພດານໃຫ້ລະບົບນີ້ ຜົນລວມກັບແຍ່ລົງ ເພາະມັນປ່ຽນຂາດທຶນລອຍເປັນຂາດທຶນຈິງເປັນສາຍ.",
        "ໃຫ້ໃຊ້ພຽງເງິນທີ່ທ່ານຍອມເສຍໄດ້ທັງໝົດ.",
      ],
    },
    {
      title: "4. ບໍ່ແມ່ນຄຳແນະນຳການລົງທຶນ",
      body: [
        "TheRocket ເປັນເຄື່ອງມື ບໍ່ແມ່ນທີ່ປຶກສາທາງການເງິນ. ພວກເຮົາບໍ່ຮູ້ສະພາບການເງິນ ແລະ ຄວາມສາມາດຮັບຄວາມສ່ຽງຂອງທ່ານ. ການຕັດສິນໃຈເປີດບັນຊີ, ເລືອກຂະໜາດທຶນ ແລະ ເປີດ EA ແມ່ນຂອງທ່ານຜູ້ດຽວ ແລະ ຜົນທີ່ຕາມມາກໍເປັນຂອງທ່ານ.",
      ],
    },
    {
      title: "5. ລິຂະສິດ ແລະ ການໃຊ້ງານ",
      body: [
        "ສິດການໃຊ້ງານຜູກກັບເລກບັນຊີເທຣດຂອງທ່ານ ບໍ່ແມ່ນກັບໄຟລ໌. ທ່ານໃຊ້ໄດ້ກັບບັນຊີທີ່ລົງທະບຽນໄວ້ເທົ່ານັ້ນ.",
        "ຫ້າມສົ່ງຕໍ່, ຂາຍຕໍ່, ແຈກຢາຍ ຫຼື ແກະຖອດໄຟລ໌ EA. ການເຮັດແບບນັ້ນຖືວ່າສິດສິ້ນສຸດທັນທີໂດຍບໍ່ຕ້ອງແຈ້ງລ່ວງໜ້າ.",
        "ບັນຊີເດໂມໃຊ້ໄດ້ບໍ່ຈຳກັດ ແລະ ບໍ່ຕ້ອງລົງທະບຽນ.",
      ],
    },
    {
      title: "6. ຂໍ້ມູນທີ່ພວກເຮົາເກັບ",
      body: [
        "ເມື່ອທ່ານສະໝັກສະມາຊິກ ພວກເຮົາເກັບ: ອີເມວ, ຊື່ທີ່ທ່ານໃສ່, ເບີໂທ ແລະ ຮູບໂປຣໄຟລ໌ທີ່ທ່ານເລືອກ.",
        "ອີເມວ ແລະ ເບີໂທຖືກເຂົ້າລະຫັດກ່ອນບັນທຶກ ແລະ ເປີດອ່ານໄດ້ສະເພາະຝັ່ງເຊີບເວີຂອງພວກເຮົາ. ພວກເຮົາບໍ່ຂາຍຂໍ້ມູນໃຫ້ບຸກຄົນທີສາມ.",
        "EA ສົ່ງສະຖິຕິການເທຣດຂອງບັນຊີທີ່ລົງທະບຽນມາທີ່ເວັບ ເພື່ອສະແດງຜົນ ແລະ ກວດສິດການໃຊ້ງານ. ມັນບໍ່ສົ່ງລະຫັດຜ່ານ ແລະ ບໍ່ສາມາດຖອນເງິນໄດ້.",
        "ທ່ານຂໍລຶບຂໍ້ມູນທັງໝົດໄດ້ທຸກເວລາທີ່ laoforextrader@gmail.com",
      ],
    },
    {
      title: "7. ອີເມວ",
      body: [
        "ການຍອມຮັບເງື່ອນໄຂຕອນສະໝັກ (ຂໍ້ 1) ລວມການອະນຸຍາດໃຫ້ພວກເຮົາສົ່ງເລື່ອງການອັບເດດ EA, ເວີຊັນໃໝ່ ແລະ ຂ່າວຂອງເວັບໄປທາງອີເມວ.",
        "ພວກເຮົາສົ່ງເທົ່າທີ່ຈຳເປັນ ບໍ່ສົ່ງໂຄສະນາຂອງຄົນອື່ນ ແລະ ບໍ່ໃຫ້ອີເມວຂອງທ່ານແກ່ບຸກຄົນທີສາມ.",
        "ທຸກອີເມວມີລິງກ໌ຍົກເລີກຢູ່ທ້າຍ ແລະ ຍົກເລີກໄດ້ເອງໃນໜ້າໂປຣໄຟລ໌. ການຍົກເລີກບໍ່ກະທົບສິດການໃຊ້ EA.",
      ],
    },
    {
      title: "8. ການຮັບປະກັນ ແລະ ຄວາມຮັບຜິດຊອບ",
      body: [
        "EA ໃຫ້ມາຕາມສະພາບທີ່ເປັນຢູ່ ໂດຍບໍ່ມີການຮັບປະກັນວ່າຈະມີກຳໄລ ຫຼື ຈະເຮັດວຽກໄດ້ຕໍ່ເນື່ອງ. ໂບຣກເກີ, ອິນເຕີເນັດ, VPS ແລະ MetaTrader ເປັນສິ່ງທີ່ພວກເຮົາຄວບຄຸມບໍ່ໄດ້.",
        "ພວກເຮົາບໍ່ຮັບຜິດຊອບຕໍ່ການຂາດທຶນທີ່ເກີດຈາກການໃຊ້ EA ບໍ່ວ່າຈະໃນກໍລະນີໃດ.",
      ],
    },
    {
      title: "9. ການປ່ຽນແປງເງື່ອນໄຂ",
      body: [
        "ເມື່ອເງື່ອນໄຂນີ້ປ່ຽນໃນສາລະສຳຄັນ ພວກເຮົາຈະຂໍໃຫ້ທ່ານຍອມຮັບໃໝ່ໃນເທື່ອຕໍ່ໄປທີ່ເຂົ້າໜ້າດາວໂຫຼດ. ສະບັບປັດຈຸບັນລະບຸຢູ່ທ້າຍໜ້ານີ້.",
      ],
    },
  ],

  th: [
    {
      title: "1. การยอมรับเงื่อนไข",
      body: [
        "เมื่อคุณติ๊กช่อง “ฉันได้อ่านและยอมรับเงื่อนไขการใช้งาน” ตอนสมัครสมาชิก ถือว่าคุณยอมรับทุกข้อในหน้านี้ รวมทั้งสามข้อข้างล่างนี้",
        "หนึ่ง — คุณยินยอมให้เราส่งข่าวสาร การอัปเดต และข้อมูลของเว็บไปทางอีเมลที่คุณลงทะเบียนไว้ ทุกอีเมลมีลิงก์ยกเลิกอยู่ท้าย และยกเลิกได้ทุกเวลาโดยไม่กระทบสิทธิอื่น",
        "สอง — คุณรับรู้และยอมรับความเสี่ยงของการเทรดและการลงทุน ว่าสามารถเสียเงินได้ทั้งหมด และผลงานในอดีตไม่ใช่คำสัญญาของอนาคต",
        "สาม — ถ้าคุณดาวน์โหลดหรือใช้ EA ของเรา คุณยอมรับข้อ 2 ถึงข้อ 5 ข้างล่างนี้ด้วย",
        "การเป็นสมาชิกไม่ได้บังคับว่าต้องใช้ EA ข้อที่เกี่ยวกับ EA มีผลเฉพาะเมื่อคุณใช้มันเท่านั้น",
      ],
    },
    {
      title: "2. EA นี้ทำงานอย่างไร",
      body: [
        "EA ของ TheRocket เป็นระบบ grid ที่เปิดไม้เพิ่มเป็นชั้น ๆ เมื่อราคาวิ่งสวนทาง แล้วปิดทั้งตะกร้าพร้อมกันเมื่อรวมแล้วเป็นกำไร มันไม่มี Stop Loss ต่อไม้ — นี่คือการออกแบบ ไม่ใช่ความผิดพลาด",
        "ตั้งแต่ 2026-11-22 มี input ชื่อ EquityFloorPct ให้คุณตั้งเส้นพื้นตัดขาดทุนเองได้ ค่าเริ่มต้นคือ 0 คือไม่มีเส้นพื้น และรับความเสี่ยงเต็ม 100% ของบัญชี",
      ],
    },
    {
      title: "3. ความเสี่ยง — อ่านให้จบก่อนใช้",
      body: [
        "ระบบแบบนี้สามารถเสียเงินทั้งบัญชีได้ และเคยเกิดขึ้นแล้วในการทดสอบย้อนหลัง เมื่อราคาวิ่งไปทางเดียวเป็นระยะไกลโดยไม่ย่อกลับ ตะกร้าจะถูกลากจนเต็มบันได แล้วขาดทุนลอยจะโตต่อไปโดยไม่มีจุดหยุด",
        "ตัวเลขกำไรทุกตัวที่แสดงอยู่ในเว็บนี้มาจากช่วงเวลาเฉพาะ และไม่ใช่คำสัญญาว่าอนาคตจะเป็นแบบนั้น ตลาดที่ต่างออกไปให้ผลต่างออกไป",
        "การตั้งเส้นพื้นตัดขาดทุนไม่ได้แปลว่าปลอดภัยขึ้น การวัดผลของเราพบว่าทุกครั้งที่ใส่เพดานให้ระบบนี้ ผลรวมกลับแย่ลง เพราะมันเปลี่ยนขาดทุนลอยเป็นขาดทุนจริงเป็นสาย",
        "ให้ใช้เฉพาะเงินที่คุณยอมเสียได้ทั้งหมด",
      ],
    },
    {
      title: "4. ไม่ใช่คำแนะนำการลงทุน",
      body: [
        "TheRocket เป็นเครื่องมือ ไม่ใช่ที่ปรึกษาทางการเงิน เราไม่รู้สภาพการเงินและความสามารถรับความเสี่ยงของคุณ การตัดสินใจเปิดบัญชี เลือกขนาดทุน และเปิด EA เป็นของคุณผู้เดียว และผลที่ตามมาก็เป็นของคุณ",
      ],
    },
    {
      title: "5. ลิขสิทธิ์และการใช้งาน",
      body: [
        "สิทธิการใช้งานผูกกับเลขบัญชีเทรดของคุณ ไม่ใช่กับไฟล์ คุณใช้ได้กับบัญชีที่ลงทะเบียนไว้เท่านั้น",
        "ห้ามส่งต่อ ขายต่อ แจกจ่าย หรือแกะถอดไฟล์ EA การทำแบบนั้นถือว่าสิทธิสิ้นสุดทันทีโดยไม่ต้องแจ้งล่วงหน้า",
        "บัญชีเดโมใช้ได้ไม่จำกัดและไม่ต้องลงทะเบียน",
      ],
    },
    {
      title: "6. ข้อมูลที่เราเก็บ",
      body: [
        "เมื่อคุณสมัครสมาชิก เราเก็บ: อีเมล ชื่อที่คุณใส่ เบอร์โทร และรูปโปรไฟล์ที่คุณเลือก",
        "อีเมลและเบอร์โทรถูกเข้ารหัสก่อนบันทึก และเปิดอ่านได้เฉพาะฝั่งเซิร์ฟเวอร์ของเรา เราไม่ขายข้อมูลให้บุคคลที่สาม",
        "EA ส่งสถิติการเทรดของบัญชีที่ลงทะเบียนมาที่เว็บ เพื่อแสดงผลและตรวจสิทธิการใช้งาน มันไม่ส่งรหัสผ่านและไม่สามารถถอนเงินได้",
        "คุณขอลบข้อมูลทั้งหมดได้ทุกเวลาที่ laoforextrader@gmail.com",
      ],
    },
    {
      title: "7. อีเมล",
      body: [
        "การยอมรับเงื่อนไขตอนสมัคร (ข้อ 1) รวมการอนุญาตให้เราส่งเรื่องการอัปเดต EA เวอร์ชันใหม่ และข่าวของเว็บไปทางอีเมล",
        "เราส่งเท่าที่จำเป็น ไม่ส่งโฆษณาของคนอื่น และไม่ให้อีเมลของคุณแก่บุคคลที่สาม",
        "ทุกอีเมลมีลิงก์ยกเลิกอยู่ท้าย และยกเลิกได้เองในหน้าโปรไฟล์ การยกเลิกไม่กระทบสิทธิการใช้ EA",
      ],
    },
    {
      title: "8. การรับประกันและความรับผิดชอบ",
      body: [
        "EA ให้มาตามสภาพที่เป็นอยู่ โดยไม่มีการรับประกันว่าจะมีกำไรหรือจะทำงานได้ต่อเนื่อง โบรกเกอร์ อินเทอร์เน็ต VPS และ MetaTrader เป็นสิ่งที่เราควบคุมไม่ได้",
        "เราไม่รับผิดชอบต่อการขาดทุนที่เกิดจากการใช้ EA ไม่ว่าจะในกรณีใด",
      ],
    },
    {
      title: "9. การเปลี่ยนแปลงเงื่อนไข",
      body: [
        "เมื่อเงื่อนไขนี้เปลี่ยนในสาระสำคัญ เราจะขอให้คุณยอมรับใหม่ในครั้งต่อไปที่เข้าหน้าดาวน์โหลด ฉบับปัจจุบันระบุอยู่ท้ายหน้านี้",
      ],
    },
  ],

  en: [
    {
      title: "1. What you are accepting",
      body: [
        "Ticking “I have read and accept the terms of use” when you join means you accept everything on this page, including the three points below.",
        "One — you agree that we may email you news, updates and information about the site, at the address you registered. Every email carries an unsubscribe link at the foot of it, and unsubscribing changes nothing else about your account.",
        "Two — you understand and accept the risk of trading and investing: that the whole balance can be lost, and that past results are not a promise about the future.",
        "Three — if you download or run our EA, you also accept sections 2 to 5 below.",
        "Being a member does not require you to use an EA. The EA sections apply only if you use one.",
      ],
    },
    {
      title: "2. How this EA works",
      body: [
        "TheRocket EAs are grid systems: they add trades in steps as price runs against the basket, and close the whole basket at once when it is in profit overall. There is no stop loss on any individual trade — that is the design, not an oversight.",
        "Since 2026-11-22 there is an input called EquityFloorPct which lets you set your own equity floor. It defaults to 0, meaning no floor and the full 100% of the account at risk.",
      ],
    },
    {
      title: "3. The risk — read this before you run it",
      body: [
        "A system like this can lose the entire account, and has done so in back-testing. When price runs one way for a long distance without pulling back, the basket is dragged to the end of its ladder and the floating loss keeps growing with nothing to stop it.",
        "Every profit figure shown on this site comes from a specific window of time and is not a promise that the future will look like it. A different market gives a different result.",
        "Setting an equity floor does not make it safer. Every time we measured a cap on this system the overall result got worse, because it turns a floating loss into a string of real ones.",
        "Use only money you are prepared to lose entirely.",
      ],
    },
    {
      title: "4. Not investment advice",
      body: [
        "TheRocket is a tool, not a financial adviser. We do not know your finances or how much risk you can carry. Opening an account, choosing a balance and switching the EA on are your decisions alone, and so are the consequences.",
      ],
    },
    {
      title: "5. Licence and use",
      body: [
        "The licence is tied to your trading account number, not to the file. It is valid on the account you registered and no other.",
        "Do not forward, resell, distribute or reverse-engineer the EA. Doing so ends the licence immediately and without notice.",
        "Demo accounts are unlimited and need no registration.",
      ],
    },
    {
      title: "6. What we store",
      body: [
        "When you join we store: your email, the name you entered, your phone number and the profile picture you chose.",
        "The email and the phone number are encrypted before they are written and can only be read on our server. We do not sell data to anyone.",
        "The EA sends the trading statistics of a registered account to the site, to display them and to check the licence. It never sends a password and it cannot withdraw money.",
        "You can ask for all of it to be deleted at any time: laoforextrader@gmail.com",
      ],
    },
    {
      title: "7. Email",
      body: [
        "Accepting the terms when you join (section 1) includes permission for us to email you about EA updates, new versions and site news.",
        "We send only what is worth sending, never advertising for anyone else, and we do not pass your address on.",
        "Every email has an unsubscribe link, and you can turn it off yourself on your profile page. Doing so does not affect your right to use the EA.",
      ],
    },
    {
      title: "8. Warranty and liability",
      body: [
        "The EA is provided as it is, with no warranty that it will be profitable or that it will keep running. Brokers, internet connections, VPS hosts and MetaTrader are outside our control.",
        "We are not liable for losses arising from use of the EA, in any circumstances.",
      ],
    },
    {
      title: "9. Changes to these terms",
      body: [
        "When these terms change materially we will ask you to accept them again the next time you open a download page. The current version is stated at the foot of this page.",
      ],
    },
  ],
}

export default function TermsBody() {
  const { lang } = useLang()
  useT()
  const head = HEAD[lang]
  const sections = SECTIONS[lang]

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", padding: "48px 52px" }}>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-4)", marginBottom: 12 }}>
            {head.kicker}
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            {head.h1a}
            <br />
            <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {head.h1b}
            </span>
          </h1>

          <div style={{ width: 40, height: 2, background: "#111827", marginBottom: 28 }} />

          {/* The one line that matters most, where nobody can miss it. */}
          <div style={{
            border: "1px solid rgba(220,38,38,0.35)", background: "rgba(220,38,38,0.06)",
            borderRadius: 12, padding: "16px 18px", marginBottom: 36,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#DC2626", marginBottom: 6 }}>
              {head.warnTitle}
            </div>
            <p className="font-lao" style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.8, margin: 0 }}>
              {head.warn}
            </p>
          </div>

          {sections.map(s => (
            <div key={s.title} style={{ marginBottom: 30 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", marginBottom: 10 }}>{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="font-lao" style={{
                  fontSize: 14, color: "var(--fg-2)", lineHeight: 1.9, margin: "0 0 10px",
                }}>
                  {p}
                </p>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--line-2)", fontSize: 11, color: "var(--fg-4)" }}>
            {head.version} {TERMS_VERSION} · laoforextrader@gmail.com
          </div>

        </div>
      </div>
    </div>
  )
}
