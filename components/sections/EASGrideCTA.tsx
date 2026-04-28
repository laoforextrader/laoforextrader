import { Rocket } from "lucide-react"
import { GalaxyCanvas } from "@/components/ui/GalaxyCanvas"

export default function EASGrideCTA() {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #050816 0%, #0B1230 50%, #1B0F36 100%)',
      padding: '64px 24px',
      borderTop: '1px solid #1E1B4B',
      borderBottom: '1px solid #1E1B4B',
    }}>
      {/* Galaxy particle background — covers entire section, mouse-interactive */}
      <GalaxyCanvas />

      <div className="ea-cta-grid" style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1060, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 48, alignItems: 'center',
      }}>
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
          <h2 style={{
            fontSize: 42, fontWeight: 800, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 8,
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            ກຳໄລ <span style={{
              background: 'linear-gradient(135deg, #4ADE80, #22D3EE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>+500%</span>
            <br />ໃນ 7 ເດືອນ
          </h2>
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
            <a href="/ea-system#results" style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#fff', textDecoration: 'none',
              padding: '14px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              border: '1.5px solid rgba(255,255,255,0.25)',
              fontFamily: 'Noto Sans Lao, sans-serif',
              backdropFilter: 'blur(6px)',
            }}>
              ດູ Live Results
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
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ADE80',
              display: 'inline-block',
              animation: 'easgride-pulse 1.5s infinite',
            }} />
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
            <div style={{ fontSize: 48, fontWeight: 700, color: '#4ADE80', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
              +500%
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Total Growth · 7 months
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'ເດືອນນີ້', value: '+18.7%', color: '#60A5FA' },
              { label: 'ມື້ນີ້',   value: '+2.4%',  color: '#4ADE80' },
              { label: 'Strategy', value: 'Grid',   color: '#A78BFA' },
              { label: 'Risk',     value: 'Medium', color: '#FCD34D' },
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

      <style>{`
        @keyframes easgride-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        @media (max-width: 768px) {
          .ea-cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
