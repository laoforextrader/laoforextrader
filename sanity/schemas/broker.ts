
// Flags live in /public/flags/<code>.png — add the PNG when you add a code.
export const BROKER_COUNTRIES = [
  { title: "ໄຊປຣັສ (Cyprus)", value: "cy" },
  { title: "ອົດສະຕຣາລີ (Australia)", value: "au" },
  { title: "ອັງກິດ (United Kingdom)", value: "gb" },
  { title: "ເບລີສ (Belize)", value: "bz" },
  { title: "ເຊເຊວ (Seychelles)", value: "sc" },
  { title: "ກືຣາເຊົາ (Curacao)", value: "cw" },
  { title: "ໝູ່ເກາະເຄແມນ (Cayman Islands)", value: "ky" },
  { title: "ອາຟຣິກາໃຕ້ (South Africa)", value: "za" },
  { title: "ວານົວຕູ (Vanuatu)", value: "vu" },
  { title: "ໝູ່ເກາະເວີຈິນອັງກິດ (BVI)", value: "vg" },
  { title: "ມົຣິຊຽສ (Mauritius)", value: "mu" },
  { title: "ສະຫະລັດ (United States)", value: "us" },
  { title: "ຍີ່ປຸ່ນ (Japan)", value: "jp" },
  { title: "ສະວິດເຊີແລນ (Switzerland)", value: "ch" },
  { title: "ນິວຊີແລນ (New Zealand)", value: "nz" },
  { title: "ການາດາ (Canada)", value: "ca" },
  { title: "ສິງກະໂປ (Singapore)", value: "sg" },
  { title: "ຮ່ອງກົງ (Hong Kong)", value: "hk" },
  { title: "ສະຫະລັດອາຣັບເອມິເຣດ (UAE)", value: "ae" },
  { title: "ບາຮາມາສ (Bahamas)", value: "bs" },
  { title: "ໝູ່ເກາະມາແຊວ (Marshall Islands)", value: "mh" },
  { title: "ປານາມາ (Panama)", value: "pa" },
]

