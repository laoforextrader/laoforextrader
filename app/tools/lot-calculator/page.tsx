import type { Metadata } from "next"
import LotCalculator from "./LotCalculator"

export const metadata: Metadata = {
  title: "Lot Size Calculator — ຄຳນວນ Lot Size ຕາມ Risk Management",
  description: "ເຄື່ອງມືຄຳນວນ Lot Size ຕາມຫຼັກ Risk Management ສຳລັບເທຣດ Forex — ຮັບປະກັນບໍ່ສ່ຽງເກີນຂອບເຂດທີ່ກຳນົດໄວ້.",
  alternates: { canonical: "https://www.laoforextrader.com/tools/lot-calculator" },
  openGraph: {
    title: "Lot Size Calculator | LaoForexTrader",
    description: "ຄຳນວນ Lot Size ຕາມ Risk Management ຟຣີ.",
    url: "https://www.laoforextrader.com/tools/lot-calculator",
    type: "website",
  },
}

export default function Page() {
  return <LotCalculator />
}
