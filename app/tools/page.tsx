import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "ເຄື່ອງມື Forex ຟຣີ" }

const TOOLS = [
  { name: "Pip Calculator",  desc: "ຄຳນວນ Pip Value ແລະ ກຳໄລ/ຂາດທຶນ", href: "/tools/pip-calculator", icon: "📐" },
  { name: "Lot Calculator",  desc: "ຄຳນວນ Lot Size ທີ່ເໝາະສົມ",         href: "/tools/lot-calculator", icon: "⚖️" },
  { name: "Risk Calculator", desc: "ຄຳນວນ Risk % ຕໍ່ Trade",           href: "/tools/risk-calculator", icon: "🛡️" },
]

export default function ToolsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-lao font-bold text-2xl mb-2">ເຄື່ອງມື<span className="text-gold">ຟຣີ</span></h1>
      <p className="font-lao text-white/40 text-sm mb-8">ຄຳນວນ Pip, Lot, Risk — ສ້າງໂດຍ LFT Team</p>
      <div className="grid gap-4">
        {TOOLS.map(t => (
          <Link key={t.href} href={t.href}
            className="card p-5 flex items-center gap-5 hover:border-white/10 transition-colors group">
            <span className="text-3xl">{t.icon}</span>
            <div>
              <h2 className="font-semibold text-sm text-white group-hover:text-gold transition-colors mb-1">{t.name}</h2>
              <p className="font-lao text-[11px] text-white/35">{t.desc}</p>
            </div>
            <span className="ml-auto text-white/15 group-hover:text-white/40 text-lg transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
