"use client"
import { useState, useEffect, useCallback } from "react"
import { TrendingUp, X, ZoomIn, ExternalLink } from "lucide-react"

interface Chart {
  src: string
  pair: string
  title: string
  sub: string
}

export default function BacktestGallery({ charts }: { charts: Chart[] }) {
  const [active, setActive] = useState<Chart | null>(null)
  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [active, close])

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="abs-chart-grid">
        {charts.map(c => (
          <figure key={c.pair} style={{
            margin: 0, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(52,211,153,0.18)", borderRadius: 16, overflow: "hidden",
          }}>
            <figcaption style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={16} strokeWidth={2.5} style={{ color: "#FBBF24" }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "Noto Sans Lao, sans-serif" }}>{c.sub}</div>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#6EE7B7",
                background: "rgba(52,211,153,0.12)", border: "0.5px solid rgba(52,211,153,0.3)",
                borderRadius: 100, padding: "3px 10px", fontFamily: "JetBrains Mono, monospace",
              }}>
                {c.pair}
              </span>
            </figcaption>

            <button
              type="button"
              onClick={() => setActive(c)}
              aria-label={`ເບິ່ງ ${c.title} ເຕັມຈໍ`}
              style={{
                display: "block", width: "100%", padding: 0, border: "none",
                background: "#fff", cursor: "zoom-in", position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={`ABS v2.0 ${c.title} backtest equity curve`}
                style={{ display: "block", width: "100%", height: "auto" }}
                loading="lazy"
              />
              <span style={{
                position: "absolute", right: 10, bottom: 10,
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(4,13,10,0.78)", color: "#fff",
                fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8,
                fontFamily: "Noto Sans Lao, sans-serif", backdropFilter: "blur(4px)",
              }}>
                <ZoomIn size={13} strokeWidth={2.5} />
                ກົດເພື່ອເບິ່ງເຕັມຈໍ
              </span>
            </button>
          </figure>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {active && (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} backtest`}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(2,8,6,0.94)", backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column",
            padding: "16px", overflow: "auto",
          }}
        >
          {/* Top bar */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, flexShrink: 0, maxWidth: 1400, margin: "0 auto 12px", width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <TrendingUp size={18} strokeWidth={2.5} style={{ color: "#FBBF24", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{active.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Noto Sans Lao, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{active.sub}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <a
                href={active.src}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none",
                  padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.25)", fontFamily: "Noto Sans Lao, sans-serif",
                }}
              >
                <ExternalLink size={14} strokeWidth={2.5} />
                ເປີດຮູບຕົ້ນສະບັບ
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="ປິດ"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38, borderRadius: 9999, cursor: "pointer",
                  background: "rgba(255,255,255,0.12)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Image — full natural size, scrollable when larger than viewport */}
          <div
            onClick={close}
            style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={`ABS v2.0 ${active.title} backtest equity curve — full size`}
              onClick={e => e.stopPropagation()}
              style={{
                display: "block", maxWidth: "100%", height: "auto",
                borderRadius: 10, background: "#fff", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
