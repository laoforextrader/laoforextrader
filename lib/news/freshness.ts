// How long an auto-generated daily-news page stays indexable.
//
// The daily pipeline mints ~2-3 URLs a day (/news/event/* + /news/hot/*).
// They are short, time-bound summaries: useful the week they're published,
// thin filler a month later. Left unbounded they grow ~900/year and drag the
// site's average page quality down while the education articles — the pages
// that actually rank — compete for the same crawl budget.
//
// So: fresh ones are indexable AND in the sitemap; stale ones are noindex AND
// out of the sitemap. Those two must agree — a URL that is in the sitemap but
// carries `noindex` is a contradictory signal that Search Console reports as
// an error, which is why both sides import the cutoff from here instead of
// each keeping its own idea of "recent".

export const NEWS_INDEX_WINDOW_DAYS = 30

// dailyUpdate.date is a Vientiane (UTC+7, no DST) day string, so compare in
// the same zone rather than UTC — otherwise the boundary shifts by a day
// depending on when the build runs.
function vientianeDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Vientiane",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d)
}

/** Oldest `dailyUpdate.date` ("YYYY-MM-DD") still eligible for indexing. */
export function newsIndexCutoff(now: Date = new Date()): string {
  return vientianeDay(new Date(now.getTime() - NEWS_INDEX_WINDOW_DAYS * 86_400_000))
}

/** Is this daily-update date still inside the indexing window? */
export function isNewsIndexable(date?: string, now: Date = new Date()): boolean {
  if (!date) return false
  // Both sides are "YYYY-MM-DD", so a lexical compare is a date compare.
  return date >= newsIndexCutoff(now)
}

/**
 * `robots` metadata for a daily-news page.
 *
 * Stale pages keep `follow` — they still link to /news and the broker pages,
 * and dropping the follow would waste the internal links Google already found.
 */
export function newsRobots(date?: string) {
  return isNewsIndexable(date)
    ? undefined
    : { index: false, follow: true }
}
