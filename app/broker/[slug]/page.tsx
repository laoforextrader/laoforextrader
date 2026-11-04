import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { Article, Broker } from "@/types"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import PostEngagement from "@/components/sections/PostEngagement"
import { buildArticleMetadata, buildBrokerMetadata } from "@/lib/articleMetadata"
import { JsonLd, brokerReviewLd, breadcrumbLd, articleLd } from "@/lib/structuredData"
import BrokerAdsBanner from "@/components/ui/BrokerAdsBanner"
import CTASelector from "@/components/cta/CTASelector"
import BrokerReview from "@/components/broker/review/BrokerReview"

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const broker = await sanityClient.fetch(QUERIES.brokerBySlug(slug), {}, { next: { revalidate: 60 } })
  if (broker) return buildBrokerMetadata(broker, `/broker/${broker.slug?.current ?? slug}`)
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (article) return buildArticleMetadata(article, `/broker/${article.slug?.current ?? ""}`)
  return { title: "Not found" }
}

// ── Portable Text components ────────────────────────────────────────────────
const ptComponents = {
  block: {
    normal:     ({ children }: any) => <p style={{ color: "var(--fg-2)", lineHeight: 1.8, marginBottom: "1rem", fontSize: 15 }}>{children}</p>,
    h2:         ({ children }: any) => <h2 style={{ color: "var(--fg)", fontWeight: 700, fontSize: "1.4rem", marginTop: "2rem", marginBottom: "0.8rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--line-2)" }}>{children}</h2>,
    h3:         ({ children }: any) => <h3 style={{ color: "var(--fg)", fontWeight: 600, fontSize: "1.15rem", marginTop: "1.5rem", marginBottom: "0.6rem" }}>{children}</h3>,
    blockquote: ({ children }: any) => <blockquote style={{ borderLeft: "3px solid var(--accent-line)", paddingLeft: "1rem", color: "var(--fg-3)", fontStyle: "italic", margin: "1.5rem 0" }}>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column" as const, gap: 6 }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem", listStyleType: "decimal", display: "flex", flexDirection: "column" as const, gap: 6 }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ color: "var(--fg-2)", fontSize: 14 }}>{children}</li>,
    number: ({ children }: any) => <li style={{ color: "var(--fg-2)", fontSize: 14 }}>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ color: "var(--fg)", fontWeight: 600 }}>{children}</strong>,
    link:   ({ value, children }: any) => <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>{children}</a>,
  },
}

export default async function BrokerSlugPage({ params }: Props) {
  const { slug } = await params

  // ── Try broker profile first ───────────────────────────────────────────────
  const broker = await sanityClient.fetch(QUERIES.brokerBySlug(slug), {}, { next: { revalidate: 60 } })

  if (broker) {
    const path = `/broker/${broker.slug?.current ?? slug}`
    const all = await sanityClient.fetch<Broker[]>(QUERIES.allBrokers, {}, { next: { revalidate: 60 } })
    const versus = (all ?? [])
      .filter((b) => b.slug?.current && b.slug.current !== (broker.slug?.current ?? slug))
      .slice(0, 3)

    return (
      <>
        <JsonLd
          data={[
            brokerReviewLd(broker, path),
            breadcrumbLd([
              { name: "ໜ້າຫຼັກ", url: "/" },
              { name: "ໂບຣກເກີ", url: "/broker" },
              { name: broker.name, url: path },
            ]),
          ]}
        />
        <BrokerReview broker={broker} others={versus} />
        <div className="mx-auto max-w-[1100px] bg-bk-page px-4 pb-14 sm:px-6">
          <PostEngagement
            postId={broker._id}
            postTitle={`ລີວິວ ${broker.name}`}
            postUrl={`https://www.laoforextrader.com${path}`}
          />
        </div>
      </>
    )
  }

  // ── Fall back to article ───────────────────────────────────────────────────
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (!article) notFound()

  const articlePath = `/broker/${article.slug?.current ?? slug}`
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <JsonLd
        data={[
          articleLd(article, articlePath),
          breadcrumbLd([
            { name: "ໜ້າຫຼັກ", url: "/" },
            { name: "Broker", url: "/broker" },
            { name: article.title, url: articlePath },
          ]),
        ]}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>

        <Link href="/broker"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-3)", fontSize: 13, textDecoration: "none", marginBottom: 20, fontWeight: 500 }}>
          <ArrowLeft size={13} /> ກັບໄປໜ້າ Broker
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--fg)", marginBottom: 14, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          {article.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--fg-4)", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--line-2)", flexWrap: "wrap" }}>
          {article.author && <span style={{ color: "var(--fg-2)", fontWeight: 500 }}>{article.author.name}</span>}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{formatDate(article.publishedAt)}</span>
          {article.readTime && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{article.readTime} ນາທີ</span>}
        </div>

        {article.excerpt && (
          <div style={{ background: "var(--surface-2)", borderLeft: "3px solid var(--accent-line)", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 24, color: "var(--fg-2)", fontSize: 14, lineHeight: 1.7 }}>
            {article.excerpt}
          </div>
        )}

        {article.adsBanner?.show &&
         article.adsBanner?.html &&
         (article.adsBanner.position === 'middle' ||
          article.adsBanner.position === 'both') && (
          <BrokerAdsBanner html={article.adsBanner.html} />
        )}

        <div className="article-body">
          {article.body && <PortableText value={article.body} components={ptComponents} />}
        </div>

        {article.adsBanner?.show &&
         article.adsBanner?.html &&
         (article.adsBanner.position === 'bottom' ||
          article.adsBanner.position === 'both') && (
          <BrokerAdsBanner html={article.adsBanner.html} />
        )}

        {article.ctas?.map((c, i) => (
          c?.type ? <CTASelector key={c._key ?? i} type={c.type} /> : null
        ))}

        <PostEngagement
          postId={article._id}
          postTitle={article.title}
          postUrl={`https://www.laoforextrader.com/broker/${article.slug?.current ?? ""}`}
        />

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--line-2)" }}>
          <Link href="/broker" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            <ArrowLeft size={13} /> ກັບໄປໜ້າ Broker
          </Link>
        </div>
      </div>
    </div>
  )
}
