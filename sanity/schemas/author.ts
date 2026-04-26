export const authorSchema = {
  name: "author",
  title: "ຜູ້ຂຽນ / Author",
  type: "document",
  fields: [
    { name: "name",  title: "ຊື່",   type: "string" },
    { name: "slug",  title: "Slug", type: "slug", options: { source: "name" } },
    { name: "image", title: "ຮູບ",   type: "image" },
    { name: "bio",   title: "ກ່ຽວກັບ", type: "text" },
  ],
}
