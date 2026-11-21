"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

//  The landing strip of the email link.
//
//  The link cannot sign anyone in by itself: a session is a cookie this
//  site's auth has to mint, and it mints one through a provider. So the page
//  hands the token straight to that provider and gets out of the way — no
//  button to press, because the press already happened in the mail client.
//
//  A failure here is nearly always an expired or already-used link, so that
//  is what it says, rather than a code nobody can act on.

export default function VerifyRunner({ token }: { token: string }) {
  const [failed, setFailed] = useState(!token)

  useEffect(() => {
    if (!token) return
    let gone = false
    signIn("link", { token, redirect: false })
      .then(r => {
        if (gone) return
        if (r?.ok) window.location.href = "/dashboard"
        else setFailed(true)
      })
      .catch(() => { if (!gone) setFailed(true) })
    return () => { gone = true }
  }, [token])

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", padding: "64px 24px", textAlign: "center",
    }}>
      {failed ? (
        <>
          <h1 className="font-lao" style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)", margin: "0 0 10px" }}>
            ລິງກ໌ນີ້ໃຊ້ບໍ່ໄດ້ແລ້ວ
          </h1>
          <p className="font-lao" style={{ fontSize: 13.5, color: "var(--fg-3)", lineHeight: 1.9, margin: "0 0 20px" }}>
            ລິງກ໌ຢືນຢັນໃຊ້ໄດ້ຄັ້ງດຽວ ແລະ ໝົດອາຍຸໃນ 24 ຊົ່ວໂມງ. ກະລຸນາສະໝັກໃໝ່ອີກຄັ້ງ ແລ້ວເປີດລິງກ໌ລ່າສຸດທີ່ສົ່ງໄປ.
          </p>
          <a href="/?join=1" className="font-lao" style={{
            display: "inline-block", padding: "12px 22px", borderRadius: 10,
            background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff",
            fontSize: 13.5, fontWeight: 800, textDecoration: "none",
          }}>
            ສະໝັກໃໝ່
          </a>
        </>
      ) : (
        <p className="font-lao" style={{ fontSize: 14, color: "var(--fg-3)" }}>
          ກຳລັງຢືນຢັນ...
        </p>
      )}
    </div>
  )
}
