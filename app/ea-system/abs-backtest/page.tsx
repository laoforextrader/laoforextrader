import Link from "next/link"
import { TrendingUp, Download, ShieldCheck, Activity, Layers, Clock, Target, BarChart3, Rocket, Copy } from "lucide-react"
import type { Metadata } from "next"
import BacktestGallery from "@/components/ea/BacktestGallery"
import TrackedLink from "@/components/analytics/TrackedLink"

export const revalidate = 3600

const COPY_URL = "https://account.markets4you.com/th/leaders#/10201186/overview"
const DOWNLOAD_URL = "https://drive.google.com/drive/folders/12PeUPE8SuH064-26IFbco1g1tIOyUwTf?usp=sharing"
const LINE_URL = "https://line.me/R/ti/p/@499dvtuz"
// เปิดบัญชี Interstellar เพื่อรัน EA เอง (ใช้คู่กับ Download EA + setfile)
const INTERSTELLAR_URL = "https://my.fisg.com/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs"
// เปิดบัญชี Markets4you เพื่อ copytrade (ตามเทรดเดอร์ผู้นำ)
const MARKETS4YOU_REGISTER_URL = "https://www.markets4you.online/?affid=xpkpced"

export const metadata: Metadata = {
  title: "ABS v2.0 EA — Backtest Report | TheRocket EA",
  description:
    "ຜົນ Backtest ຂອງ ABS v2.0 (Advance Breakout System) — ລະບົບ Breakout ອັດຕະໂນມັດສຳລັບ Gold ແລະ EUR/JPY. ຄວາມສ່ຽງຕ່ຳ 1.5–2% ຕໍ່ໄມ້ ພ້ອມ Protect Stop.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/abs-backtest" },
  openGraph: {
    title: "ABS v2.0 EA — Backtest Report",
    description: "Advance Breakout System · Gold & EUR/JPY · ຄວາມສ່ຽງຕ່ຳ · ມີ Protect Stop",
    url: "https://www.laoforextrader.com/ea-system/abs-backtest",
    type: "website",
  },
}

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "ຄວາມສ່ຽງຕ່ຳ ມີວິໄນ",
    body: "ຄວາມສ່ຽງພຽງ 1.5–2% ຕໍ່ໄມ້ ພ້ອມ Protect Stop ປ້ອງກັນທຶນ ຫຼຸດການຂາດທຶນຮ້າຍແຮງ",
  },
  {
    icon: Target,
    title: "ເທຣດໜ້ອຍ ແຕ່ມີຄຸນນະພາບ",
    body: "ບໍ່ໄລ່ເຂົ້າທຸກໄມ້ — ເລືອກສະເພາະຈັງຫວະ Breakout ທີ່ດີທີ່ສຸດ ມື້ໜຶ່ງພຽງ 1–2 ໄມ້",
  },
  {
    icon: Layers,
    title: "Auto Lot Scaling",
    body: "ປັບລັອດໃຫ້ເໝາະກັບຂະໜາດບັນຊີໂດຍອັດຕະໂນມັດ ບໍ່ວ່າທຶນນ້ອຍ ຫຼື ໃຫຍ່ ກໍກ໊ອບໄດ້ທັນທີ",
  },
  {
    icon: Clock,
    title: "ເຮັດວຽກ 24/5 ບໍ່ຕ້ອງເຝົ້າ",
    body: "ຕັ້ງຄັ້ງດຽວ ປ່ອຍໃຫ້ລະບົບເທຣດໃຫ້ — ບໍ່ມີອາລົມ ບໍ່ມີຄວາມໂລບ",
  },
]

const SPECS = [
  { label: "ກົນລະຍຸດ", value: "Breakout" },
  { label: "ຄູ່ເງິນ", value: "XAUUSD · EURJPY" },
  { label: "ຄວາມສ່ຽງ/ໄມ້", value: "1.5–2%" },
  { label: "ຈຳນວນໄມ້/ມື້", value: "1–2 ໄມ້" },
  { label: "Lot", value: "Auto Scaling" },
  { label: "ການເຮັດວຽກ", value: "24/5 Auto" },
]

