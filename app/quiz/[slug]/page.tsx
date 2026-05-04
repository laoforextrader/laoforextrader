'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

interface Question {
  _key: string
  question: string
  choices: { a: string; b: string; c: string }
  correctAnswer: 'a' | 'b' | 'c'
}

interface QuizData {
  _id: string
  title: string
  slug: string
  level: 'basic' | 'intermediate' | 'advanced'
  requiresLogin: boolean
  totalQuestions: number
  icon: string
  color?: string
  questions: Question[]
}

export default function QuizDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const { data: session } = useSession()
  const router = useRouter()

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/quiz/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setQuiz(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: '#6B7280', fontSize: 14 }}>ກຳລັງໂຫຼດ...</div>
    </div>
  )

  if (!quiz) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: '#6B7280', fontSize: 14, fontFamily: 'Noto Sans Lao, sans-serif' }}>
        ບໍ່ພົບ Quiz
      </div>
    </div>
  )

  if (quiz.requiresLogin && !session) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: '#111827',
          marginBottom: 8, fontFamily: 'Noto Sans Lao, sans-serif',
        }}>
          ຕ້ອງ Login ກ່ອນ
        </h2>
        <p style={{
          fontSize: 14, color: '#6B7280', marginBottom: 24,
          fontFamily: 'Noto Sans Lao, sans-serif',
        }}>
          {quiz.level === 'intermediate' ? 'Intermediate' : 'Advanced'} Quiz ຕ້ອງ Login ດ້ວຍ Facebook
        </p>
        <button
          onClick={() => signIn('facebook', { callbackUrl: window.location.pathname })}
          style={{
            background: '#2563EB', color: '#fff', border: 'none',
            padding: '12px 28px', borderRadius: 100,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}
        >
          Login ດ້ວຍ Facebook →
        </button>
      </div>
    )
  }

  const questions: Question[] = quiz.questions || []
  const q = questions[current]
  const progress = Math.round((current / questions.length) * 100)

  function handleSelect(key: 'a' | 'b' | 'c') {
    if (answered) return
    setSelected(key)
    setAnswered(true)
    if (key === q.correctAnswer) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }))
    }
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function handleRestart() {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore({ correct: 0, wrong: 0 })
    setFinished(false)
  }

  const pct = questions.length ? Math.round((score.correct / questions.length) * 100) : 0

  if (finished) {
    const message = pct >= 80 ? 'ດີຫຼາຍ! 🎉' : pct >= 60 ? 'ໃຊ້ໄດ້! 👍' : 'ພະຍາຍາມໃໝ່! 💪'

    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{
          background: '#fff', borderRadius: 18,
          boxShadow: '0 4px 20px rgba(0,0,0,.08)',
          border: '1px solid #F3F4F6', overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#0F172A,#1E3A8A)',
            padding: '32px 24px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4,
              fontFamily: 'Noto Sans Lao, sans-serif',
            }}>
              {message}
            </div>
            <div style={{
              fontSize: 14, color: 'rgba(255,255,255,.5)',
              fontFamily: 'Noto Sans Lao, sans-serif',
            }}>
              ທ່ານຕອບຖືກ {score.correct} ຈາກ {questions.length} ຂໍ້
            </div>
            <div style={{
              fontSize: 56, fontWeight: 900, color: '#2563EB',
              marginTop: 12, lineHeight: 1,
            }}>
              {pct}<span style={{ fontSize: 26, color: '#6B7280' }}>%</span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { val: score.correct, lbl: 'ຖືກ', color: '#10B981' },
                { val: score.wrong, lbl: 'ຜິດ', color: '#EF4444' },
                { val: `${pct}%`, lbl: 'ຄະແນນ', color: '#2563EB' },
              ].map(s => (
                <div key={s.lbl} style={{
                  background: '#F9FAFB', borderRadius: 10, padding: '14px 8px',
                  textAlign: 'center', border: '1px solid #F3F4F6',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{
                    fontSize: 11, color: '#9CA3AF', marginTop: 3,
                    fontFamily: 'Noto Sans Lao, sans-serif',
                  }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {!session && (
              <div style={{
                border: '1.5px solid #E5E7EB', borderRadius: 14,
                padding: '18px', marginBottom: 16, textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 5,
                  fontFamily: 'Noto Sans Lao, sans-serif',
                }}>
                  ບັນທຶກຄະແນນຂອງທ່ານ!
                </div>
                <div style={{
                  fontSize: 12, color: '#6B7280', marginBottom: 14,
                  fontFamily: 'Noto Sans Lao, sans-serif',
                }}>
                  Login ເພື່ອບັນທຶກຄະແນນ ແລະ ເຂົ້າ Quiz ລະດັບສູງ
                </div>
                <button
                  onClick={() => signIn('facebook', { callbackUrl: window.location.pathname })}
                  style={{
                    background: '#2563EB', color: '#fff', border: 'none',
                    padding: '10px 24px', borderRadius: 100,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Noto Sans Lao, sans-serif',
                  }}
                >
                  Login ດ້ວຍ Facebook →
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleRestart}
                style={{
                  flex: 1, background: '#fff', border: '1.5px solid #E5E7EB',
                  color: '#374151', padding: 12, borderRadius: 100,
                  fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Noto Sans Lao, sans-serif',
                }}
              >
                ທຳໃໝ່
              </button>
              <button
                onClick={() => router.push('/quiz')}
                style={{
                  flex: 1, background: '#2563EB', border: 'none',
                  color: '#fff', padding: 12, borderRadius: 100,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Noto Sans Lao, sans-serif',
                }}
              >
                Quiz ອື່ນ →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const choiceKeys: ('a' | 'b' | 'c')[] = ['a', 'b', 'c']

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{
        background: '#fff', borderRadius: 18,
        boxShadow: '0 4px 20px rgba(0,0,0,.08)',
        border: '1px solid #F3F4F6', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 20px 0' }}>
          <div
            onClick={() => router.push('/quiz')}
            style={{
              color: '#2563EB', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', marginBottom: 14, display: 'block',
            }}
          >
            ← Browse All Quizzes
          </div>
          <div style={{
            fontSize: 17, fontWeight: 800, color: '#111827',
            textAlign: 'center', marginBottom: 16,
            fontFamily: 'Noto Sans Lao, sans-serif',
          }}>
            {quiz.title}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: 16, borderBottom: '0.5px solid #F3F4F6',
          }}>
            <div>
              <div style={{
                fontSize: 10, color: '#9CA3AF', fontWeight: 600,
                letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5,
              }}>
                Question {current + 1} / {questions.length}
              </div>
              <div style={{
                background: '#F3F4F6', borderRadius: 100, height: 6,
                overflow: 'hidden', width: 120,
              }}>
                <div style={{
                  height: '100%', background: '#2563EB',
                  borderRadius: 100, width: `${progress}%`, transition: 'width .4s ease',
                }} />
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 10, color: '#9CA3AF', fontWeight: 600,
                letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: 5, textAlign: 'right',
              }}>
                Your Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {[
                  { val: score.correct, bg: '#10B981', sym: '✓' },
                  { val: score.wrong, bg: '#EF4444', sym: '✕' },
                ].map(s => (
                  <div key={s.sym} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 15, fontWeight: 700, color: '#111827',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: s.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 10, color: '#fff',
                    }}>
                      {s.sym}
                    </div>
                    {s.val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          fontSize: 18, fontWeight: 800, color: '#111827',
          padding: '18px 20px 4px', lineHeight: 1.45,
          fontFamily: 'Noto Sans Lao, sans-serif',
        }}>
          <span style={{ color: '#374151', fontWeight: 400, fontSize: 16 }}>Q: </span>
          {q.question}
        </div>

        <div style={{
          padding: '14px 20px 22px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {choiceKeys.map(key => {
            const isSelected = selected === key
            const isCorrect = answered && key === q.correctAnswer
            const isWrong = answered && isSelected && key !== q.correctAnswer
            const isOther = answered && !isSelected && key !== q.correctAnswer

            let bg = '#fff'
            let border = '1.5px solid #E5E7EB'
            let color = '#374151'
            if (isCorrect) { bg = '#111827'; border = '1.5px solid #111827'; color = '#fff' }
            else if (isWrong) { bg = '#F9FAFB'; border = '1.5px solid #E5E7EB'; color = '#C4C4C4' }
            else if (isOther) { bg = '#F9FAFB'; border = '1.5px solid #E5E7EB'; color = '#C4C4C4' }
            else if (isSelected) { bg = '#111827'; border = '1.5px solid #111827'; color = '#fff' }

            return (
              <div
                key={key}
                onClick={() => handleSelect(key)}
                style={{
                  padding: '15px 20px', borderRadius: 100,
                  border, background: bg, color,
                  textAlign: 'center', fontSize: 14,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all .15s',
                  fontFamily: 'Noto Sans Lao, sans-serif',
                }}
              >
                {q.choices[key]}{isCorrect ? ' ✓' : ''}
              </div>
            )
          })}
        </div>

        {answered && (
          <div style={{
            padding: '4px 20px 22px',
            display: 'flex', justifyContent: 'center',
          }}>
            <button
              onClick={handleNext}
              className="animate-quiz-next"
              style={{
                background: '#2563EB', color: '#fff', border: 'none',
                padding: '13px 32px', borderRadius: 100,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Noto Sans Lao, sans-serif',
                transformOrigin: 'center',
              }}
            >
              {current + 1 >= questions.length ? 'ເບິ່ງຜົນຮັບ →' : 'ຂໍ້ຕໍ່ໄປ →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
