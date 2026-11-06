import type { Metadata } from "next"
import Link from "next/link"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { ArticleCard } from "@/components/article/ArticleCard"
import BrokerDirectory from "@/components/broker/review/BrokerDirectory"
import { BrokerNewsList } from "@/components/news/BrokerNewsList"
import BrokerScoreCard from "@/components/broker/review/BrokerScoreCard"
import { CheckIcon, MetaPill } from "@/components/broker/review/BrokerBits"
import { JsonLd, breadcrumbLd } from "@/lib/structuredData"
import { formatDate } from "@/lib/utils"
import { sortBrokers } from "@/lib/broker"
import type { Article, Broker, BrokerNewsDoc } from "@/types"

export const metadata: Metadata = {
  title: "ໂບຣກເກີ Forex ສຳລັບຄົນລາວ 2026 — ທຽບຄ່າທຳນຽມ ໃບອະນຸຍາດ ແລະ ການຝາກ-ຖອນ",
  description:
    "ສາລະບານໂບຣກເກີ Forex ສຳລັບຄົນລາວ: ທຽບຝາກຂັ້ນຕ່ຳ Leverage Spread ແລະ ການຝາກ-ຖອນຜ່ານທະນາຄານລາວ ພ້ອມເລກໃບອະນຸຍາດທີ່ກວດສອບໄດ້",
}

export const revalidate = 60

