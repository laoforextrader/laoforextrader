"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { signIn, useSession } from "next-auth/react"
import { AVATARS, ContestAvatar } from "@/components/contest/avatars"
import { waNumber, waLooksValid } from "@/lib/contest/phone"

//  One floating form for joining the site.
//
//  Signing in with Google is a step inside it, not the whole of it: Google
//  returns an address and a display name, and the site still needs a number
//  to reach somebody on and a record that they accepted the EA licence. So
//  the form opens first, Google fills the top two fields, and the rest stays
//  to be filled in — the same form, with what is known already in place.
//
//  Deliberately not a page. Being bounced to /login and then to a dashboard
//  loses the thing the person was doing; a dialog puts them back where they
//  were when it closes.

const PROFILE_API = "/api/account/profile"

const ERR: Record<string, string> = {
  name: "ກະລຸນາໃສ່ຊື່",
  phone: "ເບີ WhatsApp ບໍ່ຖືກຕ້ອງ",
  optin: "ຕ້ອງຕິກຍອມຮັບເງື່ອນໄຂກ່ອນ",
  terms: "ຕ້ອງຕິກຍອມຮັບເງື່ອນໄຂກ່ອນ",
  "image-too-big": "ຮູບໃຫຍ່ເກີນໄປ",
  "image-type": "ຮັບສະເພາະ JPG, PNG ຫຼື WebP",
  upload: "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ",
  save: "ບັນທຶກບໍ່ສຳເລັດ ລອງໃໝ່",
  network: "ເຊື່ອມຕໍ່ບໍ່ໄດ້ ລອງໃໝ່",
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

  const [name, setName] = useState(initial?.name ?? "")
  const [lao, setLao] = useState(true)
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [avatarId, setAvatarId] = useState(initial?.avatarId ?? "")
  const [preview, setPreview] = useState(initial?.avatarUrl ?? "")
  const [file, setFile] = useState<Blob | null>(null)
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  //  Google knows the name; the person should not retype it. Only fills an
  //  empty box, so a name they chose here is never overwritten on a re-render.
  useEffect(() => {
    if (signedIn && !name && session?.user?.name) setName(session.user.name)
  }, [signedIn, session?.user?.name, name])

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

  const waNum = waNumber(phone, lao)
  const ready = signedIn && name.trim().length >= 2 && waLooksValid(waNum) && terms

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setErr("")
    try {
      const small = await shrink(f)
      setFile(small)
      setPreview(URL.createObjectURL(small))
      setAvatarId("")
    } catch { setErr(ERR["image-type"]) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(""); setBusy(true)
    try {
      const fd = new FormData()
      fd.set("name", name)
      fd.set("phone", waNum)
      fd.set("avatarId", avatarId)
      fd.set("optIn", terms ? "1" : "0")
      fd.set("termsVer", terms ? termsVer : "")
      if (file) fd.set("avatar", file, "avatar.jpg")
      const r = await fetch(PROFILE_API, { method: "POST", body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) { setErr(ERR[j.error as string] ?? ERR.save); return }
      //  Server components decide what is unlocked, so the page has to come
      //  back from the server before the download links appear.
      window.location.reload()
    } catch { setErr(ERR.network) } finally { setBusy(false) }
  }

  const L = "font-lao"

  //  Hung on <body>, not where it is written. The navbar has
  //  backdrop-filter, and any filtered element becomes the containing
  //  block for position:fixed inside it — so the dialog was being boxed
  //  into a 56px-tall bar and clipped. A portal is the fix; raising
  //  z-index is not.
  if (typeof document === "undefined") return null

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
          borderRadius: 18, padding: "26px 24px",
          boxShadow: "0 24px 70px rgba(2,6,23,.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 className={L} style={{ fontSize: 19, fontWeight: 800, color: "var(--fg)", margin: 0 }}>
              {signedIn ? "ຕື່ມຂໍ້ມູນສະມາຊິກ" : "ເຂົ້າສູ່ລະບົບ"}
            </h2>
            <p className={L} style={{ fontSize: 12.5, color: "var(--fg-3)", margin: "6px 0 0", lineHeight: 1.7 }}>
              {signedIn
                ? "ອີກສອງສາມຊ່ອງ ແລ້ວຈະເຫັນລິງກ໌ດາວໂຫຼດ EA"
                : "ເຂົ້າດ້ວຍ Google ກ່ອນ ແລ້ວຕື່ມຂໍ້ມູນຕໍ່ໃນຟອມນີ້"}
            </p>
          </div>
          <button onClick={onClose} aria-label="close"
            style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: 8, cursor: "pointer",
              border: "1px solid var(--line)", background: "none", color: "var(--fg-3)",
              fontSize: 16, lineHeight: 1,
            }}>
            ×
          </button>
        </div>

        {/* Step one. Stays visible afterwards, as the row that says who you are. */}
        <div style={{ margin: "18px 0 0" }}>
          {signedIn ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface-2)",
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: "rgba(22,163,74,.15)", color: "#16A34A",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}>✓</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session?.user?.email}
                </span>
                <span className={L} style={{ display: "block", fontSize: 11, color: "var(--fg-4)" }}>
                  ເຂົ້າດ້ວຍ Google ແລ້ວ
                </span>
              </span>
            </div>
          ) : (
            <button type="button" onClick={() => signIn("google")}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "13px 16px", borderRadius: 11, cursor: "pointer",
                border: "1px solid var(--line)", background: "var(--surface-2)",
                fontSize: 14, fontWeight: 700, color: "var(--fg)",
              }}>
              <img src="/email/google.png" alt="" width={18} height={18}
                style={{ display: "block" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
              <span className={L}>ເຂົ້າດ້ວຍ Google</span>
            </button>
          )}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18, opacity: signedIn ? 1 : 0.45, pointerEvents: signedIn ? "auto" : "none" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className={L} style={{ fontSize: 12, color: "var(--fg-4)" }}>ຊື່</span>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
              style={{
                borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)",
                padding: "11px 12px", fontSize: 14, color: "var(--fg)",
              }} />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span className={L} style={{ fontSize: 12, color: "var(--fg-4)" }}>ເບີ WhatsApp</span>
              <button type="button" onClick={() => { setLao(!lao); setPhone("") }}
                className={L} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11.5, fontWeight: 700, color: "var(--accent)",
                }}>
                {lao ? "ເບີຕ່າງປະເທດ" : "ເບີລາວ"}
              </button>
            </span>
            <span style={{ display: "flex" }}>
              {lao && (
                <span style={{
                  display: "flex", alignItems: "center", padding: "0 11px",
                  borderRadius: "9px 0 0 9px", border: "1px solid var(--line)", borderRight: "none",
                  background: "var(--surface-2)", fontFamily: "ui-monospace,monospace",
                  fontSize: 13.5, color: "var(--fg-3)",
                }}>
                  +856 20
                </span>
              )}
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel"
                placeholder={lao ? "9xxxxxxx" : "+66812345678"}
                style={{
                  flex: 1, minWidth: 0,
                  borderRadius: lao ? "0 9px 9px 0" : 9,
                  border: "1px solid var(--line)", background: "var(--bg)",
                  padding: "11px 12px", fontFamily: "ui-monospace,monospace",
                  fontSize: 14, color: "var(--fg)",
                }} />
            </span>
            {waNum.length >= 10 && (
              <span style={{ fontSize: 11, color: "var(--fg-4)", fontFamily: "ui-monospace,monospace" }}>
                → +{waNum}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className={L} style={{ fontSize: 12, color: "var(--fg-4)" }}>ຮູບໂປຣໄຟລ໌</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {preview && (
                <img src={preview} alt="" width={40} height={40}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className={L} style={{
                  borderRadius: 9, border: "1px solid var(--line)", background: "none",
                  padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "var(--fg-2)", cursor: "pointer",
                }}>
                ອັບໂຫຼດຮູບ
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={pick} style={{ display: "none" }} />
              <span className={L} style={{ fontSize: 11.5, color: "var(--fg-4)" }}>ຫຼື ເລືອກໄອຄອນ</span>
            </span>
            <span style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {AVATARS.slice(0, 18).map(a => (
                <button key={a.id} type="button"
                  onClick={() => { setAvatarId(a.id); setFile(null); setPreview("") }}
                  style={{
                    borderRadius: "50%", padding: 2, cursor: "pointer", background: "none",
                    border: avatarId === a.id ? "2px solid var(--accent)" : "2px solid transparent",
                    lineHeight: 0,
                  }}>
                  <ContestAvatar def={a} size={28} />
                </button>
              ))}
            </span>
          </div>

          {/* One tick, and it says only that (owner's call, 2026-11-22).
              Somebody joining the site is not necessarily here for an EA, so
              the box must not read like an EA licence; what accepting covers
              — email, trading risk, the EA terms if they use one — is set out
              on /terms, which is one tap away. */}
          <label style={{
            display: "flex", gap: 10, cursor: "pointer", padding: "11px 12px",
            borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)",
          }}>
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
            <span className={L} style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--fg-2)" }}>
              ຂ້ອຍໄດ້ອ່ານ ແລະ ຍອມຮັບ{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)", fontWeight: 700 }}>ເງື່ອນໄຂການໃຊ້ງານ</a>
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

          <button type="submit" disabled={!ready || busy}
            className={L} style={{
              borderRadius: 10, border: "none", padding: "13px 16px", cursor: ready ? "pointer" : "not-allowed",
              background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff",
              fontSize: 14, fontWeight: 800, opacity: ready && !busy ? 1 : 0.4,
            }}>
            {busy ? "ກຳລັງບັນທຶກ..." : "ສຳເລັດການສະໝັກ"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
