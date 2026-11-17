import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, myEntry } from "@/lib/contest/store"
import MyEntryCard from "@/components/contest/MyEntryCard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your entry — Demo Trading Contest",
  robots: { index: false, follow: false },
}

// The page a contestant comes back to.
//
// Registration shows the code once and then the tab is closed, usually on a
// phone, and the next time they look for it is on the VPS days later. Sending
// them back through the registration form to find it worked but read as if
// they were signing up twice. This address is short enough to put in the
// WhatsApp message and does one thing: show the code, the status, and the way
// to the installer.
export default async function MyContestEntryPage() {
  const contest = await currentContest()
  if (!contest) redirect("/contest")

  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) redirect("/login?callbackUrl=/contest/me")

  const mine = await myEntry(email, contest._id)
  // Nothing registered on this Google account — the form is the right place,
  // and it will say so if they used a different account.
  if (!mine) redirect("/contest/register")

  return (
    <MyEntryCard
      contestTitle={contest.title}
      entryNo={mine.entryNo ?? 0}
      code={mine.entryCode ?? ""}
      status={mine.status ?? "pending"}
      lastSeen={mine.lastSeen ?? null}
      mtLogin={mine.mtLogin ?? ""}
      startAt={contest.startAt ?? null}
    />
  )
}
