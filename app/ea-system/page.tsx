import Link from "next/link"
import TrackedLink from "@/components/analytics/TrackedLink"
import { Rocket, Zap } from "lucide-react"
import EAShowcaseSection from "@/components/sections/EAShowcaseSection"
import type { Metadata } from "next"

export const revalidate = 60

export const metadata: Metadata = {
  title: "EA System — ລະບົບ EA ອັດຕະໂນມັດ",
  description: "ລະບົບ Expert Advisor (EA) ສຳລັບການເທຣດ Forex ອັດຕະໂນມັດ ພ້ອມສະຖິຕິການເຮັດກຳໄລ Real-time ສຳລັບ Trader ລາວ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system" },
  openGraph: {
    title: "EA System — ລະບົບ EA ອັດຕະໂນມັດ | LaoForexTrader",
    description: "ລະບົບ EA ສຳລັບເທຣດ Forex ອັດຕະໂນມັດ ພ້ອມສະຖິຕິ Real-time.",
    url: "https://www.laoforextrader.com/ea-system",
    type: "website",
  },
}

const LINE_URL = "https://line.me/R/ti/p/@499dvtuz"
const INTERSTELLAR_URL = "https://my.fisg.com/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs"

export default function EASystemPage() {
  return (
    <>
      {/* ── HERO (compact intro) ───────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(180deg, #050816 0%, #0B1230 100%)",
        borderBottom: "1px solid #1E1B4B",
      }}>
        <div style={{
          maxWidth: 1060, margin: "0 auto",
          padding: "56px 24px 44px", textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(74,222,128,0.12)",
            border: "0.5px solid rgba(74,222,128,0.35)",
            borderRadius: 100, padding: "4px 12px",
            fontSize: 11, color: "#4ADE80", fontWeight: 600, marginBottom: 18,
          }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: 9999,
              background: "#4ADE80",
            }} />
            Live Account Running
          </div>

          <h1 style={{
            fontSize: 38, fontWeight: 800,
            letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12,
          }}>
            <span style={{ color: "#fff" }}>TheRocket</span>{" "}
            <span style={{
              background: "linear-gradient(135deg, #60A5FA, #A78BFA, #F472B6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>EA System</span>
          </h1>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.55)",
            fontFamily: "Noto Sans Lao, sans-serif",
            lineHeight: 1.7, maxWidth: 540, margin: "0 auto",
          }}>
            ລະບົບ Trade ອັດຕະໂນມັດ ຈາກ Live Account ຈິງ · ບໍ່ແມ່ນ Backtest<br />
            ກ໊ອບ Trade ໄດ້ທັນທີ · ຮັບ Merch ຟຣີ
          </p>

          <div style={{
            display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
            marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.4)",
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            <span>⚡ Live Account</span>
            <span>📈 Real Trading</span>
            <span>🤖 24/5 Auto</span>
          </div>
        </div>
      </section>

      {/* ── EA #0 — RocketMagi Semi ────────────────────────────────────
          Same two-column anatomy as the three EAs below, but the right-hand
          panel holds a node map instead of live stats: this one has no track
          record to quote yet, so it shows what it IS. ─────────────────────── */}
      <section style={{ background: "linear-gradient(180deg,#0B1230 0%,#050816 100%)", borderBottom: "1px solid #1E1B4B" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 24px" }}>
          <div className="semi-row">

            {/* text + CTA */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.32)",
                borderRadius: 100, padding: "5px 14px", marginBottom: 16,
                fontSize: 11, fontWeight: 700, color: "#4ADE80",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                <Zap size={13} strokeWidth={2.5} />
                TheRocket EA · Semi
              </div>

              <h2 style={{
                fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em",
                lineHeight: 1.12, marginBottom: 8, color: "#fff",
              }}>
                RocketMagi{" "}
                <span style={{
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE,#60A5FA)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>Semi</span>
              </h2>

              <p style={{
                fontSize: 16, fontWeight: 700, marginBottom: 10,
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontFamily: "Noto Sans Lao, sans-serif",
              }}>
                ທ່ານເລືອກຈັງຫວະ · ລະບົບເຮັດທີ່ເຫຼືອ
              </p>

              <p style={{
                fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.55)",
                fontFamily: "Noto Sans Lao, sans-serif", marginBottom: 24, maxWidth: 480,
              }}>
                EA ຕົວດຽວໃນຊຸດນີ້ທີ່ທ່ານເປັນຜູ້ເລືອກຈັງຫວະເອງ — ກົດ Buy ຫຼື Sell ຈາກມືຖື
                ແລ້ວລະບົບຈະແກ້ໄມ້ ແລະປິດ basket ໃຫ້ເມື່ອເປັນກຳໄລ
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 26 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Strategy</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#22D3EE", marginTop: 3 }}>Semi Grid</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Pair</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 3 }}>XAUUSD · M5</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Control</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#4ADE80", marginTop: 3 }}>Manual · Semi · Auto</div>
                </div>
              </div>

              <Link href="/ea-system/semi" style={{
                display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                background: "linear-gradient(135deg,#4ADE80,#22D3EE,#60A5FA)",
                color: "#04070F", padding: "14px 26px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, fontFamily: "Noto Sans Lao, sans-serif",
                boxShadow: "0 8px 28px rgba(34,211,238,0.22)",
              }}>
                <Rocket size={15} strokeWidth={2.5} />
                ເບິ່ງລາຍລະອຽດ →
              </Link>
            </div>

            {/* node map — the three things that make it different, wired together */}
            <div style={{
              background: "radial-gradient(110% 110% at 70% 0%, rgba(34,211,238,0.10) 0%, transparent 60%), rgba(255,255,255,0.03)",
              border: "1px solid rgba(34,211,238,0.22)", borderRadius: 8, padding: 20,
            }}>
              <svg viewBox="0 0 320 272" style={{ width: "100%", height: "auto", display: "block" }}
                   role="img" aria-label="ສາມໂໝດ · ຄວບຄຸມຈາກມືຖື · ມິເຕີສົດ">
                <defs>
                  <linearGradient id="nodeCore" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#4ADE80" />
                    <stop offset="0.6" stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>

                {/* wires first so the discs sit on top of them */}
                <g stroke="rgba(34,211,238,0.45)" strokeWidth="1.5" strokeDasharray="3 5">
                  <line x1="160" y1="136" x2="64" y2="62" />
                  <line x1="160" y1="136" x2="262" y2="74" />
                  <line x1="160" y1="136" x2="168" y2="226" />
                </g>

                {/* core */}
                <circle cx="160" cy="136" r="52" fill="rgba(34,211,238,0.10)" stroke="url(#nodeCore)" strokeWidth="2" />
                <text x="160" y="130" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">RocketMagi</text>
                <text x="160" y="150" textAnchor="middle" fill="#22D3EE" fontSize="15" fontWeight="800">Semi</text>

                {/* satellites */}
                <circle cx="64" cy="62" r="40" fill="rgba(74,222,128,0.10)" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" />
                <text x="64" y="58" textAnchor="middle" fill="#4ADE80" fontSize="16" fontWeight="800">3</text>
                <text x="64" y="76" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11"
                      fontFamily="Noto Sans Lao, sans-serif">ໂໝດ</text>

                <circle cx="262" cy="74" r="42" fill="rgba(96,165,250,0.10)" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
                <text x="262" y="70" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11"
                      fontFamily="Noto Sans Lao, sans-serif">ຄວບຄຸມຈາກ</text>
                <text x="262" y="88" textAnchor="middle" fill="#60A5FA" fontSize="13" fontWeight="800"
                      fontFamily="Noto Sans Lao, sans-serif">ມືຖື</text>

                <circle cx="168" cy="226" r="40" fill="rgba(34,211,238,0.10)" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
                <text x="168" y="222" textAnchor="middle" fill="#22D3EE" fontSize="13" fontWeight="800"
                      fontFamily="Noto Sans Lao, sans-serif">ມິເຕີ</text>
                <text x="168" y="240" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11"
                      fontFamily="Noto Sans Lao, sans-serif">ສົດ</text>
              </svg>

              <div style={{
                marginTop: 12, textAlign: "center", fontSize: 11.5,
                color: "rgba(255,255,255,0.45)", fontFamily: "Noto Sans Lao, sans-serif",
              }}>
                ທຸກຢ່າງເຊື່ອມເຖິງກັນ · ສັ່ງຈາກບ່ອນໃດກໍໄດ້
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EA #1 — SGride (Galaxy) ────────────────────────────────────── */}
      <EAShowcaseSection
        eaId="sgride"
        variant="galaxy"
        theme="blue"
        badgeLabel="TheRocket EA SGrid"
        titleText="TheRocketEA"
        subtitleAccent="ຈາກ Live Account ຈິງ"
        description={"ບໍ່ແມ່ນ Backtest · Trade ອັດຕະໂນມັດ 24/5\nGrid Trading · ໝັ້ນຄົງ · Long-term"}
        strategy="Grid"
        risk="Medium"
        riskColor="#FCD34D"
        fallbacks={{ totalPct: "+500%", monthPct: "+18.7%", dayPct: "+2.4%", months: 7 }}
        links={{ download: "/ea-system/sgrid-download" }}
      />

      {/* ── EA #2 — MegiHedge (spiral galaxy · mirrored layout) ────────── */}
      <EAShowcaseSection
        eaId="megihedge"
        variant="spiral"
        theme="purple"
        mirror
        badgeLabel="TheRocket EA MegiHedge v2.0"
        titleText="MegiHedge v2.0"
        subtitleAccent="ຍານ Hedge ກຳໄລໄວ"
        description={"Hedging Strategy · Aggressive\nShort-term · Active Growth"}
        strategy="Hedging"
        risk="Higher"
        riskColor="#F87171"
        fallbacks={{ totalPct: "+320%", monthPct: "+22.4%", dayPct: "+3.1%", months: 5 }}
        links={{ download: "/ea-system/megihedge-download" }}
      />

      {/* ── EA #3 — ABS v2.0 (Aurora) ──────────────────────────────────── */}
      <EAShowcaseSection
        eaId="abs"
        variant="aurora"
        theme="emerald"
        badgeLabel="TheRocket EA ABS v2.0"
        titleText="ABS v2.0"
        subtitleAccent="Advance Breakout System · Gold & EUR/JPY"
        description={"Trade ສະເພາະຈັງຫວະ Breakout ທີ່ດີທີ່ສຸດ · ມື້ລະ 1–2 ໄມ້\nຄວາມສ່ຽງຕ່ຳ 1.5–2% ຕໍ່ໄມ້ · ມີ Protect Stop ປ້ອງກັນທຶນ\nAuto Lot Scaling · ກ໊ອບໄດ້ທັນທີ ບໍ່ວ່າທຶນນ້ອຍ ຫຼື ໃຫຍ່"}
        strategy="Breakout"
        risk="Low"
        riskColor="#34D399"
        fallbacks={{ totalPct: "+180%", monthPct: "+9.4%", dayPct: "+1.2%", months: 12 }}
        links={{
          copyTrade: "https://account.markets4you.com/th/leaders#/10201186/overview",
          download: "https://drive.google.com/drive/folders/12PeUPE8SuH064-26IFbco1g1tIOyUwTf?usp=sharing",
          backtest: "/ea-system/abs-backtest",
        }}
      />

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--accent)", marginBottom: 5,
          }}>
            How it Works
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800, color: "var(--fg)",
            letterSpacing: "-0.025em", marginBottom: 24,
          }}>
            ເລີ່ມໃຊ້ໃນ <span style={{
              background: "linear-gradient(135deg, #2563EB, #4F46E5)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>3 ຂັ້ນຕອນ</span>
          </div>

          <div className="how-grid">
            {[
              { num: "1", title: "ເປີດບັນຊີ Broker",   sub: "ສະໝັກຜ່ານ Link LFT" },
              { num: "2", title: "ເຊື່ອມ EA System",   sub: "Connect TheRocket EA" },
              { num: "3", title: "Trade ອັດຕະໂນມັດ",   sub: "ບໍ່ຕ້ອງເຝົ້ານຳ" },
            ].map(s => (
              <div key={s.num} style={{
                background: "var(--surface-2)", border: "1px solid var(--line)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--accent-soft)", border: "1.5px solid var(--accent-line)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "var(--accent)", marginBottom: 12,
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 4,
                  fontFamily: "Noto Sans Lao, sans-serif",
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontSize: 12, color: "var(--fg-3)",
                  fontFamily: "Noto Sans Lao, sans-serif",
                }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: "var(--warn-soft)", border: "1px solid var(--warn-line)",
            borderRadius: 8, padding: "10px 16px", marginTop: 20,
            fontSize: 11, color: "var(--warn-ink)", lineHeight: 1.6,
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            ⚠ Risk Disclosure: ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ · ຜົນງານໃນອະດີດບໍ່ຮັບປະກັນຜົນໃນອະນາຄົດ
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #4F46E5 100%)",
        padding: "48px 24px",
      }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: 26, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em", marginBottom: 8,
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            ຢາກເລີ່ມໃຊ້ TheRocket EA?
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.78)", marginBottom: 22,
            fontFamily: "Noto Sans Lao, sans-serif",
          }}>
            ສະໝັກ Broker ຜ່ານ LFT · ຮັບ Merch ຟຣີ · ຕັ້ງຄ່າ EA ຟຣີ
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <TrackedLink
              href={INTERSTELLAR_URL}
              target="broker-interstellar"
              label="Interstellar Group"
              group="broker"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--surface)", color: "var(--accent-ink)", textDecoration: "none",
                padding: "13px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                fontFamily: "Noto Sans Lao, sans-serif",
                boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
              }}
            >
              <Rocket size={16} strokeWidth={2.6} />
              ເປີດບັນຊີ Interstellar (ຮັນ EA) →
            </TrackedLink>
            <TrackedLink
              href={LINE_URL}
              target="line-ea-system"
              label="LINE (ໜ້າ EA System)"
              group="contact"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#06C755", color: "#fff", textDecoration: "none",
                padding: "13px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                fontFamily: "Noto Sans Lao, sans-serif",
                boxShadow: "0 6px 20px rgba(6,199,85,0.35)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .628.285.628.63 0 .349-.282.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.629.629 0 0 1-.626.628.62.62 0 0 1-.51-.255l-2.443-3.317v2.943a.63.63 0 0 1-1.257 0V8.108a.628.628 0 0 1 .624-.629c.195 0 .375.105.51.254l2.444 3.318V8.108a.63.63 0 0 1 1.258 0v4.771zm-5.461 0a.627.627 0 0 1-.626.628.629.629 0 0 1-.63-.628V8.108a.63.63 0 0 1 1.256 0v4.771zm-2.736.628H4.917a.625.625 0 0 1-.625-.628V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.141h1.762c.346 0 .628.283.628.63 0 .344-.282.628-.628.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              Add Line Official
            </TrackedLink>
            <Link
              href="/broker"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none",
                padding: "13px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                fontFamily: "Noto Sans Lao, sans-serif",
                border: "1.5px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(6px)",
              }}
            >
              ເລືອກ Broker →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
