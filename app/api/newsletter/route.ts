import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    // TODO: connect to Mailchimp / ConvertKit / Resend
    console.log("Newsletter signup:", email)

    return NextResponse.json({ success: true, message: "ສະໝັກສຳເລັດ!" })
  } catch {
    return NextResponse.json({ success: false, message: "ອີເມວບໍ່ຖືກຕ້ອງ" }, { status: 400 })
  }
}
