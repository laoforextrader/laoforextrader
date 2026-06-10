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
    { name: "views",       title: "ຍອດເບິ່ງ (auto)", type: "number", initialValue: 0, readOnly: true,
      description: "Auto-increment ທຸກຄັ້ງທີ່ມີຄົນເປີດອ່ານ (ຫ້າມແກ້ດ້ວຍມື)",
    },
    { name: "tags",        title: "Tags",         type: "array",   of: [{ type: "string" }] },
    { name: "body",        title: "ເນື້ອຫາ",       type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ]
    },
    {
      name: "ctas",
      title: "CTAs (ປຸ່ມໂປຣໂມດ - ໃສ່ໄດ້ຫຼາຍອັນ)",
      type: "array",
      of: [
        {
          type: "object",
          name: "ctaItem",
          title: "CTA",
          fields: [
            {
              name: "type",
              title: "ປະເພດ CTA",
              type: "string",
              options: {
                list: [
                  { title: "🤖 EA SGride", value: "ea-sgride" },
                  { title: "🤖 EA MegiHedge v2.0", value: "ea-megihgedge" },
                  { title: "🏦 XM Global", value: "broker-xm" },
                  { title: "🏦 Exness", value: "broker-exness" },
                  { title: "🏦 Markets4you", value: "broker-markets4you" },
                  { title: "🏦 Vantage", value: "broker-vantage" },
                  { title: "🏦 Interstellar", value: "broker-interstellar" },
                  { title: "🏦 IUX", value: "broker-iux" },
                ],
              },
            },
          ],
          preview: {
            select: { title: "type" },
            prepare: ({ title }: any) => ({ title: title || "CTA" }),
          },
        },
      ],
    },
    {
      name: "featuredQuiz",
      title: "Quiz",
      type: "reference",
      to: [{ type: "quiz" }],
      description: "ເລືອກ Quiz ທີ່ຈະສະແດງໃນບົດຄວາມນີ້",
    },
    {
      name: "quizPosition",
      title: "ຕຳແໜ່ງ Quiz",
      type: "string",
      options: {
        list: [
          { title: "ໃນບົດຄວາມ (inline ໃຕ້ເນື້ອຫາ)", value: "inline" },
          { title: "Sidebar (ຂວາ sticky)",            value: "sidebar" },
          { title: "ທັງສອງ (inline + sidebar)",       value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "inline",
      hidden: ({ document }: any) => !document?.featuredQuiz,
    },
    {
      name: "adsBanner",
      title: "Ads Banner (HTML Code ໂບຣກ)",
      type: "object",
      fields: [
        {
          name: "show",
          title: "ສະແດງ Banner",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "html",
          title: "HTML Code (ຈາກ Broker)",
          type: "text",
          rows: 5,
          description: 'Paste HTML code ຈາກ Broker ໄດ້ເລີຍ ເຊັ່ນ <a href="..."><img src="..."/></a>',
        },
        {
          name: "position",
          title: "ຕຳແໜ່ງ",
          type: "string",
          options: {
            list: [
              { title: "ກາງບົດຄວາມ", value: "middle" },
              { title: "ທ້າຍບົດຄວາມ", value: "bottom" },
              { title: "ກາງ + ທ້າຍ", value: "both" },
            ],
            layout: "radio",
          },
          initialValue: "bottom",
        },
      ],
    },
  ],
  preview: {
    select: { title: "title", media: "coverImage", category: "category" },
    prepare: ({ title, media, category }: any) => ({
      title, media, subtitle: category,
    }),
  },
}
