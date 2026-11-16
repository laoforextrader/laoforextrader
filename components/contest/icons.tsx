// Line icons for the contest pages.
//
// Drawn here rather than pulled from a set because the page uses eight of
// them and an icon package would ship hundreds. One stroke weight, one cap
// style, one 24-grid, so they read as a family next to each other.
//
// No emoji anywhere on these pages: emoji render differently on every phone
// and carry a tone this does not want.

type P = { className?: string }

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

const Svg = ({ className, children }: P & { children: React.ReactNode }) => (
  <svg {...base} className={className ?? "h-[1em] w-[1em] shrink-0"}>{children}</svg>
)

export const Trophy = (p: P) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4" />
    <path d="M17 6h2.5a2.5 2.5 0 0 1-2.5 4" />
    <path d="M12 14v3" />
    <path d="M8.5 20h7l-.7-3h-5.6l-.7 3Z" />
  </Svg>
)

export const Medal = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="15" r="5" />
    <path d="m8.6 10.2-3-6.2h4l2.4 5" />
    <path d="m15.4 10.2 3-6.2h-4l-2.4 5" />
  </Svg>
)

export const Clock = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Svg>
)

export const Users = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2" />
    <path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
  </Svg>
)

export const Chart = (p: P) => (
  <Svg {...p}><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7.5 15 3.5-4 3 2.5L20 7" /></Svg>
)

export const Shield = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5 5.5 6v5.3c0 4 2.7 7.4 6.5 8.7 3.8-1.3 6.5-4.7 6.5-8.7V6L12 3.5Z" />
    <path d="m9.4 12 1.9 1.9 3.4-3.6" />
  </Svg>
)

export const Ban = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="m6.2 6.2 11.6 11.6" /></Svg>
)

export const Dot = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="2.6" fill="currentColor" /></Svg>
)

export const Arrow = (p: P) => (
  <Svg {...p}><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></Svg>
)

export const External = (p: P) => (
  <Svg {...p}>
    <path d="M14 5h5v5" /><path d="M19 5 10 14" />
    <path d="M18.5 14v4a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V7A1.5 1.5 0 0 1 6 5.5h4" />
  </Svg>
)

export const Copy = (p: P) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 6.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
  </Svg>
)

export const Alert = (p: P) => (
  <Svg {...p}><path d="M12 4.8 3.6 19h16.8L12 4.8Z" /><path d="M12 10v4" /><path d="M12 16.8h.01" /></Svg>
)

export const Info = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>
)

export const Gift = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="9" width="17" height="4" rx="1" />
    <path d="M5 13v6.5h14V13" /><path d="M12 9v10.5" />
    <path d="M12 9S10.5 4.5 8.2 5.2 9.6 9 12 9Zm0 0s1.5-4.5 3.8-3.8S14.4 9 12 9Z" />
  </Svg>
)

export const Check = (p: P) => (
  <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
)

/**
 * The candlestick band behind the hero.
 *
 * Twenty sessions of a rising market, drawn to scale from a fixed series so
 * it is the same on every load — a random walk regenerated per render would
 * be a chart of nothing, redrawn.
 */
export function CandleBand({ className }: P) {
  const bars: Array<[number, number, number, number, number]> = [
    [18, 96, 74, 60, 82], [48, 104, 88, 74, 96], [78, 88, 52, 46, 84], [108, 92, 66, 60, 88],
    [138, 76, 44, 40, 70], [168, 84, 56, 50, 80], [198, 70, 38, 32, 64], [228, 78, 50, 44, 74],
    [258, 62, 34, 28, 58], [288, 70, 46, 40, 66], [318, 56, 30, 24, 52], [348, 64, 42, 36, 60],
    [378, 50, 26, 20, 46], [408, 58, 38, 32, 54], [438, 44, 22, 16, 40], [468, 52, 34, 28, 48],
    [498, 38, 18, 12, 34], [528, 46, 30, 24, 42], [558, 32, 14, 10, 28], [588, 40, 26, 20, 36],
  ]
  return (
    <svg
      className={className}
      viewBox="0 0 600 150"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.35">
        <path d="M0 120h600M0 90h600M0 60h600" />
      </g>
      {bars.map(([x, lo, hi, o, c], i) => {
        const up = c < o
        const fill = up ? "#1f7a5a" : "#7a3a3a"
        return (
          <g key={i} fill={fill} stroke={fill}>
            <line x1={x} y1={150 - lo} x2={x} y2={150 - hi} strokeWidth="1.4" />
            <rect x={x - 4} y={150 - Math.max(o, c)} width="8" height={Math.abs(c - o) + 2} rx="1" />
          </g>
        )
      })}
    </svg>
  )
}
