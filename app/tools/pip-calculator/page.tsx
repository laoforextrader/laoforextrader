import type { Metadata } from "next"
import PipCalculator from "./PipCalculator"

export const metadata: Metadata = {
  title: "Pip Calculator — ຄຳນວນ Pip Value ແລະ ກຳໄລ Forex",
  description: "ເຄື່ອງມືຄຳນວນ Pip Value ແລະ ກຳໄລ/ຂາດທຶນສຳລັບການເທຣດ Forex ຂອງຄຳ EURUSD, GBPUSD, USDJPY, XAUUSD ແລະ ຄູ່ອື່ນໆ.",
  alternates: { canonical: "https://www.laoforextrader.com/tools/pip-calculator" },
  openGraph: {
    title: "Pip Calculator | LaoForexTrader",
    description: "ຄຳນວນ Pip Value ແລະ ກຳໄລ Forex ຟຣີ.",
    url: "https://www.laoforextrader.com/tools/pip-calculator",
    type: "website",
  },
}

export default function Page() {
  return <PipCalculator />
}
