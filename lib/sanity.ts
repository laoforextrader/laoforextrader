import { createClient } from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb"
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production"

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-04-25",
  useCdn:     false,
})

const builder = imageUrlBuilder(sanityClient)
export function urlFor(source: any) {
  return builder.image(source)
}

export const QUERIES = {
  latestArticles: (limit = 10) => `
    *[_type == "article"] | order(publishedAt desc) [0...${limit}] {
      _id, title, slug, excerpt, category, publishedAt, readTime, featured,
      coverImage, author->{ name, slug }
    }
  `,
  featuredArticle: `*[_type == "article" && featured == true] | order(publishedAt desc) [0] {
    _id, title, slug, excerpt, category, publishedAt, readTime, coverImage, author->{ name, slug }
  }`,
  articlesByCategory: (category: string, limit = 20) => `
    *[_type == "article" && category == "${category}"] | order(publishedAt desc) [0...${limit}] {
      _id, title, slug, excerpt, category, publishedAt, readTime, coverImage, author->{ name, slug }
    }
  `,
  articleBySlug: (slug: string) => `
    *[_type == "article" && slug.current == "${slug}"] [0] {
      _id, title, slug, excerpt, category, publishedAt, readTime, coverImage, body, author->{ name, slug }
    }
  `,
  latestByCategory: `{
    "featured": *[_type == "article" && category != "broker"]
      | order(publishedAt desc) [0] {
        _id, title, slug, excerpt, category, publishedAt, readTime,
        coverImage { asset->{ url } }
      },
    "education": *[_type == "article" && category == "education"]
      | order(publishedAt desc) [0] {
        _id, title, slug, excerpt, category, publishedAt, readTime,
        coverImage { asset->{ url } }
      },
    "ea-tools": *[_type == "article" && category == "ea-tools"]
      | order(publishedAt desc) [0] {
        _id, title, slug, excerpt, category, publishedAt, readTime,
        coverImage { asset->{ url } }
      },
    "analysis": *[_type == "article" && category == "analysis"]
      | order(publishedAt desc) [0] {
        _id, title, slug, excerpt, category, publishedAt, readTime,
        coverImage { asset->{ url } }
      },
    "news": *[_type == "article" && category == "news"]
      | order(publishedAt desc) [0] {
        _id, title, slug, excerpt, category, publishedAt, readTime,
        coverImage { asset->{ url } }
      }
  }`,
  featuredBrokers: `*[_type == "broker"] | order(coalesce(rank, 999) asc, rating desc) [0...6] {
    _id, name, slug, rank, rating, minDeposit, maxLeverage, laoDeposit, affiliateUrl, registerUrl,
    logo { asset->{ url }, alt, hotspot, crop },
    badge { text, color, show }
  }`,
  brokerBySlug: (slug: string) => `
    *[_type == "broker" && slug.current == "${slug}"] [0] {
      _id, name, slug, rank, rating, ratingBreakdown, minDeposit, maxLeverage,
      laoDeposit, pros, cons, regulators, platforms, excerpt, body,
      affiliateUrl, registerUrl,
      logo { asset->{ url }, alt, hotspot, crop },
      badge { text, color, show }
    }
  `,
}
