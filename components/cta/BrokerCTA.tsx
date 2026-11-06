'use client'

// The broker CTA that sits inside an article.
//
// It used to be a gradient card per broker — six colour themes, a floating
// blob, a shimmer, a scanning line and a pulsing button glow — carrying four
// hand-written claims ("ຝາກ $5 · BCEL ✓ · Bonus $30 ຟຣີ") typed into
// CTASelector. Two things were wrong with that beyond the noise: those claims
// had no connection to the broker's Studio record, so editing a minimum
// deposit on /broker left every article still promising the old one; and six
// saturated gradients inside a reading column competed with the article for
// attention while telling the reader nothing checkable.
//
// So it is now the same flat surface as /broker — one radius, hairline border,
// no shadow — built from the broker's own fields. A field nobody has filled in
// renders as "—" rather than disappearing or being guessed at, which is the
// rule the whole review surface follows.

import Image from 'next/image'
import Link from 'next/link'
import { trackClick, brokerTarget } from '@/lib/trackClick'
import { event } from '@/lib/gtag'
import type { Broker } from '@/types'
import {
  licensesOf,
  minDepositLabel,
  spreadLabel,
  laoDepositState,
  LAO_DEPOSIT_SHORT,
  registerHref,
  gradeColor,
  gradeInk,
} from '@/lib/broker'
import { Flag, ArrowIcon, btnSolid } from '@/components/broker/review/BrokerBits'

interface Props {
  /** The Studio record. Null when the lookup found nothing — see below. */
  broker: Broker | null
  /** Display name, and the fallback when there is no record to read. */
  name: string
  slug: string
  /**
   * The affiliate link held in code. The Studio record wins when it has one,
   * because that is where links are maintained; this is what keeps the CTA
   * clickable for a broker whose doc has no URL yet, and it deliberately
   * outranks `website` so a plain homepage never silently replaces an
   * affiliate link.
   */
  fallbackRegisterUrl: string
}

export default function BrokerCTA({ broker, name, slug, fallbackRegisterUrl }: Props) {
  const licenses = broker ? licensesOf(broker) : []
  const rating = broker?.rating
  const logo = broker?.logo?.asset?.url as string | undefined
  const href =
    broker?.registerUrl || broker?.affiliateUrl || fallbackRegisterUrl || broker?.website || null

  const stats: { label: string; value: string | null; strong?: boolean }[] = broker
    ? [
        { label: 'ຝາກຂັ້ນຕ່ຳ', value: minDepositLabel(broker) },
        { label: 'Spread ຈາກ', value: spreadLabel(broker) },
        { label: 'Leverage', value: broker.maxLeverage ?? null },
        {
          label: 'ຝາກຜ່ານທະນາຄານລາວ',
          value: LAO_DEPOSIT_SHORT[laoDepositState(broker)],
          strong: laoDepositState(broker) === 'full',
        },
      ]
    : []

  return (
    <div className="my-6 rounded-bk border border-bk-line bg-bk-surface">
      {/* ── head ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 sm:gap-3.5 sm:p-5">
        {logo ? (
          <Image
            src={logo}
            alt=""
            width={46}
            height={46}
            data-no-dim
            className="shrink-0 rounded-bk border border-bk-line object-cover"
            style={{ width: 46, height: 46 }}
          />
        ) : (
          <span className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-bk border border-bk-line font-mono text-sm font-bold text-bk-muted">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[17px] font-bold leading-snug tracking-[-0.02em] text-bk-ink">
              {name}
            </span>
            {broker?.rank === 1 && (
              <span className="shrink-0 whitespace-nowrap rounded-md border border-bk-ink px-1.5 py-px text-[10px] font-bold text-bk-ink">
                ອັນດັບ 1
              </span>
            )}
          </div>

          {licenses.length > 0 ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              {licenses.slice(0, 3).map((l, i) => (
                <Flag key={`${l.regulator}-${i}`} src={l.flag} alt={l.country ?? ''} w={17} h={12} />
              ))}
              <span className="truncate text-xs text-bk-muted">
                {licenses
                  .slice(0, 3)
                  .map((l) => l.regulator)
                  .join(' · ')}
                {licenses.length > 3 ? ` +${licenses.length - 3}` : ''}
              </span>
            </div>
          ) : (
            <span className="mt-1.5 block text-xs text-bk-muted">ຍັງບໍ່ໄດ້ບັນທຶກໃບອະນຸຍາດ</span>
          )}
        </div>

        {typeof rating === 'number' && (
          <span
            className="inline-flex min-w-[44px] shrink-0 items-center justify-center rounded-bk px-2.5 py-1.5 font-mono text-[15px] font-bold tracking-[-0.02em]"
            style={{ background: gradeColor(rating), color: gradeInk(rating) }}
          >
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* ── the numbers a reader is actually weighing ─────────────────── */}
      {stats.length > 0 && (
        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-bk-line px-4 py-4 sm:grid-cols-4 sm:px-5">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="truncate text-[11px] leading-tight text-bk-muted">{s.label}</dt>
              <dd
                className={`m-0 mt-1 truncate font-mono text-[15px] font-bold tracking-[-0.02em] ${
                  s.value === null ? 'text-bk-muted' : s.strong ? 'text-ok-ink dark:text-ok' : 'text-bk-ink'
                }`}
              >
                {s.value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* ── actions ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-bk-line px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => {
              event({ action: 'broker_click', category: 'Broker', label: name })
              trackClick({ target: brokerTarget(slug || name), label: name, group: 'broker' })
            }}
            className={`${btnSolid} w-full sm:w-auto`}
          >
            ສະໝັກ {name}
            <ArrowIcon size={15} />
          </a>
        )}
        <Link
          href={`/broker/${slug}`}
          className="text-center text-sm font-semibold text-bk-muted underline decoration-bk-line underline-offset-4 hover:text-bk-ink sm:text-left"
        >
          ອ່ານລີວິວເຕັມ
        </Link>
      </div>
    </div>
  )
}
