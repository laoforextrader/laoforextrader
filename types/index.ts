export interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  category: string
  publishedAt: string
  readTime?: number
  featured?: boolean
  coverImage?: any
  body?: any[]
  author?: { name: string; slug?: { current: string } }
}

export interface Broker {
  _id: string
  name: string
  slug?: { current: string }
  rank?: number
  rating?: number
  logo?: any
  minDeposit?: string
  maxLeverage?: string
  laoDeposit?: boolean
  pros?: string[]
  cons?: string[]
  affiliateUrl?: string
  registerUrl?: string
  badge?: {
    text: string
    color: string
    show: boolean
  }
}

export interface MarketPrice {
  pair: string
  price: number
  change: number
  changePct: number
  changePercent?: number
  high?: number
  low?: number
}

export interface Comment {
  _id: string
  name: string
  content: string
  createdAt: string
  approved?: boolean
}

export interface Lesson {
  _id: string
  title: string
  slug: { current: string }
  readTime?: number
  order?: number
  body?: any[]
}
