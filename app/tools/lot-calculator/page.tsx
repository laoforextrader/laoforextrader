"use client"
import { useState } from "react"

export default function LotCalculatorPage() {
  const [balance,  setBalance]  = useState(1000)
  const [riskPct,  setRiskPct]  = useState(2)
  const [stopLoss, setStopLoss] = useState(20)
  const [pair,     setPair]     = useState("EURUSD")

  const riskAmount = (balance * riskPct) / 100
  const pipValue   = pair.includes("JPY") ? 0.65 : 10
  const lotSize    = riskAmount / (stopLoss * pipValue)

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 6 }}>
          ເຄື່ອງມື Forex
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Lot Size Calculator
        </h1>
        <p style={{ fontSize: 13, color: "#374151", marginBottom: 28 }}>
          ຄຳນວນ Lot Size ຕາມ Risk Management
        </p>

        <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Balance */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              ທຶນ (Balance): <span style={{ color: "#2563EB", fontFamily: "monospace" }}>${balance.toLocaleString()}</span>
            </label>
            <input type="range" min={100} max={100000} step={100} value={balance}
              onChange={e => setBalance(+e.target.value)}
              style={{ width: "100%", accentColor: "#2563EB" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 4 }}>
              <span>$100</span><span>$100,000</span>
            </div>
          </div>

          {/* Risk % */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              Risk %: <span style={{ color: "#DC2626", fontFamily: "monospace" }}>{riskPct}%</span>
            </label>
            <input type="range" min={0.5} max={10} step={0.5} value={riskPct}
              onChange={e => setRiskPct(+e.target.value)}
              style={{ width: "100%", accentColor: "#DC2626" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 4 }}>
              <span>0.5%</span><span>10%</span>
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              Stop Loss (Pips): <span style={{ color: "#374151", fontFamily: "monospace" }}>{stopLoss}</span>
            </label>
            <input type="range" min={5} max={200} step={1} value={stopLoss}
              onChange={e => setStopLoss(+e.target.value)}
              style={{ width: "100%", accentColor: "#2563EB" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 4 }}>
              <span>5</span><span>200</span>
            </div>
          </div>

          {/* Pair */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              Currency Pair
            </label>
            <select value={pair} onChange={e => setPair(e.target.value)}
              style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#111827", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}>
              {["EURUSD","GBPUSD","USDJPY","XAUUSD","AUDUSD"].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Result */}
          <div style={{ background: "#EEF3FF", border: "1.5px solid #BFCFFF", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 6 }}>Risk Amount</div>
                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "#DC2626" }}>${riskAmount.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 6 }}>Lot Size</div>
                <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "#2563EB" }}>{lotSize.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 6 }}>Mini Lots</div>
                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "#374151" }}>{(lotSize * 10).toFixed(1)}</div>
              </div>
            </div>
          </div>

        </div>

        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 16 }}>
          ⚠ ຄຳນວນຄ່າຕົວຢ່າງ · Pip value ອາດຕ່າງກັນຕາມ Broker
        </p>
      </div>
    </div>
  )
}
