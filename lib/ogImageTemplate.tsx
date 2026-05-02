import { ImageResponse } from 'next/og'
import { CANDLES_SVG, getOGStyle, CATEGORY_LABELS } from './ogCandlesticks'

export const OG_SIZE = { width: 1200, height: 630 }

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
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: style.candleOpacity,
          }}
          dangerouslySetInnerHTML={{ __html: CANDLES_SVG }}
        />

        <div
          style={{
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
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, fontWeight: 500 }}>
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
            <div style={{ width: 28, height: 2, background: style.eyebrow, borderRadius: 2 }} />
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
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 14, fontWeight: 500 }}>
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
