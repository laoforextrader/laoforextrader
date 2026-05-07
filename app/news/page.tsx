import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import HighImpactSection, { type TopEvent } from "@/components/news/HighImpactSection"
import CalendarTable, { type RawCalRow } from "@/components/news/CalendarTable"
import HotNewsSection, { type HotNewsItem } from "@/components/news/HotNewsSection"
import TechnicalSection, { type TechItem } from "@/components/news/TechnicalSection"
import { LiveClock } from "@/components/news/LiveClock"
import { formatDateDDMMYYYY } from "@/lib/news/sources-shared"
import { Article } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ຂ່າວ Forex ປະຈຳວັນ | LaoForexTrader",
  description: "ຂ່າວ Forex, Economic Calendar, ການວິເຄາະທາງເຕັກນິກປະຈຳວັນ ສຳລັບ Trader ລາວ",
}

export const revalidate = 60

interface DailyDoc {
  _id: string
  date: string
  dailySummary?: string
  topEvents?: TopEvent[]
  calendarHighlights?: any[]
  hotNews?: HotNewsItem[]
  technical?: TechItem[]
  rawCalendar?: RawCalRow[]
  hasHighImpact?: boolean
  createdAt?: string
}

export default async function NewsPage() {
  const [articles, daily] = await Promise.all([
    sanityClient.fetch<Article[]>(
      QUERIES.articlesByCategory("news", 12),
      {},
      { next: { revalidate: 60 } },
    ),
    sanityClient.fetch<DailyDoc | null>(
      QUERIES.latestDailyUpdate,
      {},
      { next: { revalidate: 60 } },
    ).catch(() => null),
  ])

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Hero (centered, simple per wireframe) ── */}
        <div className="text-center mb-8">
          <h1 className="font-sans font-extrabold text-[32px] md:text-[36px] tracking-tight text-gray-900 mb-2">
            ຂ່າວ <span className="text-gray-300 font-light">/</span>{" "}
            <span style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Economic Calendar</span>
          </h1>
          {daily?.date && (
            <p className="font-mono text-[12px] text-gray-400 mb-3">
              ອັບເດດເມື່ອ {formatDateDDMMYYYY(daily.date)}
            </p>
          )}
          <LiveClock />
        </div>

        {/* Daily summary — compact, only shown when present */}
        {daily?.dailySummary && (
          <div
            className="rounded-xl p-4 mb-8 text-center"
            style={{ background: "linear-gradient(135deg,#EEF3FF,#F5F3FF)", border: "1px solid #DDE3F2" }}
          >
            <p className="font-lao text-[13px] leading-relaxed text-gray-700 max-w-3xl mx-auto">
              {daily.dailySummary}
            </p>
          </div>
        )}

        {/* Section 1 — High Impact */}
        {daily?.topEvents && daily.topEvents.length > 0 && (
          <HighImpactSection events={daily.topEvents} />
        )}

        {/* Section 2 — Full Calendar Table */}
        {daily?.rawCalendar && daily.rawCalendar.length > 0 && (
          <CalendarTable rows={daily.rawCalendar} />
        )}

        {/* Section 3 — Hot News */}
        {daily?.hotNews && daily.hotNews.length > 0 && (
          <HotNewsSection items={daily.hotNews} />
        )}

        {/* Section 4 — Technical */}
        {daily?.technical && daily.technical.length > 0 && (
          <TechnicalSection items={daily.technical} />
        )}

        {/* Section 5 — Existing news articles */}
        {articles.length > 0 && (
          <section className="mb-12">
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                📚 ບົດຄວາມ
              </div>
              <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
                ຂ່າວທົ່ວໄປຈາກ LFT
              </h2>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E6F0", overflow: "hidden" }}>
              {articles.map(a => <ArticleCard key={a._id} article={a} />)}
            </div>
          </section>
        )}

        {/* CTA Footer — Broker */}
        <section className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB,#4F46E5)" }}>
          <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-white mb-2">
            ພ້ອມເທຣດແລ້ວ?
          </h2>
          <p className="font-lao text-[14px] text-white/75 mb-5 max-w-md mx-auto leading-relaxed">
            ເລືອກ Broker ທີ່ດີທີ່ສຸດສຳລັບເຮັດກຳໄລ — ຮັບ Bonus, Spread ຕ່ຳ, Withdrawal ໄວ
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/broker"
              className="inline-block bg-white text-blue-700 font-sans font-bold text-[13px] px-7 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              ເບິ່ງລີວິວ Broker →
            </Link>
            <Link
              href="/ea-system"
              className="inline-block bg-white/15 text-white font-sans font-bold text-[13px] px-7 py-3 rounded-xl hover:bg-white/25 transition-colors border border-white/30"
            >
              EA System
            </Link>
          </div>
        </section>

        {/* Empty state */}
        {!daily && articles.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            ກຳລັງໂຫຼດ...
          </div>
        )}
      </div>
    </div>
  )
}
