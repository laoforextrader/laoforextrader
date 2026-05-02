import { ImageResponse } from 'next/og'
import { CANDLES, getOGStyle, CATEGORY_LABELS } from './ogCandlesticks'

export const OG_SIZE = { width: 1200, height: 630 }

function CandleLayer({ opacity }: { opacity: number }) {
  return (
    <div style={{
      display: 'flex',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1200,
      height: 630,
      opacity,
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
  )
}

export function generateOGImage(article: {
  title: string
  excerpt?: string
  category: string
  readTime?: number
}) {
  const style = getOGStyle(article.category)
  const catLabel = CATEGORY_LABELS[article.category] || article.category
  const title = article.title || 'LaoForexTrader'
  const excerpt = article.excerpt?.slice(0, 110) || ''
  const isEA = article.category === 'ea-tools'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 80px',
          background: style.bg,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        <CandleLayer opacity={style.candleOpacity} />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.88))',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '50%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.35), transparent)',
          }}
        />

        {isEA && (
          <div style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)`,
            opacity: 0.7,
          }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex',
              background: style.badgeBg,
              borderRadius: 8,
              padding: '6px 16px',
              color: style.badgeColor,
              fontSize: 20,
              fontWeight: 900,
            }}>
              LFT
            </div>
            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.45)', fontSize: 16, fontWeight: 500 }}>
              LaoForexTrader
            </div>
          </div>

          <div style={{
            display: 'flex',
            background: style.catBg,
            border: `1px solid ${style.catBorder}`,
            borderRadius: 100,
            padding: '5px 18px',
            color: style.catColor,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {catLabel}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, flex: 1, justifyContent: 'center', padding: '32px 0 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: style.eyebrow,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', width: 28, height: 2, background: style.eyebrow, borderRadius: 2 }} />
            {isEA ? '● LIVE ACCOUNT' : catLabel}
          </div>

          <div style={{
            display: 'flex',
            color: '#fff',
            fontSize: title.length > 40 ? 42 : 48,
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            {title}
          </div>

          {excerpt && (
            <div style={{
              display: 'flex',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 20,
              lineHeight: 1.6,
              maxWidth: 820,
            }}>
              {excerpt}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.28)', fontSize: 14, fontWeight: 500 }}>
            laoforextrader.com
          </div>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 100,
            padding: '5px 16px',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13,
          }}>
            {article.readTime ? `${article.readTime} ນາທີ` : 'LaoForexTrader'}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  )
}
