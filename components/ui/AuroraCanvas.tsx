"use client"
import { useEffect, useRef } from "react"

// Aurora / breakout backdrop — slow emerald→gold ribbons drifting upward
// over a faint moving grid, with rising spark particles. 2D canvas, tuned
// to the same calm pace as HyperspaceCanvas. Theme: emerald + gold (ABS).
export function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const wrap = canvas.parentElement
    if (!wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0

    type Spark = { x: number; y: number; vy: number; r: number; hue: number; a: number }
    let sparks: Spark[] = []

    const makeSpark = (seed = false): Spark => ({
      x: Math.random() * w,
      y: seed ? Math.random() * h : h + Math.random() * 40,
      vy: -(0.12 + Math.random() * 0.45),
      r: 0.6 + Math.random() * 1.8,
      hue: Math.random() < 0.7 ? 152 : 45, // emerald-ish or gold
      a: 0.25 + Math.random() * 0.5,
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = wrap.offsetWidth
      h = wrap.offsetHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(160, Math.max(70, Math.floor((w * h) / 9000)))
      sparks = []
      for (let i = 0; i < count; i++) sparks.push(makeSpark(true))
    }
    resize()
    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    const start = performance.now()
    let raf = 0

    const frame = () => {
      const t = (performance.now() - start) / 1000
      ctx.clearRect(0, 0, w, h)

      // ── Moving grid ──
      const gridSize = 46
      const offset = (t * 9) % gridSize
      ctx.lineWidth = 1
      ctx.strokeStyle = "rgba(52,211,153,0.05)"
      ctx.beginPath()
      for (let x = -offset; x <= w; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h)
      }
      for (let y = h + offset; y >= 0; y -= gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(w, y)
      }
      ctx.stroke()

      // ── Aurora ribbons ──
      ctx.globalCompositeOperation = "lighter"
      const ribbons = [
        { base: h * 0.30, amp: h * 0.10, speed: 0.18, col: "52,211,153", phase: 0 },
        { base: h * 0.55, amp: h * 0.13, speed: 0.13, col: "20,184,166", phase: 1.8 },
        { base: h * 0.72, amp: h * 0.09, speed: 0.22, col: "251,191,36", phase: 3.4 },
      ]
      for (const rb of ribbons) {
        const grad = ctx.createLinearGradient(0, 0, w, 0)
        grad.addColorStop(0, `rgba(${rb.col},0)`)
        grad.addColorStop(0.5, `rgba(${rb.col},0.16)`)
        grad.addColorStop(1, `rgba(${rb.col},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 18) {
          const y =
            rb.base +
            Math.sin(x * 0.006 + t * rb.speed + rb.phase) * rb.amp +
            Math.sin(x * 0.013 - t * rb.speed * 1.4 + rb.phase) * rb.amp * 0.4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fill()
      }

      // ── Rising sparks ──
      for (const s of sparks) {
        s.y += s.vy
        s.x += Math.sin((s.y + t * 30) * 0.01) * 0.3
        if (s.y < -10) Object.assign(s, makeSpark(false))
        const flick = 0.6 + Math.sin(t * 3 + s.x) * 0.4
        ctx.beginPath()
        ctx.fillStyle = `hsla(${s.hue}, 90%, 62%, ${s.a * flick})`
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
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
