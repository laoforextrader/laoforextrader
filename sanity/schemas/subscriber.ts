// The `production` dataset is public, so nothing here is a readable address.
//
//   emailHash  HMAC of the lowercased email. Used to answer "do we already
//              have this person?" without storing anything legible.
//   emailEnc   AES-256-GCM ciphertext — unsealed server-side only, on /admin
//              and by the send path. See lib/pii.ts.
//   nameEnc    same, for the display name.
//
// Docs created before 2026-08-18 had plaintext `email` / `name` / `userImage`;
// scripts/harden-pii.js seals and strips them.
export const subscriberSchema = {
  name: "subscriber",
  title: "ສະມາຊິກ / Subscriber",
  type: "document",
  fields: [
    { name: "emailHash",  title: "Email (blind index)", type: "string", readOnly: true,
      description: "One-way HMAC — not reversible. Look at /admin to see who this is.",
      validation: (R: any) => R.required() },
    { name: "emailEnc",   title: "Email (sealed)", type: "string", readOnly: true },
    { name: "nameEnc",    title: "ຊື່ (sealed)",    type: "string", readOnly: true },
    { name: "source",     title: "ມາຈາກ",          type: "string", description: "google | newsletter | manual",
      options: { list: [
        { title: "Google login", value: "google" },
        { title: "Newsletter form", value: "newsletter" },
        { title: "Manual", value: "manual" },
      ] },
      initialValue: "google",
    },
    { name: "createdAt",     title: "ສະມາຊິກຕັ້ງແຕ່",       type: "datetime" },
    { name: "lastLoginAt",   title: "ເຂົ້າສຸດທ້າຍ",          type: "datetime" },
    { name: "loginCount",    title: "ຈຳນວນຄັ້ງເຂົ້າ",        type: "number", initialValue: 0 },
    { name: "verified",      title: "ຢັ້ງຢືນແລ້ວ",            type: "boolean", initialValue: false,
      description: "Google login users are auto-verified; newsletter signups are not until they confirm." },
    { name: "unsubscribed",  title: "ຍົກເລີກສະມາຊິກແລ້ວ", type: "boolean", initialValue: false },
    { name: "unsubscribedAt", title: "ວັນທີຍົກເລີກ",         type: "datetime" },
  ],
  preview: {
    select: { title: "emailHash", subtitle: "source", createdAt: "createdAt" },
    prepare({ title, subtitle, createdAt }: any) {
      return {
        title: title ? `#${String(title).slice(0, 12)}` : "(no index)",
        subtitle: `${subtitle ?? "?"} — ${createdAt ? String(createdAt).slice(0, 10) : ""}`,
      }
    },
  },
}
