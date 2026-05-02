import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { Article } from "@/types"
import { ArrowLeft, ArrowRight, Clock, BookOpen } from "lucide-react"
import PostEngagement from "@/components/sections/PostEngagement"
import { buildArticleMetadata } from "@/lib/articleMetadata"

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (!article) return { title: "Not found" }
  return buildArticleMetadata(article, `/lessons/${article.slug?.current ?? ""}`)
}

const ptComponents = {
  block: {
    normal:     ({ children }: any) => <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: "1rem", fontSize: 15 }}>{children}</p>,
    h2:         ({ children }: any) => <h2 style={{ color: "#111827", fontWeight: 700, fontSize: "1.4rem", marginTop: "2rem", marginBottom: "0.8rem", paddingBottom: "0.5rem", borderBottom: "1px solid #E5E7EB" }}>{children}</h2>,
    h3:         ({ children }: any) => <h3 style={{ color: "#111827", fontWeight: 600, fontSize: "1.15rem", marginTop: "1.5rem", marginBottom: "0.6rem" }}>{children}</h3>,
    blockquote: ({ children }: any) => <blockquote style={{ borderLeft: "3px solid #BFCFFF", paddingLeft: "1rem", color: "#6B7280", fontStyle: "italic", margin: "1.5rem 0" }}>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column" as const, gap: 6 }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column" as const, gap: 6, listStyleType: "decimal" }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ color: "#374151", fontSize: 14 }}>{children}</li>,
    number: ({ children }: any) => <li style={{ color: "#374151", fontSize: 14 }}>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ color: "#111827", fontWeight: 600 }}>{children}</strong>,
    em:     ({ children }: any) => <em style={{ color: "#374151" }}>{children}</em>,
    link:   ({ value, children }: any) => <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", textDecoration: "underline" }}>{children}</a>,
  },
}

export default async function LessonDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(QUERIES.articleBySlug(slug), {}, { next: { revalidate: 60 } })
  if (!article) notFound()

  const allLessons = await sanityClient.fetch<Article[]>(`
    *[_type == "article" && category == "education"] | order(publishedAt asc) {
      _id, title, slug
    }
  `, {}, { next: { revalidate: 60 } })
  const currentIndex = allLessons.findIndex(l => l.slug?.current ?? "" === slug)
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const lessonNum = currentIndex + 1

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
          <Link href="/lessons" style={{ color: "#2563EB", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 500 }}>
            <BookOpen size={12} /> ບົດຮຽນທັງໝົດ
          </Link>
          <span>→</span>
          <span style={{ color: "#374151" }}>ບົດທີ {lessonNum}</span>
        </div>

        {/* Lesson number badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EEF3FF", border: "1px solid #BFCFFF", borderRadius: 100, padding: "4px 12px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 14 }}>
          ບົດທີ {lessonNum} / 50
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          {article.title}
        </h1>

        {/* Meta + Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#9CA3AF", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E5E7EB", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} /> {article.readTime ?? 5} ນາທີ
          </span>
          <span>LFT Team</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#2563EB", borderRadius: 2, width: `${(lessonNum / 50) * 100}%` }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{lessonNum}/50</span>
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <div style={{ background: "#F9FAFB", borderLeft: "3px solid #BFCFFF", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 24, color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
            {article.excerpt}
          </div>
        )}

        {/* Body */}
        <div style={{ marginBottom: 40 }}>
          {article.body && <PortableText value={article.body} components={ptComponents} />}
        </div>

        <PostEngagement
          postId={article._id}
          postTitle={article.title}
          postUrl={`https://laoforextrader.com/lessons/${article.slug?.current ?? ""}`}
        />

        {/* Prev / Next */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          {prev ? (
            <Link href={`/lessons/${prev.slug?.current ?? ""}`}
              style={{ display: "flex", flexDirection: "column", gap: 4, padding: 14, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9CA3AF" }}>
                <ArrowLeft size={10} /> ບົດກ່ອນໜ້າ
              </div>
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {prev.title}
              </p>
            </Link>
          ) : <div />}

          {next ? (
            <Link href={`/lessons/${next.slug?.current ?? ""}`}
              style={{ display: "flex", flexDirection: "column", gap: 4, padding: 14, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, textDecoration: "none", textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, fontSize: 10, color: "#9CA3AF" }}>
                ບົດຖັດໄປ <ArrowRight size={10} />
              </div>
              <p style={{ fontSize: 12, color: "#2563EB", lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                {next.title}
              </p>
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 14, background: "#EEF3FF", border: "1px solid #BFCFFF", borderRadius: 12, textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#2563EB" }}>ຮຽນຄົບແລ້ວ! 🎉</div>
              <p style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, margin: 0 }}>ຄົບ 50 ບົດ</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/lessons" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}>
            ← ກັບໄປ ບົດຮຽນທັງໝົດ
          </Link>
        </div>
      </div>
    </div>
  )
}
