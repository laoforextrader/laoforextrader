// Today's economic calendar as one strip on the homepage.
//
// Flat surface, same tokens as /broker. The strip scrolls sideways on a phone
// instead of wrapping: a wrapped calendar grew the hero by two rows on a
// 360px screen and pushed the first article below the fold.
//
// Impact keeps its colour — it is the one thing here that is a value and not
// decoration — but it is also spelled out for a screen reader, since a dot of
// colour is not a label.

import Link from "next/link"

interface CalendarItem {
  _key?: string
  name: string
  time: string
  impact: "high" | "medium" | "low" | string
}

const IMPACT: Record<string, { dot: string; lao: string }> = {
  high:   { dot: "#DC2626", lao: "ຜົນກະທົບສູງ" },
  medium: { dot: "#D97706", lao: "ຜົນກະທົບກາງ" },
  low:    { dot: "#65A30D", lao: "ຜົນກະທົບຕ່ຳ" },
}

export default function CalendarPills({ items }: { items: CalendarItem[] }) {
  if (!items?.length) return null

  return (
    <section aria-label="ປະຕິທິນເສດຖະກິດມື້ນີ້" className="border-b border-bk-line">
      <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/news"
          className="shrink-0 text-[13px] font-semibold text-bk-ink no-underline hover:underline"
        >
          ປະຕິທິນມື້ນີ້
        </Link>
        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-bk-line" />
        <div className="-mr-4 flex flex-1 gap-2 overflow-x-auto pr-4 [scrollbar-width:none] sm:-mr-6 sm:pr-6 [&::-webkit-scrollbar]:hidden">
          {items.map((e, i) => {
            const im = IMPACT[e.impact] ?? IMPACT.low
            return (
              <Link
                key={e._key ?? i}
                href="/news"
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-bk border border-bk-line px-2.5 py-1.5 no-underline hover:bg-bk-sunken"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: im.dot }}
                />
                <span className="sr-only">{im.lao}: </span>
                <span className="font-mono text-[12px] font-bold text-bk-ink">{e.time}</span>
                <span className="text-[12px] text-bk-muted">{e.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
