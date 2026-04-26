import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { articleId, name, content } = body
    if (!articleId || !name || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    return NextResponse.json({ success: true, message: "Comment submitted" })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
