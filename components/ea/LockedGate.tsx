"use client"

import { useState } from "react"
import AuthModal from "@/components/account/AuthModal"

//  The padlock over the download block.
//
//  It does not say "sign in with Google" — that is how the door opens, not
//  what is behind it, and naming the provider on a product page reads like
//  an advert for somebody else. It says the section is locked and offers one
//  button; the provider appears inside the form, where it is the next thing
//  the person actually does.

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function LockedGate({
  termsVer, signedIn,
}: {
  termsVer: string
  /** Signed in but the profile is not finished — a different sentence. */
  signedIn: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <section style={{
      background: "var(--surface)", border: "1px solid var(--line)",
      borderRadius: 16, padding: 24, marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span style={{
          flexShrink: 0, width: 44, height: 44, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--accent-soft)", border: "1px solid var(--accent-line)",
          color: "var(--accent)",
        }}>
          <LockIcon />
        </span>
        <div style={{ minWidth: 0 }}>
          <h2 className="font-lao" style={{ fontSize: 16.5, fontWeight: 700, color: "var(--fg)", margin: "2px 0 6px" }}>
            {signedIn ? "ຕື່ມຂໍ້ມູນສະມາຊິກກ່ອນ" : "ສ່ວນນີ້ຕ້ອງລັອກອິນກ່ອນ"}
          </h2>
          <p className="font-lao" style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.8, margin: "0 0 16px" }}>
            {signedIn
              ? "ເຫຼືອອີກສອງສາມຊ່ອງ — ຊື່, ເບີ WhatsApp ແລະ ຍອມຮັບເງື່ອນໄຂ ແລ້ວລິງກ໌ດາວໂຫຼດ ແລະ ຄຳສັ່ງຕິດຕັ້ງຈະສະແດງຂຶ້ນ"
              : "ລິງກ໌ດາວໂຫຼດ ແລະ ຄຳສັ່ງຕິດຕັ້ງ EA ເປີດໃຫ້ສະມາຊິກທີ່ລັອກອິນ ແລະ ຍອມຮັບເງື່ອນໄຂການໃຊ້ແລ້ວເທົ່ານັ້ນ"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => setOpen(true)} className="font-lao"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff",
                fontSize: 13.5, fontWeight: 800,
              }}>
              {signedIn ? "ຕື່ມຂໍ້ມູນ" : "ລັອກອິນ"}
            </button>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-lao"
              style={{
                display: "inline-flex", alignItems: "center", padding: "12px 18px",
                borderRadius: 10, border: "1px solid var(--line)", color: "var(--fg-2)",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>
              ອ່ານເງື່ອນໄຂ
            </a>
          </div>
        </div>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} termsVer={termsVer} />
    </section>
  )
}
