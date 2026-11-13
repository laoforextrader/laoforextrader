"use client"

import { useMemo, useRef, useState } from "react"

// Equity and balance on one chart, one y-axis.
//
// They share a unit and sit within a few hundred dollars of each other, so one
// scale is the honest way to draw them — and the vertical gap between the two
// lines then reads directly as the floating P/L of whatever is open. A second
// y-axis would make that gap meaningless.
//
// Colours are fixed hex, not theme tokens: both steps were checked against the
// light surface (#FFFFFF) and the dark ones (#141922, #1A2029) and pass the
// lightness band, chroma floor, CVD separation and 3:1 contrast in both, so
// there is nothing for a theme flip to fix.
const EQ = "#059669"
const BAL = "#3B82F6"

export type Sample = [number, number, number]   // [unix s, equity, balance]

const fmt = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmt2 = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function EquityChart({
  series, labelEquity, labelBalance, empty,
}: {
  series: Sample[]
  labelEquity: string
  labelBalance: string
  empty: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [hit, setHit] = useState<number | null>(null)

  const plot = useMemo(() => {
    const pts = series.filter(p => Array.isArray(p) && p.length >= 3)
    if (pts.length < 2) return null
    const t0 = pts[0][0], t1 = pts[pts.length - 1][0]
    const span = Math.max(1, t1 - t0)
    let lo = Infinity, hi = -Infinity
    for (const [, e, b] of pts) {
      lo = Math.min(lo, e, b)
      hi = Math.max(hi, e, b)
    }
    // A flat day must not become a wall of noise magnified to full height.
    const pad = Math.max((hi - lo) * 0.12, Math.abs(hi) * 0.0004, 1)
    lo -= pad; hi += pad
    const x = (t: number) => ((t - t0) / span) * 100
    const y = (v: number) => 100 - ((v - lo) / (hi - lo)) * 100
    const line = (i: 1 | 2) => pts.map(p => `${x(p[0]).toFixed(3)},${y(p[i]).toFixed(3)}`).join(" ")
    return { pts, x, y, lo, hi, t0, t1, eq: line(1), bal: line(2) }
  }, [series])

  if (!plot) {
    return (
      <div className="flex h-[112px] items-center justify-center rounded-bk border border-bk-line bg-bk-sunken text-[11.5px] text-fg-4">
        {empty}
      </div>
    )
  }

  const { pts, x, y, lo, hi } = plot
  const last = pts[pts.length - 1]
  const cur = hit != null ? pts[hit] : last

  const onMove = (clientX: number) => {
    const el = box.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    // Nearest by position, not by index: the samples are time-stamped and a
    // gap (EA offline) must not drag the crosshair to the wrong point.
    let best = 0, bestD = Infinity
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(x(pts[i][0]) / 100 - f)
      if (d < bestD) { bestD = d; best = i }
    }
    setHit(best)
  }

  const hhmm = (t: number) =>
    new Date(t * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="rounded-bk border border-bk-line bg-bk-sunken p-2.5">
      {/* Legend doubles as the readout: identity is never colour alone. */}
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[10.5px]">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: BAL }} />
          <span className="text-bk-muted">{labelBalance}</span>
          <b className="font-mono tabular-nums">{fmt2(cur[2])}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: EQ }} />
          <span className="text-bk-muted">{labelEquity}</span>
          <b className="font-mono tabular-nums">{fmt2(cur[1])}</b>
        </span>
      </div>

      <div ref={box} className="relative h-[108px] w-full touch-pan-y"
           onPointerMove={e => onMove(e.clientX)}
           onPointerLeave={() => setHit(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"
             className="absolute inset-0 h-full w-full overflow-visible"
             role="img" aria-label={`${labelBalance} and ${labelEquity} over time`}>
          {/* recessive grid */}
          {[0, 25, 50, 75, 100].map(g => (
            <line key={g} x1="0" x2="100" y1={g} y2={g}
                  stroke="var(--bk-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <polyline points={plot.bal} fill="none" stroke={BAL} strokeWidth="2"
                    strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <polyline points={plot.eq} fill="none" stroke={EQ} strokeWidth="2"
                    strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {hit != null && (
            <line x1={x(cur[0])} x2={x(cur[0])} y1="0" y2="100"
                  stroke="var(--fg-4, #8b94a7)" strokeWidth="1" strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        {/* Dots live in HTML so a stretched viewBox cannot squash them. */}
        {([[cur[2], BAL], [cur[1], EQ]] as const).map(([v, c], i) => (
          <i key={i} className="pointer-events-none absolute block h-2 w-2 rounded-full ring-2"
             style={{
               background: c, left: `${x(cur[0])}%`, top: `${y(v)}%`,
               transform: "translate(-50%,-50%)",
               // the 2px ring is the surface gap that keeps the two dots
               // readable where the lines cross
               ["--tw-ring-color" as string]: "var(--bk-sunken)",
             }} />
        ))}

        {/* Chips, not bare text: the lines run to x=0 and would otherwise
            cross straight through the axis numbers. */}
        <span className="pointer-events-none absolute left-0 top-0 rounded bg-bk-sunken px-1 font-mono text-[9.5px] text-fg-4">{fmt(hi)}</span>
        <span className="pointer-events-none absolute bottom-0 left-0 rounded bg-bk-sunken px-1 font-mono text-[9.5px] text-fg-4">{fmt(lo)}</span>
      </div>

      <div className="mt-1 flex justify-between font-mono text-[9.5px] text-fg-4">
        <span>{hhmm(plot.t0)}</span>
        <span>{hit != null ? hhmm(cur[0]) : ""}</span>
        <span>{hhmm(plot.t1)}</span>
      </div>
    </div>
  )
}
