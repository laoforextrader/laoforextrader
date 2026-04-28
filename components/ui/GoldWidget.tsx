'use client'
import { useEffect, useState } from 'react'

interface GoldData {
  xauusd: number
  goldLakPerBaht: number
  change: number
  changePct: number
}

const FALLBACK: GoldData = { xauusd: 2318.40, goldLakPerBaht: 24_870_000, change: 7.80, changePct: 0.34 }
const G_PER_OZ   = 31.1035
const G_PER_BAHT = 15.244
const USD_LAK    = 22000

export function GoldWidget() {
  const [d, setD]       = useState<GoldData>(FALLBACK)
  const [isLive, setLive] = useState(false)

  const refresh = async () => {
    try {
      const res = await fetch('/api/gold')
      if (!res.ok) return
      const j = await res.json()
      const price = Number(j.price)
      const prev  = Number(j.prev)
      if (!price) return
      const change       = price - prev
      const changePct    = prev ? (change / prev) * 100 : 0
      const goldLakPerBaht = (price / G_PER_OZ) * G_PER_BAHT * USD_LAK
      setD({ xauusd: price, goldLakPerBaht, change, changePct })
      setLive(true)
    } catch {}
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [])

  const up = d.change >= 0

  return (
    <div className="hidden lg:block card p-4 animate-float shadow-xl">
      {/* XAUUSD header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">XAUUSD Live</span>
        <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {isLive ? 'LIVE' : 'EST'}
        </span>
      </div>

      {/* Price */}
      <div className="font-mono text-2xl font-medium text-gray-900 mb-0.5">
        {d.xauusd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={`font-mono text-[11px] font-semibold mb-2 ${up ? 'text-green-600' : 'text-red-500'}`}>
        {up ? '▲' : '▼'} {up ? '+' : ''}{d.change.toFixed(2)} ({up ? '+' : ''}{d.changePct.toFixed(2)}%)
      </div>

      {/* Lao gold price */}
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg mb-2.5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>🪙</span>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D97706' }}>ທອງລາວ / ບາດ</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#92400E' }}>
            {Math.round(d.goldLakPerBaht).toLocaleString()} ກີບ
          </div>
        </div>
      </div>

      {/* Other pairs */}
      {[
        ["EURUSD","1.0812","▼-0.12%","red"],
        ["USDJPY","154.62","▲+0.21%","green"],
        ["BTCUSD","64,820","▲+1.45%","green"],
      ].map(([pair, price, ch, color]) => (
        <div key={pair} className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg mb-1.5 last:mb-0">
          <span className="font-mono text-[11px] font-medium text-gray-800">{pair}</span>
          <span className="font-mono text-[11px] text-gray-500">{price}</span>
          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${color === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{ch}</span>
        </div>
      ))}
    </div>
  )
}
