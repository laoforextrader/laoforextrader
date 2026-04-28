import { sanityClient, QUERIES, urlFor } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import { Sidebar } from "@/components/layout/Sidebar"
import { HeroCanvas } from "@/components/ui/HeroCanvas"
import { StarburstCanvas } from "@/components/ui/StarburstCanvas"
import { GoldWidget } from "@/components/ui/GoldWidget"
import { BrokerSection } from "@/components/broker/BrokerSection"
import { LessonsPreview } from "@/components/lessons/LessonsPreview"
import MerchSection from "@/components/sections/MerchSection"
import FounderSection from "@/components/sections/FounderSection"
import EASGrideCTA from "@/components/sections/EASGrideCTA"
import { Article, Broker } from "@/types"
import { categoryRoute, formatDate } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

const CATEGORY_TABS = [
  { label: "ທັງໝົດ",    href: "/" },
  { label: "ໂບຣກເກີ",  href: "/?cat=broker" },
  { label: "ການສຶກສາ",  href: "/?cat=education" },
  { label: "ຂ່າວ",      href: "/?cat=news" },
  { label: "ວິເຄາະ",    href: "/?cat=analysis" },
  { label: "EA / Tools", href: "/?cat=ea-tools" },
]

export const revalidate = 3600

export default async function HomePage() {
  let articles: Article[] = []
  let featured: Article | null = null
  let brokers: Broker[] = []
  let lessons: Article[] = []

  try {
    const data = await Promise.all([
      sanityClient.fetch<Article[]>(QUERIES.latestArticles(12)),
      sanityClient.fetch<Article>(QUERIES.featuredArticle),
      sanityClient.fetch<Broker[]>(QUERIES.featuredBrokers),
      sanityClient.fetch<Article[]>(`
        *[_type == "article" && category == "education"] | order(publishedAt asc) [0...10] {
          _id, title, slug, readTime
        }
      `),
    ])
    articles = data[0] || []
    featured = data[1] || null
    brokers = data[2] || []
    lessons = data[3] || []
  } catch (err) {
    console.error("Sanity fetch error:", err)
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-200">
        <HeroCanvas />
        <div className="relative z-10 max-w-[1060px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-9 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-[11px] font-bold text-blue-600 tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-dot" />
              🇱🇦 ແຫຼ່ງຂໍ້ມູນການເທຣດ #1 ສຳລັບຄົນລາວ
            </div>
            <h1 className="font-sans font-extrabold text-[46px] leading-[1.06] tracking-tight mb-4">
              Trade<br />
              <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Smarter.
              </span><br />
              <span style={{ background: "linear-gradient(135deg,#0891B2,#2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ຮຽນເທຣດກັບມືອາຊີບ
              </span>
            </h1>
            <p className="font-lao text-sm text-gray-500 leading-relaxed max-w-[380px] mb-7">
              ລີວິວ Broker ທີ່ຊື່ສັດ · ຄວາມຮູ້ການເທຣດ ຟຣີ<br />
              ວິເຄາະຕະຫຼາດ · ຂ່າວ · ລະບົບເທຣດອັດຕະໂນມັດ EA
            </p>
            <div className="flex gap-3 flex-wrap mb-10">
              <Link href="/lessons" className="btn-primary">ເລີ່ມຮຽນ Forex ຟຣີ →</Link>
              <Link href="/broker" className="btn-outline">ເບິ່ງລີວິວ Broker</Link>
            </div>
            <div className="flex gap-8 pt-6 border-t border-gray-100">
              {[["12K+","ສະມາຊິກ"],["48","ລີວິວ Broker"],["50","ບົດຮຽນ"],["5Y","ປະສົບການ"]].map(([n,l])=>(
                <div key={l}>
                  <div className="text-2xl font-bold" style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</div>
                  <div className="font-lao text-[11px] text-gray-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Live price + Lao gold widget */}
          <GoldWidget />
        </div>
      </section>

      {/* ── CATEGORY TABS ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1060px] mx-auto px-6 flex">
          {CATEGORY_TABS.map(tab => (
            <Link key={tab.href} href={tab.href}
              className="font-lao text-[12px] text-gray-500 hover:text-blue-600 px-3.5 py-2.5 border-b-2 border-transparent hover:border-blue-500 transition-colors font-medium whitespace-nowrap">
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="max-w-[1060px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        <div className="border-r border-gray-100 bg-white">
          {featured && (
            <Link href={`/${categoryRoute(featured.category)}/${featured.slug?.current ?? ""}`} className="block group border-b border-gray-100">
              <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB,#4F46E5)" }} />
              <div className="p-5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600 mb-2.5">⭐ ບົດຄວາມແນະນຳ</div>
                {featured.coverImage && (
                  <div className="relative w-full rounded-xl overflow-hidden mb-3.5 bg-gray-100" style={{ height: 200 }}>
                    <Image
                      src={urlFor(featured.coverImage).width(800).height(400).url()}
                      alt={featured.title}
                      fill
                      sizes="(max-width:768px) 100vw, 700px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <h2 className="font-lao text-[20px] font-bold leading-snug text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2" style={{ letterSpacing: "-0.01em" }}>
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="font-lao text-[12.5px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-lao">
                  {featured.author?.name && <span className="font-medium text-gray-500">{featured.author.name}</span>}
                  {featured.publishedAt && <><span>·</span><span>{formatDate(featured.publishedAt)}</span></>}
                  {featured.readTime && <><span>·</span><span>{featured.readTime}m</span></>}
                </div>
              </div>
            </Link>
          )}
          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-5 py-3 border-b border-gray-100">ລ່າສຸດ · 1 ຕໍ່ໝວດ</div>
          {articles
            .reduce<Article[]>((acc, a) => acc.some(x => x.category === a.category) ? acc : [...acc, a], [])
            .map(article => <ArticleCard key={article._id} article={article} />)}
        </div>
        <Sidebar brokers={brokers} trending={articles.slice(0, 5)} />
      </div>

      {/* ── LESSONS ── */}
      <div className="bg-white border-t border-gray-200 border-b border-gray-200">
        <div className="max-w-[1060px] mx-auto px-6 py-12">
          <LessonsPreview lessons={lessons} />
        </div>
      </div>

      {/* ── STARBURST ── */}
      <div className="relative overflow-hidden border-t border-b border-blue-100" style={{ background: "linear-gradient(180deg,#EEF3FF 0%,#DBEAFE 50%,#EEF3FF 100%)" }}>
        <StarburstCanvas />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 pointer-events-none">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">ຄວາມຮູ້ທີ່ຈະຊ່ວຍທ່ານ</div>
          <h2 className="font-sans font-extrabold text-[26px] leading-tight tracking-tight text-gray-900 mb-2">
            ເລີ່ມ{" "}
            <span style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Trade
            </span>{" "}
            ດ້ວຍຄວາມໝັ້ນໃຈ
          </h2>
          <p className="font-lao text-[13px] text-gray-600 max-w-[420px] leading-relaxed">
            50 ບົດຮຽນ · Beginner ຈົນ Pro · ພາສາລາວ · ຟຣີ
          </p>
        </div>
      </div>

      {/* ── BROKER SECTION ── */}
      <BrokerSection brokers={brokers} />

      {/* ── MERCH ── */}
      <MerchSection />

      {/* ── EA SGride CTA ── */}
      <EASGrideCTA />

      {/* ── FOUNDER ── */}
      <FounderSection />

      {/* ── CTA ── */}
      <div className="max-w-[1060px] mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(37,99,235,0.04),transparent)" }} />
          <h2 className="font-sans font-extrabold text-[26px] tracking-tight mb-2 relative" style={{ color:"#111827" }}>
            ເລີ່ມ{" "}
            <span style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Trade ຢ່າງ Pro
            </span>{" "}
            ວັນນີ້
          </h2>
          <p className="font-lao text-sm text-gray-500 mb-6 relative">ສະໝັກຟຣີ · ຮຽນ 50 ບົດ · ລີວິວ Broker ທີ່ໄວ້ໃຈໄດ້</p>
          <div className="flex gap-3 justify-center relative flex-wrap">
            <Link href="/lessons" className="btn-primary">ເລີ່ມຮຽນ Forex ຟຣີ →</Link>
            <Link href="/broker" className="btn-outline">ເບິ່ງ Broker ທັງໝົດ</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
