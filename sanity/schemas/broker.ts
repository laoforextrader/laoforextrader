export const brokerSchema = {
  name: "broker",
  title: "Broker",
  type: "document",
  fields: [
    { name: "name",        title: "ຊື່ Broker",   type: "string",   validation: (R: any) => R.required() },
    { name: "slug",        title: "Slug",         type: "slug",     options: { source: "name" } },
    { name: "logo",        title: "Logo",         type: "image" },
    { name: "website",     title: "ເວັບໄຊທ໌",     type: "url" },
    { name: "rating",      title: "ຄະແນນລວມ (1-5)", type: "number" },
    { name: "ratingBreakdown", title: "ຄະແນນລາຍດ້ານ", type: "object",
      fields: [
        { name: "stability", title: "ຄວາມໝັ້ນຄົງ", type: "number" },
        { name: "deposit",   title: "ການຝາກຖອນ",  type: "number" },
        { name: "spread",    title: "Spread",      type: "number" },
        { name: "support",   title: "Support",     type: "number" },
        { name: "promotion", title: "ໂປຣໂມຊັ່ນ",   type: "number" },
      ]
    },
    { name: "pros",         title: "ຂໍ້ດີ",         type: "array", of: [{ type: "string" }] },
    { name: "cons",         title: "ຂໍ້ເສຍ",         type: "array", of: [{ type: "string" }] },
    { name: "minDeposit",   title: "ຝາກຂັ້ນຕ່ຳ",    type: "string" },
    { name: "maxLeverage",  title: "Leverage ສູງສຸດ", type: "string" },
    { name: "regulators",   title: "ໃບອະນຸຍາດ",    type: "array", of: [{ type: "string" }] },
    { name: "platforms",    title: "Platforms",    type: "array", of: [{ type: "string" }] },
    { name: "laoDeposit",   title: "ຮອງຮັບຝາກເງິນກີບ", type: "boolean", initialValue: false },
    { name: "featured",     title: "ໃສ່ Sidebar",   type: "boolean", initialValue: false },
    { name: "badge",        title: "Badge",         type: "string",
      options: { list: [
        { title: "ແນະນຳ",  value: "recommended" },
        { title: "ໃໝ່",    value: "new"         },
        { title: "ອັນດັບ 1", value: "top"        },
      ]}
    },
    { name: "excerpt",      title: "ສຸດຍ່ໍ",        type: "text", rows: 3 },
    { name: "body",         title: "ລີວິວລາຍລະອຽດ", type: "array",
      of: [{ type: "block" }, { type: "image" }]
    },
  ],
}
