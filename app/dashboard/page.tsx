import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Bookmark, Clock, MessageSquare, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const user = session.user

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>

        {/* Profile */}
        <div style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {user?.image
            ? <Image src={user.image} alt={user.name ?? ""} width={52} height={52} style={{ borderRadius: "50%", border: "2px solid #BFCFFF" }} />
            : <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#EEF3FF", border: "2px solid #BFCFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#2563EB", fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
          }
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{user?.name}</h1>
            <p style={{ fontSize: 12, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{user?.email}</p>
            <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px", background: "#EEF3FF", border: "1px solid #BFCFFF", color: "#2563EB", borderRadius: 4, letterSpacing: "0.06em" }}>
              FREE MEMBER
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { icon: Bookmark, label: "Bookmarks", value: "0" },
            { icon: Clock,    label: "ອ່ານລ່າສຸດ", value: "0" },
            { icon: MessageSquare, label: "ຄຳເຫັນ", value: "0" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <Icon size={16} color="#9CA3AF" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "10px 18px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>ຄຸນສົມບັດ</span>
          </div>
          {[
            { label: "ບົດຮຽນ Forex 50 ບົດ",   desc: "ຮຽນຕໍ່ຈາກທີ່ຄ້າງ",     href: "/lessons" },
            { label: "ລີວິວ Broker",          desc: "ເບິ່ງ Broker ທັງໝົດ",    href: "/broker" },
            { label: "Pip Calculator",        desc: "ຄຳນວນ Pip ແລະ Lot",      href: "/tools/pip-calculator" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #F9FAFB", textDecoration: "none" }}>
              <div>
                <p style={{ fontSize: 14, color: "#111827", fontWeight: 500, marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF" }}>{item.desc}</p>
              </div>
              <ChevronRight size={14} color="#D1D5DB" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: "#EEF3FF", border: "1px solid #BFCFFF", borderRadius: 16, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#111827", fontWeight: 600, marginBottom: 6 }}>
            ຍິນດີຕ້ອນຮັບ, <span style={{ color: "#2563EB" }}>{user?.name?.split(" ")[0]}</span>!
          </p>
          <p style={{ fontSize: 13, color: "#374151", marginBottom: 16 }}>ຮຽນ 50 ບົດ ຟຣີ ກັບ LaoForexTrader</p>
          <Link href="/lessons" className="btn-primary" style={{ display: "inline-flex" }}>ເລີ່ມຮຽນ Forex →</Link>
        </div>
      </div>
    </div>
  )
}
