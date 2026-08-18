import BrokerCTA from './BrokerCTA'
import EaCTA from './EaCTA'
import { sanityClient, urlFor, QUERIES } from '@/lib/sanity'
import { EAStats } from '@/types'

function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

function fmtMonthly(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  return n.toFixed(1)
}

async function getEALive(eaId: string): Promise<EAStats | null> {
  try {
    const stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId(eaId),
      {},
      { next: { revalidate: 60 } }
    )
    return stats && stats.updateMode !== 'off' ? stats : null
  } catch {
    return null
  }
}

export type CTAType =
  | 'ea-sgride'
  | 'ea-megihgedge'
  | 'ea-abs'
  | 'broker-xm'
  | 'broker-exness'
  | 'broker-markets4you'
  | 'broker-vantage'
  | 'broker-interstellar'
  | 'broker-iux'

interface Props {
  type?: CTAType | string
}

type BrokerLite = { slug?: string; name?: string; logo?: any }

const BROKER_LOGOS_QUERY = `*[_type == "broker"]{
  "slug": slug.current,
  name,
  logo
}`

async function getBrokerLogo(key: string): Promise<string | undefined> {
  const list = await sanityClient.fetch<BrokerLite[]>(
    BROKER_LOGOS_QUERY,
    {},
    { next: { revalidate: 3600 } }
  )
  const k = key.toLowerCase()
  const exact = list.find(b => b.slug?.toLowerCase() === k)
  const match = exact ?? list.find(b => b.name?.toLowerCase().replace(/\s+/g, '').includes(k))
  if (!match?.logo?.asset) return undefined
  return urlFor(match.logo).width(88).height(88).url()
}

export default async function CTASelector({ type }: Props) {
  if (!type) return null

  if (type === 'ea-sgride') {
    const live = await getEALive('sgride')
    const lastMonth = live?.monthlyReturns?.length ? live.monthlyReturns[live.monthlyReturns.length - 1] : null
    return (
      <EaCTA
        name="SGride"
        totalGain={fmtPct(live?.profitTotalPct, '+500%')}
        monthlyGain={fmtMonthly(lastMonth?.profitPct, '18.7')}
        sub="Grid Trading · ກຳໄລໝັ້ນຄົງ · ກ໊ອບໄດ້ທັນທີ"
        href="/ea-system"
      />
    )
  }

  if (type === 'ea-megihgedge') {
    const live = await getEALive('megihedge')
    const lastMonth = live?.monthlyReturns?.length ? live.monthlyReturns[live.monthlyReturns.length - 1] : null
    return (
      <EaCTA
        name="MegiHedge v2.0"
        totalGain={fmtPct(live?.profitTotalPct, '+247%')}
        monthlyGain={fmtMonthly(lastMonth?.profitPct, '22.1')}
        sub="Hedging · ກຳໄລໄວ · ກ໊ອບໄດ້ທັນທີ"
        href="/ea-system"
        comingSoon
      />
    )
  }

  if (type === 'ea-abs') {
    const live = await getEALive('abs')
    const lastMonth = live?.monthlyReturns?.length ? live.monthlyReturns[live.monthlyReturns.length - 1] : null
    return (
      <EaCTA
        name="ABS v2.0"
        totalGain={fmtPct(live?.profitTotalPct, '+180%')}
        monthlyGain={fmtMonthly(lastMonth?.profitPct, '9.4')}
        sub="Breakout · Gold & EUR/JPY · ຄວາມສ່ຽງຕ່ຳ · ກ໊ອບໄດ້ທັນທີ"
        href="/ea-system/abs-backtest"
      />
    )
  }

  if (type === 'broker-xm') {
    const logoSrc = await getBrokerLogo('xm')
    return (
      <BrokerCTA name="XM Global" badge="★ #1 ຄົນລາວເລືອກຫຼາຍທີ່ສຸດ" sub="ຝາກ $5 · BCEL ✓ · Bonus $30 ຟຣີ · Regulated ASIC" registerUrl="https://affs.click/xXymd" logoInitials="XM" logoSrc={logoSrc} theme="xm" slug="xm" />
    )
  }

  if (type === 'broker-exness') {
    const logoSrc = await getBrokerLogo('exness')
    return (
      <BrokerCTA name="Exness" badge="ຖອນ Instant 24/7" sub="Spread ຕ່ຳ · BCEL ✓ · Leverage 1:2000" registerUrl="https://one.exnessonelink.com/intl/th/a/tv2hiv2h" logoInitials="EX" logoSrc={logoSrc} theme="exness" slug="exness" />
    )
  }

  if (type === 'broker-markets4you') {
    const logoSrc = await getBrokerLogo('markets4you')
    return (
      <BrokerCTA name="Markets4you" badge="Bonus ດີທີ່ສຸດ" sub="ຝາກ $15 · BCEL ✓ · Leverage 1:4000" registerUrl="https://www.markets4you.online/?affid=xpkpced" logoInitials="MA" logoSrc={logoSrc} theme="markets4you" slug="markets4you" />
    )
  }

  if (type === 'broker-vantage') {
    const logoSrc = await getBrokerLogo('vantage')
    return (
      <BrokerCTA name="Vantage Markets" badge="ສາກົນ · Multi-award" sub="ຝາກ $50 · Leverage 1:500 · ECN Spreads" registerUrl="https://www.vantagemarkets.com/?affid=NzExNDc=" logoInitials="VA" logoSrc={logoSrc} theme="vantage" slug="vantage" />
    )
  }

  if (type === 'broker-interstellar') {
    const logoSrc = await getBrokerLogo('interstellar')
    return (
      <BrokerCTA name="Interstellar Group" badge="ຮອງຮັບລາວ ✓" sub="ຝາກ $50 · BCEL ✓ · Leverage 1:2000" registerUrl="https://my.fisg.com/register/trader?link_id=qduy4q1d&referrer_id=W9cRXGUFs" logoInitials="IN" logoSrc={logoSrc} theme="interstellar" slug="interstellar" />
    )
  }

  if (type === 'broker-iux') {
    const logoSrc = await getBrokerLogo('iux')
    return (
      <BrokerCTA name="IUX" badge="App ດີທີ່ສຸດ" sub="ຝາກ $10 · BCEL ✓ · Leverage 1:3000" registerUrl="http://iux.com/en/register?code=NMP0eN4X" logoInitials="IU" logoSrc={logoSrc} theme="iux" slug="iux" />
    )
  }

  return null
}
