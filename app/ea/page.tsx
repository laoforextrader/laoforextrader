import { sanityClient, QUERIES } from "@/lib/sanity"
import EAStatsCard from "@/components/ea/EAStatsCard"
import { EAStats } from "@/types"
import type { Metadata } from "next"

export const revalidate = 60

export const metadata: Metadata = {
  title: "EA ຂອງເຮົາ — Live Stats",
  description: "ສະຖິຕິສົດຂອງ EA ທຸກຕົວທີ່ LaoForexTrader ໃຊ້",
}

export default async function EAIndexPage() {
  let eas: EAStats[] = []
  try {
    eas = await sanityClient.fetch<EAStats[]>(QUERIES.allActiveEAs, {}, { next: { revalidate: 60 } })
  } catch (e) {
    console.error("eaStats list fetch error:", e)
  }

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div className="max-w-[860px] mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">🟢 LIVE EA STATS</div>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight mb-2" style={{ letterSpacing: "-0.02em" }}>
            EA ຂອງເຮົາ
          </h1>
          <p className="font-lao text-[13px] text-gray-500">
            ສະຖິຕິສົດທີ່ສົ່ງມາຈາກ MT5 ໂດຍກົງ — ບໍ່ມີການແຕ້ມເພີ່ມ
          </p>
        </div>

        {eas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="text-[40px] mb-3">🤖</div>
            <div className="font-lao text-[14px] text-gray-500">ຍັງບໍ່ມີ EA ໃດເປີດການອັບເດດ</div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {eas.map(ea => (
              <EAStatsCard key={ea._id} eaId={ea.eaId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
