'use client'
import { useState, useEffect } from 'react'
import { trackClick } from '@/lib/trackClick'

interface Props {
  name: 'SGride' | 'MegiHedge v2.0' | 'ABS v2.0'
  totalGain: string
  monthlyGain: string
  sub: string
  href: string
  /** Pre-launch mode: hide profit numbers, show "Coming Soon". */
  comingSoon?: boolean
}

export default function EaCTA({ name, totalGain, monthlyGain, sub, href, comingSoon = false }: Props) {
  const isSGride = name === 'SGride'
  const isABS = name === 'ABS v2.0'
  const [monthly, setMonthly] = useState(parseFloat(monthlyGain))

  useEffect(() => {
    let t = 0
    const id = setInterval(() => {
      t++
      setMonthly(prev => parseFloat((parseFloat(monthlyGain) + Math.sin(t * (isSGride ? .5 : .6) + (isSGride ? 0 : 1)) * 0.3).toFixed(1)))
    }, 2500)
    return () => clearInterval(id)
  }, [monthlyGain, isSGride])

  // Stable id for /admin — 'MegiHedge v2.0' -> 'megihedge-v2-0'
  const eaSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const accent = isABS ? '#059669' : isSGride ? '#2563EB' : '#7C3AED'
  const accentLight = isABS ? 'rgba(52,211,153,.5)' : isSGride ? 'rgba(96,165,250,.5)' : 'rgba(167,139,250,.5)'
  const bg = isABS
    ? 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #03261C 100%)'
    : isSGride
    ? 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #0F1B4F 100%)'
    : 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 50%, #2A1065 100%)'
  const blob1 = isABS ? 'rgba(110,231,183,.55)' : isSGride ? 'rgba(147,197,253,.55)' : 'rgba(196,181,253,.55)'
  const blob2 = isABS ? 'rgba(251,191,36,.35)'  : isSGride ? 'rgba(96,165,250,.4)'   : 'rgba(167,139,250,.4)'
  const gainColor = '#4ADE80'
  const dotColor = isABS ? '#6EE7B7' : isSGride ? '#4ADE80' : '#C4B5FD'
  const pillBg = isABS ? 'rgba(52,211,153,.18)' : isSGride ? 'rgba(74,222,128,.18)' : 'rgba(196,181,253,.18)'
  const pillBorder = isABS ? 'rgba(52,211,153,.45)' : isSGride ? 'rgba(74,222,128,.45)' : 'rgba(196,181,253,.45)'

  return (
    <>
      <style>{`
        @keyframes ea-float1{0%,100%{transform:translate(0,0)}40%{transform:translate(14px,-10px)}70%{transform:translate(-8px,8px)}}
        @keyframes ea-float2{0%,100%{transform:translate(0,0)}35%{transform:translate(-12px,8px)}70%{transform:translate(10px,-6px)}}
        @keyframes ea-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}
        @keyframes ea-scanner{0%{top:-2px}100%{top:100%}}
        @keyframes ea-pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}
        @keyframes ea-btn-glow-blue{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)}60%{box-shadow:0 0 0 8px rgba(37,99,235,0)}}
        @keyframes ea-btn-glow-purple{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.5)}60%{box-shadow:0 0 0 8px rgba(124,58,237,0)}}
        @keyframes ea-btn-glow-green{0%,100%{box-shadow:0 0 0 0 rgba(5,150,105,.5)}60%{box-shadow:0 0 0 8px rgba(5,150,105,0)}}
        @keyframes ea-arrow{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
        .ea-cta-wrap{
          position:relative;overflow:hidden;border-radius:14px;
          padding:18px 20px;display:flex;align-items:center;gap:20px;
          border:1px solid;margin:0 0 12px;
          transition:transform .25s;
        }
        .ea-cta-wrap:hover{transform:translateY(-2px)}
        .ea-shimmer{position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);animation:ea-shimmer 10s ease-in-out infinite;pointer-events:none}
        .ea-scanner{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:ea-scanner 12s linear infinite;pointer-events:none}
        .ea-blob1{position:absolute;border-radius:50%;width:200px;height:200px;top:-60px;right:20px;opacity:.35;animation:ea-float1 18s ease-in-out infinite;pointer-events:none}
        .ea-blob2{position:absolute;border-radius:50%;width:130px;height:130px;bottom:-40px;left:30px;opacity:.2;animation:ea-float2 24s ease-in-out infinite;pointer-events:none}
        .ea-cta-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:9px 20px;border-radius:9px;font-size:13px;font-weight:500;
          border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;color:#fff;
          transition:transform .15s,opacity .15s;position:relative;z-index:2;
          font-family:'Noto Sans Lao',sans-serif;
        }
        .ea-cta-btn:hover{transform:scale(.96);opacity:.9}
        .ea-arrow{display:inline-flex;animation:ea-arrow 3.6s ease-in-out infinite}
        .ea-pulse-dot{animation:ea-pulse-dot 3.2s infinite}
        .ea-btn-blue{animation:ea-btn-glow-blue 5.6s infinite}
        .ea-btn-purple{animation:ea-btn-glow-purple 5.6s infinite}
        .ea-btn-green{animation:ea-btn-glow-green 5.6s infinite}

        .ea-info{flex:1;min-width:0;position:relative;z-index:2}
        .ea-stats{display:flex;align-items:center;gap:24px;position:relative;z-index:2;flex-shrink:0}

        @media (max-width: 640px) {
          .ea-cta-wrap{
            flex-direction:column;align-items:stretch;gap:14px;
            padding:16px;text-align:center;
          }
          .ea-info{text-align:center}
          .ea-stats{justify-content:center;gap:32px}
          .ea-cta-btn{width:100%;justify-content:center;padding:12px 20px}
          .ea-blob1,.ea-blob2{display:none}
        }
      `}</style>

      <div className="ea-cta-wrap" style={{ background: bg, borderColor: accentLight }}>
        <div className="ea-shimmer" />
        <div className="ea-scanner" />
        <div className="ea-blob1" style={{ background: blob1 }} />
        <div className="ea-blob2" style={{ background: blob2 }} />

        <div className="ea-info">
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            border:`0.5px solid ${pillBorder}`, borderRadius:100,
            padding:'3px 11px', fontSize:11, fontWeight:500,
            background: pillBg, color: dotColor, marginBottom:10,
            fontFamily:'Noto Sans Lao, sans-serif',
          }}>
            {comingSoon ? (
              <>🔜 Coming Soon</>
            ) : (
              <>
                <span className="ea-pulse-dot" style={{
                  width:6, height:6, borderRadius:'50%', background: dotColor,
                  display:'inline-block',
                }} />
                Live Account Running
              </>
            )}
          </div>
          <p style={{ fontSize:15, fontWeight:500, color:'#fff', margin:'0 0 3px', fontFamily:'Noto Sans Lao, sans-serif' }}>
            TheRocket EA {name}
          </p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.38)', margin:0, fontFamily:'Noto Sans Lao, sans-serif' }}>
            {sub}
          </p>
        </div>

        <div className="ea-stats">
          {comingSoon ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:600, color:'#FCD34D', lineHeight:1.1 }}>
                Coming Soon
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.32)', marginTop:3 }}>ກຳລັງຈະເປີດໂຕ</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:500, color: gainColor, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
                  {totalGain}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.32)', marginTop:3 }}>Total</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:500, color:'#60A5FA', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
                  +{monthly.toFixed(1)}%
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.32)', marginTop:3 }}>ເດືອນນີ້</div>
              </div>
            </>
          )}
        </div>

        <a
          href={href}
          onClick={() => trackClick({ target: `ea-cta-${eaSlug}`, label: name, group: 'ea' })}
          style={{ textDecoration:'none', position:'relative', zIndex:2 }}
        >
          <button
            className={`ea-cta-btn ${isABS ? 'ea-btn-green' : isSGride ? 'ea-btn-blue' : 'ea-btn-purple'}`}
            style={{ background: accent }}
          >
            Copy Trade
            <span className="ea-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
        </a>
      </div>
    </>
  )
}
