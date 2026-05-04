export const quizSchema = {
  name: "quiz",
  title: "Quiz",
  type: "document",
  fields: [
    { name: "title", title: "ຫົວຂໍ້", type: "string", validation: (R: any) => R.required() },
    { name: "slug",  title: "Slug (URL)", type: "string", validation: (R: any) => R.required() },
    {
      name: "level",
      title: "ລະດັບ",
      type: "string",
      options: {
        list: [
          { title: "Basic",        value: "basic" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced",     value: "advanced" },
        ],
        layout: "radio",
      },
    },
    { name: "requiresLogin",  title: "ຕ້ອງລ໋ອກອິນກ່ອນ", type: "boolean", initialValue: false },
    { name: "order",          title: "ລຳດັບການສະແດງ",    type: "number" },
    { name: "icon",           title: "Icon (emoji ຫຼື ຊື່)", type: "string" },
    { name: "color",          title: "ສີ (hex / tailwind)",   type: "string" },
    { name: "totalQuestions", title: "ຈຳນວນຄຳຖາມທັງໝົດ",      type: "number" },
    {
      name: "questions",
      title: "ຄຳຖາມ",
      type: "array",
      of: [
        {
          type: "object",
          name: "quizQuestion",
          title: "ຄຳຖາມ",
          fields: [
            { name: "question", title: "ຄຳຖາມ", type: "string", validation: (R: any) => R.required() },
            {
              name: "choices",
              title: "ຕົວເລືອກ",
              type: "object",
              fields: [
                { name: "a", title: "ຂໍ້ a", type: "string" },
                { name: "b", title: "ຂໍ້ b", type: "string" },
                { name: "c", title: "ຂໍ້ c", type: "string" },
              ],
            },
            {
              name: "correctAnswer",
              title: "ຄຳຕອບທີ່ຖືກ",
              type: "string",
              options: {
                list: [
                  { title: "a", value: "a" },
                  { title: "b", value: "b" },
                  { title: "c", value: "c" },
                ],
                layout: "radio",
              },
              validation: (R: any) => R.required(),
            },
          ],
          preview: {
            select: { title: "question" },
            prepare: ({ title }: any) => ({ title: title || "ຄຳຖາມ" }),
          },
        },
      ],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "level" },
    prepare: ({ title, subtitle }: any) => ({ title, subtitle }),
  },
}
