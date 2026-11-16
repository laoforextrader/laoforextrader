import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { accountsOf } from "@/lib/semi/store"
import { dashSession } from "@/lib/semi/session"
import SemiDashboard from "@/components/semi/SemiDashboard"
import LinkAccount from "@/components/semi/LinkAccount"
import AccountPicker from "@/components/semi/AccountPicker"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "RocketMegi Semi — Dashboard",
  robots: { index: false, follow: false },   // a private control panel, not a page to rank
}

// Two locks, not one. The Google session says who you are on the site; the
// dashboard cookie says this browser has typed the key for a live trading
// account. Both are required to reach the controls, and "Sign out" here drops
// only the second, so you land back on the key form still signed into the site.
export default async function SemiPage({
  searchParams,
}: {
  searchParams: Promise<{ acc?: string; linked?: string }>
}) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) redirect("/login?callbackUrl=/semi")

  const accounts = await accountsOf(email)
  const unlocked = await dashSession()

  // The cookie is only worth anything for an account this user actually owns —
  // ownership is re-checked here on every load, never trusted from the cookie.
  const picked = unlocked && accounts.some(a => a.account === unlocked) ? unlocked : null

  const { acc, linked } = await searchParams

  if (!picked) {
    //  Owning accounts but not being unlocked for any of them is a real
    //  state, and it used to render as the bare key form — which is exactly
    //  what "I pressed Connect and nothing happened" looks like. Arriving
    //  here with ?linked=1 means the link succeeded and the cookie did not
    //  come back, so say that rather than showing the same form again in
    //  silence.
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        {accounts.length > 0
          ? <AccountPicker accounts={accounts} justLinked={linked === "1"} />
          : <LinkAccount />}
      </div>
    )
  }

  const show = acc && accounts.some(a => a.account === acc) ? acc : picked

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <SemiDashboard account={show} email={email} />
    </div>
  )
}
