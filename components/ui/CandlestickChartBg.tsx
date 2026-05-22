// Deterministic candlestick-chart background — pure SVG, no JS at runtime.
// Used as a decorative layer behind the FEATURES section on /signal/trs-signal-pro.
function seededRng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 100000) / 100000
  }
}

export function CandlestickChartBg({
  seed = "trs-features",
  count = 48,
  width = 1600,
  height = 520,
  opacity = 0.30,
}: {
  seed?: string
  count?: number
  width?: number
  height?: number
  opacity?: number
}) {
  const rand = seededRng(seed)
  const padX = 24
  const stride = (width - padX * 2) / count
  const bodyW = Math.max(4, stride * 0.55)
  const usableH = height - 80
  const baseY = 40

  // Build a slow random-walk so consecutive candles look connected like real price action.
  let prev = baseY + usableH * 0.55
  const candles = Array.from({ length: count }, (_, i) => {
    const cx = padX + stride * i + stride / 2
    const drift = (rand() - 0.5) * 26
    const open = prev
    const close = Math.max(baseY + 10, Math.min(baseY + usableH - 10, prev + drift))
    const isUp = close < open // SVG y grows downward, so "close < open" = price went up
    const range = 6 + rand() * 18
    const wickTop = Math.min(open, close) - range
    const wickBot = Math.max(open, close) + range
    prev = close
    return { cx, open, close, isUp, wickTop, wickBot }
  })

  // Trend polyline through midpoints
  const trendPoints = candles
    .map((c) => `${c.cx.toFixed(1)},${((c.open + c.close) / 2).toFixed(1)}`)
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id="trsCandleTrend" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#22D3EE" stopOpacity="0" />
          <stop offset="50%"  stopColor="#60A5FA" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="trsCandleFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#fff" stopOpacity="0" />
          <stop offset="45%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="trsCandleMask">
          <rect x="0" y="0" width={width} height={height} fill="url(#trsCandleFade)" />
        </mask>
      </defs>

      <g mask="url(#trsCandleMask)">
        {/* Soft trend line behind candles */}
        <polyline
          points={trendPoints}
          fill="none"
          stroke="url(#trsCandleTrend)"
          strokeWidth={2}
        />

        {candles.map((c, i) => {
          const stroke = c.isUp ? "#22D3A5" : "#FF6B6B"
          const fill   = c.isUp ? "rgba(34,211,165,0.65)" : "rgba(255,107,107,0.65)"
          const top    = Math.min(c.open, c.close)
          const bot    = Math.max(c.open, c.close)
          return (
            <g key={i}>
              <line
                x1={c.cx} y1={c.wickTop}
                x2={c.cx} y2={c.wickBot}
                stroke={stroke} strokeWidth={1}
              />
              <rect
                x={c.cx - bodyW / 2} y={top}
                width={bodyW} height={Math.max(2, bot - top)}
                fill={fill} stroke={stroke} strokeWidth={1}
                rx={1}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
