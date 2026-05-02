import type { Metadata } from "next"
import { Article } from "@/types"

const SITE_URL  = "https://laoforextrader.com"
const SITE_NAME = "LaoForexTrader"

export function buildArticleMetadata(article: Article, pathname: string): Metadata {
  const url  = `${SITE_URL}${pathname.startsWith("/") ? pathname : "/" + pathname}`
  const desc = article.excerpt ?? ""

  return {
    title:       article.title,
    description: desc,
    alternates:  { canonical: url },
    openGraph: {
      title:       article.title,
      description: desc,
      url,
      siteName:    SITE_NAME,
      type:        "article",
      locale:      "lo_LA",
      publishedTime: article.publishedAt,
      authors:     [article.author?.name || "LFT Team"],
    },
    twitter: {
      card:        "summary_large_image",
      title:       article.title,
      description: desc,
    },
  }
}

export function buildBrokerMetadata(broker: any, pathname: string): Metadata {
  const url   = `${SITE_URL}${pathname.startsWith("/") ? pathname : "/" + pathname}`
  const title = `ລີວິວ ${broker.name} | ${SITE_NAME}`
  const desc  = broker?.excerpt ?? `ລີວິວ ${broker.name} ຝາກຂັ້ນຕ່ຳ $${broker?.minDeposit ?? "—"}`

  return {
    title,
    description: desc,
    alternates:  { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName:    SITE_NAME,
      type:        "website",
      locale:      "lo_LA",
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: desc,
    },
  }
}
