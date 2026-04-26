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
  rating?: number
  logo?: any
  minDeposit?: string
  maxLeverage?: string
  laoDeposit?: boolean
  pros?: string[]
  cons?: string[]
}

export interface MarketPrice {
  pair: string
  price: number
  change: number
  changePercent: number
}
