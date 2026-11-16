import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, leaderboard, entryCount, allContests, myEntry } from "@/lib/contest/store"
import ContestHome from "@/components/contest/ContestHome"
import CTASelector from "@/components/cta/CTASelector"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Demo Trading Contest — LaoForexTrader",
  description: "Trade a demo account with the RocketMegi Semi EA. Biggest profit wins.",
}

export default async function ContestPage() {
  const contest = await currentContest()
  if (!contest) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-16 text-center">
        <h1 className="text-[20px] font-extrabold">Demo Trading Contest</h1>
        <p className="mt-2 text-[13px] text-bk-muted">No round is open yet. Check back soon.</p>
      </div>
    )
  }

  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  const [rows, entries, archive, mine] = await Promise.all([
    leaderboard(contest._id),
    entryCount(contest._id),
    allContests(),
    email ? myEntry(email, contest._id) : Promise.resolve(null),
  ])

  return (
    <ContestHome
      contest={contest}
      rows={rows}
      entries={entries}
      archive={archive.map(a => ({ slug: a.slug, title: a.title, status: a.status }))}
      myCode={mine?.entryCode ?? null}
    >
      <section className="border-t border-bk-line pt-6">
        <h2 className="mb-1 text-[16px] font-bold tracking-[-0.01em]">{"\u0e2a\u0e34\u0e48\u0e07\u0e17\u0e35\u0e48\u0e43\u0e0a\u0e49\u0e43\u0e19\u0e23\u0e2d\u0e1a\u0e19\u0e35\u0e49"}</h2>
        <CTASelector type="broker-exness" />
        <CTASelector type="ea-sgride" />
      </section>
    </ContestHome>
  )
}
