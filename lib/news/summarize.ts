// Claude-powered Lao summary. Runs two smaller calls in parallel
// instead of one large call so neither one fills its max_tokens
// budget mid-generation. Plain JSON output with jsonrepair fallback.

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
  lineMessage: string
}

interface SummarizeArgs {
  date: string
  calendar: CalendarEvent[]
  news: NewsItem[]
}

// ── Lao language guidelines shared by both prompts ─────────────────────────
// These are intentionally specific; Claude tends to slide into Thai-flavoured
// Lao without an explicit reminder. Add concrete do/don't pairs here when
// the operator spots problems.
const LAO_STYLE = `ກົດການຂຽນພາສາລາວ (ສຳຄັນ):
- ໃຊ້ພາສາລາວແທ້ ຫ້າມປົນຄຳໄທ ຫຼື ບາລີ-ສັນສະກິດ
- ໃຊ້ຄຳສາມັນ ກະຊັບ ບໍ່ໃຊ້ສຳນວນຍາວ
- ໃຊ້ "ມື້ນີ້", "ຄາດວ່າ", "ສົ່ງຜົນຕໍ່", "ຄວນຈັບຕາ" — ບໍ່ໃຊ້ "วันนี้", "คาดว่า"
- ບໍ່ແປຄຳ Forex jargon (NFP, GDP, CPI, FOMC, Fed, ECB, USD ແລະ pair ຕ່າງໆ ໃຫ້ຄົງ EN)
- ຕົວເລກໃຊ້ Arabic numeral (07:30, 4.5%) ບໍ່ໃຊ້ເລກລາວ
- ເວລາທຸກອັນ = ICT (UTC+7 / GMT+7) — ຫ້າມໃຊ້ UTC ຫຼື timezone ອື່ນ
- ປະໂຫຍກສັ້ນ — ຫ້າມຍາວເກີນ 25 ຄຳຕໍ່ປະໂຫຍກ`

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
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: 45_000 },
  )
  const textBlock = message.content.find(b => b.type === "text")
  if (!textBlock || textBlock.type !== "text") throw new Error("No text block")
  return extractJson(textBlock.text)
}

// ── Call A: events / summary / line ─────────────────────────────────────────

interface CallAResult {
  dailySummary: string
  topEvents: TopEvent[]
  calendarHighlights: CalendarHighlight[]
  hasHighImpact: boolean
  lineMessage: string
}

function buildPromptA(date: string, eventLines: string): string {
  return `ທ່ານເປັນນັກວິເຄາະ Forex ຂຽນພາສາລາວ. ມື້ນີ້ ${date}.

${LAO_STYLE}

Economic events (ICT, high/medium):
${eventLines || "(ບໍ່ມີ event ສຳຄັນ)"}

Return ONE valid JSON ດ້ວຍ schema ນີ້:

{
  "dailySummary": "2 ປະໂຫຍກສັ້ນ ສະຫຼຸບລວມມື້ນີ້",
  "topEvents": [
    {
      "id": "kebab-case ສັ້ນ ບໍ່ມີວັນທີ",
      "nameLao": "ຊື່ event ເປັນລາວ ສັ້ນ",
      "nameEn": "EN name",
      "currency": "USD/EUR/GBP/...",
      "country": "US/EU/GB/...",
      "time": "HH:MM ICT",
      "timeISO": "ISO ຈາກ events ຂ້າງເທິງ (field iso)",
      "impact": "high",
      "forecast": "string ຫຼື —",
      "previous": "string ຫຼື —",
      "description": "1 ປະໂຫຍກລາວ ບອກວ່າ event ນີ້ຄືຫຍັງ ມີຜົນຫຍັງ",
      "analysis": "2 ປະໂຫຍກລາວ ວິເຄາະ Forecast vs Previous ແລະ scenario",
      "tradingGuidance": "1 ປະໂຫຍກລາວ ແນວທາງເທຣດ + Manage Risk"
    }
  ],
  "calendarHighlights": [
    { "name": "ຊື່ ສັ້ນ", "time": "HH:MM", "impact": "high|medium|low", "description": "1 ປະໂຫຍກລາວ" }
  ],
  "hasHighImpact": true,
  "lineMessage": "ສັ້ນ ມີ Emoji ບໍ່ເກີນ 5 ບັນທັດ — ຖ້າເອ່ຍເຖິງເວລາ ໃຫ້ໃສ່ ICT"
}

ກົດ:
- topEvents: 2 ຕົວ (ຖ້າມີ high impact). ຫາກບໍ່ມີ ໃຫ້ array ຫວ່າງ [].
- calendarHighlights: 3 ຕົວ
- ຫ້າມ trailing comma. ຫ້າມ ... ໃນ output. ຫ້າມ comment.

Return ONLY the JSON object. No markdown fences. No prose.`
}

