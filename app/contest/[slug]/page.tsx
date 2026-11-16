import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { contestBySlug, leaderboard, entryCount, allContests, myEntry } from "@/lib/contest/store"
import ContestHome from "@/components/contest/ContestHome"

export const dynamic = "force-dynamic"

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const contest = await contestBySlug(slug)
  return {
    title: contest ? `${contest.title} — Demo Trading Contest` : "Demo Trading Contest",
    description: "Live leaderboard of the LaoForexTrader demo trading contest.",
  }
}

// One round by its own URL — the archive, and where a finished round keeps
// living after the homepage has moved on to the next one.
export default async function ContestRoundPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const contest = await contestBySlug(slug)
  if (!contest) notFound()

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
    />
  )
}
