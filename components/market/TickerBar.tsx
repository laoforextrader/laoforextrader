'use client'

import { useEffect, useState } from 'react'
import { MarketPrice } from '@/types'
import { formatPrice } from '@/lib/utils'

// Default prices (จะถูกแทนด้วย API จริงทีหลัง)
const DEFAULT_PRICES: MarketPrice[] = [
  { pair: 'XAUUSD', price: 2318.40, change: 7.80, changePct: 0.34, high: 2325.0, low: 2310.0 },
  { pair: 'EURUSD', price: 1.0812, change: -0.0013, changePct: -0.12, high: 1.0840, low: 1.0800 },
  { pair: 'USDJPY', price: 154.62, change: 0.32, changePct: 0.21, high: 155.00, low: 154.20 },
  { pair: 'GBPUSD', price: 1.2543, change: -0.0010, changePct: -0.08, high: 1.2580, low: 1.2530 },
  { pair: 'BTCUSD', price: 64820, change: 928, changePct: 1.45, high: 65500, low: 63800 },
  { pair: 'USDLAK', price: 21450, change: -10, changePct: -0.05, high: 21480, low: 21430 },
  { pair: 'XAGUSD', price: 29.45, change: 0.15, changePct: 0.51, high: 29.80, low: 29.20 },
  { pair: 'AUDUSD', price: 0.6531, change: -0.0008, changePct: -0.12, high: 0.6560, low: 0.6510 },
]

export default function TickerBar() {
  const [prices, setPrices] = useState<MarketPrice[]>(DEFAULT_PRICES)

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev =>
        prev.map(p => ({
          ...p,
          price: p.price * (1 + (Math.random() - 0.5) * 0.001),
          changePct: p.changePct + (Math.random() - 0.5) * 0.02,
        }))
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Double the array for seamless loop
  const doubled = [...prices, ...prices]

  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'var(--dark-2)',
        borderBottom: '1px solid var(--border)',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{
          animation: 'ticker 40s linear infinite',
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 font-mono text-xs"
            style={{
              borderRight: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.pair}</span>
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>
              {item.pair === 'BTCUSD' || item.pair === 'USDLAK'
                ? formatPrice(item.price, 0)
                : item.pair === 'XAUUSD'
                ? formatPrice(item.price, 2)
                : formatPrice(item.price, 4)}
            </span>
            <span
              className="text-xs px-1 rounded"
              style={{
                color: item.changePct >= 0 ? 'var(--green)' : 'var(--red)',
                background: item.changePct >= 0
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(239,68,68,0.1)',
              }}
            >
              {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
