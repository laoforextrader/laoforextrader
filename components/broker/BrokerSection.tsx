"use client"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { Broker } from "@/types"

interface Props { brokers: Broker[] }

const BROKER_META: Record<string, { tag: string; tagClass: string; highlight?: boolean }> = {
  "xm-global": { tag: "#1 ທາງເລືອກ Trader ລາວ", tagClass: "bg-amber-50 text-amber-600", highlight: true },
  "exness":    { tag: "ຖອນ Instant 24/7",        tagClass: "bg-blue-50 text-blue-600" },
  "ic-markets":{ tag: "ດີທີ່ສຸດ ສຳລັບ EA",       tagClass: "bg-green-50 text-green-600" },
}

function getLogoStyle(name: string) {
  if (name.toLowerCase().includes("xm"))     return { bg: "#FEF2F2", color: "#DC2626" }
  if (name.toLowerCase().includes("exness")) return { bg: "#EEF3FF", color: "#2563EB" }
  if (name.toLowerCase().includes("ic"))     return { bg: "#DCFCE7", color: "#059669" }
  return { bg: "#F3F4F6", color: "#6B7280" }
}

export function BrokerSection({ brokers }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        gridRef.current?.querySelectorAll(".bk-card").forEach((el, i) => {
          setTimeout(() => el.classList.add("in"), i * 110)
        })
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    if (gridRef.current) obs.observe(gridRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="border-t border-gray-200" style={{ background: "#EDEEF2" }}>
      <style>{`
        .bk-card { opacity:0; transform:translateY(16px) scale(.97); transition:opacity .3s, transform .3s, border-color .2s, box-shadow .3s; }
        .bk-card.in { opacity:1; transform:translateY(0) scale(1); }
        .bk-card:hover { border-color:#93C5FD!important; box-shadow:0 6px 24px rgba(37,99,235,.09); transform:translateY(-4px)!important; }
      `}</style>
      <div className="max-w-[1060px] mx-auto px-6 py-12">
        <div className="section-eyebrow">ລີວິວ Broker ທີ່ໄວ້ໃຈໄດ້</div>
        <h2 className="section-title">Broker <span>ແນະນຳ</span> 2025</h2>
        <p className="section-sub">ທົດສອບຈິງ · ຝາກ-ຖອນ BCEL · ທຽບ Spread · Support ພາສາລາວ</p>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {brokers.map((broker, i) => {
            const meta = BROKER_META[broker.slug?.current ?? ""] ?? { tag: "", tagClass: "bg-gray-100 text-gray-500" }
            const logo = getLogoStyle(broker.name)
            const isFirst = i === 0

            return (
              <div key={broker._id}
                className={`bk-card bg-white rounded-2xl p-5 cursor-pointer relative overflow-hidden
                  ${isFirst ? "border-[1.5px] border-blue-200" : "border-[1.5px] border-gray-200"}`}>

                {isFirst && (
                  <div className="absolute top-0 right-3.5 text-[9px] font-extrabold tracking-wide text-amber-800 px-2.5 py-1 rounded-b-lg" style={{ background: "linear-gradient(135deg,#F59E0B,#FCD34D)" }}>
                    👑 #1 ແນະນຳ
                  </div>
                )}

                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold mb-3 border border-gray-100"
                  style={{ background: logo.bg, color: logo.color }}>
                  {broker.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="text-[15px] font-bold text-gray-900 mb-0.5">{broker.name}</div>
                <div className="text-xs tracking-tight text-amber-400 mb-2" style={{ letterSpacing: "-1px" }}>
                  {"★".repeat(Math.floor(broker.rating ?? 4))}{"☆".repeat(5 - Math.floor(broker.rating ?? 4))}
                </div>

                {meta.tag && (
                  <span className={`inline-block text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full mb-3 ${meta.tagClass}`}>
                    {meta.tag}
                  </span>
                )}

                <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-lao text-gray-400">ຝາກຂັ້ນຕ່ຳ</span>
                    <span className="font-mono font-medium text-gray-800">${broker.minDeposit ?? "5"}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="font-lao text-gray-400">Leverage</span>
                    <span className="font-mono font-medium text-gray-800">{broker.maxLeverage ?? "1:1000"}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="font-lao text-gray-400">ຝາກ BCEL</span>
                    <span className={`font-mono font-medium ${broker.laoDeposit ? "text-green-600" : "text-gray-400"}`}>
                      {broker.laoDeposit ? "✓ ຮອງຮັບ" : "— Crypto"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3.5">
                  {broker.registerUrl ? (
                    <a href={broker.registerUrl} target="_blank" rel="noopener noreferrer"
                      className="btn-primary flex-1 text-[12px] py-2 text-center">
                      ເປີດບັນຊີ →
                    </a>
                  ) : (
                    <Link href={`/broker/${broker.slug?.current ?? ""}`}
                      className="btn-primary flex-1 text-[12px] py-2 text-center">
                      ເບິ່ງລີວິວ →
                    </Link>
                  )}
                  {broker.homepageUrl && (
                    <a href={broker.homepageUrl} target="_blank" rel="noopener noreferrer"
                      className="btn-outline text-[12px] py-2 px-3">
                      ເວັບໄຊທ໌
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mb-3">
          <Link href="/broker" className="btn-ghost text-[12px]">ເບິ່ງ Broker ທັງໝົດ →</Link>
        </div>
        <div className="text-center text-[12px] text-gray-400 font-lao flex items-center justify-center gap-1.5">
          <span>⚠</span> ລີວິວຈາກການໃຊ້ງານຂອງພວກເຮົາເທົ່ານັ້ນ · ການລົງທຶນມີຄວາມສ່ຽງ
        </div>
      </div>
    </section>
  )
}
