// Broadcast schedule — a CMS row per recurring auto-broadcast.
// Generic so we can add more types later (news highlights, education tip, etc.)
// without re-deploying. The cron handler reads these every hour and fires
// matching rows.

export const broadcastScheduleSchema = {
  name: "broadcastSchedule",
  title: "Broadcast Schedule",
  type: "document",
  fields: [
    {
      name: "key",
      title: "Key (URL-safe ID)",
      type: "string",
      validation: (R: any) => R.required(),
      description: "Unique identifier — e.g. \"ea-daily\", \"ea-weekly\", \"ea-monthly\".",
    },
    {
      name: "title",
      title: "ຫົວຂໍ້",
      type: "string",
      validation: (R: any) => R.required(),
    },
    {
      name: "enabled",
      title: "ເປີດໃຊ້ງານ",
      type: "boolean",
      initialValue: true,
      description: "ປິດເພື່ອຢຸດ broadcast ຊົ່ວຄາວ ໂດຍບໍ່ຕ້ອງລຶບ.",
    },
    {
      name: "template",
      title: "Template",
      type: "string",
      options: {
        list: [
          { title: "EA Summary (SGride + MegiHedge)", value: "ea-summary" },
        ],
        layout: "radio",
      },
      initialValue: "ea-summary",
      validation: (R: any) => R.required(),
    },
    {
      name: "period",
      title: "Period (ຮອບການສົ່ງ)",
      type: "string",
      options: {
        list: [
          { title: "Daily — ທຸກວັນ",       value: "daily" },
          { title: "Weekly — ທຸກອາທິດ",     value: "weekly" },
          { title: "Monthly — ທຸກເດືອນ",    value: "monthly" },
        ],
        layout: "radio",
      },
      validation: (R: any) => R.required(),
    },
    {
      name: "hour",
      title: "ຊົ່ວໂມງສົ່ງ (0–23, ເວລາລາວ ICT)",
      type: "number",
      validation: (R: any) => R.required().min(0).max(23).integer(),
      initialValue: 21,
    },
    {
      name: "dayOfWeek",
      title: "ວັນຂອງອາທິດ (0=ອາທິດ … 6=ເສົາ)",
      type: "number",
      validation: (R: any) => R.min(0).max(6).integer(),
      hidden: ({ document }: any) => document?.period !== "weekly",
      description: "ໃຊ້ກັບ Weekly ເທົ່ານັ້ນ — 6 = ວັນເສົາ",
    },
    {
      name: "dayOfMonth",
      title: "ວັນຂອງເດືອນ (1–31)",
      type: "number",
      validation: (R: any) => R.min(1).max(31).integer(),
      hidden: ({ document }: any) => document?.period !== "monthly",
      description: "ໃຊ້ກັບ Monthly ເທົ່ານັ້ນ — 1 = ມື້ທຳອິດຂອງເດືອນ",
    },
    {
      name: "lastRunAt",
      title: "Last Run At (auto)",
      type: "datetime",
      readOnly: true,
      description: "ລະບົບອັບເດດເອງເມື່ອສົ່ງສຳເລັດ.",
    },
    {
      name: "lastStatus",
      title: "Last Status (auto)",
      type: "string",
      readOnly: true,
    },
    {
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
    },
  ],
  preview: {
    select: {
      title: "title",
      enabled: "enabled",
      period: "period",
      hour: "hour",
      lastStatus: "lastStatus",
    },
    prepare: ({ title, enabled, period, hour, lastStatus }: any) => ({
      title: `${enabled ? "🟢" : "⚪"} ${title || "(no title)"}`,
      subtitle: `${period ?? "?"} · ${hour ?? "?"}h ICT${lastStatus ? ` · ${lastStatus}` : ""}`,
    }),
  },
}
