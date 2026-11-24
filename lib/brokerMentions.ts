// Which broker is a news story about?
//
// Two callers, one question:
//
//   · components/news/NewsNextStep.tsx — a story about Exness should end with
//     the Exness card, not a generic shortlist. The onward step is the only
//     thing on a news page that earns anything, and a reader who just read
//     about a broker is as close to choosing one as they will ever be.
//   · lib/news/brokerSources.ts — of twenty candidates off the wire, the ones
//     naming a broker we actually recommend come first, then the ones naming a
//     broker this region trades with, then the rest.
//
// The hard part is not the matching, it is NOT matching. A broker page that
// claims a story is about Exness when it is about Expert Option is worse than
// one that shows the generic block, so every rule here errs toward silence:
//
//   · Word boundaries, always. "XM" must not match "XMas" or "FXMAX".
//   · An alias is only added when it is unambiguous in a finance headline.
//     "Vantage" is in, because in this wire it is the broker; "Global" and
//     "Markets" are not, because half the industry is called that.
//   · The aliases are keyed by slug, so a broker doc renamed in Studio keeps
//     working off its name and slug alone until someone adds an entry here.

/**
 * Extra names a broker is known by, keyed by the doc's slug. The doc's own
 * `name` and `slug` are always matched too, so an entry is only needed when
 * the wire calls the broker something else — a short form ("XM" for "XM
 * Global"), a former name ("Forex4you"), or the parent company that appears
 * in a regulatory notice ("Trading Point").
 *
 * Keep every entry specific enough to be meaningless outside this industry.
 */
export const BROKER_ALIASES: Record<string, string[]> = {
  "xm-global": ["XM", "XM Group", "Trading Point"],
  markets4you: ["Markets4you", "Forex4you", "E-Global Trade"],
  exness: ["Exness"],
  "interstellar-group": ["Interstellar Group", "Interstellar", "ISG Markets"],
  // No bare "Vantage": "a vantage point on rates" is a headline, and the
  // false match it caused is exactly what this file exists to avoid.
  vantage: ["Vantage Markets", "Vantage FX"],
  iux: ["IUX", "IUX Markets"],
  oexn: ["OEXN"],
  dupoin: ["Dupoin"],
  kvb: ["KVB", "KVB Plus", "KVB Prime", "KVB Global"],
}

/**
 * Brokers and groups that the retail flow in this region actually goes
 * through — the second tier of the news ordering. These are not brokers we
 * recommend; they are the ones a Lao or Thai reader has heard of, so a fine
 * or a licence withdrawal against one of them is news they can use.
 *
 * Asia-facing houses and the Asian arms of global ones. Deliberately no
 * generic words: every entry has to survive a word-boundary match against an
 * English finance headline.
 */
export const ASIA_BROKERS: string[] = [
  "IC Markets", "Pepperstone", "FBS", "Octa", "OctaFX", "HFM", "HF Markets", "HotForex",
  "Tickmill", "Doo Prime", "Doo Group", "Eightcap", "PU Prime", "Puprime", "Valetax",
  "Fullerton Markets", "Mitrade", "Moneta Markets", "Lirunex", "Weltrade", "InstaForex",
  "RoboForex", "Alpari", "Deriv", "Binary.com", "FXGT", "Titan FX", "TitanFX", "LAND-FX",
  "Land Prime", "ATFX", "Hantec", "GMI Markets", "XS.com", "Errante", "Exclusive Markets",
  "Neex", "Startrader", "Star Trader", "Zeno Markets", "AvaTrade", "ThinkMarkets",
  "Rakuten Securities", "Monex", "GMO Click", "SBI Shinsei", "Phillip Capital",
  "KGI Securities", "UOB Kay Hian", "Maybank Securities", "Mirae Asset", "Nomura",
  "Daiwa", "Huatai", "Futu", "Tiger Brokers", "Webull", "Longbridge", "Bybit", "OKX",
  "Binance", "Bitget", "Gate.io", "HTX", "Pionex",
]

/**
 * Regulators and places that make a story regional even when no broker we
 * know is named — "Indonesia's BAPPEBTI bans X" matters here; the same story
 * about a Norwegian firm does not.
 */
export const ASIA_CONTEXT: string[] = [
  "BAPPEBTI", "OJK", "Indonesia", "Indonesian", "Malaysia", "Malaysian",
  "Securities Commission Malaysia", "Bank Negara", "MAS", "Monetary Authority of Singapore",
  "Singapore", "Thailand", "Thai SEC", "Vietnam", "Vietnamese", "Laos", "Lao PDR",
  "Cambodia", "Myanmar", "Philippines", "SFC", "Hong Kong", "China", "Chinese",
  "Japan", "JFSA", "FSA Japan", "Korea", "Korean", "FSS", "Taiwan", "FSC Taiwan",
  "India", "SEBI", "Dubai", "DFSA", "UAE", "SCA", "Asia", "Asian", "APAC", "Southeast Asia",
]

