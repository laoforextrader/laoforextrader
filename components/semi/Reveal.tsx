"use client"

import { useEffect, useRef, useState } from "react"

// Entrance animation for the Semi landing page — desktop only, by the owner's
// call. On a phone the hero is already one column that scrolls past in a
// second, and animating it there only delays the content.
//
// The gate is the CSS media query in globals.css, not this component: below
// 900px `.reveal` carries no initial transform at all, so a phone paints the
// final state on first frame even before this script runs. The observer only
// adds a class; nothing here can leave content invisible if JS never loads,
// because `.reveal` keeps `opacity: 1` until the stylesheet overrides it for
// wide screens, and the stylesheet also honours prefers-reduced-motion.
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") { setShown(true); return }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) { setShown(true); io.disconnect(); break }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
         style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}
