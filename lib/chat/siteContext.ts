// Dynamic context block appended to every chat system prompt.
//
// Fetches the current site inventory from Sanity (brokers, articles,
// quizzes) plus a static "About" header and formats it as Lao bullets
// the model can quote. Cached in-process for 1h so we don't hammer
// Sanity on every chat turn — invalidated automatically when the
// serverless instance recycles.

import { sanityClient } from "@/lib/sanity"

const TTL_MS = 60 * 60 * 1000

interface Broker {
  name: string
  slug?: string
  rating?: number
  minDeposit?: string
  excerpt?: string
}
interface Article {
  title: string
  slug?: string
  category?: string
  publishedAt?: string
}
interface Quiz {
  title: string
  slug?: string
  level?: string
}

let _cache: { text: string; expires: number } | null = null

const STATIC_HEADER = `## ກ່ຽວກັບເວັບໄຊທ໌ (laoforextrader.com)

- **ຊື່ເວັບໄຊທ໌:** LaoForexTrader (laoforextrader.com)
- **ຜູ້ກໍ່ຕັ້ງ:** Mee Muangsong — Trader ລາວປະສົບການ 10+ ປີ, ຜູ້ກໍ່ຕັ້ງ Laos Forex Community
- **ເລີ່ມ Trade:** 2014
- **ສະຖິຕິ:** 50+ ບົດຮຽນຟຣີ · 12K+ ສະມາຊິກ · 48 ລີວິວ Broker
- **ພາລະກິດ:** ໃຫ້ຂໍ້ມູນຊື່ສັດ-ທົດສອບຈິງ ກ່ຽວກັບ Broker + ບົດຮຽນ Forex + ວິເຄາະຕະຫຼາດ ສຳລັບເທຣດເດີລາວ
- **ໜ້າຫຼັກ:** /  ·  /about  ·  /broker  ·  /news  ·  /education  ·  /analysis  ·  /quiz  ·  /signal/trs-signal-pro`

const STATIC_FOOTER = `## ກົດການນຳໃຊ້ຂໍ້ມູນ

- ຖ້າຄຳຖາມຄ່ຽວກັບເນື້ອຫາໃນບົດຄວາມ → ບອກຫົວຂໍ້ + ຊີ້ນຳໄປຫາ URL ໃນລາຍການຂ້າງເທິງ
- ຖ້າຖາມຫາ broker ສະເພາະ → ໃຊ້ຂໍ້ມູນທີ່ໃຫ້ + ຊີ້ນຳໄປຫາ /broker/<slug>
- **ຫ້າມ "ປະດິດ" broker, ບົດຄວາມ, ຫຼື URL ທີ່ບໍ່ມີໃນລາຍການນີ້**
- ຖ້າຖາມຫາສິ່ງທີ່ບໍ່ມີໃນລາຍການ → ບອກວ່າຍັງບໍ່ມີຂໍ້ມູນ ແລະແນະນຳໃຫ້ທັກ admin`

async function build(): Promise<string> {
  try {
    const [brokers, articles, quizzes] = await Promise.all([
      sanityClient.fetch<Broker[]>(`
        *[_type == "broker"] | order(coalesce(rank, 999) asc, coalesce(rating, 0) desc) {
          name, "slug": slug.current, rating, minDeposit, excerpt
        }
      `),
      sanityClient.fetch<Article[]>(`
        *[_type == "article"] | order(coalesce(publishedAt, _createdAt) desc) [0...30] {
          title, "slug": slug.current, category, publishedAt
        }
      `),
      sanityClient.fetch<Quiz[]>(`
        *[_type == "quiz"] | order(coalesce(order, 999) asc) {
          title, "slug": slug.current, level
        }
      `),
    ])

    const articlesByCat: Record<string, Article[]> = {}
    for (const a of articles) {
      const cat = a.category || "other"
      if (!articlesByCat[cat]) articlesByCat[cat] = []
      articlesByCat[cat].push(a)
    }

    const brokerLines = brokers.length
      ? brokers.slice(0, 25).map((b) => {
          const parts = [`**${b.name}**`]
          if (b.rating != null)      parts.push(`rating ${b.rating}/10`)
          if (b.minDeposit)          parts.push(`min ${b.minDeposit}`)
          const meta = parts.join(" · ")
          const url  = b.slug ? `/broker/${b.slug}` : ""
          return `- ${meta}${url ? `  →  ${url}` : ""}`
        }).join("\n")
      : "(ບໍ່ມີຂໍ້ມູນ broker ໃນຂະນະນີ້)"

    const articleSections = Object.keys(articlesByCat).length
      ? Object.entries(articlesByCat).map(([cat, arts]) => {
          const head = catLabel(cat)
          const items = arts.slice(0, 10).map((a) => {
            const url = a.slug ? `  →  /${cat}/${a.slug}` : ""
            return `  - ${a.title}${url}`
          }).join("\n")
          return `**${head}:**\n${items}`
        }).join("\n\n")
      : "(ບໍ່ມີບົດຄວາມ)"

    const quizLines = quizzes.length
      ? quizzes.slice(0, 15).map((q) => {
          const url = q.slug ? `  →  /quiz/${q.slug}` : ""
          return `- ${q.title}${q.level ? ` (${q.level})` : ""}${url}`
        }).join("\n")
      : "(ບໍ່ມີ quiz)"

    return [
      STATIC_HEADER,
      `## ໂບຣກເກີທີ່ມີຂໍ້ມູນ (${brokers.length} broker)`,
      brokerLines,
      `## ບົດຄວາມ / ບົດຮຽນຫຼ້າສຸດ`,
      articleSections,
      `## Quiz ທີ່ມີ`,
      quizLines,
      STATIC_FOOTER,
    ].join("\n\n")
  } catch (err) {
    console.error("[siteContext] Sanity fetch failed, using static-only context", err)
    return `${STATIC_HEADER}\n\n${STATIC_FOOTER}`
  }
}

export async function getSiteContext(): Promise<string> {
  if (_cache && _cache.expires > Date.now()) return _cache.text
  const text = await build()
  _cache = { text, expires: Date.now() + TTL_MS }
  return text
}

function catLabel(cat: string): string {
  switch (cat) {
    case "education": return "ບົດຮຽນ (Education)"
    case "analysis":  return "ວິເຄາະ (Analysis)"
    case "news":      return "ຂ່າວ (News)"
    case "ea-tools":  return "EA & Tools"
    case "broker":    return "ບົດຄວາມ Broker"
    default:          return cat
  }
}