export default async function Page() {
  const [articles, brokers, brokerNews] = await Promise.all([
    sanityClient.fetch<Article[]>(QUERIES.articlesByCategory("broker", 6), {}, { next: { revalidate: 60 } }),
    sanityClient.fetch<Broker[]>(QUERIES.allBrokers, {}, { next: { revalidate: 60 } }),
    // Allowed to be null: a failed run hides the section rather than
    // rendering an empty heading under a promise of news.
    sanityClient
      .fetch<BrokerNewsDoc | null>(QUERIES.latestBrokerNews, {}, { next: { revalidate: 300 } })
      .catch(() => null),
  ])

  const ranked = sortBrokers(brokers ?? [], "rank")
  const top = ranked[0]

  // Only claim an update date we actually hold. An "updated today" stamp that
  // moves on its own is the oldest trick on affiliate sites, and readers who
  // notice it stop believing the rest of the page.
  const reviewed = ranked
    .map((b) => b.reviewedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse()[0]

  const laoCount = ranked.filter((b) => b.laoDeposit).length

  return (
    <div className="min-h-screen bg-bk-page">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "ໜ້າຫຼັກ", url: "/" },
            { name: "ໂບຣກເກີ", url: "/broker" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6 sm:pt-9">
        <nav aria-label="ເສັ້ນທາງ" className="mb-5 text-[15px] text-bk-muted">
          <Link href="/" className="text-bk-muted underline">
            ໜ້າຫຼັກ
          </Link>
          <span className="mx-2">›</span>
          <span className="text-bk-ink">ໂບຣກເກີ</span>
        </nav>

        <h1 className="m-0 text-[34px] font-bold leading-[1.12] tracking-[-0.03em] text-bk-ink sm:text-[44px] lg:text-[48px]">
          ໂບຣກເກີ Forex ສຳລັບຄົນລາວ
        </h1>

        <div className="mt-5 flex flex-wrap gap-2">
          <MetaPill>
            <CheckIcon />
            ທົດສອບດ້ວຍບັນຊີຈິງ · {ranked.length} ໂບຣກເກີ
          </MetaPill>
          {reviewed && <MetaPill>ອັບເດດ {formatDate(reviewed)}</MetaPill>}
          {laoCount > 0 && <MetaPill>{laoCount} ໂບຣກຝາກເງິນກີບໄດ້</MetaPill>}
        </div>

        {/* The score card is a screenful on a phone, and the broker it
            describes is already the first row of the list, marked. Desktop
            has the room to lead with it; a phone goes straight to the list. */}
        {top && (
          <div className="mt-8 hidden md:block">
            <BrokerScoreCard
              broker={top}
              rankNote={`ອັນດັບ 1 ຈາກ ${ranked.length} ໂບຣກເກີ`}
            />
          </div>
        )}

        <div className="mt-7 sm:mt-10">
          <BrokerDirectory brokers={ranked} />
        </div>

        {/* ── industry news ─────────────────────────────────────────────── */}
        {brokerNews?.items && brokerNews.items.length > 0 && (
          <section id="news" className="mt-12 scroll-mt-24">
            <h2 className="lao-head m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
              ຂ່າວວົງການໂບຣກເກີ
            </h2>
            <p className="m-0 mb-5 mt-2 max-w-[60ch] text-base leading-[1.75] text-bk-muted">
              ສະຫຼຸບເປັນພາສາລາວຈາກສຳນັກຂ່າວວົງການ — ຄຳສັ່ງຂອງຜູ້ກຳກັບດູແລ, ໃບອະນຸຍາດ, ການຊື້ກິດຈະການ ແລະ ງານວົງການ ·
              ທຸກຂ່າວມີລິ້ງກັບໄປຫາຕົ້ນສະບັບ
            </p>
            <BrokerNewsList items={brokerNews.items} />
            <p className="m-0 mt-4 text-sm leading-[1.75] text-bk-muted">
              ພວກເຮົາສະຫຼຸບຂ່າວຂອງຜູ້ອື່ນ ບໍ່ແມ່ນລາຍງານເອງ — ກ່ອນຕັດສິນໃຈ ຄວນກວດກັບຕົ້ນສະບັບ ແລະ ທະບຽນຂອງຜູ້ກຳກັບດູແລ
            </p>
          </section>
        )}

        {/* ── how we rate ───────────────────────────────────────────────── */}
        <section id="how-we-rate" className="mt-12 scroll-mt-24 rounded-bk border border-bk-line p-6 sm:p-8">
          <h2 className="m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
            ພວກເຮົາໃຫ້ຄະແນນແນວໃດ
          </h2>
          <p className="mt-4 text-base leading-[1.75] text-bk-muted">
            ທຸກໂບຣກເກີໃນລາຍການນີ້ພວກເຮົາເປີດບັນຊີຈິງ ຝາກເງິນຈິງ ແລະ ຖອນເງິນຈິງ ກ່ອນຈະໃຫ້ຄະແນນ 5 ດ້ານ —
            ຄວາມໝັ້ນຄົງ, ການຝາກ-ຖອນ, Spread, Support ແລະ ໂປຣໂມຊັ່ນ ແຕ່ລະດ້ານໃຫ້ 1 ຫາ 5 ແລ້ວສະເລ່ຍເປັນຄະແນນລວມ
          </p>
          <p className="mt-4 text-base leading-[1.75] text-bk-muted">
            ຊ່ອງໃດທີ່ຂຽນວ່າ “ຍັງບໍ່ມີຂໍ້ມູນ” ແມ່ນພວກເຮົາຍັງບໍ່ທັນໄດ້ທົດສອບ ຫຼື ຍັງຢືນຢັນກັບທະບຽນຂອງຜູ້ກຳກັບດູແລບໍ່ໄດ້ —
            ພວກເຮົາເລືອກປະໄວ້ຫວ່າງແທນທີ່ຈະເຕີມຕົວເລກທີ່ບໍ່ແນ່ໃຈ
          </p>
        </section>

        {/* ── articles ──────────────────────────────────────────────────── */}
        {articles?.length > 0 && (
          <section className="mt-12">
            <h2 className="m-0 mb-4 text-[26px] font-bold leading-tight tracking-[-0.025em] text-bk-ink sm:text-[30px]">
              ບົດຄວາມກ່ຽວກັບໂບຣກເກີ
            </h2>
            <div className="overflow-hidden rounded-bk border border-bk-line">
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 border-t border-bk-line pt-6">
          <p className="m-0 text-sm leading-[1.75] text-bk-muted">
            <strong className="font-semibold text-bk-ink">ການເປີດເຜີຍຂໍ້ມູນ:</strong>{" "}
            ພວກເຮົາໄດ້ຮັບຄ່າຕອບແທນເມື່ອທ່ານເປີດບັນຊີຜ່ານລິ້ງຂອງພວກເຮົາ ແຕ່ອັນດັບ ແລະ ຄະແນນມາຈາກການທົດສອບຈິງ
            ບໍ່ໄດ້ມາຈາກຄ່າຕອບແທນ · ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ ທ່ານອາດສູນເສຍເງິນທຶນທັງໝົດ
          </p>
        </div>
      </div>
    </div>
  )
}
