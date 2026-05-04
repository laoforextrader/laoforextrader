'use client'

import { useEffect, useRef } from 'react'

export default function EASystemHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W: number, H: number
    let particles: any[] = []
    let frame = 0
    const mouse = { x: 0.7, y: 0.5 }
    let animId: number

    function resize() {
      if (!canvas) return
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      buildParticles()
    }

    function buildParticles() {
      particles = []
      const cx = W * 0.72, cy = H * 0.5
      const rx = W * 0.17, ry = H * 0.38

      for (let i = 0; i < 900; i++) {
        const a = (i / 900) * Math.PI * 2
        const jitter = 0.9 + Math.random() * 0.2
        const x = cx + Math.cos(a) * rx * jitter
        const y = cy + Math.sin(a) * ry * jitter - ry * 0.08
        particles.push({ ox: x, oy: y, x, y, vx: 0, vy: 0, hue: 185 + Math.random() * 50, size: 0.6 + Math.random() * 1.2, phase: Math.random() * Math.PI * 2, eye: false })
      }
      for (let i = 0; i < 700; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random())
        const x = cx + Math.cos(a) * rx * 0.82 * r
        const y = cy + Math.sin(a) * ry * 0.82 * r - ry * 0.06
        particles.push({ ox: x, oy: y, x, y, vx: 0, vy: 0, hue: 200 + Math.random() * 60, size: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2, eye: false })
      }
      ;[[-.28, -.12], [.28, -.12]].forEach(([ex, ey]) => {
        for (let i = 0; i < 80; i++) {
          const a = Math.random() * Math.PI * 2
          const r = Math.random() * 0.1
          const x = cx + ex * rx + Math.cos(a) * rx * r
          const y = cy + ey * ry + Math.sin(a) * ry * r
          particles.push({ ox: x, oy: y, x, y, vx: 0, vy: 0, hue: 270 + Math.random() * 40, size: 0.8 + Math.random() * 1.4, phase: Math.random() * Math.PI * 2, eye: true })
        }
      })
    }

    function draw() {
      if (!canvas || !ctx) return
      frame++
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createRadialGradient(W * 0.72, H * 0.5, 0, W * 0.72, H * 0.5, W * 0.5)
      bg.addColorStop(0, 'rgba(0,4,24,1)')
      bg.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const mx = mouse.x * W, my = mouse.y * H

      for (let i = 0; i < particles.length; i += 2) {
        const p = particles[i]
        for (let j = i + 2; j < Math.min(i + 10, particles.length); j += 2) {
          const q = particles[j]
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 14) {
            ctx.strokeStyle = `rgba(96,165,250,${(1 - d / 14) * 0.18})`
            ctx.lineWidth = 0.35
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        p.phase += 0.012
        const wave = Math.sin(p.phase) * 1.5
        const dx = mx - p.ox, dy = my - p.oy
        const dist = Math.hypot(dx, dy)
        const force = Math.max(0, 1 - dist / (W * 0.18))
        p.vx += (force > 0 ? (dx / dist) * force * 0.5 : 0) - (p.x - p.ox) * 0.1
        p.vy += (force > 0 ? (dy / dist) * force * 0.5 : 0) - (p.y - p.oy) * 0.1
        p.vx *= 0.82; p.vy *= 0.82
        p.x = p.ox + wave + p.vx
        p.y = p.oy + wave * 0.4 + p.vy
        const t = (Math.sin(frame * 0.004 + p.phase) + 1) * 0.5
        const h = p.eye ? 270 + Math.sin(frame * 0.03) * 25 : p.hue + t * 30
        const s = p.eye ? 90 : 65 + t * 20
        const l = p.eye ? 65 + force * 20 : 35 + t * 25 + force * 20
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + force * 0.6), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${h},${s}%,${l}%,.9)`
        ctx.fill()
      })

      const sy = ((frame * 1.2) % (H + 30)) - 15
      const sg = ctx.createLinearGradient(0, sy - 6, 0, sy + 6)
      sg.addColorStop(0, 'rgba(96,165,250,0)')
      sg.addColorStop(0.5, 'rgba(96,165,250,.05)')
      sg.addColorStop(1, 'rgba(96,165,250,0)')
      ctx.fillStyle = sg
      ctx.fillRect(0, sy - 6, W, 12)

      animId = requestAnimationFrame(draw)
    }

    const handleResize = () => resize()
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / W
      mouse.y = (e.clientY - r.top) / H
    }

    window.addEventListener('resize', handleResize)
    canvas.parentElement?.addEventListener('mousemove', handleMouseMove as any)

    resize()
    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove as any)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
