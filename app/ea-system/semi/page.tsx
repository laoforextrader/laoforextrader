import Link from "next/link"
import Image from "next/image"
import { Zap, Smartphone, KeyRound } from "lucide-react"
import Reveal from "@/components/semi/Reveal"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RocketMagi Semi — EA ເຄິ່ງອັດຕະໂນມັດ",
  description: "ທ່ານເລືອກຈັງຫວະ ລະບົບເຮັດທີ່ເຫຼືອ — ກຣິດຄຳເທິງ XAUUSD M5 ທີ່ທ່ານເປັນຜູ້ເລີ່ມ ແລ້ວ EA ແກ້ໄມ້ ແລະປິດ basket ໃຫ້ ພ້ອມ Dashboard ສົດເທິງມືຖື.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/semi" },
  openGraph: {
    title: "RocketMagi Semi — EA ເຄິ່ງອັດຕະໂນມັດ | LaoForexTrader",
    description: "ຄົນເລີ່ມ · ເຄື່ອງເຮັດຕໍ່ — ຄວບຄຸມຈາກມືຖືໄດ້ທຸກບ່ອນ",
    url: "https://www.laoforextrader.com/ea-system/semi",
    type: "website",
  },
}

// Accent runs green → cyan → blue: its own product inside /ea-system's
// gradient world, where the other three run blue → violet.
// Radii follow the broker pages: 8px on panels, 10px on buttons, pill on chips.
const INK = "linear-gradient(135deg, #4ADE80 0%, #22D3EE 60%, #60A5FA 100%)"
const LAO = "Noto Sans Lao, sans-serif"
const R = 8

function Gradient({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: INK,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
    }}>{children}</span>
  )
}

/** The whole product in one drawing: you press, it averages, it closes in profit. */
function FlowArt() {
  return (
    <svg viewBox="0 0 320 120" className="w-full max-w-[520px]" role="img"
         aria-label="ທ່ານກົດ → ລະບົບແກ້ໄມ້ໃຫ້ → ປິດຕອນກຳໄລ">
      <defs>
        <linearGradient id="semiLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4ADE80" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="semiFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22D3EE" stopOpacity=".22" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[26, 50, 74, 98].map(y => (
        <line key={y} x1="10" x2="310" y1={y} y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="2 6" />
      ))}
      <path d="M14,34 L54,46 L94,64 L134,80 L170,74 L208,58 L248,38 L306,24 L306,106 L14,106 Z" fill="url(#semiFill)" />
      <path d="M14,34 L54,46 L94,64 L134,80 L170,74 L208,58 L248,38 L306,24"
            fill="none" stroke="url(#semiLine)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {[[94, 64], [134, 80], [170, 74]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="4.5" fill="#0B1230" stroke="#22D3EE" strokeWidth="2" />
      ))}
      <circle cx="54" cy="46" r="14" fill="#4ADE80" opacity=".16" />
      <circle cx="54" cy="46" r="7" fill="#4ADE80" />
      <path d="M54 37 L54 29 M47.5 39.5 L42.5 34.5 M60.5 39.5 L65.5 34.5"
            stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
      <circle cx="248" cy="38" r="14" fill="#60A5FA" opacity=".16" />
      <circle cx="248" cy="38" r="7" fill="#60A5FA" />
      <path d="M244.8 38 L247 40.4 L251.4 35.6" stroke="#0B1230" strokeWidth="2"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STEPS: Array<[string, string, string]> = [
  ["01", "ທ່ານກົດຝັ່ງທີ່ຕ້ອງການ", "Buy ຫຼື Sell — ຈາກປຸ່ມເທິງຊາດ, ມືຖື ຫຼື Dashboard"],
  ["02", "ລະບົບແກ້ໄມ້ໃຫ້ອັດຕະໂນມັດ", "ວາງຂັ້ນໄດທຸກ Grid ແລະຄິດຈຸດຄຸ້ມທຶນໃຫ້ຕະຫຼອດເວລາ"],
  ["03", "ປິດ basket ຕອນເປັນກຳໄລ", "ຮອດເປົ້າແລ້ວປິດທັງ basket ແລ້ວລໍຖ້າຄຳສັ່ງຕໍ່ໄປ"],
]

