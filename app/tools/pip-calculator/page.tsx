"use client"
import { useState } from "react"

export default function PipCalculatorPage() {
  const [lot, setLot]       = useState(0.1)
  const [pips, setPips]     = useState(10)
  const [pair, setPair]     = useState("EURUSD")

  // Simplified pip value calculation (USD pairs)
  const pipValue = pair.includes("JPY") ? (lot * 100000 * 0.01) / 154 : lot * 100000 * 0.0001
  const profit = pipValue * pips

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="font-lao font-bold text-2xl mb-2">Pip <span className="text-gold">Calculator</span></h1>
      <p className="font-lao text-white/40 text-sm mb-8">ຄຳນວນ Pip Value ແລະ ກຳໄລ/ຂາດທຶນ</p>

      <div className="card p-6 flex flex-col gap-5">
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">Currency Pair</label>
          <select value={pair} onChange={e => setPair(e.target.value)}
            className="w-full bg-lft-dark3 border border-white/10 text-white text-sm px-3 py-2.5 rounded outline-none focus:border-gold/40 font-mono">
            {["EURUSD","GBPUSD","USDJPY","XAUUSD","AUDUSD","USDCHF"].map(p=>(
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">Lot Size: <span className="text-white font-mono">{lot}</span></label>
          <input type="range" min={0.01} max={10} step={0.01} value={lot}
            onChange={e => setLot(parseFloat(e.target.value))}
            className="w-full accent-gold" />
          <div className="flex justify-between text-[10px] text-white/25 font-mono mt-1"><span>0.01</span><span>10</span></div>
        </div>
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">Pips: <span className="text-white font-mono">{pips}</span></label>
          <input type="range" min={1} max={500} step={1} value={pips}
            onChange={e => setPips(parseInt(e.target.value))}
            className="w-full accent-gold" />
          <div className="flex justify-between text-[10px] text-white/25 font-mono mt-1"><span>1</span><span>500</span></div>
        </div>

        <div className="bg-gold/6 border border-gold/15 rounded-lg p-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Pip Value</div>
              <div className="font-mono text-lg font-semibold text-gold">${pipValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">ກຳໄລ/ຂາດທຶນ</div>
              <div className="font-mono text-lg font-semibold text-green-400">${profit.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
