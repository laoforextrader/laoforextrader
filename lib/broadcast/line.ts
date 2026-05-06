// Minimal LINE Messaging API wrapper for broadcast push.
//
// Token comes from process.env.LINE_CHANNEL_ACCESS_TOKEN. If missing,
// the helpers return early so we can preview broadcasts locally without
// hitting LINE.

const BROADCAST_URL = "https://api.line.me/v2/bot/message/broadcast"
const QUOTA_URL = "https://api.line.me/v2/bot/message/quota/consumption"

export interface LineMessage {
  type: "text" | "image"
  text?: string
  originalContentUrl?: string
  previewImageUrl?: string
}

export interface LineBroadcastResult {
  ok: boolean
  status: number
  body?: string
}

export function lineConfigured(): boolean {
  return !!process.env.LINE_CHANNEL_ACCESS_TOKEN
}

export async function broadcastLineMessages(messages: LineMessage[]): Promise<LineBroadcastResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    return { ok: false, status: 0, body: "no LINE_CHANNEL_ACCESS_TOKEN" }
  }
  if (messages.length === 0) {
    return { ok: false, status: 0, body: "no messages" }
  }
  if (messages.length > 5) {
    return { ok: false, status: 0, body: "LINE accepts at most 5 messages per call" }
  }
  const res = await fetch(BROADCAST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  })
  const body = await res.text().catch(() => "")
  return { ok: res.ok, status: res.status, body }
}

export async function getMonthlyQuotaUsed(): Promise<number | null> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return null
  try {
    const res = await fetch(QUOTA_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { totalUsage?: number }
    return typeof data.totalUsage === "number" ? data.totalUsage : null
  } catch {
    return null
  }
}
