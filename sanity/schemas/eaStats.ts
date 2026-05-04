export const eaStatsSchema = {
  name: "eaStats",
  title: "EA Stats (Live)",
  type: "document",
  fields: [
    {
      name: "eaId",
      title: "EA ID (URL key)",
      type: "string",
      validation: (R: any) => R.required(),
      description: "ID ສຳລັບເຊື່ອມກັບ EA — ເຊັ່ນ \"sgride\", \"megihgedge\" (ໃຊ້ໃນ webhook ແລະ URL)",
    },
    {
      name: "title",
      title: "ຊື່ EA",
      type: "string",
      validation: (R: any) => R.required(),
    },
    {
      name: "updateMode",
      title: "ໂໝດການອັບເດດ",
      type: "string",
      options: {
        list: [
          { title: "🔴 ປິດ (ບໍ່ຮັບອັບເດດ ແລະ ບໍ່ສະແດງ)", value: "off" },
          { title: "🟡 ລາຍວັນ (1 ຄັ້ງ / ວັນ)",            value: "daily" },
          { title: "🟢 Realtime (ທຸກຄັ້ງທີ່ EA ສົ່ງ)",      value: "realtime" },
        ],
        layout: "radio",
      },
      initialValue: "off",
      validation: (R: any) => R.required(),
    },

    // ─── ຂໍ້ມູນຈາກ EA (ຫ້າມແກ້ດ້ວຍມື) ───
    { name: "account",        title: "ເລກບັນຊີ",         type: "string",   readOnly: true },
    { name: "server",         title: "ເຊີບເວີ",           type: "string",   readOnly: true },
    { name: "broker",         title: "Broker",             type: "string",   readOnly: true },
    { name: "currency",       title: "ສະກຸນເງິນ",         type: "string",   readOnly: true },
    { name: "balance",        title: "Balance",            type: "number",   readOnly: true },
    { name: "equity",         title: "Equity",             type: "number",   readOnly: true },
    { name: "startBalance",   title: "Balance ເລີ່ມຕົ້ນ", type: "number",   readOnly: true },
    { name: "profitTotal",    title: "ກຳໄລລວມ ($)",       type: "number",   readOnly: true },
    { name: "profitTotalPct", title: "ກຳໄລລວມ (%)",       type: "number",   readOnly: true },
    {
      name: "monthlyReturns",
      title: "ກຳໄລລາຍເດືອນ",
      type: "array",
      readOnly: true,
      of: [{
        type: "object",
        name: "monthlyReturn",
        fields: [
          { name: "month",     title: "ເດືອນ (YYYY-MM)", type: "string" },
          { name: "profitPct", title: "ກຳໄລ (%)",        type: "number" },
        ],
        preview: {
          select: { title: "month", subtitle: "profitPct" },
          prepare: ({ title, subtitle }: any) => ({ title, subtitle: `${subtitle?.toFixed(2) ?? "0"}%` }),
        },
      }],
    },
    {
      name: "dailyReturns",
      title: "ກຳໄລລາຍວັນ (30 ວັນ)",
      type: "array",
      readOnly: true,
      of: [{
        type: "object",
        name: "dailyReturn",
        fields: [
          { name: "date",      title: "ວັນທີ (YYYY-MM-DD)", type: "string" },
          { name: "profitPct", title: "ກຳໄລ (%)",            type: "number" },
        ],
        preview: {
          select: { title: "date", subtitle: "profitPct" },
          prepare: ({ title, subtitle }: any) => ({ title, subtitle: `${subtitle?.toFixed(2) ?? "0"}%` }),
        },
      }],
    },
    { name: "lastUpdate", title: "Update ຫຼ້າສຸດ", type: "datetime", readOnly: true },
  ],
  preview: {
    select: { title: "title", subtitle: "updateMode", account: "account" },
    prepare: ({ title, subtitle, account }: any) => ({
      title: title || "EA",
      subtitle: `${subtitle ?? "?"} · #${account ?? "?"}`,
    }),
  },
}
