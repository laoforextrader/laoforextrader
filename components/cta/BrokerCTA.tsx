'use client'

import { trackClick, brokerTarget } from '@/lib/trackClick'

interface Props {
  name: string
  slug: string
  badge: string
  badgeColor?: string
  sub: string
  registerUrl: string
  logoInitials: string
  logoSrc?: string
  theme: 'xm' | 'exness' | 'markets4you' | 'vantage' | 'interstellar' | 'iux'
}

const themes = {
  xm:            { bg:'linear-gradient(135deg, #991B1B 0%, #B91C1C 50%, #7F1D1D 100%)',   border:'rgba(252,165,165,.55)', blob1:'#FCA5A5', blob2:'#FB7185', logo:'rgba(255,255,255,.18)', text:'#FECACA', badge:'rgba(255,255,255,.22)' },
  exness:        { bg:'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #1E40AF 100%)',   border:'rgba(147,197,253,.55)', blob1:'#93C5FD', blob2:'#60A5FA', logo:'rgba(255,255,255,.18)', text:'#DBEAFE', badge:'rgba(74,222,128,.30)' },
  'markets4you': { bg:'linear-gradient(135deg, #065F46 0%, #047857 50%, #064E3B 100%)',   border:'rgba(110,231,183,.55)', blob1:'#6EE7B7', blob2:'#34D399', logo:'rgba(255,255,255,.18)', text:'#D1FAE5', badge:'rgba(110,231,183,.30)' },
  vantage:       { bg:'linear-gradient(135deg, #5B21B6 0%, #6D28D9 50%, #4C1D95 100%)',   border:'rgba(196,181,253,.55)', blob1:'#C4B5FD', blob2:'#A78BFA', logo:'rgba(255,255,255,.18)', text:'#EDE9FE', badge:'rgba(196,181,253,.30)' },
  interstellar:  { bg:'linear-gradient(135deg, #3730A3 0%, #4338CA 50%, #312E81 100%)',   border:'rgba(165,180,252,.55)', blob1:'#A5B4FC', blob2:'#818CF8', logo:'rgba(255,255,255,.18)', text:'#E0E7FF', badge:'rgba(165,180,252,.30)' },
  iux:           { bg:'linear-gradient(135deg, #9A3412 0%, #C2410C 50%, #7C2D12 100%)',   border:'rgba(253,186,116,.55)', blob1:'#FDBA74', blob2:'#FB923C', logo:'rgba(255,255,255,.18)', text:'#FFEDD5', badge:'rgba(253,186,116,.30)' },
}

export default function BrokerCTA({ name, slug, badge, sub, registerUrl, logoInitials, logoSrc, theme }: Props) {
  const t = themes[theme]

  return (
    <>
      <style>{`
        @keyframes float-blob1 {
          0%,100%{transform:translate(0,0)} 40%{transform:translate(14px,-10px)} 70%{transform:translate(-8px,8px)}
        }
        @keyframes float-blob2 {
          0%,100%{transform:translate(0,0)} 35%{transform:translate(-12px,8px)} 70%{transform:translate(10px,-6px)}
        }
        @keyframes cta-shimmer {
          0%{transform:translateX(-100%)} 100%{transform:translateX(260%)}
        }
        @keyframes cta-scanner {
          0%{top:-2px} 100%{top:100%}
        }
        @keyframes cta-btn-glow {
          0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)} 60%{box-shadow:0 0 0 8px rgba(37,99,235,0)}
        }
        @keyframes cta-arrow {
          0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)}
        }
        @keyframes pulse-dot {
          0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(1.6)}
        }
        .broker-cta-wrap {
          position:relative; overflow:hidden; border-radius:14px;
          padding:18px 20px; display:flex; align-items:center; gap:16px;
          border:1px solid; margin:0 0 12px;
          transition:transform .25s;
        }
        .broker-cta-wrap:hover { transform:translateY(-2px); }
        .broker-cta-shimmer {
          position:absolute; inset:0; width:40%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
          animation:cta-shimmer 4s ease-in-out infinite;
          pointer-events:none;
        }
        .broker-cta-scanner {
          position:absolute; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
          animation:cta-scanner 5s linear infinite;
          pointer-events:none;
        }
        .broker-blob1 {
          position:absolute; border-radius:50%;
          width:200px; height:200px; top:-60px; right:30px;
          opacity:.35; animation:float-blob1 8s ease-in-out infinite;
          pointer-events:none;
        }
        .broker-blob2 {
          position:absolute; border-radius:50%;
          width:120px; height:120px; bottom:-40px; right:110px;
          opacity:.25; animation:float-blob2 11s ease-in-out infinite;
          pointer-events:none;
        }
        .broker-cta-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:9px 20px; border-radius:9px;
          font-size:13px; font-weight:500; border:none;
          cursor:pointer; white-space:nowrap; flex-shrink:0;
          background:#2563EB; color:#fff;
          transition:transform .15s, opacity .15s;
          animation:cta-btn-glow 2.8s infinite;
          position:relative; z-index:2;
          font-family:'Noto Sans Lao', sans-serif;
        }
        .broker-cta-btn:hover { transform:scale(.96); opacity:.9; }
        .broker-cta-arrow { display:inline-flex; animation:cta-arrow 1.8s ease-in-out infinite; }
        .broker-live-dot {
          width:6px; height:6px; border-radius:50%;
          display:inline-block; flex-shrink:0;
          animation:pulse-dot 1.6s infinite;
        }
      `}</style>

      <div className="broker-cta-wrap" style={{ background: t.bg, borderColor: t.border }}>
        <div className="broker-cta-shimmer" />
        <div className="broker-cta-scanner" />
        <div className="broker-blob1" style={{ background: t.blob1 }} />
        <div className="broker-blob2" style={{ background: t.blob2 }} />

        <div style={{
          width:44, height:44, borderRadius:10, flexShrink:0,
          background: logoSrc ? '#fff' : t.logo,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:12, color: t.text,
          position:'relative', zIndex:2, overflow:'hidden',
          padding: logoSrc ? 2 : 0,
          border: logoSrc ? '1px solid #E2E6F0' : 'none',
          boxSizing:'border-box',
        }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${name} logo`}
              style={{
                width:'100%', height:'100%',
                objectFit:'contain', display:'block',
                borderRadius:8, background:'#fff',
              }}
            />
          ) : logoInitials}
        </div>

        <div style={{ flex:1, minWidth:0, position:'relative', zIndex:2 }}>
          <div style={{
            fontSize:10, fontWeight:500, padding:'2px 9px',
            borderRadius:100, display:'inline-flex', alignItems:'center', gap:4,
            marginBottom:5, background: t.badge, color: t.text,
            fontFamily:'Noto Sans Lao, sans-serif',
          }}>
            {badge}
          </div>
          <p style={{ fontSize:14, fontWeight:500, margin:'0 0 2px', color:'#fff', fontFamily:'Noto Sans Lao, sans-serif' }}>
            {name}
          </p>
          <p style={{ fontSize:12, margin:0, color:'rgba(255,255,255,.45)', fontFamily:'Noto Sans Lao, sans-serif' }}>
            {sub}
          </p>
        </div>

        <a
          href={registerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick({ target: brokerTarget(slug), label: name, group: 'broker' })}
          style={{ textDecoration:'none' }}
        >
          <button className="broker-cta-btn">
            ສະໝັກເລີຍ
            <span className="broker-cta-arrow">
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
