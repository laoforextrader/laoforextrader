import { Rocket } from "lucide-react"
import { GalaxyCanvas } from "@/components/ui/GalaxyCanvas"
import styles from "./EASGrideCTA.module.css"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { EAStats } from "@/types"

function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}%`
}

function pctColor(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  return n >= 0 ? "#4ADE80" : "#EF4444"
}

export default async function EASGrideCTA() {
  let stats: EAStats | null = null
  try {
    stats = await sanityClient.fetch<EAStats>(
      QUERIES.eaStatsByEaId("sgride"),
      {},
      { next: { revalidate: 60 } }
    )
    if (!stats || stats.updateMode === "off") stats = null
  } catch {}

  const totalDisplay = fmtPct(stats?.profitTotalPct, "+500%")
  const totalColor   = pctColor(stats?.profitTotalPct, "#4ADE80")

  const monthly      = stats?.monthlyReturns ?? []
  const lastMonth    = monthly.length ? monthly[monthly.length - 1] : null
  const monthDisplay = fmtPct(lastMonth?.profitPct, "+18.7%")
  const monthColor   = pctColor(lastMonth?.profitPct, "#60A5FA")

  const daily        = stats?.dailyReturns ?? []
  const lastDay      = daily.length ? daily[daily.length - 1] : null
  const dayDisplay   = fmtPct(lastDay?.profitPct, "+2.4%")
  const dayColor     = pctColor(lastDay?.profitPct, "#4ADE80")

  return (
    <section className={styles.section}>
      {/* Galaxy particle background — covers entire section, mouse-interactive */}
      <GalaxyCanvas />

      <div className={styles.grid}>
        {/* Left: Text */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)',
            borderRadius: 100, padding: '5px 14px',
            fontSize: 11, color: '#93C5FD', fontWeight: 700,
            marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase',
            backdropFilter: 'blur(6px)',
          }}>
            <Rocket size={13} strokeWidth={2.5} style={{ color: '#FCD34D' }} />
            TheRocket EA SGride
          </div>
          <div role="heading" aria-level={2} className={styles.rocketTitle} style={{ marginBottom: 8 }}>
            <span className={styles.rocketIconWrap} aria-hidden="true">
              <Rocket size={32} strokeWidth={2.4} style={{ color: '#FCD34D' }} />
            </span>
            <span>TheRocketEA</span>
          </div>
          <p style={{
            fontSize: 16, fontWeight: 700, marginBottom: 8,
            background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            ຈາກ Live Account ຈິງ
          </p>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, marginBottom: 32,
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            ບໍ່ແມ່ນ Backtest · Trade ອັດຕະໂນມັດ 24/5<br />
            ກ໊ອບ Trade ໄດ້ທັນທີ · ຮັບ Merch ຟຣີ
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/ea-system" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              color: '#fff', textDecoration: 'none',
              padding: '14px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              fontFamily: 'Noto Sans Lao, sans-serif',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}>
              <Rocket size={15} strokeWidth={2.5} />
              ເລີ່ມ Copy Trade →
            </a>
            <a
              href="https://line.me/R/ti/p/@499dvtuz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', textDecoration: 'none',
                padding: '14px 28px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                border: '1.5px solid rgba(255,255,255,0.25)',
                fontFamily: 'Noto Sans Lao, sans-serif',
                backdropFilter: 'blur(6px)',
              }}
            >
              ເບິ່ງ Live Results
            </a>
          </div>
        </div>

        {/* Right: Stat card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 20, padding: 28,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(74,222,128,0.12)',
            border: '0.5px solid rgba(74,222,128,0.35)',
            borderRadius: 100, padding: '4px 12px',
            fontSize: 11, color: '#4ADE80', fontWeight: 600, marginBottom: 20,
          }}>
            <span className={styles.pulseDot} />
            Live Account Running
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <Rocket size={11} strokeWidth={2.5} style={{ color: '#FCD34D' }} />
              TheRocket EA SGride
            </div>
            <div style={{ fontSize: 48, fontWeight: 700, color: totalColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
              {totalDisplay}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Total Growth · 7 months
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'ເດືອນນີ້', value: monthDisplay, color: monthColor },
              { label: 'ມື້ນີ້',   value: dayDisplay,   color: dayColor },
              { label: 'Strategy', value: 'Grid',       color: '#A78BFA' },
              { label: 'Risk',     value: 'Medium',     color: '#FCD34D' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
