"use client"
import { useState, useMemo } from "react"

export default function RiskReward() {
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

  // A soft fill + its matching ink, not one saturated fill with white on it.
  // --success and friends flip to a LIGHT hex under html.dark, so white text
  // on them drops to about 1.9:1 there; the -soft/-line/-ink families are the
  // ones built to flip together and they already clear the audit.
  const verdict =
    !calc.valid
      ? { soft: "var(--surface-2)", line: "var(--line-2)", ink: "var(--fg-2)", label: "ໃສ່ຄ່າຍັງບໍ່ຖືກຕ້ອງ", desc: "" }
      : calc.ratio >= 3
        ? { soft: "var(--success-soft)", line: "var(--success-line)", ink: "var(--success-ink)", label: "ດີຫຼາຍ", desc: "RR ≥ 1:3 — ກຳໄລດີຖ້າຊະນະ" }
        : calc.ratio >= 2
          ? { soft: "var(--accent-soft)", line: "var(--accent-line)", ink: "var(--accent-ink)", label: "ດີ", desc: "RR ≥ 1:2 — ຍອມຮັບໄດ້" }
          : calc.ratio >= 1
            ? { soft: "var(--warn-soft)", line: "var(--warn-line)", ink: "var(--warn-ink)", label: "ຄວນລະວັງ", desc: "RR ຕ່ຳ — ຕ້ອງຊະນະຫຼາຍຄັ້ງຈຶ່ງມີກຳໄລ" }
            : { soft: "var(--danger-soft)", line: "var(--danger-line)", ink: "var(--danger-ink)", label: "ບໍ່ຄຸ້ມ", desc: "Risk ຫຼາຍກວ່າ Reward — ບໍ່ແນະນຳ" }

  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--violet)", marginBottom: 6 }}>
          ເຄື່ອງມື Forex
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--fg)", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Risk / Reward Calculator
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 28 }}>
          ຄຳນວນ Risk:Reward Ratio ກ່ອນເປີດອໍເດີ
        </p>

        <div style={{ background: "var(--surface)", border: "1.5px solid var(--line)", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Side toggle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
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
                    border: side === s ? "1.5px solid transparent" : "1.5px solid var(--line-2)",
                    background: side === s
                      // Solid, and darker than the gradient they replace:
                      // white on #10B981 is 3.0:1 and on #EF4444 4.0:1, both
                      // under the 4.5:1 floor this 13px bold label needs.
                      // These two clear it, and they are fixed in both themes
                      // because the fill is the state, not the surface.
                      ? (s === "long" ? "#047857" : "#B91C1C")
                      : "var(--surface-2)",
                    color: side === s ? "#fff" : "var(--fg-2)",
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
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              ລາຄາ Entry
            </label>
            <input
              type="number"
              value={entry}
              step={0.1}
              onChange={e => setEntry(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "var(--surface-2)", border: "1.5px solid var(--line-2)", color: "var(--fg)", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Stop Loss */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              Stop Loss
            </label>
            <input
              type="number"
              value={stop}
              step={0.1}
              onChange={e => setStop(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "var(--danger-soft)", border: "1.5px solid var(--danger-line)", color: "var(--danger-ink)", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Take Profit */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              Take Profit
            </label>
            <input
              type="number"
              value={target}
              step={0.1}
              onChange={e => setTarget(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "var(--success-soft)", border: "1.5px solid var(--success-line)", color: "var(--success-ink)", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Risk amount */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 8 }}>
              ຈຳນວນເງິນທີ່ກ້າເສຍ ($)
            </label>
            <input
              type="number"
              value={risk}
              step={1}
              min={0}
              onChange={e => setRisk(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", background: "var(--surface-2)", border: "1.5px solid var(--line-2)", color: "var(--fg)", fontSize: 14, padding: "10px 12px", borderRadius: 8, outline: "none", fontFamily: "monospace" }}
            />
          </div>

          {/* Result */}
          <div style={{ background: "var(--violet-soft)", border: "1.5px solid var(--violet-line)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)", marginBottom: 6 }}>RR Ratio</div>
                <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: "var(--violet)" }}>
                  {calc.valid ? `1 : ${calc.ratio.toFixed(2)}` : "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)", marginBottom: 6 }}>ຖ້າຊະນະ ໄດ້</div>
                <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: "var(--success-ink)" }}>
                  {calc.valid ? `+$${calc.reward.toFixed(2)}` : "—"}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--violet-line)", paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: verdict.ink, background: verdict.soft, border: `1px solid ${verdict.line}` }}>
                {verdict.label}
              </span>
              {verdict.desc && (
                <span style={{ fontSize: 12, color: "var(--fg-3)", fontFamily: "'Noto Sans Lao', sans-serif" }}>
                  {verdict.desc}
                </span>
              )}
            </div>
          </div>

        </div>

        <p style={{ fontSize: 11, color: "var(--fg-4)", textAlign: "center", marginTop: 16, fontFamily: "'Noto Sans Lao', sans-serif" }}>
          ⚠ ຄຳນວນຄ່າຕົວຢ່າງ · ບໍ່ໄດ້ລວມຄ່າ Spread / Commission
        </p>
      </div>
    </div>
  )
}
