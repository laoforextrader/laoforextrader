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

// Major-pair currencies + we keep CN/HK because they move USD pairs heavily.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", EU: "EUR", GB: "GBP", UK: "GBP", JP: "JPY", AU: "AUD", CA: "CAD",
  CH: "CHF", NZ: "NZD",
}

const CURRENCY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺", CAD: "🇨🇦",
  CHF: "🇨🇭", NZD: "🇳🇿",
}

const MAJOR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"]

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

  // Pre-filter to majors only so the dropdown stays clean.
  const majorOnly = useMemo(() => {
    return rows.filter(r => MAJOR_CURRENCIES.includes(rowCurrency(r)))
  }, [rows])

  const allCurrencies = useMemo(() => {
    const set = new Set<string>()
    majorOnly.forEach(r => { const c = rowCurrency(r); if (c) set.add(c) })
    return MAJOR_CURRENCIES.filter(c => set.has(c))
  }, [majorOnly])

  const filtered = useMemo(() => {
    const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return majorOnly
      .filter(r => impactFilter === "all" ? true : r.impact === impactFilter)
      .filter(r => currencyFilter === "all" ? true : rowCurrency(r) === currencyFilter)
      .sort((a, b) => {
        // Time first (chronological), but pin high-impact rows up if same hour
        const at = new Date(a.time || 0).getTime()
        const bt = new Date(b.time || 0).getTime()
        if (at !== bt) return at - bt
        const ai = impactOrder[(a.impact ?? "low").toLowerCase()] ?? 9
        const bi = impactOrder[(b.impact ?? "low").toLowerCase()] ?? 9
        return ai - bi
      })
  }, [majorOnly, impactFilter, currencyFilter])

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
                <th className="px-4 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 w-24">ເວລາ ICT</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 w-12 text-center">Imp</th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 w-24">Cur</th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500">Event</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 text-right w-20">Forecast</th>
                <th className="px-2 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 text-right w-20">Previous</th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 text-right w-20">Actual</th>
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
                    <td className="px-4 py-2.5 font-mono font-semibold text-gray-700">
                      {formatLaoTime(r.time) || "—"}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        title={IMPACT_LABEL[imp] || imp}
                        style={{ background: IMPACT_DOT[imp] || IMPACT_DOT.low }}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[14px]">{CURRENCY_FLAG[cur] ?? "🌐"}</span>
                        <span className="font-mono font-bold text-[12px] text-gray-800">{cur}</span>
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
                    <td className="px-3 py-2.5 text-right font-mono">
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
