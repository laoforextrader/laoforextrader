import Link from "next/link"
import { sanityClient } from "@/lib/sanity"

//  What changed, for every EA at once.
//
//  It used to show the newest release only, which answers the wrong
//  question: somebody running MegiHedge does not care that SGrid moved, and
//  a single strip told them nothing about their own build. So every EA that
//  has ever had a release gets a line here, newest first, and each line
//  carries the only three things worth scanning for — which EA, which
//  version, how long ago (owner's call, 2026-11-22).
//
//  One line each, truncated rather than wrapped: six EAs that each take two
//  lines is a wall, and the headline is a teaser for the notes page, not the
//  notes themselves.

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

/** True while a release is new enough to be worth a flag beside it. */
const FRESH = (iso: string) => Date.now() - new Date(iso).getTime() < 14 * 86_400_000

export default async function UpdateBanner() {
  let rows: Row[] = []
  try {
    rows = await sanityClient.fetch<Row[]>(
      `*[_type == "eaRelease"] | order(releasedAt desc)[0...40]{ _id, eaId, version, releasedAt, headline }`)
  } catch {}
  if (!rows.length) return null

  //  Newest per EA. The query is already in date order, so the first time an
  //  eaId appears is its current build.
  const latest: Row[] = []
  const seen = new Set<string>()
  for (const r of rows) {
    if (seen.has(r.eaId)) continue
    seen.add(r.eaId)
    latest.push(r)
  }

  return (
    <section style={{ background: "#050816", borderBottom: "1px solid #1E1B4B" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "22px 24px" }}>
        <div style={{
          background: "#0B1020", border: "1px solid rgba(148,163,184,.18)",
          borderRadius: 14, overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px", borderBottom: "1px solid rgba(148,163,184,.14)",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: MONO, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em",
              color: "#4ADE80",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80" }} />
              UPDATES
            </span>
            <Link href="/ea-system/updates" className="font-lao" style={{
              marginLeft: "auto", fontSize: 12, fontWeight: 700,
              color: "#93C5FD", textDecoration: "none",
            }}>
              ເບິ່ງທັງໝົດ →
            </Link>
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {latest.map((r, i) => (
              <li key={r._id} style={{ borderTop: i ? "1px solid rgba(148,163,184,.10)" : "none" }}>
                <Link href="/ea-system/updates" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 16px", textDecoration: "none", minWidth: 0,
                }}>
                  <span className="font-lao" style={{
                    fontSize: 13, fontWeight: 700, color: "#F1F5F9",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {NAMES[r.eaId] ?? r.eaId}
                  </span>

                  <span style={{
                    fontFamily: MONO, fontSize: 11.5, fontWeight: 800, color: "#93C5FD",
                    background: "rgba(96,165,250,.12)", border: "1px solid rgba(96,165,250,.3)",
                    borderRadius: 5, padding: "1px 7px", flexShrink: 0,
                  }}>
                    v{r.version}
                  </span>

                  {FRESH(r.releasedAt) && (
                    <span style={{
                      fontFamily: MONO, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em",
                      padding: "2px 6px", borderRadius: 4, flexShrink: 0,
                      background: "rgba(74,222,128,.14)", color: "#4ADE80",
                    }}>
                      NEW
                    </span>
                  )}

                  {/* The sentence, as much of it as the row has room for. */}
                  <span className="font-lao hide-sm" style={{
                    flex: 1, minWidth: 0, fontSize: 12, color: "#94A3B8",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {r.headline}
                  </span>

                  <span style={{
                    marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, color: "#64748B",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {WHEN(r.releasedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
