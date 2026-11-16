// Creates round 1 of the demo trading contest in Sanity.
//
//   node --env-file=.env.local scripts/seed-contest-round1.mjs
//   node --env-file=.env.local scripts/seed-contest-round1.mjs --force
//
// Without --force it refuses to touch a round that already exists, because
// after the first run the Studio is the source of truth: the owner edits the
// prizes and rules there, and a second seed would quietly write over them.
//
// All times are stored as UTC. The contest is judged on broker server time;
// Exness MT5 servers run GMT+2 in winter, so the numbers below are set 2
// hours earlier than the local-to-the-broker times in CONTEST-SPEC.md. If the
// broker's offset turns out to be different, fix the two datetimes in the
// Studio — nothing in the code reads them as anything but instants.

import { createClient } from "@sanity/client"

const force = process.argv.includes("--force")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-04-25",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const SLUG = "round-1-exness-standard"

const L = (en, th, lo) => ({ en, th, lo })

const doc = {
  _id: `contest-${SLUG}`,
  _type: "contest",
  title: "Round 1 — Exness Standard",
  slug: { _type: "slug", current: SLUG },
  status: "register",

  broker: "Exness",
  accountType: "Standard",
  // Exness has no cent demo, so this is a plain Standard account in USD.
  // 100,000 USD is deliberate: every number this EA has been measured on
  // comes from a 50k-100k account, and a 1,000 USD account would blow up
  // in the middle of the ladder long before the ten days are out.
  startBalance: 100000,
  currency: "USD",
  // Measured on the owner-s demo 434529270 (Exness-MT5Trial7) with the
  // ContestSpec script: a Standard account sees XAUUSDm, not XAUUSD.
  symbol: "XAUUSDm",
  // The site already uses this partner link for Exness (CTASelector).
  brokerSignupUrl: "https://one.exnessonelink.com/intl/th/a/tv2hiv2h",

  // Registration opens 17 Nov 08:00 Laos time (UTC+7).
  registerOpenAt: "2026-11-17T01:00:00Z",
  // Mon 23 Nov 00:00 broker server time (GMT+2).
  startAt: "2026-11-22T22:00:00Z",
  // Fri 4 Dec 23:59 broker server time — market close of the tenth trading day.
  endAt: "2026-12-04T21:59:00Z",
  // Mon 7 Dec 10:00 Laos time.
  announceAt: "2026-12-07T03:00:00Z",

  prizes: [
    { _key: "p1", _type: "prize", place: 1, amount: 50 },
    { _key: "p2", _type: "prize", place: 2, amount: 40 },
    { _key: "p3", _type: "prize", place: 3, amount: 10 },
  ],
  earlyBirdCount: 5,
  perks: [
    {
      _key: "k1", _type: "perk",
      text: L(
        "The first 5 people to register get a free VPS for the contest.",
        "5 ท่านแรกที่ลงทะเบียนได้สิทธิ์ VPS ฟรีตลอดการแข่งขัน",
        "5 ທ່ານທຳອິດທີ່ລົງທະບຽນໄດ້ສິດ VPS ຟຣີຕະຫຼອດການແຂ່ງຂັນ"
      ),
    },
  ],

  rules: [
    ["r1",
      "Demo account at Exness, Standard, starting balance 100,000 USD.",
      "บัญชีเดโมของ Exness ประเภท Standard ทุนเริ่มต้น 100,000 USD",
      "ບັນຊີເດໂມຂອງ Exness ປະເພດ Standard ທຶນເລີ່ມຕົ້ນ 100,000 USD"],
    ["r2",
      "The contest EA only. Trading by hand is not allowed and the EA reports positions it did not open.",
      "ใช้ EA รุ่นแข่งขันเท่านั้น ห้ามเทรดมือ · EA จะรายงานไม้ที่ไม่ได้เปิดเอง",
      "ໃຊ້ EA ລຸ້ນແຂ່ງຂັນເທົ່ານັ້ນ ຫ້າມເທຣດມື · EA ຈະລາຍງານໄມ້ທີ່ບໍ່ໄດ້ເປີດເອງ"],
    ["r3",
      "One account per person.",
      "หนึ่งคนหนึ่งบัญชี",
      "ໜຶ່ງຄົນໜຶ່ງບັນຊີ"],
    ["r4",
      "No deposits after the start. Topping the demo account up means disqualification — the EA reports every deposit.",
      "ห้ามฝากเพิ่มหลังเริ่มแข่ง · เติมเงินเข้าบัญชีเดโม = ตัดสิทธิ์ (EA รายงานทุกการฝาก)",
      "ຫ້າມຝາກເພີ່ມຫຼັງເລີ່ມແຂ່ງ · ເຕີມເງິນເຂົ້າບັນຊີເດໂມ = ຕັດສິດ (EA ລາຍງານທຸກການຝາກ)"],
    ["r5",
      "The winner is the biggest net profit at market close on Friday 4 December.",
      "ผู้ชนะคือผู้ที่มีกำไรสุทธิสูงสุด ณ เวลาปิดตลาดวันศุกร์ที่ 4 ธันวาคม",
      "ຜູ້ຊະນະຄືຜູ້ທີ່ມີກຳໄລສຸດທິສູງສຸດ ຕອນປິດຕະຫຼາດວັນສຸກທີ 4 ທັນວາ"],
    ["r6",
      "The top 5 must send a read-only investor password so the result can be verified before it is announced.",
      "5 อันดับแรกต้องส่ง investor password (อ่านอย่างเดียว) เพื่อยืนยันผลก่อนประกาศ",
      "5 ອັນດັບທຳອິດຕ້ອງສົ່ງ investor password (ອ່ານຢ່າງດຽວ) ເພື່ອຢືນຢັນຜົນກ່ອນປະກາດ"],
    ["r7",
      "Keep the EA running. Gaps in the data are the contestant's own risk.",
      "ต้องเปิด EA ไว้ต่อเนื่อง · ข้อมูลที่ขาดหายเป็นความเสี่ยงของผู้เข้าแข่งขันเอง",
      "ຕ້ອງເປີດ EA ໄວ້ຕໍ່ເນື່ອງ · ຂໍ້ມູນທີ່ຂາດຫາຍເປັນຄວາມສ່ຽງຂອງຜູ້ເຂົ້າແຂ່ງຂັນເອງ"],
  ].map(([k, en, th, lo]) => ({ _key: k, _type: "rule", text: L(en, th, lo) })),

  maxEntries: 0,
}

const existing = await client.fetch(`*[_id == $id][0]{ _id, status }`, { id: doc._id })
if (existing && !force) {
  console.log(`round already exists (status: ${existing.status}) — edit it in the Studio, or re-run with --force`)
  process.exit(0)
}

await client.createOrReplace(doc)
console.log(`${existing ? "replaced" : "created"} ${doc._id}`)
console.log("open  https://www.laoforextrader.com/contest")
