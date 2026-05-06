"use client"
import { useEffect, useRef } from "react"

// Hyperspace warp — small particles streaking outward from center.
// Slower than typical Star Wars effect; tuned to match the section pace.
const PALETTE = [
  "rgba(167, 139, 250, ", // violet
  "rgba(196, 181, 253, ", // light violet
  "rgba(244, 114, 182, ", // pink
  "rgba(96, 165, 250, ",  // soft blue
  "rgba(255, 255, 255, ", // white core
]

export function HyperspaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const wrap = canvas.parentElement
    if (!wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, cx = 0, cy = 0, diag = 0
    type Star = { angle: number; z: number; pz: number; speed: number; color: string }
    let stars: Star[] = []

    const resetStar = (s: Star) => {
      s.angle = Math.random() * Math.PI * 2
      s.z = Math.random() * 0.02
      s.pz = s.z
      s.speed = 0.0023 + Math.random() * 0.003 // ~1/3 slower than before
      s.color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = wrap.offsetWidth
      h = wrap.offsetHeight
      cx = w / 2
      cy = h / 2
      diag = Math.hypot(w, h)
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(420, Math.max(220, Math.floor((w * h) / 4200)))
      stars = []
      for (let i = 0; i < count; i++) {
        const s: Star = { angle: 0, z: 0, pz: 0, speed: 0, color: "" }
        resetStar(s)
        // Stagger initial z so streaks aren't all at the center on first frame.
        s.z = Math.random() * 0.9
        s.pz = s.z
        stars.push(s)
      }
    }
    resize()
    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    let raf = 0
    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"
      ctx.lineCap = "round"

      const reach = diag * 0.6

      for (const s of stars) {
        s.pz = s.z
        s.z += s.speed

        const r = s.z * reach
        const pr = s.pz * reach
        const ca = Math.cos(s.angle)
        const sa = Math.sin(s.angle)
        const x = cx + ca * r
        const y = cy + sa * r
        const px = cx + ca * pr
        const py = cy + sa * pr

        const alpha = Math.min(0.85, s.z * 1.1 + 0.05)
        const thickness = Math.min(1.4, 0.35 + s.z * 1.0)

        ctx.strokeStyle = s.color + alpha.toFixed(2) + ")"
        ctx.lineWidth = thickness
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(x, y)
        ctx.stroke()

        if (Math.abs(x - cx) > w / 2 + 40 || Math.abs(y - cy) > h / 2 + 40 || s.z > 1.4) {
          resetStar(s)
        }
      }
      ctx.globalCompositeOperation = "source-over"

      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
