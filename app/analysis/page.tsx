import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import { Article } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ວິເຄາະ",
}

export const revalidate = 60

export default async function Page() {
  const articles = await sanityClient.fetch<Article[]>(
    QUERIES.articlesByCategory("analysis", 20),
    {},
    { next: { revalidate: 60 } }
  )
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--fg)", marginBottom: 6, letterSpacing: "-0.02em" }}>
          ວິເຄາະ
        </h1>
        <p style={{ color: "var(--fg-2)", fontSize: 14, marginBottom: 24 }}>ການວິເຄາະ Forex ແລະ ທອງ</p>
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
          {articles.map(a => <ArticleCard key={a._id} article={a} />)}
          {articles.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--fg-4)", fontSize: 14 }}>
              ກຳລັງໂຫຼດ...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
