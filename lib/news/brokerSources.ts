// Broker-industry feeds, for /api/cron/broker-news.
//
// Separate from lib/news/sources.ts on purpose: that file reads FXStreet and
// ForexLive, which cover the MARKET (what gold did, what the Fed said). This
// one covers the BUSINESS — regulators fining a broker, a licence withdrawn,
// an acquisition, an iFX EXPO. A reader on /broker is deciding who to hand
// money to, and those are the stories that bear on it.
//
// Both feeds were checked by hand before being wired in; headlines on the day
// looked like "FINRA Fines Webull $4.2M", "South Africa's Regulator Makes
// Mixirite Licence Withdrawal Final", "Elev8 receives Most Innovative Broker
// 2026 award" — which is the shape this page needs.

import Parser from "rss-parser"
import { regionTier } from "@/lib/brokerMentions"

export interface BrokerNewsItem {
  title: string
  summary: string
  link: string
  pubDate: string
  sourceName: string
}

const FEEDS: { url: string; name: string }[] = [
  { url: "https://www.financemagnates.com/feed/", name: "Finance Magnates" },
  { url: "https://www.leaprate.com/feed/", name: "LeapRate" },
]

/** Per feed, so one slow host cannot eat the function budget. */
const FEED_TIMEOUT_MS = 6000
// Take the whole page each feed serves rather than the first handful. These
// are general finance wires, so on a given day only a third of the headlines
// bear on a retail broker; a small window meant the summariser was choosing
// from four candidates and the section came out thin. Prompt tokens are the
// cheap half of the call, so a bigger pool costs almost nothing.
const PER_FEED_ITEMS = 20

/**
 * Both feeds carry general finance alongside broker stories — a bank's
 * quarterly profit is not what someone comparing brokers came for. This is a
 * cheap pre-filter so Claude is handed candidates rather than the whole wire;
 * it is deliberately loose, because the summariser drops what does not fit
 * and a keyword list that is too tight silently starves the page.
 */
const RELEVANT_RE =
  /broker|brokerage|regulat|licen[cs]e|fca|cysec|asic|finra|cftc|nfa|fsca|fsa|bafin|esma|expo|forex|fx |cfd|trading platform|metatrader|mt4|mt5|prop firm|spread|leverage|client funds|compensation|fine[ds]?|penalt|sanction|acquisi|merger|withdraw/i

function isRelevant(title: string, summary: string): boolean {
  return RELEVANT_RE.test(`${title} ${summary}`)
}

function cleanText(s: string | undefined): string {
  return (s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * How stale a story may be and still be promoted ahead of a fresher one.
 *
 * Both feeds normally carry a few days, so this rarely bites — but a feed
 * that stops updating would otherwise park a three-week-old Exness story at
 * the top of the section indefinitely, because tier beats date.
 */
const PROMOTE_WINDOW_DAYS = 10

/**
 * Closest to home first, then newest, de-duplicated by headline.
 *
 * The same story runs on both outlets most days (both covered the Webull
 * fine), and publishing it twice is the fastest way to look automated.
 *
 * `ourBrokerNames` is every name the site's own broker docs go by (see
 * lib/brokerMentions.ts). Pass it and the pool is read in the order a Lao
 * reader cares about: our brokers, then this region's, then the rest. Leave
 * it out and the ordering is the plain newest-first it always was, which is
 * what the `?debug=true` call and any future caller without a Sanity client
 * get.
 */
export async function fetchBrokerNews(
  limit = 20,
  ourBrokerNames: string[] = [],
): Promise<BrokerNewsItem[]> {
  const parser = new Parser({
    timeout: FEED_TIMEOUT_MS,
    headers: { "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0" },
  })

  const settled = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const feed = await parser.parseURL(f.url)
      return (feed.items ?? []).slice(0, PER_FEED_ITEMS).map((item) => ({
        title: cleanText(item.title),
        summary: cleanText(item.contentSnippet ?? item.content ?? "").slice(0, 400),
        link: item.link ?? "",
        pubDate: item.pubDate ?? item.isoDate ?? "",
        sourceName: f.name,
      }))
    }),
  )

  const all: BrokerNewsItem[] = []
  for (const r of settled) {
    if (r.status === "fulfilled") all.push(...r.value)
  }

  const seen = new Set<string>()
  const kept = all
    .filter((i) => i.title && i.link)
    .filter((i) => isRelevant(i.title, i.summary))
    .filter((i) => {
      // Normalised headline: the two outlets word the same story slightly
      // differently, so compare on letters only.
      const key = i.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 60)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  // Tier and date, resolved once per item rather than once per comparison.
  const promoteFloor = Date.now() - PROMOTE_WINDOW_DAYS * 86400_000
  const rank = new Map<BrokerNewsItem, { tier: number; at: number }>()
  for (const i of kept) {
    const at = Date.parse(i.pubDate) || 0
    rank.set(i, {
      // A story too old to be promoted drops to the bottom tier and competes
      // on date alone, so a stalled feed cannot pin last month's news up top.
      tier: at && at < promoteFloor ? 2 : regionTier(`${i.title} ${i.summary}`, ourBrokerNames),
      at,
    })
  }

  return kept
    .sort((a, b) => {
      const ra = rank.get(a)!
      const rb = rank.get(b)!
      return ra.tier - rb.tier || rb.at - ra.at
    })
    .slice(0, limit)
}

/**
 * Same tiering as the ordering above, for a caller that needs to say WHICH
 * stories are close to home — the summariser marks them in its prompt so the
 * model keeps them when it has to choose five out of twenty.
 */
export function brokerNewsTier(item: BrokerNewsItem, ourBrokerNames: string[]): number {
  return regionTier(`${item.title} ${item.summary}`, ourBrokerNames)
}
