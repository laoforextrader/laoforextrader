import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { Article } from "@/types"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import PostEngagement from "@/components/sections/PostEngagement"
import { buildArticleMetadata } from "@/lib/articleMetadata"
import ReadingProgress from "@/components/ui/ReadingProgress"
import TableOfContents from "@/components/ui/TableOfContents"
import EASGrideCTA from "@/components/sections/EASGrideCTA"

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (!article) return { title: "Not found" }
  return buildArticleMetadata(article, `/ea-tools/${article.slug?.current ?? ""}`)
}

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p style={{ color: "#374151", lineHeight: 1.85, marginBottom: "1.1rem", fontSize: 15 }}>
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 style={{
        color: "#111827", fontWeight: 800, fontSize: "1.35rem",
        marginTop: "2.5rem", marginBottom: "1rem",
        paddingBottom: "0.5rem",
        borderBottom: "2px solid #E5E7EB",
        letterSpacing: "-0.02em"
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{
        color: "#1E3A8A", fontWeight: 700, fontSize: "1.1rem",
        marginTop: "1.8rem", marginBottom: "0.6rem",
        display: "flex", alignItems: "center", gap: 8
      }}>
        <span style={{
          width: 4, height: 18, background: "linear-gradient(180deg,#2563EB,#4F46E5)",
          borderRadius: 2, display: "inline-block", flexShrink: 0
        }} />
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{
        background: "#F8FAFF",
        borderLeft: "4px solid #2563EB",
        padding: "14px 18px",
        borderRadius: "0 10px 10px 0",
        margin: "1.5rem 0",
        color: "#374151",
        fontStyle: "italic",
        fontSize: 14,
        lineHeight: 1.75
      }}>
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul style={{
        paddingLeft: "0.5rem", marginBottom: "1.2rem",
        display: "flex", flexDirection: "column" as const, gap: 8
      }}>
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol style={{
        paddingLeft: "0.5rem", marginBottom: "1.2rem",
        display: "flex", flexDirection: "column" as const, gap: 8,
        counterReset: "item"
      }}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        color: "#374151", fontSize: 14, lineHeight: 1.7, listStyle: "none"
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#2563EB", flexShrink: 0, marginTop: 7
        }} />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }: any) => (
      <li style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        color: "#374151", fontSize: 14, lineHeight: 1.7,
        listStyle: "none", counterIncrement: "item"
      }}>
        <span style={{
          minWidth: 24, height: 24, borderRadius: "50%",
          background: "linear-gradient(135deg,#2563EB,#4F46E5)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1
        }}>
          {/* number handled by CSS counter */}
        </span>
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong style={{
        color: "#111827", fontWeight: 700,
        background: "linear-gradient(120deg, #DBEAFE 0%, #DBEAFE 100%)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 40%",
        backgroundPosition: "0 85%",
        padding: "0 2px"
      }}>
        {children}
      </strong>
    ),
    link: ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer"
        style={{ color: "#2563EB", textDecoration: "underline", fontWeight: 500 }}>
        {children}
      </a>
    ),
    code: ({ children }: any) => (
      <code style={{
        background: "#F3F4F6", color: "#1E3A8A",
        padding: "2px 6px", borderRadius: 4, fontSize: 13, fontFamily: "monospace"
      }}>
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }: any) => value?.asset?.url ? (
      <div style={{ margin: "24px 0" }}>
        <img src={value.asset.url} alt={value.alt || ""}
          style={{ width: "100%", borderRadius: 12, border: "1px solid #E2E6F0" }} />
        {value.caption && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
            {value.caption}
          </p>
        )}
      </div>
    ) : null,
  },
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (!article) notFound()

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <ReadingProgress />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>

        <Link href="/ea-tools"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 13, textDecoration: "none", marginBottom: 20, fontWeight: 500 }}>
          <ArrowLeft size={13} /> ກັບໄປໜ້າ EA & Tools
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 14, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          {article.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#9CA3AF", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E5E7EB", flexWrap: "wrap" }}>
          {article.author && <span style={{ color: "#374151", fontWeight: 500 }}>{article.author.name}</span>}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{formatDate(article.publishedAt)}</span>
          {article.readTime && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{article.readTime} ນາທີ</span>}
        </div>

        {article.excerpt && (
          <div style={{ background: "#F9FAFB", borderLeft: "3px solid #BFCFFF", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 24, color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
            {article.excerpt}
          </div>
        )}

        <TableOfContents />

        <div className="article-body">
          {article.body && <PortableText value={article.body} components={ptComponents} />}
        </div>

        <PostEngagement
          postId={article._id}
          postTitle={article.title}
          postUrl={`https://laoforextrader.com/ea-tools/${article.slug?.current ?? ""}`}
        />

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <Link href="/ea-tools" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563EB", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            <ArrowLeft size={13} /> ກັບໄປໜ້າ EA & Tools
          </Link>
        </div>
      </div>

      <EASGrideCTA />
    </div>
  )
}
