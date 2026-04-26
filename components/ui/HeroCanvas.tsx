"use client"
import { useEffect, useRef } from "react"

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mx = useRef(0)
  const my = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const wrap = canvas.parentElement!

    const resize = () => {
      canvas.width = wrap.offsetWidth
      canvas.height = wrap.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    class Particle {
      x = Math.random() * canvas.width
      y = Math.random() * canvas.height
      vy = -(0.5 + Math.random() * 0.7)
      vx = (Math.random() - 0.5) * 0.3
      w = 5 + Math.random() * 7
      bh = 8 + Math.random() * 18
      wh = 0
      up = Math.random() > 0.45
      a = Math.random()
      life = Math.random() * 200
      ml = 180 + Math.random() * 250

      constructor() { this.wh = this.bh + Math.random() * 8 }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + 20
        this.vy = -(0.5 + Math.random() * 0.7)
        this.vx = (Math.random() - 0.5) * 0.3
        this.w = 5 + Math.random() * 7
        this.bh = 8 + Math.random() * 18
        this.wh = this.bh + Math.random() * 8
        this.up = Math.random() > 0.45
        this.a = 0; this.life = 0
        this.ml = 180 + Math.random() * 250
      }

      update() {
        this.life++
        this.a = this.life < 30 ? this.life / 30
          : this.life > this.ml - 40 ? (this.ml - this.life) / 40 : 1
        if (this.life > this.ml) this.reset()
        this.x += this.vx + mx.current * 0.0006
        this.y += this.vy + my.current * 0.0003
        if (this.y < -60 || this.x < -30 || this.x > canvas.width + 30) this.reset()
      }

      draw() {
        const a = this.a * (this.up ? 0.10 : 0.07)
        const c = this.up ? `rgba(5,150,105,${a})` : `rgba(220,38,38,${a})`
        ctx.save()
        ctx.strokeStyle = c; ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(this.x + this.w / 2, this.y - this.wh)
        ctx.lineTo(this.x + this.w / 2, this.y + this.wh + this.bh)
        ctx.stroke()
        ctx.fillStyle = c
        ctx.fillRect(this.x, this.y, this.w, this.bh)
        ctx.restore()
      }
    }

    const parts: Particle[] = Array.from({ length: 28 }, () => new Particle())
    let raf: number

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      mx.current = e.clientX - r.left - canvas.width / 2
      my.current = e.clientY - r.top - canvas.height / 2
    }
    wrap.addEventListener("mousemove", onMove)

    const anim = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      parts.forEach(p => { p.update(); p.draw() })
      raf = requestAnimationFrame(anim)
    }
    anim()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      wrap.removeEventListener("mousemove", onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
