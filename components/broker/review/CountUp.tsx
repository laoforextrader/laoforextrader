"use client"

// Counts a score up to its value once, on mount.
//
// It renders the final value on the server and during hydration, so a reader
// with JavaScript off — or one who scrolls past before the effect runs — sees
// the real number rather than a zero. The animation is an embellishment on
// top of correct output, never the thing that produces it.

import { useEffect, useRef, useState } from "react"

export default function CountUp({
  to,
  decimals = 1,
  durationMs = 750,
  className,
}: {
  to: number
  decimals?: number
  durationMs?: number
  className?: string
}) {
  const [shown, setShown] = useState(to)
  const frame = useRef<number | undefined>(undefined)

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setShown(to)
      return
    }

    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(to * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    setShown(0)
    frame.current = requestAnimationFrame(tick)

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    }
  }, [to, durationMs])

  return (
    <span className={className} suppressHydrationWarning>
      {shown.toFixed(decimals)}
    </span>
  )
}
