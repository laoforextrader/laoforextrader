import { NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity"
import { categoryRoute } from "@/lib/utils"

export const runtime = "nodejs"
export const revalidate = 60

export interface SearchResult {
  _id: string
  type: "article" | "broker" | "quiz"
  title: string
  slug: string
  excerpt?: string
  category?: string
  url: string
  // For brokers
  rating?: number
  // For quizzes
  level?: string
  totalQuestions?: number
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get("q") || "").trim()
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)))

  if (q.length < 2) {
    return NextResponse.json({ results: [], query: q })
  }

  // Build prefix-match query — Sanity's match supports * suffix
  const term = q + "*"

  try {
    // Articles + brokers + quizzes search via GROQ
    const [articles, brokers, quizzes] = await Promise.all([
      sanityClient.fetch<any[]>(
        `*[_type == "article" && (title match $term || excerpt match $term || pt::text(body) match $term)]
          | order(publishedAt desc) [0...${limit}] {
            _id, title, "slug": slug.current, excerpt, category
          }`,
        { term },
      ),
      sanityClient.fetch<any[]>(
        `*[_type == "broker" && (name match $term || excerpt match $term || pt::text(body) match $term)]
          | order(coalesce(rank, 999) asc) [0...${limit}] {
            _id, "title": name, "slug": slug.current, excerpt, rating
          }`,
        { term },
      ),
      sanityClient.fetch<any[]>(
        `*[_type == "quiz" && title match $term] | order(coalesce(order, 999) asc) [0...${limit}] {
          _id, title, "slug": coalesce(slug.current, slug), level, totalQuestions
        }`,
        { term },
      ),
    ])

    const articleResults: SearchResult[] = (articles || []).map(a => {
      // Education articles are served at /lessons/<slug> on the public site
      const route = a.category === "education" ? "lessons" : categoryRoute(a.category || "")
      return {
        _id: a._id,
        type: "article" as const,
        title: a.title,
        slug: a.slug ?? "",
        excerpt: a.excerpt,
        category: a.category,
        url: `/${route}/${a.slug ?? ""}`,
      }
    })

    const brokerResults: SearchResult[] = (brokers || []).map(b => ({
      _id: b._id,
      type: "broker",
      title: b.title,
      slug: b.slug ?? "",
      excerpt: b.excerpt,
      rating: b.rating,
      url: `/broker/${b.slug ?? ""}`,
    }))

    const quizResults: SearchResult[] = (quizzes || []).map(q => ({
      _id: q._id,
      type: "quiz",
      title: q.title,
      slug: q.slug ?? "",
      level: q.level,
      totalQuestions: q.totalQuestions,
      url: `/quiz/${q.slug ?? ""}`,
    }))

    const results = [...articleResults, ...brokerResults, ...quizResults].slice(0, limit)
    return NextResponse.json({ results, query: q })
  } catch (e: any) {
    return NextResponse.json(
      { results: [], query: q, error: e?.message ?? "search failed" },
      { status: 500 },
    )
  }
}

