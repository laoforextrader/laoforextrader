import type { Metadata } from "next"
import { urlFor } from "./sanity"
import { Article } from "@/types"

const SITE_URL  = "https://laoforextrader.com"
const SITE_NAME = "LaoForexTrader"

export function buildArticleMetadata(article: Article, pathname: string): Metadata {
  const url      = `${SITE_URL}${pathname.startsWith("/") ? pathname : "/" + pathname}`
  const ogImage  = article.coverImage
    ? urlFor(article.coverImage).width(1200).height(630).fit("crop").url()
    : `${SITE_URL}/favicon.svg`
  const desc     = article.excerpt ?? ""

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       article.title,
      description: desc,
      images:      [ogImage],
    },
  }
}

export function buildBrokerMetadata(broker: any, pathname: string): Metadata {
  const url     = `${SITE_URL}${pathname.startsWith("/") ? pathname : "/" + pathname}`
  const ogImage = broker?.logo
    ? urlFor(broker.logo).width(1200).height(630).fit("crop").url()
    : `${SITE_URL}/favicon.svg`
  const title   = `ລີວິວ ${broker.name} | ${SITE_NAME}`
  const desc    = broker?.excerpt ?? `ລີວິວ ${broker.name} ຝາກຂັ້ນຕ່ຳ $${broker?.minDeposit ?? "—"}`

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: broker.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: desc,
      images:      [ogImage],
    },
  }
}
