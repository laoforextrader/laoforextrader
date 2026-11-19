// One document per person who may never register again.
//
// Separate from `contestEntry` on purpose. A cancelled or disqualified entry
// belongs to one round and says what happened in that round; a block is about
// the person and outlives every round, so it cannot live on a document that is
// created fresh each time someone signs up.
//
// Nothing identifying is stored. The three fields that do the work are the
// same one-way indexes the entry carries (`lib/pii.ts` blind indexes), so a
// block can be compared against a new registration without the dataset — which
// is public — ever holding a phone number or an address. The readable fields
// are only what the leaderboard shows anyway: a display name and an MT5 login,
// kept so the owner's own list is readable.

export const contestBlockSchema = {
  name: "contestBlock",
  title: "Contest — ບັນຊີດຳ (ຫ້າມສະໝັກ)",
  type: "document",
  fields: [
    { name: "displayName", title: "ຊື່", type: "string" },
    { name: "mtLogin", title: "ເລກບັນຊີ MT5", type: "string" },

    // One-way indexes — see the file header.
    { name: "contactHash",    title: "WhatsApp (ດັດຊະນີ)", type: "string", readOnly: true },
    { name: "ownerEmailHash", title: "ອີເມວ (ດັດຊະນີ)",    type: "string", readOnly: true },
    { name: "ipHash",         title: "IP (ດັດຊະນີ)",        type: "string", readOnly: true },

    { name: "reason", title: "ເຫດຜົນ", type: "text", rows: 2 },
    { name: "by", title: "ບລັອກໂດຍ", type: "string", readOnly: true },
    { name: "at", title: "ບລັອກເມື່ອ", type: "datetime", readOnly: true },
    {
      name: "entry",
      title: "ໃບສະໝັກທີ່ເປັນເຫດ",
      type: "reference",
      to: [{ type: "contestEntry" }],
      description: "ເກັບໄວ້ເປັນຫຼັກຖານ ບໍ່ໄດ້ໃຊ້ຕອນກວດ",
    },
  ],
  preview: {
    select: { title: "displayName", login: "mtLogin", reason: "reason", at: "at" },
    prepare: ({ title, login, reason, at }: any) => ({
      title: `${title ?? "?"} · #${login ?? "?"}`,
      subtitle: `${at ? new Date(at).toISOString().slice(0, 10) : "?"} · ${reason ?? ""}`,
    }),
  },
}
