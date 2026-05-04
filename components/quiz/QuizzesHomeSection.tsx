import Link from 'next/link'
import { sanityClient, QUERIES } from '@/lib/sanity'
import QuizCard, { type QuizCardData } from './QuizCard'

export default async function QuizzesHomeSection() {
  const quizzes = await sanityClient.fetch<QuizCardData[]>(
    QUERIES.allQuizzes, {}, { next: { revalidate: 3600 } }
  )
  if (!quizzes?.length) return null

  const items = quizzes.slice(0, 4)

  return (
    <section className="bg-white border-t border-gray-200 border-b border-gray-200">
      <div className="max-w-[1060px] mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">
              ທົດສອບຄວາມຮູ້
            </div>
            <h2 className="font-sans font-extrabold text-[22px] tracking-tight text-gray-900">
              Forex Quiz Challenge
            </h2>
            <p className="font-lao text-[13px] text-gray-500 mt-1">
              3 ລະດັບ · 90 ຂໍ້ · ເກັບຄະແນນ
            </p>
          </div>
          <Link href="/quiz"
            className="font-lao text-[12px] font-semibold text-blue-600 hover:text-blue-700">
            ເບິ່ງທັງໝົດ →
          </Link>
        </div>

        <div className="quiz-home-grid">
          {items.map(quiz => (
            <QuizCard key={quiz._id} quiz={quiz} compact />
          ))}
        </div>
      </div>

      <style>{`
        .quiz-home-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .quiz-home-grid { grid-template-columns: 1fr 1fr; gap: 18px; }
        }
      `}</style>
    </section>
  )
}
