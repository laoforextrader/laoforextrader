import type { Metadata } from "next"
import { urlFor } from "@/lib/sanity"

import { Article } from "@/types"

const SITE_URL  = "https://www.laoforextrader.com"
const SITE_NAME = "LaoForexTrader"
const OG_IMAGE_VERSION = 5

export function buildArticleMetadata(article: Article, pathname: string): Metadata {
  const path = pathname.startsWith("/") ? pathname : "/" + pathname
  const url  = `${SITE_URL}${path}`
  const coverUrl = article.coverImage ? urlFor(article.coverImage).url() : undefined
  const fallbackOg = `${SITE_URL}${path}/opengraph-image?v=${OG_IMAGE_VERSION}`
  const imageUrl = coverUrl ?? fallbackOg
  const desc = article.excerpt || article.title

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
      images: [{ url: imageUrl, width: 1200, height: 630, type: "image/png" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       article.title,
      description: desc,
      images:      [imageUrl],
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
