import { Broker, Article } from "@/types"
import Link from "next/link"

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
            return (
              <Link key={broker._id} href={`/broker/${broker.slug?.current ?? ""}`}
                className="flex items-center gap-2.5 py-2.5 border-b border-blue-100/60 last:border-0 group cursor-pointer">
                <span className="w-4 text-center font-mono text-[11px] font-bold text-gray-300">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border border-gray-100 flex-shrink-0"
                  style={{ background: ls.bg, color: ls.color }}>
                  {broker.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {broker.name}
                  </div>
                  <div className="text-[10px] text-amber-400" style={{ letterSpacing:"-1px" }}>
                    {"★".repeat(Math.floor(broker.rating ?? 4))}
                  </div>
                </div>
              </Link>
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
