"use client"
import { useState } from "react"

export default function LotCalculatorPage() {
  const [balance,   setBalance]   = useState(1000)
  const [riskPct,   setRiskPct]   = useState(2)
  const [stopLoss,  setStopLoss]  = useState(20)
  const [pair,      setPair]      = useState("EURUSD")

  const riskAmount = (balance * riskPct) / 100
  const pipValue   = pair.includes("JPY") ? 0.65 : 10  // per standard lot approx
  const lotSize    = riskAmount / (stopLoss * pipValue)

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="font-lao font-bold text-2xl mb-2">Lot Size <span className="text-gold">Calculator</span></h1>
      <p className="font-lao text-white/40 text-sm mb-8">ຄຳນວນ Lot Size ຕາມ Risk Management</p>

      <div className="card p-6 flex flex-col gap-5">
        {/* Balance */}
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">
            ທຶນ (Balance): <span className="text-white font-mono">${balance.toLocaleString()}</span>
          </label>
          <input type="range" min={100} max={100000} step={100} value={balance}
            onChange={e => setBalance(+e.target.value)} className="w-full accent-gold" />
          <div className="flex justify-between text-[10px] text-white/25 font-mono mt-1"><span>$100</span><span>$100,000</span></div>
        </div>

        {/* Risk % */}
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">
            Risk %: <span className="text-white font-mono">{riskPct}%</span>
          </label>
          <input type="range" min={0.5} max={10} step={0.5} value={riskPct}
            onChange={e => setRiskPct(+e.target.value)} className="w-full accent-gold" />
          <div className="flex justify-between text-[10px] text-white/25 font-mono mt-1"><span>0.5%</span><span>10%</span></div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">
            Stop Loss (Pips): <span className="text-white font-mono">{stopLoss}</span>
          </label>
          <input type="range" min={5} max={200} step={1} value={stopLoss}
            onChange={e => setStopLoss(+e.target.value)} className="w-full accent-gold" />
          <div className="flex justify-between text-[10px] text-white/25 font-mono mt-1"><span>5</span><span>200</span></div>
        </div>

        {/* Pair */}
        <div>
          <label className="font-lao text-xs text-white/40 mb-2 block">Currency Pair</label>
          <select value={pair} onChange={e => setPair(e.target.value)}
            className="w-full bg-lft-dark3 border border-white/10 text-white text-sm px-3 py-2.5 rounded outline-none font-mono">
            {["EURUSD","GBPUSD","USDJPY","XAUUSD","AUDUSD"].map(p=>(
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Result */}
        <div className="bg-gold/6 border border-gold/15 rounded-lg p-4 mt-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Risk Amount</div>
              <div className="font-mono text-base font-semibold text-red-400">${riskAmount.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Lot Size</div>
              <div className="font-mono text-xl font-semibold text-gold">{lotSize.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Mini Lots</div>
              <div className="font-mono text-base font-semibold text-white/70">{(lotSize * 10).toFixed(1)}</div>
            </div>
          </div>
        </div>

        <p className="font-lao text-[10px] text-white/20 text-center">
          ⚠️ ຄຳນວນຄ່າຕົວຢ່າງ · Pip value ອາດຕ່າງກັນຕາມ Broker
        </p>
      </div>
    </div>
  )
}
