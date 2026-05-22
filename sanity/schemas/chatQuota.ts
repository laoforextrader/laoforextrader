export const chatQuotaSchema = {
  name: "chatQuota",
  title: "Chat Quota",
  type: "document",
  fields: [
    { name: "key",       title: "Key (ip or userId)", type: "string" },
    { name: "day",       title: "Day (Asia/Vientiane)", type: "string" },
    { name: "tier",      title: "Tier",  type: "string",
      options: { list: [
        { title: "Guest",   value: "guest" },
        { title: "User",    value: "user" },
        { title: "Pro",     value: "pro" },
      ] },
    },
    { name: "count",     title: "Messages used today", type: "number" },
    { name: "updatedAt", title: "Updated at", type: "datetime" },
  ],
  preview: {
    select: { title: "key", subtitle: "day", description: "count" },
    prepare({ title, subtitle, description }: any) {
      return { title: title ?? "?", subtitle: `${subtitle ?? ""} — ${description ?? 0} msgs` }
    },
  },
}
