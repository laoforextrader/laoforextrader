// TheRocket AI chat — streaming endpoint.
//
// Uses Claude Haiku 4.5 with prompt caching on the system instruction
// so each turn pays ~10% input cost after the first within the 5-min
// cache window. Streams Server-Sent Events; the client renders tokens
// as they arrive.

import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { SYSTEM_PROMPT } from "@/lib/chat/systemPrompt"
import { getSiteContext } from "@/lib/chat/siteContext"
import { checkAndIncrementQuota, type Tier } from "@/lib/chat/quota"
import { blindIndex } from "@/lib/pii"
import { saveChatTurn } from "@/lib/chat/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
}

const MODEL = "claude-haiku-4-5-20251001"
const MAX_OUTPUT_TOKENS = 800
const MAX_INPUT_MESSAGES = 24   // truncate conversation if it grows huge
const MAX_MESSAGE_CHARS  = 4000 // hard cap per message to prevent abuse

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

function tierFor(session: any): Tier {
  // TODO: when Pro membership is wired into the session (via Telegram
  // bot link or paid subscriber doc), promote to "pro". For now any
  // logged-in user gets the 30/day tier.
  if (session?.user?.id) return "user"
  return "guest"
}

function sseEncode(event: string, data: string): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${data}\n\n`)
}

export async function POST(req: NextRequest) {
  let body: ChatRequest
  try { body = await req.json() } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []
  if (incoming.length === 0) {
    return new Response("messages[] required", { status: 400 })
  }
  // Sanitize and trim
  const messages: ChatMessage[] = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .slice(-MAX_INPUT_MESSAGES)

  // The last message MUST be from the user — that's the one we're answering
  const last = messages[messages.length - 1]
  if (!last || last.role !== "user" || !last.content.trim()) {
    return new Response("last message must be from user", { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const tier = tierFor(session)
  const userId = (session?.user as any)?.id as string | undefined
  // The quota doc lives in the public dataset, so a guest's raw IP must never
  // reach it. A blind index still lands the same visitor in the same bucket.
  // If key material were ever missing, all guests share one bucket — the
  // quota tightens, which is the safe direction to fail.
  let guestBucket = "unkeyed"
  try { guestBucket = blindIndex(getClientIp(req), "chat-quota") } catch {}
  const key = userId ? `u:${userId}` : `ip:${guestBucket}`

  const quota = await checkAndIncrementQuota(key, tier)
  if (!quota.allowed) {
    return new Response(
      JSON.stringify({
        error: "quota_exceeded",
        used: quota.used, limit: quota.limit, tier: quota.tier,
      }),
      { status: 429, headers: { "content-type": "application/json" } },
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("[chat] ANTHROPIC_API_KEY not set in env")
    return new Response("ANTHROPIC_API_KEY missing — set it in .env.local and restart `npm run dev`", { status: 500 })
  }
  const client = new Anthropic({ apiKey })

  const stream = new ReadableStream({
    async start(controller) {
      // First event tells the client its current quota state
      controller.enqueue(sseEncode("meta", JSON.stringify({
        used: quota.used, limit: quota.limit, tier: quota.tier,
      })))

      let assistantText = ""
      try {
        // Build the full system: static prompt + dynamic site context
        // (brokers/articles from Sanity, cached 1h) + logged-in user
        // info if available. AI quotes the site inventory directly so
        // it stops claiming "I don't know" for things on the site.
        const siteCtx = await getSiteContext()
        const userBlock = session?.user?.name
          ? `\n\n## ຜູ້ໃຊ້ປະຈຸບັນ\n- ຊື່: ${session.user.name}${
              session.user.email ? `\n- Email: ${session.user.email}` : ""
            }`
          : ""
        const fullSystem = `${SYSTEM_PROMPT}\n\n${siteCtx}${userBlock}`

        const apiStream = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: fullSystem,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        })

        for await (const chunk of apiStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const delta = chunk.delta.text
            assistantText += delta
            controller.enqueue(sseEncode("delta", JSON.stringify({ text: delta })))
          }
        }

        controller.enqueue(sseEncode("done", JSON.stringify({ ok: true })))
      } catch (err: any) {
        // Log to terminal so the dev can see what went wrong; surface a
        // short, useful message to the client too.
        console.error("[chat] Anthropic stream error", {
          status: err?.status,
          message: err?.message,
          type: err?.type,
        })
        const msg =
          err?.status === 401 ? "Anthropic API key invalid — ກວດສອບ ANTHROPIC_API_KEY"
        : err?.status === 404 ? `Model '${MODEL}' not available on your API key`
        : err?.status === 400 ? `Invalid request: ${err.message}`
        : err?.message ?? "stream failed"
        controller.enqueue(sseEncode("error", JSON.stringify({ message: msg })))
      } finally {
        controller.close()

        // Persist conversation for logged-in users (fire-and-forget)
        if (userId && assistantText) {
          saveChatTurn({
            userId,
            userMessage:      last.content,
            assistantMessage: assistantText,
          }).catch(() => null)
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  })
}
