//  Country calling codes, for the phone field on the join form.
//
//  Kept apart from lib/contest/countries.ts on purpose: that file answers
//  "which flag and what is this country called", this one answers "what do
//  you dial". The codes are stable for decades and there are under a hundred
//  of them, so a literal table beats a dependency — and a wrong code here
//  produces a number that reaches nobody, which is the failure the contest
//  form already taught us to take seriously (see lib/contest/phone.ts).
//
//  Keys are the ISO alpha-2 codes used everywhere else on the site. Any
//  country missing from here still picks fine; it just shows no "+NN", and
//  the person types the full international number themselves.

export const DIAL: Record<string, string> = {
  LA: "856", TH: "66", VN: "84", KH: "855", MM: "95", PH: "63", MY: "60",
  ID: "62", SG: "65", BN: "673", CN: "86", HK: "852", TW: "886", JP: "81",
  KR: "82", IN: "91", BD: "880", PK: "92", LK: "94", NP: "977", AU: "61",
  NZ: "64", US: "1", CA: "1", GB: "44", IE: "353", FR: "33", DE: "49",
  IT: "39", ES: "34", PT: "351", NL: "31", BE: "32", CH: "41", AT: "43",
  SE: "46", NO: "47", DK: "45", FI: "358", PL: "48", CZ: "420", SK: "421",
  HU: "36", RO: "40", BG: "359", GR: "30", HR: "385", RS: "381", UA: "380",
  RU: "7", TR: "90", AE: "971", SA: "966", QA: "974", KW: "965", BH: "973",
  OM: "968", IL: "972", JO: "962", LB: "961", IQ: "964", IR: "98", EG: "20",
  MA: "212", DZ: "213", TN: "216", LY: "218", NG: "234", GH: "233",
  KE: "254", TZ: "255", UG: "256", ET: "251", ZA: "27", ZW: "263",
  ZM: "260", CM: "237", CI: "225", SN: "221", BR: "55", AR: "54", CL: "56",
  CO: "57", PE: "51", MX: "52", VE: "58", EC: "593", BO: "591", PY: "595",
  UY: "598", KZ: "7", UZ: "998", MN: "976", AF: "93", MV: "960", BT: "975",
  FJ: "679", PG: "675",
}

//  A faint example inside the box, so the person can see whether their own
//  number is meant to keep its leading zero. Only for the countries most of
//  this audience is in; everywhere else gets the generic hint.
export const SAMPLE: Record<string, string> = {
  LA: "20 9999 9999",
  TH: "81 234 5678",
  VN: "91 234 5678",
  KH: "12 345 678",
  CN: "131 2345 6789",
  US: "555 123 4567",
  GB: "7700 900123",
}

export const dialOf = (code?: string | null) => DIAL[String(code ?? "").toUpperCase()] ?? ""
