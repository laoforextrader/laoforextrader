import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { accountsOf } from "@/lib/semi/store"
import SemiDashboard from "@/components/semi/SemiDashboard"
import LinkAccount from "@/components/semi/LinkAccount"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "RocketMagi Semi — Dashboard",
  robots: { index: false, follow: false },   // a private control panel, not a page to rank
}

// Three states, one route: not signed in → the site's own login; signed in but
// no account linked → the key form; linked → the panel.
export default async function SemiPage({
  searchParams,
}: {
  searchParams: Promise<{ acc?: string }>
}) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) redirect("/login?callbackUrl=/semi")

  const accounts = await accountsOf(email)
  if (accounts.length === 0) {
    return <div style={{ background: "var(--bg)", minHeight: "100vh" }}><LinkAccount /></div>
  }

  const { acc } = await searchParams
  const picked = acc && accounts.some(a => a.account === acc) ? acc : accounts[0].account

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <SemiDashboard account={picked} email={email} />
    </div>
  )
}
