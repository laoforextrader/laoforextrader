import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { capitalBase, fmtMoney, fmtMoneyPlain, pctMoney, toRealMoney } from "@/lib/eaMoney"
import type { EAStats } from "@/types"

// One layout, two routes (SGrid + MegiHedge). Cloning the page instead would
// let the two drift — the lesson from scripts/preview-broadcast.ts, which
// reimplemented the caption maths and stopped matching what LINE received.
// Everything an EA differs by is a prop; the numbers all come from the same
// `eaStats` doc and the same lib/eaMoney helpers as the showcase card.

export const LINE_URL = "https://line.me/R/ti/p/@499dvtuz"

export interface DownloadFile {
  label: string
  note: string
  href: string
  /** `false` routes the row to LINE instead — never a dead link. */
  ready: boolean
}

export interface Accent {
  heroBg: string
  pillBg: string
  pillBorder: string
  pillText: string
}

export const ACCENTS: Record<"blue" | "purple", Accent> = {
  blue: {
    heroBg: "linear-gradient(160deg,#0B1020 0%,#141B36 60%,#1B2450 100%)",
    pillBg: "rgba(96,165,250,.15)",
    pillBorder: "rgba(96,165,250,.35)",
    pillText: "#93C5FD",
  },
  purple: {
    heroBg: "linear-gradient(160deg,#0A031F 0%,#1B0F36 60%,#2A0A40 100%)",
    pillBg: "rgba(196,181,253,.14)",
    pillBorder: "rgba(196,181,253,.35)",
    pillText: "#DDD6FE",
  },
}

