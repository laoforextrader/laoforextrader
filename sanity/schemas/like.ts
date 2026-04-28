export const likeSchema = {
  name: "like",
  title: "ໄລ້ / Like",
  type: "document",
  fields: [
    { name: "article", title: "ບົດຄວາມ / Broker", type: "reference", to: [{ type: "article" }, { type: "broker" }], validation: (R: any) => R.required() },
    { name: "userId",    title: "User ID",    type: "string", validation: (R: any) => R.required() },
    { name: "userEmail", title: "User Email", type: "string" },
    { name: "createdAt", title: "ວັນທີ",       type: "datetime" },
  ],
  preview: {
    select: { title: "userEmail", subtitle: "article.title" },
  },
}
