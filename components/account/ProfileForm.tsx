"use client"

import { useState } from "react"
import { AVATARS, ContestAvatar, avatarById } from "@/components/contest/avatars"
import AvatarField from "@/components/account/AvatarField"

//  The profile a member fills in once, after signing in with Google.
//
//  Signing in tells us an address. It does not tell us who the person is,
//  how to reach them when their account does something odd, or whether they
//  have read what the EA does — and all three are needed before handing
//  somebody a grid robot. The download links stay hidden until this is done.
//
//  The picture is resized in the browser before it is sent. A phone camera
//  produces four megabytes; what the site needs is a 256px square, so the
//  canvas does that work here and the upload is tens of kilobytes. Doing it
//  server-side would mean carrying the full file over a mobile connection
//  first, which is the slow part.

const AVATAR_PX = 256
const JPEG_Q = 0.85

async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = () => rej(new Error("image"))
      i.src = url
    })
    //  Square crop from the middle: a profile mark is round, and letterboxing
    //  a portrait photo into it looks like a mistake.
    const side = Math.min(img.width, img.height)
    const sx = (img.width - side) / 2
    const sy = (img.height - side) / 2
    const c = document.createElement("canvas")
    c.width = AVATAR_PX
    c.height = AVATAR_PX
    const ctx = c.getContext("2d")
    if (!ctx) throw new Error("canvas")
    ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_PX, AVATAR_PX)
    return await new Promise<Blob>((res, rej) =>
      c.toBlob(b => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", JPEG_Q))
  } finally {
    URL.revokeObjectURL(url)
  }
}

const ERR: Record<string, string> = {
  name: "ກະລຸນາໃສ່ຊື່",
  phone: "ເບີ WhatsApp ບໍ່ຖືກຕ້ອງ",
  optin: "ຕ້ອງຕິກຍອມຮັບກ່ອນ",
  terms: "ຕ້ອງຕິກຍອມຮັບເງື່ອນໄຂກ່ອນ",
  "image-too-big": "ຮູບໃຫຍ່ເກີນໄປ ລອງຮູບອື່ນ",
  "image-type": "ຮັບສະເພາະ JPG, PNG ຫຼື WebP",
  upload: "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ ລອງໃໝ່",
  save: "ບັນທຶກບໍ່ສຳເລັດ ລອງໃໝ່",
  signin: "ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່",
  network: "ເຊື່ອມຕໍ່ບໍ່ໄດ້ ລອງໃໝ່",
}

export default function ProfileForm({
  initialName, initialPhone, initialAvatarId, initialAvatarUrl, termsVer, done,
}: {
  initialName: string
  initialPhone: string
  initialAvatarId: string
  initialAvatarUrl: string
  termsVer: string
  /** True when a complete profile is already on file — the form opens closed. */
  done: boolean
}) {
  const [open, setOpen] = useState(!done)
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [avatarId, setAvatarId] = useState(initialAvatarId)
  const [preview, setPreview] = useState(initialAvatarUrl)
  const [file, setFile] = useState<Blob | null>(null)
  const [terms, setTerms] = useState(done)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [saved, setSaved] = useState(false)
  //  AvatarField owns the hidden <input type=file> now and hands over the
  //  File itself, so there is no element to hold a ref to here.
  async function pickAvatar(f: File) {
    setErr("")
    try {
      const small = await shrink(f)
      setFile(small)
      setPreview(URL.createObjectURL(small))
      setAvatarId("")
    } catch {
      setErr(ERR["image-type"])
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr("")
    setBusy(true)
    try {
      const fd = new FormData()
      fd.set("name", name)
      fd.set("phone", phone)
      fd.set("avatarId", avatarId)
      fd.set("optIn", terms ? "1" : "0")
      fd.set("termsVer", terms ? termsVer : "")
      if (file) fd.set("avatar", file, "avatar.jpg")
      const r = await fetch("/api/account/profile", { method: "POST", body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) {
        setErr(ERR[j.error as string] ?? ERR.save)
        return
      }
      setSaved(true)
      //  The download gate is rendered on the server, so the page has to come
      //  back from the server for the links to appear.
      window.location.reload()
    } catch {
      setErr(ERR.network)
    } finally {
      setBusy(false)
    }
  }

  const ready = name.trim().length >= 2 &&
    phone.replace(/[^\d]/g, "").length >= 8 && terms

  if (done && !open) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
        {preview
          ? <img src={preview} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          : <ContestAvatar def={avatarById(avatarId) ?? AVATARS[0]} size={40} />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-[var(--fg)]">{name}</span>
          <span className="block truncate text-[12px] text-[var(--fg-4)]">{phone}</span>
        </span>
        <button onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] font-semibold text-[var(--fg-2)]">
          ແກ້ໄຂ
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div>
        <h2 className="text-[16px] font-bold text-[var(--fg)]">ຂໍ້ມູນສະມາຊິກ</h2>
        <p className="mt-1 text-[12.5px] leading-[1.7] text-[var(--fg-4)]">
          ຕື່ມຂໍ້ມູນນີ້ໃຫ້ຄົບກ່ອນ ຈຶ່ງຈະເຫັນລິງກ໌ດາວໂຫຼດ EA ແລະ ຄຳສັ່ງຕິດຕັ້ງ
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[var(--fg-4)]">ຊື່</span>
        <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
          className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--fg)]" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[var(--fg-4)]">ເບີໂທ</span>
        <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" maxLength={24}
          placeholder="+8562012345678"
          className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-mono text-[14px] text-[var(--fg)]" />
      </label>

      {/* The same collapsed control as the join form: one mark, the grid
          only when it is tapped, + for a photograph. */}
      <AvatarField
        label="ຮູບໂປຣໄຟລ໌"
        hint="ກົດຮູບເພື່ອປ່ຽນ ຫຼື + ເພື່ອອັບໂຫຼດ"
        avatarId={avatarId}
        onAvatarId={id => { setAvatarId(id); setFile(null); setPreview("") }}
        preview={preview}
        onFile={pickAvatar}
      />

      {/* One tick only, matching the join form — what it covers is written
          on /terms rather than crammed into a label. */}
      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3">
        <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0" />
        <span className="text-[12.5px] leading-[1.7] text-[var(--fg-2)]">
          ຂ້ອຍໄດ້ອ່ານ ແລະ ຍອມຮັບ{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer"
            className="font-semibold text-[var(--accent,#2563EB)] underline underline-offset-2">
            ເງື່ອນໄຂການໃຊ້ງານ
          </a>
        </span>
      </label>

      {err && (
        <p className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-500">
          {err}
        </p>
      )}

      <button type="submit" disabled={busy || !ready || saved}
        className="rounded-lg bg-[var(--accent,#2563EB)] py-3 text-[13.5px] font-bold text-white disabled:opacity-40">
        {saved ? "ບັນທຶກແລ້ວ" : busy ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
      </button>
    </form>
  )
}
