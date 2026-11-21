'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthModal from '@/components/account/AuthModal'
import { TERMS_VERSION } from '@/lib/terms'
import { useT } from '@/components/i18n/LangProvider'

//  Two states, never both at once:
//
//    signed out   a control that opens the join form
//    signed in    the profile picture, which goes to the dashboard
//
//  `compact` is the phone's version: the same 34px bordered square as the
//  light/dark switch beside it, because on a bar of icons a filled blue
//  button reads as an advert rather than as one more control (owner's call,
//  2026-11-22). The desktop keeps the labelled button, where there is room
//  for a word and no row of icons to match.

function Avatar({ src, name, box }: { src?: string | null; name?: string | null; box: number }) {
  if (src) {
    return (
      <img src={src} alt={name ?? 'account'} width={box} height={box}
        style={{ width: box, height: box, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
    )
  }
  return (
    <span style={{
      width: box, height: box, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
      color: 'var(--accent)', fontSize: 13, fontWeight: 800,
    }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

/** Outline person, drawn rather than an emoji — the site avoids those. */
function PersonIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

//  Returning from Google lands on ?join=1 so the form reopens where it was
//  left. Both copies of this button are in the DOM at once (one is hidden by
//  CSS), and the dialog is portaled to <body> — so whichever mounts first
//  claims the flag and the other stays shut, instead of two dialogs stacking.
let claimed = false

export default function LoginButton({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const t = useT()

  useEffect(() => {
    if (claimed) return
    const p = new URLSearchParams(window.location.search)
    if (p.get('join') !== '1') return
    claimed = true
    setOpen(true)
    //  Take it out of the URL: a refresh an hour later should not reopen it.
    p.delete('join')
    const q = p.toString()
    window.history.replaceState({}, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash)
  }, [])

  if (status === 'loading') {
    return <div style={{ width: compact ? 34 : 30, height: compact ? 34 : 30, borderRadius: compact ? 9 : '50%', background: 'var(--surface-3)' }} />
  }

  if (session) {
    return (
      <Link href="/dashboard" title={session.user?.email ?? t.auth.account}
        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', lineHeight: 0 }}>
        <Avatar src={session.user?.image} name={session.user?.name} box={compact ? 30 : 30} />
      </Link>
    )
  }

  return (
    <>
      {compact ? (
        <button type="button" onClick={() => setOpen(true)}
          className="theme-toggle" aria-label={t.auth.login} title={t.auth.login}>
          <PersonIcon size={18} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'linear-gradient(135deg,#2563EB,#4F46E5)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '7px 13px',
            fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
            fontFamily: "'Noto Sans Lao', sans-serif", letterSpacing: '0.01em',
          }}>
          <PersonIcon />
          <span className="hide-sm">{t.auth.login}</span>
        </button>
      )}
      <AuthModal open={open} onClose={() => setOpen(false)} termsVer={TERMS_VERSION} />
    </>
  )
}
