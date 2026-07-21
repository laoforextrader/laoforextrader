import type { MetadataRoute } from "next"
import { sanityClient } from "@/lib/sanity"

const BASE = "https://www.laoforextrader.com"

export const revalidate = 60

interface SanityArticle { slug?: { current?: string }; category?: string; publishedAt?: string }
interface SanityBroker  { slug?: { current?: string } }
interface SanityQuiz    { slug?: string | { current?: string } }
interface SanityEA      { eaId?: string; lastUpdate?: string }
interface SanityDaily   {
  date?: string
  topEvents?: { id?: string }[]
  hotNews?:   { id?: string }[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch every public-facing route source from Sanity in parallel.
  const [articles, brokers, eas, quizzes, dailies] = await Promise.all([
    sanityClient.fetch<SanityArticle[]>(
      `*[_type == "article" && defined(slug.current) && defined(category)]
        | order(publishedAt desc) { slug, category, publishedAt }`,
      {}, { next: { revalidate: 60 } },
    ),
    sanityClient.fetch<SanityBroker[]>(
      `*[_type == "broker" && defined(slug.current)] { slug }`,
      {}, { next: { revalidate: 60 } },
    ),
    sanityClient.fetch<SanityEA[]>(
      `*[_type == "eaStats" && updateMode != "off" && defined(eaId)] { eaId, lastUpdate }`,
      {}, { next: { revalidate: 60 } },
    ),
    sanityClient.fetch<SanityQuiz[]>(
      `*[_type == "quiz"] { slug }`,
      {}, { next: { revalidate: 60 } },
    ),
    // Last 30 days of daily updates — that's where /news/event/* and
    // /news/hot/* IDs come from. Older docs are typically archived from
    // discovery, so the cap keeps the sitemap focused on fresh content.
    sanityClient.fetch<SanityDaily[]>(
      `*[_type == "dailyUpdate"] | order(date desc)[0...30] {
        date, "topEvents": topEvents[]{id}, "hotNews": hotNews[]{id}
      }`,
      {}, { next: { revalidate: 60 } },
    ),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/broker`,            lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/lessons`,           lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/education`,         lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/news`,              lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/analysis`,          lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/tools`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tools/pip-calculator`,  lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/tools/lot-calculator`,  lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/tools/risk-reward`,     lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/tools/lot-curve-designer`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/ea`,                lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/ea-system`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ea-tools`,          lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/signal/trs-signal-pro`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/quiz`,              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`,             lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/contact`,           lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter(a => a.slug?.current && a.category)
    .map(a => ({
      url: `${BASE}/${a.category}/${a.slug!.current}`,
      lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  const brokerRoutes: MetadataRoute.Sitemap = brokers
    .filter(b => b.slug?.current)
    .map(b => ({
      url: `${BASE}/broker/${b.slug!.current}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

  const eaRoutes: MetadataRoute.Sitemap = eas
    .filter(e => e.eaId)
    .map(e => ({
      url: `${BASE}/ea/${e.eaId}`,
      lastModified: e.lastUpdate ? new Date(e.lastUpdate) : now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }))

  const quizRoutes: MetadataRoute.Sitemap = quizzes
    .map(q => typeof q.slug === "string" ? q.slug : q.slug?.current)
    .filter((s): s is string => !!s)
    .map(s => ({
      url: `${BASE}/quiz/${s}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))

  const dailyEventRoutes: MetadataRoute.Sitemap = dailies.flatMap(d => {
    const lastMod = d.date ? new Date(d.date) : now
    const eventIds = (d.topEvents ?? []).map(e => e.id).filter((s): s is string => !!s)
    const hotIds   = (d.hotNews ?? []).map(h => h.id).filter((s): s is string => !!s)
    return [
      ...eventIds.map(id => ({
        url: `${BASE}/news/event/${encodeURIComponent(id)}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...hotIds.map(id => ({
        url: `${BASE}/news/hot/${encodeURIComponent(id)}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]
  })

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...brokerRoutes,
    ...eaRoutes,
    ...quizRoutes,
    ...dailyEventRoutes,
  ]
}
