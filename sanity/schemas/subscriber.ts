export const subscriberSchema = {
  name: "subscriber",
  title: "ສະມາຊິກ / Subscriber",
  type: "document",
  fields: [
    { name: "email",         title: "Email",            type: "string", validation: (R: any) => R.required().email() },
    { name: "name",          title: "ຊື່",                type: "string" },
    { name: "userImage",     title: "Avatar",           type: "url" },
    { name: "source",        title: "ມາຈາກ",            type: "string", description: "google | newsletter | manual",
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
    select: { title: "email", subtitle: "name" },
  },
}
