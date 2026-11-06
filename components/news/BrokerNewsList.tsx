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
            {/* Two layouts from one DOM order, via grid placement.
                
                Phone: the meta and the headline run the full width, then the
                thumbnail drops into the left column beside the summary. The
                headline is the thing being scanned, and squeezing it into a
                250px column beside a picture cost it three lines; given the
                whole width it takes two, and the picture fills what would
                otherwise be dead space next to the summary.
                
                sm and up: the thumbnail spans every row on the left, which is
                the reading order the rail and the broker rows already use.
                
                Grid, not two copies of the <img> behind `hidden` — the
                browser still fetches an image inside display:none, and a
                duplicated element is one more thing to keep in step. */}
            <article
              className={`grid gap-x-3 p-4 sm:gap-x-4 sm:p-5 ${
                img ? "grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)]" : "grid-cols-1"
              }`}
            >
            <div
              className={`flex flex-wrap items-center gap-2 ${
                img ? "col-span-2 row-start-1 sm:col-span-1 sm:col-start-2 sm:row-start-1" : ""
              }`}
            >
              {n.category && (
                <span className="inline-flex shrink-0 items-center rounded-md border border-bk-line px-2 py-0.5 text-[11px] font-semibold text-bk-muted">
                  {CATEGORY_LAO[n.category] ?? n.category}
                </span>
              )}
              {d && <span className="text-[12px] text-bk-muted">{d}</span>}
              {/* The source hides below sm: even across the full width the
                  meta line is tight once the chip and date are on it. It is
                  still named on the item page and in the "ອ່ານຕົ້ນສະບັບ ທີ່ …"
                  link. */}
              {n.sourceName && (
                <>
                  <span aria-hidden="true" className="hidden text-[12px] text-bk-muted sm:inline">
                    ·
                  </span>
                  <span className="hidden text-[12px] text-bk-muted sm:inline">{n.sourceName}</span>
                </>
              )}
            </div>

            <h3
              className={`lao-head m-0 mt-2 text-[17px] font-bold leading-[1.45] tracking-[-0.02em] text-bk-ink sm:text-[19px] ${
                img ? "col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-2" : ""
              }`}
            >
              <Link href={`/broker/news/${n.id}`} className="text-bk-ink no-underline hover:underline">
                {n.title}
              </Link>
            </h3>

            {img && (
              <Link
                href={`/broker/news/${n.id}`}
                // row-span-2 on a phone is what actually buys the space.
                // Spanning one row, the 88px picture and the tag/read-more
                // row below it ADD UP; spanning both, the card is as tall as
                // the taller of the two columns and the footer sits beside
                // the lower half of the picture instead of under it.
                className="col-start-1 row-span-2 row-start-3 mt-2 block self-start sm:row-span-4 sm:row-start-1 sm:mt-0"
              >
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

            <p
              // self-start matters: a grid item stretches to its row by
              // default, and line-clamp renders inside whatever height the
              // element ends up with — so stretched to the 88px thumbnail it
              // showed a clipped fourth line under the ellipsis. Sized to its
              // own content, the clamp lands where it should.
              className={`m-0 mt-2 line-clamp-3 self-start text-[14px] leading-[1.7] text-bk-muted sm:line-clamp-none sm:text-[15px] sm:leading-[1.75] ${
                img ? "col-start-2 row-start-3 sm:col-start-2 sm:row-start-3" : ""
              }`}
            >
              {n.summary}
            </p>

            {/* Tags and the read-more share one row, in the right column
                under the summary, at every width.
                
                Stacked they cost two rows for about six words, and on a phone
                that was the difference between two stories per screen and
                one. The link keeps its 44px box, which sets the row height —
                the chips just sit inside it. */}
            <div
              className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 ${
                img ? "col-start-2 row-start-4" : ""
              }`}
            >
              {n.brokers?.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded-md border border-bk-line px-2 py-0.5 text-[11px] font-semibold text-bk-ink"
                >
                  {b}
                </span>
              ))}

              <Link
                href={`/broker/news/${n.id}`}
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink"
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
