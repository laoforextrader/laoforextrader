// Choose the search term for an article's topic photo.
//
// The trick these titles allow: they are Lao sentences with the technical term
// left in Latin script — "Risk/Reward Ratio: ຕົວເລກທີ່ສຳຄັນທີ່ສຸດ",
// "Dollar Index (DXY) ວິເຄາະ", "VPS Forex ແມ່ນຫຍັງ?". So the English words
// already in the title ARE the topic, and pulling them out beats translating
// or guessing from the category.
//
// A stock library has no photograph of "Risk/Reward Ratio", so the term is
// paired with a visual anchor ("trading chart") that keeps the result in the
// right world instead of returning portraits of people named Ratio.

import type { Article } from "@/types"
import { findPhoto, type StockPhoto } from "./pexels"

/** Words that carry no topic and would skew the search. */
const STOP = new Set([
  "the", "and", "for", "with", "what", "how", "why", "your", "you", "are", "is",
  "from", "that", "this", "best", "top", "guide", "part", "new", "all", "can",
  "vs", "or", "to", "in", "on", "of", "a", "an", "it", "ea", "pro",
])

/** A visual anchor per category, so the query always lands in finance. */
const CATEGORY_ANCHOR: Record<string, string> = {
  education: "forex trading chart",
  analysis: "stock market chart analysis",
  news: "financial news newspaper",
  "ea-tools": "computer trading automation",
  broker: "online trading platform",
}

export function photoQueryFor(article: Pick<Article, "title" | "category">): string {
  const latin = (article.title ?? "")
    .replace(/[^\x20-\x7E]+/g, " ") // drop Lao, keep ASCII
    .replace(/[^A-Za-z ]+/g, " ") // drop digits and punctuation
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP.has(w.toLowerCase()))

  const anchor = CATEGORY_ANCHOR[article.category] ?? "forex trading"
  if (latin.length === 0) return anchor

  // Two topic words plus the anchor. More than two narrows a stock library to
  // nothing and it silently falls back to unrelated results.
  return `${latin.slice(0, 2).join(" ")} ${anchor}`
}

/**
 * The photo for one article, or null when there is no key, no match, or the
 * article already carries a real cover image (which always wins — an editor's
 * choice beats a keyword match).
 */
export async function articlePhoto(
  article: Pick<Article, "_id" | "title" | "category" | "coverImage">,
): Promise<StockPhoto | null> {
  if (article.coverImage?.asset?.url) return null
  return findPhoto(photoQueryFor(article), article._id)
}
