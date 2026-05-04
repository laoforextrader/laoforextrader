import Link from "next/link"
import { EAStats } from "@/types"

interface Props { stats: EAStats }

function fmtPct(n?: number) {
  if (n === undefined || n === null || isNaN(n)) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}
function pctColor(n?: number) {
  if (n === undefined || n === null || isNaN(n)) return "#6B7280"
  if (n > 0) return "#10B981"
  if (n < 0) return "#EF4444"
  return "#6B7280"
}

export default function EAStatsCompact({ stats }: Props) {
  const totalPct = stats.profitTotalPct
  const daily = stats.dailyReturns ?? []
  const todayPct = daily.length ? daily[daily.length - 1].profitPct : undefined
  const monthly = (stats.monthlyReturns ?? []).slice(-12)
  const monthlyMax = Math.max(1, ...monthly.map(m => Math.abs(m.profitPct)))

  return (
    <Link
      href={`/ea/${stats.eaId}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
      style={{ border: "1px solid #E2E6F0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg,#10B981,#2563EB)" }} />

      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">🟢 LIVE</div>
          <div className="text-[10px] text-gray-400 font-mono">#{stats.account ?? "—"}</div>
        </div>
        <div className="font-lao font-extrabold text-[16px] text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
          {stats.title}
        </div>
        <div className="text-[10px] text-gray-400 truncate mt-0.5">
          {stats.broker ?? "—"} · {stats.server ?? ""}
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-gray-100">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">ກຳໄລລວມ</div>
          <div className="text-[22px] font-extrabold leading-none" style={{ color: pctColor(totalPct), letterSpacing: "-0.02em" }}>
            {fmtPct(totalPct)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">ມື້ນີ້</div>
          <div className="text-[16px] font-extrabold leading-none" style={{ color: pctColor(todayPct) }}>
            {fmtPct(todayPct)}
          </div>
        </div>
      </div>

      {monthly.length > 0 && (
        <div className="px-5 py-3">
          <div className="flex items-end gap-1 h-[36px]">
            {monthly.map(m => {
              const h = (Math.abs(m.profitPct) / monthlyMax) * 100
              return (
                <div key={m._key ?? m.month} className="flex-1 flex flex-col justify-end">
                  <div className="rounded-t" style={{
                    height: `${Math.max(h, 4)}%`,
                    background: m.profitPct >= 0 ? "#10B981" : "#EF4444",
                    opacity: 0.8,
                  }} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[8px] text-gray-400 font-mono mt-1.5">
            <span>12 ເດືອນ</span>
            <span className="text-blue-600 font-bold group-hover:underline">View →</span>
          </div>
        </div>
      )}
    </Link>
  )
}
