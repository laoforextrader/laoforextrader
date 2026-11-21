'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthModal from '@/components/account/AuthModal'
import { TERMS_VERSION } from '@/lib/terms'

//  Two states, never both at once (owner's call, 2026-11-22):
//
//    signed out   one button that says "log in" and opens the join form
//    signed in    the profile picture, which goes to the dashboard
//
//  The old button read "register / log in" and did neither — it went to a
//  page. Signing out used to sit here as a second button; it belongs on the
//  dashboard, where somebody who means to leave is already looking.

function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  if (src) {
    return (
      <img src={src} alt={name ?? 'account'} width={30} height={30}
        style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
    )
  }
  return (
    <span style={{
      width: 30, height: 30, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
      color: 'var(--accent)', fontSize: 13, fontWeight: 800,
    }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

/** Outline person, drawn rather than an emoji — the site avoids those. */
function PersonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function LoginButton() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  if (status === 'loading') {
    return <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-3)' }} />
  }

  if (session) {
    return (
      <Link href="/dashboard" title={session.user?.email ?? 'ບັນຊີຂອງຂ້ອຍ'}
        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', lineHeight: 0 }}>
        <Avatar src={session.user?.image} name={session.user?.name} />
      </Link>
    )
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'linear-gradient(135deg,#2563EB,#4F46E5)', color: '#fff',
          border: 'none', borderRadius: 8, padding: '7px 13px',
          fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
          fontFamily: "'Noto Sans Lao', sans-serif", letterSpacing: '0.01em',
        }}>
        <PersonIcon />
        {/* On a phone the icon alone is the button — the label would crowd
            the search and menu controls beside it. */}
        <span className="hide-sm">ເຂົ້າສູ່ລະບົບ</span>
      </button>
      <AuthModal open={open} onClose={() => setOpen(false)} termsVer={TERMS_VERSION} />
    </>
  )
}
