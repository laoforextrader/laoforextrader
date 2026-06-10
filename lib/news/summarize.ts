// Two-stage Claude pipeline for the daily news/calendar summary.
//
// Stage 1 — two parallel writers (events/summary + hot news/technical)
// read the English source and *rewrite* (not translate) into rough Lao.
// Stage 2 — a polisher pass reviews every Lao field and produces a
// cleaner native version, fixing Thai-shaped words, awkward grammar,
// and unnatural literal translations.
//
// Both stages use Haiku 4.5 for speed; the prompts are scoped so each
// call stays small.

import Anthropic from "@anthropic-ai/sdk"
import { jsonrepair } from "jsonrepair"
import type { CalendarEvent, NewsItem } from "./sources"
import { formatLaoTime } from "./sources"

export interface TopEvent {
  id: string
  nameLao: string
  nameEn: string
  currency: string
  country: string
  time: string
  timeISO: string
  impact: "high" | "medium" | "low"
  forecast: string
  previous: string
  description: string
  analysis: string
  tradingGuidance: string
}

export interface HotNewsItem {
  id: string
  title: string
  summary: string
  detail: string
  source: string
  sourceTitle: string
  imageUrl: string
  pubDate: string
}

export interface TechAnalysis {
  symbol: string
  trend: "bullish" | "bearish" | "neutral"
  bias: string
  support: string
  resistance: string
  analysis: string
}

export interface CalendarHighlight {
  name: string
  time: string
  impact: "high" | "medium" | "low"
  description: string
}

export interface DailySummary {
  dailySummary: string
  topEvents: TopEvent[]
  calendarHighlights: CalendarHighlight[]
  hotNews: HotNewsItem[]
  technical: TechAnalysis[]
  hasHighImpact: boolean
  /** Stricter than hasHighImpact — only tier-1 market movers (gates LINE push). */
  isVeryHighImpact: boolean
  lineMessage: string
}

interface SummarizeArgs {
  date: string
  calendar: CalendarEvent[]
  news: NewsItem[]
}

// ── Lao writing philosophy (shared by all prompts) ─────────────────────────
const LAO_PHILOSOPHY = `LAO LANGUAGE PHILOSOPHY (read carefully — this is the most important rule):

Do NOT translate word-by-word. Translating literally produces broken Lao.

Instead:
1. READ and UNDERSTAND the English source.
2. WRITE in Lao the way a Lao journalist would explain it to a Lao reader.
3. Use natural Lao phrasing — even if the structure differs from English.

Vocabulary rules:
- Use PURE LAO words. NEVER use Thai-shaped words even when the spelling
  is similar. Think of Google Translate Lao or a Lao dictionary as the
  reference, not your training data which mixes Thai and Lao.
- Examples of Wrong → Right (these errors actually appeared in our output — DO NOT repeat):
    ❌ ກະຍາບາທ                          ✅ ດຸນການຄ້າ           (trade balance)
    ❌ ຕະຫຼາດແລກປ换ຊື້ຂາຍ (Chinese 换!) ✅ ຕະຫຼາດ Forex
    ❌ ໂຄງການໂຮງງານ                     ✅ Factory Orders
    ❌ ຫລຸດລົງຄາດ (incomplete)           ✅ ຫຼຸດລົງຫຼາຍກວ່າຄາດ
    ❌ ตลาด / ຕະຫລາດ (Thai-feel)        ✅ ຕະຫຼາດ
    ❌ วันนี้ (Thai)                     ✅ ມື້ນີ້
    ❌ นักลงทุน                          ✅ ນັກລົງທຶນ
    ❌ ผันผวน                            ✅ ຜັນຜວນ
    ❌ ค่าเงิน                           ✅ ຄ່າເງິນ

CRITICAL: Lao text must contain ONLY Lao script, Latin letters, digits,
spaces, and standard punctuation. Chinese, Thai, or any other script
characters are forbidden. If unsure of a Lao word — keep the English
term instead of inventing one.

Common Forex/economic Lao terms (canonical):
    trade balance       = ດຸນການຄ້າ
    inflation           = ເງິນເຟີ້
    interest rate       = ອັດຕາດອກເບ້ຍ
    central bank        = ທະນາຄານກາງ
    rate cut / hike     = ຫຼຸດ / ຂຶ້ນ ອັດຕາດອກເບ້ຍ
    weaker than expected= ອ່ອນກວ່າຄາດ / ຕ່ຳກວ່າຄາດ
    stronger than ...   = ດີກວ່າຄາດ / ສູງກວ່າຄາດ
    forex market        = ຕະຫຼາດ Forex
    Factory Orders, NFP, CPI, GDP, PMI, FOMC = keep in English
- DO NOT translate proper nouns / Forex jargon. Keep these in English:
    Country: US, UK, Eurozone, Japan, Canada, Australia, Switzerland
    City: London, Tokyo, New York, Frankfurt
    People: Powell, Lagarde, de Guindos, Collins
    Brand: Fed, ECB, BoE, RBA, BoJ, FOMC, NBC, BBH, BNY, Reuters, FXStreet
    Indicator: NFP, CPI, GDP, PMI, GDP, ISM
    Currency: USD, EUR, GBP, JPY, AUD, NZD, CAD, CHF, XAUUSD, EURUSD, etc.
    Numbers: Always Arabic (07:30, 4.5%, 1.0850).

Time / Style:
- All times are GMT+7 (Lao local). Never write "ICT" or "UTC".
- Sentences must be short and direct. Max ~25 words per sentence.
- No Thai sentence enders (ครับ/ค่ะ/นะ).
- Active voice. Don't transliterate Thai grammar.

SELF-CHECK BEFORE RETURNING:
After writing each Lao sentence, re-read it and ask:
1. Are there any non-Lao non-Latin characters? Remove them.
2. Does the wording sound translated/wooden? Rewrite naturally.
3. Are proper nouns and Forex jargon kept in English? Fix if not.
4. Does any "word" look invented or strange? Replace with English.`

