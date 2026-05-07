// Section 3 — 2 hot news cards. Click → /news/hot/[id] for the
// article-style detail page. Renders source image when available.

import Link from "next/link"
import Image from "next/image"

export interface HotNewsItem {
  _key?: string
  id: string
  title: string
  summary?: string
  detail?: string
  source?: string
  sourceTitle?: string
  imageUrl?: string
  pubDate?: string
}

export default function HotNewsSection({ items }: { items: HotNewsItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-12">
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1 flex items-center gap-1.5">
          🔥 Hot Story
        </div>
        <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
          ຂ່າວສຳຄັນຂອງມື້
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.slice(0, 2).map(item => (
          <Link
            key={item._key ?? item.id}
            href={`/news/hot/${encodeURIComponent(item.id)}`}
            className="group block bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all"
          >
            {item.imageUrl ? (
              <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: 180 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="relative w-full overflow-hidden flex items-center justify-center"
                style={{ height: 100, background: "linear-gradient(135deg,#FFF7ED,#FEE2E2)" }}
              >
                <div className="text-[40px] opacity-60">📰</div>
              </div>
            )}
            <div className="p-5">
              <h3 className="font-lao text-[18px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug mb-2 line-clamp-2">
                {item.title}
              </h3>
              {item.summary && (
                <p className="font-lao text-[13px] text-gray-600 leading-relaxed line-clamp-3 mb-3">
                  {item.summary}
                </p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="font-bold uppercase tracking-widest text-orange-600">
                  ອ່ານຕໍ່
                </span>
                <span className="text-gray-300">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
