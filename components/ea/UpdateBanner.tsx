import Link from "next/link"
import { sanityClient } from "@/lib/sanity"

//  "There is a new build" — the one line that belongs on the EA page itself.
//
//  Somebody who already runs an EA does not come here to read the pitch; they
//  come to find out whether anything changed. Burying that inside a download
//  page they have to pick first makes them hunt for it, so the newest release
//  of any build is stated here with its date, and the whole strip is the link
//  to the notes.

const NAMES: Record<string, string> = {
  sgrid: "TheRocket SGrid",
  sgridpro: "TheRocket SGrid Pro",
  megihedge: "TheRocket MegiHedge",
  hostgrid: "TheRocket HostGrid",
  semi: "TheRocket MegiSemi",
  contest: "Contest build",
}

const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

interface Row { _id: string; eaId: string; version: string; releasedAt: string; headline: string }

const WHEN = (iso: string) => {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  const stamp = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  //  Both: the date answers "which build is this", the age answers "is this
  //  news to me" without the reader doing arithmetic.
  if (days <= 0) return `${stamp} · ມື້ນີ້`
  if (days === 1) return `${stamp} · ມື້ວານ`
  if (days < 30) return `${stamp} · ${days} ມື້ກ່ອນ`
  return stamp
}

export default async function UpdateBanner() {
  let rows: Row[] = []
  try {
    rows = await sanityClient.fetch<Row[]>(
      `*[_type == "eaRelease"] | order(releasedAt desc)[0...3]{ _id, eaId, version, releasedAt, headline }`)
  } catch {}
  if (!rows.length) return null

  return (
    <section style={{ background: "#050816", borderBottom: "1px solid #1E1B4B" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "22px 24px" }}>
        <Link href="/ea-system/updates" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            background: "#0B1020", border: "1px solid rgba(148,163,184,.18)",
            borderRadius: 14, padding: "14px 18px",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0,
              fontFamily: MONO, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em",
              color: "#4ADE80",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80" }} />
              UPDATE
            </span>

            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#F1F5F9", fontFamily: "Arial,sans-serif" }}>
                  {NAMES[rows[0].eaId] ?? rows[0].eaId}
                </span>
                <span style={{
                  fontFamily: MONO, fontSize: 12, fontWeight: 800, color: "#93C5FD",
                  background: "rgba(96,165,250,.12)", border: "1px solid rgba(96,165,250,.3)",
                  borderRadius: 5, padding: "1px 7px",
                }}>
                  v{rows[0].version}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#64748B" }}>
                  {WHEN(rows[0].releasedAt)}
                </span>
              </span>
              <span className="font-lao" style={{
                display: "block", fontSize: 12.5, color: "#CBD5E1",
                marginTop: 4, lineHeight: 1.7,
              }}>
                {rows[0].headline}
              </span>
            </span>

            <span className="font-lao" style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 12.5, fontWeight: 700, color: "#93C5FD",
            }}>
              ເບິ່ງການອັບເດດ
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h13" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