const CHARTS = [
  {
    src: "/EA_backtest/ABS_v2.0_Gold_Backtest.gif",
    pair: "XAUUSD",
    title: "Gold (XAUUSD)",
    sub: "ຜົນ Backtest ຕະຫຼາດທອງຄຳ",
  },
  {
    src: "/EA_backtest/ABS_v2.0_EURJPY_Backtest.gif",
    pair: "EURJPY",
    title: "EUR / JPY",
    sub: "ຜົນ Backtest ຄູ່ເງິນ EUR/JPY",
  },
]

export default function ABSBacktestPage() {
  return (
    <div style={{ background: "#040D0A" }}>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #021410 0%, #04241B 50%, #06342A 100%)",
        borderBottom: "1px solid #0B3A2C",
      }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 24px 40px", textAlign: "center" }}>
          <Link
            href="/ea-system"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "rgba(255,255,255,0.45)", textDecoration: "none",
              marginBottom: 18, fontFamily: "Noto Sans Lao, sans-serif",
            }}
          >
            ← ກັບໄປ EA System
          </Link>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(52,211,153,0.12)", border: "0.5px solid rgba(52,211,153,0.38)",
            borderRadius: 100, padding: "4px 12px",
            fontSize: 11, color: "#6EE7B7", fontWeight: 700, marginBottom: 16,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            <BarChart3 size={13} strokeWidth={2.5} style={{ color: "#FBBF24" }} />
            Backtest Report
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.08, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>ABS </span>
            <span style={{
              background: "linear-gradient(135deg, #34D399, #FBBF24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>v2.0</span>
          </h1>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.6)",
            fontFamily: "Noto Sans Lao, sans-serif", lineHeight: 1.7,
            maxWidth: 560, margin: "0 auto 6px",
          }}>
            Advance Breakout System — ອີເອອັດຕະໂນມັດເຕັມຮູບແບບ ທີ່ເທຣດສະເພາະ Gold ແລະ EUR/JPY
            ສອງຕະຫຼາດທີ່ໄດ້ຮັບການພິສູດແລ້ວວ່າມີກຳໄລໝັ້ນຄົງທຸກໆປີ
          </p>

          <div style={{
            display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
            marginTop: 22, fontSize: 11, color: "rgba(255,255,255,0.4)",
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            <span>📊 Strategy Tester</span>
            <span>🥇 Gold + EUR/JPY</span>
            <span>🛡 Protect Stop</span>
          </div>
        </div>
      </section>

      {/* ── SPEC STRIP ───────────────────────────────────────────────── */}
      <section style={{ background: "#06231A", borderBottom: "1px solid #0B3A2C" }}>
        <div style={{
          maxWidth: 1060, margin: "0 auto", padding: "20px 24px",
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12,
        }} className="abs-spec-grid">
          {SPECS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "#fff",
                fontFamily: "JetBrains Mono, monospace", lineHeight: 1.2, marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Noto Sans Lao, sans-serif" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BACKTEST CHARTS ──────────────────────────────────────────── */}
      <section style={{ background: "#040D0A" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "44px 24px" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#34D399", marginBottom: 5, textAlign: "center",
          }}>
            Equity Curve
          </div>
          <h2 style={{
            fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em",
            marginBottom: 6, textAlign: "center", fontFamily: "Noto Sans Lao, sans-serif",
            background: "linear-gradient(135deg, #34D399, #FBBF24)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            ຜົນ Backtest
          </h2>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center",
            marginBottom: 28, fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            ກຣາຟການເຕີບໂຕຂອງບັນຊີ ຈາກ MetaTrader 5 Strategy Tester
          </p>

          <BacktestGallery charts={CHARTS} />

          <p style={{
            fontSize: 11, color: "rgba(255,255,255,0.38)", textAlign: "center",
            marginTop: 16, fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            * ຜົນ Backtest ມາຈາກຂໍ້ມູນຍ້ອນຫຼັງ — ບໍ່ຮັບປະກັນຜົນຕອບແທນໃນອະນາຄົດ
          </p>
        </div>
      </section>

      {/* ── HIGHLIGHTS ───────────────────────────────────────────────── */}
      <section style={{ background: "#06231A", borderTop: "1px solid #0B3A2C" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "44px 24px" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#34D399", marginBottom: 5,
          }}>
            ເປັນຫຍັງຕ້ອງ ABS v2.0
          </div>
          <h2 style={{
            fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em",
            marginBottom: 24, fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            <span style={{ color: "#FBBF24" }}>ຢຸດເຝົ້າຈໍ —</span> <span style={{
              background: "linear-gradient(135deg, #34D399, #FBBF24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>ໃຫ້ລະບົບເຮັດວຽກແທນທ່ານ</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="abs-chart-grid">
            {HIGHLIGHTS.map(h => {
              const HIcon = h.icon
              return (
                <div key={h.title} style={{
                  display: "flex", gap: 14,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: 20,
                }}>
                  <div style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 10,
                    background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <HIcon size={20} strokeWidth={2.2} style={{ color: "#34D399" }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5,
                      fontFamily: "Noto Sans Lao, sans-serif",
                    }}>
                      {h.title}
                    </div>
                    <div style={{
                      fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65,
                      fontFamily: "Noto Sans Lao, sans-serif",
                    }}>
                      {h.body}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA — ສອງທາງເລືອກ: ຮັນ EA ເອງ / Copy Trade ─────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #047857 0%, #059669 50%, #0D9488 100%)",
        padding: "48px 24px",
      }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em",
            marginBottom: 8, fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            ເລີ່ມໃຊ້ ABS v2.0 ມື້ນີ້ 🚀
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.82)", marginBottom: 26,
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            ເລືອກໄດ້ 2 ທາງ — ຮັນ EA ດ້ວຍຕົນເອງ ຫຼື ໃຫ້ລະບົບ Copy Trade ໃຫ້
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left" }} className="abs-chart-grid">
            {/* Path 1 — ຮັນ EA ເອງ ຜ່ານ Interstellar */}
            <div style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 16, padding: 24, backdropFilter: "blur(6px)",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8,
                fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em",
              }}>
                <Rocket size={15} strokeWidth={2.5} /> ທາງເລືອກ 1
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4, fontFamily: "Noto Sans Lao, sans-serif" }}>
                ຮັນ EA ດ້ວຍຕົນເອງ
              </div>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 16, fontFamily: "Noto Sans Lao, sans-serif" }}>
                ເປີດບັນຊີ Interstellar → ດາວໂຫຼດ EA → ຕັ້ງຄ່າ setfile → ຮັນເທິງ MT5 ຂອງທ່ານເອງ
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                <TrackedLink
                  href={INTERSTELLAR_URL} target="broker-interstellar"
                  label="Interstellar Group" group="broker"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#fff", color: "#047857", textDecoration: "none",
                    padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                    fontFamily: "Noto Sans Lao, sans-serif", boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                  }}
                >
                  <Rocket size={16} strokeWidth={2.6} />
                  ເປີດບັນຊີ Interstellar →
                </TrackedLink>
                <TrackedLink
                  href={DOWNLOAD_URL} target="ea-abs-download"
                  label="ດາວໂຫຼດ EA ABS" group="ea"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "rgba(255,255,255,0.14)", color: "#fff", textDecoration: "none",
                    padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    border: "1.5px solid rgba(255,255,255,0.4)", fontFamily: "Noto Sans Lao, sans-serif",
                  }}
                >
                  <Download size={16} strokeWidth={2.6} />
                  ດາວໂຫຼດ EA
                </TrackedLink>
              </div>
            </div>

            {/* Path 2 — Copy Trade ຜ່ານ Markets4you */}
            <div style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 16, padding: 24, backdropFilter: "blur(6px)",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8,
                fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em",
              }}>
                <Copy size={15} strokeWidth={2.5} /> ທາງເລືອກ 2
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4, fontFamily: "Noto Sans Lao, sans-serif" }}>
                Copy Trade ອັດຕະໂນມັດ
              </div>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 16, fontFamily: "Noto Sans Lao, sans-serif" }}>
                ເປີດບັນຊີ Markets4you → ກົດ Copy → ລະບົບກ໊ອບການເທຣດໃຫ້ອັດຕະໂນມັດ ບໍ່ຕ້ອງຕິດຕັ້ງ EA
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                <TrackedLink
                  href={COPY_URL} target="ea-abs-copytrade"
                  label="Copy Trade ABS" group="ea"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#FBBF24", color: "#1F2937", textDecoration: "none",
                    padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 800,
                    fontFamily: "Noto Sans Lao, sans-serif", boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                  }}
                >
                  <TrendingUp size={16} strokeWidth={2.6} />
                  ເລີ່ມ Copy Trade →
                </TrackedLink>
                <TrackedLink
                  href={MARKETS4YOU_REGISTER_URL} target="broker-markets4you"
                  label="Markets4you" group="broker"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "rgba(255,255,255,0.14)", color: "#fff", textDecoration: "none",
                    padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    border: "1.5px solid rgba(255,255,255,0.4)", fontFamily: "Noto Sans Lao, sans-serif",
                  }}
                >
                  ເປີດບັນຊີ Markets4you →
                </TrackedLink>
              </div>
            </div>
          </div>

          {/* ຊ່ວຍເຫຼືອ / ສອບຖາມ ຜ່ານ LINE */}
          <TrackedLink
            href={LINE_URL} target="line-abs-backtest"
            label="LINE (ໜ້າ ABS Backtest)" group="contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginTop: 22,
              background: "#06C755", color: "#fff", textDecoration: "none",
              padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              fontFamily: "Noto Sans Lao, sans-serif", boxShadow: "0 6px 20px rgba(6,199,85,0.35)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .628.285.628.63 0 .349-.282.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.629.629 0 0 1-.626.628.62.62 0 0 1-.51-.255l-2.443-3.317v2.943a.63.63 0 0 1-1.257 0V8.108a.628.628 0 0 1 .624-.629c.195 0 .375.105.51.254l2.444 3.318V8.108a.63.63 0 0 1 1.258 0v4.771zm-5.461 0a.627.627 0 0 1-.626.628.629.629 0 0 1-.63-.628V8.108a.63.63 0 0 1 1.256 0v4.771zm-2.736.628H4.917a.625.625 0 0 1-.625-.628V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.141h1.762c.346 0 .628.283.628.63 0 .344-.282.628-.628.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            ສອບຖາມ / ຂໍຄວາມຊ່ວຍເຫຼືອ ຜ່ານ LINE
          </TrackedLink>
        </div>
      </section>

      {/* ── RISK DISCLOSURE ──────────────────────────────────────────── */}
      <section style={{ background: "#040D0A" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "24px" }}>
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 10, padding: "12px 16px",
          }}>
            <Activity size={16} strokeWidth={2.2} style={{ color: "#FBBF24", flexShrink: 0, marginTop: 2 }} />
            <p style={{
              margin: 0, fontSize: 11.5, color: "rgba(251,191,36,0.85)", lineHeight: 1.7,
              fontFamily: "Noto Sans Lao, sans-serif",
            }}>
              ⚠ ການເທຣດ Forex ມີຄວາມສ່ຽງ — ຄວນລົງທຶນຕາມຄວາມເໝາະສົມ.
              ຜົນ Backtest ແລະ ຜົນງານຜ່ານມາ ບໍ່ຮັບປະກັນຜົນຕອບແທນໃນອະນາຄົດ.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .abs-chart-grid { grid-template-columns: 1fr !important; }
          .abs-spec-grid { grid-template-columns: repeat(3, 1fr) !important; row-gap: 16px !important; }
        }
      `}</style>
    </div>
  )
}
