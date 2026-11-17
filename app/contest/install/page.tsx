import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { currentContest, myEntry } from "@/lib/contest/store"
import { readFile } from "node:fs/promises"
import path from "node:path"
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

  // The direct download, for anyone who would rather not paste a command
  // into PowerShell — a reasonable thing to feel about a command that
  // installs something. Read from the manifest mk_publish.py writes, so the
  // link follows whatever build was last shipped rather than a path typed
  // here that goes stale on the next release.
  let ea: { url: string; size: number } | null = null
  try {
    const raw = await readFile(path.join(process.cwd(), "public", "ea", "dist", "manifest.json"), "utf8")
    const parsed = JSON.parse(raw)
    const builds = Array.isArray(parsed) ? parsed : parsed.builds ?? []
    const b = builds.find((x: any) => x?.id === "contest")
    if (b?.url) ea = { url: b.url as string, size: Number(b.size) || 0 }
  } catch {
    // No manifest in this deploy — the page still works, the button is just
    // not offered.
  }

  return (
    <>
      <InstallGuide
        installUrl={`${base}/contest-ea`}
        symbol={contest?.symbol ?? "XAUUSDm"}
        hasEntry={!!mine}
        entryCode={mine?.entryCode ?? null}
        eaUrl={ea?.url ?? null}
        eaSize={ea?.size ?? 0}
      />
      <div className="mx-auto max-w-[760px] px-4 pb-8 sm:px-8">
        <CTASelector type="broker-exness" />
      </div>
    </>
  )
}
