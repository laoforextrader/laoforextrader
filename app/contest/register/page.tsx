import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, myEntry, entryCount } from "@/lib/contest/store"
import RegisterForm from "@/components/contest/RegisterForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Register — Demo Trading Contest",
  robots: { index: false, follow: true },   // the round page is what should rank
}

export default async function ContestRegisterPage() {
  const contest = await currentContest()
  if (!contest) redirect("/contest")

  // Google sign-in before anything is typed: the entry is keyed to the
  // account, and finding that out after filling a five-field form is the
  // kind of thing that loses a registration.
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) redirect("/login?callbackUrl=/contest/register")

  const [mine, entries] = await Promise.all([
    myEntry(email, contest._id),
    entryCount(contest._id),
  ])

  return (
    <RegisterForm
      existing={mine ?? null}
      contestTitle={contest.title}
      earlyBirdCount={contest.earlyBirdCount ?? 0}
      entries={entries}
      // Full is as closed as closed, from the form's point of view.
      open={contest.status === "register" &&
            (!contest.maxEntries || entries < contest.maxEntries)}
      full={!!contest.maxEntries && entries >= contest.maxEntries}
      requirements={{
        broker: contest.broker,
        accountType: contest.accountType,
        symbol: contest.symbol,
        startBalance: contest.startBalance,
        currency: contest.currency,
        signupUrl: contest.brokerSignupUrl,
      }}
    />
  )
}
