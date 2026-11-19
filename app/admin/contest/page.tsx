import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin/auth"
import { currentContest, allContests, contestBySlug } from "@/lib/contest/store"
import {
  adminEntries, waLinkWelcome, waLinkApproved, waLinkCancelled, waLinkRemind,
  isEarlyBird, readiness, blockList, blockedLogins,
} from "@/lib/contest/admin"
import AdminEntryRow from "@/components/contest/AdminEntryRow"
import AdminRemindList, { type RemindRow } from "@/components/contest/AdminRemindList"
import AdminBlockList from "@/components/contest/AdminBlockList"

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
//
// Three sections were added once the first real round filled up: the chase
// list (who has registered but never connected an EA, which is the single
// most common state and the one that costs someone the contest), the block
// list, and the cancelled entries — which are deliberately NOT mixed in with
// the disqualified ones, because a cancelled entry is an invitation to
// register again.
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

  const [entries, rounds, blocks, blockedSet] = await Promise.all([
    adminEntries(contest._id),
    allContests(),
    blockList(),
    blockedLogins(),
  ])
  const base = process.env.PUBLIC_BASE_URL ?? "https://www.laoforextrader.com"

  const waiting = entries.filter(e => e.status === "pending" || e.status === "flagged")
  const closed = entries.filter(e => e.status === "cancelled" || e.status === "disqualified")
  const rest = entries.filter(e => !waiting.includes(e) && !closed.includes(e))

  // Everyone still in the round whose EA has never reported. They are the
  // ones who lose the contest without ever knowing why, so they are the
  // first thing on the page once registration is open.
  const chase: RemindRow[] = entries
    .filter(e => e.status !== "cancelled" && e.status !== "disqualified" && !e.lastSeen)
    .map(e => ({
      id: e._id,
      name: e.displayName,
      login: e.mtLogin,
      wa: waLinkRemind(e, contest, base),
      seen: !!e.lastSeen,
      remindedAt: e.remindedAt,
      remindCount: e.remindCount,
    }))

  const ms = contest.startAt ? Date.parse(contest.startAt) - Date.now() : NaN
  const daysLeft = Number.isFinite(ms) ? Math.max(0, Math.ceil(ms / 86_400_000)) : null

  const row = (e: (typeof entries)[number]) => (
    <AdminEntryRow
      key={e._id}
      e={e}
      waWelcome={waLinkWelcome(e, contest, base, isEarlyBird(e, contest))}
      waApproved={waLinkApproved(e, contest, base)}
      // The reason is chosen in the browser, so the link carries a token the
      // row swaps for it rather than the text itself.
      waCancelled={waLinkCancelled(e, contest, base, "__REASON__")}
      waRemind={waLinkRemind(e, contest, base)}
      earlyBird={isEarlyBird(e, contest)}
      checks={readiness(e, contest)}
      blocked={blockedSet.has(e.mtLogin)}
    />
  )

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight">{contest.title}</h1>
          <p className="text-[12.5px] text-bk-muted">
            {contest.status} · {entries.length - closed.length} in the round · {closed.length} cancelled or out ·
            start balance {contest.startBalance?.toLocaleString()} {contest.currency}
            {daysLeft !== null && contest.status === "register" && ` · starts in ${daysLeft}d`}
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
          Chase: no EA yet ({chase.length})
        </h2>
        <AdminRemindList rows={chase} daysLeft={daysLeft} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-extrabold uppercase tracking-wide">
          Waiting for you ({waiting.length})
        </h2>
        {waiting.length === 0 && (
          <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-3 text-[12.5px] text-bk-muted">
            Nothing to check right now.
          </p>
        )}
        {waiting.map(row)}
      </section>

      {rest.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wide">
            Everyone else ({rest.length})
          </h2>
          {rest.map(row)}
        </section>
      )}

      {closed.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wide">
            Cancelled and out ({closed.length})
          </h2>
          <p className="m-0 text-[11.5px] text-bk-muted">
            ยกเลิก = กรอกข้อมูลผิด สมัครใหม่ด้วยอีเมล เบอร์ และเลขบัญชีเดิมได้ ·
            ตัดสิทธิ์ = ที่นั่งถูกใช้ไปแล้ว รอบนี้สมัครใหม่ไม่ได้
          </p>
          {closed.map(row)}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-extrabold uppercase tracking-wide">
          Block list ({blocks.length})
        </h2>
        <AdminBlockList rows={blocks} />
      </section>
    </div>
  )
}
