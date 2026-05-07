// Claude-powered Lao summary. Uses the Anthropic SDK with a single
// tool definition so we get clean structured output back instead of
// having to parse free-form JSON from a text response.

import Anthropic from "@anthropic-ai/sdk"
import type { CalendarEvent, NewsItem } from "./sources"
import { formatLaoTime } from "./sources"

export interface TopEvent {
  id: string                   // slug like "nfp-usd"
  nameLao: string
  nameEn: string
  currency: string
  country: string
  time: string                 // HH:MM Lao
  timeISO: string              // ISO from raw Finnhub event
  impact: "high" | "medium" | "low"
  forecast: string
  previous: string
  description: string          // 1-2 sentences ลาว
  analysis: string             // 3-4 sentences ลาว
  tradingGuidance: string      // 2-3 sentences ลาว
}

export interface HotNewsItem {
  id: string
  title: string                // ລາວ
  summary: string              // ລາວ short
  detail: string               // ລາວ longer (article body style)
  source: string
  sourceTitle: string          // EN original
  imageUrl: string
  pubDate: string
}

export interface TechAnalysis {
  symbol: string               // "XAUUSD" | "EURUSD"
  trend: "bullish" | "bearish" | "neutral"
  bias: string                 // ลาวสั้น
  support: string
  resistance: string
  analysis: string             // ลาว 2-3 sentences
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

const SUMMARY_TOOL: Anthropic.Tool = {
  name: "save_daily_summary",
  description: "Save the comprehensive daily Forex summary for laoforextrader.com followers in Lao language.",
  input_schema: {
    type: "object",
    properties: {
      dailySummary: {
        type: "string",
        description: "ສະຫຼຸບລວມ 2-3 ປະໂຫຍກ ພາສາລາວ ງ່າຍໆ ບອກວ່າມື້ນີ້ Trader ຄວນຈັບຕາຫຍັງ",
      },

      topEvents: {
        type: "array",
        description: "2 high-impact events ທີ່ສຳຄັນທີ່ສຸດໃນວັນນີ້ — ໃຫ້ analysis + trading guidance ລະອຽດ ຖ້າບໍ່ມີ high impact ໃຫ້ array ຫວ່າງ",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "kebab-case slug (no date), e.g. nfp-usd or trade-balance-aud" },
            nameLao: { type: "string", description: "ຊື່ event ພາສາລາວ" },
            nameEn: { type: "string", description: "Event name in English (from raw)" },
            currency: { type: "string", description: "USD/EUR/GBP/etc" },
            country: { type: "string" },
            time: { type: "string", description: "HH:MM ICT" },
            timeISO: { type: "string", description: "Pass through the original ISO time from raw" },
            impact: { type: "string", enum: ["high", "medium"] },
            forecast: { type: "string" },
            previous: { type: "string" },
            description: { type: "string", description: "1-2 ປະໂຫຍກ ບອກວ່າ event ນີ້ຄືຫຍັງ ມີຜົນຕໍ່ Forex ແນວໃດ" },
            analysis: { type: "string", description: "3-4 ປະໂຫຍກ ລາວ ວິເຄາະ Forecast vs Previous ແລະ scenario ຕ່າງໆ" },
            tradingGuidance: { type: "string", description: "2-3 ປະໂຫຍກ ລາວ ບອກແນວທາງເທຣດ pair ໃດ ເວລາໃດ ຄວບຄຸມ Risk ແນວໃດ" },
          },
          required: ["id", "nameLao", "nameEn", "currency", "time", "timeISO", "impact", "description", "analysis", "tradingGuidance"],
        },
      },

      calendarHighlights: {
        type: "array",
        description: "3 events ສຳຄັນສຳລັບ pills ໃນໜ້າຫຼັກ (ສັ້ນ)",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "ສັ້ນ EN ຫຼື ລາວ" },
            time: { type: "string", description: "HH:MM ICT" },
            impact: { type: "string", enum: ["high", "medium", "low"] },
            description: { type: "string", description: "1 ປະໂຫຍກ ລາວ" },
          },
          required: ["name", "time", "impact"],
        },
      },

      hotNews: {
        type: "array",
        description: "2 hot news ສຳຄັນທີ່ສຸດ ແປເປັນລາວ + detail ສຳລັບໜ້າລະອຽດ",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "kebab-case slug (no date)" },
            title: { type: "string", description: "ຫົວຂໍ້ ລາວ ສັ້ນ ດຶງດູດ" },
            summary: { type: "string", description: "ສະຫຼຸບ 2 ປະໂຫຍກ ລາວ" },
            detail: { type: "string", description: "ເນື້ອຫາ 4-6 ປະໂຫຍກ ລາວ ຄ້າຍບົດຄວາມ ມີ context ແລະ implication ສຳລັບ Trader" },
            source: { type: "string", description: "Source URL — pass through" },
            sourceTitle: { type: "string", description: "Original EN title — pass through" },
            imageUrl: { type: "string", description: "Image URL ຖ້າມີ ຫຼື ຫວ່າງ" },
            pubDate: { type: "string" },
          },
          required: ["id", "title", "summary", "detail"],
        },
      },

      technical: {
        type: "array",
        description: "Technical analysis ສຳລັບ XAUUSD ແລະ EURUSD (ໃຊ້ knowledge ຂອງເຈົ້າ + context ຂ່າວ)",
        items: {
          type: "object",
          properties: {
            symbol: { type: "string", enum: ["XAUUSD", "EURUSD"] },
            trend: { type: "string", enum: ["bullish", "bearish", "neutral"] },
            bias: { type: "string", description: "ລາວ 1 ປະໂຫຍກ ສັ້ນ ບອກ trend overall" },
            support: { type: "string", description: "ຕົວເລກ support level ປະມານ" },
            resistance: { type: "string", description: "ຕົວເລກ resistance level ປະມານ" },
            analysis: { type: "string", description: "ລາວ 2-3 ປະໂຫຍກ ວິເຄາະ momentum + ການເຊື່ອມໂຍງກັບຂ່າວ" },
          },
          required: ["symbol", "trend", "bias", "support", "resistance", "analysis"],
        },
      },

      hasHighImpact: { type: "boolean" },
      lineMessage: {
        type: "string",
        description: "ຂໍ້ຄວາມສຳລັບ LINE Broadcast — ສັ້ນ ດຶງດູດ ມີ Emoji ບໍ່ເກີນ 5 ບັນທັດ",
      },
    },
    required: ["dailySummary", "topEvents", "calendarHighlights", "hotNews", "technical", "hasHighImpact", "lineMessage"],
  },
}

