"use client"
import { useState, useMemo } from "react"

export default function RiskRewardPage() {
  const [entry, setEntry] = useState(2000)
  const [stop, setStop] = useState(1990)
  const [target, setTarget] = useState(2030)
  const [risk, setRisk] = useState(100)
  const [side, setSide] = useState<"long" | "short">("long")

  const calc = useMemo(() => {
    const slDist = side === "long" ? entry - stop : stop - entry
    const tpDist = side === "long" ? target - entry : entry - target
    if (slDist <= 0 || tpDist <= 0) {
      return { ratio: 0, reward: 0, valid: false }
    }
    const ratio = tpDist / slDist
    const reward = risk * ratio
    return { ratio, reward, valid: true }
  }, [entry, stop, target, risk, side])

  const verdict =
    !calc.valid ? { color: "#9CA3AF", label: "ໃສ່ຄ່າຍັງບໍ່ຖືກຕ້ອງ", desc: "" } :
    calc.ratio >= 3 ? { color: "#059669", label: "ດີຫຼາຍ", desc: "RR ≥ 1:3 — ກຳໄລດີຖ້າຊະນະ" } :
    calc.ratio >= 2 ? { color: "#0EA5E9", label: "ດີ", desc: "RR ≥ 1:2 — ຍອມຮັບໄດ້" } :
    calc.ratio >= 1 ? { color: "#F59E0B", label: "ຄວນລະວັງ", desc: "RR ຕ່ຳ — ຕ້ອງຊະນະຫຼາຍຄັ້ງຈຶ່ງມີກຳໄລ" } :
    { color: "#DC2626", label: "ບໍ່ຄຸ້ມ", desc: "Risk ຫຼາຍກວ່າ Reward — ບໍ່ແນະນຳ" }

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 6 }}>
          ເຄື່ອງມື Forex
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Risk / Reward Calculator
        </h1>
        <p style={{ fontSize: 13, color: "#374151", marginBottom: 28 }}>
          ຄຳນວນ Risk:Reward Ratio ກ່ອນເປີດອໍເດີ
        </p>

        <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Side toggle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              ທິດທາງ Order
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["long", "short"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    border: side === s ? "1.5px solid transparent" : "1.5px solid #E5E7EB",
                    background: side === s
                      ? (s === "long" ? "linear-gradient(135deg,#10B981,#059669)" : "linear-gradient(135deg,#EF4444,#DC2626)")
                      : "#F9FAFB",
                    color: side === s ? "#fff" : "#374151",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s === "long" ? "↑ Long (Buy)" : "↓ Short (Sell)"}
                </button>
              ))}
            </div>
          </div>

          {/* Entry */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              ລາຄາ Entry
            </label>
            <input
              type="number"
              value={entry}
              step={0.1}
              onChange={e => setEntry(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#111827", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Stop Loss */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              Stop Loss
            </label>
            <input
              type="number"
              value={stop}
              step={0.1}
              onChange={e => setStop(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#991B1B", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Take Profit */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              Take Profit
            </label>
            <input
              type="number"
              value={target}
              step={0.1}
              onChange={e => setTarget(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "#ECFDF5", border: "1.5px solid #6EE7B7", color: "#065F46", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Risk amount */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              ຈຳນວນເງິນທີ່ກ້າເສຍ ($)
            </label>
            <input
              type="number"
              value={risk}
              step={1}
              min={0}
              onChange={e => setRisk(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#111827", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Result */}
          <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 6 }}>RR Ratio</div>
                <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: "#7C3AED" }}>
                  {calc.valid ? `1 : ${calc.ratio.toFixed(2)}` : "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 6 }}>ຖ້າຊະນະ ໄດ້</div>
                <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: "#059669" }}>
                  {calc.valid ? `+$${calc.reward.toFixed(2)}` : "—"}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #DDD6FE", paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff", background: verdict.color }}>
                {verdict.label}
              </span>
              {verdict.desc && (
                <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                  {verdict.desc}
                </span>
              )}
            </div>
          </div>

        </div>

        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 16, fontFamily: "'Noto Sans Lao', sans-serif" }}>
          ⚠ ຄຳນວນຄ່າຕົວຢ່າງ · ບໍ່ໄດ້ລວມຄ່າ Spread / Commission
        </p>
      </div>
    </div>
  )
}
