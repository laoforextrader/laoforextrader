// One doc per (target, day) — the same shape as `chatQuota`.
//
// `_id` is deterministic: `clickStat.<target>.<YYYY-MM-DD>` so /api/track/click
// can `createIfNotExists` + `inc` without a read first. Days are Asia/Bangkok
// (UTC+7, no DST — same wall clock as Asia/Vientiane) to match the broadcast
// dispatcher and the chat quota, so "today" means the same thing everywhere.
//
// GA4 already records these clicks as events, but GA can't be queried from our
// own /admin page without a Google Cloud service account. This counter is the
// cheap self-hosted half: one Sanity patch per click, readable with plain GROQ.
export const clickStatSchema = {
  name: "clickStat",
  title: "ສະຖິຕິການກົດປຸ່ມ / Click Stats",
  type: "document",
  fields: [
    { name: "target", title: "Target (ID ປຸ່ມ)", type: "string",
      validation: (R: any) => R.required(),
      description: "ເຊັ່ນ \"broker-interstellar\", \"ea-abs-download\"" },
    { name: "label",  title: "ຊື່ທີ່ສະແດງ", type: "string" },
    { name: "group",  title: "ກຸ່ມ", type: "string",
      options: { list: [
        { title: "Broker (affiliate)", value: "broker" },
        { title: "EA",                 value: "ea" },
        { title: "LINE / ຕິດຕໍ່",       value: "contact" },
        { title: "ອື່ນໆ",               value: "other" },
      ] },
      initialValue: "other" },
    { name: "day",    title: "ວັນທີ (Asia/Bangkok)", type: "string",
      validation: (R: any) => R.required(),
      description: "YYYY-MM-DD" },
    { name: "count",  title: "ຈຳນວນຄັ້ງ", type: "number", initialValue: 0, readOnly: true },
    { name: "updatedAt", title: "ອັບເດດຫຼ້າສຸດ", type: "datetime", readOnly: true },
  ],
  preview: {
    select: { title: "label", target: "target", subtitle: "day", count: "count" },
    prepare({ title, target, subtitle, count }: any) {
      return {
        title: title || target || "?",
        subtitle: `${subtitle ?? ""} — ${count ?? 0} ຄັ້ງ`,
      }
    },
  },
  orderings: [
    { title: "Newest day", name: "day", by: [{ field: "day", direction: "desc" }] },
  ],
}
