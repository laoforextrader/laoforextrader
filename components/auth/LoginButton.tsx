"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"

// Consent has to be captured here, at the moment someone chooses to join,
// because there is no honest way to ask for it later by email — that first
// message would itself be the unsolicited one.
//
// The box is NOT pre-ticked. A pre-ticked box collects addresses from people
// who never noticed, and those are exactly the people who press "report spam"
// on the first send. At 49 members one complaint is 2%, against Gmail's 0.3%
// threshold — a padded list is worse than a small one.
//
// The OAuth round trip destroys React state, so the choice is parked in
// localStorage and picked up by OptInSync once the session exists.
export const OPT_IN_PENDING_KEY = "trs-newsletter-optin-v1"

export function LoginButton() {
  const [optIn, setOptIn] = useState(false)

  function handleSignIn() {
    try {
      if (optIn) localStorage.setItem(OPT_IN_PENDING_KEY, "1")
      else localStorage.removeItem(OPT_IN_PENDING_KEY)
    } catch {
      // Private mode / storage disabled — sign-in still has to work.
    }
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label
        style={{
          display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
          padding: "12px 14px", borderRadius: 12, cursor: "pointer",
          background: optIn ? "#EEF3FF" : "#F9FAFB",
          border: `1px solid ${optIn ? "#BFCFFF" : "#E5E7EB"}`,
          transition: "all .15s",
        }}
      >
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          style={{ width: 16, height: 16, marginTop: 2, accentColor: "#2563EB", cursor: "pointer", flexShrink: 0 }}
        />
        <span>
          <span
            className="font-lao"
            style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", lineHeight: 1.6 }}
          >
            ຮັບ EA ຟຣີ ແລະ ຂ່າວສານ Forex ທາງອີເມວ
          </span>
          <span className="font-lao" style={{ display: "block", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
            ບໍ່ມີສະແປມ · ຍົກເລີກໄດ້ທຸກເວລາ
          </span>
        </span>
      </label>

      <button
        onClick={handleSignIn}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "12px 20px", background: "#fff", border: "1.5px solid #D1D5DB",
          borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151",
          cursor: "pointer", transition: "all 0.2s", fontFamily: "'Noto Sans Lao', sans-serif",
        }}
        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2563EB"; (e.currentTarget as HTMLElement).style.background = "#EEF3FF" }}
        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB"; (e.currentTarget as HTMLElement).style.background = "#fff" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        ເຂົ້າດ້ວຍ Google
      </button>
    </div>
  )
}
