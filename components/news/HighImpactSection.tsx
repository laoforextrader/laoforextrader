// Section 1 — top high-impact events with countdown timers.
// Click → /news/event/[id] for the full analysis page.

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
  return (
    <section className="mb-12">
      <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            High Impact ມື້ນີ້
          </div>
          <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
            ເຫດການສຳຄັນຕ້ອງຈັບຕາ
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.slice(0, 2).map((e, i) => (
          <Link
            key={e._key ?? e.id}
            href={`/news/event/${encodeURIComponent(e.id)}`}
            className="group block bg-white rounded-2xl p-5 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: "linear-gradient(90deg,#EF4444,#F97316,#EAB308)" }}
            />

            <div className="flex items-center gap-2 mb-3 mt-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
                #{i + 1}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                High Impact
              </span>
              {e.currency && (
                <span className="text-[11px] font-mono font-semibold text-gray-500">
                  {CURRENCY_FLAG[e.currency] ?? "🌐"} {e.currency}
                </span>
              )}
            </div>

            <h3 className="font-lao text-[18px] font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-snug mb-1.5">
              {e.nameLao}
            </h3>
            {e.nameEn && (
              <div className="font-mono text-[11px] text-gray-400 mb-3">{e.nameEn}</div>
            )}
            {e.description && (
              <p className="font-lao text-[13px] text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {e.description}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="font-mono font-semibold text-gray-700">{e.time}</span>
                {e.forecast && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>F: <span className="font-mono text-gray-700">{e.forecast}</span></span>
                  </>
                )}
                {e.previous && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>P: <span className="font-mono text-gray-700">{e.previous}</span></span>
                  </>
                )}
              </div>
              {e.timeISO && <Countdown target={e.timeISO} />}
            </div>

            <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
              ເບິ່ງການວິເຄາະເຕັມ →
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