// ── JSON helpers ───────────────────────────────────────────────────────────

function extractJson(text: string): any {
  const noFences = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
  const start = noFences.indexOf("{")
  const end = noFences.lastIndexOf("}")
  if (start === -1 || end === -1) throw new Error("No JSON object found")
  const body = noFences.slice(start, end + 1)
  try { return JSON.parse(body) }
  catch {
    try { return JSON.parse(jsonrepair(body)) }
    catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}. Snippet: ${body.slice(0, 240)}`)
    }
  }
}

async function callClaude(client: Anthropic, prompt: string, maxTokens: number) {
  const message = await client.messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: 45_000 },
  )
  const textBlock = message.content.find(b => b.type === "text")
  if (!textBlock || textBlock.type !== "text") throw new Error("No text block")
  return extractJson(textBlock.text)
}

// Strip any character outside Lao script, Latin letters, digits, common
// punctuation, and a small whitelist of symbols/emoji. Catches Chinese
// (换), Thai-only consonants, Korean, etc. that occasionally bleed in.
const ALLOWED_CHAR_RE = /[຀-໿ -~ -ÿ -⁯‐-‧\n\t📊📰🔥📉📈⚠️💡✨🇺🇸🇪🇺🇬🇧🇯🇵🇦🇺🇨🇦🇨🇭🇳🇿🌐🪙🚀⚡▲▼●→←·]/u
function sanitizeLao(text: string | undefined): string {
  if (!text) return ""
  // Whitelist approach: keep Lao + Latin + digits + standard punctuation
  // + emoji + general punctuation, strip everything else (CJK, Korean,
  // Japanese, Thai, Khmer, Devanagari, Tamil, Bengali, Tibetan, Myanmar,
  // Hebrew, Arabic, etc.)
  let out = ""
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    if (
      // ASCII printable + whitespace
      (code >= 0x20 && code <= 0x7E) || code === 0x0A || code === 0x09 ||
      // Latin-1 supplement / Latin Extended
      (code >= 0xA0 && code <= 0x024F) ||
      // Combining diacritical marks
      (code >= 0x0300 && code <= 0x036F) ||
      // Lao block
      (code >= 0x0E80 && code <= 0x0EFF) ||
      // General punctuation (em-dash, smart quotes, ellipsis, etc.)
      (code >= 0x2000 && code <= 0x206F) ||
      // Currency symbols
      (code >= 0x20A0 && code <= 0x20CF) ||
      // Letterlike symbols
      (code >= 0x2100 && code <= 0x214F) ||
      // Arrows
      (code >= 0x2190 && code <= 0x21FF) ||
      // Math operators (subset)
      (code >= 0x2200 && code <= 0x22FF) ||
      // Misc symbols + dingbats
      (code >= 0x2600 && code <= 0x27BF) ||
      // Variation selectors
      (code >= 0xFE00 && code <= 0xFE0F) ||
      // Emoji (extended pictographic ranges)
      (code >= 0x1F000 && code <= 0x1FBFF) ||
      // Regional indicator symbols (flags)
      (code >= 0x1F1E6 && code <= 0x1F1FF)
    ) {
      out += ch
    }
  }
  return out
}
const _ALLOWED_CHAR_RE_UNUSED = /[຀-໿]/u
void _ALLOWED_CHAR_RE_UNUSED

// ── Calendar filter / ranking ──────────────────────────────────────────────
// We only feed Claude majors (USD/EUR/GBP/JPY/CHF/AUD/CAD/NZD pairs +
// gold) and rank high-impact above medium so flagship releases like NFP
// don't get pushed out of the prompt by quieter morning events.
const MAJOR_COUNTRIES = new Set(["US", "EU", "GB", "UK", "JP", "CH", "AU", "CA", "NZ"])
const IMPACT_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

// Tier-1 = the US flagship releases that actually move every major pair.
// The LINE broadcast fires ONLY for these (not every "high" impact tag, which
// forex calendars apply very liberally) to stay well inside the LINE free
// quota — roughly 4-5 pushes a month. Add other countries' releases here, or
// loosen the keyword list, if you want broader coverage at higher frequency.
const TIER1_EVENT_RE = /\b(non[ -]?farm|nfp|cpi|consumer price index|fomc|federal funds|fed funds rate|interest rate decision|rate decision|core pce|pce price)\b/i

// Scans the FULL calendar (not just the 8 fed to the prompt) so a tier-1
// release ranked past the cutoff still triggers the broadcast. US-only.
function hasVeryHighImpact(calendar: CalendarEvent[]): boolean {
  return calendar.some(e =>
    (e.country || "").toUpperCase() === "US" &&
    e.impact === "high" &&
    TIER1_EVENT_RE.test(e.event || ""),
  )
}

function pickPromptEvents(calendar: CalendarEvent[], limit: number): CalendarEvent[] {
  return calendar
    .filter(e => MAJOR_COUNTRIES.has((e.country || "").toUpperCase()))
    .filter(e => e.impact === "high" || e.impact === "medium")
    .slice() // copy before sort
    .sort((a, b) => {
      const ra = IMPACT_RANK[a.impact] ?? 9
      const rb = IMPACT_RANK[b.impact] ?? 9
      if (ra !== rb) return ra - rb
      return (a.time || "").localeCompare(b.time || "")
    })
    .slice(0, limit)
}

// ── Stage 1A: events + summary + line ──────────────────────────────────────

interface CallAResult {
  dailySummary: string
  topEvents: TopEvent[]
  calendarHighlights: CalendarHighlight[]
  hasHighImpact: boolean
  lineMessage: string
}

function buildPromptA(date: string, eventLines: string): string {
  return `You are writing the daily Forex briefing for native Lao traders. Today is ${date}.

${LAO_PHILOSOPHY}

Approach:
- Read the English economic events below.
- For each high-impact event, EXPLAIN to a Lao trader: what it is, what it could mean, how to handle risk.
- Write naturally in Lao — do not translate sentence-for-sentence.

Economic events (already shifted to GMT+7):
${eventLines || "(no important event today)"}

Return ONE valid JSON with this schema:

{
  "dailySummary": "2 short Lao sentences — what to watch today",
  "topEvents": [
    {
      "id": "kebab-case slug, no date",
      "nameLao": "Lao name (or keep EN if proper noun)",
      "nameEn": "EN name",
      "currency": "USD/EUR/GBP/etc.",
      "country": "US/EU/GB/etc.",
      "time": "HH:MM GMT+7",
      "timeISO": "ISO from event field 'iso'",
      "impact": "high",
      "forecast": "string or —",
      "previous": "string or —",
      "description": "1 Lao sentence — what this event is and why it matters",
      "analysis": "2 Lao sentences — interpret forecast vs previous + scenarios",
      "tradingGuidance": "1 Lao sentence — how to trade + manage risk"
    }
  ],
  "calendarHighlights": [
    { "name": "short", "time": "HH:MM", "impact": "high|medium|low", "description": "1 Lao sentence" }
  ],
  "hasHighImpact": true,
  "lineMessage": "Short Lao broadcast with emoji, ≤5 lines. If you mention time, write GMT+7"
}

Constraints:
- hasHighImpact: MUST be true if ANY event line above has "/high:" tag. Do not guess — check the impact tag literally.
- topEvents: 2 items if there is any high impact event (pick the most market-moving high-impact ones, e.g. NFP > Fed speech). Otherwise [].
- calendarHighlights: 3 items, and EVERY high-impact event must be among them.
- lineMessage: REQUIRED whenever hasHighImpact=true. Mention the high-impact event name + currency + time.
- No trailing commas, no "...", no comments.
- Return only the JSON object — no markdown fences, no prose around it.`
}

// Finnhub returns "YYYY-MM-DD HH:MM:SS" (UTC). JS Date parses that as
// browser-local, not UTC, which broke the countdown on /news. Reshape
// to proper ISO 8601 with the Z suffix before handing it to Claude so
// the value Claude copies into `timeISO` is unambiguous.
function toIsoZ(finnhubTime: string): string {
  if (!finnhubTime) return ""
  if (finnhubTime.includes("T")) return finnhubTime // already ISO
  return finnhubTime.replace(" ", "T") + "Z"
}

async function runCallA(client: Anthropic, date: string, calendar: CalendarEvent[]): Promise<CallAResult> {
  const promptEvents = pickPromptEvents(calendar, 8)
  const eventLines = promptEvents
    .map(e => `- ${formatLaoTime(e.time)} ${e.country}/${e.impact}: ${e.event} (forecast=${e.forecast || "—"}, prev=${e.previous || "—"}, iso=${toIsoZ(e.time)})`)
    .join("\n")

  const data = await callClaude(client, buildPromptA(date, eventLines), 1700)

  // Don't trust Claude alone for the high-impact flag — Finnhub already
  // tells us authoritatively. If any major-country event is impact=high,
  // force the flag so the LINE broadcast never gets silently skipped.
  const highMajors = promptEvents.filter(e => e.impact === "high")
  const hasHighImpact = highMajors.length > 0 || !!data.hasHighImpact

  // If Claude returned hasHighImpact=true but no lineMessage (or vice
  // versa), synthesise a fallback so the broadcast carries something.
  let lineMessage = (data.lineMessage ?? "").toString()
  if (hasHighImpact && !lineMessage.trim()) {
    const headline = highMajors[0]
    if (headline) {
      lineMessage = `📊 ມື້ນີ້ ${formatLaoTime(headline.time)} GMT+7 — ${headline.country} ${headline.event} (high impact). ລະວັງຄວາມຜັນຜວນຂອງຄ່າເງິນ.`
    }
  }

  // Normalise timeISO on every event Claude returns. Claude has been
  // observed to pass through Finnhub's space-separated format even
  // after we asked for iso=…Z — fix it here so callers can trust the
  // field is parseable as UTC.
  const topEvents = (Array.isArray(data.topEvents) ? data.topEvents : []).map((e: TopEvent) => ({
    ...e,
    timeISO: toIsoZ(e.timeISO ?? ""),
  }))

  return {
    dailySummary: data.dailySummary ?? "",
    topEvents,
    calendarHighlights: Array.isArray(data.calendarHighlights) ? data.calendarHighlights : [],
    hasHighImpact,
    lineMessage,
  }
}

// ── Stage 1B: hot news + technical ─────────────────────────────────────────

interface CallBResult {
  hotNews: HotNewsItem[]
  technical: TechAnalysis[]
}

function buildPromptB(date: string, eventBrief: string, newsLines: string): string {
  return `You are writing for Lao Forex traders. Today is ${date}.

${LAO_PHILOSOPHY}

Approach:
- Pick the 2 most important news items.
- READ each English article carefully and REWRITE in Lao as a Lao journalist would.
- Don't translate sentence-for-sentence — explain the meaning and impact.

Today's important events for context:
${eventBrief || "(no important event)"}

Forex news (English source):
${newsLines || "(no news)"}

Return ONE valid JSON:

{
  "hotNews": [
    {
      "id": "kebab-case slug, no date",
      "title": "Catchy Lao headline",
      "summary": "1 Lao sentence",
      "detail": "3 Lao sentences — context + meaning for Lao trader",
      "source": "Use the URL: field of the chosen news",
      "sourceTitle": "EN original title",
      "imageUrl": "Use the IMG: field of the chosen news (or '' if empty)",
      "pubDate": ""
    }
  ],
  "technical": [
    { "symbol": "XAUUSD", "trend": "bullish|bearish|neutral", "bias": "1 short Lao sentence", "support": "number", "resistance": "number", "analysis": "1 Lao sentence linking news/events" },
    { "symbol": "EURUSD", "trend": "bullish|bearish|neutral", "bias": "1 short Lao sentence", "support": "number", "resistance": "number", "analysis": "1 Lao sentence linking news/events" }
  ]
}

Constraints:
- Always 2 hotNews items.
- Always XAUUSD + EURUSD in technical.
- ID slugs short, no dates.
- No trailing commas, no "...", no comments.
- Return only the JSON object.`
}

async function runCallB(client: Anthropic, date: string, eventBrief: string, news: NewsItem[]): Promise<CallBResult> {
  const newsLines = news.slice(0, 4).map((n, i) =>
    `[${i + 1}] ${n.title}\n${(n.summary || "").slice(0, 200)}\nURL: ${n.link}\nIMG: ${n.imageUrl || ""}`,
  ).join("\n\n")

  // Lao text is token-heavy (~1.5x ASCII) and the response carries 2
  // hotNews (≈3-sentence detail each) + 2 technical entries. 1400 was
  // truncating mid-JSON, jsonrepair recovered hotNews[0] but technical
  // got lost. 2400 is safer; still well under the per-call budget.
  const data = await callClaude(client, buildPromptB(date, eventBrief, newsLines), 2400)
  // Hard-correct image + source URLs from the original feed so Claude
  // can't accidentally drop or fabricate them.
  const hot: HotNewsItem[] = (Array.isArray(data.hotNews) ? data.hotNews : []).map((h: HotNewsItem) => {
    const src = news.find(n => n.link === h.source)
    return {
      ...h,
      source: src?.link || h.source || "",
      imageUrl: src?.imageUrl || h.imageUrl || "",
      pubDate: src?.pubDate || h.pubDate || "",
    }
  })

  // Final-resort placeholder so the Technical section on /news never
  // disappears even when Claude returns an empty/truncated response.
  const technical: TechAnalysis[] = Array.isArray(data.technical) && data.technical.length > 0
    ? data.technical
    : [
        { symbol: "XAUUSD", trend: "neutral", bias: "ລໍຖ້າສັນຍານຊັດເຈນຈາກຕະຫຼາດກ່ອນເຂົ້າອອເດີ.", support: "—", resistance: "—", analysis: "ຍັງບໍ່ມີຂໍ້ມູນພຽງພໍ — ຕິດຕາມຂ່າວ US ກ່ອນເຄື່ອນໄຫວ." },
        { symbol: "EURUSD", trend: "neutral", bias: "ບໍ່ຄວນຈັບສັນຍານໄວເກີນໄປ.", support: "—", resistance: "—", analysis: "ລໍຖ້າຕົວເລກເສດຖະກິດໃໝ່ກ່ອນຕັດສິນທິດທາງ." },
      ]

  return { hotNews: hot, technical }
}

// ── Stage 2: Lao language polish ───────────────────────────────────────────

interface PolishInput {
  dailySummary: string
  lineMessage: string
  topEventsText: Array<{ description: string; analysis: string; tradingGuidance: string }>
  hotNewsText: Array<{ title: string; summary: string; detail: string }>
  technicalText: Array<{ bias: string; analysis: string }>
  highlightsText: Array<{ description: string }>
}

async function polishLao(client: Anthropic, input: PolishInput): Promise<PolishInput> {
  const prompt = `You are a senior Lao language editor reviewing a forex briefing draft. Your job is to make every sentence sound like genuine native Lao writing.

${LAO_PHILOSOPHY}

Editor instructions:
1. For every Lao sentence below, check:
   - Does it use Thai-shaped words? Replace them with pure Lao.
   - Does it sound translated/wooden? Rewrite naturally.
   - Is the grammar correct?
   - Does it keep proper nouns / Forex jargon in English?
2. Preserve the meaning. Do not add or remove information.
3. Keep the same length roughly. Do not expand into long paragraphs.
4. Return the polished version in EXACTLY the same JSON structure as the input.

Draft to polish:
${JSON.stringify(input, null, 2)}

Return ONE valid JSON object with the same shape (dailySummary, lineMessage, topEventsText[], hotNewsText[], technicalText[], highlightsText[]). Polished Lao only. No prose, no markdown fences.`

  try {
    const data = await callClaude(client, prompt, 2500)
    return {
      dailySummary: data.dailySummary ?? input.dailySummary,
      lineMessage: data.lineMessage ?? input.lineMessage,
      topEventsText: Array.isArray(data.topEventsText) ? data.topEventsText : input.topEventsText,
      hotNewsText: Array.isArray(data.hotNewsText) ? data.hotNewsText : input.hotNewsText,
      technicalText: Array.isArray(data.technicalText) ? data.technicalText : input.technicalText,
      highlightsText: Array.isArray(data.highlightsText) ? data.highlightsText : input.highlightsText,
    }
  } catch {
    // If polish fails, fall back to the unpolished draft so the run
    // still produces a usable output.
    return input
  }
}

function applyPolish(callA: CallAResult, callB: CallBResult, polished: PolishInput): { callA: CallAResult; callB: CallBResult } {
  return {
    callA: {
      ...callA,
      dailySummary: polished.dailySummary,
      lineMessage: polished.lineMessage,
      topEvents: callA.topEvents.map((e, i) => ({
        ...e,
        description: polished.topEventsText[i]?.description ?? e.description,
        analysis: polished.topEventsText[i]?.analysis ?? e.analysis,
        tradingGuidance: polished.topEventsText[i]?.tradingGuidance ?? e.tradingGuidance,
      })),
      calendarHighlights: callA.calendarHighlights.map((c, i) => ({
        ...c,
        description: polished.highlightsText[i]?.description ?? c.description,
      })),
    },
    callB: {
      ...callB,
      hotNews: callB.hotNews.map((h, i) => ({
        ...h,
        title: polished.hotNewsText[i]?.title ?? h.title,
        summary: polished.hotNewsText[i]?.summary ?? h.summary,
        detail: polished.hotNewsText[i]?.detail ?? h.detail,
      })),
      technical: callB.technical.map((t, i) => ({
        ...t,
        bias: polished.technicalText[i]?.bias ?? t.bias,
        analysis: polished.technicalText[i]?.analysis ?? t.analysis,
      })),
    },
  }
}

// ── Public entry ───────────────────────────────────────────────────────────

export async function summarizeDailyUpdate({ date, calendar, news }: SummarizeArgs): Promise<DailySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")
  const client = new Anthropic({ apiKey })

  const eventBrief = pickPromptEvents(calendar, 4)
    .map(e => `${formatLaoTime(e.time)} ${e.country}: ${e.event}`)
    .join(" · ")

  // Stage 1 — parallel writers
  const [draftA, draftB] = await Promise.all([
    runCallA(client, date, calendar),
    runCallB(client, date, eventBrief, news),
  ])

  // Sonnet 4.6 in Stage 1 produces high-quality Lao on the first pass —
  // the polish stage is skipped to keep total runtime under Vercel's
  // 60s budget. sanitizeLao() strips any Chinese / Korean / Japanese /
  // Thai characters that occasionally bleed in.
  const callA = draftA
  const callB = draftB

  return {
    dailySummary:        sanitizeLao(callA.dailySummary),
    topEvents:           callA.topEvents.map(e => ({
      ...e,
      nameLao:         sanitizeLao(e.nameLao),
      description:     sanitizeLao(e.description),
      analysis:        sanitizeLao(e.analysis),
      tradingGuidance: sanitizeLao(e.tradingGuidance),
    })),
    calendarHighlights:  callA.calendarHighlights.map(c => ({
      ...c,
      description: sanitizeLao(c.description),
    })),
    hotNews:             callB.hotNews.map(h => ({
      ...h,
      title:   sanitizeLao(h.title),
      summary: sanitizeLao(h.summary),
      detail:  sanitizeLao(h.detail),
    })),
    technical:           callB.technical.map(t => ({
      ...t,
      bias:     sanitizeLao(t.bias),
      analysis: sanitizeLao(t.analysis),
    })),
    hasHighImpact:       callA.hasHighImpact,
    isVeryHighImpact:    hasVeryHighImpact(calendar),
    lineMessage:         sanitizeLao(callA.lineMessage),
  }
}
