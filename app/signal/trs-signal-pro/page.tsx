import type { Metadata } from "next"
import Link from "next/link"
import {
  Rocket, Zap, Target, Languages, Coins,
  Check, X as XIcon, MessageCircle, ArrowRight,
  LineChart, Brain, Compass, TrendingUp,
} from "lucide-react"
import { TradingGlobeCanvas } from "@/components/ui/TradingGlobeCanvas"
import { CandlestickChartBg } from "@/components/ui/CandlestickChartBg"
import styles from "./signal.module.css"

export const revalidate = 60

const FREE_CHANNEL = process.env.NEXT_PUBLIC_TRS_FREE_CHANNEL || "https://t.me/TheRocketSig"
const ADMIN_CONTACT = process.env.NEXT_PUBLIC_TRS_ADMIN || "https://t.me/YourMoney_Admin"
const SIGNAL_APP_URL = process.env.NEXT_PUBLIC_TRS_APP_URL

export const metadata: Metadata = {
  title: "TheRocket Signal Pro — ສັນຍານ GOLD & Forex ສຳລັບຄົນລາວ",
  description:
    "ສັນຍານ Real-time XAUUSD ແລະ Forex pair ຍອດນິຍົມ ສົ່ງເຂົ້າ Telegram ທັນທີ ມີ Entry / TP / SL ຄົບ ວິເຄາະດ້ວຍ Indicator + SMC ພາສາລາວ 100%",
  openGraph: {
    title: "TheRocket Signal Pro",
    description:
      "ສັນຍານ Real-time ສຳລັບເທຣດ GOLD (XAUUSD) & Forex ສົ່ງເຂົ້າ Telegram ມີເຫດຜົນຄົບ ໃຊ້ Indicator + SMC ພາສາລາວ",
    images: [{ url: "/og/_default.png", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://www.laoforextrader.com/signal/trs-signal-pro" },
}

const FEATURES = [
  { icon: Zap,       title: "ສັນຍານ Real-time",  desc: "ສົ່ງເຂົ້າ Telegram ທັນທີທີ່ signal ເກີດ ບໍ່ delay" },
  { icon: Brain,     title: "Indicator + SMC",   desc: "ວິເຄາະດ້ວຍ EMA, RSI, MACD ປະສົມ Smart Money Concept" },
  { icon: Target,    title: "Entry / TP / SL",   desc: "ບອກລາຄາທີ່ຄວນເຂົ້າ ແລະ ປິດ ຊັດເຈນ ບໍ່ຕ້ອງເດົາ" },
  { icon: LineChart, title: "ເບິ່ງຄູ່ TradingView", desc: "ສຶກສາກຣາຟໄປພ້ອມໆກັນ ຮຽນຮູ້ກົງລະບົບເທຣດເດີຈິງ" },
  { icon: Coins,     title: "GOLD & Forex",      desc: "XAUUSD, EURUSD, GBPUSD, USDJPY ແລະອື່ນໆ" },
  { icon: Languages, title: "ພາສາລາວ 100%",       desc: "ບໍ່ຕ້ອງຕີຄວາມພາສາອັງກິດ ເຂົ້າໃຈງ່າຍ" },
] as const

const PROCESS = [
  { step: "1", title: "TradingView ສະແກນ", desc: "Indicator TRS Signal Pro ຕິດຕາມ 6+ pair ຕະຫຼອດ 24/5" },
  { step: "2", title: "Server ກວດເງື່ອນໄຂ", desc: "ກວດ EMA + RSI + MACD + ADX + SMC ກ່ອນປ່ອຍສັນຍານ" },
  { step: "3", title: "ສົ່ງເຂົ້າ Telegram", desc: "ໄດ້ຮັບໃນ < 5 ວິນາທີ ພ້ອມ Entry / TP / SL" },
] as const

const WHY_POINTS = [
  {
    icon: MessageCircle,
    title: "ຮັບ Signal Realtime ຜ່ານ Telegram",
    desc: "TRS Pro ສົ່ງສັນຍານເຂົ້າ Telegram ໃຫ້ທ່ານໂດຍກົງ ບໍ່ຕ້ອງເຝົ້າຫນ້າຈໍ ບໍ່ຕ້ອງລົງ app ໃໝ່",
  },
  {
    icon: LineChart,
    title: "ສຶກສາກຣາຟ ຜ່ານ TradingView ໄປພ້ອມໆກັນ",
    desc: "ເຫັນທຸກສັນຍານໃນກຣາຟ TradingView ໂດຍກົງ ຮຽນຮູ້ໄປດ້ວຍວ່າເຫດໃດເຂົ້າ trade",
  },
  {
    icon: Brain,
    title: "ວິເຄາະດ້ວຍ Indicator + SMC",
    desc: "ໃຊ້ Indicator (EMA, RSI, MACD, ADX) ປະສົມ Smart Money Concept ເພື່ອໃຫ້ມີຄວາມແມັ້ນຢຳ",
  },
  {
    icon: Compass,
    title: "ເທຣດຕາມແຜນ ບໍ່ຫຼົງທາງ",
    desc: "ມືໃໝ່ໄດ້ຝຶກລະບຽບວິໄນ ເທຣດຕາມສັນຍານ ບໍ່ເທຣດຕາມອາລົມ",
  },
] as const

export default function TRSSignalProPage() {
  return (
    <div style={{ background: "#EDEEF2" }}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={`${styles.heroInner} max-w-[1060px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center`}>
          <div>
            <div className={styles.eyebrowDark} style={{ marginBottom: 18 }}>
              <Rocket size={13} strokeWidth={2.5} style={{ color: "#FCD34D" }} />
              TheRocket Signal Pro
            </div>

            <div role="heading" aria-level={1} className={styles.rocketTitle} style={{ marginBottom: 14 }}>
              <span className={styles.rocketIconWrap} aria-hidden="true">
                <Rocket size={36} strokeWidth={2.4} style={{ color: "#FCD34D" }} />
              </span>
              <span>TheRocket Signal Pro</span>
            </div>

            <p
              className="font-lao"
              style={{
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 12,
                background: "linear-gradient(135deg,#60A5FA,#A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ສັນຍານ GOLD &amp; Forex · ສຳລັບເທຣດເດີລາວ
            </p>

            <p
              className="font-lao"
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 14.5,
                lineHeight: 1.75,
                maxWidth: 500,
                marginBottom: 28,
              }}
            >
              TheRocket Signal Pro ຈະຊ່ວຍໃຫ້ເທຣດເດີ ມືໃໝ່ຝຶກເທຣດຕາມແຜນ
              ບໍ່ຫຼົງທາງ ແລະຍັງສາມາດສ້າງກຳໄລໄດ້ອີກ
            </p>

            <div className="flex gap-3 flex-wrap mb-8">
              <Link
                href="/signal/trs-signal-pro/payment"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg,#2563EB,#4F46E5)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "14px 28px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "Noto Sans Lao, sans-serif",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.45)",
                }}
              >
                <Rocket size={15} strokeWidth={2.5} />
                ສະໝັກສະມາຊິກ
              </Link>
              <a
                href={FREE_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "14px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  fontFamily: "Noto Sans Lao, sans-serif",
                  backdropFilter: "blur(6px)",
                }}
              >
                <MessageCircle size={15} />
                ລອງ Free Channel
              </a>
            </div>

            <div className="flex gap-8 flex-wrap pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                ["6+",   "Pair ທີ່ສະແກນ"],
                ["24/5", "ສະແກນຕະຫຼອດເວລາ"],
                ["< 5s", "Latency ສັນຍານ"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className={styles.shimmerNumber} style={{ fontSize: 26, fontWeight: 700 }}>{n}</div>
                  <div className="font-lao" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal preview card */}
          <div className={styles.signalPreview}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(74,222,128,0.12)",
                border: "0.5px solid rgba(74,222,128,0.35)",
                borderRadius: 100,
                padding: "4px 12px",
                fontSize: 11,
                color: "#4ADE80",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              <span className={styles.pulseDot} />
              ຕົວຢ່າງ Signal ໃນ Telegram
            </div>

            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12.5,
                lineHeight: 1.85,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              <div style={{ color: "#FCD34D", fontWeight: 700, marginBottom: 6 }}>🟢 BUY XAUUSD · H1</div>
              <div>Entry &nbsp; <span style={{ color: "#fff" }}>4488.50</span></div>
              <div>SL &nbsp;&nbsp;&nbsp;&nbsp; <span style={{ color: "#EF4444" }}>4483.20</span> &nbsp;(-53 pips)</div>
              <div>TP &nbsp;&nbsp;&nbsp;&nbsp; <span style={{ color: "#4ADE80" }}>4496.20</span> &nbsp;(+77 pips)</div>
              <div style={{ color: "#A78BFA", marginTop: 6 }}>Score · 82/100</div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "Noto Sans Lao, sans-serif",
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                ✓ ເທຣນດ໌ຂາຂຶ້ນ (EMA50 &gt; EMA200)<br />
                ✓ EMA20 ຕັດ EMA50 ຂຶ້ນ<br />
                ✓ MACD ຢືນຢັນໂມເມັນຕັມ<br />
                ✓ SMC: BOS + Order Block ຮັບ
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY TRS SECTION (navy + globe bottom-right) ── */}
      <section className={styles.whySection}>
        <div className={styles.whyGlow} />
        <div className={styles.whyGlobeWrap}>
          <TradingGlobeCanvas />
        </div>
        <div className="relative max-w-[1060px] mx-auto px-6 py-16" style={{ zIndex: 2 }}>
          <div className="text-center mb-12">
            <h2
              className={`${styles.titleOnDark} font-sans font-extrabold tracking-tight`}
              style={{
                fontSize: 36,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              ເປັນຫຍັງຕ້ອງເປັນ{" "}
              <span
                data-gradient="true"
                style={{
                  background: "linear-gradient(135deg,#FCD34D,#22D3EE,#60A5FA)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                TheRocket Signal Pro
              </span>
            </h2>
            <p className={`${styles.subOnDark} font-lao`} style={{ fontSize: 14.5, maxWidth: 680, margin: "0 auto", lineHeight: 1.75 }}>
              TRS Pro ຈະໃຫ້ທ່ານຮັບ Signal ຜ່ານ Telegram ແບບ Realtime
              ແລະ ຍັງສາມາດເຂົ້າເບິ່ງການວິເຄາະ ແລະ ສຶກສາກຣາຟ ຜ່ານ TradingView ໄປພ້ອມໆກັນ
              ໃຊ້ການວິເຄາະດ້ວຍ Indicator ແລະ SMC ເພື່ອໃຫ້ມີຄວາມແມັ້ນຢຳ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WHY_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${styles.glassCard} ${styles.glassCardCyan} ${styles.floatCard}`}>
                <div className={`${styles.iconBadge} ${styles.iconBadgeCyan}`}>
                  <Icon size={22} strokeWidth={2.2} style={{ color: "#A5F3FC" }} />
                </div>
                <h3 className={`${styles.cardTitle} font-lao`}>{title}</h3>
                <p className={`${styles.cardDesc} font-lao`}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Closing quote callout */}
          <div className={styles.quoteCallout} style={{ marginTop: 40 }}>
            <p className={`${styles.quoteText} font-lao`}>
              ເລີ່ມຕົ້ນຖືກວິທີ · ບໍ່ຫຼົງທາງ ·
              <br className="hidden sm:inline" />
              <span
                style={{
                  background: "linear-gradient(135deg,#FCD34D,#22D3EE,#60A5FA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ຝຶກທັກສະການເທຣດຕາມແຜນ ແລະ ມີກໍາໄລ
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-[1060px] mx-auto px-6 py-14">
          <div className="text-center mb-12">
            <div className="section-eyebrow">ຂັ້ນຕອນເຮັດວຽກ</div>
            <h2 className="section-title">
              <span
                style={{
                  whiteSpace: "nowrap",
                  background: "none",
                  WebkitBackgroundClip: "initial",
                  WebkitTextFillColor: "initial",
                  color: "inherit",
                }}
              >
                ຈາກ <span>Chart</span> ສູ່ Telegram
              </span>{" "}
              <span
                style={{
                  whiteSpace: "nowrap",
                  background: "none",
                  WebkitBackgroundClip: "initial",
                  WebkitTextFillColor: "initial",
                  color: "inherit",
                }}
              >
                ໃນ <span>5 ວິນາທີ</span>
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROCESS.map((p, i) => (
              <div
                key={p.step}
                className="card p-6 relative"
                style={{ paddingTop: 32 }}
              >
                <div className={styles.stepNumber}>{p.step}</div>
                <h3 className="font-lao font-bold text-[15px] text-gray-900 mb-1.5">{p.title}</h3>
                <p className="font-lao text-[13px] text-gray-500 leading-relaxed">{p.desc}</p>
                {i < PROCESS.length - 1 && (
                  <ArrowRight
                    className="hidden md:block absolute"
                    size={18}
                    style={{ right: -14, top: "50%", color: "#9CA3AF" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (CSS mesh + floating orbs + candlestick layer) ── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresGrid} />
        <div className={styles.featuresCandleWrap}>
          <CandlestickChartBg />
        </div>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className="relative max-w-[1060px] mx-auto px-6 py-16" style={{ zIndex: 2 }}>
          <div className="text-center mb-12">
            <div className={styles.eyebrowDark} style={{ marginBottom: 18 }}>
              <TrendingUp size={13} strokeWidth={2.5} style={{ color: "#FCD34D" }} />
              ໄດ້ຫຍັງເມື່ອເຂົ້າ Pro
            </div>
            <h2
              className={`${styles.titleOnDark} font-sans font-extrabold tracking-tight`}
              style={{
                fontSize: 34,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              ສັນຍານ{" "}
              <span
                data-gradient="true"
                style={{
                  background: "linear-gradient(135deg,#FCD34D,#F472B6,#60A5FA)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                ບໍ່ໄດ້ມີແຕ່ປຸ່ມ Buy/Sell
              </span>
            </h2>
            <p className={`${styles.subOnDark} font-lao`} style={{ fontSize: 14 }}>
              ມີຄົບທຸກຢ່າງທີ່ມືໃໝ່ຄວນຮູ້ກ່ອນເຂົ້າ trade
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${styles.glassCard} ${styles.floatCard}`}>
                <div className={styles.iconBadge}>
                  <Icon size={22} strokeWidth={2.2} style={{ color: "#BFDBFE" }} />
                </div>
                <h3 className={`${styles.cardTitle} font-lao`} style={{ fontSize: 15 }}>{title}</h3>
                <p className={`${styles.cardDesc} font-lao`} style={{ fontSize: 13 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white border-t border-b border-gray-200">
        <div className="max-w-[1060px] mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <div className="section-eyebrow">ແພັກເກັດ</div>
            <h2 className="section-title">
              ເລືອກແບບທີ່ <span>ເໝາະກັບທ່ານ</span>
            </h2>
            <p className="section-sub">ຈ່າຍດ້ວຍ BCEL OnePay ຫຼື USDT</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PricingCard
              title="Free"
              price="0"
              period="ກີບ · ຕະຫຼອດ"
              features={[
                { ok: true,  text: "ສັນຍານ delay 30 ນາທີ" },
                { ok: true,  text: "ສະເພາະ XAUUSD" },
                { ok: false, text: "ບໍ່ມີເຫດຜົນລະອຽດ" },
                { ok: false, text: "ບໍ່ມີ TP/SL ຊັດເຈນ" },
              ]}
              cta="ເຂົ້າ Free Channel"
              ctaLink={FREE_CHANNEL}
              highlight={false}
            />
            <PricingCard
              title="Pro ລາຍເດືອນ"
              price="250,000"
              period="ກີບ / ເດືອນ"
              features={[
                { ok: true, text: "ສັນຍານ Real-time" },
                { ok: true, text: "ທຸກ pair (Gold + Forex)" },
                { ok: true, text: "ມີເຫດຜົນ + SMC analysis" },
                { ok: true, text: "Entry / TP / SL ຊັດເຈນ" },
                { ok: true, text: "Win/Loss tracking" },
              ]}
              cta="ສະໝັກ Pro"
              ctaLink="/signal/trs-signal-pro/payment"
              highlight
            />
            <PricingCard
              title="Broker Free"
              price="ຟຣີ"
              period="ສະໝັກໂບຣກຜ່ານເຮົາ"
              features={[
                { ok: true,  text: "ທຸກຢ່າງຂອງ Pro" },
                { ok: true,  text: "ຟຣີຕະຫຼອດ active" },
                { ok: false, text: "ຕ້ອງສະໝັກໂບຣກຜ່ານລິ້ງ" },
                { ok: false, text: "Deposit ຂັ້ນຕ່ຳ $200" },
              ]}
              cta="ສະໝັກໂບຣກ"
              ctaLink="/broker"
              highlight={false}
            />
          </div>

          {/* Discount tiers */}
          <div
            className="mt-8 p-6 text-center"
            style={{
              background: "linear-gradient(135deg,#EEF3FF,#DBEAFE)",
              borderRadius: 16,
              border: "1px solid #BFCFFF",
            }}
          >
            <h3 className="font-lao font-bold text-[16px] text-gray-900 mb-1">
              💰 ສ່ວນຫຼຸດສຳລັບ Pro
            </h3>
            <p className="font-lao text-[12px] text-gray-500 mb-4">
              ສະໝັກຫຼາຍເດືອນ · ປະຢັດກວ່າ
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    background: "linear-gradient(135deg,#2563EB,#4F46E5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  3 ເດືອນ
                </div>
                <div className="font-lao text-[13px] text-gray-700">
                  600,000 ກີບ <span className="text-emerald-600 font-bold">· ປະຢັດ 150,000</span>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    background: "linear-gradient(135deg,#2563EB,#4F46E5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  1 ປີ
                </div>
                <div className="font-lao text-[13px] text-gray-700">
                  2,000,000 ກີບ <span className="text-emerald-600 font-bold">· ປະຢັດ 1,000,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BROKER PARTNER ── */}
      <section id="brokers">
        <div className="max-w-[1060px] mx-auto px-6 py-14">
          <div className="text-center mb-8">
            <div className="section-eyebrow">🤝 ໂບຣກ Partner</div>
            <h2 className="section-title">
              ສະໝັກໂບຣກ · <span>ໄດ້ Pro ຟຣີ</span>
            </h2>
            <p className="section-sub">
              ສະໝັກໂບຣກຜ່ານລິ້ງເຮົາ + ຝາກເງິນຂັ້ນຕ່ຳ $200 → ໄດ້ Pro ຟຣີ ຕະຫຼອດ active
            </p>
          </div>
          <div className="text-center">
            <Link href="/broker" className="btn-primary">
              ເບິ່ງ Broker ທັງໝົດ →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT / SIGNUP ── */}
      <section
        id="contact"
        style={{
          background: "linear-gradient(180deg,#EEF3FF 0%,#DBEAFE 50%,#EEF3FF 100%)",
          borderTop: "1px solid #BFCFFF",
          borderBottom: "1px solid #BFCFFF",
        }}
      >
        <div className="max-w-[760px] mx-auto px-6 py-14 text-center">
          <div className="section-eyebrow">ສະໝັກ Pro</div>
          <h2 className="section-title">
            ເລີ່ມເທຣດດ້ວຍ <span>ສັນຍານ Pro</span> ດຽວນີ້
          </h2>
          <p className="section-sub">ຕິດຕໍ່ admin ຜ່ານ Telegram ເພື່ອຮັບລິ້ງ Pro Channel</p>

          <div className="card p-6 text-left mt-4 max-w-[520px] mx-auto">
            <h3 className="font-lao font-bold text-[15px] text-gray-900 mb-3">📋 ຂັ້ນຕອນສະໝັກ</h3>
            <ol className="font-lao text-[13.5px] text-gray-700 space-y-2.5" style={{ paddingLeft: 18, listStyle: "decimal" }}>
              <li>ກົດປຸ່ມລຸ່ມ → ໄປຫນ້າຊຳລະເງິນ</li>
              <li>ໂອນຜ່ານ BCEL OnePay ຫຼື USDT TRC20</li>
              <li>ສົ່ງ Slip / TX hash ຜ່ານຟອມໃນເວັບ</li>
              <li>ຮັບລິ້ງ Pro Channel ໃນ 5-30 ນາທີ</li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              <Link
                href="/signal/trs-signal-pro/payment"
                className="btn-primary"
                style={{ padding: "12px 22px", fontSize: 14 }}
              >
                <Rocket size={15} strokeWidth={2.5} />
                ໄປຫນ້າຊຳລະເງິນ
              </Link>
              <a
                href={ADMIN_CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  color: "#0088cc",
                  textDecoration: "none",
                  padding: "12px 22px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  border: "1.5px solid #0088cc",
                  fontFamily: "Noto Sans Lao, sans-serif",
                }}
              >
                <MessageCircle size={15} />
                ຫຼື ທັກ Admin
              </a>
            </div>
          </div>

          <p className="font-lao text-[12px] text-gray-500 mt-6">
            ⚠️ ການເທຣດ Forex / Gold ມີຄວາມສ່ຽງ · ສັນຍານສຳລັບການສຶກສາ ບໍ່ແມ່ນຄຳແນະນຳການລົງທຶນ
          </p>
        </div>
      </section>

      {SIGNAL_APP_URL && (
        <section className="bg-white">
          <div className="max-w-[1060px] mx-auto px-6 py-10 text-center">
            <p className="font-lao text-[13px] text-gray-500 mb-3">
              ສຳລັບ admin ແລະ Pro member · ເບິ່ງ dashboard ສັນຍານທັງໝົດ
            </p>
            <a href={SIGNAL_APP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
              ເຂົ້າ Signal Dashboard →
            </a>
          </div>
        </section>
      )}
    </div>
  )
}

function PricingCard({
  title, price, period, features, cta, ctaLink, highlight,
}: {
  title: string
  price: string
  period: string
  features: { ok: boolean; text: string }[]
  cta: string
  ctaLink: string
  highlight: boolean
}) {
  const isInternal = ctaLink.startsWith("/") || ctaLink.startsWith("#")
  const ctaProps = isInternal
    ? {}
    : { target: "_blank" as const, rel: "noopener noreferrer" }

  return (
    <div
      className="relative transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: highlight
          ? "linear-gradient(160deg,#0f172a,#1e3a8a)"
          : "#fff",
        color: highlight ? "#fff" : "#111827",
        border: highlight ? "2px solid #4F46E5" : "1.5px solid #E2E6F0",
        borderRadius: 16,
        padding: 28,
        boxShadow: highlight ? "0 14px 40px rgba(79,70,229,0.25)" : "0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 20,
            background: "linear-gradient(135deg,#2563EB,#4F46E5)",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 100,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.05em",
            boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
          }}
        >
          ⭐ ແນະນຳ
        </div>
      )}

      <h3
        className="font-lao font-bold text-[20px] mb-3"
        style={
          highlight
            ? {
                background: "linear-gradient(135deg,#FCD34D,#F472B6,#60A5FA)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                letterSpacing: "-0.01em",
              }
            : { color: "#111827" }
        }
      >
        {title}
      </h3>
      <div style={{ marginBottom: 18 }}>
        <span
          style={
            highlight
              ? {
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(135deg,#FFFFFF,#BFDBFE)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }
              : { fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }
          }
        >
          {price}
        </span>
        <span
          className="font-lao"
          style={{ fontSize: 12, color: highlight ? "rgba(255,255,255,0.7)" : "#6B7280", marginLeft: 6 }}
        >
          {period}
        </span>
      </div>

      <ul className="space-y-2 mb-6" style={{ listStyle: "none", padding: 0 }}>
        {features.map(f => (
          <li key={f.text} className="flex items-start gap-2 font-lao text-[13px] leading-snug">
            {f.ok ? (
              <Check
                size={16}
                strokeWidth={2.5}
                style={{ color: highlight ? "#4ADE80" : "#10B981", flexShrink: 0, marginTop: 2 }}
              />
            ) : (
              <XIcon
                size={16}
                strokeWidth={2.5}
                style={{ color: highlight ? "rgba(255,255,255,0.4)" : "#9CA3AF", flexShrink: 0, marginTop: 2 }}
              />
            )}
            <span style={{ color: highlight ? "rgba(255,255,255,0.85)" : "#374151" }}>{f.text}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaLink}
        {...ctaProps}
        style={{
          display: "block",
          textAlign: "center",
          background: highlight ? "linear-gradient(135deg,#2563EB,#4F46E5)" : "#fff",
          color: highlight ? "#fff" : "#1F2937",
          padding: "12px",
          borderRadius: 10,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 14,
          border: highlight ? "none" : "1.5px solid #9CA3AF",
          fontFamily: "Noto Sans Lao, sans-serif",
          boxShadow: highlight ? "0 4px 14px rgba(37,99,235,0.32)" : "none",
        }}
      >
        {cta}
      </a>
    </div>
  )
}
