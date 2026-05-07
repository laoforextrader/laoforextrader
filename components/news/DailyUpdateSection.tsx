// Daily update widget shown at the top of /news.
// Server component — receives the latest dailyUpdate from Sanity.

import Link from "next/link"

export interface DailyUpdate {
  _id: string
  date: string
  dailySummary?: string
  hotNews?: { title?: string; summary?: string; source?: string }
  calendarHighlights?: Array<{
    _key?: string
    name: string
    time: string
    impact: "high" | "medium" | "low" | string
    description?: string
  }>
  hasHighImpact?: boolean
  createdAt?: string
}

const IMPACT_CONFIG = {
  high:   { dot: "#EF4444", bg: "#FEF2F2", border: "#FECACA", label: "ສຳຄັນສູງ" },
  medium: { dot: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", label: "ປານກາງ" },
  low:    { dot: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", label: "ຕ່ຳ" },
}

function impactStyle(impact: string) {
  return IMPACT_CONFIG[impact as keyof typeof IMPACT_CONFIG] ?? IMPACT_CONFIG.low
}

function formatDate(d: string) {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return d
  return `${m[3]}-${m[2]}-${m[1]}`
}

export default function DailyUpdateSection({ data }: { data: DailyUpdate | null }) {
  if (!data) return null
  const calendar = data.calendarHighlights ?? []

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
            📊 Daily Update · {formatDate(data.date)}
          </div>
          <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
            ສະຫຼຸບປະຈຳວັນ
          </h2>
        </div>
        {data.hasHighImpact && (
          <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            High Impact
          </span>
        )}
      </div>

      {/* Daily summary card */}
      {data.dailySummary && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: "linear-gradient(135deg,#EEF3FF,#F5F3FF)", border: "1px solid #DDE3F2" }}
        >
          <p className="font-lao text-[14px] leading-relaxed text-gray-700">
            {data.dailySummary}
          </p>
        </div>
      )}

      {/* Calendar pills (horizontal scroll) */}
      {calendar.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Economic Calendar
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
            {calendar.map((e, i) => {
              const s = impactStyle(e.impact)
              return (
                <div
                  key={e._key ?? i}
                  className="flex-shrink-0 rounded-xl px-4 py-2.5"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, minWidth: 200 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                    <span className="font-mono text-[12px] font-semibold text-gray-700">{e.time}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                      {s.label}
                    </span>
                  </div>
                  <div className="font-lao text-[13px] font-semibold text-gray-900 line-clamp-1">
                    {e.name}
                  </div>
                  {e.description && (
                    <div className="font-lao text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      {e.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hot news */}
      {data.hotNews?.title && (
        <div className="rounded-2xl p-5 bg-white border border-gray-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2 flex items-center gap-1">
            🔥 Hot Story
          </div>
          <h3 className="font-lao text-[18px] font-bold text-gray-900 mb-2 leading-snug">
            {data.hotNews.title}
          </h3>
          {data.hotNews.summary && (
            <p className="font-lao text-[13px] text-gray-600 leading-relaxed mb-3">
              {data.hotNews.summary}
            </p>
          )}
          {data.hotNews.source && (
            <Link
              href={data.hotNews.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] font-semibold uppercase tracking-widest text-blue-600 hover:underline"
            >
              ເບິ່ງແຫຼ່ງຂ່າວ →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
