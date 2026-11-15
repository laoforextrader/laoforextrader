import Link from "next/link"
import { EAStats } from "@/types"

interface Props { stats: EAStats }

function fmtPct(n?: number) {
  if (n === undefined || n === null || isNaN(n)) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}
function pctColor(n?: number) {
  if (n === undefined || n === null || isNaN(n)) return "var(--fg-3)"
  if (n > 0) return "#10B981"
  if (n < 0) return "#EF4444"
  return "var(--fg-3)"
}

export default function EAStatsCompact({ stats }: Props) {
  const totalPct = stats.profitTotalPct
  const daily = stats.dailyReturns ?? []
  const todayPct = daily.length ? daily[daily.length - 1].profitPct : undefined
  const monthly = (stats.monthlyReturns ?? []).slice(-12)
  //  one scale for both sides here - see the note on the bars below
  const sparkPeak = Math.max(1, ...monthly.map(m => Math.abs(m.profitPct)))

  return (
    <Link
      href={`/ea/${stats.eaId}`}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
      style={{ border: "1px solid var(--line)", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg,#10B981,#2563EB)" }} />

      <div className="px-5 py-4 border-b border-line-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">🟢 LIVE</div>
          <div className="text-[10px] text-fg-4 font-mono">#{stats.account ?? "—"}</div>
        </div>
        <div className="font-lao font-extrabold text-[16px] text-fg group-hover:text-accent-strong transition-colors leading-snug">
          {stats.title}
        </div>
        <div className="text-[10px] text-fg-4 truncate mt-0.5">
          {stats.broker ?? "—"} · {stats.server ?? ""}
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-line-2">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-fg-4 font-bold mb-1">ກຳໄລລວມ</div>
          <div className="text-[22px] font-extrabold leading-none" style={{ color: pctColor(totalPct), letterSpacing: "-0.02em" }}>
            {fmtPct(totalPct)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-fg-4 font-bold mb-1">ມື້ນີ້</div>
          <div className="text-[16px] font-extrabold leading-none" style={{ color: pctColor(todayPct) }}>
            {fmtPct(todayPct)}
          </div>
        </div>
      </div>

      {monthly.length > 0 && (
        <div className="px-5 py-3">
          {/* This one keeps a single honest scale, unlike the big charts: at
              36px there is no room to print the value on each bar, and a
              squashed bar without its number is just a lie. A zero line so a
              red bar reads as below zero, and the value in the tooltip. */}
          <div className="flex items-stretch gap-1" style={{ height: 36 }}>
            {monthly.map(m => {
              const up = m.profitPct >= 0
              const barPct = (Math.abs(m.profitPct) / sparkPeak) * 100
              return (
                <div key={m._key ?? m.month} className="flex-1 flex flex-col" title={`${m.month}: ${fmtPct(m.profitPct)}`}>
                  <div className="flex flex-col justify-end" style={{ height: 17 }}>
                    {up && <div className="rounded-t" style={{ height: `${Math.max(barPct, 6)}%`, background: "#10B981", opacity: 0.8 }} />}
                  </div>
                  <div style={{ height: 1, background: "var(--line)" }} />
                  <div style={{ height: 18 }}>
                    {!up && <div className="rounded-b" style={{ height: `${Math.max(barPct, 6)}%`, background: "#EF4444", opacity: 0.8 }} />}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[8px] text-fg-4 font-mono mt-1.5">
            <span>12 ເດືອນ</span>
            <span className="text-accent font-bold group-hover:underline">View →</span>
          </div>
        </div>
      )}
    </Link>
  )
}
