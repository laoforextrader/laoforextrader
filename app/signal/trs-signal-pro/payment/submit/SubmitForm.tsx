"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, AlertCircle, Loader2 } from "lucide-react"

const ADMIN_CONTACT = process.env.NEXT_PUBLIC_TRS_ADMIN || "https://t.me/YourMoney_Admin"
const SUBMIT_API = process.env.NEXT_PUBLIC_TRS_SUBMIT_API || ""

const PLANS = [
  { value: "1m", label: "1 ເດືອນ · 250,000 ກີບ · $12" },
  { value: "3m", label: "3 ເດືອນ · 600,000 ກີບ · $28" },
  { value: "6m", label: "6 ເດືອນ · 1,100,000 ກີບ · $51" },
  { value: "1y", label: "1 ປີ · 2,000,000 ກີບ · $93" },
]

type PaymentMethod = "bcel_onepay" | "usdt_trc20"

export function SubmitForm({ initialPlan }: { initialPlan: string }) {
  const router = useRouter()
  const [form, setForm] = useState({
    plan: initialPlan || "1m",
    method: "bcel_onepay" as PaymentMethod,
    name: "",
    telegram_username: "",
    payment_ref: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.telegram_username.trim()) {
      setError("ກະລຸນາໃສ່ Telegram username")
      return
    }
    if (!form.payment_ref.trim()) {
      setError(form.method === "usdt_trc20" ? "ກະລຸນາໃສ່ TX Hash" : "ກະລຸນາໃສ່ເລກອ້າງອີງ slip")
      return
    }

    setSubmitting(true)

    try {
      if (!SUBMIT_API) {
        // No backend wired yet — redirect to success with a "pending manual review" mode
        const params = new URLSearchParams({
          plan: form.plan,
          method: form.method,
          mode: "manual",
        })
        router.push(`/signal/trs-signal-pro/payment/success?${params.toString()}`)
        return
      }

      const res = await fetch(SUBMIT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: form.plan,
          payment_method: form.method,
          name: form.name || undefined,
          telegram_username: form.telegram_username.replace(/^@/, ""),
          payment_ref: form.payment_ref.trim(),
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || "ສົ່ງບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່ ຫຼື ທັກ admin")
        setSubmitting(false)
        return
      }

      const params = new URLSearchParams({
        plan: form.plan,
        method: form.method,
        mode: data.auto_approved ? "auto" : "pending",
        ...(data.invite_link ? { invite: encodeURIComponent(data.invite_link) } : {}),
        ...(data.bot_start_url ? { bot: encodeURIComponent(data.bot_start_url) } : {}),
      })
      router.push(`/signal/trs-signal-pro/payment/success?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ເຄືອຂ່າຍຂັດຂ້ອງ ກະລຸນາລອງໃໝ່")
      setSubmitting(false)
    }
  }

  const isUSDT = form.method === "usdt_trc20"

  return (
    <div style={{ background: "linear-gradient(180deg,#F8FAFF 0%,#EEF3FF 100%)", minHeight: "100vh" }}>
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href={`/signal/trs-signal-pro/payment${initialPlan ? `?plan=${initialPlan}` : ""}`}
            className="inline-flex items-center gap-1.5 font-lao text-[12px] text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={14} />
            ກັບໄປຫນ້າຊຳລະເງິນ
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="section-eyebrow">📤 ສົ່ງ Slip</div>
          <h1 className="section-title">
            ສົ່ງ Slip · <span>ຮັບລິ້ງ Pro</span>
          </h1>
          <p className="section-sub">
            {isUSDT
              ? "ໃສ່ TX Hash → ລະບົບກວດ tronscan ໃຫ້ອັດຕະໂນມັດ"
              : "ໃສ່ເລກອ້າງອີງ Slip → admin ກວດແລ້ວສົ່ງລິ້ງໃຫ້ໃນ 5-30 ນາທີ"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="card p-6">
          {/* Plan */}
          <div className="mb-4">
            <label className="font-lao text-[12px] font-semibold text-gray-700 block mb-1.5">
              ແພັກເກັດ
            </label>
            <select
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="w-full font-lao text-[14px] text-gray-900"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E2E6F0",
                background: "#fff",
                outline: "none",
              }}
            >
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div className="mb-4">
            <label className="font-lao text-[12px] font-semibold text-gray-700 block mb-1.5">
              ວິທີຊຳລະ
            </label>
            <div className="grid grid-cols-2 gap-2">
              <MethodButton
                active={form.method === "bcel_onepay"}
                onClick={() => setForm({ ...form, method: "bcel_onepay" })}
                color="#00A651"
              >
                🇱🇦 BCEL OnePay
              </MethodButton>
              <MethodButton
                active={form.method === "usdt_trc20"}
                onClick={() => setForm({ ...form, method: "usdt_trc20" })}
                color="#26A17B"
              >
                💎 USDT TRC20
              </MethodButton>
            </div>
          </div>

          {/* Telegram username */}
          <div className="mb-4">
            <label className="font-lao text-[12px] font-semibold text-gray-700 block mb-1.5">
              Telegram Username <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={form.telegram_username}
              onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
              placeholder="@yourusername"
              className="w-full font-lao text-[14px] text-gray-900"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E2E6F0",
                background: "#fff",
                outline: "none",
              }}
              required
            />
            <div className="font-lao text-[11px] text-gray-500 mt-1">
              ເພື່ອສົ່ງລິ້ງ Pro Channel ໃຫ້ທ່ານ
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="font-lao text-[12px] font-semibold text-gray-700 block mb-1.5">
              ຊື່ <span className="text-gray-400">(ບໍ່ບັງຄັບ)</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ຊື່ຂອງທ່ານ"
              className="w-full font-lao text-[14px] text-gray-900"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E2E6F0",
                background: "#fff",
                outline: "none",
              }}
            />
          </div>

          {/* Payment ref */}
          <div className="mb-4">
            <label className="font-lao text-[12px] font-semibold text-gray-700 block mb-1.5">
              {isUSDT ? "TX Hash" : "ເລກອ້າງອີງ Slip"} <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={form.payment_ref}
              onChange={(e) => setForm({ ...form, payment_ref: e.target.value })}
              placeholder={isUSDT ? "0x... ຫຼື transaction hash" : "TXN-... ຫຼື ເລກ Slip"}
              className="w-full"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E2E6F0",
                background: "#fff",
                outline: "none",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12.5,
                color: "#111827",
                wordBreak: "break-all",
              }}
              required
            />
            <div className="font-lao text-[11px] text-gray-500 mt-1">
              {isUSDT
                ? "ຄັດລອກຈາກ Binance/OKX → Transaction History"
                : "ເລກອ້າງອີງຢູ່ໃນ slip BCEL One ຫຼື screenshot Slip"}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="font-lao text-[12px] font-semibold text-gray-700 block mb-1.5">
              ໝາຍເຫດເພີ່ມເຕີມ <span className="text-gray-400">(ບໍ່ບັງຄັບ)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="ເຊັ່ນ: ໂອນຈາກບັນຊີ XXX, ສະຫາຍແນະນຳ, ฯลฯ"
              rows={2}
              className="w-full font-lao text-[13px] text-gray-900"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E2E6F0",
                background: "#fff",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {error && (
            <div
              className="font-lao mb-4 flex items-start gap-2"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                color: "#991B1B",
                lineHeight: 1.55,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
            style={{
              opacity: submitting ? 0.65 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
              padding: "13px",
              fontSize: 14.5,
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                ກຳລັງສົ່ງ...
              </>
            ) : (
              <>
                <Send size={15} strokeWidth={2.5} />
                ສົ່ງ Slip
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-lao text-[11.5px] text-gray-500">
            ບໍ່ສະບາຍໃຊ້ຟອມ? <a
              href={ADMIN_CONTACT}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0088cc", textDecoration: "none", fontWeight: 600 }}
            >ທັກ admin ໃນ Telegram ໂດຍກົງ →</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function MethodButton({
  active, onClick, color, children,
}: {
  active: boolean
  onClick: () => void
  color: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-lao font-semibold transition-all"
      style={{
        padding: "11px 12px",
        borderRadius: 10,
        fontSize: 13.5,
        background: active ? color : "#fff",
        color: active ? "#fff" : "#1F2937",
        border: `1.5px solid ${active ? color : "#E2E6F0"}`,
        cursor: "pointer",
        boxShadow: active ? `0 4px 12px ${color}33` : "none",
      }}
    >
      {children}
    </button>
  )
}
