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
 * The one line that is stored and sent.
 *
 * The typed part is appended rather than replacing the label, so a reason
 * picked from the list keeps its wording even when the owner adds a detail
 * ("MT5 account number is wrong · 464212306 does not exist").
 */
export function reasonText(list: Reason[], id: string, typed: string): string {
  const found = list.find(r => r.id === id)
  const label = found?.lo ?? ""
  const extra = typed.trim()
  return [label, extra].filter(Boolean).join(" · ").slice(0, 300)
}
