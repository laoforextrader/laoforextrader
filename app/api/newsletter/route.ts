import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }
    return NextResponse.json({ success: true, message: "Subscribed!" })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
