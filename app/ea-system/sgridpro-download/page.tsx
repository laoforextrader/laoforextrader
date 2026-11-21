import type { Metadata } from "next"
import EADownloadPage, { ACCENTS, type DownloadFile } from "@/components/ea/EADownloadPage"

export const revalidate = 300

export const metadata: Metadata = {
  title: "ດາວໂຫຼດ TheRocket SGrid Pro",
  description:
    "ດາວໂຫຼດ TheRocket SGrid Pro — ເຄື່ອງຈັກດຽວກັນກັບ SGrid ແຕ່ເປີດໃຫ້ປັບໄດ້ຄົບ 71 ຄ່າ ສຳລັບຜູ້ທີ່ Backtest ແລະ ຈູນເອງ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/sgridpro-download" },
}

// ── everything worth editing lives here ───────────────────────────────────
// Same layout as the SGrid page. This is the build that used to be called
// TheRocketEASgride_V.0.9_REL and was handed out from /ea-system/sgrid-download
// until 2026-11-15, when the names were straightened out:
//
//   SGrid      3 settings, factory 50k config, 10-day trial on a real account
//   SGrid Pro  all 71 settings, no trial — the account must be licensed
//
// Stats on this page come from the same live account as SGrid: it is the same
// engine, and the account runs the standard configuration.
const DIST = "/ea/dist/sgridpro/1.00"

const FILES: DownloadFile[] = [
  {
    label: "TheRocketSGridPro.ex5",
    note: "ໄຟລ໌ EA ສຳລັບ MetaTrader 5 · 145 KB",
    href: `${DIST}/TheRocketSGridPro.ex5`,
    ready: true,
  },
  {
    label: "INSTALL.txt",
    note: "ວິທີຕິດຕັ້ງ ແລະ ເງື່ອນໄຂລິຂະສິດ (ພາສາອັງກິດ)",
    href: `${DIST}/INSTALL.txt`,
    ready: true,
  },
]
// ──────────────────────────────────────────────────────────────────────────

export default function SGridProDownloadPage() {
  return (
    <EADownloadPage
      eaId="sgride"
      installId="sgridpro"
      badge="TheRocket SGrid Pro"
      headline="ດາວໂຫຼດ EA ຮຸ່ນປັບເອງ"
      blurb="ເຄື່ອງຈັກດຽວກັນກັບ SGrid ແຕ່ເປີດໃຫ້ປັບໄດ້ຄົບ 71 ຄ່າ — Grid, ບັນໄດ lot, ຊົ່ວໂມງເທຣດ, ຕົວກັ່ນຕອງ Velocity / Stochastic / Trend ແລະ Recovery. ເໝາະກັບຜູ້ທີ່ Backtest ເອງ. ຖ້າຢາກໃຫ້ມັນເຮັດວຽກເອງເລີຍ ໃຫ້ໃຊ້ SGrid."
      files={FILES}
      accent={ACCENTS.purple}
    />
  )
}
