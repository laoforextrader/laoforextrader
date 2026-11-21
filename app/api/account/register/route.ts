import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { sanityWrite } from "@/lib/sanityWrite"
import { blindIndex, piiReady } from "@/lib/pii"
import { upsertSubscriber, saveProfile } from "@/lib/subscribers"
import { loginToken, loginUrl, newNonce } from "@/lib/account/loginLink"
import { sendEmail } from "@/lib/newsletter/send"

//  Joining without Google.
//
//  Same form, same fields, different proof: Google vouches for an address,
//  and when nobody does, the mailbox has to. The profile is written straight
//  away so nothing is retyped, but it is written unverified and nothing is
//  unlocked until the link in the email is opened — which is also what signs
//  them in, so there is no password to invent, forget or leak.
//
//  Deliberately tells the caller nothing about who is already registered. An
//  address that exists gets the same "check your mail" as one that doesn't;
//  the difference only shows in the mailbox of whoever owns it.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_IMAGE = 400_000
const MAX_NAME = 60
const MAX_PHONE = 24

//  Per-instance and therefore leaky on a platform that runs many of them —
//  but a loop hitting one instance is the shape this actually sees, and the
//  cost of being wrong is somebody's inbox.
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 6

function tooMany(key: string): boolean {
  const now = Date.now()
  const seen = (HITS.get(key) ?? []).filter(t => now - t < WINDOW_MS)
  seen.push(now)
  HITS.set(key, seen)
  if (HITS.size > 500) for (const [k, v] of HITS) if (!v.some(t => now - t < WINDOW_MS)) HITS.delete(k)
  return seen.length > MAX_PER_WINDOW
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function mailBody(name: string, url: string) {
  const safeName = name.replace(/[<>&]/g, "")
  const html = `<!doctype html><html><body style="margin:0;background:#F1F5F9;padding:28px 14px;font-family:'Noto Sans Lao',Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px 30px">
  <tr><td style="font-size:12px;font-weight:700;letter-spacing:.12em;color:#64748B">LAOFOREXTRADER</td></tr>
  <tr><td style="padding-top:12px;font-size:21px;font-weight:800;color:#0F172A">ຢືນຢັນການສະໝັກ</td></tr>
  <tr><td style="padding-top:12px;font-size:14px;line-height:1.9;color:#334155">
    ສະບາຍດີ ${safeName} — ກົດປຸ່ມລຸ່ມນີ້ເພື່ອຢືນຢັນອີເມວ ແລະ ເຂົ້າສູ່ລະບົບ. ລິງກ໌ນີ້ໃຊ້ໄດ້ຄັ້ງດຽວ ພາຍໃນ 24 ຊົ່ວໂມງ.
  </td></tr>
  <tr><td style="padding-top:22px">
    <a href="${url}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 26px;border-radius:10px">ຢືນຢັນ ແລະ ເຂົ້າສູ່ລະບົບ</a>
  </td></tr>
  <tr><td style="padding-top:20px;font-size:12px;line-height:1.8;color:#64748B">
    ຖ້າປຸ່ມກົດບໍ່ໄດ້ ໃຫ້ກັອບລິງກ໌ນີ້ໃສ່ບຣາວເຊີ:<br><span style="color:#2563EB;word-break:break-all">${url}</span>
  </td></tr>
  <tr><td style="padding-top:22px;border-top:1px solid #E2E8F0;font-size:11.5px;line-height:1.8;color:#94A3B8">
    ຖ້າທ່ານບໍ່ໄດ້ສະໝັກ ບໍ່ຕ້ອງເຮັດຫຍັງ — ບໍ່ມີບັນຊີໃດຖືກເປີດຈົນກວ່າລິງກ໌ນີ້ຖືກກົດ.
  </td></tr>
</table></td></tr></table></body></html>`
  const text = `ສະບາຍດີ ${safeName}\n\nຢືນຢັນອີເມວ ແລະ ເຂົ້າສູ່ລະບົບ:\n${url}\n\nລິງກ໌ໃຊ້ໄດ້ຄັ້ງດຽວ ພາຍໃນ 24 ຊົ່ວໂມງ.\nຖ້າທ່ານບໍ່ໄດ້ສະໝັກ ບໍ່ຕ້ອງເຮັດຫຍັງ.`
  return { html, text }
}

export async function POST(req: Request) {
  if (!piiReady() || !process.env.SANITY_API_TOKEN)
    return NextResponse.json({ ok: false, error: "save" }, { status: 500 })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 })
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 120)
  const name = String(form.get("name") ?? "").trim().slice(0, MAX_NAME)
  const phone = String(form.get("phone") ?? "").trim().slice(0, MAX_PHONE)
  const avatarId = String(form.get("avatarId") ?? "").trim().slice(0, 40)
  const termsVer = String(form.get("termsVer") ?? "").trim().slice(0, 20)

  if (name.length < 2) return NextResponse.json({ ok: false, error: "name" }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "email" }, { status: 400 })
  if (phone.replace(/\D/g, "").length < 8)
    return NextResponse.json({ ok: false, error: "phone" }, { status: 400 })
  if (!termsVer) return NextResponse.json({ ok: false, error: "terms" }, { status: 400 })

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  if (tooMany(blindIndex(ip, "register")) || tooMany(blindIndex(email, "register")))
    return NextResponse.json({ ok: false, error: "too-many" }, { status: 429 })

  //  The member document has to exist before the profile can be written onto
  //  it, and `verified` stays false until the link is opened.
  const made = await upsertSubscriber({ email, name, source: "newsletter", verified: false })
  if (!made) return NextResponse.json({ ok: false, error: "save" }, { status: 500 })

  let avatarAssetId: string | undefined
  const file = form.get("avatar")
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const blob = file as File
    if (blob.size > MAX_IMAGE)
      return NextResponse.json({ ok: false, error: "image-too-big" }, { status: 400 })
    if (blob.size > 0) {
      if (!/^image\/(jpeg|png|webp)$/.test(blob.type))
        return NextResponse.json({ ok: false, error: "image-type" }, { status: 400 })
      try {
        const buf = Buffer.from(await blob.arrayBuffer())
        const asset = await sanityWrite.assets.upload("image", buf, {
          filename: "avatar.jpg", contentType: blob.type,
        })
        avatarAssetId = asset._id
      } catch {
        return NextResponse.json({ ok: false, error: "upload" }, { status: 502 })
      }
    }
  }

  const saved = await saveProfile({
    email, name, phone, avatarId, avatarAssetId, optIn: true, termsVer,
  })
  if (!saved) return NextResponse.json({ ok: false, error: "save" }, { status: 500 })

  //  One live link per member: issuing a new one invalidates the last.
  const emailHash = blindIndex(email, "subscriber")
  const nonce = newNonce()
  try {
    const doc = await sanityWrite.fetch<{ _id: string } | null>(
      `*[_type == "subscriber" && emailHash == $emailHash][0]{ _id }`, { emailHash })
    if (!doc) return NextResponse.json({ ok: false, error: "save" }, { status: 500 })
    await sanityWrite.patch(doc._id)
      .set({ loginNonce: nonce, loginNonceAt: new Date().toISOString() })
      .commit()
  } catch {
    return NextResponse.json({ ok: false, error: "save" }, { status: 500 })
  }

  const { html, text } = mailBody(name, loginUrl(loginToken(emailHash, nonce)))
  const sent = await sendEmail({
    to: email,
    subject: "ຢືນຢັນການສະໝັກ · LaoForexTrader",
    html, text, emailHash,
  })
  if (!sent.ok) return NextResponse.json({ ok: false, error: "mail" }, { status: 502 })

  return NextResponse.json({ ok: true })
}
