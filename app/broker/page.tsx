import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import { BrokerSection } from "@/components/broker/BrokerSection"
import MerchSection from "@/components/sections/MerchSection"
import PromoSection from "@/components/sections/PromoSection"
import { Article, Broker } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ລີວິວ Broker | LaoForexTrader",
}


export default async function Page() {
  const [articles, brokers] = await Promise.all([
    sanityClient.fetch<Article[]>(QUERIES.articlesByCategory("broker", 20)),
    sanityClient.fetch<Broker[]>(QUERIES.featuredBrokers),
  ])

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>

      {/* Articles */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 24px 40px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>
          Articles
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: 16 }}>
          ລີວິວ Broker ຫຼ້າສຸດ
        </h2>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E6F0", overflow: "hidden" }}>
          {articles.map(a => <ArticleCard key={a._id} article={a} />)}
          {articles.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
              ຍັງບໍ່ມີບົດຄວາມ
            </div>
          )}
        </div>
      </div>

      {/* Broker Grid */}
      <BrokerSection brokers={brokers} />

      <PromoSection />

      <MerchSection />
    </div>
  )
}
