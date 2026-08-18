"use client"

import { useState } from "react"

// Shown to signed-in members. Consent is asked for here, on the site, rather
// than by mailing everyone once to ask — that first mail would itself be the
// unsolicited one, and at 49 members a single spam report is 2% of the list,
// far past the 0.3% that costs a domain its inbox placement.
export function EmailOptInCard({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function toggle(next: boolean) {
    setBusy(true)
    setError(false)
    try {
      const res = await fetch("/api/newsletter/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: next }),
      })
      if (!res.ok) throw new Error()
      setOptIn(next)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 16, padding: 20, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          ✉
        </div>
        <div>
          <p className="font-lao" style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            ຮັບ EA ຟຣີ ແລະ ຂ່າວສານທາງອີເມວ
          </p>
          <p className="font-lao" style={{ fontSize: 12, lineHeight: 1.75, color: "#6B7280" }}>
            {optIn
              ? "ທ່ານຈະໄດ້ຮັບ EA ຟຣີ, ບົດວິເຄາະ ແລະ ຂ່າວສຳຄັນທາງອີເມວ. ຍົກເລີກໄດ້ທຸກເວລາ."
              : "ພວກເຮົາຈະບໍ່ສົ່ງອີເມວຫາທ່ານຈົນກວ່າທ່ານຈະອະນຸຍາດ. ກົດຂ້າງລຸ່ມເພື່ອຮັບ EA ຟຣີ ແລະ ຂ່າວສານ — ຍົກເລີກໄດ້ທຸກເວລາ."}
          </p>
        </div>
      </div>

      <button
        onClick={() => toggle(!optIn)}
        disabled={busy}
        className="font-lao"
        style={{
          fontSize: 12, fontWeight: 600, padding: "9px 16px", borderRadius: 10,
          border: optIn ? "1px solid #E2E6F0" : "none",
          background: optIn ? "#F9FAFB" : "#2563EB",
          color: optIn ? "#6B7280" : "#fff",
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "ກຳລັງບັນທຶກ..." : optIn ? "ຍົກເລີກຮັບອີເມວ" : "ຕົກລົງ ຮັບອີເມວ"}
      </button>

      {optIn && !busy && (
        <span className="font-lao" style={{ fontSize: 11, color: "#15803D", marginLeft: 10 }}>✓ ອະນຸຍາດແລ້ວ</span>
      )}
      {error && (
        <span className="font-lao" style={{ fontSize: 11, color: "#B91C1C", marginLeft: 10 }}>ບັນທຶກບໍ່ສຳເລັດ ລອງໃໝ່</span>
      )}
    </div>
  )
}
