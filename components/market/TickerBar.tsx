"use client"
import { useEffect, useState } from "react"
import { MarketPrice } from "@/types"

const DEFAULT_PRICES: MarketPrice[] = [
  { pair:"XAUUSD", price:2318.40, change:7.80,    changePct:0.34  },
  { pair:"EURUSD", price:1.0812,  change:-0.0013,  changePct:-0.12 },
  { pair:"USDJPY", price:154.62,  change:0.32,     changePct:0.21  },
  { pair:"GBPUSD", price:1.2543,  change:-0.0010,  changePct:-0.08 },
  { pair:"BTCUSD", price:64820,   change:928,      changePct:1.45  },
  { pair:"USDLAK", price:21450,   change:-10,      changePct:-0.05 },
  { pair:"XAGUSD", price:29.45,   change:0.15,     changePct:0.51  },
  { pair:"NASDAQ", price:17820,   change:110,      changePct:0.62  },
]

function fmt(pair: string, price: number): string {
  if (pair === "BTCUSD" || pair === "USDLAK" || pair === "NASDAQ") return price.toLocaleString("en-US", { maximumFractionDigits:0 })
  if (pair === "XAUUSD" || pair === "XAGUSD") return price.toFixed(2)
  return price.toFixed(4)
}

export function MarketTicker() {
  const [prices, setPrices] = useState<MarketPrice[]>(DEFAULT_PRICES)
  const doubled = [...prices, ...prices]

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price: p.price * (1 + (Math.random() - 0.5) * 0.001),
        changePct: parseFloat((p.changePct + (Math.random() - 0.5) * 0.02).toFixed(2)),
      })))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background:"#fff", borderBottom:"1px solid #D4D8E5", height:32, overflow:"hidden", display:"flex", alignItems:"center", position:"relative" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:24, background:"linear-gradient(90deg,#fff,transparent)", zIndex:2 }} />
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:24, background:"linear-gradient(-90deg,#fff,transparent)", zIndex:2 }} />
      <div className="animate-ticker" style={{ display:"flex", gap:0, whiteSpace:"nowrap", width:"max-content" }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"0 16px", borderRight:"1px solid #E5E7EB", flexShrink:0, fontFamily:"'JetBrains Mono', monospace", fontSize:11 }}>
            <span style={{ color:"#6B7280", fontWeight:500 }}>{item.pair}</span>
            <span style={{ color:"#111827", fontWeight:500 }}>{fmt(item.pair, item.price)}</span>
            <span style={{
              fontSize:10, padding:"1px 5px", borderRadius:4, fontWeight:600,
              color: item.changePct >= 0 ? "#059669" : "#DC2626",
              background: item.changePct >= 0 ? "#DCFCE7" : "#FEE2E2",
            }}>
              {item.changePct >= 0 ? "+" : ""}{item.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Default export สำหรับ TickerBar (backward compat)
export default MarketTicker
