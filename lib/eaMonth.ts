// Which month an EA figure belongs to, resolved by key and never by position.
//
// `monthlyReturns` always carries the CURRENT month as its last entry, because
// the MQL rewrites that slot on every send. So `monthlyReturns[length - 1]` is
// "the running month" by accident, and the moment a surface wants any other
// month — or the array arrives one entry short — the position is simply wrong.
// This was a live bug once: the 1 Oct monthly LINE report published October's
// one-day-old +1.3% under a "month just closed" heading instead of September's
// +24.69%. See lib/broadcast/sanity.ts reportMonthKey(), the closed-month
// sibling of currentMonthKey() below.
//
// Asia/Bangkok throughout (UTC+7, no DST — same wall clock as Vientiane). The
// broker server runs its own clock, typically GMT+3, so a month boundary here
// and a month boundary in MT5 are hours apart; the keys the MQL writes are the
// authority on which month a number belongs to.

export type MonthlyReturn = { month?: string; profitPct?: number }

/** `YYYY-MM` for the month in progress, in Bangkok time. */
export function currentMonthKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  return `${get("year")}-${get("month")}`
}

const MONTH_LAO = [
  "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
  "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ",
]

/** "2026-11" → "ພະຈິກ 2026". Returns the key unchanged if it is malformed. */
export function monthKeyLabel(key: string): string {
  const [y, m] = key.split("-")
  const i = parseInt(m ?? "", 10) - 1
  if (!y || !MONTH_LAO[i]) return key
  return `${MONTH_LAO[i]} ${y}`
}

/**
 * The percentage recorded for one month.
 *
 * Three outcomes, kept distinct on purpose:
 *   undefined → no live data at all (an EA that has not shipped yet), so the
 *               caller may show its configured placeholder
 *   null      → live data exists but this month is missing from it, so the
 *               caller must show a gap. Substituting a placeholder here would
 *               publish an invented number as a result.
 *   number    → the recorded figure
 */
export function monthPctFor(
  rows: MonthlyReturn[] | undefined,
  monthKey: string,
): number | null | undefined {
  if (!rows || rows.length === 0) return undefined
  const hit = rows.find((r) => r.month === monthKey)
  if (!hit) return null
  return typeof hit.profitPct === "number" && !isNaN(hit.profitPct) ? hit.profitPct : null
}
