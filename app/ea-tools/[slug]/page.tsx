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

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug))
  if (!article) return { title: "Not found" }
  return buildArticleMetadata(article, `/ea-tools/${article.slug?.current ?? ""}`)
}

const ptComponents = {
  block: {
    normal:     ({ children }: any) => <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: "1rem", fontSize: 15 }}>{children}</p>,
    h2:         ({ children }: any) => <h2 style={{ color: "#111827", fontWeight: 700, fontSize: "1.4rem", marginTop: "2rem", marginBottom: "0.8rem", paddingBottom: "0.5rem", borderBottom: "1px solid #E5E7EB" }}>{children}</h2>,
    h3:         ({ children }: any) => <h3 style={{ color: "#111827", fontWeight: 600, fontSize: "1.15rem", marginTop: "1.5rem", marginBottom: "0.6rem" }}>{children}</h3>,
    blockquote: ({ children }: any) => <blockquote style={{ borderLeft: "3px solid #BFCFFF", paddingLeft: "1rem", color: "#6B7280", fontStyle: "italic", margin: "1.5rem 0" }}>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display:"flex", flexDirection:"column" as const, gap:6 }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem", listStyleType:"decimal", display:"flex", flexDirection:"column" as const, gap:6 }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ color: "#374151", fontSize: 14 }}>{children}</li>,
    number: ({ children }: any) => <li style={{ color: "#374151", fontSize: 14 }}>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ color: "#111827", fontWeight: 600 }}>{children}</strong>,
    link:   ({ value, children }: any) => <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", textDecoration: "underline" }}>{children}</a>,
  },
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug))
  if (!article) notFound()

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
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

        <div>
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
    </div>
  )
}
