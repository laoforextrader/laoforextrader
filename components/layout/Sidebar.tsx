import { Broker, Article } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { urlFor } from "@/lib/sanity"

interface Props { brokers?: Broker[]; trending?: Article[] }

function logoStyle(name: string) {
  if (name.toLowerCase().includes("xm"))     return { bg:"#FEF2F2", color:"#DC2626" }
  if (name.toLowerCase().includes("exness")) return { bg:"#EEF3FF", color:"#2563EB" }
  if (name.toLowerCase().includes("ic"))     return { bg:"#DCFCE7", color:"#059669" }
  return { bg:"#F3F4F6", color:"#6B7280" }
}

export function Sidebar({ brokers = [], trending = [] }: Props) {
  return (
    <aside className="bg-white border-l border-gray-100 text-sm">

      {/* Broker — subtle blue card */}
      {brokers.length > 0 && (
        <div className="m-3" style={{ background: "#F0F4FF", border: "1px solid #DBEAFE", borderRadius: 12, padding: 16 }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">ລີວິວ Broker</div>
          <div className="text-[13px] font-bold text-gray-900 mb-3">Broker ແນະນຳ</div>

          {brokers.slice(0, 5).map((broker, i) => {
            const ls = logoStyle(broker.name)
            const slug = broker.slug?.current ?? ""
            const rankNum = broker.rank ?? i + 1
            return (
              <div key={broker._id} className="py-2.5 border-b border-blue-100/60 last:border-0">
                <Link href={`/broker/${slug}`} className="flex items-center gap-2.5 group">
                  <span style={{ color: "#2563EB", fontWeight: 700, fontSize: 12, marginRight: 4, flexShrink: 0 }}>
                    {rankNum}
                  </span>
                  {broker.logo?.asset?.url ? (
                    <Image
                      src={urlFor(broker.logo).width(64).height(64).url()}
                      alt={broker.logo.alt || broker.name}
                      width={32}
                      height={32}
                      style={{
                        borderRadius: 8,
                        objectFit: "contain",
                        background: "#fff",
                        border: "1px solid #E2E6F0",
                        padding: 3,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border border-gray-100 flex-shrink-0"
                      style={{ background: ls.bg, color: ls.color }}>
                      {broker.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                        {broker.name}
                      </div>
                      {broker.badge?.show && broker.badge?.text && (() => {
                        const colorMap: Record<string, { bg: string; color: string; border: string }> = {
                          gold:   { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A" },
                          blue:   { bg: "#EEF3FF", color: "#2563EB", border: "#BFCFFF" },
                          green:  { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
                          purple: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
                          gray:   { bg: "#F9FAFB", color: "#374151", border: "#E2E6F0" },
                          orange: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
                          red:    { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
                        }
                        const c = colorMap[broker.badge!.color] || colorMap.gray
                        return (
                          <span style={{
                            display: "inline-block",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 100,
                            border: `1px solid ${c.border}`,
                            background: c.bg,
                            color: c.color,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}>
                            {broker.badge!.text}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="text-[10px] text-amber-400" style={{ letterSpacing: "-1px" }}>
                      {"★".repeat(Math.floor(broker.rating ?? 4))}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}

          <Link href="/broker" className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
            ເບິ່ງ Broker ທັງໝົດ →
          </Link>
          <p className="mt-2 text-[10px] text-gray-400 font-lao leading-relaxed border-t border-blue-100/60 pt-2">
            ⚠ ລີວິວຈາກການໃຊ້ງານຂອງພວກເຮົາເທົ່ານັ້ນ
          </p>
        </div>
      )}

      {/* Newsletter */}
      <div className="m-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="font-lao text-[12px] font-bold text-blue-700 mb-1">📬 ຮັບຂ່າວໃໝ່ທຸກວັນ</div>
        <p className="font-lao text-[11px] text-gray-500 mb-2.5 leading-relaxed">
          ວິເຄາະຕະຫຼາດ + ໂປຣ Broker ກ່ອນໃຜ
        </p>
        <input type="email" placeholder="ອີເມວຂອງທ່ານ..."
          className="w-full bg-white border border-gray-200 text-gray-800 text-[12px] px-2.5 py-2 rounded-lg mb-1.5 outline-none focus:border-blue-400" />
        <button className="w-full font-lao text-[12px] font-bold text-white py-2 rounded-lg"
          style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)" }}>
          ສະໝັກຮັບຂ່າວ
        </button>
      </div>

    </aside>
  )
}
