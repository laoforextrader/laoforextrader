import Link from "next/link"
import { notFound } from "next/navigation"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { formatDateDDMMYYYY } from "@/lib/news/sources-shared"
import type { Metadata } from "next"

export const revalidate = 60

interface Props { params: Promise<{ id: string }> }

interface HotDoc {
  _id: string
  date: string
  item: {
    id: string
    title: string
    summary?: string
    detail?: string
    source?: string
    sourceTitle?: string
    imageUrl?: string
    pubDate?: string
  } | null
}

async function fetchDoc(id: string): Promise<HotDoc | null> {
  return sanityClient.fetch<HotDoc | null>(
    QUERIES.dailyUpdateByHotNewsId(id),
    { id },
    { next: { revalidate: 60 } },
  ).catch(() => null)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const doc = await fetchDoc(decodeURIComponent(id))
  return {
    title: doc?.item?.title ? `${doc.item.title} | LaoForexTrader` : "ຂ່າວ | LaoForexTrader",
    description: doc?.item?.summary?.slice(0, 160),
  }
}

export default async function HotNewsPage({ params }: Props) {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const doc = await fetchDoc(decoded)
  if (!doc || !doc.item) notFound()
  const item = doc.item

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div className="max-w-[760px] mx-auto px-6 py-8">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-blue-600 mb-5">
          ← ກັບໄປ ໜ້າຂ່າວ
        </Link>

        <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Cover image */}
          {item.imageUrl ? (
            <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: 280 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="relative w-full overflow-hidden flex items-center justify-center"
              style={{ height: 140, background: "linear-gradient(135deg,#FFF7ED,#FEE2E2)" }}
            >
              <div className="text-[60px] opacity-50">📰</div>
            </div>
          )}

          <div className="p-7 md:p-9">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3">
              <span className="text-orange-600">🔥 Hot Story</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{formatDateDDMMYYYY(doc.date)}</span>
            </div>

            <h1 className="font-sans font-extrabold text-[26px] md:text-[30px] tracking-tight text-gray-900 leading-tight mb-3">
              {item.title}
            </h1>
            {item.sourceTitle && (
              <div className="font-mono text-[11px] text-gray-400 mb-5 italic">
                Original: {item.sourceTitle}
              </div>
            )}

            {item.summary && (
              <div
                className="rounded-xl p-4 mb-5 italic"
                style={{ background: "#F9FAFB", borderLeft: "3px solid #2563EB" }}
              >
                <p className="font-lao text-[15px] text-gray-700 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            )}

            {item.detail && (
              <div className="font-lao text-[15px] text-gray-700 leading-[1.8] whitespace-pre-line mb-6">
                {item.detail}
              </div>
            )}

            {/* Source link */}
            {item.source && (
              <div className="border-t border-gray-100 pt-5">
                <a
                  href={item.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
                >
                  ເບິ່ງແຫຼ່ງຂ່າວຕົ້ນສະບັບ ↗
                </a>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 font-lao leading-relaxed">
                ⚠ ການແປ-ສະຫຼຸບສ້າງດ້ວຍ AI ຈາກແຫຼ່ງຂ່າວສາກົນ — ບໍ່ແມ່ນຄຳແນະນຳການລົງທຶນ.
              </p>
            </div>
          </div>
        </article>

        {/* Quick links */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <Link href="/news" className="text-[12px] font-bold uppercase tracking-widest text-blue-600 hover:underline">
            ← ໜ້າຂ່າວ
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/broker" className="text-[12px] font-bold uppercase tracking-widest text-blue-600 hover:underline">
            ເລືອກ Broker →
          </Link>
        </div>
      </div>
    </div>
  )
}
