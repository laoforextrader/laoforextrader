"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { signIn, useSession } from "next-auth/react"
import GoogleMark from "@/components/account/GoogleMark"
import PhoneField from "@/components/account/PhoneField"
import AvatarField from "@/components/account/AvatarField"
import { intlNumber, phoneLooksValid } from "@/lib/account/phone"
import { useT } from "@/components/i18n/LangProvider"
import type { Strings } from "@/lib/i18n/dict"

//  One form for joining the site, by either door.
//
//  Google is a shortcut through two fields, not a separate way in: whichever
//  door somebody uses they end up on this same form, fill in the same boxes
//  and press the same button. Coming back from Google straight into a
//  dashboard — which is what it used to do — skips the half of joining that
//  we actually need, so the return trip lands back here with the name and
//  address already filled.
//
//  Without Google the mailbox does the vouching: the profile is saved, a
//  link is mailed, and opening it is both the proof and the sign-in. No
//  password is invented, so none can be forgotten or leaked.
//
//  Rendered through a portal onto <body>. The navbar sets backdrop-filter,
//  and a filtered element becomes the containing block for position:fixed
//  inside it — which is why this dialog was being boxed into the 56px bar
//  and clipped. Raising z-index does nothing for that.

const PROFILE_API = "/api/account/profile"
const REGISTER_API = "/api/account/register"

/** Server error codes, in the reader's language. */
function errText(code: unknown, t: Strings): string {
  const e = t.auth.err
  switch (String(code)) {
    case "name": return e.name
    case "email": return e.email
    case "phone": return e.phone
    case "optin": case "terms": return e.terms
    case "too-many": return e.tooMany
    case "mail": return e.mail
    case "image-too-big": return e.imageBig
    case "image-type": return e.imageType
    case "upload": return e.upload
    default: return e.save
  }
}

const AVATAR_PX = 256

