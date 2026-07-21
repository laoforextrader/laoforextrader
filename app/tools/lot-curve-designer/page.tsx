import type { Metadata } from "next"
import LotCurveDesigner from "./LotCurveDesigner"
import CTASelector from "@/components/cta/CTASelector"

export const metadata: Metadata = {
  title: "Lot Curve Designer — ອອກແບບສູດເພີ່ມ Lot ຂອງ Grid/Martingale EA",
  description:
    "ເຄື່ອງມືອອກແບບ ແລະ ປຽບທຽບສູດການເພີ່ມ Lot ຕໍ່ Level ຂອງ Grid / Martingale EA — ເບິ່ງ Lot ລວມ, ຂາດທຶນສະສົມ ແລະ ຄວາມສ່ຽງກ່ອນນຳໄປໃຊ້ຈິງ.",
  alternates: { canonical: "https://www.laoforextrader.com/tools/lot-curve-designer" },
  openGraph: {
    title: "Lot Curve Designer | LaoForexTrader",
    description: "ອອກແບບສູດເພີ່ມ Lot ຕໍ່ Level ຂອງ Grid/Martingale EA ຟຣີ.",
    url: "https://www.laoforextrader.com/tools/lot-curve-designer",
    type: "website",
  },
}

export default function Page() {
  return (
    <>
      <LotCurveDesigner />
      <div style={{ background: "#EDEEF2", padding: "0 24px 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <CTASelector type="ea-sgride" />
          <CTASelector type="broker-interstellar" />
        </div>
      </div>
    </>
  )
}
