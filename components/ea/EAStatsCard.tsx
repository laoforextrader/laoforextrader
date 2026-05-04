import { sanityClient, QUERIES } from "@/lib/sanity"
import { EAStats } from "@/types"

interface Props {
  eaId: string
  showTitle?: boolean
}

function fmtNum(n?: number, digits = 2) {
  if (n === undefined || n === null || isNaN(n)) return "—"
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

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

export default async function EAStatsCard({ eaId, showTitle = true }: Props) {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId(eaId),
      {},
      { next: { revalidate: 60 } }
    )
  } catch (e) {
    console.error("eaStats fetch error:", e)
  }

  if (!stats || stats.updateMode === "off") return null

  const monthly = (stats.monthlyReturns ?? []).slice(-12)
  const daily   = (stats.dailyReturns ?? []).slice(-30)
  const monthlyMax = Math.max(1, ...monthly.map(m => Math.abs(m.profitPct)))
  const dailyMax   = Math.max(1, ...daily.map(d => Math.abs(d.profitPct)))
  const totalPct = stats.profitTotalPct
  const todayPct = daily.length ? daily[daily.length - 1].profitPct : undefined

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#10B981,#2563EB)" }} />

      {showTitle && (
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">🟢 LIVE STATS</div>
            <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">{stats.title}</h3>
          </div>
          {stats.lastUpdate && (
            <div className="text-[10px] text-gray-400 font-mono">
              อัพเดท {new Date(stats.lastUpdate).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
            </div>
          )}
        </div>
      )}

      {/* Account info */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">ບັນຊີ</div>
          <div className="text-[14px] font-bold text-gray-900 font-mono">#{stats.account ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Server</div>
          <div className="text-[14px] font-bold text-gray-900 font-mono truncate">{stats.server ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Broker</div>
          <div className="text-[14px] font-bold text-gray-900 truncate">{stats.broker ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Currency</div>
          <div className="text-[14px] font-bold text-gray-900 font-mono">{stats.currency ?? "—"}</div>
        </div>
      </div>

      {/* Big metrics */}
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6 border-b border-gray-100">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">ກຳໄລລວມ</div>
          <div className="text-[28px] font-extrabold leading-none" style={{ color: pctColor(totalPct), letterSpacing: "-0.02em" }}>
            {fmtPct(totalPct)}
          </div>
          {stats.profitTotal !== undefined && (
            <div className="text-[11px] text-gray-400 mt-1">
              ${fmtNum(stats.profitTotal)} {stats.currency}
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Balance</div>
          <div className="text-[20px] font-extrabold text-gray-900 leading-none">
            ${fmtNum(stats.balance)}
          </div>
          {stats.equity !== undefined && (
            <div className="text-[11px] text-gray-400 mt-1">
              Equity ${fmtNum(stats.equity)}
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">ມື້ນີ້</div>
          <div className="text-[20px] font-extrabold leading-none" style={{ color: pctColor(todayPct) }}>
            {fmtPct(todayPct)}
          </div>
        </div>
      </div>

      {/* Monthly bars */}
      {monthly.length > 0 && (
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">ລາຍເດືອນ (12 ເດືອນຫຼ້າສຸດ)</div>
          <div className="flex items-end gap-1.5 h-[100px]">
            {monthly.map(m => {
              const h = (Math.abs(m.profitPct) / monthlyMax) * 100
              const positive = m.profitPct >= 0
              return (
                <div key={m._key ?? m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="text-[9px] font-bold tabular-nums" style={{ color: pctColor(m.profitPct) }}>
                    {m.profitPct > 0 ? "+" : ""}{m.profitPct.toFixed(1)}
                  </div>
                  <div className="w-full flex flex-col justify-end" style={{ height: 60 }}>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.max(h, 2)}%`,
                        background: positive ? "#10B981" : "#EF4444",
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono truncate w-full text-center">
                    {m.month.slice(-2)}/{m.month.slice(2,4)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily sparkline */}
      {daily.length > 1 && (
        <div className="px-6 py-5">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">ລາຍວັນ (30 ວັນ)</div>
          <svg viewBox={`0 0 ${daily.length * 10} 60`} className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
            {daily.map((d, i) => {
              const h = (Math.abs(d.profitPct) / dailyMax) * 25
              const positive = d.profitPct >= 0
              const x = i * 10
              const y = positive ? 30 - h : 30
              return (
                <rect
                  key={d._key ?? d.date}
                  x={x + 1}
                  y={y}
                  width={8}
                  height={h || 1}
                  fill={positive ? "#10B981" : "#EF4444"}
                  opacity={0.85}
                />
              )
            })}
            <line x1={0} x2={daily.length * 10} y1={30} y2={30} stroke="#E5E7EB" strokeWidth={0.5} />
          </svg>
          <div className="flex justify-between text-[9px] text-gray-400 font-mono mt-2">
            <span>{daily[0]?.date}</span>
            <span>{daily[daily.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  )
}
