// Turn the broker-industry wire into short Lao items.
//
// One Claude call, not one per story: the per-item cost is the output tokens
// and batching them shares the prompt. Budget, using the rate measured on
// 2026-11-03 (Sonnet 4.6 writes Lao at ~34 output tokens/sec): 7 items at
// roughly 110 tokens each is ~770 tokens, so ~23s. Measured on the first
// live run: 39.8s for the whole call. max_tokens is 1400, which caps it at ~41s — comfortably inside the 120s SDK timeout and the
// route's 300s wall. Raise max_tokens and that arithmetic moves with it.
//
// De-duplication is a job for the model, not the fetcher. brokerSources.ts
// drops exact repeats by normalised headline, but the two outlets word the
// same story differently — "Webull fined $4.2 million by FINRA" and "FINRA
// Fines Webull $4.2M After 120K Accounts Bypassed Proper ID Checks" are one
// event and no string comparison will say so. The prompt asks for one item
// per event.
//
// The helpers come from ./summarize rather than being copied: the JSON
// extraction (models fence their output) and the Lao sanitiser (CJK
// occasionally bleeds into Lao output) are the kind of thing that silently
// stops matching when there are two of them.

import Anthropic from "@anthropic-ai/sdk"
import { callClaude, sanitizeLao } from "./summarize"
import type { BrokerNewsItem } from "./brokerSources"

export interface BrokerNewsSummaryItem {
  id: string
  title: string
  summary: string
  category: string
  brokers: string[]
  source: string
  sourceName: string
  sourceTitle: string
  pubDate: string
  imageUrl: string
}

const CATEGORIES = ["regulation", "expo", "company", "product"] as const

function slugOf(title: string, i: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48)
  return base ? `${base}-${i}` : `item-${i}`
}

