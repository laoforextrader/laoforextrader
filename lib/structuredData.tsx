import type { Article } from "@/types"
import { urlFor } from "@/lib/sanity"

const SITE_URL = "https://www.laoforextrader.com"
const SITE_NAME = "LaoForexTrader"
const LOGO_URL = `${SITE_URL}/logo.png`

interface JsonLdNode {
  "@context": string
  "@type": string
  [k: string]: unknown
}

export function organizationLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
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
  const image = article.coverImage ? urlFor(article.coverImage).url() : `${SITE_URL}/og/_default.png`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.title,
    image,
    url,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "lo",
    author: {
      "@type": "Person",
      name: article.author?.name || "LFT Team",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
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
    itemReviewed: {
      "@type": "FinancialService",
      name: broker.name,
      url,
    },
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
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
