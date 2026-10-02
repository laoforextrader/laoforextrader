'use client'

interface Props {
  html: string
}

export default function BrokerAdsBanner({ html }: Props) {
  if (!html) return null

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 12,
      overflow: 'hidden',
      margin: '24px 0',
    }}>
      <div style={{
        padding: '6px 14px',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 10,
          color: 'var(--fg-4)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          ໂຄສະນາ · Sponsored
        </span>
      </div>
      <div
        className="broker-ads-banner-inner"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .broker-ads-banner-inner { padding: 0; line-height: 0; font-size: 0; }
        .broker-ads-banner-inner > a { display: block; width: 100%; }
        .broker-ads-banner-inner img {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
        }
      `}</style>
    </div>
  )
}
