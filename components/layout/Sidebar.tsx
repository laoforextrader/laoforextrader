import { Broker, Article } from "@/types"
import Link from "next/link"

interface Props { brokers?: Broker[]; trending?: Article[] }

const MARKET = [
  { pair:"XAUUSD", price:"2,318.4", pct:"+0.34%", up:true  },
  { pair:"EURUSD", price:"1.0812",  pct:"-0.12%", up:false },
  { pair:"USDJPY", price:"154.62",  pct:"+0.21%", up:true  },
  { pair:"BTCUSD", price:"64,820",  pct:"+1.45%", up:true  },
  { pair:"USDLAK", price:"21,450",  pct:"-0.05%", up:false },
]

function logoStyle(name: string) {
  if (name.toLowerCase().includes("xm"))     return { bg:"#FEF2F2", color:"#DC2626" }
  if (name.toLowerCase().includes("exness")) return { bg:"#EEF3FF", color:"#2563EB" }
  if (name.toLowerCase().includes("ic"))     return { bg:"#DCFCE7", color:"#059669" }
  return { bg:"#F3F4F6", color:"#6B7280" }
}

export function Sidebar({ brokers = [], trending = [] }: Props) {
  return (
    <aside className="bg-white border-l border-gray-100 text-sm">

      {/* Market Prices */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">ລາຄາຕະຫຼາດ</div>
        {MARKET.map(m => (
          <div key={m.pair} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="font-mono text-[12px] font-medium text-gray-800">{m.pair}</span>
            <span className="font-mono text-[12px] text-gray-600">{m.price}</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold
              ${m.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{m.pct}</span>
          </div>
        ))}
      </div>

      {/* Broker — no background, clean list */}
      {brokers.length > 0 && (
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">ລີວິວ Broker</div>
          <div className="text-[13px] font-bold text-gray-900 mb-3">Broker ແນະນຳ</div>

          {brokers.map((broker, i) => {
            const ls = logoStyle(broker.name)
            const badges = ["#FEF3C7 #D97706 #1", "#EEF3FF #2563EB #2", "#DCFCE7 #059669 EA"]
            const [bbg, bcolor, blabel] = (badges[i] || "").split(" ")
            return (
              <Link key={broker._id} href={`/broker/${broker.slug?.current ?? ""}`}
                className="flex items-center gap-2.5 py-2.5 border-b border-gray-50 last:border-0 group cursor-pointer">
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
                {bbg && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: bbg, color: bcolor }}>{blabel}</span>
                )}
              </Link>
            )
          })}

          <Link href="/broker" className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
            ເບິ່ງ Broker ທັງໝົດ →
          </Link>
          <p className="mt-2 text-[10px] text-gray-300 font-lao leading-relaxed border-t border-gray-100 pt-2">
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
