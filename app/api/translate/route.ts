import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { pickLang } from "@/lib/i18n/lang"

//  Translate the Lao that is already on the page.
//
//  The menus and forms come from lib/i18n/dict.ts, written by hand. Articles,
//  lessons, broker reviews and every heading inside a page do not — there
//  are thousands of them, they change weekly, and a dictionary would mean a
//  code change per article. So the page sends the Lao it is showing and gets
//  Thai or English back.
//
//  Three things keep this from being expensive:
//
//    · only strings containing Lao letters are ever sent (the caller filters)
//    · every answer is cached in this instance's memory and in the reader's
//      localStorage, so a page read twice costs nothing the second time
//    · Haiku, at temperature 0, in batches — one call per forty strings
//
//  Translation of a UI is not prose translation: the answer has to be the
//  same length and shape as what it replaces, or a button stops fitting. The
//  prompt says so, and says to leave trading terms in English, which is what
//  MT5 and every broker statement call them anyway.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "claude-haiku-4-5-20251001"
const MAX_TEXTS = 60
const MAX_CHARS = 9000

//  Warm instances answer most requests from here. Bounded so a long-running
//  instance cannot grow without limit.
const CACHE = new Map<string, string>()
const CACHE_MAX = 8000

function cacheGet(k: string) { return CACHE.get(k) }
function cacheSet(k: string, v: string) {
  if (CACHE.size >= CACHE_MAX) {
    //  Oldest first — Map keeps insertion order.
    const first = CACHE.keys().next().value
    if (first !== undefined) CACHE.delete(first)
  }
  CACHE.set(k, v)
}

const SYSTEM = `You translate user-interface and article text for a Lao Forex education site.

Rules:
- The source is Lao. Translate into the target language only.
- Keep the same register and roughly the same length. This text sits in buttons, headings and cards; a translation twice as long breaks the layout.
- Leave trading and platform terms in English exactly as they appear: Forex, lot, pip, spread, equity, drawdown, Stop Loss, Take Profit, EA, Expert Advisor, grid, backtest, MT4, MT5, MetaTrader, VPS, broker names, product names (TheRocket, SGrid, MegiHedge, MegiSemi, HostGrid, LaoForexTrader, LFT).
- Keep every number, percentage, currency amount, date and URL exactly as given.
- Do not add, explain, soften or omit anything. No quotation marks around the result.
- If a string is already in the target language or has nothing to translate, return it unchanged.

You are given a JSON array of strings. Reply with a JSON array of the same length, in the same order, and nothing else.`

const LANG_NAME: Record<string, string> = { th: "Thai", en: "English", lo: "Lao" }

export async function POST(req: Request) {
  let body: { lang?: string; texts?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 })
  }

  const lang = pickLang(body.lang)
  const texts = Array.isArray(body.texts) ? body.texts.map(t => String(t ?? "")) : []
  if (lang === "lo" || !texts.length) return NextResponse.json({ ok: true, out: texts })
  if (texts.length > MAX_TEXTS)
    return NextResponse.json({ ok: false, error: "too-many" }, { status: 400 })
  if (texts.reduce((n, t) => n + t.length, 0) > MAX_CHARS)
    return NextResponse.json({ ok: false, error: "too-long" }, { status: 400 })

  //  Answer what we already know, and ask only about the rest.
  const out: string[] = new Array(texts.length)
  const askIdx: number[] = []
  const ask: string[] = []
  texts.forEach((t, i) => {
    const hit = cacheGet(`${lang}\u0000${t}`)
    if (hit !== undefined) out[i] = hit
    else { askIdx.push(i); ask.push(t) }
  })

  if (!ask.length) return NextResponse.json({ ok: true, out })

  const apiKey = process.env.ANTHROPIC_API_KEY
  //  No key is not an error the reader should see: the page simply stays in
  //  Lao, which is the language it was written in.
  if (!apiKey) {
    askIdx.forEach((i, n) => { out[i] = ask[n] })
    return NextResponse.json({ ok: true, out, translated: false })
  }

  try {
    const client = new Anthropic({ apiKey })
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Target language: ${LANG_NAME[lang]}\n\n${JSON.stringify(ask)}`,
      }],
    })

    const raw = res.content
      .map(c => (c.type === "text" ? c.text : ""))
      .join("")
      .trim()
    //  The model occasionally wraps the array in a fenced block; take the
    //  array itself rather than failing the whole page over a backtick.
    const start = raw.indexOf("[")
    const end = raw.lastIndexOf("]")
    const parsed = start >= 0 && end > start ? JSON.parse(raw.slice(start, end + 1)) : null

    if (!Array.isArray(parsed) || parsed.length !== ask.length) {
      askIdx.forEach((i, n) => { out[i] = ask[n] })
      return NextResponse.json({ ok: true, out, translated: false })
    }

    askIdx.forEach((i, n) => {
      const v = typeof parsed[n] === "string" && parsed[n].trim() ? String(parsed[n]) : ask[n]
      out[i] = v
      cacheSet(`${lang}\u0000${ask[n]}`, v)
    })
    return NextResponse.json({ ok: true, out, translated: true })
  } catch {
    askIdx.forEach((i, n) => { out[i] = ask[n] })
    return NextResponse.json({ ok: true, out, translated: false })
  }
}
