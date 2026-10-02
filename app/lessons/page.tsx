import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sanityClient } from "@/lib/sanity"
import { Article } from "@/types"
import { Clock, ChevronRight, BookOpen, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "ບົດຮຽນ Forex ພື້ນຖານ — ຮຽນຟຣີ 50 ບົດ",
  description: "ຮຽນ Forex ຕັ້ງແຕ່ສູນ ຈົນ Pro ດ້ວຍ 50 ບົດຮຽນ ພາສາລາວ",
}

export const revalidate = 60

const SECTIONS = [
  { label: "ພາກທີ 1: ພື້ນຖານ Forex",      from: 1,  to: 10, color: "var(--accent)",  bg: "var(--accent-soft)",  border: "var(--accent-line)" },
  { label: "ພາກທີ 2: Technical Analysis", from: 11, to: 25, color: "var(--violet)",  bg: "var(--violet-soft)",  border: "var(--violet-line)" },
  { label: "ພາກທີ 3: Risk Management",    from: 26, to: 35, color: "var(--success)",  bg: "var(--success-soft)",  border: "var(--success-line)" },
  { label: "ພາກທີ 4: Strategy",           from: 36, to: 50, color: "var(--warn)",  bg: "var(--warn-soft)",  border: "var(--warn-line)" },
]

export default async function LessonsPage() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  const lessons = await sanityClient.fetch<Article[]>(`
    *[_type == "article" && category == "education"] | order(publishedAt asc) {
      _id, title, slug, readTime
    }
  `, {}, { next: { revalidate: 60 } })

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 100, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 16 }}>
            <BookOpen size={11} /> ຄັງຄວາມຮູ້
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--fg)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            ບົດຮຽນ <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forex ພື້ນຖານ</span>
          </h1>
          <p style={{ color: "var(--fg-2)", fontSize: 14, lineHeight: 1.7, maxWidth: 500, marginBottom: 16 }}>
            ຮຽນ Forex ຈາກສູນ ຈົນ Pro ດ້ວຍ 50 ບົດຮຽນ ພາສາລາວ ລຳດັບຊັດ ຕໍ່ເນື່ອງ
          </p>

          {isLoggedIn ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--success-soft)", border: "1px solid var(--success-line)", borderRadius: 8, padding: "8px 14px", color: "var(--success)", fontSize: 13, fontWeight: 600 }}>
              ✓ ທ່ານ Login ແລ້ວ — ເຂົ້າຮຽນໄດ້ທຸກ 50 ບົດ
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, color: "var(--fg-2)", fontSize: 13 }}>
              <Lock size={14} style={{ color: "var(--warn)", flexShrink: 0 }} />
              <span>ບົດ 1-10 ຟຣີ · ບົດ 11-50 ຕ້ອງ <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>ເຂົ້າສູ່ລະບົບ</Link> (ຟຣີ ໃຊ້ Google)</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line-2)" }}>
            {[["50","ບົດຮຽນ"],["4","ໝວດ"],["ຟຣີ","100%"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const sectionLessons = lessons.filter((_, i) => {
            const n = i + 1
            return n >= section.from && n <= section.to
          })
          return (
            <div key={section.label} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: section.bg, border: `1px solid ${section.border}`, marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: section.color }}>{section.label}</span>
                <span style={{ fontSize: 10, color: "var(--fg-3)", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{section.to - section.from + 1} ບົດ</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sectionLessons.map((lesson, idx) => {
                  const n = section.from + idx
                  const isLocked = n > 10 && !isLoggedIn
                  return (
                    <Link key={lesson._id}
                      href={isLocked ? "/login" : `/lessons/${lesson.slug?.current ?? ""}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 10,
                        border: `1px solid ${isLocked ? "var(--line-2)" : "var(--line)"}`,
                        background: isLocked ? "var(--surface-2)" : "var(--surface)",
                        textDecoration: "none", opacity: isLocked ? 0.6 : 1,
                        transition: "all 0.2s",
                      }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isLocked ? "var(--surface-3)" : section.bg,
                        border: `1px solid ${isLocked ? "var(--line-2)" : section.border}`,
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600,
                        color: isLocked ? "var(--fg-4)" : section.color,
                      }}>
                        {isLocked ? <Lock size={10} /> : n}
                      </div>
                      <p style={{ flex: 1, fontSize: 13, color: isLocked ? "var(--fg-4)" : "var(--fg)", fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
                        {lesson.title}
                      </p>
                      {!isLocked && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--fg-4)", flexShrink: 0 }}>
                          <Clock size={10} />
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{lesson.readTime ?? 5}m</span>
                          <ChevronRight size={12} />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {!isLoggedIn && (
          <div style={{ padding: 24, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 16, textAlign: "center", marginTop: 8 }}>
            <p style={{ fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>Unlock ທຸກ 50 ບົດ ຟຣີ</p>
            <p style={{ color: "var(--fg-2)", fontSize: 13, marginBottom: 16 }}>ສະໝັກດ້ວຍ Google — ໃຊ້ເວລາ 10 ວິນາທີ</p>
            <Link href="/login" className="btn-primary">ເຂົ້າສູ່ລະບົບດ້ວຍ Google →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