/* ── matching ──────────────────────────────────────────────────────────── */

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * One case-insensitive, word-bounded alternation for a set of names.
 *
 * Whitespace inside a name is allowed to be any run of whitespace, because a
 * headline wrapped in an RSS payload arrives with newlines inside it. Returns
 * null for an empty set rather than a regex that matches everything — `new
 * RegExp("\\b(?:)\\b")` matches the empty string at every position, which
 * would make every story a match for every broker.
 */
export function mentionRegex(names: string[]): RegExp | null {
  const parts = names
    .map((n) => n.trim())
    .filter((n) => n.length >= 2)
    .map((n) => escapeRe(n).replace(/\s+/g, "\\s+"))
  if (parts.length === 0) return null
  // Longest first so "KVB Plus" wins over "KVB" — only matters for the
  // exec() callers that read the matched text back out.
  parts.sort((a, b) => b.length - a.length)
  return new RegExp(`(?<![\\w-])(?:${parts.join("|")})(?![\\w-])`, "i")
}

/** Every name a broker doc can be recognised by: its own, its slug's, its aliases'. */
export function namesOf(broker: { name?: string; slug?: { current?: string } | string }): string[] {
  const slug = typeof broker.slug === "string" ? broker.slug : broker.slug?.current
  const out: string[] = []
  if (broker.name) out.push(broker.name)
  if (slug) {
    const aliases = BROKER_ALIASES[slug]
    if (aliases) {
      // An alias list is authoritative: it is there precisely to say which
      // short forms are safe, so the slug is not allowed to smuggle one back
      // in. "vantage" would otherwise re-add the bare word the list drops.
      out.push(...aliases)
    } else {
      // "xm-global" → "xm global". A last resort, but it keeps a broker
      // nobody has aliased yet from being invisible to the matcher.
      const spaced = slug.replace(/-/g, " ")
      if (spaced.length >= 3) out.push(spaced)
    }
  }
  return Array.from(new Set(out))
}

/** True when any of `names` appears as a whole word in `text`. */
export function mentions(text: string, names: string[]): boolean {
  if (!text) return false
  const re = mentionRegex(names)
  return re ? re.test(text) : false
}

// The two static lists are matched against every candidate off the wire, so
// their regexes are compiled once rather than forty times.
const ASIA_BROKER_RE = mentionRegex(ASIA_BROKERS)
const ASIA_CONTEXT_RE = mentionRegex(ASIA_CONTEXT)

/**
 * How close to home a story is — the ordering the broker-news wire is read in.
 *
 *   0 · names a broker this site lists. A fine against Exness is a fact our
 *       own review page has to answer for, so it is never buried.
 *   1 · names a broker or a regulator of this region. Not one we recommend,
 *       but one a Lao or Thai reader has money with or has been pitched.
 *   2 · everything else. Still published — a thin day is a thin section, and
 *       padding it with an EU-only story is better than padding it with
 *       nothing — but it goes last.
 *
 * `ourNames` comes from the broker docs, not from a list in here, so adding a
 * broker in Studio moves its news up without a deploy.
 */
export function regionTier(text: string, ourNames: string[]): 0 | 1 | 2 {
  if (!text) return 2
  if (mentions(text, ourNames)) return 0
  if (ASIA_BROKER_RE?.test(text) || ASIA_CONTEXT_RE?.test(text)) return 1
  return 2
}

/**
 * The brokers a story is about, most confidently matched first.
 *
 * `texts` is given in order of trust — the summariser's extracted `brokers[]`
 * first, then the original English headline, then the Lao title and summary.
 * A broker named in an earlier string beats one named only in a later one,
 * and ties break on the site's own ranking, so a story naming two brokers we
 * list ends with the one we rank higher.
 */
export function matchBrokers<T extends { name?: string; slug?: { current?: string } | string; rank?: number }>(
  texts: (string | null | undefined)[],
  brokers: T[],
): T[] {
  const clean = texts.map((t) => (t ?? "").trim()).filter(Boolean)
  if (clean.length === 0) return []

  const scored: { broker: T; at: number }[] = []
  for (const b of brokers) {
    const names = namesOf(b)
    if (names.length === 0) continue
    const at = clean.findIndex((t) => mentions(t, names))
    if (at >= 0) scored.push({ broker: b, at })
  }

  return scored
    .sort((x, y) => x.at - y.at || (x.broker.rank ?? 999) - (y.broker.rank ?? 999))
    .map((s) => s.broker)
}
