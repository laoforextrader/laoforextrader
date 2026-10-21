"use client"

import { useEffect, useRef, type ReactNode } from "react"

/**
 * The scrolling row inside DailyReturnsStrip, and the only client-side part
 * of it — the columns themselves stay server-rendered and are passed in.
 *
 * The strip holds ~20 trading days ordered oldest → newest, but only about
 * seven columns fit on a phone. A horizontal scroller opens at its left
 * edge, so a phone reader landed on three-week-old days and had to swipe
 * right to find today. Park it at the right edge instead. On a desktop the
 * row fits, scrollWidth === clientWidth, and the assignment is a no-op.
 *
 * The second pass on the next frame is for late layout (web fonts settling
 * changes the columns' width), and the width-change pass keeps the newest
 * day in view when a phone is rotated. It is deliberately gated on the width
 * actually moving: a plain resize listener would re-snap to today every time
 * a mobile address bar slides away, yanking the row out from under a reader
 * who had scrolled back to look at an older day.
 */
export default function DailyReturnsScroller({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const toEnd = () => {
      // Over-assigning is clamped to the maximum scroll offset by the browser.
      el.scrollLeft = el.scrollWidth
    }

    toEnd()
    const frame = requestAnimationFrame(toEnd)

    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      toEnd()
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
