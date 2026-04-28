'use client'

import { useEffect, useRef } from 'react'

export default function EASystemPage() {
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

        .ea-hero {
          position: relative;
          background: #000;
          overflow: hidden;
          min-height: 440px;
          display: flex;
          align-items: center;
        }
        .ea-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1060px;
          margin: 0 auto;
          padding: 52px 24px;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 48px;
          align-items: center;
          width: 100%;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(74, 222, 128, 0.12);
          border: 0.5px solid rgba(74, 222, 128, 0.35);
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 11px;
          color: #4ADE80;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ADE80;
          animation: ldot 1.5s infinite;
        }
        @keyframes ldot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        .ea-stat-card {
          background: rgba(255, 255, 255, 0.08);
          border: 0.5px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 22px;
          backdrop-filter: blur(10px);
        }
        .ea-sname {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .ea-slabel {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 14px;
        }
        .ea-bigval {
          font-size: 44px;
          font-weight: 700;
          color: #4ADE80;
          line-height: 1;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 3px;
        }
        .ea-bigsub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 18px;
        }
        .ea-minigrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ea-mini {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 10px;
        }
        .ea-minilabel {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 4px;
        }
        .ea-minival {
          font-size: 17px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }
        .ea-minival.blue { color: #60A5FA; }
        .ea-minival.amber { color: #FCD34D; }
        .ea-minisub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 2px;
        }
        .ea-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #60A5FA;
          margin-bottom: 6px;
        }
        .ea-h1 {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .ea-h2 {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #60A5FA, #A78BFA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ea-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.65;
        }

        /* EA Cards white section */
        .ea-cards-section {
          background: #fff;
          border-top: 1px solid #D4D8E5;
          border-bottom: 1px solid #D4D8E5;
        }
        .ea-cards-inner {
          max-width: 1060px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .section-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2563EB;
          margin-bottom: 5px;
        }
        .section-title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
          letter-spacing: -0.025em;
        }
        .section-title span {
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-subtitle {
          font-size: 14px;
          color: #374151;
          margin-bottom: 24px;
        }
        .ea-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 24px;
        }
        .ea-card {
          background: #fff;
          border: 1.5px solid #E2E6F0;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ea-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }
        .ea-card.blue::before { background: linear-gradient(90deg, #2563EB, #4F46E5); }
        .ea-card.purple::before { background: linear-gradient(90deg, #7C3AED, #EC4899); }
        .ea-card:hover {
          border-color: #2563EB;
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.09);
          transform: translateY(-3px);
        }
        .ea-tag {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          margin-bottom: 12px;
        }
        .ea-tag.blue { background: #EEF3FF; color: #2563EB; }
        .ea-tag.purple { background: #F5F3FF; color: #7C3AED; }
        .ea-card-name {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 3px;
        }
        .ea-card-desc {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 14px;
        }
        .ea-rows {
          border-top: 1px solid #F3F4F6;
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .ea-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .ea-k { color: #6B7280; }
        .ea-v { font-weight: 600; color: #111827; }
        .ea-v.ok { color: #059669; }
        .ea-v.am { color: #D97706; }
        .ea-v.rd { color: #DC2626; }
        .btn-blue-full {
          width: 100%;
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .btn-purple-full {
          width: 100%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Noto Sans Lao', sans-serif;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .step-card {
          background: #F9FAFB;
          border: 1px solid #E2E6F0;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
        }
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #EEF3FF;
          border: 1.5px solid #BFCFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #2563EB;
          margin: 0 auto 10px;
        }
        .step-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 3px;
        }
        .step-sub {
          font-size: 11px;
          color: #6B7280;
        }
        .risk-banner {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 20px;
          font-size: 11px;
          color: #92400E;
          line-height: 1.6;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          font-family: 'Noto Sans Lao', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          cursor: pointer;
        }
        .btn-telegram {
          font-family: 'Noto Sans Lao', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: #229ED9;
          border: none;
          padding: 12px 22px;
          border-radius: 10px;
          cursor: pointer;
        }
        .btn-ghost {
          font-family: 'Noto Sans Lao', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
          background: #fff;
          border: 1.5px solid #9CA3AF;
          padding: 12px 22px;
          border-radius: 10px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .ea-hero-inner {
            grid-template-columns: 1fr;
          }
          .ea-cards-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* EA Dark Hero with Particle Canvas */}
      <div className="ea-hero">
        <canvas
          ref={canvasRef}
          id="ea-canvas"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div className="ea-hero-inner">
          {/* Stat Card */}
          <div className="ea-stat-card">
            <div className="live-badge">
              <div className="live-dot" />
              Live Account Running
            </div>
            <div className="ea-sname">TheRocket EA SGride</div>
            <div className="ea-slabel">ກຳໄລມື້ນີ້</div>
            <div className="ea-bigval">+2.4%</div>
            <div className="ea-bigsub">Live realtime</div>
            <div className="ea-minigrid">
              <div className="ea-mini">
                <div className="ea-minilabel">ເດືອນນີ້</div>
                <div className="ea-minival blue">+18.7%</div>
                <div className="ea-minisub">April 2025</div>
              </div>
              <div className="ea-mini">
                <div className="ea-minilabel">TOTAL GROWTH</div>
                <div className="ea-minival amber">+500%</div>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div>
            <div className="ea-eyebrow">TheRocket EA System</div>
            <div className="ea-h1">ລະບົບ Trade ອັດຕະໂນມັດ</div>
            <div className="ea-h2">ຜົນງານຈິງ ທຸກວັນ</div>
            <div className="ea-sub">
              ກຳໄລຈາກ Live Account · ບໍ່ແມ່ນ Backtest · ກ໊ອບ Trade ໄດ້ທັນທີ
            </div>
          </div>
        </div>
      </div>

      {/* EA Cards — White Section */}
      <div className="ea-cards-section">
        <div className="ea-cards-inner">
          <div className="section-eyebrow">EA Products</div>
          <div className="section-title">
            ເລືອກ EA <span>ທີ່ເໝາະກັບທ່ານ</span>
          </div>
          <div className="section-subtitle">
            ທັງ 2 EA ທຳງານໃນ Live Account ຈິງ
          </div>

          {/* Cards */}
          <div className="ea-cards-grid">
            {/* SGride */}
            <div className="ea-card blue">
              <div className="ea-tag blue">Portfolio Builder</div>
              <div className="ea-card-name">TheRocket EA SGride</div>
              <div className="ea-card-desc">Grid Trading · ກຳໄລຍາວ · ໝັ້ນຄົງ</div>
              <div className="ea-rows">
                <div className="ea-row">
                  <span className="ea-k">Strategy</span>
                  <span className="ea-v">Grid Trading</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Risk Level</span>
                  <span className="ea-v am">Medium</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Profit Style</span>
                  <span className="ea-v ok">Long-term</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Best For</span>
                  <span className="ea-v">Portfolio Growth</span>
                </div>
              </div>
              <button className="btn-blue-full">ໃຊ້ SGride →</button>
            </div>

            {/* MegiHedge */}
            <div className="ea-card purple">
              <div className="ea-tag purple">Aggressive Growth</div>
              <div className="ea-card-name">TheRocket EA MegiHedge</div>
              <div className="ea-card-desc">Hedge · ກຳໄລໄວ · Short-term</div>
              <div className="ea-rows">
                <div className="ea-row">
                  <span className="ea-k">Strategy</span>
                  <span className="ea-v">Hedging</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Risk Level</span>
                  <span className="ea-v rd">Higher</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Profit Style</span>
                  <span className="ea-v ok">Short-term</span>
                </div>
                <div className="ea-row">
                  <span className="ea-k">Best For</span>
                  <span className="ea-v">Active Growth</span>
                </div>
              </div>
              <button className="btn-purple-full">ໃຊ້ MegiHedge →</button>
            </div>
          </div>

          {/* Steps */}
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-title">ເປີດບັນຊີ Broker</div>
              <div className="step-sub">ສະໝັກຜ່ານ Link LFT</div>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-title">ເຊື່ອມ EA System</div>
              <div className="step-sub">Connect TheRocket EA</div>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-title">Trade ອັດຕະໂນມັດ</div>
              <div className="step-sub">ບໍ່ຕ້ອງເຝົ້ານຳ</div>
            </div>
          </div>

          {/* Risk Disclosure */}
          <div className="risk-banner">
            ⚠ Risk Disclosure: ການລົງທຶນໃນ Forex ມີຄວາມສ່ຽງ · ຜົນງານໃນອະດີດບໍ່ຮັບປະກັນຜົນໃນອະນາຄົດ
          </div>

          {/* CTA Row */}
          <div className="cta-row">
            <button className="btn-primary">ເລີ່ມ Copy Trade</button>
            <button className="btn-telegram">Join Telegram</button>
            <button className="btn-ghost">ດູ Live Results</button>
          </div>
        </div>
      </div>
    </>
  )
}
