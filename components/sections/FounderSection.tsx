import Image from "next/image"

export function FounderSection() {
  const stats = [
    { value: "2014", label: "เริ่ม Trade" },
    { value: "+500%", label: "Best Year Return" },
    { value: "12K+", label: "ສະມາຊິກ" },
    { value: "10+", label: "ປີ ປະສົບການ" },
  ]

  return (
    <section style={{ background: "#EDEEF2", borderTop: "1px solid #E5E7EB" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 56, alignItems: "center" }}>

          {/* Left — photo */}
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", background: "#E5E7EB", aspectRatio: "4/5", position: "relative" }}>
              <Image
                src="/images/founder.png"
                alt="Mee Muangsong"
                fill
                style={{ objectFit: "cover", filter: "grayscale(100%) contrast(1.05)" }}
                onError={() => {}}
              />
              {/* Overlay gradient bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(transparent, rgba(0,0,0,0.4))", pointerEvents: "none" }} />
            </div>
            {/* Accent border */}
            <div style={{ position: "absolute", inset: -6, borderRadius: 26, border: "2px solid transparent", background: "linear-gradient(135deg,#2563EB22,#4F46E522) border-box", pointerEvents: "none", zIndex: -1 }} />
          </div>

          {/* Right — content */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6B7280", marginBottom: 12, textTransform: "uppercase" }}>
              — Founder &amp; Lead Trader
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 18 }}>
              Mee<br />
              <span style={{ background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Muangsong
              </span>
            </h2>

            <blockquote style={{ borderLeft: "3px solid #BFCFFF", paddingLeft: 16, marginBottom: 28, fontSize: 14, color: "#374151", lineHeight: 1.75, fontStyle: "italic" }}>
              "ຂ້ອຍເລີ່ມ Trade Forex ໂດຍບໍ່ມີໃຜສອນ ສູນເສຍຫຼາຍກວ່າຈະສຳເລັດ. LaoForexTrader ຖືກສ້າງຂຶ້ນ ເພື່ອໃຫ້ Trader ລາວທຸກຄົນ ມີຄວາມຮູ້ທີ່ຖືກຕ້ອງ ກ່ອນທີ່ຈະລົງທຶນ."
            </blockquote>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {stats.map(s => (
                <div key={s.value} style={{ textAlign: "center", background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 12, padding: "14px 10px" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", letterSpacing: "-0.02em", background: "linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
