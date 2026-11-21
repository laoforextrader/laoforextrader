import Link from "next/link"

//  What changed, in the order a person asks it.
//
//  Modelled on a GitHub releases page because that shape is already familiar
//  to anyone who has updated software: newest at the top, a version and a
//  date, then short lines grouped by what kind of change they are. The one
//  addition is the red group — things an existing user must know before they
//  replace a working file, which on GitHub hides inside the prose and here
//  gets its own colour.

export interface Release {
  _id: string
  eaId: string
  version: string
  releasedAt: string
  headline: string
  added?: string[]
  changed?: string[]
  breaking?: string[]
}

const DAY = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""

function Group({ title, items, tone }: { title: string; items?: string[]; tone: "add" | "chg" | "brk" }) {
  if (!items?.length) return null
  const color = tone === "brk" ? "#DC2626" : tone === "add" ? "#16A34A" : "var(--fg-3)"
  return (
    <div style={{ marginTop: 12 }}>
      <div className="font-lao" style={{
        fontSize: 11, fontWeight: 800, letterSpacing: "0.06em",
        textTransform: "uppercase", color, marginBottom: 6,
      }}>
        {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((t, i) => (
          <li key={i} className="font-lao" style={{
            display: "flex", gap: 8, fontSize: 13, lineHeight: 1.75,
            color: tone === "brk" ? "var(--fg)" : "var(--fg-2)",
          }}>
            <span style={{ color, flexShrink: 0 }}>{tone === "brk" ? "!" : tone === "add" ? "+" : "~"}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ReleaseNotes({
  releases, title = "ການອັບເດດ", limit, moreHref,
}: {
  releases: Release[]
  title?: string
  /** Show only the newest N and link to the full list. */
  limit?: number
  moreHref?: string
}) {
  if (!releases.length) return null
  const shown = limit ? releases.slice(0, limit) : releases
  const hidden = releases.length - shown.length

  return (
    <section style={{
      background: "var(--surface)", border: "1px solid var(--line)",
      borderRadius: 16, padding: 24, marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", margin: 0 }}>
          {title}
        </h2>
        {moreHref && hidden > 0 && (
          <Link href={moreHref} className="font-lao" style={{
            fontSize: 12, fontWeight: 700, color: "var(--accent)", textDecoration: "none",
          }}>
            ເບິ່ງທັງໝົດ ({releases.length}) →
          </Link>
        )}
      </div>
      <p className="font-lao" style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 0 18px" }}>
        ເວີຊັນໃໝ່ ແລະ ສິ່ງທີ່ປ່ຽນໄປ — ອັບເດດໄດ້ຈາກລິງກ໌ດາວໂຫຼດດ້ານລຸ່ມ
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {shown.map((r, i) => (
          <div key={r._id} style={{
            paddingTop: i === 0 ? 0 : 20,
            paddingBottom: i === shown.length - 1 ? 0 : 20,
            borderBottom: i === shown.length - 1 ? "none" : "1px solid var(--line-2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span style={{
                fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 800,
                color: "var(--accent)", background: "var(--accent-soft)",
                border: "1px solid var(--accent-line)", borderRadius: 6, padding: "2px 9px",
              }}>
                v{r.version}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--fg-4)", fontFamily: "ui-monospace,monospace" }}>
                {DAY(r.releasedAt)}
              </span>
              {i === 0 && (
                <span className="font-lao" style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "2px 7px",
                  borderRadius: 4, background: "rgba(22,163,74,.14)", color: "#16A34A",
                }}>
                  ໃໝ່ສຸດ
                </span>
              )}
            </div>

            <h3 className="font-lao" style={{
              fontSize: 14.5, fontWeight: 700, color: "var(--fg)", margin: "10px 0 0", lineHeight: 1.6,
            }}>
              {r.headline}
            </h3>

            <Group title="ຕ້ອງລະວັງ" items={r.breaking} tone="brk" />
            <Group title="ເພີ່ມໃໝ່"  items={r.added}    tone="add" />
            <Group title="ປ່ຽນແປງ"   items={r.changed}  tone="chg" />
          </div>
        ))}
      </div>
    </section>
  )
}
