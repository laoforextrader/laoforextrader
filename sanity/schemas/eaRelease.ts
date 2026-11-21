//  One released build of one EA — what changed, and whether members were told.
//
//  The version numbers already live in public/ea/dist/manifest.json, written
//  by the publish script. What the manifest cannot hold is why anyone should
//  care: a line saying "stop-out floor added, off by default" is the thing a
//  member needs before deciding to update, and it has to be written by a
//  person. So the manifest stays the source of truth for files and hashes,
//  and this is the source of truth for the story.
//
//  `mailedAt` is set by scripts/send-release.ts. It is here rather than in
//  the script so a crash halfway through a send cannot mail the same release
//  twice, and so the admin can see at a glance which releases went out.

export const eaReleaseSchema = {
  name: "eaRelease",
  title: "ອັບເດດ EA / EA release",
  type: "document",
  fields: [
    {
      name: "eaId", title: "EA", type: "string",
      description: "ຕ້ອງກົງກັບ id ໃນ manifest.json",
      options: {
        list: [
          { title: "TheRocket SGrid",        value: "sgrid" },
          { title: "TheRocket SGrid Pro",    value: "sgridpro" },
          { title: "TheRocket MegiHedge",    value: "megihedge" },
          { title: "TheRocket HostGrid",     value: "hostgrid" },
          { title: "TheRocket MegiSemi",     value: "semi" },
          { title: "Contest build",          value: "contest" },
        ],
      },
      validation: (R: any) => R.required(),
    },
    { name: "version", title: "ເວີຊັນ", type: "string", validation: (R: any) => R.required() },
    { name: "releasedAt", title: "ວັນທີປ່ອຍ", type: "datetime", validation: (R: any) => R.required() },

    {
      name: "headline", title: "ຫົວຂໍ້", type: "string",
      description: "ປະໂຫຍກດຽວ ບອກວ່າເວີຊັນນີ້ໃຫ້ຫຍັງ",
      validation: (R: any) => R.required().max(120),
    },

    //  Three lists, because they answer three different questions and a
    //  reader scanning for "does this break anything" should not have to
    //  read the new features to find out.
    { name: "added", title: "ເພີ່ມໃໝ່", type: "array", of: [{ type: "string" }] },
    { name: "changed", title: "ປ່ຽນແປງ", type: "array", of: [{ type: "string" }] },
    {
      name: "breaking", title: "ຕ້ອງລະວັງ", type: "array", of: [{ type: "string" }],
      description: "ສິ່ງທີ່ຜູ້ໃຊ້ເກົ່າຕ້ອງຮູ້ກ່ອນອັບເດດ — ສະແດງເປັນສີແດງ",
    },

    {
      name: "mailedAt", title: "ສົ່ງອີເມວແລ້ວເມື່ອ", type: "datetime", readOnly: true,
      description: "ຕັ້ງໂດຍ scripts/send-release.ts — ມີຄ່າແລ້ວຈະບໍ່ສົ່ງຊ້ຳ",
    },
    { name: "mailedCount", title: "ສົ່ງໄປຈຳນວນ", type: "number", readOnly: true },
  ],

  orderings: [
    {
      title: "ໃໝ່ສຸດກ່ອນ", name: "newest",
      by: [{ field: "releasedAt", direction: "desc" }],
    },
  ],

  preview: {
    select: { eaId: "eaId", version: "version", headline: "headline", releasedAt: "releasedAt", mailedAt: "mailedAt" },
    prepare({ eaId, version, headline, releasedAt, mailedAt }: any) {
      return {
        title: `${eaId} ${version}${mailedAt ? "" : "  ·  ຍັງບໍ່ໄດ້ສົ່ງເມວ"}`,
        subtitle: `${releasedAt ? String(releasedAt).slice(0, 10) : "?"} — ${headline ?? ""}`,
      }
    },
  },
}
