"use client"
import Link from "next/link"
import { Calculator, TrendingUp, BarChart2, LineChart } from "lucide-react"

const TOOLS = [
  {
    icon: Calculator,
    title: "Pip Calculator",
    desc: "ຄຳນວນ Pip Value ແລະ Profit/Loss",
    href: "/tools/pip-calculator",
    color: "var(--accent)", bg: "var(--accent-soft)", border: "var(--accent-line)",
  },
  {
    icon: TrendingUp,
    title: "Lot Size Calculator",
    desc: "ຄຳນວນ Lot Size ທີ່ເໝາະສົມກັບ Risk",
    href: "/tools/lot-calculator",
    color: "var(--success)", bg: "var(--success-soft)", border: "var(--success-line)",
  },
  {
    icon: BarChart2,
    title: "Risk/Reward Calculator",
    desc: "ຄຳນວນ Risk:Reward Ratio",
    href: "/tools/risk-reward",
    color: "#7C3AED", bg: "var(--violet-soft)", border: "var(--violet-line)",
  },
  {
    icon: LineChart,
    title: "Lot Curve Designer",
    desc: "ອອກແບບສູດເພີ່ມ Lot ຕໍ່ Level ຂອງ Grid/Martingale EA",
    href: "/tools/lot-curve-designer",
    color: "var(--warn)", bg: "var(--warn-soft)", border: "var(--warn-line)",
  },
]

export default function ToolsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
            ເຄື່ອງມື Forex
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--fg)", marginBottom: 6, letterSpacing: "-0.02em" }}>
            ເຄື່ອງມືຄຳນວນ
          </h1>
          <p style={{ fontSize: 14, color: "var(--fg)", fontFamily: "'Noto Sans Lao', sans-serif" }}>
            ເຄື່ອງມືຊ່ວຍ Trade ຟຣີ · ຄຳນວນໄດ້ທັນທີ
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TOOLS.map(tool => (
            <Link key={tool.href} href={tool.href}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", background: "var(--surface)", border: `1.5px solid ${tool.border}`, borderRadius: 14, textDecoration: "none", transition: "all 0.2s" }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)" }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: tool.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <tool.icon size={20} color={tool.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", marginBottom: 3 }}>{tool.title}</div>
                <div style={{ fontSize: 13, color: "var(--fg)", fontFamily: "'Noto Sans Lao', sans-serif" }}>{tool.desc}</div>
              </div>
              <div style={{ fontSize: 18, color: "var(--fg)" }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
