import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { accountsOf } from "@/lib/semi/store"
import { dashSession } from "@/lib/semi/session"
import SemiDashboard from "@/components/semi/SemiDashboard"
import LinkAccount from "@/components/semi/LinkAccount"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "RocketMagi Semi — Dashboard",
  robots: { index: false, follow: false },   // a private control panel, not a page to rank
}

// Two locks, not one. The Google session says who you are on the site; the
// dashboard cookie says this browser has typed the key for a live trading
// account. Both are required to reach the controls, and "Sign out" here drops
// only the second, so you land back on the key form still signed into the site.
export default async function SemiPage({
  searchParams,
}: {
  searchParams: Promise<{ acc?: string }>
}) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) redirect("/login?callbackUrl=/semi")

  const accounts = await accountsOf(email)
  const unlocked = await dashSession()

  // The cookie is only worth anything for an account this user actually owns —
  // ownership is re-checked here on every load, never trusted from the cookie.
  const picked = unlocked && accounts.some(a => a.account === unlocked) ? unlocked : null

  if (!picked) {
    return <div style={{ background: "var(--bg)", minHeight: "100vh" }}><LinkAccount /></div>
  }

  const { acc } = await searchParams
  const show = acc && accounts.some(a => a.account === acc) ? acc : picked

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <SemiDashboard account={show} email={email} />
    </div>
  )
}
