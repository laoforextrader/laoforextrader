// Shared reading of a `broker` doc for the review directory.
//
// Every broker doc is allowed to be half-filled, so nothing here invents a
// value: when a field is missing the helpers return null and the UI shows an
// explicit "not recorded yet" slot. Guessing a spread or a licence number
// would be the one mistake a broker-review site cannot afford — a reader who
// checks a number against the regulator's register and finds it wrong will
// not come back.

import type { Broker, BrokerLicense, BrokerRatingBreakdown } from "@/types"

// ── Countries ───────────────────────────────────────────────────────────────
// Keys match sanity/schemas/broker.ts BROKER_COUNTRIES and /public/flags/*.png.
export const COUNTRY_LAO: Record<string, string> = {
  cy: "ໄຊປຣັສ",
  au: "ອົດສະຕຣາລີ",
  gb: "ອັງກິດ",
  bz: "ເບລີສ",
  sc: "ເຊເຊວ",
  cw: "ກືຣາເຊົາ",
  ky: "ໝູ່ເກາະເຄແມນ",
  za: "ອາຟຣິກາໃຕ້",
  vu: "ວານົວຕູ",
  vg: "ໝູ່ເກາະເວີຈິນ (ອັງກິດ)",
  mu: "ມົຣິຊຽສ",
  us: "ສະຫະລັດ",
  jp: "ຍີ່ປຸ່ນ",
  ch: "ສະວິດເຊີແລນ",
  nz: "ນິວຊີແລນ",
  ca: "ການາດາ",
  sg: "ສິງກະໂປ",
  hk: "ຮ່ອງກົງ",
  ae: "ສະຫະລັດອາຣັບເອມິເຣດ",
  bs: "ບາຮາມາສ",
  mh: "ໝູ່ເກາະມາແຊວ",
  pa: "ປານາມາ",
}

export function countryName(code?: string): string | null {
  if (!code) return null
  return COUNTRY_LAO[code.toLowerCase()] ?? null
}

/** Null when we have no flag for the code, so callers render the row without one. */
export function flagSrc(code?: string): string | null {
  if (!code) return null
  const c = code.toLowerCase()
  return COUNTRY_LAO[c] ? `/flags/${c}.png` : null
}

// ── Licences ────────────────────────────────────────────────────────────────
export type NormalisedLicense = {
  regulator: string
  country: string | null
  countryCode: string | null
  flag: string | null
  licenseNo: string | null
  entity: string | null
  isRepresentative: boolean
}

/**
 * Prefers the structured `licenses[]`. Falls back to the legacy
 * `regulation` string / `regulators[]` so a doc nobody has migrated yet still
 * shows its regulators — just without a flag or a checkable number.
 */
export function licensesOf(broker: Broker): NormalisedLicense[] {
  const structured = (broker.licenses ?? []).filter(
    (l: BrokerLicense | null): l is BrokerLicense => Boolean(l && (l.regulator || l.licenseNo)),
  )
  if (structured.length > 0) {
    return structured.map((l) => ({
      regulator: (l.regulator ?? "").trim() || "—",
      country: countryName(l.country),
      countryCode: l.country?.toLowerCase() ?? null,
      flag: flagSrc(l.country),
      licenseNo: l.licenseNo?.trim() || null,
      entity: l.entity?.trim() || null,
      isRepresentative: Boolean(l.isRepresentative),
    }))
  }

  const legacy =
    broker.regulators && broker.regulators.length > 0
      ? broker.regulators
      : (broker.regulation ?? "")
          .split(/[,·]/)
          .map((x) => x.trim())
          .filter(Boolean)

  return legacy.map((name) => ({
    regulator: name,
    country: null,
    countryCode: null,
    flag: null,
    licenseNo: null,
    entity: null,
    isRepresentative: false,
  }))
}

// ── Numbers ─────────────────────────────────────────────────────────────────
/**
 * `minDeposit` is a legacy free-text string ("31", "$31", "31 USD"); the
 * sortable value lives in `minDepositUsd`. Sorting and filtering must never
 * fall back to the string, so this returns null rather than NaN.
 */
