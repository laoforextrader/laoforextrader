// Browser-safe helpers from the news pipeline (no Node deps).
// Server-side fetchers live in ./sources.ts.

export function formatLaoTime(iso: string | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const lao = new Date(d.getTime() + 7 * 60 * 60 * 1000)
  const h = String(lao.getUTCHours()).padStart(2, "0")
  const m = String(lao.getUTCMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export function formatDateDDMMYYYY(d: string): string {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return d
  return `${m[3]}-${m[2]}-${m[1]}`
}
