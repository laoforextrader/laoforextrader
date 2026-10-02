export function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--accent-soft), var(--violet-soft))',
      border: '1.5px solid var(--accent-line)',
      borderRadius: 12,
      padding: '16px 20px',
      margin: '20px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 4, background: 'linear-gradient(180deg, #2563EB, #4F46E5)',
        borderRadius: '12px 0 0 12px'
      }} />
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--accent)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
      }}>
        <span>💡</span> ສຳ ຄັນ
      </div>
      <div style={{ color: 'var(--accent-ink)', fontSize: 14, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--warn-soft)',
      border: '1.5px solid var(--warn-line)',
      borderRadius: 12,
      padding: '16px 20px',
      margin: '20px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 4, background: '#F59E0B',
        borderRadius: '12px 0 0 12px'
      }} />
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--warn)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
      }}>
        <span>⚠️</span> ລະ ວັງ
      </div>
      <div style={{ color: 'var(--warn-ink)', fontSize: 14, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--success-soft)',
      border: '1.5px solid var(--success-line)',
      borderRadius: 12,
      padding: '16px 20px',
      margin: '20px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 4, background: '#10B981',
        borderRadius: '12px 0 0 12px'
      }} />
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--success)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
      }}>
        <span>✅</span> Tips
      </div>
      <div style={{ color: 'var(--success-ink)', fontSize: 14, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export function KeyPointBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0F172A, #1E3A8A)',
      borderRadius: 12,
      padding: '20px 24px',
      margin: '24px 0',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#60A5FA',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6
      }}>
        <span>⭐</span> ສະ ຫຼຸບ ຈຸດ ສຳ ຄັນ
      </div>
      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}
