import type { Metadata } from "next"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import type { EAStats } from "@/types"

export const revalidate = 300

export const metadata: Metadata = {
  title: "ດາວໂຫຼດ TheRocket EA SGrid",
  description:
    "ດາວໂຫຼດ TheRocket EA SGrid — Grid EA ທີ່ Trade ຈິງມາ 12 ເດືອນ ບວກທຸກເດືອນ. ເບິ່ງຜົນຈາກບັນຊີຈິງ ແລະ ເງື່ອນໄຂການຮັບ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/sgrid-download" },
}

// ── everything worth editing lives here ───────────────────────────────────
const LINE_URL = "https://line.me/R/ti/p/@499dvtuz"

// The EA itself lives in a public Google Drive folder rather than in
// public/ — a 141 KB binary in the repo would ship to every Vercel build for
// no reason, and Drive lets the file be swapped without a deploy.
const DRIVE_URL = "https://drive.google.com/drive/folders/1jheipgGAAI6eIg9gOoD6DrsVSsH9mWeL"

// `ready: false` routes the row to LINE instead, which is what an item we
// cannot hand over automatically should do — never a dead link.
const FILES: { label: string; note: string; href: string; ready: boolean }[] = [
  {
    label: "TheRocketEASgride_V.0.9_REL.ex5",
    note: "ໄຟລ໌ EA ສຳລັບ MetaTrader 5 · 141 KB · Google Drive",
    href: DRIVE_URL,
    ready: true,
  },
]

