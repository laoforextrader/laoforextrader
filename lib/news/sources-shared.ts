// Browser-safe helpers from the news pipeline (no Node deps).
// Server-side fetchers live in ./sources.ts.

const LAO_OFFSET_MS = 7 * 60 * 60 * 1000

// Convert any Finnhub time string into HH:MM in Lao time (UTC+7).
// Finnhub returns "YYYY-MM-DD HH:MM:SS" (UTC, no Z) — JS Date parses
// that as local time depending on runtime, so we explicitly normalise
// to UTC by appending Z when the suffix is missing.
export function formatLaoTime(input: string | undefined): string {
  if (!input) return ""
  let s = input.trim()
  if (!s) return ""
  // Replace " " between date and time with "T" so Date parses as ISO,
  // and append Z if no timezone suffix is present.
  if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T")
  if (!/Z|[+-]\d{2}:?\d{2}$/.test(s)) s = `${s}Z`
  const d = new Date(s)
  if (isNaN(d.getTime())) return ""
  const lao = new Date(d.getTime() + LAO_OFFSET_MS)
  const h = String(lao.getUTCHours()).padStart(2, "0")
  const m = String(lao.getUTCMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export function formatDateDDMMYYYY(d: string): string {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return d
  return `${m[3]}-${m[2]}-${m[1]}`
}
