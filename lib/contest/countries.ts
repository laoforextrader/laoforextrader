// The country list behind the registration picker and the flag on the board.
//
// Stored as an ISO 3166-1 alpha-2 code, because that is what a flag image is
// addressed by and what survives someone typing "Laos", "ລາວ" or "ປະເທດລາວ".
// Entries registered before the picker existed hold free text, so `toCode`
// accepts a name in any of the three languages as well as a code — the board
// resolves legacy values on the way out instead of a migration rewriting
// contestants' own rows.
//
// The list is compact on purpose: one line per country, parsed once. Lao and
// Thai names are given for the countries this contest actually draws from;
// everywhere else falls back to the English name, which is what a Lao reader
// sees on a passport and a broker form anyway.

export interface Country {
  code: string
  en: string
  lo?: string
  th?: string
}

// code | English | Lao | Thai
const RAW = `
LA|Laos|ລາວ|ลาว
TH|Thailand|ໄທ|ไทย
VN|Vietnam|ຫວຽດນາມ|เวียดนาม
KH|Cambodia|ກຳປູເຈຍ|กัมพูชา
MM|Myanmar|ມຽນມາ|เมียนมา
PH|Philippines|ຟີລິບປິນ|ฟิลิปปินส์
MY|Malaysia|ມາເລເຊຍ|มาเลเซีย
ID|Indonesia|ອິນໂດເນເຊຍ|อินโดนีเซีย
SG|Singapore|ສິງກະໂປ|สิงคโปร์
BN|Brunei|ບຣູໄນ|บรูไน
CN|China|ຈີນ|จีน
HK|Hong Kong|ຮົງກົງ|ฮ่องกง
TW|Taiwan|ໄຕ້ຫວັນ|ไต้หวัน
JP|Japan|ຍີ່ປຸ່ນ|ญี่ปุ่น
KR|South Korea|ເກົາຫຼີໃຕ້|เกาหลีใต้
IN|India|ອິນເດຍ|อินเดีย
BD|Bangladesh|ບັງກະລາເທດ|บังกลาเทศ
PK|Pakistan|ປາກິສຖານ|ปากีสถาน
LK|Sri Lanka|ສີລັງກາ|ศรีลังกา
NP|Nepal|ເນປານ|เนปาล
AU|Australia|ອົດສະຕຣາລີ|ออสเตรเลีย
NZ|New Zealand|ນິວຊີແລນ|นิวซีแลนด์
US|United States|ສະຫະລັດອາເມລິກາ|สหรัฐอเมริกา
CA|Canada|ການາດາ|แคนาดา
GB|United Kingdom|ອັງກິດ|สหราชอาณาจักร
IE|Ireland||
FR|France|ຝຣັ່ງ|ฝรั่งเศส
DE|Germany|ເຢຍລະມັນ|เยอรมนี
IT|Italy|ອີຕາລີ|อิตาลี
ES|Spain|ສະເປນ|สเปน
PT|Portugal||
NL|Netherlands||
BE|Belgium||
CH|Switzerland||
AT|Austria||
SE|Sweden||
NO|Norway||
DK|Denmark||
FI|Finland||
PL|Poland||
CZ|Czechia||
SK|Slovakia||
HU|Hungary||
RO|Romania||
BG|Bulgaria||
GR|Greece||
HR|Croatia||
RS|Serbia||
UA|Ukraine||
RU|Russia|ລັດເຊຍ|รัสเซีย
TR|Turkey||
AE|United Arab Emirates||
SA|Saudi Arabia||
QA|Qatar||
KW|Kuwait||
BH|Bahrain||
OM|Oman||
IL|Israel||
JO|Jordan||
LB|Lebanon||
IQ|Iraq||
IR|Iran||
EG|Egypt||
MA|Morocco||
DZ|Algeria||
TN|Tunisia||
LY|Libya||
NG|Nigeria||
GH|Ghana||
KE|Kenya||
TZ|Tanzania||
UG|Uganda||
ET|Ethiopia||
ZA|South Africa||
ZW|Zimbabwe||
ZM|Zambia||
CM|Cameroon||
CI|Ivory Coast||
SN|Senegal||
BR|Brazil||
AR|Argentina||
CL|Chile||
CO|Colombia||
PE|Peru||
MX|Mexico||
VE|Venezuela||
EC|Ecuador||
BO|Bolivia||
PY|Paraguay||
UY|Uruguay||
KZ|Kazakhstan||
UZ|Uzbekistan||
MN|Mongolia||
AF|Afghanistan||
MV|Maldives||
BT|Bhutan||
FJ|Fiji||
PG|Papua New Guinea||
`.trim()

export const COUNTRIES: Country[] = RAW.split("\n").map(line => {
  const [code, en, lo, th] = line.split("|")
  return { code, en, lo: lo || undefined, th: th || undefined }
})

const BY_CODE = new Map(COUNTRIES.map(c => [c.code, c]))

/** Loose key: lower-cased, with spaces, dots and hyphens gone. */
const key = (v: string) => v.toLowerCase().replace(/[\s.\-_']/g, "")

const BY_NAME = new Map<string, string>()
for (const c of COUNTRIES) {
  BY_NAME.set(key(c.en), c.code)
  if (c.lo) BY_NAME.set(key(c.lo), c.code)
  if (c.th) BY_NAME.set(key(c.th), c.code)
}
// What people actually typed into the old free-text field.
const ALIASES: Record<string, string> = {
  lao: "LA", laopdr: "LA", "ປະເທດລາວ": "LA", "ประเทศลาว": "LA", ລາວ: "LA",
  philippine: "PH", pilipinas: "PH", filipino: "PH",
  usa: "US", unitedstatesofamerica: "US", america: "US",
  uk: "GB", england: "GB", britain: "GB",
  korea: "KR", southkorea: "KR",
  vietnam: "VN", vietnem: "VN", vn: "VN",
  uae: "AE", emirates: "AE",
  burma: "MM",
}
for (const [k, v] of Object.entries(ALIASES)) BY_NAME.set(key(k), v)

/**
 * Whatever is stored, turned into a country code — or "" when it is not a
 * country we know. Never guesses: an unrecognised value simply gets no flag.
 */
export function toCode(value: string | undefined | null): string {
  const v = String(value ?? "").trim()
  if (!v) return ""
  const upper = v.toUpperCase()
  if (upper.length === 2 && BY_CODE.has(upper)) return upper
  return BY_NAME.get(key(v)) ?? ""
}

/** The country's name in the reader's language, falling back to English. */
export function countryName(codeOrText: string | undefined, lang: "en" | "th" | "lo"): string {
  const code = toCode(codeOrText)
  const c = code ? BY_CODE.get(code) : undefined
  if (!c) return String(codeOrText ?? "")
  return (lang === "lo" ? c.lo : lang === "th" ? c.th : c.en) || c.en
}

/** Search as somebody types: code, English, Lao or Thai, in any order. */
export function searchCountries(q: string, limit = 60): Country[] {
  const needle = key(q)
  if (!needle) return COUNTRIES.slice(0, limit)
  const starts: Country[] = []
  const has: Country[] = []
  for (const c of COUNTRIES) {
    const hay = [c.code, c.en, c.lo ?? "", c.th ?? ""].map(key)
    if (hay.some(h => h.startsWith(needle))) starts.push(c)
    else if (hay.some(h => h.includes(needle))) has.push(c)
  }
  return [...starts, ...has].slice(0, limit)
}
