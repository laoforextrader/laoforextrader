import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  articleId:  z.string(),
  authorName: z.string().min(1),
  body:       z.string().min(3).max(2000),
})

// GET: fetch comments for an article
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get("articleId")
  if (!articleId) return NextResponse.json({ comments: [] })

  // TODO: connect to DB (Supabase / PlanetScale)
  return NextResponse.json({ comments: [] })
}

// POST: add a comment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    // TODO: save to DB
    return NextResponse.json({ success: true, comment: { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() } })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
