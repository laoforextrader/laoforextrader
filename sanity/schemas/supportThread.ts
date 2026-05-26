// One doc per live-chat conversation between a website visitor and the admin.
//
// `threadId` is a UUID generated in the visitor's browser (localStorage) so a
// guest keeps the same room across messages and page loads. Logged-in users
// also use the browser UUID; their userId/name/email are stored for context.
//
// The conversation flows both ways:
//   - visitor → /api/chat/contact-admin appends a {role:"user"} message and
//     pushes a Telegram notice to the admin, storing the Telegram message_id
//     in `telegramMsgIds` so a reply can be routed back here.
//   - admin replies to that Telegram message → /api/telegram/webhook matches
//     `reply_to_message.message_id` against `telegramMsgIds`, appends a
//     {role:"admin"} message, which the widget picks up by polling
//     /api/chat/thread.
export const supportThreadSchema = {
  name: "supportThread",
  title: "Live Chat Threads",
  type: "document",
  fields: [
    { name: "threadId", title: "Thread ID", type: "string",
      validation: (R: any) => R.required() },
    { name: "name",     title: "Visitor name",  type: "string" },
    { name: "email",    title: "Visitor email", type: "string" },
    { name: "userId",   title: "User ID (if logged in)", type: "string" },
    { name: "path",     title: "Page where started", type: "string" },
    { name: "userAgent", title: "User-Agent", type: "string" },
    { name: "ip",       title: "IP", type: "string" },
    { name: "status",   title: "Status", type: "string",
      options: { list: [
        { title: "Open",     value: "open" },
        { title: "Closed",   value: "closed" },
        { title: "Archived", value: "archived" },
      ] },
      initialValue: "open",
    },
    // Telegram message_ids we've sent to the admin for THIS thread. The admin
    // replies to any of them; the webhook matches reply_to_message.message_id
    // against this list to find the right thread.
    { name: "telegramMsgIds", title: "Telegram message IDs", type: "array",
      of: [{ type: "number" }] },
    { name: "messages", title: "Messages", type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "role", title: "Role", type: "string",
            options: { list: [
              { title: "Visitor", value: "user" },
              { title: "Admin",   value: "admin" },
            ] },
          },
          { name: "content",   title: "Content", type: "text", rows: 4 },
          { name: "createdAt", title: "Created at", type: "datetime" },
        ],
        preview: {
          select: { title: "role", subtitle: "content" },
          prepare({ title, subtitle }: any) {
            return { title, subtitle: (subtitle ?? "").slice(0, 80) }
          },
        },
      }],
    },
    { name: "createdAt",   title: "Created at",    type: "datetime" },
    { name: "lastUserAt",  title: "Last visitor message",  type: "datetime" },
    { name: "lastAdminAt", title: "Last admin reply", type: "datetime" },
  ],
  preview: {
    select: { title: "name", subtitle: "status", date: "lastUserAt" },
    prepare({ title, subtitle, date }: any) {
      const when = date ? new Date(date).toLocaleString() : ""
      return {
        title: title || "(guest)",
        subtitle: `${subtitle ?? "open"} · ${when}`,
      }
    },
  },
  orderings: [
    { title: "Recently active", name: "active",
      by: [{ field: "lastUserAt", direction: "desc" }] },
  ],
}
