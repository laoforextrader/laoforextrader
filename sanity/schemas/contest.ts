// One document per contest round.
//
// Everything a round needs to exist lives here: the dates, the prizes, the
// rules text, the broker. Opening round 2 on a different broker is a new
// document in the Studio, never a code change — that was the whole point of
// the design. The pages read the newest non-finished round as "current".
//
// Text the public reads is a `localeText` object (en/th/lo) so the owner can
// write all three languages without touching the repo; the site's UI strings
// stay in lib/contest/i18n.ts.

const localeText = (name: string, title: string, rows?: number) => ({
  name,
  title,
  type: "object",
  fields: [
    { name: "en", title: "EN", type: rows ? "text" : "string", rows },
    { name: "th", title: "ไทย", type: rows ? "text" : "string", rows },
    { name: "lo", title: "ລາວ", type: rows ? "text" : "string", rows },
  ],
})

export const contestSchema = {
  name: "contest",
  title: "Contest — ຮອບແຂ່ງຂັນ",
  type: "document",
  fields: [
    { name: "title", title: "ຊື່ຮອບ", type: "string", validation: (R: any) => R.required(),
      description: 'ເຊັ່ນ "Round 1 — Exness Standard Cent"' },
    { name: "slug", title: "Slug (URL)", type: "slug", options: { source: "title", maxLength: 40 },
      validation: (R: any) => R.required() },
    {
      name: "status",
      title: "ສະຖານະ",
      type: "string",
      options: {
        list: [
          { title: "📝 ຮັບສະໝັກ (register)", value: "register" },
          { title: "🟢 ກຳລັງແຂ່ງ (live)",     value: "live" },
          { title: "🔎 ກຳລັງກວດຜົນ (judging)", value: "judging" },
          { title: "🏁 ຈົບແລ້ວ (done)",        value: "done" },
        ],
        layout: "radio",
      },
      initialValue: "register",
      validation: (R: any) => R.required(),
      description: "ເວັບໃຊ້ຄ່ານີ້ຕັດສິນວ່າຈະສະແດງປຸ່ມລົງທະບຽນ ຫຼື ກະດານຜົນ",
    },

    // ─── ໂບຣກເກີ ແລະ ບັນຊີ ───
    { name: "broker", title: "Broker", type: "string", initialValue: "Exness",
      validation: (R: any) => R.required() },
    { name: "accountType", title: "ປະເພດບັນຊີ", type: "string", initialValue: "Standard Cent" },
    { name: "startBalance", title: "ທຶນເລີ່ມຕົ້ນ", type: "number", initialValue: 100000,
      validation: (R: any) => R.required() },
    { name: "currency", title: "ສະກຸນ", type: "string", initialValue: "cent" },
    { name: "symbol", title: "Symbol ທີ່ໃຫ້ເທຣດ", type: "string", initialValue: "XAUUSD" },

    // ─── ວັນເວລາ (ທຸກຄ່າເປັນເວລາເຊີບເວີຂອງໂບຣກ) ───
    { name: "registerOpenAt", title: "ເປີດຮັບສະໝັກ",  type: "datetime" },
    { name: "startAt",  title: "ເລີ່ມແຂ່ງ",            type: "datetime", validation: (R: any) => R.required() },
    { name: "endAt",    title: "ຈົບການແຂ່ງຂັນ",        type: "datetime", validation: (R: any) => R.required() },
    { name: "announceAt", title: "ປະກາດຜົນ",           type: "datetime" },

    // ─── ລາງວັນ ───
    {
      name: "prizes",
      title: "ລາງວັນ",
      type: "array",
      of: [{
        type: "object",
        name: "prize",
        fields: [
          { name: "place", title: "ອັນດັບ", type: "number" },
          { name: "amount", title: "ຈຳນວນ (USD)", type: "number" },
          localeText("label", "ຂໍ້ຄວາມ (ຖ້າບໍ່ແມ່ນເງິນສົດ)"),
        ],
        preview: {
          select: { place: "place", amount: "amount", label: "label.en" },
          prepare: ({ place, amount, label }: any) => ({
            title: `#${place ?? "?"} — ${amount ? "$" + amount : label ?? ""}`,
          }),
        },
      }],
    },
    {
      name: "perks",
      title: "ສິດທິພິເສດ (ເຊັ່ນ VPS ຟຣີ 5 ຄົນທຳອິດ)",
      type: "array",
      of: [{ type: "object", name: "perk", fields: [localeText("text", "ຂໍ້ຄວາມ")] }],
    },
    { name: "earlyBirdCount", title: "ຈຳນວນຄົນທຳອິດທີ່ໄດ້ສິດທິພິເສດ", type: "number", initialValue: 5,
      description: "ເວັບນັບລຳດັບການລົງທະບຽນເອງ ແລະ ຕິດປ້າຍໃຫ້ຜູ້ທີ່ຢູ່ໃນຈຳນວນນີ້" },

    // ─── ກະຕິກາ ───
    {
      name: "rules",
      title: "ກະຕິກາ (ຂໍ້ຕໍ່ຂໍ້)",
      type: "array",
      of: [{ type: "object", name: "rule", fields: [localeText("text", "ຂໍ້ຄວາມ")] }],
    },
    { name: "maxEntries", title: "ຮັບສູງສຸດ (0 = ບໍ່ຈຳກັດ)", type: "number", initialValue: 0 },

    // ─── ຜົນ (ໃສ່ຕອນປະກາດ) ───
    {
      name: "winners",
      title: "ຜູ້ຊະນະ",
      type: "array",
      of: [{
        type: "object",
        name: "winner",
        fields: [
          { name: "place", title: "ອັນດັບ", type: "number" },
          { name: "entry", title: "ຜູ້ແຂ່ງ", type: "reference", to: [{ type: "contestEntry" }] },
          { name: "verifiedProfit", title: "ກຳໄລທີ່ຢືນຢັນແລ້ວ", type: "number" },
          { name: "note", title: "ໝາຍເຫດ", type: "string" },
        ],
      }],
    },
  ],
  preview: {
    select: { title: "title", status: "status", start: "startAt" },
    prepare: ({ title, status, start }: any) => ({
      title: title ?? "Contest",
      subtitle: `${status ?? "?"} · ${start ? new Date(start).toISOString().slice(0, 10) : "no date"}`,
    }),
  },
}
