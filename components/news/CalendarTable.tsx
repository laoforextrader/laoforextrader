// Section 2 — full economic calendar table for the day.
// Renders rawCalendar from Sanity. Filter by impact + currency.

"use client"
import { useMemo, useState } from "react"
import { formatLaoTime } from "@/lib/news/sources-shared"

export interface RawCalRow {
  _key?: string
  event: string
  time: string
  impact: string
  forecast?: string
  previous?: string
  actual?: string
  country?: string
}

const IMPACT_DOT: Record<string, string> = {
  high:   "#EF4444",
  medium: "#F59E0B",
  low:    "#10B981",
}

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", EU: "EUR", GB: "GBP", UK: "GBP", JP: "JPY", AU: "AUD", CA: "CAD",
  CH: "CHF", NZ: "NZD", CN: "CNY",
}

const CURRENCY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺", CAD: "🇨🇦",
  CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
}

const IMPACT_LABEL: Record<string, string> = {
  high:   "ສູງ",
  medium: "ປານກາງ",
  low:    "ຕ່ຳ",
}

function rowCurrency(r: RawCalRow): string {
  if (!r.country) return ""
  return COUNTRY_TO_CURRENCY[r.country] ?? r.country
}

export default function CalendarTable({ rows }: { rows: RawCalRow[] }) {
  const [impactFilter, setImpactFilter] = useState<"all" | "high" | "medium">("all")
  const [currencyFilter, setCurrencyFilter] = useState<string>("all")

  const allCurrencies = useMemo(() => {
    const set = new Set<string>()
    rows.forEach(r => { const c = rowCurrency(r); if (c) set.add(c) })
    return Array.from(set).sort()
  }, [rows])

  const filtered = useMemo(() => {
    return rows
      .filter(r => impactFilter === "all" ? true : r.impact === impactFilter)
      .filter(r => currencyFilter === "all" ? true : rowCurrency(r) === currencyFilter)
      .sort((a, b) => {
        const at = new Date(a.time || 0).getTime()
        const bt = new Date(b.time || 0).getTime()
        return at - bt
      })
  }, [rows, impactFilter, currencyFilter])

  if (!rows || rows.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
            🗓 Economic Calendar
          </div>
          <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
            ປະຕິທິນເສດຖະກິດປະຈຳວັນ
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={impactFilter}
            onChange={e => setImpactFilter(e.target.value as any)}
            className="text-[12px] font-lao bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Impact ທັງໝົດ</option>
            <option value="high">ສູງ</option>
            <option value="medium">ປານກາງ</option>
          </select>
          <select
            value={currencyFilter}
            onChange={e => setCurrencyFilter(e.target.value)}
            className="text-[12px] font-lao bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">ສະກຸນທັງໝົດ</option>
            {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 w-20">ເວລາ</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 w-14 text-center">Imp</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 w-16">Cur</th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500">Event</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 text-right w-16">Forecast</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 text-right w-16">Previous</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 text-right w-16">Actual</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-[12px] font-lao">
                    ບໍ່ມີ event ໃນເງື່ອນໄຂນີ້
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => {
                const cur = rowCurrency(r)
                const imp = (r.impact ?? "low").toLowerCase()
                return (
                  <tr key={r._key ?? i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-gray-700">
                      {formatLaoTime(r.time) || "—"}
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        title={IMPACT_LABEL[imp] || imp}
                        style={{ background: IMPACT_DOT[imp] || IMPACT_DOT.low }}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="font-mono font-semibold text-gray-700">
                        {CURRENCY_FLAG[cur] ?? ""} {cur}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-900 font-lao">
                      {r.event}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono text-gray-500">
                      {r.forecast || "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono text-gray-500">
                      {r.previous || "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono">
                      {r.actual ? (
                        <span className="font-semibold text-blue-600">{r.actual}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
