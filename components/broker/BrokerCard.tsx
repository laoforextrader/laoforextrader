"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Broker } from "@/types"
import { event } from "@/lib/gtag"
import { trackClick, brokerTarget } from "@/lib/trackClick"

interface Props {
  broker: Broker
  variant?: "default" | "sidebar"
  rank?: number
}

function LogoStyle(name: string) {
  if (name.toLowerCase().includes("xm"))     return { bg:"var(--danger-soft)", color:"var(--danger)" }
  if (name.toLowerCase().includes("exness")) return { bg:"var(--accent-soft)", color:"var(--accent)" }
  if (name.toLowerCase().includes("ic"))     return { bg:"var(--success-soft)", color:"var(--success)" }
  return { bg:"var(--surface-3)", color:"var(--fg-3)" }
}

export function BrokerCard({ broker, variant = "default", rank }: Props) {
  const router = useRouter()
  const logo   = LogoStyle(broker.name)
  const slug   = broker.slug?.current ?? ""

  if (variant === "sidebar") {
    return (
      <Link href={`/broker/${slug}`}
        className="flex items-center gap-2.5 py-2.5 border-b border-line-2 last:border-0 cursor-pointer"
        style={{ textDecoration:"none" }}>
        {rank && <span style={{ width:16, textAlign:"center", fontFamily:"monospace", fontSize:11, fontWeight:700, color:"var(--fg-4)" }}>{rank}</span>}
        <div style={{ width:30, height:30, borderRadius:8, background:logo.bg, color:logo.color, border:"1px solid var(--line-2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace", fontSize:10, fontWeight:700, flexShrink:0 }}>
          {broker.name.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--fg)" }}>{broker.name}</div>
          <div style={{ fontSize:10, color:"#F59E0B", letterSpacing:-1 }}>{"★".repeat(Math.floor(broker.rating ?? 4))}</div>
        </div>
      </Link>
    )
  }

  return (
    <div
      onClick={() => router.push(`/broker/${slug}`)}
      style={{ display:"block", background:"var(--surface)", border:"1.5px solid var(--line)", borderRadius:16, padding:20, cursor:"pointer", transition:"all .25s" }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor="#93C5FD"; (e.currentTarget as HTMLElement).style.transform="translateY(-4px)"; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--line)"; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
      <div style={{ width:42, height:42, borderRadius:10, background:logo.bg, color:logo.color, border:"1px solid var(--line-2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace", fontSize:13, fontWeight:700, marginBottom:12 }}>
        {broker.name.slice(0,2).toUpperCase()}
      </div>
      <div style={{ fontSize:15, fontWeight:700, color:"var(--fg)", marginBottom:3 }}>{broker.name}</div>
      <div style={{ fontSize:12, color:"#F59E0B", letterSpacing:-1, marginBottom:8 }}>
        {"★".repeat(Math.floor(broker.rating ?? 4))}{"☆".repeat(5 - Math.floor(broker.rating ?? 4))}
      </div>
      <div style={{ borderTop:"1px solid var(--line-2)", paddingTop:12, display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
          <span style={{ color:"var(--fg-3)" }}>ຝາກຂັ້ນຕ່ຳ</span>
          <span style={{ fontFamily:"monospace", fontWeight:500, color:"var(--fg)" }}>${broker.minDeposit ?? "5"}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
          <span style={{ color:"var(--fg-3)" }}>Leverage</span>
          <span style={{ fontFamily:"monospace", fontWeight:500, color:"var(--fg)" }}>{broker.maxLeverage ?? "1:500"}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
          <span style={{ color:"var(--fg-3)" }}>ຝາກ BCEL</span>
          <span style={{ fontFamily:"monospace", fontWeight:500, color: broker.laoDeposit ? "var(--success)" : "var(--fg-4)" }}>
            {broker.laoDeposit ? "✓ ຮອງຮັບ" : "— ບໍ່ຮອງຮັບ"}
          </span>
        </div>
      </div>
      {(broker.registerUrl || broker.affiliateUrl) && (
        <div style={{ display:"flex", gap:8, marginTop:12 }} onClick={e => e.stopPropagation()}>
          {broker.registerUrl && (
            <a href={broker.registerUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => {
                      event({ action: "broker_click", category: "Broker", label: broker.name })
                      trackClick({ target: brokerTarget(broker.slug?.current ?? broker.name), label: broker.name, group: "broker" })
                    }}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"7px 0", background:"linear-gradient(135deg,#2563EB,#4F46E5)", color:"#fff", fontSize:11, fontWeight:700, borderRadius:8, textDecoration:"none" }}>
              ສະໝັກເປີດບັນຊີ →
            </a>
          )}
          {broker.affiliateUrl && (
            <a href={broker.affiliateUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => {
                      event({ action: "broker_website_click", category: "Broker", label: broker.name })
                      trackClick({ target: `${brokerTarget(broker.slug?.current ?? broker.name)}-web`, label: `${broker.name} (ເວັບໄຊທ໌)`, group: "broker" })
                    }}
              style={{ padding:"7px 10px", background:"var(--surface-3)", color:"var(--fg-2)", fontSize:11, fontWeight:600, borderRadius:8, textDecoration:"none", border:"1px solid var(--line-2)" }}>
              ເວັບໄຊທ໌
            </a>
          )}
        </div>
      )}
    </div>
  )
}
