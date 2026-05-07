// Daily Update — generated automatically by /api/cron/daily-update.
// One doc per day, _id = `daily-YYYY-MM-DD`. Fields are populated by
// Claude after fetching Finnhub economic calendar + FXStreet RSS news.

export const dailyUpdateSchema = {
  name: "dailyUpdate",
  title: "Daily Update",
  type: "document",
  fields: [
    {
      name: "date",
      title: "ວັນທີ (YYYY-MM-DD, Asia/Vientiane)",
      type: "date",
      validation: (R: any) => R.required(),
    },
    {
      name: "dailySummary",
      title: "ສະຫຼຸບລວມ (ພາສາລາວ)",
      type: "text",
      rows: 3,
    },
    {
      name: "hotNews",
      title: "ຂ່າວ Hot",
      type: "object",
      fields: [
        { name: "title", title: "ຫົວຂໍ້",  type: "string" },
        { name: "summary", title: "ສະຫຼຸບ", type: "text", rows: 2 },
        { name: "source", title: "Source URL", type: "url" },
      ],
    },
    {
      name: "calendarHighlights",
      title: "Economic Calendar Highlights",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "ຊື່ Event", type: "string" },
            { name: "time", title: "ເວລາ (Lao ICT)", type: "string" },
            {
              name: "impact",
              title: "Impact",
              type: "string",
              options: { list: ["high", "medium", "low"], layout: "radio" },
            },
            { name: "description", title: "ຄຳອະທິບາຍ (ພາສາລາວ)", type: "text", rows: 2 },
          ],
          preview: {
            select: { title: "name", subtitle: "time", impact: "impact" },
            prepare: ({ title, subtitle, impact }: any) => ({
              title: `${impact === "high" ? "🔴" : impact === "medium" ? "🟡" : "🟢"} ${title}`,
              subtitle,
            }),
          },
        },
      ],
    },
    { name: "hasHighImpact", title: "ມີ High Impact ມື້ນີ້?", type: "boolean", initialValue: false },
    { name: "lineMessage", title: "LINE Broadcast Message", type: "text", rows: 4 },
    {
      name: "rawCalendar",
      title: "Raw Calendar (debug)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "event", type: "string" },
            { name: "time", type: "string" },
            { name: "impact", type: "string" },
            { name: "forecast", type: "string" },
            { name: "previous", type: "string" },
            { name: "actual", type: "string" },
            { name: "country", type: "string" },
          ],
        },
      ],
      hidden: true,
    },
    {
      name: "rawNews",
      title: "Raw News (debug)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string" },
            { name: "summary", type: "text" },
            { name: "link", type: "url" },
            { name: "pubDate", type: "string" },
          ],
        },
      ],
      hidden: true,
    },
    { name: "createdAt", title: "Created At", type: "datetime", readOnly: true },
    {
      name: "lastError",
      title: "Last Error",
      type: "string",
      readOnly: true,
      description: "ຖ້າ run ມີ error — ຈະບັນທຶກໄວ້ຢູ່ນີ້",
    },
  ],
  orderings: [
    {
      title: "ວັນທີ ໃໝ່ສຸດ",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { date: "date", summary: "dailySummary", hot: "hasHighImpact" },
    prepare: ({ date, summary, hot }: any) => ({
      title: `${hot ? "🔴 " : ""}${date ?? "(no date)"}`,
      subtitle: summary?.slice(0, 80) ?? "",
    }),
  },
}
