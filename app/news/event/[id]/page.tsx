import Link from "next/link"
import { notFound } from "next/navigation"
import { sanityClient, QUERIES } from "@/lib/sanity"
import { Countdown } from "@/components/news/Countdown"
import { formatDateDDMMYYYY } from "@/lib/news/sources-shared"
import type { Metadata } from "next"

export const revalidate = 60

interface Props { params: Promise<{ id: string }> }

interface EventDoc {
  _id: string
  date: string
  event: {
    id: string
    nameLao: string
    nameEn?: string
    currency?: string
    country?: string
    time: string
    timeISO?: string
    impact?: string
    forecast?: string
    previous?: string
    description?: string
    analysis?: string
    tradingGuidance?: string
  } | null
  technical?: Array<{ symbol: string; trend: string; bias: string }>
}

const CURRENCY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺", CAD: "🇨🇦",
  CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
}

async function fetchDoc(id: string): Promise<EventDoc | null> {
  return sanityClient.fetch<EventDoc | null>(
    QUERIES.dailyUpdateByEventId(id),
    { id },
    { next: { revalidate: 60 } },
  ).catch(() => null)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const doc = await fetchDoc(decoded)
  const ev = doc?.event
  const title = ev?.nameLao ? `${ev.nameLao} | LaoForexTrader` : "ເຫດການເສດຖະກິດ | LaoForexTrader"
  const description = ev?.description?.slice(0, 160)
    ?? ev?.analysis?.slice(0, 160)
    ?? `ການວິເຄາະເຫດການເສດຖະກິດ ${ev?.country ?? ""} ${ev?.nameEn ?? ""} ສຳລັບເທຣດເດີລາວ`.trim()
  const canonical = `https://www.laoforextrader.com/news/event/${encodeURIComponent(decoded)}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article" },
  }
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const doc = await fetchDoc(decoded)
  if (!doc || !doc.event) notFound()
  const e = doc.event

  return (
    <div style={{ background: "#EDEEF2", minHeight: "100vh" }}>
      <div className="max-w-[760px] mx-auto px-6 py-8">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-blue-600 mb-5">
          ← ກັບໄປ ໜ້າຂ່າວ
        </Link>

        <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1" style={{ background: "linear-gradient(90deg,#EF4444,#F97316,#EAB308)" }} />

          <div className="p-7 md:p-9">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-200">
                🔴 High Impact
              </span>
              {e.currency && (
                <span className="text-[12px] font-mono font-semibold text-gray-600">
                  {CURRENCY_FLAG[e.currency] ?? "🌐"} {e.currency}
                </span>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-[12px] text-gray-500">{formatDateDDMMYYYY(doc.date)} · {e.time}</span>
            </div>

            <h1 className="font-sans font-extrabold text-[28px] md:text-[32px] tracking-tight text-gray-900 leading-tight mb-2">
              {e.nameLao}
            </h1>
            {e.nameEn && (
              <div className="font-mono text-[12px] text-gray-400 mb-4">{e.nameEn}</div>
            )}

            {/* Stats + countdown row */}
            <div className="rounded-xl p-4 mb-6" style={{ background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)", border: "1px solid #FECACA" }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <Stat label="ເວລາ GMT+7" value={e.time} mono />
                <Stat label="Forecast" value={e.forecast || "—"} mono />
                <Stat label="Previous" value={e.previous || "—"} mono />
              </div>
              {e.timeISO && (
                <div className="flex justify-end">
                  <Countdown target={e.timeISO} />
                </div>
              )}
            </div>

            {/* Description */}
            {e.description && (
              <Block title="📌 ເຫດການນີ້ຄືຫຍັງ">
                <p className="font-lao text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {e.description}
                </p>
              </Block>
            )}

            {/* Analysis */}
            {e.analysis && (
              <Block title="🔍 ການວິເຄາະ">
                <p className="font-lao text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {e.analysis}
                </p>
              </Block>
            )}

            {/* Trading guidance */}
            {e.tradingGuidance && (
              <div className="rounded-xl p-5 mb-2" style={{ background: "linear-gradient(135deg,#EEF3FF,#F5F3FF)", border: "1px solid #DDE3F2" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-1.5">
                  💡 ແນວທາງການເທຣດ
                </div>
                <p className="font-lao text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {e.tradingGuidance}
                </p>
              </div>
            )}

            {/* Risk disclaimer */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 font-lao leading-relaxed">
                ⚠ ການວິເຄາະນີ້ສ້າງດ້ວຍ AI ຈາກຂໍ້ມູນ Economic Calendar — ບໍ່ແມ່ນຄຳແນະນຳການລົງທຶນ. ການເທຣດມີຄວາມສ່ຽງ ຄວນ Manage Risk ໃຫ້ດີ.
              </p>
            </div>
          </div>
        </article>

        {/* Quick links */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <Link href="/news" className="text-[12px] font-bold uppercase tracking-widest text-blue-600 hover:underline">
            ← ໜ້າຂ່າວ
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/broker" className="text-[12px] font-bold uppercase tracking-widest text-blue-600 hover:underline">
            ເລືອກ Broker →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">{label}</div>
      <div className={`text-[15px] font-bold text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
        {title}
      </div>
      {children}
    </div>
  )
}
