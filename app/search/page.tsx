import Link from "next/link"
import { Suspense } from "react"
import { sanityClient } from "@/lib/sanity"
import { categoryRoute } from "@/lib/utils"
import { SearchPageInput } from "./SearchPageInput"

export const revalidate = 60

interface Props {
  searchParams: Promise<{ q?: string }>
}

interface Hit {
  _id: string
  type: "article" | "broker" | "quiz"
  title: string
  url: string
  excerpt?: string
  category?: string
}

const TYPE_LABEL: Record<string, string> = {
  article: "ບົດຄວາມ",
  broker:  "Broker",
  quiz:    "Quiz",
}

const CATEGORY_LABEL: Record<string, string> = {
  education: "ການສຶກສາ",
  "ea-tools": "EA / Tools",
  broker:    "ລີວິວ Broker",
  analysis:  "ວິເຄາະ",
  news:      "ຂ່າວ",
}

async function search(q: string): Promise<Hit[]> {
  const term = q + "*"
  try {
    const [articles, brokers, quizzes] = await Promise.all([
      sanityClient.fetch<any[]>(
        `*[_type == "article" && (title match $term || excerpt match $term || pt::text(body) match $term)]
          | order(publishedAt desc) [0...50] {
            _id, title, "slug": slug.current, excerpt, category
          }`,
        { term },
      ),
      sanityClient.fetch<any[]>(
        `*[_type == "broker" && (name match $term || excerpt match $term || pt::text(body) match $term)]
          | order(coalesce(rank, 999) asc) [0...50] {
            _id, "title": name, "slug": slug.current, excerpt
          }`,
        { term },
      ),
      sanityClient.fetch<any[]>(
        `*[_type == "quiz" && title match $term] | order(coalesce(order, 999) asc) [0...50] {
          _id, title, "slug": coalesce(slug.current, slug)
        }`,
        { term },
      ),
    ])

    const out: Hit[] = []
    for (const a of articles || []) {
      const route = a.category === "education" ? "lessons" : categoryRoute(a.category || "")
      out.push({
        _id: a._id, type: "article", title: a.title,
        url: `/${route}/${a.slug ?? ""}`, excerpt: a.excerpt, category: a.category,
      })
    }
    for (const b of brokers || []) {
      out.push({
        _id: b._id, type: "broker", title: b.title,
        url: `/broker/${b.slug ?? ""}`, excerpt: b.excerpt,
      })
    }
    for (const z of quizzes || []) {
      out.push({
        _id: z._id, type: "quiz", title: z.title,
        url: `/quiz/${z.slug ?? ""}`,
      })
    }
    return out
  } catch {
    return []
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams
  const title = q ? `ຄົ້ນຫາ "${q}" | LaoForexTrader` : "ຄົ້ນຫາ | LaoForexTrader"
  return { title, robots: { index: false } }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams
  const trimmed = q.trim()
  const results = trimmed.length >= 2 ? await search(trimmed) : []

  return (
    <div className="bg-white min-h-[80vh]">
      <div className="max-w-[1060px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-sans font-extrabold text-[28px] tracking-tight text-gray-900 mb-3">
            ຄົ້ນຫາ
          </h1>
          <Suspense fallback={null}>
            <SearchPageInput initial={trimmed} />
          </Suspense>
        </div>

        {trimmed.length < 2 ? (
          <div className="py-12 text-center text-gray-400 font-lao text-sm">
            ພິມຢ່າງໜ້ອຍ 2 ຕົວອັກສອນເພື່ອເລີ່ມຄົ້ນຫາ
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-[40px] mb-3">🔍</div>
            <div className="font-lao text-base text-gray-700 mb-1">
              ບໍ່ພົບຜົນຄົ້ນຫາ "<span className="font-semibold">{trimmed}</span>"
            </div>
            <div className="font-lao text-xs text-gray-400">
              ລອງຄຳອື່ນ ຫຼື ຄຳສັ້ນກວ່າ
            </div>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              ພົບ {results.length} ຜົນ
            </div>
            <ul className="flex flex-col gap-3">
              {results.map(r => (
                <li key={r._id}>
                  <Link
                    href={r.url}
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                      <span className={
                        r.type === "broker" ? "text-blue-600"
                        : r.type === "quiz" ? "text-purple-600"
                        : "text-amber-600"
                      }>
                        {TYPE_LABEL[r.type]}
                      </span>
                      {r.category && CATEGORY_LABEL[r.category] && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-500">{CATEGORY_LABEL[r.category]}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-lao text-[16px] font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                      {r.title}
                    </h2>
                    {r.excerpt && (
                      <p className="font-lao text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                        {r.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
