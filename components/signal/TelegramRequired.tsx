"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const TG_BLUE = "#229ED9"
const APP_STORE = "https://apps.apple.com/app/telegram-messenger/id686449807"
const PLAY_STORE = "https://play.google.com/store/apps/details?id=org.telegram.messenger"

function TelegramLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill={TG_BLUE} />
      <path
        d="M10.7 23.6 33.2 14.9c1.05-.38 1.96.25 1.62 1.83l-3.83 18.05c-.28 1.28-1.05 1.59-2.12.99l-5.86-4.32-2.83 2.72c-.31.31-.58.58-1.18.58l.42-5.97 10.86-9.81c.47-.42-.1-.65-.73-.24l-13.42 8.45-5.79-1.8c-1.26-.4-1.28-1.26.27-1.86Z"
        fill="#fff"
      />
    </svg>
  )
}

function AppleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.9 2.37-4.29 2.48-4.36-1.35-1.98-3.46-2.25-4.21-2.28-1.79-.18-3.5 1.05-4.41 1.05-.91 0-2.31-1.03-3.8-1-1.96.03-3.77 1.14-4.78 2.9-2.04 3.54-.52 8.78 1.46 11.65.97 1.41 2.12 2.99 3.63 2.93 1.46-.06 2.01-.94 3.77-.94 1.76 0 2.26.94 3.8.91 1.57-.03 2.56-1.43 3.52-2.85 1.11-1.63 1.57-3.21 1.59-3.29-.04-.02-3.05-1.17-3.08-4.64ZM14.2 4.6c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.73-.74.86-1.39 2.23-1.22 3.55 1.29.1 2.6-.65 3.41-1.62Z" />
    </svg>
  )
}

function PlayLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.6 2.3c-.3.27-.48.7-.48 1.25v16.9c0 .55.18.98.48 1.25l.09.08L13.1 12.3v-.22L3.69 2.22l-.09.08Z" fill="#00D3FF" />
      <path d="m16.3 15.5-3.2-3.2v-.22l3.2-3.2.07.04 3.79 2.15c1.08.61 1.08 1.62 0 2.24l-3.79 2.15-.07.04Z" fill="#FFCE00" />
      <path d="m16.37 15.46-3.27-3.27-9.5 9.5c.36.38.94.42 1.6.05l11.17-6.28Z" fill="#FF3D44" />
      <path d="M16.37 8.93 5.2 2.65c-.66-.37-1.24-.33-1.6.05l9.5 9.5 3.27-3.27Z" fill="#00F076" />
    </svg>
  )
}

function StoreButton({
  href,
  logo,
  top,
  bottom,
}: {
  href: string
  logo: React.ReactNode
  top: string
  bottom: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 transition-transform hover:-translate-y-0.5"
      style={{
        background: "#0B0B0F",
        color: "#fff",
        padding: "9px 16px",
        borderRadius: 11,
        textDecoration: "none",
        minWidth: 150,
      }}
    >
      <span style={{ display: "flex", color: "#fff" }}>{logo}</span>
      <span style={{ lineHeight: 1.15 }}>
        <span style={{ display: "block", fontSize: 9, opacity: 0.8, letterSpacing: "0.02em" }}>{top}</span>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{bottom}</span>
      </span>
    </a>
  )
}

/**
 * "You must have Telegram first" notice with an expandable how-to-install
 * panel (App Store + Play Store links). Drop above any package picker —
 * signals are delivered only through Telegram.
 */
export function TelegramRequired() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="max-w-[560px] mx-auto mb-8"
      style={{
        background: "#fff",
        border: `1.5px solid ${TG_BLUE}33`,
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(34,158,217,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Notice */}
      <div className="flex items-center gap-3 px-5 py-4">
        <span style={{ flexShrink: 0 }}>
          <TelegramLogo size={30} />
        </span>
        <div>
          <div className="font-lao font-bold text-[15px]" style={{ color: "#0F172A" }}>
            ທ່ານ ຕ້ອງມີ Telegram ກ່ອນ
          </div>
          <div className="font-lao text-[12px]" style={{ color: "#64748B" }}>
            ສັນຍານທັງໝົດສົ່ງຜ່ານ Telegram — ກະລຸນາຕິດຕັ້ງ Telegram ກ່ອນສະໝັກ
          </div>
        </div>
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-center gap-1.5 font-lao font-semibold text-[13px] transition-colors"
        style={{
          background: open ? "#F1F9FE" : "#F8FBFE",
          color: TG_BLUE,
          borderTop: `1px solid ${TG_BLUE}22`,
          padding: "10px 14px",
          cursor: "pointer",
        }}
      >
        ວິທີສະໝັກ Telegram
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>

      {/* Expandable how-to */}
      {open && (
        <div className="px-5 py-5" style={{ borderTop: `1px solid ${TG_BLUE}22`, background: "#FBFDFF" }}>
          <ol
            className="font-lao text-[13px] space-y-2 mb-4"
            style={{ color: "#334155", paddingLeft: 18, listStyle: "decimal" }}
          >
            <li>ດາວໂຫລດ app Telegram ຈາກ App Store ຫຼື Play Store</li>
            <li>ເປີດ app → ໃສ່ເບີໂທລະສັບ → ຢືນຢັນ OTP</li>
            <li>ຕັ້ງຊື່ user (username) ໃຫ້ຮຽບຮ້ອຍ</li>
            <li>ກັບມາໜ້ານີ້ → ເລືອກແພັກເກັດ ແລະ ສະໝັກໄດ້ເລີຍ</li>
          </ol>
          <div className="flex flex-wrap justify-center gap-3">
            <StoreButton href={APP_STORE} logo={<AppleLogo />} top="Download on the" bottom="App Store" />
            <StoreButton href={PLAY_STORE} logo={<PlayLogo />} top="GET IT ON" bottom="Google Play" />
          </div>
        </div>
      )}
    </div>
  )
}
