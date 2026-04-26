// ===============================
// Core Types for laoforextrader
// ===============================

export interface Article {
  _id: string
  _type: "article"
  title: string
  slug: { current: string }
  excerpt: string
  body: PortableTextBlock[]
  category: "broker" | "education" | "news" | "analysis" | "ea-tools"
  coverImage?: SanityImage
  author: Author
  publishedAt: string
  readTime?: number
  featured?: boolean
  tags?: string[]
}

export interface Broker {
  _id: string
  _type: "broker"
  name: string
  slug: { current: string }
  logo?: SanityImage
  website: string
  rating: number
  ratingBreakdown: {
    stability: number
    deposit:   number
    spread:    number
    support:   number
    promotion: number
  }
  pros: string[]
  cons: string[]
  minDeposit: string
  maxLeverage: string
  regulators: string[]
  platforms: string[]
  laoDeposit: boolean  // รองรับฝากเงินกีบ
  featured?: boolean
  badge?: "recommended" | "new" | "top"
  excerpt: string
  body: PortableTextBlock[]
}

export interface Author {
  _id: string
  name: string
  slug: { current: string }
  image?: SanityImage
  bio?: string
}

export interface SanityImage {
  _type: "image"
  asset: { _ref: string; _type: "reference" }
  alt?: string
}

export interface PortableTextBlock {
  _type: string
  _key: string
  [key: string]: unknown
}

export interface MarketPrice {
  pair: string
  price: number
  change: number
  changePercent: number
}

export interface Comment {
  id: string
  articleId: string
  authorName: string
  authorImage?: string
  body: string
  createdAt: string
  replies?: Comment[]
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
  bookmarks?: string[]
  createdAt: string
}
