import type { Article } from "@/types"
import { urlFor } from "@/lib/sanity"

const SITE_URL = "https://www.laoforextrader.com"
const SITE_NAME = "LaoForexTrader"
// Until a dedicated logo asset is committed under /public, reuse the
// default OG image which is already 1200x630 and known to exist —
// Google's logo validator fails the whole Article schema if the URL
// 404s, which surfaces as a generic "missing url" error.
const LOGO_URL = `${SITE_URL}/og/_default.png`
const LOGO_W = 1200
const LOGO_H = 630
const DEFAULT_OG = `${SITE_URL}/og/_default.png`

interface JsonLdNode {
  "@context": string
  "@type": string
  [k: string]: unknown
}

const PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: LOGO_URL, width: LOGO_W, height: LOGO_H },
}

export function organizationLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: LOGO_W, height: LOGO_H },
    description: "ລີວິວ Broker, ຄວາມຮູ້ການເທຣດ, ວິເຄາະຕະຫຼາດ ສຳລັບ Trader ລາວ",
    sameAs: [
      "https://www.facebook.com/laoforextrader",
      "https://line.me/R/ti/p/@499dvtuz",
    ],
  }
}

export function websiteLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "lo",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
}

export function articleLd(article: Article, pathname: string): JsonLdNode {
  const url = `${SITE_URL}${pathname.startsWith("/") ? pathname : "/" + pathname}`
  const imageUrl = article.coverImage ? urlFor(article.coverImage).url() : DEFAULT_OG
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.title,
    image: { "@type": "ImageObject", url: imageUrl, width: 1200, height: 630 },
    url,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "lo",
    author: {
      "@type": "Person",
      name: article.author?.name || "LFT Team",
      url: SITE_URL,
    },
    publisher: PUBLISHER,
    // Use a string URL rather than a WebPage object — the @id-only form
    // Google flagged as missing a `url` field on some testers.
    mainEntityOfPage: url,
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbLd(items: BreadcrumbItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
    })),
  }
}

export function brokerReviewLd(broker: {
  name: string
  rating?: number
  excerpt?: string
  slug?: { current?: string }
}, pathname: string): JsonLdNode {
  const url = `${SITE_URL}${pathname.startsWith("/") ? pathname : "/" + pathname}`
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Review",
    url,
    name: `ລີວິວ ${broker.name}`,
    itemReviewed: {
      "@type": "FinancialService",
      name: broker.name,
      url,
    },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: PUBLISHER,
    description: broker.excerpt || `ລີວິວ ${broker.name}`,
  }
  if (typeof broker.rating === "number" && broker.rating > 0) {
    node.reviewRating = {
      "@type": "Rating",
      ratingValue: broker.rating,
      bestRating: 5,
      worstRating: 1,
    }
  }
  return node
}

/** Render a JSON-LD <script> tag. Use inside server components. */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
