// One place that decides what a contestant's WhatsApp number is.
//
// Written after entry #1 could not be messaged at all: the form prefixed
// 85620 while the contestant had already typed the 20 themselves, so the
// stored number was 856 20 20 9662 7806 — fifteen digits, which passed the
// length check and pointed at nobody. wa.me has no way to say "that number
// does not exist", it just opens an empty chat, so nothing reported the
// mistake back.
//
// The rule the owner set: whatever a Lao contestant types, the number we keep
// is 85620 followed by the last eight digits. That is the whole of a Lao
// mobile number — the rest is the country code and the mobile prefix, which
// are fixed, so any extra digits in front can only be a duplicate of them.

/** Digits only, with a leading international 00 or a + dropped. */
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "").replace(/^00/, "")

/**
 * The number as WhatsApp needs it: country code first, no plus, no spaces.
 *
 * `lao` is what the form's toggle says. For a Lao number the last eight
 * digits win, which is what makes 2096627806, 02096627806, 85620 9662 7806
 * and 9662 7806 all land on the same chat. For anyone else the number is
 * taken as typed, because we cannot guess their country's prefix.
 */
export function waNumber(raw: unknown, lao = true): string {
  const d = digits(raw)
  if (!d) return ""
  if (!lao) return d
  return "85620" + d.slice(-8)
}

/**
 * Repair a number that is already stored.
 *
 * Entries registered before this file existed hold whatever the old form
 * built, so every place that opens a chat runs the stored value back through
 * here. A number that is already correct passes through unchanged.
 *
 * Only Lao numbers are reshaped: 856 is the one country code we can be sure
 * about, because the form prefixed it. Anything else is left alone.
 */
export function waRepair(stored: unknown): string {
  const d = digits(stored)
  if (!d) return ""
  if (!d.startsWith("856")) return d
  //  Everything after the country code, with any repeated 20 prefixes and a
  //  national leading zero stripped off, leaves the subscriber number.
  let rest = d.slice(3)
  while (rest.length > 8 && (rest.startsWith("20") || rest.startsWith("020"))) {
    rest = rest.startsWith("020") ? rest.slice(3) : rest.slice(2)
  }
  if (rest.length < 8) return d          // too short to be a mobile — leave as is
  return "85620" + rest.slice(-8)
}

/** True when the number looks dialable. Used by the form and the API. */
export const waLooksValid = (v: unknown) => /^\d{10,15}$/.test(digits(v))
