export const chatSessionSchema = {
  name: "chatSession",
  title: "Chat Session",
  type: "document",
  fields: [
    { name: "userId",    title: "User ID (NextAuth sub)", type: "string" },
    { name: "startedAt", title: "Started at", type: "datetime" },
    { name: "updatedAt", title: "Updated at", type: "datetime" },
    { name: "messages",  title: "Messages",   type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "role",      title: "Role", type: "string",
            options: { list: [
              { title: "user",      value: "user" },
              { title: "assistant", value: "assistant" },
            ] },
          },
          { name: "content",   title: "Content",   type: "text", rows: 6 },
          { name: "createdAt", title: "Created at", type: "datetime" },
        ],
      }],
    },
  ],
  preview: {
    select: { title: "userId", subtitle: "startedAt" },
  },
}