const FEATURES: Array<[string, string, string]> = [
  ["⬡", "ສາມໂໝດໃນຕົວດຽວ",
   "Manual ກົດເທື່ອລະຮອບ · Semi ວົນຕໍ່ໃນທິດທີ່ກົດ · Auto ເລືອກທິດເອງ — ປ່ຽນໄດ້ທຸກເວລາ"],
  ["◉", "ມິເຕີຕະຫຼາດສົດ",
   "Trend · Speed · ATR · Spread · Equity guard ອ່ານຈາກ MT5 ໂດຍກົງທຸກ 3 ວິນາທີ"],
  ["⬢", "ຄວບຄຸມຈາກມືຖື",
   "ເປີດ ປິດ ປ່ຽນໂໝດ ແລະປັບ First lot / Grid / Guard ຈາກ Dashboard ເທິງເວັບ"],
  ["◈", "ແຈ້ງເຕືອນເຂົ້າ MT5",
   "ເປີດ basket ປິດ basket ປ່ຽນໂໝດ ຫຼືເລື່ອງສຸກເສີນ — ເລືອກເປີດປິດເອງໄດ້"],
  ["⬟", "ສະເກລຂັ້ນໄດຕາມລ໋ອດ",
   "ກຳນົດລ໋ອດໄມ້ທຳອິດເອງ ຂັ້ນໄດທັງໝົດສະເກລຕາມ ພ້ອມບອກລ໋ອດລວມຕອນເຕັມຂັ້ນໄດ"],
  ["◆", "ດ່ານສຸກເສີນ",
   "ສະເປຣດກວ້າງ ຫຼືລາຄາກະໂດດແຮງຜິດປົກກະຕິ — ລະບົບຢຸດເປີດໄມ້ໃໝ່ໃຫ້ເອງ"],
]

const TRUST: Array<[React.ComponentType<{ size?: number; strokeWidth?: number }>, string]> = [
  [Zap, "ອັບເດດທຸກ 3 ວິນາທີ"],
  [Smartphone, "ສັ່ງງານຈາກມືຖື"],
  [KeyRound, "ຜູກບັນຊີດ້ວຍກະແຈສ່ວນຕົວ"],
]

