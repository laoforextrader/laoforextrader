"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Wallet, AlertTriangle, FileText, MessageCircle,
  ArrowLeft, ArrowRight, Check,
} from "lucide-react"
import { CopyButton } from "@/components/signal/CopyButton"

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_TRS_ADMIN || "https://t.me/YourMoney_Admin"

const PLAN_AMOUNTS: Record<string, { lak: string; usdt: string; label: string }> = {
  "1m": { lak: "250,000",   usdt: "12",  label: "1 ເດືອນ" },
  "3m": { lak: "600,000",   usdt: "28",  label: "3 ເດືອນ" },
  "6m": { lak: "1,100,000", usdt: "51",  label: "6 ເດືອນ" },
  "1y": { lak: "2,000,000", usdt: "93",  label: "1 ປີ" },
}

export default function PaymentClient({ initialPlan }: { initialPlan: string }) {
  const [plan, setPlan] = useState(PLAN_AMOUNTS[initialPlan] ? initialPlan : "")
  const amounts = plan ? PLAN_AMOUNTS[plan] : null

  const onSelectPlan = (newPlan: string) => {
    setPlan(newPlan)
    // Keep URL in sync without triggering a Next.js re-render
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("plan", newPlan)
      window.history.replaceState({}, "", url.toString())
    }
  }

  return (
    <div style={{ background: "linear-gradient(180deg,#F8FAFF 0%,#EEF3FF 100%)", minHeight: "100vh" }}>
      <div className="max-w-[1060px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/signal/trs-signal-pro"
            className="inline-flex items-center gap-1.5 font-lao text-[12px] text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={14} />
            ກັບໄປຫນ້າ Signal
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="section-eyebrow">💳 ຊຳລະເງິນ</div>
          <h1 className="section-title">
            ໂອນ · <span>ສົ່ງ Slip</span> · ຮັບລິ້ງ Pro
          </h1>
          <p className="section-sub">
            ໂອນຜ່ານ BCEL OnePay ຫຼື USDT TRC20 → ສົ່ງ Slip/TX hash → ໄດ້ Pro Channel ໃນ 5-30 ນາທີ
          </p>
        </div>

        {/* Price table — selected plan highlighted */}
        <div
          className="mb-8 overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid #DBEAFE",
            borderRadius: 16,
            boxShadow: "0 4px 14px rgba(37,99,235,0.06)",
          }}
        >
          <div
            className="font-lao font-bold text-center py-3"
            style={{
              background: "linear-gradient(135deg,#2563EB,#4F46E5)",
              color: "#fff",
              fontSize: 14,
              letterSpacing: "0.02em",
            }}
          >
            💱 ເລືອກແພັກເກັດ
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4">
            <PriceBox plan="1m" period="1 ເດືອນ"  lak="250,000"   usdt="$12" onClick={onSelectPlan} selected={plan === "1m"} />
            <PriceBox plan="3m" period="3 ເດືອນ"  lak="600,000"   usdt="$28" save="ປະຢັດ 150k" onClick={onSelectPlan} selected={plan === "3m"} />
            <PriceBox plan="6m" period="6 ເດືອນ"  lak="1,100,000" usdt="$51" save="ປະຢັດ 400k" onClick={onSelectPlan} selected={plan === "6m"} />
            <PriceBox plan="1y" period="1 ປີ"      lak="2,000,000" usdt="$93" save="ປະຢັດ 1M" highlight onClick={onSelectPlan} selected={plan === "1y"} />
          </div>
          <div
            className="font-lao text-center py-2.5 text-[11px] text-gray-500"
            style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFF" }}
          >
            ⚠️ ອັດຕາ USD/LAK ປ່ຽນທຸກວັນ · ຢືນຢັນກັບ admin ກ່ອນໂອນ USDT
          </div>
        </div>

        {/* Payment methods grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* BCEL */}
          <div
            style={{
              background: "#fff",
              border: "2px solid #00A651",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(0,166,81,0.10)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 22 }}>🇱🇦</span>
              <h3 className="font-lao font-bold text-[18px]" style={{ color: "#00A651", margin: 0 }}>
                BCEL OnePay
              </h3>
            </div>
            <p className="font-lao text-[12.5px] text-gray-500 mb-4">
              ໂອນຈາກ BCEL One app — ໄວ ປອດໄພ ບໍ່ມີຄ່າທຳນຽມ
            </p>

            <div className="flex justify-center mb-3">
              <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid #E2E6F0" }}>
                <Image
                  src="/payment/bcel-qr.png"
                  alt="BCEL OnePay QR"
                  width={220}
                  height={220}
                  style={{ display: "block", borderRadius: 6 }}
                  priority
                />
              </div>
            </div>

            {/* Amount to transfer (dynamic from selected plan) */}
            {amounts ? (
              <div
                className="text-center mb-4"
                style={{
                  background: "linear-gradient(135deg,#00A651,#059669)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  boxShadow: "0 6px 16px rgba(0,166,81,0.25)",
                }}
              >
                <div className="font-lao" style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>
                  ໂອນຈຳນວນ · {amounts.label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {amounts.lak} <span className="font-lao" style={{ fontSize: 14, fontWeight: 600 }}>ກີບ</span>
                </div>
              </div>
            ) : (
              <div
                className="text-center mb-4 font-lao"
                style={{
                  background: "#FEF3C7",
                  border: "1px dashed #FBBF24",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                  color: "#92400E",
                }}
              >
                ↑ ກະລຸນາເລືອກແພັກເກັດດ້ານເທິງເພື່ອເຫັນຈຳນວນເງິນ
              </div>
            )}

            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <div className="font-lao text-[11px] text-gray-500 mb-1">ຊື່ບັນຊີ</div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-lao text-[14px] font-bold text-gray-900">LASSAME MUANGSONG MR</div>
                <CopyButton value="LASSAME MUANGSONG MR" />
              </div>
              <div className="font-lao text-[11px] text-gray-500 mb-1">ເລກບັນຊີ</div>
              <div className="flex items-center justify-between gap-2">
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#00A651",
                    letterSpacing: "0.02em",
                  }}
                >
                  045120001292543001
                </div>
                <CopyButton value="045120001292543001" />
              </div>
            </div>

            <div
              className="font-lao"
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 10,
                padding: 12,
                fontSize: 12.5,
                color: "#78350F",
                lineHeight: 1.7,
              }}
            >
              <div className="font-bold mb-1.5 flex items-center gap-1.5">
                <FileText size={13} /> ຂັ້ນຕອນ
              </div>
              <ol style={{ listStyle: "decimal", paddingLeft: 18, margin: 0 }}>
                <li>ສະແກນ QR ດ້ວຍ BCEL One ຫຼື ຄັດລອກເລກບັນຊີ</li>
                <li>ໃສ່ຈຳນວນຕາມແພັກເກັດ</li>
                <li>ກົດໂອນ → screenshot Slip</li>
                <li>ກົດປຸ່ມ "ໂອນແລ້ວ" ຂ້າງລຸ່ມ → ສົ່ງ Slip</li>
              </ol>
            </div>
          </div>

          {/* USDT */}
          <div
            style={{
              background: "#fff",
              border: "2px solid #26A17B",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(38,161,123,0.10)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={22} strokeWidth={2.2} style={{ color: "#26A17B" }} />
              <h3 className="font-lao font-bold text-[18px]" style={{ color: "#26A17B", margin: 0 }}>
                USDT · TRC20
              </h3>
              <span
                className="font-lao"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#FBBF24,#F59E0B)",
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: 100,
                  letterSpacing: "0.04em",
                }}
              >
                ⚡ AUTO-VERIFY
              </span>
            </div>
            <p className="font-lao text-[12.5px] text-gray-500 mb-4">
              ໂອນ Crypto ຈາກ Binance/OKX/wallet — ລະບົບກວດ TX ໃຫ້ອັດຕະໂນມັດ
            </p>

            <div className="flex justify-center mb-3">
              <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid #E2E6F0" }}>
                <Image
                  src="/payment/usdt-qr.png"
                  alt="USDT TRC20 QR"
                  width={220}
                  height={220}
                  style={{ display: "block", borderRadius: 6 }}
                />
              </div>
            </div>

            {/* Amount to transfer (dynamic from selected plan) */}
            {amounts ? (
              <div
                className="text-center mb-4"
                style={{
                  background: "linear-gradient(135deg,#26A17B,#10B981)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  boxShadow: "0 6px 16px rgba(38,161,123,0.25)",
                }}
              >
                <div className="font-lao" style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>
                  ໂອນຈຳນວນ · {amounts.label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  ${amounts.usdt} <span className="font-lao" style={{ fontSize: 14, fontWeight: 600 }}>USDT</span>
                </div>
              </div>
            ) : (
              <div
                className="text-center mb-4 font-lao"
                style={{
                  background: "#FEF3C7",
                  border: "1px dashed #FBBF24",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                  color: "#92400E",
                }}
              >
                ↑ ກະລຸນາເລືອກແພັກເກັດດ້ານເທິງເພື່ອເຫັນຈຳນວນເງິນ
              </div>
            )}

            <div
              style={{
                background: "#F0FDFA",
                border: "1px solid #99F6E4",
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <div className="font-lao text-[11px] text-gray-500 mb-1">ທີ່ຢູ່ (TRC20)</div>
              <div className="flex items-center justify-between gap-2">
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#26A17B",
                    wordBreak: "break-all",
                    lineHeight: 1.4,
                  }}
                >
                  TGuUi7bFX8YFnnHgQwVAgE4RoUnuxanNxF
                </div>
                <CopyButton value="TGuUi7bFX8YFnnHgQwVAgE4RoUnuxanNxF" />
              </div>
            </div>

            <div
              className="font-lao"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: 12,
                fontSize: 12.5,
                color: "#7F1D1D",
                lineHeight: 1.65,
                marginBottom: 12,
              }}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <AlertTriangle size={13} /> ສຳຄັນ — ໃຊ້ TRC20 ເທົ່ານັ້ນ
              </div>
              <div>
                ຫ້າມໃຊ້ <strong>ERC20 / BEP20</strong> — ເງິນຈະຫາຍ ກູ້ຄືນບໍ່ໄດ້
              </div>
            </div>

            <div
              className="font-lao"
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 10,
                padding: 12,
                fontSize: 12.5,
                color: "#78350F",
                lineHeight: 1.7,
              }}
            >
              <div className="font-bold mb-1.5 flex items-center gap-1.5">
                <FileText size={13} /> ຂັ້ນຕອນ
              </div>
              <ol style={{ listStyle: "decimal", paddingLeft: 18, margin: 0 }}>
                <li>ເປີດ Binance / OKX / wallet</li>
                <li>Send → USDT → Network <strong>TRC20</strong></li>
                <li>Paste ທີ່ຢູ່ + ໃສ່ຈຳນວນ → Confirm</li>
                <li>Copy <strong>TX Hash</strong> → ກົດປຸ່ມ "ໂອນແລ້ວ" → ວາງ TX Hash</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Main CTA — Submit slip */}
        <div
          className="mt-8 p-8 text-center"
          style={{
            background: "linear-gradient(135deg,#2563EB,#4F46E5)",
            borderRadius: 16,
            color: "#fff",
            boxShadow: "0 14px 40px rgba(37,99,235,0.30)",
          }}
        >
          <h2
            className="font-sans font-extrabold mb-2"
            style={{
              fontSize: 28,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg,#FCD34D,#FFFFFF,#A78BFA)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            ໂອນແລ້ວ?
          </h2>
          <p className="font-lao text-[13.5px] mb-5" style={{ color: "rgba(255,255,255,0.85)" }}>
            ກົດປຸ່ມລຸ່ມ → ສົ່ງ Slip / TX hash → ຮັບລິ້ງ Pro ໃນ 5-30 ນາທີ
          </p>
          <Link
            href={`/signal/trs-signal-pro/payment/submit${plan ? `?plan=${plan}` : ""}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#2563EB",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              fontFamily: "Noto Sans Lao, sans-serif",
              boxShadow: "0 8px 20px rgba(0,0,0,0.20)",
            }}
          >
            <Check size={17} strokeWidth={3} />
            ສົ່ງ Slip / TX Hash
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Telegram fallback */}
        <div className="mt-5 text-center">
          <p className="font-lao text-[12px] text-gray-500 mb-2">
            ມີຄຳຖາມ ຫຼື ບໍ່ສະບາຍໃຊ້ຟອມ?
          </p>
          <a
            href={ADMIN_CONTACT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-lao text-[12.5px] font-semibold transition-colors"
            style={{ color: "#0088cc", textDecoration: "none" }}
          >
            <MessageCircle size={14} />
            ທັກ admin ໃນ Telegram
          </a>
        </div>
      </div>
    </div>
  )
}

function PriceBox({
  plan, period, lak, usdt, save, highlight, selected, onClick,
}: {
  plan: string
  period: string
  lak: string
  usdt: string
  save?: string
  highlight?: boolean
  selected?: boolean
  onClick: (plan: string) => void
}) {
  const baseBg = highlight ? "linear-gradient(180deg,#FEF3C7,#FDE68A)" : "#fff"
  return (
    <button
      type="button"
      onClick={() => onClick(plan)}
      className="text-center transition-all hover:bg-blue-50"
      style={{
        padding: "16px 12px",
        background: selected ? "linear-gradient(180deg,#DBEAFE,#BFDBFE)" : baseBg,
        borderRight: "1px solid #F1F5F9",
        borderBottom: "1px solid #F1F5F9",
        position: "relative",
        textDecoration: "none",
        color: "inherit",
        outline: selected ? "2px solid #2563EB" : "none",
        outlineOffset: -2,
        cursor: "pointer",
        display: "block",
        width: "100%",
        font: "inherit",
      }}
    >
      {highlight && !selected && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            fontSize: 9,
            fontWeight: 800,
            color: "#92400E",
            background: "#FBBF24",
            padding: "2px 6px",
            borderRadius: 100,
            letterSpacing: "0.04em",
          }}
        >
          BEST
        </div>
      )}
      {selected && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            fontSize: 9,
            fontWeight: 800,
            color: "#fff",
            background: "#2563EB",
            padding: "2px 6px",
            borderRadius: 100,
            letterSpacing: "0.04em",
          }}
        >
          ✓ ເລືອກແລ້ວ
        </div>
      )}
      <div className="font-lao text-[11.5px] text-gray-500 mb-1">{period}</div>
      <div
        className="font-lao font-bold"
        style={{ fontSize: 16, color: "#111827", letterSpacing: "-0.01em" }}
      >
        {lak}
      </div>
      <div className="font-lao text-[10.5px] text-gray-500 -mt-0.5">ກີບ</div>
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13,
          fontWeight: 700,
          color: "#26A17B",
          marginTop: 4,
        }}
      >
        {usdt}
      </div>
      {save && (
        <div
          className="font-lao mt-1.5"
          style={{ fontSize: 10, fontWeight: 700, color: "#10B981" }}
        >
          🎉 {save}
        </div>
      )}
    </button>
  )
}
