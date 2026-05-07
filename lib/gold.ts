// Shared gold-price fetcher used by both the /api/gold route and the
// homepage server component. Tries Yahoo Finance first because its
// chart endpoint gives us the previous-close price needed for a real
// 24h change figure; falls back to gold-api.com when Yahoo refuses.

const LAO_BAHT_OZ_FRACTION = 0.49 // 1 ບາດ ≈ 0.49 troy oz
const FALLBACK_USD_LAK     = 22000

export interface GoldSnapshot {
  price: number              // XAU/USD spot
  previousClose: number | null
  change: number             // current − previousClose (0 if unknown)
  changePct: number
  laoGoldLAK: number         // ກີບ per ບາດ (rounded)
  usdLak: number
  updatedAt: string          // ISO
  source: "yahoo" | "gold-api" | "fallback"
}

interface RawGold {
  price: number
  previousClose: number | null
  source: "yahoo" | "gold-api"
}

async function fetchYahoo(): Promise<RawGold | null> {
  try {
    // range=2d gives us yesterday's close + today's live price.
    // chartPreviousClose with this range is yesterday's close, which is
    // what we want for a real day-over-day change.
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d",
      {
        next: { revalidate: 60 },
        headers: { "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0" },
      },
    )
    if (!res.ok) return null
    const d: any = await res.json()
    const result = d?.chart?.result?.[0]
    const meta = result?.meta
    const price = Number(meta?.regularMarketPrice)
    if (!price || isNaN(price)) return null
    // Prefer chartPreviousClose for range=2d, fall back to closes[-2]
    let prev: number | null = null
    const cpc = Number(meta?.chartPreviousClose)
    if (cpc && !isNaN(cpc)) {
      prev = cpc
    } else {
      const closes: Array<number | null> = result?.indicators?.quote?.[0]?.close ?? []
      const valid = closes.filter((v): v is number => typeof v === "number" && !isNaN(v))
      if (valid.length >= 2) prev = valid[valid.length - 2]
    }
    return { price, previousClose: prev, source: "yahoo" }
  } catch {
    return null
  }
}

async function fetchGoldApi(): Promise<RawGold | null> {
  try {
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      next: { revalidate: 60 },
      headers: { "User-Agent": "LaoForexTrader/1.0" },
    })
    if (!res.ok) return null
    const d: any = await res.json()
    const price = Number(d?.price)
    if (!price || isNaN(price)) return null
    return { price, previousClose: null, source: "gold-api" }
  } catch {
    return null
  }
}

async function fetchUsdLak(): Promise<number> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 }, // FX rate is slow-moving, cache 1h
    })
    if (res.ok) {
      const d: any = await res.json()
      const r = Number(d?.rates?.LAK)
      if (r && !isNaN(r)) return r
    }
  } catch {}
  return FALLBACK_USD_LAK
}

export async function getGoldSnapshot(): Promise<GoldSnapshot | null> {
  const [raw, usdLak] = await Promise.all([
    fetchYahoo().then(y => y || fetchGoldApi()),
    fetchUsdLak(),
  ])
  if (!raw) return null

  const change    = raw.previousClose ? raw.price - raw.previousClose : 0
  const changePct = raw.previousClose ? (change / raw.previousClose) * 100 : 0

  const pricePerBahtUSD = raw.price * LAO_BAHT_OZ_FRACTION
  const laoGoldLAK      = Math.round(pricePerBahtUSD * usdLak)

  return {
    price: raw.price,
    previousClose: raw.previousClose,
    change,
    changePct,
    laoGoldLAK,
    usdLak,
    updatedAt: new Date().toISOString(),
    source: raw.source,
  }
}
