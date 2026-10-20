import type { Metadata } from "next"
import EADownloadPage, { ACCENTS, type DownloadFile } from "@/components/ea/EADownloadPage"

export const revalidate = 300

export const metadata: Metadata = {
  title: "ດາວໂຫຼດ TheRocket EA MegiHedge v2.0",
  description:
    "ດາວໂຫຼດ TheRocket EA MegiHedge v2.0 — Hedging EA ທີ່ Trade ຈາກບັນຊີຈິງ. ເບິ່ງຜົນລາຍເດືອນ ແລະ ເງື່ອນໄຂການຮັບ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/megihedge-download" },
}

// ── everything worth editing lives here ───────────────────────────────────
// The layout itself is components/ea/EADownloadPage.tsx, shared with SGrid so
// the two pages cannot drift apart.

// Drive rather than public/, for the same reason as SGrid: a binary in the
// repo would ship to every build, and Drive lets the file be swapped without
// a deploy.
const DRIVE_URL = "https://drive.google.com/file/d/1N-62PesIDcdJmoDIL1dTPVI7AmGBcABw/view?usp=drive_link"

const FILES: DownloadFile[] = [
  {
    label: "TheRocketEAMegiHedge_V2.0.ex5",
    note: "ໄຟລ໌ EA ສຳລັບ MetaTrader 5 · Google Drive",
    href: DRIVE_URL,
    ready: true,
  },
]
// ──────────────────────────────────────────────────────────────────────────

export default function MegiHedgeDownloadPage() {
  return (
    <EADownloadPage
      eaId="megihedge"
      badge="⚡ TheRocket EA MegiHedge v2.0"
      headline="ດາວໂຫຼດ EA"
      blurb="Hedging EA ທີ່ພວກເຮົາຮັນຢູ່ໃນບັນຊີຈິງ ບໍ່ແມ່ນ Backtest. ດຽວນີ້ພວກເຮົາເປີດໃຫ້ທຸກຄົນເອົາໄປທົດສອບ ແລະ ໃຊ້ຈິງແລ້ວ ຕາມເງື່ອນໄຂຂ້າງລຸ່ມ."
      files={FILES}
      accent={ACCENTS.purple}
    />
  )
}