async function runCallA(client: Anthropic, date: string, calendar: CalendarEvent[]): Promise<CallAResult> {
  const eventLines = calendar
    .filter(e => e.impact === "high" || e.impact === "medium")
    .slice(0, 6)
    .map(e => `- ${formatLaoTime(e.time)} ${e.country}/${e.impact}: ${e.event} (forecast=${e.forecast || "—"}, prev=${e.previous || "—"}, iso=${e.time})`)
    .join("\n")

  const data = await callClaude(client, buildPromptA(date, eventLines), 2200)
  return {
    dailySummary: data.dailySummary ?? "",
    topEvents: Array.isArray(data.topEvents) ? data.topEvents : [],
    calendarHighlights: Array.isArray(data.calendarHighlights) ? data.calendarHighlights : [],
    hasHighImpact: !!data.hasHighImpact,
    lineMessage: data.lineMessage ?? "",
  }
}

// ── Call B: hot news + technical ────────────────────────────────────────────

interface CallBResult {
  hotNews: HotNewsItem[]
  technical: TechAnalysis[]
}

function buildPromptB(date: string, eventBrief: string, newsLines: string): string {
  return `ທ່ານເປັນນັກວິເຄາະ Forex ຂຽນພາສາລາວ. ມື້ນີ້ ${date}.

${LAO_STYLE}

ບໍລິບົດ events ມື້ນີ້:
${eventBrief || "(ບໍ່ມີ event ສຳຄັນ)"}

Forex news (ໃຫ້ເລືອກ 2 ຂ່າວທີ່ສຳຄັນທີ່ສຸດ):
${newsLines || "(ບໍ່ມີຂ່າວ)"}

Return ONE valid JSON:

{
  "hotNews": [
    {
      "id": "kebab-case ສັ້ນ",
      "title": "ຫົວຂໍ້ລາວສັ້ນ ດຶງດູດ",
      "summary": "1 ປະໂຫຍກລາວ",
      "detail": "3 ປະໂຫຍກລາວ — ຄວາມເປັນມາ + ຄວາມໝາຍຕໍ່ Trader",
      "source": "URL ຈາກຂ່າວ",
      "sourceTitle": "EN original title",
      "imageUrl": "",
      "pubDate": ""
    }
  ],
  "technical": [
    { "symbol": "XAUUSD", "trend": "bullish|bearish|neutral", "bias": "ລາວສັ້ນ 1 ປະໂຫຍກ", "support": "ເລກ", "resistance": "ເລກ", "analysis": "1 ປະໂຫຍກລາວ ເຊື່ອມໂຍງກັບຂ່າວ/events" },
    { "symbol": "EURUSD", "trend": "bullish|bearish|neutral", "bias": "ລາວສັ້ນ 1 ປະໂຫຍກ", "support": "ເລກ", "resistance": "ເລກ", "analysis": "1 ປະໂຫຍກລາວ ເຊື່ອມໂຍງກັບຂ່າວ/events" }
  ]
}

ກົດ:
- hotNews: 2 ຕົວສະເໝີ
- technical: ຕ້ອງມີທັງ XAUUSD ແລະ EURUSD
- ID ສັ້ນ kebab-case ບໍ່ມີວັນທີ
- ຫ້າມ trailing comma, ຫ້າມ ..., ຫ້າມ comment

Return ONLY the JSON object.`
}

async function runCallB(client: Anthropic, date: string, eventBrief: string, news: NewsItem[]): Promise<CallBResult> {
  const newsLines = news.slice(0, 4).map((n, i) =>
    `[${i + 1}] ${n.title}\n${(n.summary || "").slice(0, 200)}\nURL: ${n.link}`,
  ).join("\n\n")

  const data = await callClaude(client, buildPromptB(date, eventBrief, newsLines), 1800)
  return {
    hotNews: Array.isArray(data.hotNews) ? data.hotNews : [],
    technical: Array.isArray(data.technical) ? data.technical : [],
  }
}

// ── Public entry — runs both calls in parallel ──────────────────────────────

export async function summarizeDailyUpdate({ date, calendar, news }: SummarizeArgs): Promise<DailySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")
  const client = new Anthropic({ apiKey })

  // Compact event brief for Call B context
  const eventBrief = calendar
    .filter(e => e.impact === "high" || e.impact === "medium")
    .slice(0, 4)
    .map(e => `${formatLaoTime(e.time)} ${e.country}: ${e.event}`)
    .join(" · ")

  const [callA, callB] = await Promise.all([
    runCallA(client, date, calendar),
    runCallB(client, date, eventBrief, news),
  ])

  return {
    dailySummary:        callA.dailySummary,
    topEvents:           callA.topEvents,
    calendarHighlights:  callA.calendarHighlights,
    hotNews:             callB.hotNews,
    technical:           callB.technical,
    hasHighImpact:       callA.hasHighImpact,
    lineMessage:         callA.lineMessage,
  }
}
