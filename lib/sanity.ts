import { createClient } from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"
import type { SanityImage } from "@/types"

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-04-25",
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImage) {
  return builder.image(source)
}

export const QUERIES = {
  latestArticles: (limit = 10) => `
    *[_type == "article"] | order(publishedAt desc) [0...${limit}] {
      _id, title, slug, excerpt, category,
      coverImage, publishedAt, readTime, featured,
      "author": author->{ name, image }
    }
  `,
  featuredArticle: `
    *[_type == "article" && featured == true] | order(publishedAt desc) [0] {
      _id, title, slug, excerpt, category,
      coverImage, publishedAt, readTime,
      "author": author->{ name, image }
    }
  `,
  articlesByCategory: (category: string, limit = 20) => `
    *[_type == "article" && category == "${category}"] | order(publishedAt desc) [0...${limit}] {
      _id, title, slug, excerpt, category,
      coverImage, publishedAt, readTime,
      "author": author->{ name, image }
    }
  `,
  articleBySlug: (slug: string) => `
    *[_type == "article" && slug.current == "${slug}"] [0] {
      _id, title, slug, excerpt, category, body,
      coverImage, publishedAt, readTime, tags,
      "author": author->{ name, image, bio }
    }
  `,
  allBrokers: `
    *[_type == "broker"] | order(rating desc) {
      _id, name, slug, logo, rating,
      ratingBreakdown, minDeposit, maxLeverage,
      regulators, platforms, laoDeposit,
      featured, badge, excerpt
    }
  `,
  brokerBySlug: (slug: string) => `
    *[_type == "broker" && slug.current == "${slug}"] [0] {
      _id, name, slug, logo, website, rating,
      ratingBreakdown, pros, cons,
      minDeposit, maxLeverage, regulators,
      platforms, laoDeposit, badge, excerpt, body
    }
  `,
  featuredBrokers: `
    *[_type == "broker" && featured == true] | order(rating desc) [0...5] {
      _id, name, slug, logo, rating, badge
    }
  `,
}
