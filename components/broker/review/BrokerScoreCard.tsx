// The headline score block: one huge number, a word, stars, and the five
// category bars beside it.
//
// It is the review-site move — hierarchy from size, not from weight or fill.
// The number is ~5× body size at 84px; everything else on the card stays at
// 700 weight or lighter, which is why it reads as authoritative instead of
// shouty.

import Link from "next/link"
import Image from "next/image"
import type { Broker } from "@/types"
import { SCORE_ROWS, licensesOf, scoreWord } from "@/lib/broker"
import { LicenseChips, ScoreBars, Stars } from "./BrokerBits"
import CountUp from "./CountUp"

export default function BrokerScoreCard({
  broker,
  rankNote,
  showIdentity = true,
}: {
  broker: Broker
  rankNote?: string
  showIdentity?: boolean
}) {
  const rating = broker.rating ?? 0
  const logo = broker.logo?.asset?.url as string | undefined
  const rows = SCORE_ROWS.map((r) => ({
    label: r.label,
    value: broker.ratingBreakdown?.[r.key],
  }))

  return (
    <div className="rounded-bk border border-bk-line">
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <div>
          {showIdentity && (
            <div className="mb-4 flex items-center gap-3.5">
              {logo && (
                <Image
                  src={logo}
                  alt={broker.name}
                  width={52}
                  height={52}
                  data-no-dim
                  className="shrink-0 rounded-bk border border-bk-line object-cover"
                  style={{ width: 52, height: 52 }}
                />
              )}
              <span className="flex min-w-0 flex-col gap-1.5">
                <Link
                  href={`/broker/${broker.slug?.current ?? ""}`}
                  className="text-[19px] font-bold leading-tight tracking-[-0.02em] text-bk-ink no-underline hover:underline"
                >
                  {broker.name}
                </Link>
                {rankNote && <span className="text-sm leading-normal text-bk-muted">{rankNote}</span>}
              </span>
            </div>
          )}

          <div className="font-mono text-[64px] font-bold leading-[0.95] tracking-[-0.05em] text-bk-ink sm:text-[84px]">
            <CountUp to={rating} />
          </div>
          <div className="mt-2 text-[22px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
            {scoreWord(rating)}
          </div>
          <div className="mt-4">
            <Stars rating={rating} size={24} animate />
          </div>
          <div className="mt-4 text-sm leading-normal text-bk-muted">ຄະແນນຈາກການທົດສອບ 5 ດ້ານ</div>

          {showIdentity && (
            <LicenseChips licenses={licensesOf(broker)} max={4} className="mt-4" />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <ScoreBars rows={rows} />
        </div>
      </div>

      <div className="border-t border-bk-line px-6 py-5 text-center sm:px-8">
        <Link href="/broker#how-we-rate" className="text-[15px] font-medium text-bk-ink underline">
          ພວກເຮົາໃຫ້ຄະແນນແນວໃດ
        </Link>
      </div>
    </div>
  )
}
