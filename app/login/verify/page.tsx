import type { Metadata } from "next"
import VerifyRunner from "@/components/account/VerifyRunner"

export const metadata: Metadata = {
  title: "ຢືນຢັນອີເມວ",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t = "" } = await searchParams
  return (
    <div style={{ background: "var(--bg)", minHeight: "60vh" }}>
      <VerifyRunner token={t} />
    </div>
  )
}
