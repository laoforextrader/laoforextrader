import { createClient } from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb"
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production"

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-04-25",
  useCdn:     true,
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
  featuredBrokers: `*[_type == "broker"] | order(rating desc) [0...6] {
    _id, name, slug, rating, logo, minDeposit, maxLeverage, laoDeposit, homepageUrl, registerUrl
  }`,
  brokerBySlug: (slug: string) => `
    *[_type == "broker" && slug.current == "${slug}"] [0] {
      _id, name, slug, rating, ratingBreakdown, logo, minDeposit, maxLeverage,
      laoDeposit, pros, cons, regulators, platforms, badge, excerpt, body,
      homepageUrl, registerUrl
    }
  `,
}
