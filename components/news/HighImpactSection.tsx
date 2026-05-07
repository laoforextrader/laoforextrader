// Section 1 — compact horizontal bars for the day's top high-impact
// events with countdown. Each bar links to the full /news/event/[id]
// analysis page.

import Link from "next/link"
import { Countdown } from "./Countdown"

export interface TopEvent {
  _key?: string
  id: string
  nameLao: string
  nameEn?: string
  currency?: string
  country?: string
  time: string
  timeISO?: string
  impact: "high" | "medium" | "low" | string
  forecast?: string
  previous?: string
  description?: string
}

const CURRENCY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺", CAD: "🇨🇦",
  CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
}

export default function HighImpactSection({ events }: { events: TopEvent[] }) {
  if (!events || events.length === 0) return null
  const list = events.slice(0, 2)

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map(e => (
          <Link
            key={e._key ?? e.id}
            href={`/news/event/${encodeURIComponent(e.id)}`}
            className="group flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-200 hover:border-red-400 hover:shadow-md transition-all relative overflow-hidden"
          >
            {/* Left accent indicator */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#FEE2E2,#FED7AA)", border: "1px solid #FECACA" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                  HIGH
                </span>
                {e.currency && (
                  <span className="font-mono text-[10px] font-semibold text-gray-500">
                    {CURRENCY_FLAG[e.currency] ?? "🌐"} {e.currency}
                  </span>
                )}
                <span className="text-gray-300 text-[10px]">·</span>
                <span className="font-mono text-[11px] font-bold text-gray-700">
                  {e.time} GMT+7
                </span>
              </div>
              <div className="font-lao text-[13px] text-gray-800 leading-snug line-clamp-1 group-hover:text-red-700 transition-colors">
                <span className="font-bold">ມື້ນີ້:</span>{" "}
                {e.description || `ຈັບຕາການປະກາດ ${e.nameLao}`}
              </div>
            </div>

            {/* Countdown — desktop only */}
            {e.timeISO && (
              <div className="hidden sm:flex flex-shrink-0">
                <Countdown target={e.timeISO} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
