export const adminMessageSchema = {
  name: "adminMessage",
  title: "Admin Inbox (Chat)",
  type: "document",
  fields: [
    { name: "message",   title: "Message",   type: "text", rows: 4,
      validation: (R: any) => R.required().max(2000) },
    { name: "name",      title: "Visitor name",  type: "string" },
    { name: "email",     title: "Visitor email", type: "string" },
    { name: "userId",    title: "User ID (if logged in)", type: "string" },
    { name: "channel",   title: "Preferred reply channel", type: "string",
      options: { list: [
        { title: "LINE",     value: "line" },
        { title: "Telegram", value: "telegram" },
        { title: "Email",    value: "email" },
        { title: "Any",      value: "any" },
      ] },
      initialValue: "any",
    },
    { name: "contactHandle", title: "Contact handle (LINE ID / @username / email)", type: "string" },
    { name: "path",      title: "Page where submitted", type: "string" },
    { name: "userAgent", title: "User-Agent", type: "string" },
    { name: "ip",        title: "IP",        type: "string" },
    { name: "status",    title: "Status",    type: "string",
      options: { list: [
        { title: "Pending",  value: "pending" },
        { title: "Replied",  value: "replied" },
        { title: "Archived", value: "archived" },
      ] },
      initialValue: "pending",
    },
    { name: "createdAt", title: "Created at", type: "datetime" },
  ],
  preview: {
    select: { title: "name", subtitle: "message", description: "status" },
    prepare({ title, subtitle, description }: any) {
      return {
        title:    title ?? "(no name)",
        subtitle: (subtitle ?? "").slice(0, 80),
        description,
      }
    },
  },
  orderings: [
    { title: "Newest first", name: "newest", by: [{ field: "createdAt", direction: "desc" }] },
  ],
}
