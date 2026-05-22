// Daily message quota tracking for the AI chat.
//
// Stored as Sanity `chatQuota` docs keyed by `key` (= ip|userId) and the
// Asia/Vientiane day string. One doc per user per day. Cheap because
// Sanity charges per write, not storage, and 1 write per chat turn is
// negligible at expected traffic.

import { sanityWrite } from "@/lib/sanityWrite"

export type Tier = "guest" | "user" | "pro"

const LIMITS: Record<Tier, number> = {
  guest: 10,
  user:  30,
  pro:   1000, // effectively unlimited; cap protects against abuse
}

// "YYYY-MM-DD" in Asia/Vientiane (UTC+7, no DST — same as Asia/Bangkok)
export function vientianeDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Vientiane",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now)
}

function docId(key: string, day: string): string {
  // Replace anything non-alphanumeric so Sanity accepts the id
  const safe = `${key}_${day}`.replace(/[^a-zA-Z0-9_-]/g, "-")
  return `chatQuota-${safe}`
}

export interface QuotaResult {
  allowed: boolean
  used: number
  limit: number
  tier: Tier
}

export async function checkAndIncrementQuota(
  key: string,
  tier: Tier,
): Promise<QuotaResult> {
  const day   = vientianeDay()
  const limit = LIMITS[tier]
  const id    = docId(key, day)

  try {
    // Atomic-ish: fetch current, decide, then upsert with inc.
    const existing = await sanityWrite.fetch<{ count?: number } | null>(
      `*[_id == $id][0]{ count }`,
      { id },
    )
    const used = existing?.count ?? 0

    if (used >= limit) {
      return { allowed: false, used, limit, tier }
    }

    await sanityWrite
      .createOrReplace({
        _id: id,
        _type: "chatQuota",
        key,
        day,
        tier,
        count: used + 1,
        updatedAt: new Date().toISOString(),
      })
      .catch(() => null) // don't block on quota write errors

    return { allowed: true, used: used + 1, limit, tier }
  } catch {
    // Sanity outage → fail open so users aren't blocked. Quota will
    // resume working once the API recovers.
    return { allowed: true, used: 0, limit, tier }
  }
}

export async function getQuotaStatus(
  key: string,
  tier: Tier,
): Promise<{ used: number; limit: number; tier: Tier }> {
  const day   = vientianeDay()
  const limit = LIMITS[tier]
  const id    = docId(key, day)
  try {
    const doc = await sanityWrite.fetch<{ count?: number } | null>(
      `*[_id == $id][0]{ count }`,
      { id },
    )
    return { used: doc?.count ?? 0, limit, tier }
  } catch {
    return { used: 0, limit, tier }
  }
}
