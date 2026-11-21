import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sanityWrite } from "@/lib/sanityWrite"
import { saveProfile } from "@/lib/subscribers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

//  Save the member profile the download gate checks.
//
//  The picture arrives already resized: the browser draws it to a canvas at
//  256px and sends a JPEG, so what crosses the wire is tens of kilobytes
//  instead of the four megabytes a phone camera produces. The limit below is
//  the backstop for anyone posting to this route by hand.
const MAX_IMAGE = 400_000      // ~400 KB, far above a 256px JPEG
const MAX_NAME = 60
const MAX_PHONE = 24

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ ok: false, error: "signin" }, { status: 401 })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 })
  }

  const name = String(form.get("name") ?? "").trim().slice(0, MAX_NAME)
  const phone = String(form.get("phone") ?? "").trim().slice(0, MAX_PHONE)
  const avatarId = String(form.get("avatarId") ?? "").trim().slice(0, 40)
  const optIn = String(form.get("optIn") ?? "") === "1"
  const termsVer = String(form.get("termsVer") ?? "").trim().slice(0, 20)

  //  Said plainly so the form can point at the field, rather than a single
  //  "invalid" that leaves the person guessing which box is wrong.
  if (name.length < 2) return NextResponse.json({ ok: false, error: "name" }, { status: 400 })
  if (phone.replace(/[^\d]/g, "").length < 8)
    return NextResponse.json({ ok: false, error: "phone" }, { status: 400 })
  if (!optIn) return NextResponse.json({ ok: false, error: "optin" }, { status: 400 })
  if (!termsVer) return NextResponse.json({ ok: false, error: "terms" }, { status: 400 })

  //  Upload first: a failed upload must not leave a profile pointing at an
  //  asset that does not exist.
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
          filename: "avatar.jpg",
          contentType: blob.type,
        })
        avatarAssetId = asset._id
      } catch {
        return NextResponse.json({ ok: false, error: "upload" }, { status: 502 })
      }
    }
  }

  const ok = await saveProfile({
    email, name, phone, avatarId, avatarAssetId, optIn, termsVer,
  })
  if (!ok) return NextResponse.json({ ok: false, error: "save" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
