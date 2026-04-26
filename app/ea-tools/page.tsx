import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import { Article } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "EA & Tools — ເຄື່ອງມື Forex ອັດຕະໂນມັດ",
  description: "ຮຽນຮູ້ EA, Robot Forex, MT4 vs MT5, VPS ສຳລັບ Trader ລາວ",
}

export default async function EAToolsPage() {
  const articles = await sanityClient.fetch<Article[]>(
    QUERIES.articlesByCategory("ea-tools", 20)
  )
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-lao font-bold text-2xl mb-2">
        EA & <span className="text-gold">Tools</span>
      </h1>
      <p className="font-lao text-white/40 text-sm mb-8">
        Expert Advisor · Robot Forex · MT4/MT5 · VPS · Automation
      </p>
      <div className="flex flex-col">
        {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
        {articles.length === 0 && (
          <div className="text-center py-16 text-white/25 font-lao">
            ກຳລັງໂຫຼດ...
          </div>
        )}
      </div>
    </div>
  )
}
