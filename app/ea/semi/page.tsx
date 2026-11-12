import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RocketMagi Semi — ເຄິ່ງອັດຕະໂນມັດ",
  description: "ກຣິດຄຳທີ່ທ່ານເລີ່ມເອງ ແລ້ວ EA ເຮັດຕໍ່ຈົນຈົບຮອບ — human starts, machine finishes.",
}

// Landing page for the semi-automatic EA. The site is Lao, so the prose is
// Lao; the trading terms stay in English exactly as they do on the dashboard
// and on the MT5 panel.

function HeroArt() {
  // One picture of the whole product: a price line with three marks — the
  // press (blue, human), the rungs the EA adds by itself (rings), and the
  // exit in profit (green). Drawn inline so it follows the theme tokens.
  return (
    <svg viewBox="0 0 320 152" className="w-full" role="img"
         aria-label="ທ່ານກົດ → EA ຖົວໃຫ້ → ປິດຕອນກຳໄລ">
      <defs>
        <linearGradient id="semiFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".20" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[34, 60, 86, 112].map(y => (
        <line key={y} x1="14" x2="306" y1={y} y2={y} stroke="var(--bk-line)" strokeWidth="1" strokeDasharray="2 5" />
      ))}
      <path d="M18,44 L58,58 L98,80 L138,100 L174,92 L212,72 L252,48 L300,32 L300,132 L18,132 Z" fill="url(#semiFade)" />
      <path d="M18,44 L58,58 L98,80 L138,100 L174,92 L212,72 L252,48 L300,32" fill="none"
            stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {[[98, 80], [138, 100], [174, 92]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="4.5" fill="var(--bk-surface)" stroke="var(--accent)" strokeWidth="2" />
      ))}
      <circle cx="58" cy="58" r="15" fill="var(--accent)" opacity=".14" />
      <circle cx="58" cy="58" r="7.5" fill="var(--accent)" />
      <path d="M58 48.5 L58 40 M51 51 L45.5 45.5 M65 51 L70.5 45.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="252" cy="48" r="15" fill="var(--success)" opacity=".14" />
      <circle cx="252" cy="48" r="7.5" fill="var(--success)" />
      <path d="M248.6 48 L251 50.6 L255.6 45.6" stroke="var(--bk-surface)" strokeWidth="2" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const FEATURES: Array<[string, string]> = [
  ["ທ່ານເລືອກທິດທາງເອງ", "EA ບໍ່ເລືອກຝັ່ງໃຫ້ ນອກຈາກທ່ານປ່ຽນເປັນໂໝດ Auto"],
  ["ມັນເບິ່ງແຍງຂັ້ນໄດໃຫ້", "ເລີ່ມຮອບແລ້ວ ການຖົວ ເປົ້າປິດ ແລະການປິດກະຕ່າເປັນອັດຕະໂນມັດທັງໝົດ"],
  ["ສັ່ງຈາກໃສກໍໄດ້", "ປຸ່ມເທິງຊາດ · MT5 ມືຖື · ຫຼືແດຊບອດນີ້ — ໃຊ້ເສັ້ນທາງຄຳສັ່ງດຽວກັນ"],
]

function Shot({ caption, ratio }: { caption: string; ratio: string }) {
  // Placeholder for the dashboard screenshots the owner is designing. Sized
  // to the final aspect so dropping an <Image> in later changes nothing else.
  return (
    <div className="grid place-items-center rounded-bk border-[1.5px] border-dashed border-bk-dash bg-bk-sunken p-3 text-center"
         style={{ aspectRatio: ratio }}>
      <div>
        <div className="text-[20px] leading-none text-bk-dash">▣</div>
        <div className="mt-1.5 text-[11px] font-bold text-bk-muted">{caption}</div>
      </div>
    </div>
  )
}

export default function SemiLandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="mx-auto flex max-w-[860px] flex-col gap-4 px-4 py-8 sm:px-6">

        {/* hero */}
        <section className="flex flex-col gap-3 rounded-bk border border-bk-line bg-bk-surface p-5"
                 style={{ background: "radial-gradient(120% 90% at 85% -10%, var(--accent-soft) 0%, transparent 60%), var(--bk-surface)" }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ok">
            Human starts · machine finishes
          </div>
          <h1 className="text-[26px] font-extrabold leading-[1.22] tracking-tight sm:text-[32px]">
            ທ່ານເລືອກຈັງຫວະ
            <br />
            <span className="bg-gradient-to-r from-ok to-accent bg-clip-text text-transparent">
              ທີ່ເຫຼືອມັນຈັດການເອງ
            </span>
          </h1>
          <p className="text-[13px] leading-relaxed text-bk-muted">
            ກຣິດຄຳເທິງ XAUUSD M5 — ທ່ານກົດຝັ່ງດຽວ EA ສ້າງກະຕ່າຝັ່ງນັ້ນ ຖົວໃຫ້
            ແລ້ວປິດຕອນໄດ້ກຳໄລ ຈາກນັ້ນລໍຖ້າທ່ານສັ່ງໃໝ່
          </p>
          <HeroArt />
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["ທ່ານກົດ", "bg-accent"],
              ["EA ຖົວໃຫ້", "ring"],
              ["ປິດຕອນກຳໄລ", "bg-ok"],
            ].map(([label, kind]) => (
              <div key={label} className="flex items-center gap-1.5 rounded-bk border border-bk-line bg-bk-sunken px-2 py-1.5 text-[10.5px] font-bold text-bk-muted">
                <i className={`h-2 w-2 shrink-0 rounded-full ${kind === "ring" ? "border-2 border-accent bg-bk-surface" : kind}`} />
                {label}
              </div>
            ))}
          </div>
          <Link href="/semi"
                className="rounded-bk bg-accent py-3 text-center text-[13.5px] font-bold text-white no-underline">
            ເຂົ້າສູ່ແດຊບອດ →
          </Link>
          <p className="text-center text-[11px] text-bk-muted">ລອງກັບບັນຊີທົດລອງກ່ອນໄດ້ ບໍ່ມີຄ່າໃຊ້ຈ່າຍ</p>
        </section>

        {/* how it works */}
        <section className="rounded-bk border border-bk-line bg-bk-surface p-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">ມັນເຮັດວຽກແນວໃດ</div>
          <div className="flex flex-col gap-3">
            {FEATURES.map(([title, body], i) => (
              <div key={title} className="flex items-start gap-2.5">
                <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-accent-soft font-mono text-[11px] font-extrabold text-accent-ink">
                  {i + 1}
                </span>
                <span className="text-[12.5px] leading-relaxed text-bk-muted">
                  <b className="font-bold text-fg">{title}</b>
                  <br />
                  {body}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* screenshots — images drop in here later */}
        <section className="flex flex-col gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">ໃຊ້ໄດ້ທັງມືຖືແລະຄອມ</div>
            <p className="mt-1 text-[12px] text-bk-muted">ບັນຊີດຽວກັນ ປຸ່ມດຽວກັນ ຢູ່ໃສກໍສັ່ງໄດ້</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Shot caption="Phone dashboard" ratio="9/16" />
            <Shot caption="Desktop dashboard" ratio="16/10" />
          </div>
        </section>

        <Link href="/semi"
              className="rounded-bk bg-accent py-3 text-center text-[13.5px] font-bold text-white no-underline">
          ເຂົ້າສູ່ແດຊບອດ →
        </Link>
      </div>
    </div>
  )
}
