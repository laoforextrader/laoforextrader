import Image from "next/image"
import Link from "next/link"

/* Subtle candlestick SVG watermark */
function CandleWatermark() {
  const candles = [
    { x: 30,  h: 40, body: 22, up: true  },
    { x: 58,  h: 30, body: 16, up: false },
    { x: 86,  h: 50, body: 28, up: true  },
    { x: 114, h: 36, body: 20, up: false },
    { x: 142, h: 58, body: 32, up: true  },
    { x: 170, h: 42, body: 24, up: true  },
    { x: 198, h: 28, body: 14, up: false },
  ]
  return (
    <svg width="228" height="80" viewBox="0 0 228 80" style={{ position: "absolute", bottom: 16, right: 24, opacity: 0.06, pointerEvents: "none" }}>
      {candles.map((c, i) => {
        const bodyY = (80 - c.body) / 2 + (c.up ? -6 : 6)
        return (
          <g key={i} fill={c.up ? "#2563EB" : "#6B7280"}>
            {/* wick */}
            <rect x={c.x - 0.5} y={(80 - c.h) / 2} width={1} height={c.h} />
            {/* body */}
            <rect x={c.x - 6} y={bodyY} width={12} height={c.body} rx={1} />
          </g>
        )
      })}
    </svg>
  )
}

export function MerchSection() {
  return (
    <section style={{ background: "#fff", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

          {/* Left — product images */}
          <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-end", justifyContent: "center" }}>
            <CandleWatermark />
            <div style={{ background: "#F3F4F6", borderRadius: 16, overflow: "hidden", width: 160, height: 180, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #E5E7EB", flexShrink: 0 }}>
              <Image
                src="/images/tshirt.png"
                alt="LFT T-Shirt"
                width={140}
                height={160}
                style={{ objectFit: "contain" }}
                onError={() => {}}
              />
            </div>
            <div style={{ background: "#F3F4F6", borderRadius: 16, overflow: "hidden", width: 130, height: 150, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #E5E7EB", flexShrink: 0 }}>
              <Image
                src="/images/cap.png"
                alt="LFT Cap"
                width={110}
                height={130}
                style={{ objectFit: "contain" }}
                onError={() => {}}
              />
            </div>
            {/* Badge */}
            <div style={{ position: "absolute", top: -8, right: 8, background: "linear-gradient(135deg,#F59E0B,#FCD34D)", borderRadius: 99, padding: "5px 14px", fontSize: 10, fontWeight: 800, color: "#78350F", letterSpacing: "0.05em" }}>
              FREE GIFT
            </div>
          </div>

          {/* Right — content */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 10 }}>
              Exclusive Member Merch
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: "#111827", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 14 }}>
              Open account.<br />
              <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Get free merch.
              </span>
            </h2>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 24, maxWidth: 340 }}>
              ສະໝັກ Broker ຜ່ານລິ້ງ LFT ແລ້ວຮັບ T-Shirt + Cap ຟຣີ<br />
              ສົ່ງໃຫ້ຟຣີທົ່ວລາວ · Limited Edition · ມີຕາບໃດໝົດຕາບນັ້ນ
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/broker"
                style={{ padding: "11px 26px", background: "#111827", color: "#fff", fontSize: 12, fontWeight: 800, borderRadius: 10, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Claim Your Gift →
              </Link>
              <Link href="/broker"
                style={{ padding: "11px 22px", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 700, borderRadius: 10, textDecoration: "none", border: "1.5px solid #D1D5DB", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Learn More
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
