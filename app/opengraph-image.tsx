import { ImageResponse } from 'next/og'
import { CANDLES } from '@/lib/ogCandlesticks'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function HomeOG() {
  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0E1A 0%, #111827 100%)',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'sans-serif',
        gap: 20,
      }}>
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0, left: 0,
          width: 1200, height: 630,
          opacity: 0.07,
        }}>
          {CANDLES.map((c, i) => (
            <div key={i} style={{ display: 'flex', position: 'absolute', top: 0, left: 0 }}>
              <div style={{
                position: 'absolute',
                left: c.x + 8,
                top: c.wickTop,
                width: 2,
                height: c.wickBottom - c.wickTop,
                background: c.color,
                borderRadius: 1,
              }} />
              <div style={{
                position: 'absolute',
                left: c.x,
                top: c.y,
                width: 18,
                height: c.h,
                background: c.color,
              }} />
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%)',
        }} />

        <div style={{
          display: 'flex',
          background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
          borderRadius: 14, padding: '14px 32px',
          color: '#fff', fontSize: 48, fontWeight: 900, zIndex: 10,
        }}>LFT</div>
        <div style={{ display: 'flex', color: '#fff', fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', zIndex: 10 }}>
          LaoForexTrader
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.45)', fontSize: 24, zIndex: 10 }}>
          ແຫຼ່ງຂໍ້ມູນການເທຣດ #1 ສຳລັບຄົນລາວ
        </div>
        <div style={{ display: 'flex', gap: 16, zIndex: 10, marginTop: 8 }}>
          {['ລີວິວ Broker', 'ຮຽນ Forex ຟຣີ', 'EA System'].map(t => (
            <div key={t} style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 100, padding: '6px 18px',
              color: 'rgba(255,255,255,0.5)', fontSize: 16,
            }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