function buildPrompt(items: BrokerNewsItem[]): string {
  const list = items
    .map(
      (n, i) =>
        `[${i}] ${n.title}\n     ${n.summary.slice(0, 300)}\n     (source: ${n.sourceName})`,
    )
    .join("\n\n")

  return `ທ່ານເປັນບັນນາທິການຂ່າວການເງິນຂອງເວັບໄຊລາວ laoforextrader.com ຜູ້ອ່ານເປັນເທຣດເດີຊາວລາວ.

ຂ້າງລຸ່ມນີ້ແມ່ນຫົວຂໍ້ຂ່າວວົງການໂບຣກເກີ Forex ເປັນພາສາອັງກິດ. ເລືອກເອົາແຕ່ຂ່າວທີ່ "ມີຜົນຕໍ່ຄົນທີ່ກຳລັງເລືອກໂບຣກເກີ" ແລ້ວຂຽນສະຫຼຸບເປັນພາສາລາວ.

${list}

ກົດລະບຽບ:
1. ເລືອກ 5 ຫາ 7 ຂ່າວ ທີ່ເປັນປະໂຫຍດຕໍ່ເທຣດເດີລາຍຍ່ອຍ. ສິ່ງທີ່ນັບວ່າກ່ຽວຂ້ອງມີຫຼາຍກວ່າຂ່າວຮ້າຍ:
   · ຜູ້ກຳກັບດູແລປັບໄໝ ຫຼື ຖອນໃບອະນຸຍາດ
   · ໂບຣກເກີປິດຕົວ ຖືກຊື້ກິດຈະການ ຄວບລວມ ຫຼື ເປີດຕະຫຼາດໃໝ່
   · ກົດລະບຽບໃໝ່ທີ່ກະທົບ leverage, ເງິນລູກຄ້າ ຫຼື ປະເພດສິນຄ້າທີ່ເທຣດໄດ້
   · ງານ Expo ແລະ ລາງວັນຂອງວົງການ
   · ແພລັດຟອມ ຫຼື ຜະລິດຕະພັນໃໝ່ຂອງໂບຣກເກີ
   ຢ່າເລືອກແຕ່ຂ່າວການລົງໂທດຢ່າງດຽວ — ໜ້າເວັບທີ່ມີແຕ່ຂ່າວຮ້າຍທຸກມື້ ບໍ່ໄດ້ສະທ້ອນວົງການຕາມຄວາມຈິງ.
   ຂ້າມຂ່າວທີ່ບໍ່ກ່ຽວກັບໂບຣກເກີ ຫຼື ຕະຫຼາດທີ່ລາຍຍ່ອຍເຂົ້າເຖິງໄດ້ (ເຊັ່ນ ຜົນປະກອບການທະນາຄານທົ່ວໄປ ຫຼື ການລະດົມທຶນຂອງ fintech ທີ່ບໍ່ແມ່ນໂບຣກເກີ).
   ຖ້າມີຂ່າວທີ່ກ່ຽວຂ້ອງໜ້ອຍກວ່າ 5 ກໍ່ສົ່ງຄືນເທົ່າທີ່ມີ — ຫ້າມແຕ່ງຂ່າວເພີ່ມ ແລະ ຫ້າມຂະຫຍາຍຂ່າວທີ່ບໍ່ກ່ຽວຂ້ອງໃຫ້ກາຍເປັນຂ່າວໂບຣກເກີ.
2. ຖ້າສອງລາຍການຂ້າງເທິງເປັນເລື່ອງດຽວກັນ (ສຳນັກຂ່າວສອງແຫ່ງລາຍງານເຫດການດຽວກັນ) ໃຫ້ເລືອກມາພຽງອັນດຽວ ຫ້າມສົ່ງຄືນຊ້ຳ.
3. "title" — ພາສາລາວ ບໍ່ເກີນ 70 ຕົວອັກສອນ ບອກວ່າເກີດຫຍັງຂຶ້ນ. ຊື່ບໍລິສັດ ຜູ້ກຳກັບດູແລ ແລະ ຕົວເລກ ໃຫ້ຂຽນຕາມຕົ້ນສະບັບ (FCA, CySEC, $4.2M).
4. "summary" — ພາສາລາວ 2 ຫາ 3 ປະໂຫຍກ ບອກວ່າເກີດຫຍັງ ແລະ ມັນໝາຍຄວາມວ່າແນວໃດຕໍ່ຄົນເທຣດ. ຫ້າມໃສ່ຂໍ້ມູນທີ່ບໍ່ມີໃນຕົ້ນສະບັບ ແລະ ຫ້າມຄາດເດົາຕົວເລກ.
5. "category" — ເລືອກໜຶ່ງ: ${CATEGORIES.join(" | ")}
6. "brokers" — ລາຍຊື່ໂບຣກເກີ/ບໍລິສັດທີ່ຖືກກ່າວເຖິງ (ພາສາອັງກິດ) ຖ້າບໍ່ມີໃຫ້ເປັນ []
7. "index" — ເລກ [n] ຂອງຂ່າວຕົ້ນສະບັບ ເພື່ອໃຫ້ລິ້ງຕົ້ນທາງຖືກຕ້ອງ
8. ຫ້າມໃຊ້ຕົວອັກສອນຈີນ ຫຼື ໄທ

ຕອບເປັນ JSON ຢ່າງດຽວ ຮູບແບບນີ້:
{"items":[{"index":0,"title":"...","summary":"...","category":"regulation","brokers":["Webull"]}]}`
}

export async function summarizeBrokerNews(
  news: BrokerNewsItem[],
): Promise<BrokerNewsSummaryItem[]> {
  if (news.length === 0) return []

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing")

  // maxRetries 1, not the SDK default of 2: a retry of a ~40s call still has
  // to fit under the route wall alongside the first attempt.
  const client = new Anthropic({ apiKey, maxRetries: 1 })
  const parsed = await callClaude(client, buildPrompt(news), 1400)

  const rows: any[] = Array.isArray(parsed?.items) ? parsed.items : []

  return rows
    .map((r, i) => {
      // The index ties each summary back to the story it came from. A model
      // that returns a bad index would otherwise attach a Lao summary to
      // somebody else's link — worse than dropping the item, so it is dropped.
      const src = news[Number(r?.index)]
      if (!src) return null
      const title = sanitizeLao(r?.title)
      const summary = sanitizeLao(r?.summary)
      if (!title || !summary) return null
      const category = CATEGORIES.includes(r?.category) ? r.category : "company"
      return {
        id: slugOf(src.title, i),
        title,
        summary,
        category,
        brokers: Array.isArray(r?.brokers)
          ? r.brokers.filter((b: unknown): b is string => typeof b === "string" && !!b.trim()).slice(0, 4)
          : [],
        source: src.link,
        sourceName: src.sourceName,
        sourceTitle: src.title,
        pubDate: src.pubDate,
        // Filled in by the caller: the og:image is only worth fetching for
        // the items that survived selection, not all twenty candidates.
        imageUrl: "",
      }
    })
    .filter((x): x is BrokerNewsSummaryItem => x !== null)
    .slice(0, 7)
}
