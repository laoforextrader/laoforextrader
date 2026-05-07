// Claude-powered Lao summary. Plain JSON output (no tools) keeps the
// generation snappy enough to fit Vercel's 60s nodejs cap.

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

function extractJson(text: string): any {
  // Strip markdown fences and trim
  const noFences = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim()
  const start = noFences.indexOf("{")
  const end = noFences.lastIndexOf("}")
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Claude response")
  }
  const body = noFences.slice(start, end + 1)
  // Try strict JSON first, then fall back to jsonrepair which handles
  // missing commas, trailing commas, smart quotes, unescaped newlines, etc.
  try {
    return JSON.parse(body)
  } catch {
    try {
      const repaired = jsonrepair(body)
      return JSON.parse(repaired)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}. Snippet: ${body.slice(0, 240)}`)
    }
  }
}

export async function summarizeDailyUpdate({ date, calendar, news }: SummarizeArgs): Promise<DailySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const client = new Anthropic({ apiKey })

  // Aggressive trim — fewer rows = smaller context = faster generation
  const importantEvents = calendar
    .filter(e => e.impact === "high" || e.impact === "medium")
    .slice(0, 6)
    .map(e => `- ${formatLaoTime(e.time)} ${e.country}/${e.impact}: ${e.event} (forecast=${e.forecast || "—"}, prev=${e.previous || "—"}, iso=${e.time})`)
    .join("\n")

  const newsLines = news.slice(0, 4).map((n, i) =>
    `[${i + 1}] ${n.title}\n${(n.summary || "").slice(0, 200)}\nURL: ${n.link}`,
  ).join("\n\n")

  const prompt = `ທ່ານເປັນນັກວິເຄາະ Forex ມືອາຊີບ ຂຽນພາສາລາວສັ້ນກະຊັບ. ມື້ນີ້ ${date}.

Economic events (high/medium):
${importantEvents || "(ບໍ່ມີ event ສຳຄັນ)"}

Forex news:
${newsLines || "(ບໍ່ມີຂ່າວ)"}

Return ONE valid JSON object — ATTENTION: ຄຳຕອບຕ້ອງມີ topEvents + calendarHighlights + hotNews + technical ຄົບທຸກ field. ຖ້າຕົກ field ໃດ ການແກ້ໄຂຈະຫຼົ້ມເຫຼວ.

Schema:
{
  "dailySummary": "2 ປະໂຫຍກສັ້ນ ສະຫຼຸບລວມ",
  "topEvents": [
    {
      "id": "kebab-case ສັ້ນ",
      "nameLao": "ຊື່ລາວສັ້ນ",
      "nameEn": "EN name",
      "currency": "USD",
      "country": "US",
      "time": "HH:MM",
      "timeISO": "ISO ຈາກ events ດ້ານເທິງ",
      "impact": "high",
      "forecast": "string",
      "previous": "string",
      "description": "1 ປະໂຫຍກລາວ",
      "analysis": "2 ປະໂຫຍກລາວ",
      "tradingGuidance": "1 ປະໂຫຍກລາວ"
    }
  ],
  "calendarHighlights": [
    { "name": "string", "time": "HH:MM", "impact": "high", "description": "1 ປະໂຫຍກລາວສັ້ນ" }
  ],
  "hotNews": [
    {
      "id": "kebab-case ສັ້ນ",
      "title": "ຫົວຂໍ້ລາວສັ້ນ",
      "summary": "1 ປະໂຫຍກລາວ",
      "detail": "3 ປະໂຫຍກລາວ",
      "source": "URL ຈາກຂ່າວ",
      "sourceTitle": "EN original",
      "imageUrl": "",
      "pubDate": ""
    }
  ],
  "technical": [
    { "symbol": "XAUUSD", "trend": "bullish", "bias": "ລາວສັ້ນ", "support": "ເລກ", "resistance": "ເລກ", "analysis": "1 ປະໂຫຍກລາວ" },
    { "symbol": "EURUSD", "trend": "neutral", "bias": "ລາວສັ້ນ", "support": "ເລກ", "resistance": "ເລກ", "analysis": "1 ປະໂຫຍກລາວ" }
  ],
  "hasHighImpact": true,
  "lineMessage": "ສັ້ນ ມີ Emoji"
}

ກົດ:
- topEvents: 2 ຕົວ (ຫາກບໍ່ມີ high impact ໃຫ້ array ຫວ່າງ [])
- calendarHighlights: 3 ຕົວ
- hotNews: 2 ຕົວ (ຕ້ອງມີ)
- technical: 2 ຕົວ XAUUSD ແລະ EURUSD (ຕ້ອງມີ)
- IDs ສັ້ນ kebab-case ບໍ່ມີວັນທີ
- ຫ້າມ trailing comma, ຫ້າມ ..., ຫ້າມ comment
- ສັ້ນທີ່ສຸດ ໃນທຸກ field

Output: ONLY the JSON object. No markdown fences. No prose.`

  const message = await client.messages.create(
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: 50_000 },
  )

  const textBlock = message.content.find(b => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text block")
  }
  const data = extractJson(textBlock.text)

  // Normalise — make sure arrays exist even if Claude omitted them
  return {
    dailySummary: data.dailySummary ?? "",
    topEvents: Array.isArray(data.topEvents) ? data.topEvents : [],
    calendarHighlights: Array.isArray(data.calendarHighlights) ? data.calendarHighlights : [],
    hotNews: Array.isArray(data.hotNews) ? data.hotNews : [],
    technical: Array.isArray(data.technical) ? data.technical : [],
    hasHighImpact: !!data.hasHighImpact,
    lineMessage: data.lineMessage ?? "",
  }
}
