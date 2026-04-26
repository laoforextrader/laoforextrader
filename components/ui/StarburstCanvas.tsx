"use client"
import { useEffect, useRef } from "react"

export function StarburstCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tmx = useRef(0)
  const tmy = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const wrap = canvas.parentElement!

    const resize = () => {
      canvas.width = wrap.offsetWidth
      canvas.height = wrap.offsetHeight
      tmx.current = canvas.width / 2
      tmy.current = canvas.height + 20
    }
    resize()
    window.addEventListener("resize", resize)

    const rays = Array.from({ length: 150 }, () => ({
      angle: Math.random() * Math.PI,
      maxLen: 70 + Math.random() * 160,
      life: Math.random() * 200,
      maxLife: 110 + Math.random() * 160,
      width: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
    }))

    let cmx = canvas.width / 2, cmy = canvas.height + 20, sf = 0, raf: number

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      tmx.current = e.clientX - r.left
      tmy.current = e.clientY - r.top
    }
    const onLeave = () => {
      tmx.current = canvas.width / 2
      tmy.current = canvas.height + 20
    }
    wrap.addEventListener("mousemove", onMove)
    wrap.addEventListener("mouseleave", onLeave)

    const anim = () => {
      sf++
      cmx += (tmx.current - cmx) * 0.06
      cmy += (tmy.current - cmy) * 0.06
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const g = ctx.createRadialGradient(cmx, cmy, 0, cmx, cmy, 130)
      g.addColorStop(0, "rgba(251,191,36,0.20)")
      g.addColorStop(0.4, "rgba(37,99,235,0.06)")
      g.addColorStop(1, "rgba(37,99,235,0)")
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height)

      rays.forEach(ray => {
        ray.life++
        if (ray.life > ray.maxLife) {
          ray.life = 0
          ray.angle = Math.random() * Math.PI
          ray.maxLen = 70 + Math.random() * 160
        }
        const prog = ray.life / ray.maxLife
        const gp = Math.min(prog * 2, 1)
        const fp = prog > 0.6 ? (prog - 0.6) / 0.4 : 0
        const al = (1 - fp) * 0.65
        const a = ray.angle + Math.sin(sf * 0.02 + ray.phase) * 0.02
        const x2 = cmx + Math.cos(a) * ray.maxLen * gp
        const y2 = cmy - Math.abs(Math.sin(a)) * ray.maxLen * gp
        const rg = ctx.createLinearGradient(cmx, cmy, x2, y2)
        rg.addColorStop(0, `rgba(251,191,36,${al * 0.9})`)
        rg.addColorStop(0.5, `rgba(99,132,235,${al * 0.6})`)
        rg.addColorStop(1, `rgba(37,99,235,${al * 0.15})`)
        ctx.beginPath(); ctx.moveTo(cmx, cmy); ctx.lineTo(x2, y2)
        ctx.strokeStyle = rg; ctx.lineWidth = ray.width * (1 - fp * 0.5); ctx.stroke()
      })
      raf = requestAnimationFrame(anim)
    }
    anim()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      wrap.removeEventListener("mousemove", onMove)
      wrap.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
