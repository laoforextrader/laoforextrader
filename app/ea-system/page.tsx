"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"

/* ── Particle Canvas ─────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -999, y: -999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let raf: number

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    canvas.addEventListener("mousemove", onMove)

    // Particles
    const N = 90
    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number; alpha: number }
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      hue: Math.random() > 0.5 ? 195 : 270, // cyan or purple
      alpha: Math.random() * 0.6 + 0.3,
    }))

    // Robot head path (centered)
    function drawRobot(cx: number, cy: number) {
      const s = Math.min(canvas.width, canvas.height) * 0.22
      ctx.save()
      ctx.strokeStyle = "rgba(0,212,255,0.12)"
      ctx.lineWidth = 1.5

      // Head body
      const hw = s * 0.7, hh = s * 0.6
      ctx.strokeRect(cx - hw / 2, cy - hh / 2, hw, hh)

      // Antenna
      ctx.beginPath()
      ctx.moveTo(cx, cy - hh / 2)
      ctx.lineTo(cx, cy - hh / 2 - s * 0.25)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy - hh / 2 - s * 0.25, s * 0.04, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0,212,255,0.3)"
      ctx.stroke()

      // Eyes
      const ey = cy - hh * 0.08
      const ex = hw * 0.22
      ;[cx - ex, cx + ex].forEach(x => {
        ctx.beginPath()
        ctx.arc(x, ey, s * 0.09, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(0,212,255,0.35)"
        ctx.stroke()
        // glow dot
        ctx.beginPath()
        ctx.arc(x, ey, s * 0.035, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0,212,255,0.5)"
        ctx.fill()
      })

      // Mouth bar
      ctx.strokeStyle = "rgba(0,212,255,0.2)"
      ctx.strokeRect(cx - hw * 0.3, cy + hh * 0.18, hw * 0.6, hh * 0.12)
      ;[-0.15, 0, 0.15].forEach(offset => {
        ctx.beginPath()
        ctx.moveTo(cx + offset * hw, cy + hh * 0.18)
        ctx.lineTo(cx + offset * hw, cy + hh * 0.3)
        ctx.stroke()
      })

      // Neck + shoulders
      ctx.strokeStyle = "rgba(0,212,255,0.1)"
      ctx.beginPath()
      ctx.moveTo(cx - hw * 0.15, cy + hh / 2)
      ctx.lineTo(cx - hw * 0.15, cy + hh / 2 + s * 0.12)
      ctx.lineTo(cx - hw * 0.55, cy + hh / 2 + s * 0.12)
      ctx.moveTo(cx + hw * 0.15, cy + hh / 2)
      ctx.lineTo(cx + hw * 0.15, cy + hh / 2 + s * 0.12)
      ctx.lineTo(cx + hw * 0.55, cy + hh / 2 + s * 0.12)
      ctx.stroke()

      ctx.restore()
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2
      drawRobot(cx, cy)

      // Move & draw particles
      pts.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouse.current.x
        const dy = p.y - mouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          p.vx += (dx / dist) * 0.18
          p.vy += (dy / dist) * 0.18
        }
        // Damping
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.alpha})`
        ctx.fill()
      })

      // Lines between nearby particles
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 90) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${0.12 * (1 - d / 90)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", onMove)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard() {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 16, padding: "20px 22px", backdropFilter: "blur(12px)", minWidth: 220 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00D4FF", marginBottom: 14 }}>
        TheRocket EA SGride
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "Today",       value: "+2.4%",  color: "#4ADE80" },
          { label: "This Month",  value: "+18.7%", color: "#4ADE80" },
          { label: "All Time",    value: "+500%",  color: "#00D4FF" },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{row.label}</span>
            <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, height: 36, display: "flex", alignItems: "flex-end", gap: 3 }}>
        {[60,45,70,55,80,65,90,75,85,100,88,95].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: `rgba(0,212,255,${0.2 + h / 200})` }} />
        ))}
      </div>
    </div>
  )
}

/* ── EA Card ─────────────────────────────────────────────── */
function EACard({ name, tag, desc, stats, color, href }: {
  name: string; tag: string; desc: string
  stats: { label: string; value: string }[]
  color: string; href: string
}) {
  const light = color === "blue" ? "#EEF3FF" : "#F5F3FF"
  const mid   = color === "blue" ? "#2563EB" : "#7C3AED"
  const border= color === "blue" ? "#BFCFFF" : "#DDD6FE"
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${border}`, borderRadius: 18, padding: "28px 26px", flex: 1 }}>
      <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: mid, background: light, padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>
        {tag}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>{name}</h3>
      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, marginBottom: 20 }}>{desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: light, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: mid }}>{s.value}</div>
          </div>
        ))}
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ display: "block", textAlign: "center", padding: "11px 0", background: `linear-gradient(135deg,${mid},${color === "blue" ? "#4F46E5" : "#6D28D9"})`, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>
        ສັ່ງຊື້ / ຮຽນຮູ້ເພີ່ມ →
      </a>
    </div>
  )
}

/* ── Step ────────────────────────────────────────────────── */
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function EASystemPage() {
  return (
    <div>
      {/* ── DARK HERO ── */}
      <section style={{ background: "#0B0F1A", minHeight: "60vh", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <ParticleCanvas />

        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 70% 50%, rgba(124,58,237,0.12), transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 50% at 30% 50%, rgba(0,212,255,0.07), transparent)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1060, margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 48, alignItems: "center", width: "100%" }}>
          <StatCard />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#00D4FF", marginBottom: 14 }}>
              ⚡ LaoForexTrader — Automated Trading
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 16 }}>
              TheRocket<br />
              <span style={{ background: "linear-gradient(135deg,#00D4FF,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                EA System
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 420, marginBottom: 28 }}>
              ລະບົບ Expert Advisor ທີ່ອອກແບບສຳລັບ Trader ລາວ<br />
              Trade ອັດຕະໂນມັດ 24/5 · Risk Management ລະດັບ Pro
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#ea-cards" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#00D4FF,#2563EB)", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>
                ເບິ່ງ EA ທັງໝົດ →
              </a>
              <Link href="/broker" style={{ padding: "12px 22px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>
                ເລືອກ Broker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE SECTION ── */}
      <div style={{ background: "#EDEEF2" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 24px" }}>

          {/* EA Cards */}
          <div id="ea-cards" style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 8 }}>EA Products</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>
              ເລືອກ EA ທີ່ໃຊ່ທ່ານ
            </h2>
            <p style={{ fontSize: 14, color: "#374151", marginBottom: 32 }}>
              ທົດສອບຈາກ Live Account · Verified · Myfxbook Ready
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <EACard
                name="TheRocket EA SGride"
                tag="Trend Following"
                desc="ລະບົບຕິດຕາມ Trend ດ້ວຍ Smart Grid ທີ່ປ້ອງກັນ Drawdown ດ້ວຍ Dynamic SL/TP ອັດຕະໂນມັດ"
                stats={[
                  { label: "All-time Return", value: "+500%" },
                  { label: "Max DD",           value: "12.4%" },
                  { label: "Win Rate",         value: "68%" },
                  { label: "Monthly Avg",      value: "+8.2%" },
                ]}
                color="blue"
                href="#"
              />
              <EACard
                name="TheRocket EA MegiHedge"
                tag="Hedging Strategy"
                desc="ລະບົບ Hedge 2 ທາງ ປ້ອງກັນການຂາດທຶນໃນຕະຫຼາດ Sideways ດ້ວຍ Algorithm ການ Balance Position"
                stats={[
                  { label: "All-time Return", value: "+320%" },
                  { label: "Max DD",           value: "8.1%" },
                  { label: "Win Rate",         value: "74%" },
                  { label: "Monthly Avg",      value: "+6.5%" },
                ]}
                color="purple"
                href="#"
              />
            </div>
          </div>

          {/* How to start */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 18, padding: "32px 36px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 8 }}>ເລີ່ມຕົ້ນງ່າຍ</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 28, letterSpacing: "-0.02em" }}>3 ຂັ້ນຕອນ ເລີ່ມ Trade ອັດຕະໂນມັດ</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <Step n={1} title="ເປີດບັນຊີ Broker ທີ່ຮອງຮັບ"
                desc="ສະໝັກ XM Global ຫຼື Exness ຜ່ານລິ້ງຂອງເຮົາ ເພື່ອຮັບການ Support ຈາກທີມ LFT ໂດຍກົງ" />
              <Step n={2} title="ດາວໂຫຼດ MT5 ແລະ ຕິດຕັ້ງ EA"
                desc="ຮັບໄຟລ໌ .ex5 ຫຼັງຊຳລະ · Import ເຂົ້າ MetaTrader 5 · ຕັ້ງຄ່ານ Lot Size ຕາມທຶນ" />
              <Step n={3} title="ເປີດ EA ແລະ Trade ອັດຕະໂນມັດ"
                desc="VPS Hosting ຫຼື ເປີດ PC 24/5 · EA ຈະ Trade ແທນທ່ານ · ຕິດຕາມຜ່ານ Phone ໄດ້ທຸກທີ່" />
            </div>
          </div>

          {/* Risk disclosure */}
          <div style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: 12, padding: "16px 20px", marginBottom: 32, fontSize: 12, color: "#92400E", lineHeight: 1.7 }}>
            <strong>⚠ Risk Disclosure:</strong> ການ Trade Forex ມີຄວາມສ່ຽງສູງ ທ່ານອາດສູນເສຍທຶນທັງໝົດ. EA ຜ່ານການທົດສອບ Backtest ແລະ Live Test ແຕ່ Past Performance ບໍ່ໄດ້ຮັບປະກັນ Future Results. ຄວນ Trade ດ້ວຍທຶນທີ່ພ້ອມສູນເສຍໄດ້ເທົ່ານັ້ນ.
          </div>

          {/* CTA */}
          <div style={{ background: "linear-gradient(135deg,#0B0F1A,#1E1B4B)", borderRadius: 18, padding: "40px 36px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00D4FF", marginBottom: 10 }}>
              ພ້ອມ Automate ການ Trade ແລ້ວບໍ?
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>ຕິດຕໍ່ທີມ LFT ວັນນີ້</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              ສອບຖາມ ຟຣີ · Line / Telegram / Facebook
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/broker"
                style={{ padding: "12px 32px", background: "linear-gradient(135deg,#00D4FF,#2563EB)", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: "none" }}>
                ສະໝັກ Broker ແລ້ວຕິດຕໍ່ →
              </Link>
              <Link href="/lessons"
                style={{ padding: "12px 22px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>
                ຮຽນຮູ້ EA ເພີ່ມ
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
