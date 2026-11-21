import type { Metadata } from "next"
import TermsBody from "@/components/legal/TermsBody"

export const metadata: Metadata = {
  title: "ເງື່ອນໄຂການໃຊ້ງານ",
  description: "ເງື່ອນໄຂການເປັນສະມາຊິກ ແລະ ການໃຊ້ EA ຂອງ LaoForexTrader — ອີເມວ, ຄວາມສ່ຽງ, ລິຂະສິດ ແລະ ຂໍ້ມູນສ່ວນຕົວ",
}

//  The page itself is the metadata; the prose is a client component because
//  it exists in three languages and the reader's choice lives in a cookie,
//  not in the URL. Indexed in Lao, which is the decision recorded in
//  lib/i18n/lang.ts.
export default function TermsPage() {
  return <TermsBody />
}
