import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sanityWrite } from "@/lib/sanityWrite"
import { sanityClient } from "@/lib/sanity"

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId")
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 })

  try {
    const comments = await sanityClient.fetch(
      `*[_type == "comment" && article._ref == $articleId && approved == true] | order(createdAt desc) {
        _id, userName, userImage, content, createdAt
      }`,
      { articleId }
    )
    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { articleId, content } = await req.json()
  if (!articleId || !content?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 })
  }
  const trimmed: string = content.trim()
  if (trimmed.length > 2000) {
    return NextResponse.json({ error: "comment too long" }, { status: 400 })
  }

  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json({ error: "SANITY_API_TOKEN not configured" }, { status: 500 })
  }

  try {
    const userId = (session.user as any).id ?? ""
    const createdAt = new Date().toISOString()

    const created = await sanityWrite.create({
      _type: "comment",
      article: { _type: "reference", _ref: articleId },
      userId,
      userName: session.user.name ?? "Guest",
      userImage: session.user.image ?? "",
      userEmail: session.user.email ?? "",
      content: trimmed,
      createdAt,
      approved: true,
    })

    return NextResponse.json({
      comment: {
        _id: created._id,
        userName: session.user.name ?? "Guest",
        userImage: session.user.image ?? "",
        content: trimmed,
        createdAt,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "server error" }, { status: 500 })
  }
}
