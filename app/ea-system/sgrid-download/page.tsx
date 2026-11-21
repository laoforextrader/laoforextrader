import type { Metadata } from "next"
import EADownloadPage, { ACCENTS, type DownloadFile } from "@/components/ea/EADownloadPage"

export const revalidate = 300

export const metadata: Metadata = {
  title: "ດາວໂຫຼດ TheRocket SGrid",
  description:
    "ດາວໂຫຼດ TheRocket SGrid — Grid EA ທີ່ Trade ຈິງມາ 12 ເດືອນ ບວກທຸກເດືອນ. ຕິດຕັ້ງດ້ວຍຄຳສັ່ງດຽວ ຫຼື ດາວໂຫຼດໄຟລ໌ເອງ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/sgrid-download" },
}

// ── everything worth editing lives here ───────────────────────────────────
// The layout itself is components/ea/EADownloadPage.tsx, shared with
// MegiHedge so the two pages cannot drift apart.
//
// 2026-11-15, two changes worth knowing about:
//
// 1. The files moved off Google Drive into public/ea/dist/, published from the
//    EA repo by Tools/mk_publish.py together with the SHA-256 the installer
//    verifies. Drive could not be checked by the installer, could not serve a
//    version-pinned URL, and was a second place to forget to update. A build is
//    ~130 KB, so keeping it in the repo costs a deploy nothing worth counting.
//
// 2. The name was corrected. This page used to hand out
//    TheRocketEASgride_V.0.9_REL — the build with all 71 settings exposed,
//    which is now called SGrid Pro and has its own page. "SGrid" is the
//    3-setting build that used to be called MagiHedge REL10.
const DIST = "/ea/dist/sgrid/1.10"

// `ready: false` routes the row to LINE instead, which is what an item we
// cannot hand over automatically should do — never a dead link.
const FILES: DownloadFile[] = [
  {
    label: "TheRocketSGrid.ex5",
    note: "ໄຟລ໌ EA ສຳລັບ MetaTrader 5 · 126 KB",
    href: `${DIST}/TheRocketSGrid.ex5`,
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

export default function SGridDownloadPage() {
  return (
    <EADownloadPage
      eaId="sgride"
      installId="sgrid"
      badge="TheRocket SGrid"
      headline="ດາວໂຫຼດ EA"
      blurb="Grid EA ທີ່ພວກເຮົາຮັນຢູ່ໃນບັນຊີຈິງ ບໍ່ແມ່ນ Backtest. ຮຸ່ນນີ້ຕັ້ງຄ່າພຽງ 3 ຢ່າງ ສ່ວນທີ່ເຫຼືອລ໋ອກໄວ້ຕາມຄ່າທີ່ທົດສອບມາແລ້ວ. ຜູ້ທີ່ຢາກປັບເອງທຸກຄ່າໃຫ້ໃຊ້ SGrid Pro."
      files={FILES}
      accent={ACCENTS.blue}
    />
  )
}
