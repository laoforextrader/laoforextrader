import { sanityClient, QUERIES } from '@/lib/sanity'
import type { Metadata } from 'next'
import QuizCard, { type QuizCardData } from '@/components/quiz/QuizCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Forex Quiz Challenge',
  description: 'ທົດສອບຄວາມຮູ້ Forex ຂອງທ່ານ 3 ລະດັບ 90 ຂໍ້',
}

export default async function QuizListPage() {
  const quizzes = await sanityClient.fetch<QuizCardData[]>(
    QUERIES.allQuizzes, {}, { next: { revalidate: 3600 } }
  )

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(37,99,235,.1)', border: '0.5px solid rgba(37,99,235,.3)',
          borderRadius: 100, padding: '4px 14px', fontSize: 11,
          color: '#2563EB', fontWeight: 600, marginBottom: 12,
        }}>
          🎯 ທົດສອບຄວາມຮູ້
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
          Forex Quiz Challenge
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Noto Sans Lao, sans-serif' }}>
          3 ລະດັບ · 6 Quizzes · 90 ຂໍ້ · ເກັບຄະແນນ
        </p>
      </div>

      <div className="quiz-grid">
        {quizzes?.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} />
        ))}
      </div>

      <style>{`
        .quiz-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .quiz-grid { grid-template-columns: 1fr 1fr; gap: 18px; }
        }
      `}</style>
    </main>
  )
}
