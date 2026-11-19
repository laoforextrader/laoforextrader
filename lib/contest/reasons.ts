// The reasons an entry gets cancelled or a person gets blocked.
//
// Its own module, with no Sanity import, because the admin row is a client
// component: importing these from `lib/contest/admin` would drag the
// authenticated write client into the browser bundle.
//
// Lao is the text that travels. The owner picks from the list, the chosen
// line is stored on the entry and the same line is what the WhatsApp message
// says — so the reason the contestant reads is the reason on the record, with
// nothing retyped in between. English is only the label on the owner's own
// screen.

export interface Reason { id: string; en: string; lo: string }

export const CANCEL_REASONS: Reason[] = [
  { id: "mt-login",  en: "MT5 account number is wrong",        lo: "ເລກບັນຊີ MT5 ບໍ່ຖືກຕ້ອງ" },
  { id: "mt-server", en: "MT5 server name is wrong",           lo: "ຊື່ເຊີບເວີ MT5 ບໍ່ຖືກຕ້ອງ" },
  { id: "investor",  en: "Investor password does not work",    lo: "Investor password ໃຊ້ເຂົ້າບໍ່ໄດ້" },
  { id: "balance",   en: "Starting balance is not the round's", lo: "ທຶນເລີ່ມຕົ້ນບໍ່ຖືກຕາມກະຕິກາ" },
  { id: "not-demo",  en: "Not a demo account",                 lo: "ບໍ່ແມ່ນບັນຊີເດໂມ" },
  { id: "acct-type", en: "Wrong account type or broker",       lo: "ປະເພດບັນຊີ ຫຼື ໂບຣກເກີບໍ່ຖືກຕ້ອງ" },
  { id: "contact",   en: "WhatsApp number cannot be reached",  lo: "ເບີ WhatsApp ຕິດຕໍ່ບໍ່ໄດ້" },
  { id: "other",     en: "Other — type it below",              lo: "" },
]

export const BLOCK_REASONS: Reason[] = [
  { id: "multi",     en: "Registered more than once",          lo: "ສະໝັກຫຼາຍໃບ ຄົນດຽວກັນ" },
  { id: "fake",      en: "Made-up details",                    lo: "ໃຫ້ຂໍ້ມູນປອມ" },
  { id: "abuse",     en: "Abusive or spamming",                lo: "ກໍ່ກວນ ຫຼື ສົ່ງສະແປມ" },
  { id: "manual",    en: "Traded by hand or with another EA",  lo: "ເທຣດມື ຫຼື ໃຊ້ EA ໂຕອື່ນ" },
  { id: "other",     en: "Other — type it below",              lo: "" },
]

/**
 * The reasons as separate lines — one per thing to fix.
 *
 * Several at a time, because an entry that was filled in carelessly is
 * usually wrong in more than one place, and a contestant who fixes the
 * account number only to be cancelled again over the server name has been
 * made to wait two rounds of messages for one mistake.
 *
 * The typed note is a line of its own at the end, never folded into a label.
 */
export function reasonLines(list: Reason[], ids: string[], typed: string): string[] {
  const picked = list
    .filter(r => ids.includes(r.id) && r.lo)
    .map(r => r.lo as string)
  const extra = typed.trim()
  if (extra) picked.push(extra)
  return picked
}

/**
 * The same reasons as one line, which is what the entry stores.
 *
 * " · " is the separator the whole site uses, and it is what the WhatsApp
 * message splits back into bullets — so the record and the message cannot
 * drift apart.
 */
export function reasonSummary(list: Reason[], ids: string[], typed: string): string {
  return reasonLines(list, ids, typed).join(" \u00b7 ").slice(0, 300)
}

/** The stored line, back into bullets. */
export const reasonBullets = (stored: string): string[] =>
  stored.split(" \u00b7 ").map(x => x.trim()).filter(Boolean)
