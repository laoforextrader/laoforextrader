'use client'

// The EA CTA that sits inside an article.
//
// Two things about the version this replaces mattered more than its gradient:
//
// 1. It invented a number. The month figure was re-rendered every 2.5s as
//    `base + sin(t) * 0.3`, so a reader watched a live-looking percentage
//    drift by ±0.3 points that no account had ever produced. A trading site
//    cannot animate a return.
// 2. It published a percentage without naming its base. Every figure these
//    EAs report is measured against LIFETIME DEPOSITS, not the month's opening
//    balance, so "+24.7%" means "this month's profit equalled 24.7% of
//    deposited capital" — not that the account grew a quarter that month.
//    Every other surface that publishes these numbers carries that footnote
//    (the LINE caption, EAStatsCard); this one did not.
//
// So: no animation, no gradient, and the base is stated under the figures.

import Link from 'next/link'
import { trackClick } from '@/lib/trackClick'
import { ArrowIcon, btnSolid } from '@/components/broker/review/BrokerBits'

interface Props {
  name: 'SGrid' | 'MegiHedge v2.0' | 'ABS v2.0'
  /** Pre-formatted, e.g. "+500%". "—" when live data exists but is silent. */
  totalGain: string
  /** The month the figure belongs to, resolved by key upstream. */
  monthLabel: string
  monthGain: string
  sub: string
  href: string
  /** Pre-launch: the numbers are placeholders, so they are not shown at all. */
  comingSoon?: boolean
}

export default function EaCTA({
  name,
  totalGain,
  monthLabel,
  monthGain,
  sub,
  href,
  comingSoon = false,
}: Props) {
  // Stable id for /admin — 'MegiHedge v2.0' -> 'megihedge-v2-0'
  const eaSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  return (
    <div className="my-6 rounded-bk border border-bk-line bg-bk-surface">
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="m-0 text-[17px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
            TheRocket EA {name}
          </p>
          <p className="m-0 mt-1 text-[13px] leading-relaxed text-bk-muted">{sub}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-md border border-bk-line px-2 py-1 text-[11px] font-semibold text-bk-muted">
          {comingSoon ? 'ກຳລັງຈະເປີດ' : 'ບັນຊີຈິງ'}
        </span>
      </div>

      {!comingSoon && (
        <div className="border-t border-bk-line px-4 py-4 sm:px-5">
          <dl className="m-0 grid grid-cols-2 gap-4">
            <div className="min-w-0">
              <dt className="truncate text-[11px] leading-tight text-bk-muted">ກຳໄລລວມ</dt>
              <dd className="m-0 mt-1 font-mono text-[22px] font-bold leading-none tracking-[-0.02em] text-bk-ink">
                {totalGain}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="truncate text-[11px] leading-tight text-bk-muted">{monthLabel}</dt>
              <dd className="m-0 mt-1 font-mono text-[22px] font-bold leading-none tracking-[-0.02em] text-bk-ink">
                {monthGain}
              </dd>
            </div>
          </dl>
          <p className="m-0 mt-3.5 text-[11px] leading-relaxed text-bk-muted">
            % ຄິດທຽບກັບທຶນເລີ່ມຕົ້ນ (ເງິນຝາກລວມ) ບໍ່ແມ່ນການເຕີບໂຕຂອງບັນຊີໃນເດືອນນັ້ນ
          </p>
        </div>
      )}

      <div className="border-t border-bk-line px-4 py-4 sm:px-5">
        <Link
          href={href}
          onClick={() => trackClick({ target: `ea-cta-${eaSlug}`, label: name, group: 'ea' })}
          className={`${btnSolid} w-full sm:w-auto`}
        >
          {comingSoon ? 'ເບິ່ງລະບົບ' : 'Copy Trade'}
          <ArrowIcon size={15} />
        </Link>
      </div>
    </div>
  )
}
