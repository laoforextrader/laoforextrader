import type { Metadata } from "next"
import FounderSection from "@/components/sections/FounderSection"

export const metadata: Metadata = {
  title: "ຕິດຕໍ່ | LaoForexTrader",
}

const CONTACTS = [
  { label: "Facebook", value: "facebook.com/lassame",          href: "https://www.facebook.com/lassame" },
  { label: "Email",    value: "laoforextrader@gmail.com",       href: "mailto:laoforextrader@gmail.com" },
  { label: "Group",    value: "Facebook Group Laoforextrader",  href: "https://www.facebook.com/groups/Laoforextrader" },
]

export default function ContactPage() {
  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E6F0", padding: "48px 52px" }}>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>
            Contact
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            ຕິດຕໍ່{" "}
            <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ພວກເຮົາ
            </span>
          </h1>

          <div style={{ width: 40, height: 2, background: "#111827", marginBottom: 32 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CONTACTS.map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#F9FAFB", borderRadius: 12, border: "1px solid #F3F4F6" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF", width: 72, flexShrink: 0 }}>
                  {item.label}
                </div>
                <a href={item.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 14, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                  {item.value}
                </a>
              </div>
            ))}
          </div>

        </div>
      </div>

      <FounderSection />
    </div>
  )
}
