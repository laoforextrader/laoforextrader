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
    // Consent is tracked separately from membership. Signing in with Google
    // creates a subscriber doc but grants NO permission to email that person —
    // they clicked "log in to comment", not "send me mail". Only emailOptIn
    // does, and only the send path may read it.
    { name: "emailOptIn",    title: "ຍິນຍອມຮັບອີເມວ",       type: "boolean", initialValue: false },
    { name: "optInAt",       title: "ວັນທີຍິນຍອມ",           type: "datetime" },
    { name: "optInSource",   title: "ຍິນຍອມຈາກໜ້າໃດ",      type: "string",
      description: "dashboard | footer | manual" },

    //  The live registration link, if one is out. Written when the mail
    //  is sent and unset the moment the link is opened — that is what
    //  makes it single-use. Never shown to anyone: holding it is holding
    //  the account, which is also why it is not a field anybody edits.
    { name: "loginNonce",    title: "Login link (one-time)", type: "string", readOnly: true, hidden: true },
    { name: "loginNonceAt",  title: "Login link issued",     type: "datetime", readOnly: true, hidden: true },

    { name: "verified",      title: "ຢັ້ງຢືນແລ້ວ",            type: "boolean", initialValue: false,
      description: "Google login users are auto-verified; newsletter signups are not until they confirm." },
    // Written by scripts/send-newsletter.ts so a re-run after a crash resumes
    // instead of mailing everyone twice.
    { name: "lastEmailAt",       title: "ສົ່ງອີເມວຫຼ້າສຸດ",   type: "datetime", readOnly: true },
    { name: "lastEmailCampaign", title: "ແຄມເປນຫຼ້າສຸດ",   type: "string",   readOnly: true },

    { name: "unsubscribed",  title: "ຍົກເລີກສະມາຊິກແລ້ວ", type: "boolean", initialValue: false },
    { name: "unsubscribedAt", title: "ວັນທີຍົກເລີກ",         type: "datetime" },

    //  Profile, filled in by the member on /account after a Google sign-in.
    //  Signing in gives us an address; it does not tell us who the person is
    //  or how to reach them on WhatsApp, and the EA download is gated on
    //  having both plus an accepted licence.
    //
    //  The phone is sealed like the email and indexed the same way, so two
    //  accounts on one number can be spotted without the number being
    //  readable in a public dataset.
    { name: "phoneEnc",   title: "WhatsApp (sealed)",      type: "string", readOnly: true },
    { name: "phoneHash",  title: "WhatsApp (blind index)", type: "string", readOnly: true },
    //  Either a built-in avatar id (no upload) or an image the member sent,
    //  resized before it ever reaches storage.
    { name: "avatarId",   title: "ໄອຄອນໂປຣໄຟລ໌",          type: "string" },
    { name: "avatar",     title: "ຮູບໂປຣໄຟລ໌",             type: "image" },
    { name: "profileAt",  title: "ຕື່ມໂປຣໄຟລ໌ເມື່ອ",        type: "datetime" },
    //  Licence acceptance is its own record with its own timestamp and the
    //  version accepted: "they ticked a box once" is not an answer when the
    //  terms change.
    { name: "termsAt",    title: "ຍອມຮັບເງື່ອນໄຂເມື່ອ",     type: "datetime" },
    { name: "termsVer",   title: "ເງື່ອນໄຂສະບັບ",           type: "string" },
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
