// One document per MT5 account running TheRocketMagi Semi.
//
// Why a Sanity doc and not a cache: the command queue has to survive between
// two different serverless instances — the browser that queues a command and
// the EA that polls for it are almost never the same lambda. The live state
// rides along in the same doc so there is one source of truth, throttled on
// write (see lib/semi/store.ts) so a 3-second EA heartbeat does not turn into
// a 3-second write rate.
//
// The dashboard key never reaches this doc in plain form from the EA. The
// owner types it once on the website (over an authenticated session) to link
// the account; after that the EA only ever sends a signature.
export const semiAccountSchema = {
  name: "semiAccount",
  title: "Semi EA — ບັນຊີ",
  type: "document",
  fields: [
    {
      name: "account",
      title: "ເລກບັນຊີ MT5",
      type: "string",
      validation: (R: any) => R.required(),
      description: "ໃຊ້ເປັນຕົວລະບຸບັນຊີ — _id ຂອງ doc ນີ້ຄື semi-<account>",
    },
    { name: "ownerEmail", title: "ອີເມວເຈົ້າຂອງ", type: "string", readOnly: true },
    { name: "ownerName",  title: "ຊື່ເຈົ້າຂອງບັນຊີ", type: "string", readOnly: true },
    {
      name: "dashKey",
      title: "ກະແຈແດຊບອດ",
      type: "string",
      hidden: true,
      description: "ໃຊ້ກວດລາຍເຊັນຂອງ EA (SHA256 ຂອງ body + key) — ບໍ່ສະແດງໃນ Studio",
    },

    // ─── ສະຖານະສົດ (EA ຂຽນ ຫ້າມແກ້ດ້ວຍມື) ───
    { name: "state",    title: "ສະຖານະລ່າສຸດ (JSON)", type: "text", rows: 6, readOnly: true },
    { name: "lastSeen", title: "ເຫັນ EA ລ່າສຸດ",       type: "datetime", readOnly: true },
    { name: "symbol",   title: "Symbol",                type: "string",   readOnly: true },
    { name: "mode",     title: "ໂໝດ",                  type: "string",   readOnly: true },
    { name: "equity",   title: "Equity",                type: "number",   readOnly: true },

    // ─── ຄິວຄຳສັ່ງ ───
    { name: "cmdId",  title: "ID ຄຳສັ່ງ",   type: "number",   readOnly: true },
    { name: "cmd",    title: "ຄຳສັ່ງ",      type: "string",   readOnly: true },
    { name: "cmdLot", title: "ຄ່າຂອງຄຳສັ່ງ", type: "number",  readOnly: true },
    { name: "cmdAt",  title: "ສັ່ງເມື່ອ",    type: "datetime", readOnly: true },
    { name: "cmdBy",  title: "ສັ່ງໂດຍ",      type: "string",   readOnly: true },

    // ─── ປະຫວັດຮອບທີ່ປິດແລ້ວ ───
    { name: "ackRound", title: "ຮອບລ່າສຸດທີ່ຮັບແລ້ວ", type: "number", readOnly: true },
    {
      name: "rounds",
      title: "ຮອບທີ່ປິດແລ້ວ",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          name: "semiRound",
          fields: [
            { name: "id",     type: "number" },
            { name: "side",   type: "string" },
            { name: "opened", type: "number" },
            { name: "closed", type: "number" },
            { name: "depth",  type: "number" },
            { name: "lots",   type: "number" },
            { name: "pl",     type: "number" },
            { name: "by",     type: "string" },
          ],
        },
      ],
    },

    // ເສັ້ນ equity / balance ທີ່ເຊີບເວີເກັບຕົວຢ່າງເອງຈາກທຸກ heartbeat
    { name: "series", title: "ເສັ້ນ Equity / Balance (JSON)", type: "text", rows: 3, readOnly: true },

    // ເວັບບອກ EA ວ່າມີຄົນເປີດແດຊບອດຢູ່ -> EA ສົ່ງຖີ່ຂຶ້ນເປັນ 3 ວິນາທີ
    { name: "watchUntil", title: "ມີຄົນເບິ່ງຢູ່ເຖິງ", type: "datetime", readOnly: true },
  ],
  preview: {
    select: { title: "account", subtitle: "ownerEmail" },
  },
}
