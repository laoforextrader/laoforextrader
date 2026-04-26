import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 80, fontWeight: 800, color: "#D4D8E5", letterSpacing: "-0.05em" }}>404</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>ບໍ່ພົບໜ້ານີ້</h1>
      <p style={{ color: "#6B7280", fontSize: 14 }}>ໜ້າທີ່ທ່ານຊອກຫາ ບໍ່ມີ ຫຼື ຖືກລຶບໄປແລ້ວ</p>
      <Link href="/" className="btn-primary" style={{ marginTop: 8 }}>← ກັບໜ້າຫຼັກ</Link>
    </div>
  )
}
