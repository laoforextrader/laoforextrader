// Everything the /admin dashboard shows, in ONE Sanity round-trip.
//
// Reads go through `sanityWrite` (tokened, useCdn:false) rather than the
// anonymous read client on purpose: the anonymous client is CDN-cached and
// eventually consistent, which makes a dashboard look stale right after a
// click or a broadcast lands.

import { sanityWrite } from "@/lib/sanityWrite"
import { vientianeDay } from "@/lib/chat/quota"

export interface TopArticle {
  _id: string
  title: string
  slug: string
  category?: string
  views: number
  likes: number
  comments: number
  publishedAt?: string
}

export interface EaRow {
  eaId: string
  title?: string
  updateMode?: "off" | "daily" | "realtime"
  broker?: string
  account?: string
  balance?: number
  equity?: number
  profitTotal?: number
  profitTotalPct?: number
  lastUpdate?: string
  monthlyReturns?: { month: string; profitPct: number }[]
  dailyReturns?: { date: string; profitPct: number }[]
}

export interface ScheduleRow {
  key: string
  title?: string
  enabled?: boolean
  period?: "daily" | "weekly" | "monthly"
  hour?: number
  dayOfWeek?: number
  dayOfMonth?: number
  lastRunAt?: string
  lastStatus?: string
}

export interface ClickRow {
  target: string
  label: string
  group: string
  today: number
  d7: number
  d30: number
}

export interface ThreadRow {
  threadId: string
  name?: string
  email?: string
  status?: string
  path?: string
  lastUserAt?: string
  lastAdminAt?: string
  msgCount: number
  lastMsg?: string
  /** Visitor spoke last and nobody replied — needs the admin's attention. */
  awaitingReply: boolean
}

export interface AdminStats {
  day: string
  totals: {
    articles: number
    views: number
    likes: number
    comments: number
    subscribers: number
    subscribers7d: number
  }
  topArticles: TopArticle[]
  recentSubscribers: { email: string; name?: string; source?: string; createdAt?: string }[]
  eas: EaRow[]
  schedules: ScheduleRow[]
  clicks: ClickRow[]
  clickTotals: { today: number; d7: number; d30: number }
  chat: { today: number; users: number; d7: number; byTier: Record<string, number> }
  threads: ThreadRow[]
  awaitingCount: number
}

/** "YYYY-MM-DD" n days before the Asia/Vientiane today. */
function dayOffset(n: number): string {
  return vientianeDay(new Date(Date.now() - n * 86_400_000))
}

const QUERY = /* groq */ `{
  "articles":  count(*[_type == "article"]),
  "views":     math::sum(*[_type == "article"]{"v": coalesce(views, 0)}.v),
  "likes":     count(*[_type == "like"]),
  "comments":  count(*[_type == "comment"]),
  "subscribers":   count(*[_type == "subscriber" && unsubscribed != true]),
  "subscribers7d": count(*[_type == "subscriber" && coalesce(createdAt, _createdAt) > $since7iso]),

  "topArticles": *[_type == "article"] | order(coalesce(views, 0) desc) [0...10] {
    _id, title, "slug": slug.current, category, publishedAt,
    "views": coalesce(views, 0),
    "likes":    count(*[_type == "like"    && references(^._id)]),
    "comments": count(*[_type == "comment" && references(^._id)])
  },

  "recentSubscribers": *[_type == "subscriber" && unsubscribed != true]
    | order(coalesce(createdAt, _createdAt) desc) [0...8] {
      email, name, source, "createdAt": coalesce(createdAt, _createdAt)
    },

  "eas": *[_type == "eaStats"] | order(eaId asc) {
    eaId, title, updateMode, broker, account, balance, equity,
    profitTotal, profitTotalPct, lastUpdate, monthlyReturns, dailyReturns
  },

  "schedules": *[_type == "broadcastSchedule"] | order(period asc) {
    key, title, enabled, period, hour, dayOfWeek, dayOfMonth, lastRunAt, lastStatus
  },

  "clicks": *[_type == "clickStat" && day >= $since30] {
    target, label, group, day, "count": coalesce(count, 0)
  },

  "chatToday": *[_type == "chatQuota" && day == $today] { tier, "count": coalesce(count, 0) },
  "chat7d":    *[_type == "chatQuota" && day >= $since7] { "count": coalesce(count, 0) },

  "threads": *[_type == "supportThread"] | order(coalesce(lastUserAt, createdAt) desc) [0...10] {
    threadId, name, email, status, path, lastUserAt, lastAdminAt,
    "messages": messages[]{ role, content, createdAt }
  }
}`

