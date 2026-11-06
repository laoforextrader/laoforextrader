// The homepage, on the same flat surface as /broker: one 8px radius, hairline
// borders, no shadow, weight capped at 700, hierarchy carried by type size.
//
// What this replaces leaned on decoration for its hierarchy — a particle
// canvas behind a gradient headline, a second canvas behind a decorative
// band, four gradient numbers, gradient buttons, emoji eyebrows. None of it
// told a first-time reader what the site is for, and the Lao headline was
// gradient-filled, which thins the tone marks that sit above the baseline.
//
// Three things were also broken rather than merely loud:
//
//   · The category tabs linked to `/?cat=broker`. Nothing on this page has
//     ever read a `cat` param, so all six tabs were no-ops that changed the
//     URL and left the page identical. They point at the real category routes
//     now, which exist and are indexable.
//   · The tab row was a plain `flex` with no overflow handling, so six Lao
//     labels overflowed a 360px viewport and gave the whole page a sideways
//     scroll. It scrolls inside its own row now, like the /broker filters.
//   · The hero advertised "48 ລີວິວ Broker" and "12K+ ສະມາຊິກ" as hard
//     numbers while /broker rendered six brokers from six docs. See
//     HERO_STATS: the counts come from Sanity now.

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { getGoldSnapshot } from "@/lib/gold"
import { Sidebar } from "@/components/layout/Sidebar"
import { GoldWidget } from "@/components/ui/GoldWidget"
import CalendarPills from "@/components/news/CalendarPills"
import { BrokerSection } from "@/components/broker/BrokerSection"
import { LessonsPreview } from "@/components/lessons/LessonsPreview"
import MerchSection from "@/components/sections/MerchSection"
import FounderSection from "@/components/sections/FounderSection"
import EASGrideCTA from "@/components/sections/EASGrideCTA"
import QuizzesHomeSection from "@/components/quiz/QuizzesHomeSection"
import { btnSolid, btnOutline, ArrowIcon } from "@/components/broker/review/BrokerBits"
import type { Article, Broker, BrokerNewsDoc, HotNewsEntry } from "@/types"
import { categoryRoute, formatDate } from "@/lib/utils"

export const revalidate = 60

export const metadata: Metadata = {
  title: "LaoForexTrader — ລີວິວໂບຣກເກີ ແລະ ຄວາມຮູ້ການເທຣດ ພາສາລາວ",
  description:
    "ລີວິວໂບຣກເກີ Forex ຈາກການເປີດບັນຊີຈິງ, ບົດຮຽນການເທຣດພາສາລາວ, ຂ່າວ ແລະ ວິເຄາະຕະຫຼາດ ພ້ອມລະບົບເທຣດອັດຕະໂນມັດ EA",
}

/** Real routes, not query strings that nothing reads. */
const CATEGORY_TABS = [
  { label: "ໂບຣກເກີ", href: "/broker" },
  { label: "ບົດຮຽນ", href: "/lessons" },
  { label: "ການສຶກສາ", href: "/education" },
  { label: "ຂ່າວ", href: "/news" },
  { label: "ວິເຄາະ", href: "/analysis" },
  { label: "EA / Tools", href: "/ea-system" },
]

const HERO_LINKS = [
  { label: "ລີວິວໂບຣກເກີ", href: "/broker" },
  { label: "ຮຽນຟຣີ", href: "/lessons" },
  { label: "ລະບົບ EA", href: "/ea-system" },
]

const CAT_LABEL: Record<string, string> = {
  education: "ການສຶກສາ",
  "ea-tools": "EA & Tools",
  analysis: "ວິເຄາະ",
  news: "ຂ່າວ",
  broker: "ລີວິວ Broker",
}

interface LatestByCategory {
  featured: Article | null
  education: Article | null
  "ea-tools": Article | null
  analysis: Article | null
  news: Article | null
}

interface DailyUpdate {
  date: string
  calendarHighlights?: Array<{ _key?: string; name: string; time: string; impact: string }>
  hotNews?: HotNewsEntry[]
}

