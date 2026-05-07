// Section 3 — Hot Story horizontal cards: image LEFT, title + summary RIGHT.
// Click → /news/hot/[id] for the article-style detail page.

import Link from "next/link"

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
    <section className="mb-10">
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1 flex items-center gap-1.5">
          🔥 News / Hot Story
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
            className="group flex bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
          >
            {/* Image LEFT — square */}
            <div className="flex-shrink-0 w-[140px] h-[140px] bg-gray-100 overflow-hidden">
              {item.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#FFF7ED,#FEE2E2)" }}
                >
                  <span className="text-[36px] opacity-60">📰</span>
                </div>
              )}
            </div>

            {/* Content RIGHT — title + summary stacked */}
            <div className="flex-1 min-w-0 p-4 flex flex-col">
              <h3 className="font-lao text-[15px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-snug mb-1.5 line-clamp-2">
                {item.title}
              </h3>
              {item.summary && (
                <p className="font-lao text-[12px] text-gray-600 leading-relaxed line-clamp-3 flex-1">
                  {item.summary}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-2">
                <span>ອ່ານຕໍ່</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
