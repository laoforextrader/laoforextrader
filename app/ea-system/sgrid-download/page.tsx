import type { Metadata } from "next"
import EADownloadPage, { ACCENTS, type DownloadFile } from "@/components/ea/EADownloadPage"

export const revalidate = 300

export const metadata: Metadata = {
  title: "ດາວໂຫຼດ TheRocket EA SGrid",
  description:
    "ດາວໂຫຼດ TheRocket EA SGrid — Grid EA ທີ່ Trade ຈິງມາ 12 ເດືອນ ບວກທຸກເດືອນ. ເບິ່ງຜົນຈາກບັນຊີຈິງ ແລະ ເງື່ອນໄຂການຮັບ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/sgrid-download" },
}

// ── everything worth editing lives here ───────────────────────────────────
// The layout itself is components/ea/EADownloadPage.tsx, shared with
// MegiHedge so the two pages cannot drift apart.

// The EA itself lives in a public Google Drive folder rather than in
// public/ — a 141 KB binary in the repo would ship to every Vercel build for
// no reason, and Drive lets the file be swapped without a deploy.
const DRIVE_URL = "https://drive.google.com/drive/folders/1jheipgGAAI6eIg9gOoD6DrsVSsH9mWeL"

// `ready: false` routes the row to LINE instead, which is what an item we
// cannot hand over automatically should do — never a dead link.
const FILES: DownloadFile[] = [
  {
    label: "TheRocketEASgride_V.0.9_REL.ex5",
    note: "ໄຟລ໌ EA ສຳລັບ MetaTrader 5 · 141 KB · Google Drive",
    href: DRIVE_URL,
    ready: true,
  },
]
// ──────────────────────────────────────────────────────────────────────────

export default function SGridDownloadPage() {
  return (
    <EADownloadPage
      eaId="sgride"
      badge="🚀 TheRocket EA SGrid"
      headline="ດາວໂຫຼດ EA"
      blurb="Grid EA ທີ່ພວກເຮົາຮັນຢູ່ໃນບັນຊີຈິງ ບໍ່ແມ່ນ Backtest. ດຽວນີ້ພວກເຮົາເປີດໃຫ້ທຸກຄົນເອົາໄປທົດສອບ ແລະ ໃຊ້ຈິງແລ້ວ ຕາມເງື່ອນໄຂຂ້າງລຸ່ມ."
      files={FILES}
      accent={ACCENTS.blue}
    />
  )
}