interface SiteCounts {
  brokers: number
  lessons: number
  articles: number
}

const COUNTS_QUERY = `{
  "brokers": count(*[_type == "broker"]),
  "lessons": count(*[_type == "article" && category == "education"]),
  "articles": count(*[_type == "article"])
}`

export default async function HomePage() {
  let latest: LatestByCategory = { featured: null, education: null, "ea-tools": null, analysis: null, news: null }
  let brokers: Broker[] = []
  let lessons: Article[] = []
  let popular: Article[] = []
  let counts: SiteCounts | null = null

  try {
    const data = await Promise.all([
      sanityClient.fetch<LatestByCategory>(QUERIES.latestByCategory, {}, { next: { revalidate: 60 } }),
      sanityClient.fetch<Broker[]>(QUERIES.featuredBrokers(6), {}, { next: { revalidate: 60 } }),
      sanityClient.fetch<Article[]>(
        `*[_type == "article" && category == "education"] | order(publishedAt asc) [0...10] {
          _id, title, slug, readTime
        }`,
        {},
        { next: { revalidate: 60 } },
      ),
      sanityClient.fetch<Article[]>(QUERIES.popularArticles(2), {}, { next: { revalidate: 60 } }),
      sanityClient.fetch<SiteCounts>(COUNTS_QUERY, {}, { next: { revalidate: 300 } }),
    ])
    latest = data[0] || latest
    brokers = data[1] || []
    lessons = data[2] || []
    popular = data[3] || []
    counts = data[4] || null
  } catch (err) {
    console.error("Sanity fetch error:", err)
  }

  // Pre-fetch gold so the panel paints with a real number on first load
  // (avoids the "Loading…" flash). Cached upstream via revalidate=60 inside
  // the helper, so this doesn't add latency on warm requests.
  const goldSnapshot = await getGoldSnapshot().catch(() => null)

  // The two feeds the sidebar runs on. Both are allowed to be missing: a
  // failed pipeline hides its block rather than rendering an empty heading.
  let dailyUpdate: DailyUpdate | null = null
  let brokerNews: BrokerNewsDoc | null = null
  try {
    ;[dailyUpdate, brokerNews] = await Promise.all([
      sanityClient.fetch<DailyUpdate | null>(QUERIES.latestDailyUpdate, {}, { next: { revalidate: 60 } }),
      sanityClient.fetch<BrokerNewsDoc | null>(QUERIES.latestBrokerNews, {}, { next: { revalidate: 300 } }),
    ])
  } catch {}

  const featured = latest.featured
  const popularPick = popular.find((p) => p._id !== featured?._id) ?? null
  const categoryCards = (["education", "ea-tools", "analysis", "news"] as const)
    .map((cat) => latest[cat])
    .filter((a): a is Article => !!a && a._id !== featured?._id)
  /**
   * Every figure here is either counted from Sanity or a claim about us that
   * needs no counting. The old hero also carried "12K+ ສະມາຊິກ", which is
   * dropped rather than carried over: a review site that asks readers to check
   * licence numbers cannot publish an audience figure it does not hold. Put it
   * back as a fourth entry the day there is a real number behind it.
   */
  const HERO_STATS: { value: string; label: string }[] = [
    ...(counts?.brokers ? [{ value: String(counts.brokers), label: "ໂບຣກເກີທົດສອບແລ້ວ" }] : []),
    ...(counts?.lessons ? [{ value: String(counts.lessons), label: "ບົດຮຽນພາສາລາວ" }] : []),
    ...(counts?.articles ? [{ value: String(counts.articles), label: "ບົດຄວາມ" }] : []),
    { value: "5 ປີ", label: "ປະສົບການເທຣດ" },
  ]

  return (
    <div className="bg-bk-page">
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-bk-line">
        <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-10">
          <div>
            <div className="flex flex-wrap gap-2">
              {HERO_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex min-h-[36px] items-center rounded-bk border border-bk-line px-3 text-[13px] font-semibold text-bk-ink no-underline hover:bg-bk-sunken"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <h1 className="lao-head m-0 mt-5 text-[34px] font-bold leading-[1.18] tracking-[-0.03em] text-bk-ink sm:text-[44px] lg:text-[48px]">
              ຮຽນເທຣດ ແລະ ເລືອກໂບຣກເກີ ດ້ວຍຂໍ້ມູນຈິງ
            </h1>

            <p className="m-0 mt-4 max-w-[52ch] text-base leading-[1.75] text-bk-muted sm:text-[17px]">
              ລີວິວໂບຣກເກີຈາກການເປີດບັນຊີຈິງ ຝາກຈິງ ຖອນຈິງ · ບົດຮຽນການເທຣດພາສາລາວ ຟຣີ ·
              ຂ່າວ ແລະ ວິເຄາະຕະຫຼາດ ທຸກວັນ
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/lessons" className={`${btnSolid} w-full sm:w-auto`}>
                ເລີ່ມຮຽນ Forex ຟຣີ
                <ArrowIcon size={15} />
              </Link>
              <Link href="/broker" className={`${btnOutline} w-full sm:w-auto`}>
                ທຽບໂບຣກເກີ
              </Link>
            </div>

            {HERO_STATS.length > 0 && (
              <dl className="m-0 mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-bk-line pt-6 sm:grid-cols-4">
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <dd className="m-0 font-mono text-[26px] font-bold leading-none tracking-[-0.03em] text-bk-ink">
                      {s.value}
                    </dd>
                    <dt className="mt-1.5 text-[12px] leading-tight text-bk-muted">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="mt-8 lg:mt-0">
            <GoldWidget initial={goldSnapshot} />
          </div>
        </div>
      </section>

      {/* ── today's calendar ─────────────────────────────────────────────── */}
      {dailyUpdate?.calendarHighlights && dailyUpdate.calendarHighlights.length > 0 && (
        <CalendarPills items={dailyUpdate.calendarHighlights} />
      )}

      {/* ── category tabs ───────────────────────────────────────────────── */}
      <nav aria-label="ໝວດເນື້ອຫາ" className="border-b border-bk-line">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-1 sm:w-auto">
              {CATEGORY_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="inline-flex min-h-[44px] items-center whitespace-nowrap border-b-2 border-transparent px-3 text-[14px] font-semibold text-bk-muted no-underline hover:border-bk-ink hover:text-bk-ink"
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ── articles + sidebar ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1100px] lg:grid lg:grid-cols-[1fr_300px]">
        <div className="px-4 py-8 sm:px-6">
          {featured && (
            <Link
              href={`/${categoryRoute(featured.category)}/${featured.slug?.current ?? ""}`}
              className="group block overflow-hidden rounded-bk border border-bk-line no-underline"
            >
              {featured.coverImage?.asset?.url && (
                <div className="relative aspect-[16/9] w-full border-b border-bk-line bg-bk-sunken">
                  <Image
                    src={featured.coverImage.asset.url}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width:1024px) 100vw, 740px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4 sm:p-5">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-bk-muted">
                  ບົດຄວາມແນະນຳ
                </span>
                <h2 className="lao-head m-0 mt-2 text-[24px] font-bold leading-[1.3] tracking-[-0.025em] text-bk-ink group-hover:underline sm:text-[28px]">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="m-0 mt-2.5 line-clamp-2 text-[15px] leading-[1.7] text-bk-muted">
                    {featured.excerpt}
                  </p>
                )}
                <p className="m-0 mt-3 text-[12px] text-bk-muted">
                  {CAT_LABEL[featured.category] ?? featured.category}
                  {featured.publishedAt ? ` · ${formatDate(featured.publishedAt)}` : ""}
                  {featured.readTime ? ` · ${featured.readTime} ນາທີ` : ""}
                </p>
              </div>
            </Link>
          )}

          {popularPick && (
            <Link
              href={`/${categoryRoute(popularPick.category)}/${popularPick.slug?.current ?? ""}`}
              className="group mt-4 flex gap-4 rounded-bk border border-bk-line p-4 no-underline"
            >
              {popularPick.coverImage?.asset?.url && (
                <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-bk border border-bk-line bg-bk-sunken sm:h-[112px] sm:w-[112px]">
                  <Image
                    src={popularPick.coverImage.asset.url}
                    alt={popularPick.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-bk-muted">
                  ອ່ານຫຼາຍທີ່ສຸດ
                </span>
                <h3 className="m-0 mt-1.5 line-clamp-2 text-[17px] font-bold leading-[1.4] tracking-[-0.02em] text-bk-ink group-hover:underline">
                  {popularPick.title}
                </h3>
                <p className="m-0 mt-2 text-[12px] text-bk-muted">
                  {CAT_LABEL[popularPick.category] ?? popularPick.category}
                  {popularPick.views ? ` · ${popularPick.views.toLocaleString()} ຄົນອ່ານ` : ""}
                  {popularPick.readTime ? ` · ${popularPick.readTime} ນາທີ` : ""}
                </p>
              </div>
            </Link>
          )}

          {categoryCards.length > 0 && (
            <>
              <h2 className="lao-head m-0 mb-4 mt-10 text-[20px] font-bold leading-tight tracking-[-0.02em] text-bk-ink">
                ລ່າສຸດ ໜຶ່ງບົດຕໍ່ໜຶ່ງໝວດ
              </h2>
              <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
                {categoryCards.map((article) => (
                  <li key={article._id} className="flex">
                    <Link
                      href={`/${categoryRoute(article.category)}/${article.slug?.current ?? ""}`}
                      className="group flex w-full flex-col rounded-bk border border-bk-line p-4 no-underline"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-bk-muted">
                        {CAT_LABEL[article.category] ?? article.category}
                      </span>
                      <h3 className="m-0 mt-2 line-clamp-2 text-[16px] font-bold leading-[1.45] tracking-[-0.02em] text-bk-ink group-hover:underline">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="m-0 mt-2 line-clamp-2 flex-1 text-[14px] leading-[1.65] text-bk-muted">
                          {article.excerpt}
                        </p>
                      )}
                      <p className="m-0 mt-3 text-[12px] text-bk-muted">
                        {article.publishedAt ? formatDate(article.publishedAt) : ""}
                        {article.readTime ? ` · ${article.readTime} ນາທີ` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Sidebar
          brokers={brokers}
          brokerNews={brokerNews?.items ?? []}
          tradingNews={dailyUpdate?.hotNews ?? []}
        />
      </div>

      {/* ── lessons ─────────────────────────────────────────────────────── */}
      <div className="border-t border-bk-line">
        <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-14">
          <LessonsPreview lessons={lessons} total={counts?.lessons} />
        </div>
      </div>

      {/* ── quizzes ─────────────────────────────────────────────────────── */}
      <QuizzesHomeSection />

      {/* ── brokers ─────────────────────────────────────────────────────── */}
      <BrokerSection brokers={brokers} />

      {/* ── merch · EA · founder ────────────────────────────────────────── */}
      <MerchSection />
      <EASGrideCTA />
      <FounderSection />

      {/* ── closing ─────────────────────────────────────────────────────── */}
      <section className="border-t border-bk-line">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6">
          <h2 className="lao-head m-0 max-w-[34ch] text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
            ເລີ່ມຈາກບົດທີ 1 ຫຼື ເລືອກໂບຣກເກີກ່ອນ
          </h2>
          <p className="m-0 mt-3 max-w-[60ch] text-base leading-[1.75] text-bk-muted">
            ບົດຮຽນທັງໝົດຟຣີ ແລະ ບໍ່ຕ້ອງສະໝັກ · ລີວິວທຸກອັນມາຈາກບັນຊີຈິງຂອງພວກເຮົາ
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/lessons" className={`${btnSolid} w-full sm:w-auto`}>
              ເລີ່ມຮຽນ Forex ຟຣີ
              <ArrowIcon size={15} />
            </Link>
            <Link href="/broker" className={`${btnOutline} w-full sm:w-auto`}>
              ເບິ່ງໂບຣກເກີທັງໝົດ
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
