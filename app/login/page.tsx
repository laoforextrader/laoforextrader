import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginButton } from "@/components/auth/LoginButton"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#2563EB,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
          LFT
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>ເຂົ້າສູ່ລະບົບ</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 28, fontFamily: "'Noto Sans Lao', sans-serif" }}>
          ເຂົ້າຮຽນ 50 ບົດ · ຕິດຕາມ Broker · ຕั้ງການແຈ້ງເຕືອນ
        </p>
        <LoginButton />
        <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 20, fontFamily: "'Noto Sans Lao', sans-serif", lineHeight: 1.6 }}>
          ການ Login ຖືວ່າທ່ານຍອມຮັບ<br />ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວຂອງເຮົາ
        </p>
      </div>
    </div>
  )
}
