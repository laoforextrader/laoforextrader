"use client"

import { useState } from "react"

// The only place on the site where someone can ask for email without already
// having an account. /api/newsletter has existed since the schema was written
// but nothing ever called it, which is why all 49 members arrived through
// Google sign-in and none of them through an actual request for mail.
export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState("busy")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <div className="border border-gray-100 rounded-2xl px-5 py-4 bg-gray-50/60">
        <p className="font-lao text-[12px] text-green-700 font-semibold">✓ ສະໝັກສຳເລັດແລ້ວ</p>
        <p className="font-lao text-[11px] text-gray-500 mt-1">ພວກເຮົາຈະສົ່ງ EA ຟຣີ ແລະ ຂ່າວສານໄປໃຫ້ທ່ານ. ຍົກເລີກໄດ້ທຸກເວລາ.</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-100 rounded-2xl px-5 py-4 bg-gray-50/60">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="md:flex-1">
          <p className="font-lao text-[12px] font-bold text-gray-700">ຮັບ EA ຟຣີ ແລະ ຂ່າວສານ Forex ທາງອີເມວ</p>
          <p className="font-lao text-[10px] text-gray-400 mt-0.5">ບໍ່ມີສະແປມ · ຍົກເລີກໄດ້ທຸກເວລາ</p>
        </div>
        <form onSubmit={submit} className="flex gap-2 md:w-[340px]">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle") }}
            placeholder="you@gmail.com"
            className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={state === "busy"}
            className="font-lao shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-60 hover:bg-blue-700 transition-colors"
          >
            {state === "busy" ? "..." : "ສະໝັກ"}
          </button>
        </form>
      </div>
      {state === "error" && (
        <p className="font-lao text-[10px] text-red-600 mt-2">ສະໝັກບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່</p>
      )}
    </div>
  )
}
