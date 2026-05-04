import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "f8cr9afb",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 })

  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 })
  }

  try {
    const article = await client.fetch<{ _id: string } | null>(
      `*[_type == "article" && slug.current == $slug][0]{ _id }`,
      { slug }
    )
    if (!article?._id) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }
    await client
      .patch(article._id)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit({ visibility: "async" })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 })
  }
}
