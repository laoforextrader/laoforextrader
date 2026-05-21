import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Clock, MessageCircle, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "ສົ່ງສຳເລັດ · TheRocket Signal Pro",
  robots: { index: false, follow: false },
}

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_TRS_ADMIN || "https://t.me/YourMoney_Admin"

interface Props {
  searchParams: Promise<{ mode?: string; invite?: string; plan?: string; method?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const mode = params.mode || "pending"
  const inviteLink = params.invite ? decodeURIComponent(params.invite) : null
  const isAuto = mode === "auto" && !!inviteLink
  const isManual = mode === "manual"

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
              background: isAuto
                ? "linear-gradient(135deg,#10B981,#059669)"
                : "linear-gradient(135deg,#3B82F6,#2563EB)",
              boxShadow: isAuto
                ? "0 14px 40px rgba(16,185,129,0.40)"
                : "0 14px 40px rgba(37,99,235,0.35)",
              marginBottom: 16,
            }}
          >
            {isAuto ? (
              <CheckCircle2 size={44} strokeWidth={2.4} style={{ color: "#fff" }} />
            ) : (
              <Clock size={40} strokeWidth={2.4} style={{ color: "#fff" }} />
            )}
          </div>

          <h1
            className="font-sans font-extrabold"
            style={{ fontSize: 30, letterSpacing: "-0.02em", marginBottom: 8 }}
          >
            {isAuto ? (
              <>ໄດ້ຮັບ Pro <span style={{
                background: "linear-gradient(135deg,#10B981,#059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>ສຳເລັດ!</span></>
            ) : (
              <>ສົ່ງສຳເລັດ · <span>ລໍຖ້າ admin</span></>
            )}
          </h1>
          <p className="font-lao text-[13.5px] text-gray-600 mt-2">
            {isAuto
              ? "ລະບົບກວດ tronscan ຜ່ານ → ໄດ້ລິ້ງ Pro Channel ດ່ຽວນີ້"
              : "Slip ຂອງທ່ານເຂົ້າຄິວແລ້ວ admin ຈະກວດແລະສົ່ງລິ້ງໃຫ້ໃນ 5-30 ນາທີ"}
          </p>
        </div>

        {/* Auto-approve: show invite link */}
        {isAuto && inviteLink && (
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg,#10B981,#059669)",
                color: "#fff",
                textDecoration: "none",
                padding: "14px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                fontFamily: "Noto Sans Lao, sans-serif",
                boxShadow: "0 8px 20px rgba(16,185,129,0.45)",
              }}
            >
              ເຂົ້າ Pro Channel
              <ArrowRight size={16} strokeWidth={3} />
            </a>
            <p
              className="font-lao text-[11px] text-gray-500 mt-4"
              style={{ wordBreak: "break-all" }}
            >
              {inviteLink}
            </p>
          </div>
        )}

        {/* Pending: explain wait */}
        {!isAuto && (
          <div className="card p-6">
            <h2 className="font-lao font-bold text-[15px] text-gray-900 mb-3">
              📋 ຂັ້ນຕອນຕໍ່ໄປ
            </h2>
            <ol
              className="font-lao text-[13.5px] text-gray-700"
              style={{ paddingLeft: 20, listStyle: "decimal", lineHeight: 1.85 }}
            >
              {isManual ? (
                <>
                  <li>ກະລຸນາທັກ admin ໃນ Telegram → ສົ່ງ Slip/TX Hash ໃຫ້ກວດ</li>
                  <li>ບອກ admin: ແພັກເກັດ + Telegram username</li>
                  <li>Admin ກວດສຳເລັດ → ສົ່ງລິ້ງ Pro Channel</li>
                </>
              ) : (
                <>
                  <li>Slip ເຂົ້າຄິວ admin ແລ້ວ ✓</li>
                  <li>Admin ກວດທຽບກັບ BCEL One ຫຼື tronscan</li>
                  <li>ສົ່ງລິ້ງ Pro Channel ໃຫ້ທ່ານໃນ Telegram ໃນ 5-30 ນາທີ</li>
                </>
              )}
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
              💡 <strong>Tip:</strong> ເປີດ Telegram notification ໄວ້ ເພື່ອບໍ່ໃຫ້ພາດລິ້ງຈາກ admin
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
                {isManual ? "ທັກ admin ໂດຍກົງ" : "ຕິດຕໍ່ admin"}
              </a>
            </div>
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
