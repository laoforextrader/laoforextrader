import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, myEntry } from "@/lib/contest/store"
import InstallGuide from "@/components/contest/InstallGuide"
import CTASelector from "@/components/cta/CTASelector"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Install the contest EA",
  description: "How to install and connect the contest EA, on a PC or a VPS.",
}

// Deliberately public, and deliberately separate from the registration page.
//
// A contestant comes back here days after signing up, usually on a different
// machine from the one they registered on, and often to read step 2 again.
// Putting it behind the form would mean signing in on the VPS to read it.
export default async function ContestInstallPage() {
  const contest = await currentContest()
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  const mine = contest && email ? await myEntry(email, contest._id) : null

  const base = process.env.PUBLIC_BASE_URL ?? "https://www.laoforextrader.com"

  return (
    <>
      <InstallGuide
        installUrl={`${base}/contest-ea`}
        symbol={contest?.symbol ?? "XAUUSDm"}
        hasEntry={!!mine}
        entryCode={mine?.entryCode ?? null}
      />
      <div className="mx-auto max-w-[760px] px-4 pb-8 sm:px-8">
        <CTASelector type="broker-exness" />
      </div>
    </>
  )
}
