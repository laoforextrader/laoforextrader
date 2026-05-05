'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Props {
  quiz: {
    title: string
    slug: { current: string } | string
    level: string
    requiresLogin: boolean
    totalQuestions: number
    icon: string
  }
}

const bgMap: Record<string, string> = {
  basic: 'linear-gradient(135deg,#1a2744,#0F172A)',
  intermediate: 'linear-gradient(135deg,#1a1a35,#0B0918)',
  advanced: 'linear-gradient(135deg,#2d1010,#1a0808)',
}

export default function QuizSidebar({ quiz }: Props) {
  const slug = typeof quiz.slug === 'string' ? quiz.slug : quiz.slug?.current
  const { status } = useSession()
  const showLockBadge = quiz.requiresLogin && status === 'unauthenticated'

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      overflow: 'hidden', border: '1px solid #F3F4F6',
      boxShadow: '0 2px 12px rgba(0,0,0,.06)',
      margin: '24px 0',
    }}>
      <div style={{
        height: 110, background: bgMap[quiz.level] || bgMap.basic,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#fff',
          textAlign: 'center', padding: '0 12px', marginBottom: 5,
          fontFamily: 'Noto Sans Lao, sans-serif',
        }}>
          {quiz.title}
        </div>
        <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,.4)', marginBottom: 5 }} />
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,.55)', fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          {quiz.icon} {quiz.level} · Quiz
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12,
        }}>
          <div style={{
            fontSize: 11, color: '#6B7280',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            {quiz.totalQuestions} ຂໍ້
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
            background: showLockBadge ? '#EEF3FF' : '#ECFDF5',
            color: showLockBadge ? '#2563EB' : '#059669',
          }}>
            {showLockBadge ? '🔒 Login' : 'ຟຣີ'}
          </div>
        </div>
        <Link href={`/quiz/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div className="animate-quiz-next" style={{
            width: '100%', background: '#2563EB', color: '#fff',
            border: 'none', padding: '11px', borderRadius: 100,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            textAlign: 'center', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            fontFamily: 'Noto Sans Lao, sans-serif',
            transformOrigin: 'center',
          }}>
            Start Quiz ▶
          </div>
        </Link>
      </div>
    </div>
  )
}