interface SummarizeArgs {
  date: string
  calendar: CalendarEvent[]
  news: NewsItem[]
}

export async function summarizeDailyUpdate({ date, calendar, news }: SummarizeArgs): Promise<DailySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const client = new Anthropic({ apiKey })

  // Pre-filter aggressively — anything Claude doesn't see costs zero tokens
  // and shaves seconds off generation time
  const importantEvents = calendar
    .filter(e => e.impact === "high" || e.impact === "medium")
    .slice(0, 8)
    .map(e => ({
      event: e.event,
      time: e.time,
      impact: e.impact,
      forecast: e.forecast,
      previous: e.previous,
      country: e.country,
      time_lao: formatLaoTime(e.time),
    }))

  const newsForPrompt = news.slice(0, 5).map(n => ({
    title: n.title,
    summary: n.summary?.slice(0, 240) ?? "",
    link: n.link,
  }))

  const prompt = `ທ່ານເປັນນັກວິເຄາະ Forex ມືອາຊີບທີ່ຂຽນໃຫ້ Trader ລາວ ໃຊ້ພາສາລາວທີ່ສະອາດ ຖືກຕ້ອງ ບໍ່ປົນຄຳໄທ.
ມື້ນີ້ (${date}):

🗓 Economic Calendar (high/medium impact):
${importantEvents.length ? JSON.stringify(importantEvents, null, 2) : "(ບໍ່ມີ event ສຳຄັນ)"}

📰 Forex News:
${newsForPrompt.length ? newsForPrompt.map((n, i) => `[${i+1}] ${n.title}\n   URL: ${n.link}\n   ${n.summary}`).join("\n\n") : "(ຍັງບໍ່ມີຂ່າວໃໝ່)"}

ກະລຸນາສ້າງ:

1. dailySummary — 2-3 ປະໂຫຍກ ສະຫຼຸບລວມ
2. topEvents — 2 events ທີ່ມີ impact ສູງສຸດ ໃຫ້ description (1-2 ປະໂຫຍກ) + analysis (3-4 ປະໂຫຍກ) + tradingGuidance (2-3 ປະໂຫຍກ). ຖ້າບໍ່ມີ high impact ໃຫ້ array ຫວ່າງ.
3. calendarHighlights — 3 events ສຳຄັນສຳລັບ pills (ສັ້ນ)
4. hotNews — 2 ຂ່າວ ສຳຄັນທີ່ສຸດ ແປເປັນລາວ ມີ summary ສັ້ນ + detail ຍາວ (ຄ້າຍບົດຄວາມ 4-6 ປະໂຫຍກ)
5. technical — ວິເຄາະ XAUUSD ແລະ EURUSD: trend, bias, support, resistance, analysis (ໃຊ້ context ຈາກຂ່າວ + economic events ຂ້າງເທິງ)
6. hasHighImpact — true ຖ້າມີ event ທີ່ impact = high
7. lineMessage — ຂໍ້ຄວາມ LINE Broadcast ສັ້ນ Emoji

ສຳຄັນ:
- ID slugs: kebab-case ບໍ່ມີວັນທີ ບໍ່ມີຍາວເກີນ 40 ຕົວ — e.g. "nfp-usd", "fed-rate-cut"
- timeISO ໃນ topEvents: ໃຊ້ ISO timestamp ຈາກ raw event ຂ້າງເທິງ (field: time)
- imageUrl: ຖ້າບໍ່ມີໃຫ້ string ຫວ່າງ
- ໃຫ້ call tool save_daily_summary ດ້ວຍ output ທັງໝົດ`

  // Haiku 4.5: ~3x faster than Sonnet for the same prompt and still
  // produces clean Lao. Sonnet was tipping the route over Vercel's
  // 60s nodejs function ceiling.
  const message = await client.messages.create(
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      tools: [SUMMARY_TOOL],
      tool_choice: { type: "tool", name: "save_daily_summary" },
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: 40_000 },
  )

  const toolUse = message.content.find(b => b.type === "tool_use")
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not call save_daily_summary tool")
  }
  return toolUse.input as DailySummary
}
