import { NextResponse } from "next/server"
import { contestBySlug, currentContest, leaderboard } from "@/lib/contest/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// The leaderboard, as the public sees it.
//
// Every field here is safe to show: no email, no contact, no entry code —
// `leaderboard()` selects the public columns explicitly rather than filtering
// a full document, so a new private field added to the schema later cannot
// leak through this route by accident.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim()
  const contest = slug ? await contestBySlug(slug) : await currentContest()
  if (!contest) return NextResponse.json({ error: "no contest" }, { status: 404 })

  const rows = await leaderboard(contest._id)
  return NextResponse.json(
    { slug: contest.slug, status: contest.status, rows },
    // A contestant refreshing hard should not cost a Sanity query each time;
    // 15s is well inside the EA's own one-minute push interval, so nobody
    // sees a number older than the data could possibly be.
    { headers: { "cache-control": "public, max-age=15, s-maxage=15" } }
  )
}
