// Claude-powered Lao summary. Uses the Anthropic SDK with a single
// tool definition so we get clean structured output back instead of
// having to parse free-form JSON from a text response.

import Anthropic from "@anthropic-ai/sdk"
import type { CalendarEvent, NewsItem } from "./sources"
import { formatLaoTime } from "./sources"

export interface DailySummary {
  dailySummary: string
  hotNews: { title: string; summary: string }
  calendarHighlights: Array<{
    name: string
    time: string
    impact: "high" | "medium" | "low"
    description: string
  }>
  hasHighImpact: boolean
  lineMessage: string
}

const SUMMARY_TOOL: Anthropic.Tool = {
  name: "save_daily_summary",
  description: "Save the daily Forex summary for laoforextrader.com followers in the required structure.",
  input_schema: {
    type: "object",
    properties: {
      dailySummary: {
        type: "string",
        description: "ສະຫຼຸບລວມ 2-3 ປະໂຫຍກ ພາສາລາວ ງ່າຍໆ ບອກວ່າມື້ນີ້ Trader ຄວນຈັບຕາຫຍັງ",
      },
      hotNews: {
        type: "object",
        properties: {
          title: { type: "string", description: "ຫົວຂໍ້ຂ່າວ ພາສາລາວ ສັ້ນ" },
          summary: { type: "string", description: "ສະຫຼຸບຂ່າວ 2 ປະໂຫຍກ ພາສາລາວ" },
        },
        required: ["title", "summary"],
      },
      calendarHighlights: {
        type: "array",
        description: "Events ສຳຄັນ 3 ອັນ (ເລືອກ high/medium impact ກ່ອນ)",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "ຊື່ event ເປັນ ENG ຫຼື ສັ້ນລາວ" },
            time: { type: "string", description: "HH:MM (ເວລາລາວ ICT)" },
            impact: { type: "string", enum: ["high", "medium", "low"] },
            description: { type: "string", description: "ຄຳອະທິບາຍ 1 ປະໂຫຍກ ພາສາລາວ" },
          },
          required: ["name", "time", "impact", "description"],
        },
      },
      hasHighImpact: {
        type: "boolean",
        description: "ມີ event ທີ່ມີ impact = high ໃນລາຍການມື້ນີ້ ຫຼື ບໍ່",
      },
      lineMessage: {
        type: "string",
        description: "ຂໍ້ຄວາມສຳລັບ LINE Broadcast — ສັ້ນ ດຶງດູດ ມີ Emoji ບໍ່ເກີນ 5 ບັນທັດ",
      },
    },
    required: ["dailySummary", "hotNews", "calendarHighlights", "hasHighImpact", "lineMessage"],
  },
}

interface SummarizeArgs {
  date: string                    // YYYY-MM-DD (Lao)
  calendar: CalendarEvent[]
  news: NewsItem[]
}

export async function summarizeDailyUpdate({ date, calendar, news }: SummarizeArgs): Promise<DailySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const client = new Anthropic({ apiKey })

  // Pre-filter to keep prompt tight: high-impact calendar entries first
  const importantEvents = calendar
    .filter(e => e.impact === "high" || e.impact === "medium")
    .slice(0, 8)
    .map(e => ({
      ...e,
      time: formatLaoTime(e.time),
    }))

  const newsForPrompt = news.slice(0, 6).map(n => ({
    title: n.title,
    summary: n.summary?.slice(0, 280) ?? "",
  }))

  const prompt = `ທ່ານເປັນນັກວິເຄາະ Forex ທີ່ຂຽນໃຫ້ Trader ລາວ ໃຊ້ພາສາລາວທີ່ສະອາດ ຖືກຕ້ອງ ບໍ່ປົນຄຳໄທ.

ມື້ນີ້ (${date}):

🗓 Economic Calendar (impact ສຳຄັນ):
${importantEvents.length ? JSON.stringify(importantEvents, null, 2) : "(ບໍ່ມີ event ສຳຄັນ)"}

📰 ຂ່າວ Forex ຫຼ້າສຸດ:
${newsForPrompt.length ? newsForPrompt.map((n, i) => `[${i+1}] ${n.title}\n   ${n.summary}`).join("\n\n") : "(ຍັງບໍ່ມີຂ່າວໃໝ່)"}

ກະລຸນາ:
1. ສ້າງ "dailySummary" 2-3 ປະໂຫຍກ ພາສາລາວ
2. ເລືອກ 1 ຂ່າວທີ່ສຳຄັນທີ່ສຸດ → ສ້າງ "hotNews" (ຫົວຂໍ້ + ສະຫຼຸບ)
3. ເລືອກ events ສຳຄັນ 3 ອັນ (high impact ກ່ອນ) → "calendarHighlights"
4. ກຳນົດ "hasHighImpact" — true ຖ້າມີ high impact event
5. ຂຽນ "lineMessage" — ສັ້ນ ດຶງດູດ ໃຊ້ Emoji ສຳລັບສົ່ງ LINE Broadcast

ໃຫ້ call tool save_daily_summary ດ້ວຍຜົນລັບທັງໝົດ.`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    tools: [SUMMARY_TOOL],
    tool_choice: { type: "tool", name: "save_daily_summary" },
    messages: [{ role: "user", content: prompt }],
  })

  const toolUse = message.content.find(b => b.type === "tool_use")
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not call save_daily_summary tool")
  }
  return toolUse.input as DailySummary
}
