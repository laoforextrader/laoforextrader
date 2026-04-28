'use client'

import { useEffect, useRef } from 'react'

export default function PromoSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Particle type ──────────────────────────────────────────────
    type P = {
      x: number; y: number
      vx: number; vy: number
      angle: number; angleV: number; speed: number
      size: number; baseAlpha: number; alpha: number
      color: string
    }

    const PALETTE = ['#60A5FA','#818CF8','#A78BFA','#38BDF8','#6366F1','#C084FC','#7DD3FC']

    const mkP = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      angle: Math.random() * Math.PI * 2,
      angleV: (Math.random() - 0.5) * 0.06,
      speed: Math.random() * 0.9 + 0.35,
      size: Math.random() < 0.12 ? Math.random() * 2.2 + 1.8 : Math.random() * 1.3 + 0.4,
      baseAlpha: Math.random() * 0.45 + 0.25,
      alpha: Math.random() * 0.45 + 0.25,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    })

    const N = 300
    const ps: P[] = Array.from({ length: N }, mkP)

    // Track mouse velocity for shockwave
    let prevMx = -9999, prevMy = -9999
    let shock = 0

    // ── Main loop ─────────────────────────────────────────────────
    const tick = () => {
      // Motion-blur trail instead of hard clear
      ctx.fillStyle = 'rgba(10,13,28,0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const mx = mouse.current.x
      const my = mouse.current.y

      // Mouse velocity → shockwave
      const mdx = mx - prevMx, mdy = my - prevMy
      const mSpd = Math.sqrt(mdx * mdx + mdy * mdy)
      shock = Math.max(shock * 0.82, mSpd * 0.35)
      prevMx = mx; prevMy = my

      // ── Connections ────────────────────────────────────────────
      const CONN_D2 = 7056 // 84px
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = ps[i].x - ps[j].x
          const dy = ps[i].y - ps[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < CONN_D2) {
            const t = 1 - d2 / CONN_D2
            ctx.beginPath()
            ctx.moveTo(ps[i].x, ps[i].y)
            ctx.lineTo(ps[j].x, ps[j].y)
            ctx.strokeStyle = '#818CF8'
            ctx.globalAlpha = t * t * 0.22
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // ── Particles ──────────────────────────────────────────────
      for (const p of ps) {
        // Wander: slowly rotate direction
        p.angleV += (Math.random() - 0.5) * 0.1
        p.angleV *= 0.94
        p.angle += p.angleV

        // Blend towards wander direction
        p.vx = p.vx * 0.9 + Math.cos(p.angle) * p.speed * 0.1
        p.vy = p.vy * 0.9 + Math.sin(p.angle) * p.speed * 0.1

        // Mouse interaction
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)

        if (d < 220 && d > 0) {
          if (d < 90) {
            // Hard repel zone
            const f = Math.pow((90 - d) / 90, 1.8) * 5.5
            p.vx += (dx / d) * f
            p.vy += (dy / d) * f
          } else {
            // Soft orbit / attract zone (90–220px)
            const f = ((220 - d) / 220) * 0.35
            p.vx -= (dx / d) * f
            p.vy -= (dy / d) * f
          }
          p.alpha = Math.min(0.95, p.baseAlpha + ((220 - d) / 220) * 0.55)
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.04
        }

        // Shockwave burst
        if (shock > 3 && d < 200 && d > 0) {
          p.vx += (dx / d) * shock * 0.05
          p.vy += (dy / d) * shock * 0.05
        }

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd > 6) { p.vx = p.vx / spd * 6; p.vy = p.vy / spd * 6 }

        p.x = (p.x + p.vx + canvas.width) % canvas.width
        p.y = (p.y + p.vy + canvas.height) % canvas.height

        // Glow via shadowBlur (much cheaper than radial gradient)
        ctx.shadowBlur = p.size * 9
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#080C1A', padding: '48px 24px' }}>

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1060, margin: '0 auto' }}>

        {/* XM $30 hero card */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(37,99,235,0.16),rgba(79,70,229,0.16))', border: '1px solid rgba(99,102,241,0.32)', borderRadius: 20, padding: '36px 44px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 44 }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, background: 'radial-gradient(circle,rgba(99,102,241,0.14),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Big number */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em', background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              $30
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#818CF8', marginTop: 4 }}>
              FREE BONUS
            </div>
          </div>

          <div style={{ width: 1, height: 88, background: 'rgba(99,102,241,0.25)', flexShrink: 0 }} />

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#FEF2F2', color: '#DC2626', fontFamily: 'monospace', fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 8 }}>XM</div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FCD34D', background: 'rgba(252,211,77,0.1)', padding: '3px 12px', borderRadius: 99 }}>
                🔥 NO-DEPOSIT BONUS
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Welcome Bonus $30 ເທຣດຟຣີ
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.75, fontFamily: "'Noto Sans Lao', sans-serif" }}>
              ບໍ່ຕ້ອງຝາກ · ຖອນໄດ້ຕາມເງື່ອນໄຂ · ສຳລັບລູກຄ້າໃໝ່ XM Global
            </div>
          </div>

          {/* CTA */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <a
              href="https://clicks.pipaffiliates.com/c?c=350890&l=th&p=6"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(135deg,#2563EB,#4F46E5)', padding: '15px 36px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              ຮັບ $30 ຟຣີ →
            </a>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 8, fontFamily: "'Noto Sans Lao', sans-serif" }}>
              * T&amp;C ໃຊ້ບັງຄັບ
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
          {['✓ ທົດສອບຈິງໂດຍ LFT Team', '✓ ລີວິວ 100% ບໍ່ Bias', '✓ ຝາກ-ຖອນ BCEL', '✓ Support ພາສາລາວ'].map(t => (
            <span key={t} style={{ fontSize: 11, color: '#475569', fontFamily: "'Noto Sans Lao', sans-serif" }}>{t}</span>
          ))}
        </div>

      </div>
    </div>
  )
}
