// TEMPORARY diagnostic — confirms which Sanity project/dataset the server's
// write vs read clients actually resolve to at runtime, and whether a write
// is readable back. DELETE THIS ROUTE after debugging.
import { NextResponse } from "next/server"
import { sanityWrite } from "@/lib/sanityWrite"
import { sanityClient } from "@/lib/sanity"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const wc: any = sanityWrite.config()
  const rc: any = sanityClient.config()

  let writeTest: any = null
  const id = "supportThread.debugprobe"
  try {
    await sanityWrite.createOrReplace({
      _id: id,
      _type: "supportThread",
      threadId: "debugprobe",
      status: "open",
      createdAt: new Date().toISOString(),
      messages: [{ _key: "k1", role: "admin", content: "debug probe", createdAt: new Date().toISOString() }],
      telegramMsgIds: [],
    })
    const viaRead  = await sanityClient.fetch(`*[_id == $id][0]{_id,_type}`, { id })
    const viaWrite = await sanityWrite.fetch(`*[_id == $id][0]{_id,_type}`, { id })
    await sanityWrite.delete(id).catch(() => null) // leave no trace
    writeTest = { wrote: true, readBackViaReadClient: viaRead, readBackViaWriteClient: viaWrite }
  } catch (e: any) {
    writeTest = { error: e?.message, statusCode: e?.statusCode }
  }

  return NextResponse.json({
    writeClient: { projectId: wc.projectId, dataset: wc.dataset, hasToken: !!wc.token, tokenLen: wc.token ? String(wc.token).length : 0 },
    readClient:  { projectId: rc.projectId, dataset: rc.dataset },
    env: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? null,
      NEXT_PUBLIC_SANITY_DATASET:    process.env.NEXT_PUBLIC_SANITY_DATASET ?? null,
      hasSanityApiToken:             !!process.env.SANITY_API_TOKEN,
    },
    writeTest,
  })
}
