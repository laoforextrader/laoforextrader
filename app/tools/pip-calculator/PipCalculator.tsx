"use client"
import { useState } from "react"

export default function PipCalculator() {
  const [lot, setLot]   = useState(0.1)
  const [pips, setPips] = useState(10)
  const [pair, setPair] = useState("EURUSD")

  const pipValue = pair.includes("JPY") ? (lot * 100000 * 0.01) / 154 : lot * 100000 * 0.0001
  const profit = pipValue * pips

  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
          ເຄື່ອງມື Forex
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--fg)", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Pip Calculator
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 28 }}>
          ຄຳນວນ Pip Value ແລະ ກຳໄລ/ຂາດທຶນ
        </p>

        <div style={{ background: "var(--surface)", border: "1.5px solid var(--line)", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Pair */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              Currency Pair
            </label>
            <select value={pair} onChange={e => setPair(e.target.value)}
              style={{ width: "100%", background: "var(--surface-2)", border: "1.5px solid var(--line-2)", color: "var(--fg)", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}>
              {["EURUSD","GBPUSD","USDJPY","XAUUSD","AUDUSD","USDCHF"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Lot Size */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              Lot Size: <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>{lot}</span>
            </label>
            <input type="range" min={0.01} max={10} step={0.01} value={lot}
              onChange={e => setLot(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-4)", fontFamily: "monospace", marginTop: 4 }}>
              <span>0.01</span><span>10</span>
            </div>
          </div>

          {/* Pips */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              Pips: <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>{pips}</span>
            </label>
            <input type="range" min={1} max={500} step={1} value={pips}
              onChange={e => setPips(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-4)", fontFamily: "monospace", marginTop: 4 }}>
              <span>1</span><span>500</span>
            </div>
          </div>

          {/* Result */}
          <div style={{ background: "var(--accent-soft)", border: "1.5px solid var(--accent-line)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)", marginBottom: 6 }}>Pip Value</div>
                <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>${pipValue.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)", marginBottom: 6 }}>ກຳໄລ/ຂາດທຶນ</div>
                <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: profit >= 0 ? "var(--success)" : "var(--danger)" }}>${profit.toFixed(2)}</div>
              </div>
            </div>
          </div>

        </div>

        <p style={{ fontSize: 11, color: "var(--fg-4)", textAlign: "center", marginTop: 16 }}>
          ⚠ ຄຳນວນຄ່າຕົວຢ່າງ · Pip value ອາດຕ່າງກັນຕາມ Broker
        </p>
      </div>
    </div>
  )
}