export async function getAdminStats(): Promise<AdminStats> {
  const today   = vientianeDay()
  const since7  = dayOffset(6)   // inclusive 7-day window incl. today
  const since30 = dayOffset(29)

  const raw = await sanityWrite.fetch<any>(QUERY, {
    today,
    since7,
    since30,
    since7iso: new Date(Date.now() - 7 * 86_400_000).toISOString(),
  })

  // ── clicks: fold the per-day docs into one row per target ──────────────
  const byTarget = new Map<string, ClickRow>()
  for (const c of (raw.clicks ?? []) as any[]) {
    const row = byTarget.get(c.target) ?? {
      target: c.target,
      label: c.label || c.target,
      group: c.group || "other",
      today: 0, d7: 0, d30: 0,
    }
    // A newer doc may carry a better label than an old one.
    if (c.label) row.label = c.label
    if (c.group) row.group = c.group
    row.d30 += c.count
    if (c.day >= since7) row.d7 += c.count
    if (c.day === today) row.today += c.count
    byTarget.set(c.target, row)
  }
  const clicks = [...byTarget.values()].sort((a, b) => b.d30 - a.d30 || b.d7 - a.d7)
  const clickTotals = clicks.reduce(
    (acc, r) => ({ today: acc.today + r.today, d7: acc.d7 + r.d7, d30: acc.d30 + r.d30 }),
    { today: 0, d7: 0, d30: 0 },
  )

  // ── chat ───────────────────────────────────────────────────────────────
  const chatToday = (raw.chatToday ?? []) as { tier?: string; count: number }[]
  const byTier: Record<string, number> = {}
  for (const q of chatToday) byTier[q.tier ?? "guest"] = (byTier[q.tier ?? "guest"] ?? 0) + q.count

  // ── support threads ────────────────────────────────────────────────────
  const threads: ThreadRow[] = ((raw.threads ?? []) as any[]).map((t) => {
    const msgs = (t.messages ?? []) as { role?: string; content?: string }[]
    const last = msgs.length ? msgs[msgs.length - 1] : undefined
    return {
      threadId: t.threadId,
      name: t.name,
      email: t.email,
      status: t.status,
      path: t.path,
      lastUserAt: t.lastUserAt,
      lastAdminAt: t.lastAdminAt,
      msgCount: msgs.length,
      lastMsg: last?.content,
      // Trust the message list over the timestamps: lastAdminAt/lastUserAt are
      // written by two different routes and can disagree on a partial failure.
      awaitingReply: t.status !== "closed" && last?.role === "user",
    }
  })

  return {
    day: today,
    totals: {
      articles:      raw.articles ?? 0,
      views:         raw.views ?? 0,
      likes:         raw.likes ?? 0,
      comments:      raw.comments ?? 0,
      subscribers:   raw.subscribers ?? 0,
      subscribers7d: raw.subscribers7d ?? 0,
    },
    topArticles:       raw.topArticles ?? [],
    recentSubscribers: raw.recentSubscribers ?? [],
    eas:               raw.eas ?? [],
    schedules:         raw.schedules ?? [],
    clicks,
    clickTotals,
    chat: {
      today: chatToday.reduce((s, q) => s + q.count, 0),
      users: chatToday.length,
      d7:    ((raw.chat7d ?? []) as { count: number }[]).reduce((s, q) => s + q.count, 0),
      byTier,
    },
    threads,
    awaitingCount: threads.filter((t) => t.awaitingReply).length,
  }
}

// ── broadcast health ──────────────────────────────────────────────────────
// A schedule that hasn't fired in well over its own period means cron-job.org
// stopped calling us — the single most common silent failure in this repo.
const PERIOD_MAX_AGE_H: Record<string, number> = {
  daily:   26,
  weekly:  24 * 8,
  monthly: 24 * 32,
}

export function scheduleHealth(s: ScheduleRow): "off" | "ok" | "stale" | "never" {
  if (!s.enabled) return "off"
  if (!s.lastRunAt) return "never"
  const maxAge = PERIOD_MAX_AGE_H[s.period ?? "daily"] ?? 26
  const ageH = (Date.now() - new Date(s.lastRunAt).getTime()) / 3_600_000
  return ageH > maxAge ? "stale" : "ok"
}

/** EA data goes stale when MT5 is closed or the EA got detached. */
export function eaHealth(ea: EaRow): "off" | "ok" | "stale" | "never" {
  if (ea.updateMode === "off") return "off"
  if (!ea.lastUpdate) return "never"
  const ageH = (Date.now() - new Date(ea.lastUpdate).getTime()) / 3_600_000
  // The EA reports hourly by default; `daily` mode throttles to 60 min too.
  return ageH > 6 ? "stale" : "ok"
}
