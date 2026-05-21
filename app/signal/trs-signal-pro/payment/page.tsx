import type { Metadata } from "next"
import PaymentClient from "./PaymentClient"

export const metadata: Metadata = {
  title: "ຊຳລະເງິນ · TheRocket Signal Pro",
  description: "ໂອນຜ່ານ BCEL OnePay ຫຼື USDT TRC20 ເພື່ອສະໝັກ TRS Signal Pro",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.laoforextrader.com/signal/trs-signal-pro/payment" },
}

interface Props {
  searchParams: Promise<{ plan?: string }>
}

export default async function PaymentPage({ searchParams }: Props) {
  const params = await searchParams
  const initialPlan = (params.plan || "").toLowerCase()
  return <PaymentClient initialPlan={initialPlan} />
}
