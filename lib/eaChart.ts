// EA return bars (monthly and daily): winners are scaled, losers are a stub.
//
// The problem (2026-11-15, owner): MegiHedge has one month near -60% against
// winning months around +20%. On one shared scale that month takes the whole
// plot and every winning month collapses into a stub - the chart stops saying
// anything about the eleven months that went right.
//
// The fix is the one DailyReturnsStrip already uses for days, so the two charts
// now read the same way: a winning bar is scaled against the best winner, and a
// losing bar is drawn at a fixed small depth whatever its size.
//
// Why that is not a lie, as long as the caller holds up its end: every losing
// bar is the SAME height, so there is no length to misread as a quantity - the
// bar says "this month lost" and the number beside it says how much. A squashed
// -but-still-proportional negative scale would be the dishonest version, because
// it looks like a measurement and is not one.
//
// The caller must therefore:
//   1. print the real percentage next to every bar, in red when negative
//   2. draw the zero line, so a red stub reads as below zero
// Without those two, use `honestHeightPct` instead - one scale, both sides.

/** How deep a losing month is drawn. Matches DailyReturnsStrip's LOSS_BAR_PX. */
export const LOSS_BAR_PX = 12

/** Smallest winning bar, so a +0.2% month is still a mark rather than nothing. */
const MIN_WIN_PX = 3

export interface ScaledBars {
  /** Largest winning month; 0 when every month lost. */
  posMax: number
  /** True when at least one month lost - the plot needs its lower band. */
  hasLoss: boolean
  /** Height in px for this month's bar, inside a positive area of `areaPx`. */
  barPx(value: number, areaPx: number): number
}

export function scaledBars(values: number[]): ScaledBars {
  const wins = values.filter((v) => v > 0)
  const posMax = wins.length ? Math.max(...wins) : 0
  const hasLoss = values.some((v) => v < 0)

  return {
    posMax,
    hasLoss,
    barPx(value: number, areaPx: number) {
      if (value < 0) return LOSS_BAR_PX
      if (posMax <= 0) return MIN_WIN_PX
      return Math.max(MIN_WIN_PX, (value / posMax) * areaPx)
    },
  }
}

/**
 * One scale for both sides, for places too small to print a number on every
 * bar. Returns a percentage of the half it belongs to.
 */
export function honestHeightPct(value: number, peak: number): number {
  if (peak <= 0) return 4
  return Math.max(4, (Math.abs(value) / peak) * 100)
}
