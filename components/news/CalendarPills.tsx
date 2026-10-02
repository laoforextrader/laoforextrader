// Compact horizontal calendar strip — used on the homepage so visitors
// see today's important events without leaving /

import Link from "next/link"

interface CalendarItem {
  _key?: string
  name: string
  time: string
  impact: "high" | "medium" | "low" | string
}

const DOT: Record<string, string> = {
  high:   "var(--danger)",
  medium: "#F59E0B",
  low:    "var(--success)",
}

export default function CalendarPills({
  items,
  date,
}: {
  items: CalendarItem[]
  date?: string
}) {
  if (!items?.length) return null
  return (
    <div className="bg-surface border-y border-line-2 py-2.5 overflow-hidden">
      <div className="max-w-[1060px] mx-auto px-6 flex items-center gap-3">
        <Link
          href="/news"
          className="flex-shrink-0 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
        >
          📊 ມື້ນີ້
        </Link>
        <div className="w-px h-3 bg-line-2 flex-shrink-0" />
        <div className="flex gap-3 overflow-x-auto pb-0.5 flex-1" style={{ scrollbarWidth: "none" }}>
          {items.map((e, i) => (
            <Link
              key={e._key ?? i}
              href="/news"
              className="flex-shrink-0 inline-flex items-center gap-2 hover:bg-surface-2 rounded-full px-2 py-0.5"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: DOT[e.impact] ?? DOT.low }}
              />
              <span className="font-mono text-[11px] font-semibold text-fg-2 whitespace-nowrap">
                {e.time}
              </span>
              <span className="font-lao text-[11px] text-fg-3 whitespace-nowrap">
                {e.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
