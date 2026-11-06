// Broker-industry news, summarised in Lao.
//
// Two jobs on a review directory. The obvious one is that a reader deciding
// who to hand money to should know the regulator fined one of them last week.
// The quieter one is that a directory whose numbers never move reads as
// abandoned, and a dated feed is the cheapest honest way to show the page is
// still being kept.
//
// Each item names its source and gets its own page at /broker/news/<id>.
// Linking the headline straight out to Finance Magnates would hand the reader
// to an English page and never get them back, and the Lao summary — the thing
// that makes this useful here — would go unread. The original stays one
// clearly-marked link away on that page.

import Link from "next/link"
import type { BrokerNewsEntry } from "@/types"
import { formatDate } from "@/lib/utils"
import { newsImageSrc } from "@/lib/images/remote"

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
        const img = newsImageSrc(n.imageUrl)
        return (
          // The id is what the homepage sidebar deep-links to, so a reader who
          // taps a headline there lands on that story rather than the top of
          // the section.
          <li key={n._key ?? n.id} id={`news-${n.id}`} className="scroll-mt-24">
            {/* Thumbnail first, text after, at every width — the same reading
                order as the rail on the homepage and as the broker rows, so a
                reader scanning down the page hits the pictures in one column
                instead of alternating sides. It stays a square thumbnail
                rather than a full-bleed banner: as a banner each story filled
                a phone screen on its own and three took three screens. */}
            <article className="flex gap-3 p-4 sm:gap-4 sm:p-5">
            {img && (
              <Link href={`/broker/news/${n.id}`} className="block shrink-0">
                {/* Plain <img>: the host is whatever domain the outlet uses,
                    and next/image needs each one allow-listed up front. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  data-no-dim
                  className="aspect-square w-[88px] rounded-bk border border-bk-line object-cover sm:w-[132px]"
                />
              </Link>
            )}
            <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {n.category && (
                <span className="inline-flex shrink-0 items-center rounded-md border border-bk-line px-2 py-0.5 text-[11px] font-semibold text-bk-muted">
                  {CATEGORY_LAO[n.category] ?? n.category}
                </span>
              )}
              {d && <span className="text-[12px] text-bk-muted">{d}</span>}
              {/* The source hides below sm. Beside a thumbnail the text column
                  is ~250px at 360px, so "· Finance Magnates" wrapped to its
                  own line and left the separator dangling at the end of the
                  one above. It is still named on the item page and in the
                  "ອ່ານຕົ້ນສະບັບ ທີ່ …" link. */}
              {n.sourceName && (
                <>
                  <span aria-hidden="true" className="hidden text-[12px] text-bk-muted sm:inline">
                    ·
                  </span>
                  <span className="hidden text-[12px] text-bk-muted sm:inline">{n.sourceName}</span>
                </>
              )}
            </div>

            <h3 className="lao-head m-0 mt-2 text-[17px] font-bold leading-[1.45] tracking-[-0.02em] text-bk-ink sm:text-[19px]">
              <Link href={`/broker/news/${n.id}`} className="text-bk-ink no-underline hover:underline">
                {n.title}
              </Link>
            </h3>

            <p className="m-0 mt-2 line-clamp-3 text-[14px] leading-[1.7] text-bk-muted sm:line-clamp-none sm:text-[15px] sm:leading-[1.75]">
              {n.summary}
            </p>

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

            <Link
              href={`/broker/news/${n.id}`}
              className="mt-2 inline-flex min-h-[44px] items-center text-sm font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink"
            >
              ອ່ານຕໍ່
            </Link>
            </div>
            </article>
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
        const img = newsImageSrc(n.imageUrl)
        return (
          <li key={n._key ?? n.id}>
            <Link href={`/broker/news/${n.id}`} className="flex gap-3 py-3 no-underline">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt=""
                  data-no-dim
                  className="h-[52px] w-[70px] shrink-0 rounded-md border border-bk-line object-cover"
                />
              ) : (
                // A placeholder of the same size, so a story whose source
                // publishes no og:image does not knock the row out of line
                // with the ones around it.
                <span
                  aria-hidden="true"
                  className="h-[52px] w-[70px] shrink-0 rounded-md border border-dashed border-bk-line"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold leading-[1.5] tracking-[-0.01em] text-bk-ink hover:underline">
                  {n.title}
                </span>
                <span className="mt-1 block text-[11px] leading-tight text-bk-muted">
                  {[n.category ? (CATEGORY_LAO[n.category] ?? n.category) : null, d, n.sourceName]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
