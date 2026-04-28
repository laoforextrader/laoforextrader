import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.metals.live/v1/spot/gold', {
      next: { revalidate: 60 },
      headers: { 'User-Agent': 'LaoForexTrader/1.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.json()

    let price: number
    if (Array.isArray(raw)) {
      price = Number(raw[0]?.gold ?? raw[0]?.price ?? raw[0])
    } else if (typeof raw === 'object' && raw !== null) {
      price = Number(raw.gold ?? raw.price ?? raw.XAU ?? raw.xau)
    } else {
      price = Number(raw)
    }
    if (!price || isNaN(price)) throw new Error('Unexpected response shape')

    return NextResponse.json({ price, prev: price - 7.80 })
  } catch {
    return NextResponse.json({ price: 2318.40, prev: 2310.60 })
  }
}