const CHANNELS = [
  { name: "LINE", href: LINE_URL, icon: "/email/line.png" },
  { name: "YouTube", href: "https://www.youtube.com/@MeeMuangsong", icon: "/email/youtube.png" },
  { name: "TikTok", href: "https://www.tiktok.com/@meemuangsong", icon: "/email/tiktok.png" },
  { name: "Facebook", href: "https://www.facebook.com/groups/Laoforextrader", icon: "/email/facebook.png" },
]
// ──────────────────────────────────────────────────────────────────────────

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`

const LAO_MONTH = ["ມ.ກ.", "ກ.ພ.", "ມີ.ນ.", "ເມ.ສ.", "ພ.ພ.", "ມິ.ຖ.", "ກ.ລ.", "ສ.ຫ.", "ກ.ຍ.", "ຕ.ລ.", "ພ.ຈ.", "ທ.ວ."]

function monthLabel(m: string): string {
  const [y, mm] = m.split("-")
  return `${LAO_MONTH[Number(mm) - 1] ?? mm} ${y.slice(2)}`
}

export default async function SGridDownloadPage() {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(QUERIES.eaStatsByEaId("sgride"))
    if (!stats || stats.updateMode === "off") stats = null
  } catch {}

  const months = (stats?.monthlyReturns ?? []).filter((m) => typeof m.profitPct === "number")
  const values = months.map((m) => m.profitPct)
  const totalPct = stats?.profitTotalPct
  const positive = values.filter((v) => v > 0).length
  const best = values.length ? Math.max(...values) : null
  const worst = values.length ? Math.min(...values) : null
  const peak = values.length ? Math.max(...values.map((v) => Math.abs(v))) : 1

  return (
    <div style={{ background: "#EDEEF2" }}>
      {/* ── hero ───────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(160deg,#0B1020 0%,#141B36 60%,#1B2450 100%)", padding: "56px 20px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <span
            className="font-lao"
            style={{
              display: "inline-block", background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.35)",
              color: "#93C5FD", borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 700,
              letterSpacing: ".06em", marginBottom: 16,
            }}
          >
            🚀 TheRocket EA SGrid
          </span>

          {/* globals.css forces `h1..h6 { color: #111827 !important }`, which beats
              an inline style. The rest of the site works around it by colouring an
              inner span instead — same trick here. */}
          <h1 className="font-lao" style={{ fontSize: 32, lineHeight: 1.4, fontWeight: 800, margin: "0 0 12px" }}>
            <span style={{ color: "#fff" }}>ດາວໂຫຼດ EA</span>
          </h1>

          <p className="font-lao" style={{ fontSize: 15, lineHeight: 1.9, color: "#A9B4D0", margin: "0 0 28px", maxWidth: 620 }}>
            Grid EA ທີ່ພວກເຮົາຮັນຢູ່ໃນບັນຊີຈິງ ບໍ່ແມ່ນ Backtest.
            ດຽວນີ້ພວກເຮົາເປີດໃຫ້ທຸກຄົນເອົາໄປທົດສອບ ແລະ ໃຊ້ຈິງແລ້ວ ຕາມເງື່ອນໄຂຂ້າງລຸ່ມ.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            {[
              { label: "ກຳໄລລວມ", value: totalPct != null ? pct(totalPct) : "—", color: "#4ADE80" },
              { label: "ເດືອນທີ່ບວກ", value: months.length ? `${positive}/${months.length}` : "—", color: "#60A5FA" },
              { label: "ເດືອນດີສຸດ", value: best != null ? pct(best) : "—", color: "#4ADE80" },
              { label: "ເດືອນຕ່ຳສຸດ", value: worst != null ? pct(worst) : "—", color: worst != null && worst < 0 ? "#F87171" : "#4ADE80" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "14px 16px" }}>
                <p className="font-lao" style={{ fontSize: 11, color: "#8B95B5", margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontSize: 21, fontWeight: 800, color: s.color, margin: 0, fontFamily: "Arial,sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {stats?.broker && (
            <p className="font-lao" style={{ fontSize: 11, color: "#6B7699", marginTop: 14 }}>
              ບັນຊີຈິງທີ່ {stats.broker}
              {stats.lastUpdate ? ` · ອັບເດດ ${stats.lastUpdate.slice(0, 10)}` : ""}
            </p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 20px 56px" }}>
        {/* ── monthly performance ──────────────────────────────────────── */}
        {months.length > 0 && (
          <section style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>ຜົນງານແຕ່ລະເດືອນ</h2>
            <p className="font-lao" style={{ fontSize: 12, color: "#6B7280", margin: "0 0 20px" }}>
              ຕົວເລກດຶງມາຈາກບັນຊີຈິງໂດຍກົງ ອັບເດດອັດຕະໂນມັດ
            </p>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 150 }}>
              {months.map((m) => (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#15803D", fontFamily: "Arial,sans-serif" }}>
                    {m.profitPct.toFixed(0)}%
                  </span>
                  <div
                    title={`${m.month}: ${pct(m.profitPct)}`}
                    style={{
                      width: "100%",
                      height: `${Math.max(4, (Math.abs(m.profitPct) / peak) * 110)}px`,
                      background: m.profitPct >= 0 ? "linear-gradient(180deg,#4ADE80,#16A34A)" : "linear-gradient(180deg,#F87171,#DC2626)",
                      borderRadius: 5,
                    }}
                  />
                  <span className="font-lao" style={{ fontSize: 8, color: "#9CA3AF", whiteSpace: "nowrap" }}>{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── conditions: a LINE conversation, not a checklist ────────── */}
        <section style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>ເງື່ອນໄຂການໃຊ້ງານ</h2>
          <p className="font-lao" style={{ fontSize: 12.5, lineHeight: 1.85, color: "#6B7280", margin: "0 0 18px" }}>
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
        <section style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>ໄຟລ໌ດາວໂຫຼດ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FILES.map((f) => (
              <a
                key={f.label}
                href={f.ready ? f.href : LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12,
                  border: "1px solid #E2E6F0", background: "#F9FAFB", textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 20 }}>{f.ready ? "⬇" : "💬"}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#111827", fontFamily: "Arial,sans-serif" }}>{f.label}</span>
                  <span className="font-lao" style={{ display: "block", fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
                    {f.ready ? f.note : `${f.note} — ຂໍຮັບທາງ LINE`}
                  </span>
                </span>
                <span className="font-lao" style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{f.ready ? "ດາວໂຫຼດ" : "ຂໍຮັບ"} →</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── channels ─────────────────────────────────────────────────── */}
        <section style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>ຕິດຕາມພວກເຮົາ</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {CHANNELS.map((c) => (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", borderRadius: 12,
                  border: "1px solid #E2E6F0", background: "#F9FAFB", textDecoration: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.icon} alt="" width={20} height={20} style={{ display: "block" }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", fontFamily: "Arial,sans-serif" }}>{c.name}</span>
              </a>
            ))}
          </div>
        </section>

        <p className="font-lao" style={{ fontSize: 11.5, lineHeight: 1.9, color: "#9CA3AF", textAlign: "center", margin: 0 }}>
          ⚠ ຜົນງານທີ່ຜ່ານມາບໍ່ໄດ້ຮັບປະກັນຜົນໃນອະນາຄົດ · ການ Trade ມີຄວາມສ່ຽງ ອາດເສຍທຶນທັງໝົດ
          <br />
          ໃຊ້ເງິນທີ່ທ່ານຮັບຄວາມສ່ຽງໄດ້ເທົ່ານັ້ນ · <Link href="/ea-system" style={{ color: "#6B7280" }}>ເບິ່ງ EA ທັງໝົດ</Link>
        </p>
      </div>
    </div>
  )
}
