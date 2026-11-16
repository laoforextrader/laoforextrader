import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin/auth"
import { currentContest, allContests, contestBySlug } from "@/lib/contest/store"
import { adminEntries, waLink, readiness } from "@/lib/contest/admin"
import AdminEntryRow from "@/components/contest/AdminEntryRow"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Contest — Admin",
  robots: { index: false, follow: false },
}

// The owner's screen for one round: check the account, approve, message.
//
// Pending entries come first because they are the work; everyone else is
// below for reference. The investor password is on the page but behind a
// click, so a shared screen does not show it by accident.
export default async function AdminContestPage(
  { searchParams }: { searchParams: Promise<{ round?: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login?callbackUrl=/admin/contest")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { round } = await searchParams
  const contest = round ? await contestBySlug(round) : await currentContest()
  if (!contest) {
    return <div className="mx-auto max-w-[760px] px-4 py-10 text-[13px]">No contest round exists yet.</div>
  }

  const [entries, rounds] = await Promise.all([
    adminEntries(contest._id),
    allContests(),
  ])
  const base = process.env.PUBLIC_BASE_URL ?? "https://www.laoforextrader.com"

  const waiting = entries.filter(e => e.status === "pending" || e.status === "flagged")
  const rest = entries.filter(e => !waiting.includes(e))

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight">{contest.title}</h1>
          <p className="text-[12.5px] text-bk-muted">
            {contest.status} · {entries.length} registered · start balance{" "}
            {contest.startBalance?.toLocaleString()} {contest.currency}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="text-[12px] text-bk-muted hover:text-accent">← Admin</Link>
          <Link href="/contest" className="text-[12px] text-bk-muted hover:text-accent">Public page →</Link>
        </div>
      </div>

      {rounds.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {rounds.map(r => (
            <Link key={r.slug} href={`/admin/contest?round=${r.slug}`}
              className={`rounded-bk border px-2.5 py-1 text-[11.5px] ${
                r.slug === contest.slug ? "border-accent text-accent" : "border-bk-line text-bk-muted"
              }`}>
              {r.title}
            </Link>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-extrabold uppercase tracking-wide">
          Waiting for you ({waiting.length})
        </h2>
        {waiting.length === 0 && (
          <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-3 text-[12.5px] text-bk-muted">
            Nothing to check right now.
          </p>
        )}
        {waiting.map(e => (
          <AdminEntryRow key={e._id} e={e} waHref={waLink(e, contest, base)} checks={readiness(e, contest)} />
        ))}
      </section>

      {rest.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wide">
            Everyone else ({rest.length})
          </h2>
          {rest.map(e => (
            <AdminEntryRow key={e._id} e={e} waHref={waLink(e, contest, base)} checks={readiness(e, contest)} />
          ))}
        </section>
      )}
    </div>
  )
}