export const brokerSchema = {
  name: "broker",
  title: "Broker",
  type: "document",
  fields: [
    { name: "name",        title: "ຊື່ Broker",   type: "string",   validation: (R: any) => R.required() },
    { name: "slug",        title: "Slug",         type: "slug",     options: { source: "name" } },
    { name: "logo", title: "Logo ໂບຣກ", type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt text", type: "string" },
      ],
    },
    { name: "website",      title: "ເວັບໄຊທ໌",          type: "url" },
    { name: "affiliateUrl",  title: "Affiliate URL (Homepage)", type: "url" },
    { name: "registerUrl",  title: "Register URL (Affiliate)",  type: "url" },
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
    { name: "regulation",   title: "ໃບອະນຸຍາດ",    type: "string" },
    { name: "regulators",   title: "ໃບອະນຸຍາດ (array legacy)", type: "array", of: [{ type: "string" }] },
    { name: "platforms",    title: "Platforms",    type: "string" },
    { name: "rank",         title: "ອັນດັບ",        type: "number" },
    { name: "description",  title: "ຄຳອະທິບາຍ",    type: "text", rows: 4 },
    { name: "laoDeposit",   title: "ຮອງຮັບຝາກເງິນກີບ", type: "boolean", initialValue: false },
    { name: "featured",     title: "ໃສ່ Sidebar",   type: "boolean", initialValue: false },
    { name: "badge", title: "Badge", type: "object",
      fields: [
        {
          name: "show",
          title: "ສະແດງ Badge",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "text",
          title: "ຂໍ້ຄວາມ Badge",
          type: "string",
          description: "ເຊັ່ນ: ⭐ ແນະນຳ, ⚡ EA ປະກອບ, 💰 Bonus ດີ",
        },
        {
          name: "color",
          title: "ສີ Badge",
          type: "string",
          options: {
            list: [
              { title: "⭐ Gold",   value: "gold"   },
              { title: "🔵 Blue",   value: "blue"   },
              { title: "🟢 Green",  value: "green"  },
              { title: "🟣 Purple", value: "purple" },
              { title: "⚪ Gray",   value: "gray"   },
              { title: "🟠 Orange", value: "orange" },
              { title: "🔴 Red",    value: "red"    },
            ],
            layout: "radio",
          },
        },
      ],
    },
    // ── Comparison data ─────────────────────────────────────────────────
    // minDeposit above is a legacy string ("31"); this is the sortable and
    // filterable one. Both are kept so old docs keep rendering until every
    // broker has the number filled in.
    { name: "minDepositUsd", title: "ຝາກຂັ້ນຕ່ຳ (USD, ຕົວເລກ)", type: "number",
      description: "ໃສ່ແຕ່ຕົວເລກ ເຊັ່ນ 31 — ໃຊ້ສຳລັບການຮຽງ ແລະ ກັ່ນຕອງ" },
    { name: "spreadFrom",  title: "Spread ເລີ່ມຕົ້ນ (pip, EURUSD)", type: "number",
      description: "ປະໄວ້ຫວ່າງຖ້າຍັງບໍ່ໄດ້ທົດສອບ — ໜ້າເວັບຈະສະແດງວ່າ “ຍັງບໍ່ມີຂໍ້ມູນ” ແທນການເດົາ" },
    { name: "spreadNote",  title: "Spread ໝາຍເຫດ", type: "string",
      description: "ເຊັ່ນ: ບັນຊີ Standard · ບັນຊີ Raw" },
    { name: "commission",  title: "ຄ່າຄອມມິດຊັ່ນ", type: "string",
      description: "ເຊັ່ນ: ບໍ່ມີ (Standard) · $3.5 ຕໍ່ lot ຕໍ່ຂ້າງ" },
    { name: "withdrawalSpeed", title: "ຄວາມໄວໃນການຖອນ", type: "string",
      description: "ເຊັ່ນ: ທັນທີ 24/7 · ພາຍໃນ 1 ວັນລັດຖະການ" },
    { name: "swapFree",    title: "ມີບັນຊີ Swap-free", type: "boolean", initialValue: false },

    { name: "depositMethods", title: "ຊ່ອງທາງຝາກ-ຖອນ", type: "array",
      of: [{ type: "object",
        fields: [
          { name: "name",     title: "ຊ່ອງທາງ",   type: "string" },
          { name: "currency", title: "ສະກຸນເງິນ", type: "string" },
          { name: "time",     title: "ເວລາຖອນ",   type: "string" },
          { name: "fee",      title: "ຄ່າທຳນຽມ",  type: "string" },
        ],
        preview: { select: { title: "name", subtitle: "currency" } },
      }],
    },

    // ── Trust ───────────────────────────────────────────────────────────
    // The licence NUMBER is what separates a review site from an affiliate
    // page: it is the thing a reader can check on the regulator's register.
    { name: "licenses", title: "ໃບອະນຸຍາດ", type: "array",
      of: [{ type: "object",
        fields: [
          { name: "regulator", title: "ຜູ້ກຳກັບດູແລ", type: "string",
            description: "ເຊັ່ນ: CySEC · ASIC · FCA · FSC" },
          { name: "country", title: "ປະເທດ", type: "string",
            options: { list: BROKER_COUNTRIES } },
          { name: "licenseNo", title: "ເລກໃບອະນຸຍາດ", type: "string",
            description: "ປະໄວ້ຫວ່າງຖ້າຍັງບໍ່ໄດ້ຢືນຢັນຈາກທະບຽນຂອງຜູ້ກຳກັບ" },
          { name: "entity", title: "ຊື່ນິຕິບຸກຄົນທີ່ຖືໃບ", type: "string" },
          { name: "isRepresentative", title: "ເປັນພຽງຜູ້ຕາງໜ້າ (ບໍ່ແມ່ນໃບເຕັມ)", type: "boolean",
            initialValue: false,
            description: "ຕິກໄວ້ເມື່ອເປັນ Authorised Representative — ຕ່າງຈາກການຖືໃບອະນຸຍາດເອງ" },
        ],
        preview: { select: { title: "regulator", subtitle: "licenseNo" } },
      }],
    },
    { name: "registeredIn", title: "ພູມິພາກທີ່ຈົດທະບຽນ", type: "string",
      options: { list: BROKER_COUNTRIES } },
    { name: "registeredCity", title: "ເມືອງທີ່ຈົດທະບຽນ", type: "string" },
    { name: "founded", title: "ປີກໍ່ຕັ້ງ", type: "number",
      description: "ປີ ຄ.ສ. ເຊັ່ນ 2009" },

    // ── Contact ─────────────────────────────────────────────────────────
    { name: "phone",   title: "ເບີໂທຕິດຕໍ່", type: "string" },
    { name: "email",   title: "ອີເມວ", type: "string" },
    { name: "websiteLabel", title: "ເວັບໄຊທ໌ຫຼັກ (ຂໍ້ຄວາມທີ່ສະແດງ)", type: "string",
      description: "ເຊັ່ນ www.xm.com — ສະແດງຂໍ້ຄວາມນີ້ ແຕ່ລິ້ງໄປຫາ Register URL" },

    // ── Editorial ───────────────────────────────────────────────────────
    { name: "bestFor", title: "ເໝາະກັບໃຜ", type: "array", of: [{ type: "string" }] },
    { name: "notFor",  title: "ບໍ່ເໝາະກັບໃຜ", type: "array", of: [{ type: "string" }] },
    { name: "verdict", title: "ຄຳຕັດສິນສັ້ນ", type: "string",
      description: "ເຊັ່ນ: ດີທີ່ສຸດສຳລັບມືໃໝ່ — ສະແດງຢູ່ການ໌ດອັນດັບ" },
    { name: "reviewedAt", title: "ວັນທີລີວິວລ່າສຸດ", type: "date" },
    { name: "faq", title: "ຄຳຖາມທີ່ພົບເລື້ອຍ", type: "array",
      of: [{ type: "object",
        fields: [
          { name: "q", title: "ຄຳຖາມ", type: "string" },
          { name: "a", title: "ຄຳຕອບ", type: "text", rows: 3 },
        ],
        preview: { select: { title: "q" } },
      }],
    },

    { name: "excerpt",      title: "ສຸດຍ່ໍ",        type: "text", rows: 3 },
    { name: "body",         title: "ລີວິວລາຍລະອຽດ", type: "array",
      of: [{ type: "block" }, { type: "image" }]
    },
  ],
}
