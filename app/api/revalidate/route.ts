import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  try {
    revalidatePath("/", "layout")
    revalidatePath("/education", "layout")
    revalidatePath("/ea-tools", "layout")
    revalidatePath("/broker", "layout")
    revalidatePath("/news", "layout")
    revalidatePath("/analysis", "layout")

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 })
  }
}
