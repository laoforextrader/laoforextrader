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

    // ── Top high-impact events (Section 1 — countdown + click-through) ──
    {
      name: "topEvents",
      title: "Top High-Impact Events",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "id", title: "Slug ID", type: "string" },
            { name: "nameLao", title: "ຊື່ (ລາວ)", type: "string" },
            { name: "nameEn", title: "Name (EN)", type: "string" },
            { name: "currency", title: "Currency", type: "string" },
            { name: "country", title: "Country", type: "string" },
            { name: "time", title: "ເວລາ ICT (HH:MM)", type: "string" },
            { name: "timeISO", title: "Time ISO (UTC)", type: "string" },
            { name: "impact", title: "Impact", type: "string" },
            { name: "forecast", title: "Forecast", type: "string" },
            { name: "previous", title: "Previous", type: "string" },
            { name: "actual", title: "Actual", type: "string" },
            { name: "description", title: "ຄຳອະທິບາຍ (ລາວ)", type: "text", rows: 3 },
            { name: "analysis", title: "ການວິເຄາະ (ລາວ)", type: "text", rows: 4 },
            { name: "tradingGuidance", title: "ແນວທາງເທຣດ (ລາວ)", type: "text", rows: 3 },
          ],
          preview: {
            select: { title: "nameLao", subtitle: "time", impact: "impact" },
            prepare: ({ title, subtitle, impact }: any) => ({
              title: `${impact === "high" ? "🔴" : "🟡"} ${title}`,
              subtitle,
            }),
          },
        },
      ],
    },

    // ── Calendar highlights (Section homepage pills) ──
    {
      name: "calendarHighlights",
      title: "Calendar Pills (Homepage)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", type: "string" },
            { name: "time", type: "string" },
            { name: "impact", type: "string" },
            { name: "description", type: "text", rows: 2 },
          ],
        },
      ],
    },

    // ── Hot News (Section 3) ──
    {
      name: "hotNews",
      title: "Hot News (2 items)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "id", title: "Slug ID", type: "string" },
            { name: "title", title: "ຫົວຂໍ້ (ລາວ)", type: "string" },
            { name: "summary", title: "ສະຫຼຸບສັ້ນ (ລາວ)", type: "text", rows: 2 },
            { name: "detail", title: "ເນື້ອຫາລະອຽດ (ລາວ)", type: "text", rows: 6 },
            { name: "source", title: "Source URL", type: "url" },
            { name: "sourceTitle", title: "ຫົວຂໍ້ຕົ້ນສະບັບ (EN)", type: "string" },
            { name: "imageUrl", title: "Image URL", type: "url" },
            { name: "pubDate", title: "Publish Date", type: "string" },
          ],
          preview: {
            select: { title: "title", subtitle: "summary" },
          },
        },
      ],
    },

    // ── Technical Analysis (Section 4) ──
    {
      name: "technical",
      title: "Technical Analysis",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "symbol", title: "Symbol", type: "string" }, // XAUUSD, EURUSD
            { name: "trend", title: "Trend", type: "string" },   // bullish | bearish | neutral
            { name: "bias", title: "Bias (ລາວ ສັ້ນ)", type: "string" },
            { name: "support", title: "Support Level", type: "string" },
            { name: "resistance", title: "Resistance Level", type: "string" },
            { name: "analysis", title: "ການວິເຄາະ (ລາວ)", type: "text", rows: 4 },
          ],
          preview: {
            select: { title: "symbol", subtitle: "bias", trend: "trend" },
            prepare: ({ title, subtitle, trend }: any) => ({
              title: `${trend === "bullish" ? "🟢" : trend === "bearish" ? "🔴" : "🟡"} ${title}`,
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
      title: "Raw Calendar (Section 2 — Full Table)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "event", type: "string" },
            { name: "time", type: "string" }, // ISO from Finnhub
            { name: "impact", type: "string" },
            { name: "forecast", type: "string" },
            { name: "previous", type: "string" },
            { name: "actual", type: "string" },
            { name: "country", type: "string" },
          ],
        },
      ],
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
    { name: "lastError", title: "Last Error", type: "string", readOnly: true },
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
