"use client"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { ChevronRight, Clock } from "lucide-react"
import { Article } from "@/types"

interface Props { lessons: Article[] }

export function LessonsPreview({ lessons }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        gridRef.current?.querySelectorAll(".lesson-row").forEach((el, i) => {
          setTimeout(() => el.classList.add("in"), i * 55)
        })
        obs.disconnect()
      }
    }, { threshold: 0.2 })
    if (gridRef.current) obs.observe(gridRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .lesson-row { opacity:0; transform:translateX(-14px); transition:opacity .25s, transform .25s; }
        .lesson-row.in { opacity:1; transform:translateX(0); }
      `}</style>

      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="section-eyebrow">ບົດຮຽນ Forex ພື້ນຖານ</div>
          <h2 className="section-title">ຮຽນຟຣີ <span>50 ບົດ</span></h2>
          <p className="section-sub">ຕັ້ງແຕ່ສູນ ຈົນ Pro · ພາສາລາວ · ລຳດັບຊັດ</p>
        </div>
        <Link href="/lessons" className="hidden md:flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold">
          ທັງໝົດ <ChevronRight size={13} />
        </Link>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
        {lessons.map((lesson, i) => (
          <Link key={lesson._id} href={`/lessons/${lesson.slug.current}`}
            className="lesson-row flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-mono text-[10px] font-semibold text-blue-600 flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </div>
            <p className="font-lao text-[13px] font-medium text-gray-700 group-hover:text-gray-900 flex-1 leading-snug line-clamp-1 transition-colors">
              {lesson.title}
            </p>
            <div className="flex items-center gap-1 text-gray-300 flex-shrink-0">
              <Clock size={9} />
              <span className="font-mono text-[10px]">{lesson.readTime ?? 5}m</span>
              <ChevronRight size={12} className="group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/lessons" className="btn-outline inline-flex">ຮຽນຄົບ 50 ບົດ →</Link>
      </div>
    </>
  )
}
