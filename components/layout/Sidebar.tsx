// The homepage sidebar.
//
// Flat surface, same token set as /broker: one radius, hairline borders, no
// shadow, hierarchy from size. The version this replaces was three stacked
// soft-blue cards — a tinted broker panel with per-broker logo colours, a
// gradient newsletter button — which read as three adverts beside the
// articles rather than as part of the page.
//
// Two things were also simply broken:
//   · `trending` was passed in by app/page.tsx and never rendered. Five
//     articles were queried and fetched on every homepage request, then
//     dropped on the floor. It was briefly a "most read" list and is now two
//     news blocks instead: what moved in the broker industry, and what moved
//     in the market. A rail that changes on its own is what makes a site look
//     tended; five links to our own evergreen articles did not.
//   · The newsletter box was an <input> and a <button> with no handler, so
//     every address typed into it was discarded. It posts to /api/newsletter
//     through the same component the footer uses.

import Link from "next/link"
import Image from "next/image"
import type { Broker, BrokerNewsEntry, HotNewsEntry } from "@/types"
import { gradeColor, gradeInk, licensesOf } from "@/lib/broker"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { BrokerNewsCompact } from "@/components/news/BrokerNewsList"
import { newsImageSrc } from "@/lib/images/remote"

interface Props {
  brokers?: Broker[]
  /** Summarised broker-industry stories — /api/cron/broker-news. */
  brokerNews?: BrokerNewsEntry[]
  /** The market stories from the daily pipeline's hotNews[]. */
  tradingNews?: HotNewsEntry[]
}

function SideHead({ title, href, hrefLabel }: { title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="m-0 text-[17px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-[40px] shrink-0 items-center text-[13px] font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink"
        >
          {hrefLabel}
        </Link>
      )}
    </div>
  )
}

export function Sidebar({ brokers = [], brokerNews = [], tradingNews = [] }: Props) {
  return (
    <aside className="flex flex-col gap-8 border-t border-bk-line px-4 py-8 sm:px-6 lg:border-l lg:border-t-0 lg:px-6">
      {/* ── brokers ───────────────────────────────────────────────────── */}
      {brokers.length > 0 && (
        <section>
          <SideHead title="ໂບຣກເກີແນະນຳ" href="/broker" hrefLabel="ທັງໝົດ" />
          <ul className="m-0 list-none divide-y divide-bk-line overflow-hidden rounded-bk border border-bk-line p-0">
            {brokers.slice(0, 5).map((b, i) => {
              const slug = b.slug?.current ?? ""
              const rating = b.rating
              const logo = b.logo?.asset?.url as string | undefined
              const regs = licensesOf(b)
                .slice(0, 2)
                .map((l) => l.regulator)
                .join(" · ")
              return (
                <li key={b._id}>
                  <Link
                    href={`/broker/${slug}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 no-underline hover:bg-bk-sunken"
                  >
                    <span className="w-3 shrink-0 text-center font-mono text-[13px] font-bold text-bk-muted">
                      {b.rank ?? i + 1}
                    </span>
                    {logo && (
                      <Image
                        src={logo}
                        alt=""
                        width={30}
                        height={30}
                        data-no-dim
                        className="shrink-0 rounded-md border border-bk-line object-cover"
                        style={{ width: 30, height: 30 }}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
                        {b.name}
                      </span>
                      <span className="block truncate text-[11px] leading-tight text-bk-muted">
                        {regs || "ຍັງບໍ່ໄດ້ບັນທຶກ"}
                      </span>
                    </span>
                    {typeof rating === "number" && (
                      <span
                        className="inline-flex shrink-0 items-center justify-center rounded-md px-1.5 py-1 font-mono text-[12px] font-bold"
                        style={{ background: gradeColor(rating), color: gradeInk(rating) }}
                      >
                        {rating.toFixed(1)}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="m-0 mt-2.5 text-[11px] leading-relaxed text-bk-muted">
            ຄະແນນມາຈາກການເປີດບັນຊີຈິງ ແລະ ຝາກ-ຖອນຈິງ · ບາງລິ້ງເປັນລິ້ງແນະນຳ
          </p>
        </section>
      )}

      {/* ── broker-industry news ──────────────────────────────────────── */}
      {brokerNews.length > 0 && (
        <section>
          <SideHead title="ຂ່າວວົງການໂບຣກເກີ" href="/broker#news" hrefLabel="ທັງໝົດ" />
          <BrokerNewsCompact items={brokerNews.slice(0, 3)} />
        </section>
      )}

      {/* ── market news ───────────────────────────────────────────────── */}
      {tradingNews.length > 0 && (
        <section>
          <SideHead title="ຂ່າວຕະຫຼາດ" href="/news" hrefLabel="ທັງໝົດ" />
          <ul className="m-0 list-none divide-y divide-bk-line p-0">
            {tradingNews.slice(0, 3).map((n) => {
              const img = newsImageSrc(n.imageUrl)
              return (
              <li key={n._key ?? n.id}>
                {/* Same row shape as the broker block above — thumbnail,
                    headline, one meta line — so the two read as one rail
                    rather than two widgets that happen to sit together. */}
                <Link href={`/news/hot/${n.id}`} className="flex gap-3 py-3 no-underline">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      data-no-dim
                      className="h-[52px] w-[70px] shrink-0 rounded-md border border-bk-line object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-[52px] w-[70px] shrink-0 rounded-md border border-dashed border-bk-line"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold leading-[1.5] tracking-[-0.01em] text-bk-ink hover:underline">
                      {n.title}
                    </span>
                    {n.summary && (
                      <span className="mt-1 block line-clamp-2 text-[11px] leading-[1.55] text-bk-muted">
                        {n.summary}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ── newsletter ────────────────────────────────────────────────── */}
      <section>
        <NewsletterSignup compact />
      </section>
    </aside>
  )
}
