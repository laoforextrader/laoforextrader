import Link from "next/link"

//  What changed, set like a terminal rather than like an article.
//
//  Owner's call, 2026-11-22: this is technical text and should not read as
//  more prose on a page of prose. Dark panel, monospace, one line per change
//  with a marker in front — the shape of a changelog a developer has read a
//  thousand times, which is also the shape that survives being skimmed.
//
//  Fixed dark colours, not theme tokens: a code panel is dark in both
//  themes, the same way a terminal screenshot is. The one thing that must
//  not be decorative is the red group — somebody about to overwrite a
//  working file needs it to be the first thing they see.

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

const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace"
const PANEL = "#0B1020"
const PANEL_LINE = "rgba(148,163,184,.18)"
const TEXT = "#CBD5E1"
const DIM = "#64748B"

const TONE = {
  brk: { mark: "!", color: "#F87171", label: "BREAKING" },
  add: { mark: "+", color: "#4ADE80", label: "ADDED" },
  chg: { mark: "~", color: "#60A5FA", label: "CHANGED" },
} as const

function Group({ items, tone }: { items?: string[]; tone: keyof typeof TONE }) {
  if (!items?.length) return null
  const t = TONE[tone]
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em",
        color: t.color, marginBottom: 5, opacity: 0.9,
      }}>
        {t.label}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((line, i) => (
          <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: t.color, flexShrink: 0, lineHeight: 1.9 }}>
              {t.mark}
            </span>
            <span className="font-lao" style={{
              fontSize: 12.5, lineHeight: 1.9,
              color: tone === "brk" ? "#FCA5A5" : TEXT,
            }}>
              {line}
            </span>
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
  limit?: number
  moreHref?: string
}) {
  if (!releases.length) return null
  const shown = limit ? releases.slice(0, limit) : releases
  const hidden = releases.length - shown.length

  return (
    <section style={{
      background: PANEL, border: `1px solid ${PANEL_LINE}`,
      borderRadius: 16, overflow: "hidden", marginBottom: 20,
    }}>
      {/* Title bar, the way a terminal window has one. */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 16px", borderBottom: `1px solid ${PANEL_LINE}`,
        background: "rgba(148,163,184,.05)",
      }}>
        <span style={{ display: "flex", gap: 6 }}>
          {["#F87171", "#FBBF24", "#4ADE80"].map(c => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.75 }} />
          ))}
        </span>
        <span className="font-lao" style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, flex: 1 }}>
          {title}
        </span>
        {moreHref && hidden > 0 && (
          <Link href={moreHref} style={{
            fontFamily: MONO, fontSize: 11, fontWeight: 700,
            color: "#60A5FA", textDecoration: "none",
          }}>
            all ({releases.length}) →
          </Link>
        )}
      </div>

      <div style={{ padding: "4px 16px 18px" }}>
        {shown.map((r, i) => (
          <div key={r._id} style={{
            paddingTop: 16,
            paddingBottom: i === shown.length - 1 ? 0 : 16,
            borderBottom: i === shown.length - 1 ? "none" : `1px solid ${PANEL_LINE}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span style={{
                fontFamily: MONO, fontSize: 13, fontWeight: 800, color: "#E2E8F0",
                background: "rgba(96,165,250,.12)", border: "1px solid rgba(96,165,250,.3)",
                borderRadius: 6, padding: "2px 9px",
              }}>
                v{r.version}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: DIM }}>
                {DAY(r.releasedAt)}
              </span>
              {i === 0 && (
                <span style={{
                  fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
                  padding: "2px 7px", borderRadius: 4,
                  background: "rgba(74,222,128,.14)", color: "#4ADE80",
                }}>
                  LATEST
                </span>
              )}
            </div>

            <p className="font-lao" style={{
              fontSize: 13.5, fontWeight: 600, color: "#F1F5F9",
              margin: "9px 0 0", lineHeight: 1.75,
            }}>
              {r.headline}
            </p>

            <Group items={r.breaking} tone="brk" />
            <Group items={r.added} tone="add" />
            <Group items={r.changed} tone="chg" />
          </div>
        ))}
      </div>
    </section>
  )
}
