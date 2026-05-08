import type { Metadata } from "next"
import RiskReward from "./RiskReward"

export const metadata: Metadata = {
  title: "Risk / Reward Calculator — ຄຳນວນ RR Ratio ກ່ອນເທຣດ",
  description: "ຄຳນວນ Risk:Reward Ratio ຈາກລາຄາ Entry, Stop Loss, Take Profit ກ່ອນເປີດ Order — ຮັບປະກັນວ່າການເທຣດແມ່ນຄຸ້ມຄ່າ.",
  alternates: { canonical: "https://www.laoforextrader.com/tools/risk-reward" },
  openGraph: {
    title: "Risk / Reward Calculator | LaoForexTrader",
    description: "ຄຳນວນ RR Ratio ກ່ອນເທຣດຟຣີ.",
    url: "https://www.laoforextrader.com/tools/risk-reward",
    type: "website",
  },
}

export default function Page() {
  return <RiskReward />
}