const CHANNELS = [
  { name: "LINE", href: LINE_URL, icon: "/email/line.png" },
  { name: "YouTube", href: "https://www.youtube.com/@MeeMuangsong", icon: "/email/youtube.png" },
  { name: "TikTok", href: "https://www.tiktok.com/@meemuangsong", icon: "/email/tiktok.png" },
  { name: "Facebook", href: "https://www.facebook.com/groups/Laoforextrader", icon: "/email/facebook.png" },
]

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`

const LAO_MONTH = ["ມ.ກ.", "ກ.ພ.", "ມີ.ນ.", "ເມ.ສ.", "ພ.ພ.", "ມິ.ຖ.", "ກ.ລ.", "ສ.ຫ.", "ກ.ຍ.", "ຕ.ລ.", "ພ.ຈ.", "ທ.ວ."]

function monthLabel(m: string): string {
  const [y, mm] = m.split("-")
  return `${LAO_MONTH[Number(mm) - 1] ?? mm} ${y.slice(2)}`
}

interface Props {
  eaId: string
  /** Pill above the headline, e.g. "🚀 TheRocket EA SGrid". */
  badge: string
  headline: string
  blurb: string
  files: DownloadFile[]
  accent: Accent
}

export default async function EADownloadPage({
  eaId, badge, headline, blurb, files, accent,
}: Props) {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(QUERIES.eaStatsByEaId(eaId))
    if (!stats || stats.updateMode === "off") stats = null
  } catch {}

  // Drop the zero-filled months before the account's first trade: the MQL
  // back-fills a year of buckets, which would otherwise show eleven empty
  // bars and a "1/12 positive months" that implies a year of trading.
  const allMonths = (stats?.monthlyReturns ?? []).filter((m) => typeof m.profitPct === "number")
  const firstActive = allMonths.findIndex((m) => m.profitPct !== 0)
  const months = firstActive > 0 ? allMonths.slice(firstActive) : allMonths
  const values = months.map((m) => m.profitPct)
  const totalPct = stats?.profitTotalPct
  const positive = values.filter((v) => v > 0).length
  const best = values.length ? Math.max(...values) : null
  const worst = values.length ? Math.min(...values) : null
  const peak = values.length ? Math.max(...values.map((v) => Math.abs(v))) : 1

  // Money beside each percentage. Cent accounts arrive 100x too big and every
  // % is measured against lifetime deposits, so both conversions live in
  // lib/eaMoney — the same helpers the showcase card and LINE caption use.
  const base = stats ? capitalBase(stats) : null
  const totalMoney = stats && typeof stats.profitTotal === "number"
    ? toRealMoney(stats.profitTotal, stats.currency)
    : null
  const bestMoney = pctMoney(best, stats ?? {})
  const worstMoney = pctMoney(worst, stats ?? {})
  const money = (m: { amount: number; currency: string } | null) =>
    m ? fmtMoney(m.amount, m.currency) : null

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section style={{ background: accent.heroBg, padding: "56px 20px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <span
            className="font-lao"
            style={{
              display: "inline-block", background: accent.pillBg, border: `1px solid ${accent.pillBorder}`,
              color: accent.pillText, borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 700,
              letterSpacing: ".06em", marginBottom: 16,
            }}
          >
            {badge}
          </span>

          {/* globals.css forces `h1..h6 { color: var(--fg) !important }`, which beats
              an inline style. The rest of the site works around it by colouring an
              inner span instead — same trick here. */}
          <h1 className="font-lao" style={{ fontSize: 32, lineHeight: 1.4, fontWeight: 800, margin: "0 0 12px" }}>
            <span style={{ color: "#fff" }}>{headline}</span>
          </h1>

          <p className="font-lao" style={{ fontSize: 15, lineHeight: 1.9, color: "#A9B4D0", margin: "0 0 28px", maxWidth: 620 }}>
            {blurb}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            {[
              { label: "ກຳໄລລວມ", value: totalPct != null ? pct(totalPct) : "—", sub: money(totalMoney), color: "#4ADE80" },
              { label: "ເດືອນທີ່ບວກ", value: months.length ? `${positive}/${months.length}` : "—", sub: null, color: "#60A5FA" },
              { label: "ເດືອນດີສຸດ", value: best != null ? pct(best) : "—", sub: money(bestMoney), color: "#4ADE80" },
              { label: "ເດືອນຕ່ຳສຸດ", value: worst != null ? pct(worst) : "—", sub: money(worstMoney), color: worst != null && worst < 0 ? "#F87171" : "#4ADE80" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "14px 16px" }}>
                <p className="font-lao" style={{ fontSize: 11, color: "#8B95B5", margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontSize: 21, fontWeight: 800, color: s.color, margin: 0, fontFamily: "Arial,sans-serif" }}>{s.value}</p>
                {s.sub && (
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#8B95B5", margin: "4px 0 0", fontFamily: "Arial,sans-serif" }}>{s.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Name the capital base: every % is profit / lifetime deposits, so
              without this the money figures read as a rate of return. */}
          {base && (
            <p className="font-lao" style={{ fontSize: 11, color: "#8B95B5", marginTop: 14, lineHeight: 1.7 }}>
              ℹ️ % ແລະ ຈຳນວນເງິນ ຄິດທຽບກັບທຶນເລີ່ມຕົ້ນ {fmtMoneyPlain(base.amount, base.currency, 0)}
            </p>
          )}

          {stats?.broker && (
            <p className="font-lao" style={{ fontSize: 11, color: "#6B7699", marginTop: 8 }}>
              ບັນຊີຈິງທີ່ {stats.broker}
              {stats.lastUpdate ? ` · ອັບເດດ ${stats.lastUpdate.slice(0, 10)}` : ""}
            </p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 20px 56px" }}>
        {/* ── monthly performance ──────────────────────────────────────── */}
        {months.length > 0 && (
          <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", margin: "0 0 4px" }}>ຜົນງານແຕ່ລະເດືອນ</h2>
            <p className="font-lao" style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 0 20px" }}>
              ຕົວເລກດຶງມາຈາກບັນຊີຈິງໂດຍກົງ ອັບເດດອັດຕະໂນມັດ
            </p>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 170 }}>
              {months.map((m) => {
                const mMoney = pctMoney(m.profitPct, stats ?? {})
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "var(--success-ink)", fontFamily: "Arial,sans-serif" }}>
                      {m.profitPct.toFixed(0)}%
                    </span>
                    {mMoney && (
                      <span style={{ fontSize: 8, fontWeight: 600, color: "var(--fg-4)", fontFamily: "Arial,sans-serif", whiteSpace: "nowrap" }}>
                        {fmtMoney(mMoney.amount, mMoney.currency, 0)}
                      </span>
                    )}
                    <div
                      title={`${m.month}: ${pct(m.profitPct)}${mMoney ? ` (${fmtMoney(mMoney.amount, mMoney.currency)})` : ""}`}
                      style={{
                        width: "100%",
                        height: `${Math.max(4, (Math.abs(m.profitPct) / peak) * 110)}px`,
                        background: m.profitPct >= 0 ? "linear-gradient(180deg,#4ADE80,#16A34A)" : "linear-gradient(180deg,#F87171,#DC2626)",
                        borderRadius: 5,
                      }}
                    />
                    <span className="font-lao" style={{ fontSize: 8, color: "var(--fg-4)", whiteSpace: "nowrap" }}>{monthLabel(m.month)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── conditions: a LINE conversation, not a checklist ────────── */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", margin: "0 0 4px" }}>ເງື່ອນໄຂການໃຊ້ງານ</h2>
          <p className="font-lao" style={{ fontSize: 12.5, lineHeight: 1.85, color: "var(--fg-3)", margin: "0 0 18px" }}>
            ຕິດຕໍ່ສອບຖາມເງື່ອນໄຂການໃຊ້ EA ໄດ້ທາງ LINE — ພວກເຮົາຕອບທຸກຂໍ້ຄວາມ
          </p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-lao"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 22px",
              borderRadius: 12, background: "#06C755", color: "#fff", textDecoration: "none",
              fontSize: 13.5, fontWeight: 700,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/email/line.png" alt="" width={20} height={20} style={{ display: "block" }} />
            ຕິດຕໍ່ທາງ LINE
          </a>
        </section>

        {/* ── download ─────────────────────────────────────────────────── */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", margin: "0 0 16px" }}>ໄຟລ໌ດາວໂຫຼດ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {files.map((f) => (
              <a
                key={f.label}
                href={f.ready ? f.href : LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12,
                  border: "1px solid var(--line)", background: "var(--surface-2)", textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 20 }}>{f.ready ? "⬇" : "💬"}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--fg)", fontFamily: "Arial,sans-serif" }}>{f.label}</span>
                  <span className="font-lao" style={{ display: "block", fontSize: 11.5, color: "var(--fg-3)", marginTop: 2 }}>
                    {f.ready ? f.note : `${f.note} — ຂໍຮັບທາງ LINE`}
                  </span>
                </span>
                <span className="font-lao" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{f.ready ? "ດາວໂຫຼດ" : "ຂໍຮັບ"} →</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── channels ─────────────────────────────────────────────────── */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", margin: "0 0 16px" }}>ຕິດຕາມພວກເຮົາ</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {CHANNELS.map((c) => (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", borderRadius: 12,
                  border: "1px solid var(--line)", background: "var(--surface-2)", textDecoration: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.icon} alt="" width={20} height={20} style={{ display: "block" }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-2)", fontFamily: "Arial,sans-serif" }}>{c.name}</span>
              </a>
            ))}
          </div>
        </section>

        <p className="font-lao" style={{ fontSize: 11.5, lineHeight: 1.9, color: "var(--fg-4)", textAlign: "center", margin: 0 }}>
          ⚠ ຜົນງານທີ່ຜ່ານມາບໍ່ໄດ້ຮັບປະກັນຜົນໃນອະນາຄົດ · ການ Trade ມີຄວາມສ່ຽງ ອາດເສຍທຶນທັງໝົດ
          <br />
          ໃຊ້ເງິນທີ່ທ່ານຮັບຄວາມສ່ຽງໄດ້ເທົ່ານັ້ນ · <Link href="/ea-system" style={{ color: "var(--fg-3)" }}>ເບິ່ງ EA ທັງໝົດ</Link>
        </p>
      </div>
    </div>
  )
}
