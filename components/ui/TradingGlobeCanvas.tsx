"use client"
import { useEffect, useRef } from "react"
import createGlobe, { type Marker } from "cobe"

// Major forex / financial centres — markers that rise as "spikes" on the globe
const MARKERS: Marker[] = [
  { location: [51.5074,  -0.1278],  size: 0.10 }, // London
  { location: [40.7128, -74.0060],  size: 0.10 }, // New York
  { location: [35.6762, 139.6503],  size: 0.09 }, // Tokyo
  { location: [22.3193, 114.1694],  size: 0.08 }, // Hong Kong
  { location: [ 1.3521, 103.8198],  size: 0.07 }, // Singapore
  { location: [-33.8688, 151.2093], size: 0.07 }, // Sydney
  { location: [50.1109,   8.6821],  size: 0.07 }, // Frankfurt
  { location: [47.3769,   8.5417],  size: 0.06 }, // Zurich
  { location: [25.2048,  55.2708],  size: 0.06 }, // Dubai
  { location: [17.9757, 102.6331],  size: 0.08 }, // Vientiane (highlighted for Lao audience)
  { location: [13.7563, 100.5018],  size: 0.06 }, // Bangkok
  { location: [37.5665, 126.9780],  size: 0.06 }, // Seoul
]

export function TradingGlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap) return

    let width = wrap.offsetWidth
    let phi = 0
    let dragOffset = 0
    let pointerInteraction: number | null = null
    let raf = 0
    let destroyed = false

    const onResize = () => {
      width = wrap.offsetWidth
    }
    window.addEventListener("resize", onResize)

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width:  width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 7,
      baseColor:   [0.18, 0.85, 0.65],   // teal-green continents
      markerColor: [1.0,  0.85, 0.30],   // yellow-lime marker spikes
      glowColor:   [0.35, 0.65, 0.55],   // soft cyan atmosphere
      opacity: 1,
      markers: MARKERS,
    })

    const tick = () => {
      if (destroyed) return
      if (pointerInteraction === null) phi += 0.004
      globe.update({
        phi: phi + dragOffset,
        width:  width * 2,
        height: width * 2,
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    requestAnimationFrame(() => {
      canvas.style.opacity = "1"
    })

    const onPointerDown = (e: PointerEvent) => {
      pointerInteraction = e.clientX - dragOffset * 100
      canvas.style.cursor = "grabbing"
    }
    const onPointerUp = () => {
      pointerInteraction = null
      canvas.style.cursor = "grab"
    }
    const onPointerMove = (e: PointerEvent) => {
      if (pointerInteraction !== null) {
        const delta = e.clientX - pointerInteraction
        dragOffset = delta / 100
      }
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointerout", onPointerUp)
    canvas.addEventListener("pointermove", onPointerMove)

    return () => {
      destroyed = true
      cancelAnimationFrame(raf)
      globe.destroy()
      window.removeEventListener("resize", onResize)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointerout", onPointerUp)
      canvas.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "min(720px, 92vw)",
          height: "min(720px, 92vw)",
          aspectRatio: "1 / 1",
          opacity: 0,
          transition: "opacity 1s ease",
          cursor: "grab",
          pointerEvents: "auto",
          contain: "layout paint size",
        }}
      />
    </div>
  )
}
