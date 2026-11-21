//  Turning "the country they picked" plus "what they typed" into one number.
//
//  The contest form learned this the hard way: it glued 85620 onto whatever
//  was in the box, and a contestant who had already typed the 20 ended up
//  stored as 856 20 20 9662 7806 — fifteen digits pointing at nobody, with
//  nothing to report the mistake back (see lib/contest/phone.ts).
//
//  So the rule here is subtract, never add blindly: strip the country code
//  if the person typed it again, strip the national trunk zero, then put the
//  one country code on the front.

import { dialOf } from "@/lib/account/dialCodes"

const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "")

/** E.164 without the plus: country code followed by the subscriber number. */
export function intlNumber(countryCode: string, local: unknown): string {
  const dial = dialOf(countryCode)
  let d = digits(local)
  if (!d) return ""
  if (!dial) return d.replace(/^00/, "")

  //  "00856 20…" and "+856 20…" both arrive here as digits with the code in
  //  front; so does someone who typed their whole international number.
  if (d.startsWith("00" + dial)) d = d.slice(2 + dial.length)
  else if (d.startsWith(dial) && d.length > dial.length + 5) d = d.slice(dial.length)
  //  A trunk zero belongs to dialling inside the country and never travels.
  d = d.replace(/^0+/, "")
  if (!d) return ""
  return dial + d
}

/** True when the result is long enough to be a real number somewhere. */
export const phoneLooksValid = (v: unknown) => /^\d{9,15}$/.test(digits(v))
