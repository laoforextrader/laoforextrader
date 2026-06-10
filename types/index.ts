export interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  category: string
  publishedAt: string
  readTime?: number
  featured?: boolean
  views?: number
  coverImage?: any
  body?: any[]
  author?: { name: string; slug?: { current: string } }
  adsBanner?: {
    show: boolean
    html: string
    position: 'middle' | 'bottom' | 'both'
  }
  ctas?: Array<{
    _key?: string
    type?:
      | 'ea-sgride'
      | 'ea-megihgedge'
      | 'ea-abs'
      | 'broker-xm'
      | 'broker-exness'
      | 'broker-markets4you'
      | 'broker-vantage'
      | 'broker-interstellar'
      | 'broker-iux'
  }>
  featuredQuiz?: {
    _id: string
    title: string
    slug: string
    level: 'basic' | 'intermediate' | 'advanced'
    requiresLogin: boolean
    totalQuestions: number
    icon: string
  }
  quizPosition?: 'inline' | 'sidebar' | 'both'
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

export interface QuizChoice {
  a: string
  b: string
  c: string
}

export interface QuizQuestion {
  _key: string
  question: string
  choices: QuizChoice
  correctAnswer: 'a' | 'b' | 'c'
}

export interface Quiz {
  _id: string
  title: string
  slug: string
  level: 'basic' | 'intermediate' | 'advanced'
  requiresLogin: boolean
  order: number
  icon: string
  color: string
  totalQuestions: number
  questions: QuizQuestion[]
}

export interface QuizSummary {
  _id: string
  title: string
  slug: string
  level: 'basic' | 'intermediate' | 'advanced'
  requiresLogin: boolean
  totalQuestions: number
  icon: string
}

export interface EAStats {
  _id: string
  eaId: string
  title: string
  updateMode: 'off' | 'daily' | 'realtime'
  account?: string
  server?: string
  broker?: string
  currency?: string
  balance?: number
  equity?: number
  startBalance?: number
  profitTotal?: number
  profitTotalPct?: number
  monthlyReturns?: Array<{ _key?: string; month: string; profitPct: number }>
  dailyReturns?: Array<{ _key?: string; date: string; profitPct: number }>
  lastUpdate?: string
}
