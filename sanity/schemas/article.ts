export const articleSchema = {
  name: "article",
  title: "ບົດຄວາມ / Article",
  type: "document",
  fields: [
    { name: "title",       title: "ຫົວຂໍ້",      type: "string",   validation: (R: any) => R.required() },
    { name: "slug",        title: "Slug (URL)",  type: "slug",     options: { source: "title" }, validation: (R: any) => R.required() },
    { name: "excerpt",     title: "ສຸດຍ່ໍ",       type: "text",     rows: 3 },
    { name: "category",    title: "ໝວດໝູ່",       type: "string",
      options: { list: [
        { title: "ລີວິວ Broker",  value: "broker"    },
        { title: "ການສຶກສາ",      value: "education" },
        { title: "ຂ່າວ",          value: "news"      },
        { title: "ວິເຄາະ",        value: "analysis"  },
        { title: "EA / Tools",   value: "ea-tools"  },
      ]}
    },
    { name: "coverImage",  title: "ຮູບໜ້າປົກ",   type: "image",   options: { hotspot: true } },
    { name: "author",      title: "ຜູ້ຂຽນ",       type: "reference", to: [{ type: "author" }] },
    { name: "publishedAt", title: "ວັນທີເຜີຍແຜ່", type: "datetime" },
    { name: "featured",    title: "ໃສ່ໜ້າຫຼັກ",   type: "boolean",  initialValue: false },
    { name: "readTime",    title: "ເວລາອ່ານ (ນາທີ)", type: "number" },
    { name: "tags",        title: "Tags",         type: "array",   of: [{ type: "string" }] },
    { name: "body",        title: "ເນື້ອຫາ",       type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ]
    },
  ],
  preview: {
    select: { title: "title", media: "coverImage", category: "category" },
    prepare: ({ title, media, category }: any) => ({
      title, media, subtitle: category,
    }),
  },
}