async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = () => rej(new Error("image"))
      i.src = url
    })
    const side = Math.min(img.width, img.height)
    const c = document.createElement("canvas")
    c.width = AVATAR_PX; c.height = AVATAR_PX
    const ctx = c.getContext("2d")
    if (!ctx) throw new Error("canvas")
    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_PX, AVATAR_PX)
    return await new Promise<Blob>((res, rej) =>
      c.toBlob(b => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.85))
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function AuthModal({
  open, onClose, termsVer, initial,
}: {
  open: boolean
  onClose: () => void
  termsVer: string
  initial?: { name?: string; phone?: string; avatarId?: string; avatarUrl?: string }
}) {
  const { data: session, status } = useSession()
  const signedIn = status === "authenticated"
  const t = useT()

  const [name, setName] = useState(initial?.name ?? "")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("LA")
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [avatarId, setAvatarId] = useState(initial?.avatarId ?? "")
  const [preview, setPreview] = useState(initial?.avatarUrl ?? "")
  const [file, setFile] = useState<Blob | null>(null)
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [mailed, setMailed] = useState("")
  const picked = useRef(false)

  //  Google already knows these two; nobody should retype them. Only fills
  //  an empty box, so an edit of their own is never overwritten.
  useEffect(() => {
    if (!signedIn) return
    if (!name && session?.user?.name) setName(session.user.name)
    if (session?.user?.email) setEmail(session.user.email)
  }, [signedIn, session?.user?.name, session?.user?.email, name])

  //  The flag the phone field opens on, from where the request came in. A
  //  guess, overruled the moment the reader touches the picker.
  useEffect(() => {
    if (!open) return
    let gone = false
    fetch("/api/geo")
      .then(r => r.json())
      .then(j => { if (!gone && !picked.current && j?.country) setCountry(j.country) })
      .catch(() => {})
    return () => { gone = true }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null
  if (typeof document === "undefined") return null

  const waNum = intlNumber(country, phone)
  const emailOk = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.trim())
  const ready = name.trim().length >= 2 && emailOk && phoneLooksValid(waNum) && terms

  async function pickFile(f: File) {
    setErr("")
    try {
      const small = await shrink(f)
      setFile(small)
      setPreview(URL.createObjectURL(small))
      setAvatarId("")
    } catch { setErr(t.auth.err.imageType) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || busy) return
    setErr(""); setBusy(true)
    try {
      const fd = new FormData()
      fd.set("name", name)
      fd.set("phone", waNum)
      fd.set("avatarId", avatarId)
      fd.set("optIn", "1")
      fd.set("termsVer", termsVer)
      if (file) fd.set("avatar", file, "avatar.jpg")
      if (!signedIn) fd.set("email", email.trim())

      const r = await fetch(signedIn ? PROFILE_API : REGISTER_API, { method: "POST", body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) { setErr(errText(j.error, t)); return }

      //  Signed in: the server decides what is unlocked, so the page has to
      //  come back from the server. By mail: nothing is unlocked yet, and
      //  saying where to look next is the whole of the next step.
      if (signedIn) window.location.reload()
      else setMailed(email.trim())
    } catch { setErr(t.auth.err.network) } finally { setBusy(false) }
  }

  //  Back to this page with the form open, rather than off to a dashboard.
  function google() {
    const u = new URL(window.location.href)
    u.searchParams.set("join", "1")
    signIn("google", { callbackUrl: u.toString() })
  }

  const L = "font-lao"
  const labelStyle = { fontSize: 12, color: "var(--fg-4)" } as const
  const inputStyle = {
    borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)",
    padding: "11px 12px", fontSize: 14, color: "var(--fg)", width: "100%",
  } as const

  return createPortal(
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: "fixed", inset: 0, zIndex: 120, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(2,6,23,.62)", backdropFilter: "blur(3px)",
      }}
    >
      <div
        role="dialog" aria-modal="true"
        style={{
          width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto",
          background: "var(--surface)", border: "1px solid var(--line)",
          borderRadius: 18, padding: "24px 22px",
          boxShadow: "0 24px 70px rgba(2,6,23,.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 className={L} style={{ fontSize: 19, fontWeight: 800, color: "var(--fg)", margin: 0 }}>
              {mailed ? t.auth.mailedTitle : signedIn ? t.auth.fillTitle : t.auth.joinTitle}
            </h2>
            {!mailed && (
              <p className={L} style={{ fontSize: 12.5, color: "var(--fg-3)", margin: "6px 0 0", lineHeight: 1.7 }}>
                {signedIn ? t.auth.fillLead : t.auth.joinLead}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label={t.auth.close}
            style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: 8, cursor: "pointer",
              border: "1px solid var(--line)", background: "none", color: "var(--fg-3)",
              fontSize: 16, lineHeight: 1,
            }}>
            ×
          </button>
        </div>

        {mailed ? (
          <div style={{ marginTop: 18 }}>
            <p className={L} style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.9, margin: 0 }}>
              <b style={{ wordBreak: "break-all" }}>{mailed}</b>
              <br />
              {t.auth.mailedLead}
            </p>
            <p className={L} style={{ fontSize: 12, color: "var(--fg-4)", lineHeight: 1.8, margin: "12px 0 0" }}>
              {t.auth.mailedSpam}
            </p>
            <button onClick={onClose} className={L}
              style={{
                marginTop: 18, borderRadius: 10, border: "1px solid var(--line)",
                background: "none", color: "var(--fg-2)", padding: "11px 22px",
                fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              }}>
              {t.auth.close}
            </button>
          </div>
        ) : (
          <>
            {!signedIn && (
              <>
                <button type="button" onClick={google}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 11, cursor: "pointer", marginTop: 18,
                    border: "1px solid var(--line)", background: "var(--surface-2)",
                    fontSize: 14, fontWeight: 700, color: "var(--fg)",
                  }}>
                  <GoogleMark size={18} />
                  <span className={L}>{t.auth.google}</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 2px" }}>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span className={L} style={{ fontSize: 11.5, color: "var(--fg-4)" }}>{t.auth.orFill}</span>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>
              </>
            )}

            {signedIn && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginTop: 18,
                borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface-2)",
              }}>
                <GoogleMark size={16} />
                <span style={{
                  minWidth: 0, fontSize: 12.5, fontWeight: 700, color: "var(--fg)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {session?.user?.email}
                </span>
              </div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 16 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className={L} style={labelStyle}>{t.auth.name}</span>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
                  autoComplete="name" style={inputStyle} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className={L} style={labelStyle}>{t.auth.email}</span>
                {/*  Signed in, the address is Google's answer rather than a
                    field: editing it here would file the profile under an
                    address nobody has proved they hold. */}
                <input value={email} onChange={e => setEmail(e.target.value)} maxLength={120}
                  type="email" inputMode="email" autoComplete="email"
                  readOnly={signedIn} placeholder="you@example.com"
                  style={{ ...inputStyle, opacity: signedIn ? 0.65 : 1 }} />
              </label>

              <PhoneField
                label={t.auth.phone}
                searchLabel={t.auth.searchCountry}
                country={country}
                onCountry={c => { picked.current = true; setCountry(c) }}
                value={phone}
                onValue={setPhone}
              />

              <AvatarField
                label={t.auth.avatar}
                hint={t.auth.avatarHint}
                avatarId={avatarId}
                onAvatarId={id => { setAvatarId(id); setFile(null); setPreview("") }}
                preview={preview}
                onFile={pickFile}
              />

              <label style={{
                display: "flex", gap: 10, cursor: "pointer", padding: "11px 12px",
                borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)",
              }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
                <span className={L} style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--fg-2)" }}>
                  {t.auth.terms}{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer"
                    style={{ color: "var(--accent)", fontWeight: 700 }}>{t.auth.termsLink}</a>
                </span>
              </label>

              {err && (
                <p className={L} style={{
                  margin: 0, borderRadius: 9, padding: "9px 11px", fontSize: 12.5,
                  border: "1px solid rgba(220,38,38,.35)", background: "rgba(220,38,38,.08)", color: "#DC2626",
                }}>
                  {err}
                </p>
              )}

              {/* A button the size of the word on it. */}
              <button type="submit" disabled={!ready || busy}
                className={L} style={{
                  alignSelf: "flex-start", borderRadius: 10, border: "none",
                  padding: "12px 30px", cursor: ready && !busy ? "pointer" : "not-allowed",
                  background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff",
                  fontSize: 14, fontWeight: 800, opacity: ready && !busy ? 1 : 0.4,
                }}>
                {busy ? t.auth.sending : t.auth.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
