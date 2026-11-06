// Topic photos for articles that have no cover image of their own.
//
// All 71 articles in Sanity were published without a `coverImage`, so every
// card on the homepage was a wall of text. Rather than ask for 71 uploads,
// these are matched from Pexels by keyword.
//
// Three rules this follows, because a decorative photo must never behave like
// data on a site whose argument is that its numbers are checked:
//
//   · No key, no photo. The whole module returns null when PEXELS_API_KEY is
//     unset and every caller renders exactly what it renders today. Nothing
//     breaks, nothing half-loads, and a missing key is not an outage.
//   · The same article always gets the same photo. The result index is picked
//     from a hash of the article id, not at random and not "the first one", so
//     a reader does not see the card change between visits and two cards in
//     one row do not land on the same stock laptop.
//   · The photographer is carried through. Pexels asks for credit, so the
//     caller gets the name and profile URL and is expected to show them.
//
// Cached for a week through Next's fetch cache. The free tier allows 200
// requests an hour and a handful of distinct queries are in play, so the live
// rate is a few calls a week.

export interface StockPhoto {
  url: string
  alt: string
  photographer: string
  photographerUrl: string
  /** Pexels page for the photo — required by their attribution guidance. */
  sourceUrl: string
}

const ENDPOINT = "https://api.pexels.com/v1/search"
const CACHE_SECONDS = 60 * 60 * 24 * 7

/** Stable, order-independent hash. Same input → same photo, forever. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export async function findPhoto(query: string, seed: string): Promise<StockPhoto | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key || !query.trim()) return null

  try {
    const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`
    const res = await fetch(url, {
      headers: { Authorization: key },
      next: { revalidate: CACHE_SECONDS },
    })
    if (!res.ok) return null
    const data = await res.json()
    const photos: any[] = Array.isArray(data?.photos) ? data.photos : []
    if (photos.length === 0) return null

    const pick = photos[hash(seed) % photos.length]
    const src = pick?.src?.large ?? pick?.src?.medium ?? pick?.src?.original
    if (!src) return null

    return {
      url: src,
      // Pexels alt text is English and often empty; the caller passes the
      // article title as a better alternative when this is blank.
      alt: typeof pick.alt === "string" ? pick.alt : "",
      photographer: pick.photographer ?? "",
      photographerUrl: pick.photographer_url ?? "",
      sourceUrl: pick.url ?? "",
    }
  } catch {
    // A photo is decoration. It never fails a page render.
    return null
  }
}
