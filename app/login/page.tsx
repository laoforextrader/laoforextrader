import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginButton } from "@/components/auth/LoginButton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ເຂົ້າສູ່ລະບົບ",
  description: "ເຂົ້າສູ່ລະບົບ LaoForexTrader ເພື່ອບັນທຶກບົດຄວາມ ແລະ ຮັບການອັບເດດການເທຣດປະຈຳວັນ.",
  alternates: { canonical: "https://www.laoforextrader.com/login" },
  robots: { index: false, follow: true },
}

// Where to land after Google comes back. /semi sends people here with
// ?callbackUrl=/semi and they must return to the control panel, not to the
// site dashboard — an own-site path only, so the parameter cannot be used to
// bounce someone off to another host.
function safeNext(raw: string | undefined): string {
  if (!raw) return "/dashboard"
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/dashboard"
  return raw
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const next = safeNext(callbackUrl)
  const session = await getServerSession(authOptions)
  if (session) redirect(next)

  return (
    <div style={{ background: "var(--bg)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#2563EB,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
          LFT
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 6, letterSpacing: "-0.02em" }}>ເຂົ້າສູ່ລະບົບ</h1>
        <p style={{ fontSize: 13, color: "var(--fg)", marginBottom: 28, fontFamily: "'Noto Sans Lao', sans-serif" }}>
          ຮັບການອັບເດດຂໍ້ມູນຂ່າວສານການເທຣດທຸກວັນ
        </p>
        <LoginButton callbackUrl={next} />
        <p style={{ fontSize: 11, color: "var(--fg)", marginTop: 20, fontFamily: "'Noto Sans Lao', sans-serif", lineHeight: 1.6 }}>
          ການ Login ຖືວ່າທ່ານຍອມຮັບ<br />ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວຂອງເຮົາ
        </p>
      </div>
    </div>
  )
}
