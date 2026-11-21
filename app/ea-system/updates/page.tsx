import type { Metadata } from "next"
import Link from "next/link"
import { sanityClient } from "@/lib/sanity"
import ReleaseNotes, { type Release } from "@/components/ea/ReleaseNotes"

export const metadata: Metadata = {
  title: "ການອັບເດດ EA",
  description: "ເວີຊັນໃໝ່ຂອງ EA ທຸກຕົວ ແລະ ສິ່ງທີ່ປ່ຽນໄປໃນແຕ່ລະເວີຊັນ",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/updates" },
}

//  Sanity is the source of truth and the page is read often, so it is cached
//  for an hour rather than queried per visit. A release the owner just wrote
//  is not urgent to the minute; the mail that goes with it is what makes it
//  urgent, and that path does not read this page.
export const revalidate = 3600

const NAMES: Record<string, string> = {
  sgrid:     "TheRocket SGrid",
  sgridpro:  "TheRocket SGrid Pro",
  megihedge: "TheRocket MegiHedge",
  hostgrid:  "TheRocket HostGrid",
  semi:      "TheRocket MegiSemi",
  contest:   "Contest build",
}

const DL: Record<string, string> = {
  sgrid:     "/ea-system/sgrid-download",
  sgridpro:  "/ea-system/sgridpro-download",
  megihedge: "/ea-system/megihedge-download",
  semi:      "/ea-system/semi-download",
}

export default async function UpdatesPage() {
  let all: Release[] = []
  try {
    all = await sanityClient.fetch<Release[]>(
      `*[_type == "eaRelease"] | order(releasedAt desc)[0...100]{
         _id, eaId, version, releasedAt, headline, added, changed, breaking }`,
    )
  } catch {}

  //  Grouped by EA rather than one long mixed stream: somebody arrives
  //  wanting to know about the one they run, not about all five.
  const byEa = new Map<string, Release[]>()
  for (const r of all) {
    const list = byEa.get(r.eaId) ?? []
    list.push(r)
    byEa.set(r.eaId, list)
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 20px 64px" }}>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-4)", marginBottom: 10 }}>
          Changelog
        </div>
        <h1 className="font-lao" style={{ fontSize: 32, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 10px" }}>
          ການອັບເດດ EA
        </h1>
        <p className="font-lao" style={{ fontSize: 13.5, color: "var(--fg-3)", lineHeight: 1.8, margin: "0 0 28px" }}>
          ທຸກເວີຊັນທີ່ປ່ອຍອອກ ແລະ ສິ່ງທີ່ປ່ຽນໄປ · ຕິກຮັບອີເມວໃນ{" "}
          <Link href="/dashboard" style={{ color: "var(--accent)", fontWeight: 700 }}>ໜ້າສະມາຊິກ</Link>{" "}
          ເພື່ອໃຫ້ແຈ້ງເຕືອນເມື່ອມີເວີຊັນໃໝ່
        </p>

        {byEa.size === 0 && (
          <p className="font-lao" style={{ fontSize: 13.5, color: "var(--fg-3)" }}>
            ຍັງບໍ່ມີບັນທຶກການອັບເດດ
          </p>
        )}

        {[...byEa.entries()].map(([eaId, list]) => (
          <div key={eaId} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "0 0 10px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)", margin: 0, fontFamily: "Arial,sans-serif" }}>
                {NAMES[eaId] ?? eaId}
              </h2>
              {DL[eaId] && (
                <Link href={DL[eaId]} className="font-lao" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
                  ໜ້າດາວໂຫຼດ →
                </Link>
              )}
            </div>
            <ReleaseNotes releases={list} title={`ເວີຊັນ (${list.length})`} />
          </div>
        ))}

      </div>
    </div>
  )
}
