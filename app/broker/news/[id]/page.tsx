// One broker-industry story, on our own page.
//
// The alternative was linking the headline straight out to Finance Magnates.
// That hands the reader to an English page we did not write and does not get
// them back — and the Lao summary, which is the thing that makes this useful
// to the audience, would never be read. So the item gets a page here, the
// original is one clearly-marked link away, and the page ends with somewhere
// to go next.
//
// Flat surface, same tokens as the rest of /broker.

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { JsonLd, breadcrumbLd } from "@/lib/structuredData"
import { newsRobots } from "@/lib/news/freshness"
import { formatDate } from "@/lib/utils"
import NewsNextStep from "@/components/news/NewsNextStep"
import type { BrokerNewsEntry } from "@/types"
import { newsImageSrc } from "@/lib/images/remote"

export const revalidate = 300

interface Props {
  params: Promise<{ id: string }>
}

interface Doc {
  date: string
  item: BrokerNewsEntry | null
}

const CATEGORY_LAO: Record<string, string> = {
  regulation: "ກົດລະບຽບ",
  expo: "ງານວົງການ",
  company: "ບໍລິສັດ",
  product: "ຜະລິດຕະພັນ",
}

async function fetchDoc(id: string): Promise<Doc | null> {
  return sanityClient
    .fetch<Doc | null>(QUERIES.brokerNewsByItemId, { id }, { next: { revalidate: 300 } })
    .catch(() => null)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const doc = await fetchDoc(decoded)
  const item = doc?.item
  if (!item) return { title: "ຂ່າວໂບຣກເກີ" }

  const canonical = `https://www.laoforextrader.com/broker/news/${encodeURIComponent(decoded)}`
  return {
    title: item.title,
    description: item.summary?.slice(0, 160),
    alternates: { canonical },
    // Same freshness rule as /news/hot: a story past the indexing window goes
    // noindex,follow rather than competing with the pages that still matter.
    robots: newsRobots(doc?.date),
    openGraph: {
      title: `${item.title} | LaoForexTrader`,
      description: item.summary?.slice(0, 160),
      url: canonical,
      type: "article",
      images: item.imageUrl ? [{ url: item.imageUrl }] : undefined,
    },
  }
}

export default async function BrokerNewsPage({ params }: Props) {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const doc = await fetchDoc(decoded)
  if (!doc?.item) notFound()
  const item = doc.item

  const img = newsImageSrc(item.imageUrl)
  const pub = item.pubDate && Number.isFinite(Date.parse(item.pubDate))
    ? formatDate(new Date(item.pubDate).toISOString())
    : null

  return (
    <div className="min-h-screen bg-bk-page">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "ໜ້າຫຼັກ", url: "/" },
            { name: "ໂບຣກເກີ", url: "/broker" },
            { name: item.title, url: `/broker/news/${decoded}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-[760px] px-4 pb-16 pt-8 sm:px-6 sm:pt-9">
        <nav aria-label="ເສັ້ນທາງ" className="mb-5 text-[15px] text-bk-muted">
          <Link href="/broker" className="inline-flex min-h-[40px] items-center text-bk-muted underline">
            ໂບຣກເກີ
          </Link>
          <span className="mx-2">›</span>
          <Link href="/broker#news" className="inline-flex min-h-[40px] items-center text-bk-muted underline">
            ຂ່າວວົງການ
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {item.category && (
            <span className="inline-flex shrink-0 items-center rounded-md border border-bk-line px-2 py-0.5 text-[11px] font-semibold text-bk-muted">
              {CATEGORY_LAO[item.category] ?? item.category}
            </span>
          )}
          {pub && <span className="text-[13px] text-bk-muted">{pub}</span>}
          {item.sourceName && (
            <>
              <span aria-hidden="true" className="text-[13px] text-bk-muted">·</span>
              <span className="text-[13px] text-bk-muted">{item.sourceName}</span>
            </>
          )}
        </div>

        <h1 className="lao-head m-0 mt-3 text-[28px] font-bold leading-[1.25] tracking-[-0.03em] text-bk-ink sm:text-[36px]">
          {item.title}
        </h1>

        {img && (
          // A plain <img>: the source is whatever domain the outlet uses, and
          // next/image needs every host allow-listed in advance.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            data-no-dim
            className="mt-6 aspect-[16/9] w-full rounded-bk border border-bk-line object-cover"
          />
        )}

        <p className="m-0 mt-6 text-[17px] leading-[1.8] text-bk-ink">{item.summary}</p>

        {item.brokers && item.brokers.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-bk-muted">ກ່ຽວຂ້ອງກັບ:</span>
            {item.brokers.map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-md border border-bk-line px-2 py-0.5 text-[12px] font-semibold text-bk-ink"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        <div className="mt-7 rounded-bk border border-bk-line p-4 sm:p-5">
          <p className="m-0 text-[13px] leading-[1.75] text-bk-muted">
            ຂໍ້ຄວາມຂ້າງເທິງເປັນການສະຫຼຸບເປັນພາສາລາວດ້ວຍ AI ຈາກລາຍງານຂອງ
            {item.sourceName ? ` ${item.sourceName}` : "ສຳນັກຂ່າວວົງການ"} — ບໍ່ແມ່ນການລາຍງານຂອງພວກເຮົາເອງ
            ແລະ ບໍ່ແມ່ນຄຳແນະນຳການລົງທຶນ. ກ່ອນຕັດສິນໃຈ ຄວນອ່ານຕົ້ນສະບັບ ແລະ ກວດກັບທະບຽນຂອງຜູ້ກຳກັບດູແລ.
          </p>
          {item.source && (
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] items-center text-sm font-semibold text-bk-ink underline decoration-bk-line underline-offset-4"
            >
              ອ່ານຕົ້ນສະບັບ{item.sourceName ? ` ທີ່ ${item.sourceName}` : ""} ↗
            </a>
          )}
          {item.sourceTitle && (
            <p className="m-0 mt-2 font-mono text-[12px] leading-relaxed text-bk-muted">
              {item.sourceTitle}
            </p>
          )}
        </div>

        <NewsNextStep seed={item.id} />

        <div className="mt-8 border-t border-bk-line pt-5">
          <Link
            href="/broker#news"
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink"
          >
            ← ຂ່າວວົງການໂບຣກເກີທັງໝົດ
          </Link>
        </div>
      </div>
    </div>
  )
}
