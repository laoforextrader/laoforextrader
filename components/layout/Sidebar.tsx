import { Broker, Article } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { urlFor } from "@/lib/sanity"

interface Props { brokers?: Broker[]; trending?: Article[] }

function logoStyle(name: string) {
  if (name.toLowerCase().includes("xm"))     return { bg:"var(--danger-soft)", color:"var(--danger)" }
  if (name.toLowerCase().includes("exness")) return { bg:"var(--accent-soft)", color:"var(--accent)" }
  if (name.toLowerCase().includes("ic"))     return { bg:"var(--success-soft)", color:"var(--success)" }
  return { bg:"var(--surface-3)", color:"var(--fg-3)" }
}

export function Sidebar({ brokers = [], trending = [] }: Props) {
  return (
    <aside className="bg-surface border-l border-line-2 text-sm">

      {/* Broker — subtle blue card */}
      {brokers.length > 0 && (
        <div className="m-3" style={{ background: "var(--surface-2)", border: "1px solid var(--accent-line)", borderRadius: 12, padding: 16 }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-fg-4 mb-0.5">ລີວິວ Broker</div>
          <div className="text-[13px] font-bold text-fg mb-3">Broker ແນະນຳ</div>

          {brokers.slice(0, 5).map((broker, i) => {
            const ls = logoStyle(broker.name)
            const slug = broker.slug?.current ?? ""
            const rankNum = broker.rank ?? i + 1
            return (
              <div key={broker._id} className="py-2.5 border-b border-blue-100/60 last:border-0">
                <Link href={`/broker/${slug}`} className="flex items-center gap-2.5 group">
                  <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 12, marginRight: 4, flexShrink: 0 }}>
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
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        padding: 3,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border border-line-2 flex-shrink-0"
                      style={{ background: ls.bg, color: ls.color }}>
                      {broker.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-semibold text-fg group-hover:text-accent transition-colors truncate">
                        {broker.name}
                      </div>
                      {broker.badge?.show && broker.badge?.text && (() => {
                        const colorMap: Record<string, { bg: string; color: string; border: string }> = {
                          gold:   { bg: "var(--warn-soft)", color: "var(--warn)", border: "var(--warn-line)" },
                          blue:   { bg: "var(--accent-soft)", color: "var(--accent)", border: "var(--accent-line)" },
                          green:  { bg: "var(--success-soft)", color: "var(--success)", border: "var(--success-line)" },
                          purple: { bg: "var(--violet-soft)", color: "var(--violet)", border: "var(--violet-line)" },
                          gray:   { bg: "var(--surface-2)", color: "var(--fg-2)", border: "var(--line)" },
                          orange: { bg: "var(--warn-soft)", color: "#EA580C", border: "var(--warn-line)" },
                          red:    { bg: "var(--danger-soft)", color: "var(--danger)", border: "var(--danger-line)" },
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

          <Link href="/broker" className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-accent hover:text-accent-strong">
            ເບິ່ງ Broker ທັງໝົດ →
          </Link>
          <p className="mt-2 text-[10px] text-fg-4 font-lao leading-relaxed border-t border-blue-100/60 pt-2">
            ⚠ ລີວິວຈາກການໃຊ້ງານຂອງພວກເຮົາເທົ່ານັ້ນ
          </p>
        </div>
      )}

      {/* Newsletter */}
      <div className="m-3 p-3.5 bg-accent-soft border border-accent-soft2 rounded-xl">
        <div className="font-lao text-[12px] font-bold text-accent-strong mb-1">📬 ຮັບຂ່າວໃໝ່ທຸກວັນ</div>
        <p className="font-lao text-[11px] text-fg-3 mb-2.5 leading-relaxed">
          ວິເຄາະຕະຫຼາດ + ໂປຣ Broker ກ່ອນໃຜ
        </p>
        <input type="email" placeholder="ອີເມວຂອງທ່ານ..."
          className="w-full bg-surface border border-line-2 text-fg text-[12px] px-2.5 py-2 rounded-lg mb-1.5 outline-none focus:border-blue-400" />
        <button className="w-full font-lao text-[12px] font-bold text-white py-2 rounded-lg"
          style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)" }}>
          ສະໝັກຮັບຂ່າວ
        </button>
      </div>

    </aside>
  )
}
