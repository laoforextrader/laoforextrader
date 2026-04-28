import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', {
      next: { revalidate: 60 },
      headers: { 'User-Agent': 'LaoForexTrader/1.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const raw: any = await res.json()
    const price = Number(raw?.price)
    if (!price || isNaN(price)) throw new Error('Unexpected response shape')

    return NextResponse.json({
      price,
      symbol: raw?.symbol ?? 'XAU',
      currency: raw?.currency ?? 'USD',
      updatedAt: raw?.updatedAt ?? new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'gold price unavailable' },
      { status: 503 }
    )
  }
}
