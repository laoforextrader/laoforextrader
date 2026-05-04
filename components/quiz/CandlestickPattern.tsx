interface Props {
  seed: string
  width?: number
  height?: number
  opacity?: number
}

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

export default function CandlestickPattern({
  seed,
  width = 400,
  height = 148,
  opacity = 0.18,
}: Props) {
  const rand = seededRng(seed)
  const count = 14
  const padX = 16
  const stride = (width - padX * 2) / count
  const bodyW = Math.max(6, stride * 0.55)
  const usableH = height - 24
  const baseY = 12

  const candles = Array.from({ length: count }, (_, i) => {
    const cx = padX + stride * i + stride / 2
    const isUp = rand() > 0.45
    const wickTop = baseY + rand() * usableH * 0.25
    const bodyTop = wickTop + 4 + rand() * usableH * 0.25
    const bodyBot = bodyTop + 8 + rand() * usableH * 0.45
    const wickBot = bodyBot + 4 + rand() * usableH * 0.18
    return { cx, isUp, wickTop, bodyTop, bodyBot, wickBot }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity, pointerEvents: 'none',
      }}
    >
      {candles.map((c, i) => {
        const stroke = c.isUp ? '#22D3A5' : '#FF6B6B'
        const fill = c.isUp ? 'rgba(34,211,165,0.55)' : 'rgba(255,107,107,0.55)'
        return (
          <g key={i}>
            <line x1={c.cx} y1={c.wickTop} x2={c.cx} y2={c.wickBot}
              stroke={stroke} strokeWidth={1} />
            <rect
              x={c.cx - bodyW / 2} y={c.bodyTop}
              width={bodyW} height={Math.max(2, c.bodyBot - c.bodyTop)}
              fill={fill} stroke={stroke} strokeWidth={1}
              rx={1}
            />
          </g>
        )
      })}
    </svg>
  )
}
