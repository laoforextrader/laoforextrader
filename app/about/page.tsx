import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ກ່ຽວກັບ | LaoForexTrader",
}

const STATS: [string, string][] = [
  ["2014", "ເລີ່ມ Trade"],
  ["50+",  "ບົດຮຽນຟຣີ"],
  ["12K+", "ສະມາຊິກ"],
  ["48",   "ລີວິວ Broker"],
]

export default function AboutPage() {
  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E6F0", padding: "48px 52px" }}>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>
            About
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            LaoForex
            <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Trader
            </span>
          </h1>

          <div style={{ width: 40, height: 2, background: "#111827", marginBottom: 28 }} />

          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, marginBottom: 16, fontFamily: "'Noto Sans Lao', sans-serif" }}>
            LaoForexTrader ແມ່ນແຫຼ່ງຂໍ້ມູນ Forex #1 ສຳລັບ Trader ລາວ ສ້າງຂຶ້ນໂດຍ Mee Muangsong
            ຜູ້ທີ່ມີປະສົບການ Forex ກວ່າ 10 ປີ ແລະ ເປັນຜູ້ກໍ່ຕັ້ງ Laos Forex Community.
          </p>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, marginBottom: 36, fontFamily: "'Noto Sans Lao', sans-serif" }}>
            ພວກເຮົາໃຫ້ຂໍ້ມູນທີ່ຊື່ສັດ ທົດສອບຈິງ ກ່ຽວກັບ Broker ພ້ອມດ້ວຍ 50+ ບົດຮຽນ Forex ຟຣີ
            ວິເຄາະຕະຫຼາດ ແລະ ຂ່າວ Forex ປະຈຳວັນ ສຳລັບ Trader ລາວ.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, paddingTop: 28, borderTop: "1px solid #F3F4F6" }}>
            {STATS.map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {n}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4, fontFamily: "'Noto Sans Lao', sans-serif" }}>
                  {l}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
