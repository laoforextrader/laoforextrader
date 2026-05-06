export type BroadcastPeriod = "daily" | "weekly" | "monthly"
export type BroadcastTemplate = "ea-summary"

export interface BroadcastSchedule {
  _id: string
  key: string
  title: string
  enabled: boolean
  template: BroadcastTemplate
  period: BroadcastPeriod
  hour: number               // 0-23, Asia/Vientiane (UTC+7)
  dayOfWeek?: number         // 0-6 (0=Sun, 6=Sat) — used by weekly
  dayOfMonth?: number        // 1-31 — used by monthly
  lastRunAt?: string         // ISO datetime
  lastStatus?: string
  notes?: string
}

export interface BroadcastResult {
  key: string
  ok: boolean
  status: string
  imageUrls?: string[]
  textPreview?: string
  errorDetail?: string
}
