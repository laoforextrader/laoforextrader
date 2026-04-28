'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div style={{ width: 120, height: 36, borderRadius: 8, background: '#F3F4F6' }} />
    )
  }

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user?.name || 'user'}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <span
          style={{
            fontSize: 13,
            color: '#374151',
            fontWeight: 600,
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: "'Noto Sans Lao', sans-serif",
          }}
        >
          {session.user?.name}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            background: 'none',
            border: '1px solid #D1D5DB',
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: "'Noto Sans Lao', sans-serif",
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.background = '#FEF2F2'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#FCA5A5'
            ;(e.currentTarget as HTMLElement).style.color = '#EF4444'
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.background = 'none'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'
            ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
          }}
        >
          ອອກຈາກລະບົບ
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'linear-gradient(135deg,#2563EB,#4F46E5)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Noto Sans Lao', sans-serif",
        textDecoration: 'none',
        letterSpacing: '0.01em',
        transition: 'opacity 0.2s',
      }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      ສະໝັກ / ເຂົ້າສູ່ລະບົບ
    </Link>
  )
}
