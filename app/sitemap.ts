import { MetadataRoute } from "next"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { Article, Broker } from "@/types"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = "https://laoforextrader.com"

  const [articles, brokers] = await Promise.all([
    sanityClient.fetch<Article[]>(QUERIES.latestArticles(100)),
    sanityClient.fetch<Broker[]>(QUERIES.allBrokers),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/broker`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/education`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/news`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/analysis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/tools/pip-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${BASE}/${a.category}/${a.slug.current}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const brokerRoutes: MetadataRoute.Sitemap = brokers.map(b => ({
    url: `${BASE}/broker/${b.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...articleRoutes, ...brokerRoutes]
}
