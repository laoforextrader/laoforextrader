// Broker-industry news, summarised in Lao.
//
// Two jobs on a review directory. The obvious one is that a reader deciding
// who to hand money to should know the regulator fined one of them last week.
// The quieter one is that a directory whose numbers never move reads as
// abandoned, and a dated feed is the cheapest honest way to show the page is
// still being kept.
//
// Each item names its source and links to it. The Lao text is a summary of
// somebody else's reporting, not our reporting, and a reader who cannot get
// back to the original has no way to check it.

import Link from "next/link"
import type { BrokerNewsEntry } from "@/types"
import { formatDate } from "@/lib/utils"

const CATEGORY_LAO: Record<string, string> = {
  regulation: "ກົດລະບຽບ",
  expo: "ງານວົງການ",
  company: "ບໍລິສັດ",
  product: "ຜະລິດຕະພັນ",
}

function itemDate(iso?: string): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  return Number.isFinite(t) ? formatDate(new Date(t).toISOString()) : null
}

/* ── full list, for /broker ───────────────────────────────────────────── */

export function BrokerNewsList({ items }: { items: BrokerNewsEntry[] }) {
  if (!items?.length) return null

  return (
    <ul className="m-0 list-none divide-y divide-bk-line overflow-hidden rounded-bk border border-bk-line p-0">
      {items.map((n) => {
        const d = itemDate(n.pubDate)
        return (
          // The id is what the homepage sidebar deep-links to, so a reader who
          // taps a headline there lands on that story rather than the top of
          // the section.
          <li key={n._key ?? n.id} id={`news-${n.id}`} className="scroll-mt-24 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {n.category && (
                <span className="inline-flex shrink-0 items-center rounded-md border border-bk-line px-2 py-0.5 text-[11px] font-semibold text-bk-muted">
                  {CATEGORY_LAO[n.category] ?? n.category}
                </span>
              )}
              {d && <span className="text-[12px] text-bk-muted">{d}</span>}
              {n.sourceName && (
                <>
                  <span aria-hidden="true" className="text-[12px] text-bk-muted">
                    ·
                  </span>
                  <span className="text-[12px] text-bk-muted">{n.sourceName}</span>
                </>
              )}
            </div>

            <h3 className="lao-head m-0 mt-2 text-[17px] font-bold leading-[1.45] tracking-[-0.02em] text-bk-ink sm:text-[19px]">
              {n.title}
            </h3>

            <p className="m-0 mt-2 text-[15px] leading-[1.75] text-bk-muted">{n.summary}</p>

            {n.brokers && n.brokers.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {n.brokers.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center rounded-md border border-bk-line px-2 py-0.5 text-[11px] font-semibold text-bk-ink"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            {n.source && (
              <a
                href={n.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink"
              >
                ອ່ານຕົ້ນສະບັບ{n.sourceName ? ` ທີ່ ${n.sourceName}` : ""}
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ── compact, for the homepage sidebar ────────────────────────────────── */

export function BrokerNewsCompact({ items }: { items: BrokerNewsEntry[] }) {
  if (!items?.length) return null

  return (
    <ul className="m-0 list-none divide-y divide-bk-line p-0">
      {items.map((n) => {
        const d = itemDate(n.pubDate)
        return (
          <li key={n._key ?? n.id}>
            {/* Into the page that carries the Lao summary, not straight out to
                the English source: the summary is the thing worth reading and
                it lives on /broker. */}
            <Link href={`/broker#news-${n.id}`} className="block py-3 no-underline">
              <span className="block text-[14px] font-semibold leading-[1.6] tracking-[-0.01em] text-bk-ink hover:underline">
                {n.title}
              </span>
              <span className="mt-1 block text-[11px] leading-tight text-bk-muted">
                {[n.category ? (CATEGORY_LAO[n.category] ?? n.category) : null, d, n.sourceName]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
