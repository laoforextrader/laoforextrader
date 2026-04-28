'use client'
import { useEffect, useRef, useState } from 'react'

// 1 Lao Baht (ບາດ) ≈ 0.49 Troy Oz
const LAO_BAHT_OZ_FRACTION = 0.49
const FALLBACK_USD_LAK     = 22000

async function fetchSpotGold(): Promise<number | null> {
  // 1) Direct from gold-api.com (free, CORS-enabled, no key required)
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', { cache: 'no-store' })
    if (res.ok) {
      const d: any = await res.json()
      const p = Number(d?.price)
      if (p && !isNaN(p)) return p
    }
  } catch {}

  // 2) Fallback: server proxy /api/gold (which also uses gold-api.com)
  try {
    const res = await fetch('/api/gold', { cache: 'no-store' })
    if (res.ok) {
      const d: any = await res.json()
      const p = Number(d?.price)
      if (p && !isNaN(p)) return p
    }
  } catch {}

  return null
}

async function fetchUsdLak(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' })
    if (res.ok) {
      const d: any = await res.json()
      const r = Number(d?.rates?.LAK)
      if (r) return r
    }
  } catch {}
  return FALLBACK_USD_LAK
}

export function useGoldPrice() {
  const [xauusd, setXauusd]         = useState<number | null>(null)
  const [laoGoldLAK, setLaoGoldLAK] = useState<number | null>(null)
  const [change, setChange]         = useState<number>(0)
  const [changePct, setChangePct]   = useState<number>(0)
  const [isLive, setIsLive]         = useState(false)
  const prevPrice                    = useRef<number | null>(null)

  const fetchPrices = async () => {
    const [spot, usdLak] = await Promise.all([fetchSpotGold(), fetchUsdLak()])
    if (!spot) return // keep last known values, do not show fake price

    if (prevPrice.current !== null) {
      const ch = spot - prevPrice.current
      setChange(ch)
      setChangePct(prevPrice.current ? (ch / prevPrice.current) * 100 : 0)
    }
    prevPrice.current = spot

    const pricePerBahtUSD = spot * LAO_BAHT_OZ_FRACTION
    const pricePerBahtLAK = Math.round(pricePerBahtUSD * usdLak)

    setXauusd(spot)
    setLaoGoldLAK(pricePerBahtLAK)
    setIsLive(true)
  }

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, 60_000)
    return () => clearInterval(id)
  }, [])

  return { xauusd, laoGoldLAK, change, changePct, isLive }
}
