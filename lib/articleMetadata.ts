import type { Metadata } from "next"
import { urlFor } from "@/lib/sanity"

import { Article } from "@/types"

const SITE_URL  = "https://www.laoforextrader.com"
const SITE_NAME = "LaoForexTrader"
const FALLBACK_OG = `${SITE_URL}/og/_default.png`

function articleOgUrl(article: Article): string {
  const slug = article.slug?.current
  const cat  = article.category
  if (!slug || !cat) return FALLBACK_OG
  return `${SITE_URL}/og/${cat}/${slug}.png`
}

export function buildArticleMetadata(article: Article, pathname: string): Metadata {
  const path = pathname.startsWith("/") ? pathname : "/" + pathname
  const url  = `${SITE_URL}${path}`
  const coverUrl = article.coverImage ? urlFor(article.coverImage).url() : undefined
  const imageUrl = coverUrl ?? articleOgUrl(article)
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
  // Bare title: the root layout template appends " | LaoForexTrader".
  // og:/twitter: get no template, so they carry the suffix themselves.
  const title   = `ລີວິວ ${broker.name}`
  const ogTitle = `${title} | ${SITE_NAME}`
  const desc  = broker?.excerpt ?? `ລີວິວ ${broker.name} ຝາກຂັ້ນຕ່ຳ $${broker?.minDeposit ?? "—"}`
  const slug  = broker?.slug?.current
  const imageUrl = slug ? `${SITE_URL}/og/broker/${slug}.png` : FALLBACK_OG

  return {
    title,
    description: desc,
    alternates:  { canonical: url },
    openGraph: {
      title:       ogTitle,
      description: desc,
      url,
      siteName:    SITE_NAME,
      type:        "website",
      locale:      "lo_LA",
      images: [{ url: imageUrl, width: 1200, height: 630, type: "image/png" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       ogTitle,
      description: desc,
      images:      [imageUrl],
    },
  }
}
