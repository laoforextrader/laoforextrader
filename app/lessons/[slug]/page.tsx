import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { Article } from "@/types"
import { ArrowLeft, ArrowRight, Clock, BookOpen } from "lucide-react"
import PostEngagement from "@/components/sections/PostEngagement"
import { buildArticleMetadata } from "@/lib/articleMetadata"
import BrokerAdsBanner from "@/components/ui/BrokerAdsBanner"
import CTASelector from "@/components/cta/CTASelector"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import ArticleSidebar, { articleHasSidebar, shouldRenderQuizInline } from "@/components/article/ArticleSidebar"
import ViewTracker from "@/components/article/ViewTracker"

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 60

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
      _id, title, slug, readTime
    }
  `, {}, { next: { revalidate: 60 } })
  const currentIndex = allLessons.findIndex(l => (l.slug?.current ?? "") === slug)
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const upcoming = allLessons.slice(currentIndex + 1, currentIndex + 4)
  const lessonNum = currentIndex + 1
  const totalLessons = allLessons.length || 50
  const progressPct = Math.round((lessonNum / totalLessons) * 100)

  const hasSidebar = articleHasSidebar(article)
  const showInlineQuiz = shouldRenderQuizInline(article)

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <ViewTracker slug={article.slug?.current ?? ""} />
      <div className={
        hasSidebar
          ? "max-w-[1080px] mx-auto px-6 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 lg:items-start"
          : "max-w-[760px] mx-auto px-6 py-8"
      }>
        <div className="min-w-0">

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
          <Link href="/lessons" style={{ color: "#2563EB", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 500 }}>
            <BookOpen size={12} /> ບົດຮຽນທັງໝົດ
          </Link>
          <span>→</span>
          <span style={{ color: "#374151" }}>ບົດທີ {lessonNum}</span>
        </div>

        {/* Big Progress Card */}
        <div style={{
          background: "linear-gradient(135deg,#EEF3FF,#F5F3FF)",
          border: "1px solid #BFCFFF",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
              ບົດທີ {lessonNum} / {totalLessons}
            </div>
            <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
              ຄວາມຄືບໜ້າ <span style={{ color: "#2563EB", fontFamily: "'JetBrains Mono', monospace" }}>{progressPct}%</span>
            </div>
          </div>
          <div style={{ height: 8, background: "#fff", borderRadius: 99, overflow: "hidden", border: "1px solid #DBEAFE" }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg,#2563EB,#4F46E5)",
              borderRadius: 99,
              transition: "width .4s",
            }} />
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#9CA3AF", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E5E7EB", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} /> {article.readTime ?? 5} ນາທີ
          </span>
          <span>LFT Team</span>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <div style={{ background: "#F9FAFB", borderLeft: "3px solid #BFCFFF", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 24, color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
            {article.excerpt}
          </div>
        )}

        {/* Banner — middle */}
        {article.adsBanner?.show &&
         article.adsBanner?.html &&
         (article.adsBanner.position === 'middle' ||
          article.adsBanner.position === 'both') && (
          <BrokerAdsBanner html={article.adsBanner.html} />
        )}

        {/* Body */}
        <div style={{ marginBottom: 40 }}>
          {article.body && <PortableText value={article.body} components={ptComponents} />}
        </div>

        {/* Banner — bottom */}
        {article.adsBanner?.show &&
         article.adsBanner?.html &&
         (article.adsBanner.position === 'bottom' ||
          article.adsBanner.position === 'both') && (
          <BrokerAdsBanner html={article.adsBanner.html} />
        )}

        {/* CTAs */}
        {article.ctas?.map((c, i) => (
          c?.type ? <CTASelector key={c._key ?? i} type={c.type} /> : null
        ))}

        {/* Quiz — inline only when quizPosition is inline/both */}
        {showInlineQuiz && article.featuredQuiz && (
          <QuizSidebar quiz={article.featuredQuiz} />
        )}

        <PostEngagement
          postId={article._id}
          postTitle={article.title}
          postUrl={`https://www.laoforextrader.com/lessons/${article.slug?.current ?? ""}`}
        />

        {/* Prev / Next — big buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 24, marginTop: 8, borderTop: "1px solid #E5E7EB" }}>
          {prev ? (
            <Link href={`/lessons/${prev.slug?.current ?? ""}`}
              style={{
                display: "flex", flexDirection: "column", gap: 6, padding: "16px 18px",
                background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14,
                textDecoration: "none", transition: "all .2s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B7280", fontWeight: 600 }}>
                <ArrowLeft size={13} /> ບົດກ່ອນໜ້າ
              </div>
              <p style={{ fontSize: 13, color: "#111827", fontWeight: 600, lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {prev.title}
              </p>
            </Link>
          ) : <div />}

          {next ? (
            <Link href={`/lessons/${next.slug?.current ?? ""}`}
              style={{
                display: "flex", flexDirection: "column", gap: 6, padding: "16px 18px",
                background: "linear-gradient(135deg,#2563EB,#4F46E5)", border: "1.5px solid transparent",
                borderRadius: 14, textDecoration: "none", textAlign: "right" as const,
                boxShadow: "0 4px 14px rgba(37,99,235,.25)",
              }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, fontSize: 11, color: "rgba(255,255,255,.85)", fontWeight: 600 }}>
                ບົດຖັດໄປ <ArrowRight size={13} />
              </div>
              <p style={{ fontSize: 13, color: "#fff", fontWeight: 700, lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {next.title}
              </p>
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 18px", background: "#EEF3FF", border: "1.5px solid #BFCFFF", borderRadius: 14, textAlign: "right" as const }}>
              <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>ຮຽນຄົບແລ້ວ! 🎉</div>
              <p style={{ fontSize: 13, color: "#2563EB", fontWeight: 700, margin: 0 }}>ຄົບທຸກບົດແລ້ວ</p>
            </div>
          )}
        </div>

        {/* Upcoming lessons — clickable */}
        {upcoming.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.01em" }}>
                📚 ບົດຮຽນຖັດໄປ
              </h2>
              <Link href="/lessons" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>
                ເບິ່ງທັງໝົດ →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((lesson, i) => {
                const num = currentIndex + 2 + i
                return (
                  <Link key={lesson._id} href={`/lessons/${lesson.slug?.current ?? ""}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", background: "#fff",
                      border: "1px solid #E5E7EB", borderRadius: 12,
                      textDecoration: "none", transition: "all .2s",
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "linear-gradient(135deg,#EEF3FF,#F5F3FF)",
                      border: "1px solid #BFCFFF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, color: "#2563EB",
                    }}>
                      {num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: "#111827", fontWeight: 600, margin: "0 0 3px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {lesson.title}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#9CA3AF" }}>
                        <Clock size={10} /> {lesson.readTime ?? 5} ນາທີ
                      </div>
                    </div>
                    <ArrowRight size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/lessons" style={{ fontSize: 12, color: "#6B7280", textDecoration: "none" }}>
            ← ກັບໄປ ບົດຮຽນທັງໝົດ
          </Link>
        </div>
        </div>
        {hasSidebar && <ArticleSidebar article={article} />}
      </div>
    </div>
  )
}
