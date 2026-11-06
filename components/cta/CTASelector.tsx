import BrokerCTA from './BrokerCTA'
import EaCTA from './EaCTA'
import { sanityClient, QUERIES } from '@/lib/sanity'
import { currentMonthKey, monthKeyLabel, monthPctFor } from '@/lib/eaMonth'
import type { Broker, EAStats } from '@/types'

/**
 * Maps a CTA key to the broker's Studio record, so an inline CTA publishes the
 * same minimum deposit, spread and licences as /broker does. The numbers used
 * to be typed into this file, which meant /broker and every article could
 * disagree about the same broker and nothing would flag it.
 *
 * The affiliate URLs stay here on purpose: they are the one thing in a CTA
 * that is not a fact about the broker, and a doc saved in Studio without a
 * registerUrl must not be able to drop a live link.
 */
const BROKERS = {
  'broker-xm':           { slug: 'xm',           name: 'XM Global',          registerUrl: 'https://affs.click/xXymd' },
  'broker-exness':       { slug: 'exness',       name: 'Exness',             registerUrl: 'https://one.exnessonelink.com/intl/th/a/tv2hiv2h' },
  'broker-markets4you':  { slug: 'markets4you',  name: 'Markets4you',        registerUrl: 'https://www.markets4you.online/?affid=xpkpced' },
  'broker-vantage':      { slug: 'vantage',      name: 'Vantage Markets',    registerUrl: 'https://www.vantagemarkets.com/?affid=NzExNDc=' },
  'broker-interstellar': { slug: 'interstellar', name: 'Interstellar Group', registerUrl: 'https://my.fisg.com/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs' },
  'broker-iux':          { slug: 'iux',          name: 'IUX',                registerUrl: 'http://iux.com/en/register?code=NMP0eN4X' },
} satisfies Record<string, { slug: string; name: string; registerUrl: string }>

const EAS = {
  'ea-sgride': {
    eaId: 'sgride',
    name: 'SGrid',
    sub: 'Grid Trading · ກຳໄລໝັ້ນຄົງ · ກ໊ອບໄດ້ທັນທີ',
    href: '/ea-system',
    fallbackTotal: '+500%',
    fallbackMonth: '+18.7%',
    comingSoon: false,
  },
  'ea-megihgedge': {
    eaId: 'megihedge',
    name: 'MegiHedge v2.0',
    sub: 'Hedging · ກຳໄລໄວ · ກ໊ອບໄດ້ທັນທີ',
    href: '/ea-system',
    fallbackTotal: '+247%',
    fallbackMonth: '+22.1%',
    // Live since 2026-11-06: the eaStats doc reports updateMode "daily" with
    // twelve months of history, so the figures above are only the
    // not-yet-shipped placeholder and the card shows the real account.
    comingSoon: false,
  },
  'ea-abs': {
    eaId: 'abs',
    name: 'ABS v2.0',
    sub: 'Breakout · Gold & EUR/JPY · ຄວາມສ່ຽງຕ່ຳ · ກ໊ອບໄດ້ທັນທີ',
    href: '/ea-system/abs-backtest',
    fallbackTotal: '+180%',
    fallbackMonth: '+9.4%',
    comingSoon: false,
  },
} satisfies Record<
  string,
  {
    eaId: string
    name: 'SGrid' | 'MegiHedge v2.0' | 'ABS v2.0'
    sub: string
    href: string
    fallbackTotal: string
    fallbackMonth: string
    comingSoon?: boolean
  }
>

export type CTAType = keyof typeof BROKERS | keyof typeof EAS

interface Props {
  type?: CTAType | string
}

function fmtPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

async function getBroker(slug: string): Promise<Broker | null> {
  try {
    return await sanityClient.fetch<Broker | null>(
      QUERIES.brokerBySlug(slug),
      {},
      { next: { revalidate: 3600 } },
    )
  } catch {
    // A CTA with no record still renders its name and link; it just shows no
    // numbers, which is the right failure for a Sanity outage.
    return null
  }
}

async function getEALive(eaId: string): Promise<EAStats | null> {
  try {
    const stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId(eaId),
      {},
      { next: { revalidate: 60 } },
    )
    return stats && stats.updateMode !== 'off' ? stats : null
  } catch {
    return null
  }
}

export default async function CTASelector({ type }: Props) {
  if (!type) return null

  // `type` arrives from Sanity as a free string, so the lookup is the guard:
  // an unknown key falls through both maps and renders nothing.
  const broker = BROKERS[type as keyof typeof BROKERS]
  if (broker) {
    const record = await getBroker(broker.slug)
    return (
      <BrokerCTA
        broker={record}
        name={record?.name || broker.name}
        slug={broker.slug}
        fallbackRegisterUrl={broker.registerUrl}
      />
    )
  }

  const ea = EAS[type as keyof typeof EAS]
  if (ea) {
    const live = await getEALive(ea.eaId)
    const monthKey = currentMonthKey()

    // Three states, kept apart: no live data at all → the configured
    // placeholder (this EA has not shipped); live data with this month missing
    // → "—"; otherwise the recorded figure. Filling a gap in real data with a
    // placeholder would publish an invented result, which is exactly the rule
    // the monthly broadcast had to learn.
    const monthPct = monthPctFor(live?.monthlyReturns, monthKey)
    const monthGain =
      monthPct === undefined ? ea.fallbackMonth : monthPct === null ? '—' : fmtPct(monthPct)

    const totalGain =
      typeof live?.profitTotalPct === 'number' && !isNaN(live.profitTotalPct)
        ? fmtPct(live.profitTotalPct)
        : live
          ? '—'
          : ea.fallbackTotal

    return (
      <EaCTA
        name={ea.name}
        totalGain={totalGain}
        monthLabel={monthKeyLabel(monthKey)}
        monthGain={monthGain}
        sub={ea.sub}
        href={ea.href}
        comingSoon={ea.comingSoon}
      />
    )
  }

  return null
}
