export const commentSchema = {
  name: "comment",
  title: "ຄຳເຫັນ / Comment",
  type: "document",
  fields: [
    { name: "article",   title: "ບົດຄວາມ / Broker", type: "reference", to: [{ type: "article" }, { type: "broker" }], validation: (R: any) => R.required() },
    { name: "userId",    title: "User ID",   type: "string" },
    { name: "userName",  title: "ຊື່",        type: "string", validation: (R: any) => R.required() },
    { name: "userImage", title: "Avatar",    type: "url" },
    { name: "userEmail", title: "Email",     type: "string" },
    { name: "content",   title: "ເນື້ອຫາ",    type: "text", rows: 3, validation: (R: any) => R.required().max(2000) },
    { name: "createdAt", title: "ວັນທີ",      type: "datetime" },
    { name: "approved",  title: "ອະນຸຍາດແລ້ວ", type: "boolean", initialValue: true },
  ],
  preview: {
    select: { title: "userName", subtitle: "content" },
  },
}
