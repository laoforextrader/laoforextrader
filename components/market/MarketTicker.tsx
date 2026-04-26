"use client"

const PAIRS = [
  { pair:"XAUUSD", price:"2,318.40", pct:"+0.34%", up:true  },
  { pair:"EURUSD", price:"1.0812",   pct:"-0.12%", up:false },
  { pair:"USDJPY", price:"154.62",   pct:"+0.21%", up:true  },
  { pair:"BTCUSD", price:"64,820",   pct:"+1.45%", up:true  },
  { pair:"GBPUSD", price:"1.2543",   pct:"-0.08%", up:false },
  { pair:"USDLAK", price:"21,450",   pct:"-0.05%", up:false },
  { pair:"NASDAQ", price:"17,820",   pct:"+0.62%", up:true  },
]
const DOUBLE = [...PAIRS, ...PAIRS]

export function MarketTicker() {
  return (
    <div className="bg-white border-b border-gray-200 py-1.5 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10" style={{ background:"linear-gradient(90deg,#fff,transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10" style={{ background:"linear-gradient(-90deg,#fff,transparent)" }} />
      <div className="flex gap-8 w-max animate-ticker">
        {DOUBLE.map((item, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-[11px] whitespace-nowrap">
            <span className="text-gray-400 font-medium">{item.pair}</span>
            <span className="text-gray-800 font-medium">{item.price}</span>
            <span className={`${item.up ? "text-green-600" : "text-red-500"} text-[10px]`}>{item.pct}</span>
            {i < DOUBLE.length - 1 && <span className="w-px h-2.5 bg-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  )
}
