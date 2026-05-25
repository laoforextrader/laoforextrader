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
  allActiveEAs: `
    *[_type == "eaStats" && updateMode != "off"] | order(coalesce(profitTotalPct, 0) desc) {
      _id, eaId, title, updateMode,
      account, server, broker, currency,
      balance, equity, startBalance, profitTotal, profitTotalPct,
      monthlyReturns[] { _key, month, profitPct },
      dailyReturns[] { _key, date, profitPct },
      lastUpdate
    }
  `,
  eaStatsByEaId: (eaId: string) => `
    *[_type == "eaStats" && eaId == "${eaId}"][0] {
      _id, eaId, title, updateMode,
      account, server, broker, currency,
      balance, equity, startBalance, profitTotal, profitTotalPct,
      monthlyReturns[] { _key, month, profitPct },
      dailyReturns[] { _key, date, profitPct },
      lastUpdate
    }
  `,
  popularArticles: (limit = 6) => `
    *[_type == "article" && category != "broker"]
      | order(coalesce(views, 0) desc, publishedAt desc) [0...${limit}] {
        _id, title, slug, excerpt, category, publishedAt, readTime, views,
        coverImage { asset->{ url } }
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
      _id, title, slug, excerpt, category, publishedAt, readTime, coverImage, body, author->{ name, slug },
      adsBanner { show, html, position },
      ctas[] { _key, type },
      featuredQuiz->{ _id, title, slug, level, requiresLogin, totalQuestions, icon },
      quizPosition
    }
  `,
  allQuizzes: `*[_type == "quiz"] | order(coalesce(order, 999) asc) {
    _id, title, slug, level, requiresLogin, order, icon, color, totalQuestions
  }`,
  quizBySlug: (slug: string) => `
    *[_type == "quiz" && (slug == "${slug}" || slug.current == "${slug}")] [0] {
      _id, title, slug, level, requiresLogin, order, icon, color, totalQuestions,
      questions[] {
        _key, question,
        choices { a, b, c },
        correctAnswer
      }
    }
  `,
  latestByCategory: `{
    "featured": *[_type == "article" && category != "broker"]
      | order(coalesce(featured, false) desc, publishedAt desc) [0] {
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
  latestDailyUpdate: `*[_type == "dailyUpdate"] | order(date desc) [0] {
    _id, date, dailySummary,
    topEvents[]{ _key, id, nameLao, nameEn, currency, country, time, timeISO, impact, forecast, previous, description, analysis, tradingGuidance },
    calendarHighlights[]{ _key, name, time, impact, description },
    hotNews[]{ _key, id, title, summary, detail, source, sourceTitle, imageUrl, pubDate },
    technical[]{ _key, symbol, trend, bias, support, resistance, analysis },
    rawCalendar[]{ _key, event, time, impact, forecast, previous, actual, country },
    hasHighImpact, lineMessage, createdAt
  }`,
  dailyUpdateByDate: (date: string) => `
    *[_type == "dailyUpdate" && date == "${date}"][0] {
      _id, date, dailySummary,
      topEvents[]{ _key, id, nameLao, nameEn, currency, country, time, timeISO, impact, forecast, previous, description, analysis, tradingGuidance },
      calendarHighlights[]{ _key, name, time, impact, description },
      hotNews[]{ _key, id, title, summary, detail, source, sourceTitle, imageUrl, pubDate },
      technical[]{ _key, symbol, trend, bias, support, resistance, analysis },
      rawCalendar[]{ _key, event, time, impact, forecast, previous, actual, country },
      hasHighImpact, lineMessage, createdAt
    }
  `,
  // Find which dailyUpdate contains a given event id (id is "<date>-<slug>")
  dailyUpdateByEventId: (id: string) => `
    *[_type == "dailyUpdate" && $id in topEvents[].id][0] {
      _id, date,
      "event": topEvents[id == $id][0],
      technical[]{ symbol, trend, bias, support, resistance, analysis }
    }
  `,
  dailyUpdateByHotNewsId: (id: string) => `
    *[_type == "dailyUpdate" && $id in hotNews[].id][0] {
      _id, date,
      "item": hotNews[id == $id][0]
    }
  `,
}