export default function SemiLandingPage() {
  return (
    <div style={{ background: "#04070F" }}>

      {/* ── HERO ───────────────────────────────────────────────────────────
          Wide screens put the product shot and the three steps side by side,
          so the reader sees what it looks like and how it works in one view.
          Phones keep the single column: picture, then steps underneath. ──── */}
      <section style={{
        background: "radial-gradient(90% 60% at 50% -10%, rgba(34,211,238,0.14) 0%, transparent 60%), linear-gradient(180deg,#04070F 0%,#0B1230 100%)",
        borderBottom: "1px solid #16203C",
      }}>
        <div className="mx-auto max-w-[1100px] px-6 pb-12 pt-14 sm:pt-20">

          <Reveal className="text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                 style={{ background: "rgba(74,222,128,0.12)", border: "0.5px solid rgba(74,222,128,0.35)", color: "#4ADE80" }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#4ADE80" }} />
              Human + Machine · Semi-automatic
            </div>

            <h1 className="mx-auto max-w-[760px] text-[34px] font-extrabold leading-[1.12] tracking-[-0.03em] text-white sm:text-[54px]">
              ທ່ານເລືອກຈັງຫວະ
              <br />
              <Gradient>ລະບົບເຮັດທີ່ເຫຼືອ</Gradient>
            </h1>

            <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-[1.75] sm:text-[15px]"
               style={{ color: "rgba(255,255,255,0.58)", fontFamily: LAO }}>
              ກຣິດຄຳເທິງ XAUUSD M5 ທີ່ທ່ານເປັນຜູ້ເລີ່ມເອງ — ກົດຝັ່ງດຽວ
              ແລ້ວ EA ສ້າງ basket ແກ້ໄມ້ໃຫ້ ແລະປິດຕອນໄດ້ກຳໄລ
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/semi" className="px-6 py-3 text-[14px] font-bold text-[#04070F] no-underline"
                    style={{ background: INK, borderRadius: 10 }}>
                ເຂົ້າສູ່ Dashboard →
              </Link>
              <Link href="/ea-system" className="border px-6 py-3 text-[14px] font-semibold text-white no-underline"
                    style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
                ເບິ່ງ EA ຕົວອື່ນ
              </Link>
            </div>
          </Reveal>

          {/* product shot + the three steps beside it */}
          <div className="semi-hero mt-10">
            <Reveal delay={80}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-x-6 bottom-3 h-20 rounded-[50%] blur-3xl"
                     style={{ background: "rgba(34,211,238,0.20)" }} />
                <Image
                  src="/ea/semi-mockup.webp"
                  alt="RocketMagi Semi — Dashboard ເທິງມືຖືແລະຄອມພິວເຕີ"
                  width={1535}
                  height={1024}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 899px) 92vw, 620px"
                  className="relative mx-auto h-auto w-full"
                />
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#22D3EE" }}>
                  How it works
                </div>
                {STEPS.map(([num, title, body]) => (
                  <div key={num} className="flex items-start gap-3.5 p-4"
                       style={{ background: "rgba(255,255,255,0.035)", border: "1px solid #16203C", borderRadius: R }}>
                    <span className="font-mono text-[13px] font-bold leading-6" style={{ color: "#22D3EE" }}>{num}</span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold leading-6 text-white" style={{ fontFamily: LAO }}>{title}</span>
                      <span className="mt-1 block text-[12.5px] leading-[1.7]"
                            style={{ color: "rgba(255,255,255,0.52)", fontFamily: LAO }}>{body}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* trust strip — vector icons inherit the text colour, no emoji */}
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-[11.5px]"
                 style={{ color: "rgba(255,255,255,0.46)", fontFamily: LAO }}>
              {TRUST.map(([Icon, label]) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon size={14} strokeWidth={1.9} />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THE ROUND, DRAWN ───────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid #16203C" }}>
        <div className="mx-auto max-w-[1100px] px-6 py-14">
          <Reveal>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#22D3EE" }}>
              One round, start to finish
            </div>
            <h2 className="mb-8 text-center text-[24px] font-extrabold tracking-[-0.025em] text-white sm:text-[30px]">
              ຄົນເລີ່ມ · <Gradient>ເຄື່ອງເຮັດຕໍ່</Gradient>
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 p-6"
                 style={{ background: "linear-gradient(180deg, rgba(34,211,238,0.06), transparent)", border: "1px solid #16203C", borderRadius: R }}>
              <FlowArt />
              <div className="flex w-full max-w-[520px] justify-between text-[11px] font-semibold" style={{ fontFamily: LAO }}>
                <span style={{ color: "#4ADE80" }}>ທ່ານກົດ</span>
                <span style={{ color: "#22D3EE" }}>ລະບົບແກ້ໄມ້</span>
                <span style={{ color: "#60A5FA" }}>ປິດຕອນກຳໄລ</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid #16203C" }}>
        <div className="mx-auto max-w-[1100px] px-6 py-14">
          <Reveal>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#22D3EE" }}>
              What you get
            </div>
            <h2 className="mb-8 text-[24px] font-extrabold tracking-[-0.025em] text-white sm:text-[30px]">
              ສິ່ງທີ່ຢູ່ໃນ <Gradient>RocketMagi Semi</Gradient>
            </h2>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([icon, title, body], i) => (
              <Reveal key={title} delay={i * 70}>
                <div className="h-full p-5"
                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #16203C", borderRadius: R }}>
                  <div className="mb-3 grid h-9 w-9 place-items-center text-[15px]"
                       style={{ background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.25)", borderRadius: R, color: "#22D3EE" }}>
                    {icon}
                  </div>
                  <div className="text-[13.5px] font-bold text-white" style={{ fontFamily: LAO }}>{title}</div>
                  <div className="mt-1.5 text-[12.5px] leading-[1.7]"
                       style={{ color: "rgba(255,255,255,0.5)", fontFamily: LAO }}>{body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1100px] px-6 py-16 text-center">
          <Reveal>
            <h2 className="text-[24px] font-extrabold tracking-[-0.025em] text-white sm:text-[32px]">
              ພ້ອມລອງແລ້ວບໍ່
            </h2>
            <p className="mx-auto mt-3 max-w-[480px] text-[13.5px] leading-[1.7]"
               style={{ color: "rgba(255,255,255,0.5)", fontFamily: LAO }}>
              ເຂົ້າສູ່ລະບົບດ້ວຍ Google ແລ້ວໃສ່ເລກບັນຊີ MT5 ກັບກະແຈທີ່ສະແດງຢູ່ແຜງຂອງ EA
              ເທົ່ານັ້ນກໍຄວບຄຸມບັນຊີຂອງທ່ານໄດ້ຈາກທຸກບ່ອນ
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/semi" className="px-7 py-3.5 text-[14px] font-bold text-[#04070F] no-underline"
                    style={{ background: INK, borderRadius: 10 }}>
                ເຂົ້າສູ່ Dashboard →
              </Link>
            </div>
            <p className="mx-auto mt-8 max-w-[640px] px-4 py-3 text-[11px] leading-[1.7]"
               style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)", borderRadius: R, color: "#FCD34D", fontFamily: LAO }}>
              ⚠ ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ · ລະບົບນີ້ເປັນເຄື່ອງມືຊ່ວຍເທຣດ ບໍ່ແມ່ນການຮັບປະກັນກຳໄລ
              · ແນະນຳໃຫ້ທົດລອງໃນບັນຊີ Demo ກ່ອນສະເໝີ
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
