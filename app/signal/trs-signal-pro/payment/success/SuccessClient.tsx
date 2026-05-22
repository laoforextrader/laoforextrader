"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2, Clock, MessageCircle, ArrowRight,
  Bell, Loader2, XCircle, Bot,
} from "lucide-react"
import { CopyButton } from "@/components/signal/CopyButton"

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_TRS_ADMIN || "https://t.me/YourMoney_Admin"
const STATUS_API_BASE = (() => {
  const url = process.env.NEXT_PUBLIC_TRS_SUBMIT_API
  if (!url) return ""
  // Submit endpoint is /api/payment/submit; status is /api/payment/status
  return url.replace(/\/api\/payment\/submit\/?$/, "")
})()

const POLL_INTERVAL_MS = 5000
const MAX_POLL_MINUTES = 60 // stop polling after 1h; user can refresh page

type Status = "pending" | "approved" | "rejected" | "unknown"

interface Props {
  initialMode: string
  initialInvite: string | null
  botStartUrl: string | null
  pendingId: number | null
  publicToken: string | null
}

export function SuccessClient({
  initialMode, initialInvite, botStartUrl, pendingId, publicToken,
}: Props) {
  const initialStatus: Status =
    initialMode === "auto" && initialInvite ? "approved" :
    initialMode === "manual" ? "unknown" :
    "pending"

  const [status, setStatus] = useState<Status>(initialStatus)
  const [inviteLink, setInviteLink] = useState<string | null>(initialInvite)
  const [rejectReason, setRejectReason] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll status until approved/rejected/timeout
  useEffect(() => {
    if (status !== "pending") return
    if (!pendingId || !publicToken || !STATUS_API_BASE) return

    const maxPolls = Math.floor((MAX_POLL_MINUTES * 60 * 1000) / POLL_INTERVAL_MS)

    const tick = async () => {
      try {
        const res = await fetch(
          `${STATUS_API_BASE}/api/payment/status?id=${pendingId}&token=${encodeURIComponent(publicToken)}`,
        )
        const data = await res.json()
        if (!res.ok || !data.ok) return

        if (data.status === "approved" && data.invite_link) {
          setStatus("approved")
          setInviteLink(data.invite_link)
        } else if (data.status === "rejected") {
          setStatus("rejected")
          setRejectReason(data.rejected_reason || null)
        }
      } catch {
        // Network blip — keep polling
      }
    }

    // First poll fires immediately (catches "admin approved before page loaded")
    tick()

    pollTimerRef.current = setInterval(() => {
      setPollCount((c) => {
        const next = c + 1
        if (next >= maxPolls && pollTimerRef.current) {
          clearInterval(pollTimerRef.current)
          pollTimerRef.current = null
        }
        return next
      })
      tick()
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [status, pendingId, publicToken])

  const isApproved = status === "approved"
  const isRejected = status === "rejected"
  const isPolling  = status === "pending" && !!pendingId && !!publicToken && !!STATUS_API_BASE

  return (
    <div style={{ background: "linear-gradient(180deg,#F8FAFF 0%,#EEF3FF 100%)", minHeight: "100vh" }}>
      <div className="max-w-[600px] mx-auto px-6 py-16">
        {/* Status badge */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: isApproved
                ? "linear-gradient(135deg,#10B981,#059669)"
                : isRejected
                ? "linear-gradient(135deg,#EF4444,#B91C1C)"
                : "linear-gradient(135deg,#3B82F6,#2563EB)",
              boxShadow: isApproved
                ? "0 14px 40px rgba(16,185,129,0.40)"
                : isRejected
                ? "0 14px 40px rgba(239,68,68,0.40)"
                : "0 14px 40px rgba(37,99,235,0.35)",
              marginBottom: 16,
              transition: "all 0.5s ease",
            }}
          >
            {isApproved ? (
              <CheckCircle2 size={44} strokeWidth={2.4} style={{ color: "#fff" }} />
            ) : isRejected ? (
              <XCircle size={44} strokeWidth={2.4} style={{ color: "#fff" }} />
            ) : isPolling ? (
              <Loader2 size={40} strokeWidth={2.4} style={{ color: "#fff" }} className="animate-spin" />
            ) : (
              <Clock size={40} strokeWidth={2.4} style={{ color: "#fff" }} />
            )}
          </div>

          <h1
            className="font-sans font-extrabold"
            style={{ fontSize: 30, letterSpacing: "-0.02em", marginBottom: 8 }}
          >
            {isApproved ? (
              <>ໄດ້ຮັບ Pro <span style={{
                background: "linear-gradient(135deg,#10B981,#059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>ສຳເລັດ!</span></>
            ) : isRejected ? (
              <>ການຊຳລະ <span style={{
                background: "linear-gradient(135deg,#EF4444,#B91C1C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>ບໍ່ຜ່ານ</span></>
            ) : (
              <>ສົ່ງສຳເລັດ · <span>ລໍຖ້າ admin</span></>
            )}
          </h1>
          <p className="font-lao text-[13.5px] text-gray-600 mt-2">
            {isApproved
              ? "ກົດປຸ່ມລຸ່ມເພື່ອເຂົ້າ Pro Channel"
              : isRejected
              ? "ກະລຸນາທັກ admin ເພື່ອກວດສະຖານະການໂອນ"
              : isPolling
              ? "ກຳລັງລໍຖ້າ admin ກວດ Slip · ໜ້ານີ້ຈະອັບເດດອັດຕະໂນມັດເມື່ອຜ່ານ"
              : "Slip ຂອງທ່ານເຂົ້າຄິວແລ້ວ admin ຈະກວດແລະສົ່ງລິ້ງໃຫ້ໃນ 5-30 ນາທີ"}
          </p>
          {isPolling && (
            <p className="font-lao text-[11px] text-gray-400 mt-2">
              🔄 ກວດສະຖານະທຸກ 5 ວິນາທີ · ບໍ່ປິດໜ້ານີ້
            </p>
          )}
        </div>

        {/* APPROVED — show invite link */}
        {isApproved && inviteLink && (
          <div
            className="card p-6 text-center"
            style={{ background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "2px solid #10B981" }}
          >
            <h2 className="font-lao font-bold text-[16px] text-gray-900 mb-3">
              🔗 ລິ້ງ Pro Channel
            </h2>
            <p className="font-lao text-[12px] text-gray-600 mb-4">
              ໃຊ້ໄດ້ຄັ້ງດຽວ · ໝົດອາຍຸໃນ 24 ຊົ່ວໂມງ · ກົດດ່ຽວນີ້
            </p>
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-pro-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg,#10B981,#059669)",
                color: "#fff",
                textDecoration: "none",
                padding: "16px 32px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "Noto Sans Lao, sans-serif",
              }}
            >
              ເຂົ້າ Pro Channel
              <ArrowRight size={17} strokeWidth={3} />
            </a>

            {/* Invite URL — green form-style box with copy button */}
            <div
              className="mt-5 flex items-center gap-2"
              style={{
                background: "#fff",
                border: "1.5px solid #10B981",
                borderRadius: 10,
                padding: "8px 10px",
                boxShadow: "0 4px 12px rgba(16,185,129,0.15)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#065F46",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: 8,
                  padding: "8px 10px",
                  textAlign: "left",
                  wordBreak: "break-all",
                  lineHeight: 1.4,
                }}
              >
                {inviteLink}
              </div>
              <CopyButton value={inviteLink} label="" />
            </div>
          </div>
        )}

        {/* REJECTED — explain + offer admin contact */}
        {isRejected && (
          <div
            className="card p-6 text-center"
            style={{ background: "#FEF2F2", border: "2px solid #EF4444" }}
          >
            <h2 className="font-lao font-bold text-[15px]" style={{ color: "#7F1D1D", marginBottom: 8 }}>
              ❌ ການໂອນບໍ່ຜ່ານ
            </h2>
            {rejectReason && (
              <p
                className="font-lao text-[13px] mb-4"
                style={{
                  color: "#991B1B",
                  background: "#fff",
                  border: "1px solid #FECACA",
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                {rejectReason}
              </p>
            )}
            <a
              href={ADMIN_CONTACT}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0088cc",
                color: "#fff",
                textDecoration: "none",
                padding: "11px 22px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <MessageCircle size={15} />
              ທັກ admin ໃນ Telegram
            </a>
          </div>
        )}

        {/* PENDING — explain wait + optional bot capture */}
        {!isApproved && !isRejected && (
          <div className="card p-6">
            <h2 className="font-lao font-bold text-[15px] text-gray-900 mb-3">
              📋 ຂັ້ນຕອນຕໍ່ໄປ
            </h2>
            <ol
              className="font-lao text-[13.5px] text-gray-700"
              style={{ paddingLeft: 20, listStyle: "decimal", lineHeight: 1.85 }}
            >
              <li>Slip ຂອງທ່ານເຂົ້າຄິວ admin ແລ້ວ ✓</li>
              <li>Admin ກວດທຽບກັບ BCEL One ຫຼື tronscan</li>
              <li>
                {isPolling
                  ? "ໜ້ານີ້ຈະຂຶ້ນລິ້ງ Pro Channel ໃຫ້ອັດຕະໂນມັດເມື່ອ admin ກວດຜ່ານ"
                  : "ສົ່ງລິ້ງ Pro Channel ໃຫ້ທ່ານໃນ Telegram ໃນ 5-30 ນາທີ"}
              </li>
              <li>ກົດລິ້ງ → join Pro Channel ✅</li>
            </ol>

            <div
              className="font-lao mt-4 p-3"
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 8,
                fontSize: 12.5,
                color: "#78350F",
                lineHeight: 1.65,
              }}
            >
              💡 <strong>Tip:</strong> ບໍ່ປິດໜ້ານີ້ ໄວ້ໃຊ້ສຳລັບຮັບລິ້ງ Pro Channel
            </div>

            <div className="mt-5 text-center">
              <a
                href={ADMIN_CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#0088cc",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "11px 22px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "Noto Sans Lao, sans-serif",
                  boxShadow: "0 6px 16px rgba(0,136,204,0.30)",
                }}
              >
                <MessageCircle size={15} />
                ມີຄຳຖາມ · ທັກ admin
              </a>
            </div>
          </div>
        )}

        {/* Telegram delivery CTA — prominent because Telegram bots can
            only DM users who have started the bot at least once. */}
        {botStartUrl && !isRejected && (
          <div
            className="mt-6 p-6 text-center"
            style={{
              background: "linear-gradient(135deg,#0088cc,#005f8a)",
              borderRadius: 16,
              color: "#fff",
              boxShadow: "0 14px 40px rgba(0,136,204,0.30)",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bot size={26} strokeWidth={2.4} style={{ color: "#fff" }} />
              <h2
                className="font-lao font-bold"
                style={{ fontSize: 19, color: "#fff", margin: 0 }}
              >
                ຮັບລິ້ງເຂົ້າ Telegram ໂດຍກົງ
              </h2>
            </div>
            <p
              className="font-lao"
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.65,
                marginBottom: 16,
              }}
            >
              ກົດປຸ່ມລຸ່ມ → ກົດ <strong>[Start]</strong> ໃນ Telegram ຄັ້ງດຽວ →
              <br />
              Bot ຈະສົ່ງລິ້ງ Pro Channel + ແຈ້ງເຕືອນກ່ອນໝົດອາຍຸໃຫ້ທ່ານໂດຍກົງ
            </p>
            <a
              href={botStartUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                color: "#0088cc",
                textDecoration: "none",
                padding: "13px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                fontFamily: "Noto Sans Lao, sans-serif",
                boxShadow: "0 8px 20px rgba(0,0,0,0.20)",
              }}
            >
              <Bell size={16} strokeWidth={2.5} />
              ເປີດ Telegram Bot
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
            <p
              className="font-lao"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.70)",
                marginTop: 14,
                lineHeight: 1.55,
              }}
            >
              ⚠️ ເຄີຍໃຊ້ bot ນີ້ມາແລ້ວ? ບໍ່ເຫັນປຸ່ມ [Start]? →
              <br />
              ພິມ <code style={{ background: "rgba(255,255,255,0.18)", padding: "1px 6px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace" }}>
                /start p{pendingId ?? "X"}
              </code> ໃນແຊັດບອດ
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/signal/trs-signal-pro"
            className="font-lao text-[12.5px] text-gray-500 hover:text-blue-600 transition-colors"
            style={{ textDecoration: "underline" }}
          >
            ກັບໄປຫນ້າ Signal
          </Link>
        </div>
      </div>
    </div>
  )
}
