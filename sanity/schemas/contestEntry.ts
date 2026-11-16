// One document per contestant, per round.
//
// The live numbers are written by the contest EA (POST /api/ea/contest),
// which signs each push with the entry code — the same scheme the Semi
// dashboard uses, for the same reason: the code never travels after
// registration, only a signature over the body.
//
// Nothing here is editable by hand except the admin's own verdict fields at
// the bottom. The leaderboard reads these documents directly.

export const contestEntrySchema = {
  name: "contestEntry",
  title: "Contest — ຜູ້ເຂົ້າແຂ່ງຂັນ",
  type: "document",
  fields: [
    { name: "contest", title: "ຮອບ", type: "reference", to: [{ type: "contest" }],
      validation: (R: any) => R.required() },
    { name: "entryNo", title: "ລຳດັບການລົງທະບຽນ", type: "number", readOnly: true,
      description: "1 = ຄົນທຳອິດ — ໃຊ້ຕັດສິນສິດທິພິເສດ (VPS ຟຣີ)" },

    // ─── ຕົວຕົນ ───
    { name: "ownerEmail", title: "ອີເມວ (Google)", type: "string", readOnly: true },
    { name: "displayName", title: "ຊື່ທີ່ສະແດງເທິງກະດານ", type: "string", validation: (R: any) => R.required() },
    { name: "contact", title: "Telegram / WhatsApp", type: "string", readOnly: true },
    { name: "country", title: "ປະເທດ", type: "string", readOnly: true },

    // ─── ບັນຊີ MT5 ───
    { name: "mtLogin", title: "ເລກບັນຊີ MT5", type: "string", validation: (R: any) => R.required() },
    { name: "mtServer", title: "ເຊີບເວີ", type: "string" },
    { name: "startBalance", title: "ທຶນຕອນເລີ່ມ", type: "number", readOnly: true },
    { name: "firstSeen", title: "ເຫັນ EA ຄັ້ງທຳອິດ", type: "datetime", readOnly: true },
    { name: "lastSeen",  title: "ເຫັນ EA ລ່າສຸດ",     type: "datetime", readOnly: true },

    {
      name: "entryCode",
      title: "ລະຫັດຜູ້ແຂ່ງ",
      type: "string",
      hidden: true,
      description: "ໃຊ້ກວດລາຍເຊັນຂອງ EA (SHA256 ຂອງ body + code) — ບໍ່ສະແດງຕໍ່ສາທາລະນະ",
    },

    // ─── ຕົວເລກສົດ (EA ຂຽນ ຫ້າມແກ້ດ້ວຍມື) ───
    { name: "equity",    title: "Equity",            type: "number", readOnly: true },
    { name: "balance",   title: "Balance",           type: "number", readOnly: true },
    { name: "profit",    title: "ກຳໄລ",             type: "number", readOnly: true },
    { name: "profitPct", title: "ກຳໄລ (%)",         type: "number", readOnly: true },
    { name: "maxDDPct",  title: "Drawdown ສູງສຸດ (%)", type: "number", readOnly: true },
    { name: "trades",    title: "ຈຳນວນໄມ້",         type: "number", readOnly: true },
    { name: "lots",      title: "ລັອດລວມ",          type: "number", readOnly: true },
    { name: "openPositions", title: "ໄມ້ທີ່ຖືຢູ່",   type: "number", readOnly: true },
    { name: "deposits",    title: "ຝາກເພີ່ມຫຼັງເລີ່ມ", type: "number", readOnly: true },
    { name: "withdrawals", title: "ຖອນອອກ",          type: "number", readOnly: true },
    { name: "series", title: "ເສັ້ນ Equity (JSON)", type: "text", rows: 3, readOnly: true },

    // ─── ສະຖານະ ແລະ ທຸງ ───
    {
      name: "status",
      title: "ສະຖານະ",
      type: "string",
      options: {
        list: [
          { title: "⏳ ລໍ EA ສົ່ງຂໍ້ມູນ (pending)", value: "pending" },
          { title: "🟢 ກຳລັງແຂ່ງ (active)",         value: "active" },
          { title: "🚩 ມີທຸງ ລໍກວດ (flagged)",      value: "flagged" },
          { title: "💀 ລ້າງພອດ (blown)",            value: "blown" },
          { title: "❌ ຕັດສິດ (disqualified)",       value: "disqualified" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    },
    {
      name: "flags",
      title: "ທຸງທີ່ລະບົບຂຶ້ນໃຫ້",
      type: "array",
      of: [{
        type: "object",
        name: "contestFlag",
        fields: [
          { name: "at",   title: "ເວລາ",   type: "datetime" },
          { name: "kind", title: "ຊະນິດ",  type: "string" },
          { name: "note", title: "ລາຍລະອຽດ", type: "string" },
        ],
        preview: {
          select: { title: "kind", subtitle: "note" },
        },
      }],
      readOnly: true,
    },

    // ─── ຜົນທີ່ກວດແລ້ວ (ແອດມິນໃສ່ເອງ) ───
    { name: "verifiedProfit", title: "ກຳໄລທີ່ກວດແລ້ວ", type: "number" },
    { name: "verifiedAt",     title: "ກວດເມື່ອ",        type: "datetime" },
    { name: "adminNote",      title: "ບັນທຶກຂອງແອດມິນ", type: "text", rows: 2 },
  ],
  preview: {
    select: { title: "displayName", login: "mtLogin", profit: "profit", status: "status" },
    prepare: ({ title, login, profit, status }: any) => ({
      title: `${title ?? "?"} · #${login ?? "?"}`,
      subtitle: `${status ?? "?"} · ${typeof profit === "number" ? profit.toFixed(2) : "—"}`,
    }),
  },
}
