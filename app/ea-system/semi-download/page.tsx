import type { Metadata } from "next"
import EADownloadPage, { ACCENTS, type DownloadFile } from "@/components/ea/EADownloadPage"

export const revalidate = 300

export const metadata: Metadata = {
  title: "ດາວໂຫຼດ TheRocket MagiSemi",
  description:
    "ດາວໂຫຼດ TheRocket MagiSemi — EA ເຄິ່ງອັດຕະໂນມັດ ສັ່ງເປີດ-ປິດເອງຈາກປຸ່ມເທິງຊາດ ຈາກມືຖື ຫຼື ຈາກ Dashboard ເທິງເວັບ.",
  alternates: { canonical: "https://www.laoforextrader.com/ea-system/semi-download" },
}

// ── everything worth editing lives here ───────────────────────────────────
// Semi is the one build with real manuals (EN + LO), so its row list is longer
// than the other two. They are published from the EA repo in the same step as
// the .ex5 (Tools/mk_publish.py), which is why the installer can hand a
// customer the manual that matches the build they just installed.
const DIST = "/ea/dist/semi/1.00"

const FILES: DownloadFile[] = [
  {
    label: "TheRocketMagiSemi.ex5",
    note: "ໄຟລ໌ EA ສຳລັບ MetaTrader 5 · 282 KB",
    href: `${DIST}/TheRocketMagiSemi.ex5`,
    ready: true,
  },
  {
    label: "Manual-LO.pdf",
    note: "ຄູ່ມືການໃຊ້ງານ ພາສາລາວ · 9 ໜ້າ",
    href: `${DIST}/Manual-LO.pdf`,
    ready: true,
  },
  {
    label: "Manual-EN.pdf",
    note: "User manual in English · 8 pages",
    href: `${DIST}/Manual-EN.pdf`,
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

export default function SemiDownloadPage() {
  return (
    <EADownloadPage
      eaId="semi"
      installId="semi"
      badge="🎮 TheRocket MagiSemi"
      headline="ດາວໂຫຼດ EA ເຄິ່ງອັດຕະໂນມັດ"
      blurb="ທ່ານເປັນຄົນເລືອກວ່າຈະເປີດເທື່ອໃດ ແລະ ຂ້າງໃດ ແລ້ວ EA ດູແລບັນໄດຕໍ່ໃຫ້ຈົນປິດ. ສັ່ງໄດ້ຈາກປຸ່ມເທິງຊາດ ຈາກແອັບ MT5 ເທິງມືຖື ຫຼື ຈາກ Dashboard ເທິງເວັບ."
      files={FILES}
      accent={ACCENTS.purple}
    />
  )
}
