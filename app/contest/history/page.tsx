import type { Metadata } from "next"
import { allContests, entryCount, podiumOf } from "@/lib/contest/store"
import HistoryList, { type HistoryRound } from "@/components/contest/HistoryList"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Contest history — LaoForexTrader",
  description: "Every round of the LaoForexTrader demo trading contest, its winners and its sponsors.",
}

// The record of every round.
//
// Nothing is written at closing time to make this page work: a round's
// numbers are the entries' own, and they stop moving when the EAs stop
// reporting. The winners the owner verifies take over from the live order
// once they are filled in.
export default async function ContestHistoryPage() {
  const contests = await allContests()

  const rounds: HistoryRound[] = await Promise.all(
    contests.map(async c => {
      const [entries, podium] = await Promise.all([entryCount(c._id), podiumOf(c)])
      return {
        slug: c.slug,
        title: c.title,
        status: c.status,
        broker: c.broker,
        symbol: c.symbol,
        startAt: c.startAt,
        endAt: c.endAt,
        startBalance: c.startBalance,
        currency: c.currency,
        pool: (c.prizes ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0),
        entries,
        recap: c.recap,
        sponsors: c.sponsors,
        // The names alone travel to the client here; the logos are drawn on
        // the round's own page, where there is room for them.
        sponsorNames: (c.sponsors ?? []).map(s => s.name ?? "").filter(Boolean),
        podium,
      }
    })
  )

  return <HistoryList rounds={rounds} />
}