export function minDepositUsd(broker: Broker): number | null {
  if (typeof broker.minDepositUsd === "number") return broker.minDepositUsd
  const digits = (broker.minDeposit ?? "").replace(/[^0-9.]/g, "")
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

export function minDepositLabel(broker: Broker): string | null {
  const n = minDepositUsd(broker)
  return n === null ? null : `$${n}`
}

export function spreadLabel(broker: Broker): string | null {
  if (typeof broker.spreadFrom !== "number") return null
  return `${broker.spreadFrom.toFixed(1)} pip`
}

/** Years in business, or null when the founding year is missing or absurd. */
export function brokerAge(broker: Broker, now = new Date()): number | null {
  const y = broker.founded
  if (typeof y !== "number") return null
  const age = now.getFullYear() - y
  return age >= 0 && age < 100 ? age : null
}

// ── Scores ──────────────────────────────────────────────────────────────────
export const SCORE_ROWS: { key: keyof BrokerRatingBreakdown; label: string }[] = [
  { key: "stability", label: "ຄວາມໝັ້ນຄົງ" },
  { key: "deposit", label: "ການຝາກ-ຖອນ" },
  { key: "spread", label: "Spread" },
  { key: "support", label: "Support" },
  { key: "promotion", label: "ໂປຣໂມຊັ່ນ" },
]

/**
 * Graded 5→1, the shape a review-distribution block uses. Colours differ in
 * lightness as well as hue so the ranking survives colour-blind vision and
 * greyscale printing.
 */
export function gradeColor(v: number): string {
  if (v >= 4.5) return "#047857"
  if (v >= 3.5) return "#65A30D"
  if (v >= 2.5) return "#CA8A04"
  if (v >= 1.5) return "#EA580C"
  return "#DC2626"
}

export function scoreWord(rating?: number): string {
  const v = rating ?? 0
  if (v >= 4.5) return "ດີເລີດ"
  if (v >= 4) return "ດີຫຼາຍ"
  if (v >= 3) return "ດີ"
  if (v >= 2) return "ພໍໃຊ້"
  return "ຕ້ອງລະວັງ"
}

/**
 * Sanity hands back a null for an array item that was added and never filled,
 * so every read of a broker's arrays goes through a filter first. Skipping it
 * crashes the whole page render on one empty row in Studio.
 */
export function depositMethodsOf(broker: Broker) {
  return (broker.depositMethods ?? []).filter(
    (m): m is NonNullable<typeof m> => Boolean(m),
  )
}

export function faqOf(broker: Broker) {
  return (broker.faq ?? []).filter(
    (f): f is { q: string; a: string } => Boolean(f && f.q && f.a),
  )
}

export function textList(xs?: (string | null)[]): string[] {
  return (xs ?? []).filter((x): x is string => Boolean(x && x.trim()))
}

/** Lao bank support, as the three states the UI distinguishes. */
export type LaoDepositState = "full" | "partial" | "none"

export function laoDepositState(broker: Broker): LaoDepositState {
  if (broker.laoDeposit) return "full"
  const methods = depositMethodsOf(broker)
  const hasLak = methods.some((m) => (m.currency ?? "").toUpperCase().includes("LAK"))
  if (hasLak) return "full"
  const hasBank = methods.some((m) => /bank|ທະນາຄານ/i.test(m.name ?? ""))
  return hasBank ? "partial" : "none"
}

export const LAO_DEPOSIT_LABEL: Record<LaoDepositState, string> = {
  full: "ຝາກເງິນກີບໄດ້",
  partial: "ຝາກໄດ້ສະເພາະ USD",
  none: "ຝາກຜ່ານທະນາຄານລາວບໍ່ໄດ້",
}

/**
 * Where a "ສະໝັກ" button should point. `registerUrl` is the affiliate link;
 * `affiliateUrl` is the plain homepage. Falling back to `website` keeps a
 * half-filled doc clickable instead of rendering a dead button.
 */
export function registerHref(broker: Broker): string | null {
  return broker.registerUrl || broker.affiliateUrl || broker.website || null
}

export function sortBrokers(list: Broker[], sort: "rank" | "rating" | "minDep"): Broker[] {
  const copy = [...list]
  if (sort === "rating") {
    copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  } else if (sort === "minDep") {
    // Brokers with no recorded minimum sink to the bottom rather than
    // pretending to be the cheapest.
    copy.sort((a, b) => (minDepositUsd(a) ?? Infinity) - (minDepositUsd(b) ?? Infinity))
  } else {
    copy.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
  }
  return copy
}
