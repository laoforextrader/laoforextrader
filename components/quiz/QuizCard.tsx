import Link from 'next/link'
import CandlestickPattern from './CandlestickPattern'

export interface QuizCardData {
  _id: string
  title: string
  slug: { current: string } | string
  level: 'basic' | 'intermediate' | 'advanced' | string
  requiresLogin: boolean
  totalQuestions: number
  icon: string
  color?: string
}

const bgMap: Record<string, string> = {
  basic: 'linear-gradient(135deg,#1a2744,#0F172A)',
  intermediate: 'linear-gradient(135deg,#1a1a35,#0B0918)',
  advanced: 'linear-gradient(135deg,#2d1010,#1a0808)',
}

interface Props {
  quiz: QuizCardData
  compact?: boolean
}

export default function QuizCard({ quiz, compact = false }: Props) {
  const slug = typeof quiz.slug === 'string' ? quiz.slug : quiz.slug?.current
  const locked = quiz.requiresLogin
  const seed = `${quiz._id}-${slug ?? quiz.title}`
  const coverHeight = compact ? 124 : 148

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,.08)',
      border: '1px solid #F3F4F6',
      opacity: locked ? 0.85 : 1,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: coverHeight,
        background: bgMap[quiz.level] || bgMap.basic,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <CandlestickPattern seed={seed} height={coverHeight} />
        <div style={{
          fontSize: compact ? 16 : 19, fontWeight: 800, color: '#fff',
          textAlign: 'center', padding: '0 16px', marginBottom: 8,
          fontFamily: 'Noto Sans Lao, sans-serif',
          position: 'relative', zIndex: 1,
        }}>
          {quiz.title}
        </div>
        <div style={{
          width: 36, height: 1.5,
          background: 'rgba(255,255,255,.4)', marginBottom: 8,
          position: 'relative', zIndex: 1,
        }} />
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,.7)', fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase',
          position: 'relative', zIndex: 1,
        }}>
          {quiz.icon} {quiz.level} · {quiz.totalQuestions} ຂໍ້
        </div>
      </div>

      <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'center' }}>
        {locked ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 100,
            border: '1.5px solid #E5E7EB',
            fontSize: 14, fontWeight: 600,
            background: '#F9FAFB', color: '#9CA3AF',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            🔒 Login ເພື່ອເຂົ້າ
          </div>
        ) : (
          <Link href={`/quiz/${slug}`} style={{ textDecoration: 'none' }}>
            <div className="animate-quiz-next" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '13px 28px', borderRadius: 100,
              background: '#2563EB', color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Noto Sans Lao, sans-serif',
              transformOrigin: 'center',
            }}>
              Start Quiz
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                ▶
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
