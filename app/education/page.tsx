import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import { Article } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ການສຶກສາ | LaoForexTrader",
}

export const revalidate = 60

export default async function Page() {
  const articles = await sanityClient.fetch<Article[]>(
    QUERIES.articlesByCategory("education", 20),
    {},
    { next: { revalidate: 60 } }
  )
  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>
          ການສຶກສາ
        </h1>
        <p style={{ color: "#374151", fontSize: 14, marginBottom: 24 }}>ຄວາມຮູ້ Forex ທຸກລະດັບ</p>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E6F0", overflow: "hidden" }}>
          {articles.map(a => <ArticleCard key={a._id} article={a} />)}
          {articles.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
              ກຳລັງໂຫຼດ...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
