import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sanityWrite } from "@/lib/sanityWrite"
import { sanityClient } from "@/lib/sanity"

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId")
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 })

  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  try {
    const count = await sanityClient.fetch<number>(
      `count(*[_type == "like" && article._ref == $articleId])`,
      { articleId }
    )
    const liked = userId
      ? await sanityClient.fetch<number>(
          `count(*[_type == "like" && article._ref == $articleId && userId == $userId])`,
          { articleId, userId }
        ) > 0
      : false

    return NextResponse.json({ count, liked })
  } catch {
    return NextResponse.json({ count: 0, liked: false })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { articleId } = await req.json()
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 })

  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json({ error: "SANITY_API_TOKEN not configured" }, { status: 500 })
  }

  try {
    const existing = await sanityWrite.fetch<{ _id: string }[]>(
      `*[_type == "like" && article._ref == $articleId && userId == $userId]{ _id }`,
      { articleId, userId }
    )

    if (existing.length > 0) {
      await sanityWrite.delete(existing[0]._id)
    } else {
      await sanityWrite.create({
        _type: "like",
        article: { _type: "reference", _ref: articleId },
        userId,
        userEmail: session.user.email ?? "",
        createdAt: new Date().toISOString(),
      })
    }

    const count = await sanityWrite.fetch<number>(
      `count(*[_type == "like" && article._ref == $articleId])`,
      { articleId }
    )

    return NextResponse.json({ liked: existing.length === 0, count })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "server error" }, { status: 500 })
  }
}
