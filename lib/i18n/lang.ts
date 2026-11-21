//  Which language the site is being read in.
//
//  Three, and no more: Lao is what the site is for, Thai is the language
//  most of the rest of the audience reads, English is what everyone else
//  falls back to. Trading terms (lot, spread, equity, Stop Loss, EA) stay in
//  English in all three — that is what MT5, the broker statement and the
//  trader all say, and translating them helps nobody. Same rule the contest
//  pages already follow.
//
//  No /th or /en URLs. The choice rides in a cookie, which means one page
//  per address and Lao stays the indexed version; that was the owner's call
//  on 2026-11-22 after weighing it against a full three-language site.
//
//  Pure helpers only — no next/headers here, so a client component can
//  import this file without dragging the server runtime in with it.

export type Lang = "lo" | "th" | "en"

export const LANGS: Lang[] = ["lo", "th", "en"]

export const LANG_COOKIE = "lft.lang"
/** The contest and Semi pages chose their language before this existed. */
export const LANG_LOCAL_KEY = "semi.lang"

export const LANG_META: Record<Lang, { label: string; short: string; flag: string; html: string }> = {
  lo: { label: "ລາວ",     short: "ລາວ", flag: "LA", html: "lo" },
  th: { label: "ไทย",      short: "ไทย", flag: "TH", html: "th" },
  en: { label: "English",  short: "EN",  flag: "GB", html: "en" },
}

export const pickLang = (v: unknown): Lang =>
  v === "th" || v === "en" || v === "lo" ? v : "lo"

/**
 * The language to open on for somebody who has never chosen.
 *
 * A guess from where the request came in, and only a guess: a Lao reader on
 * a Singapore VPN gets English until they touch the picker, which is one
 * tap and is remembered afterwards.
 */
export function langFromCountry(country?: string | null): Lang {
  const c = String(country ?? "").toUpperCase()
  if (!c || c === "LA") return "lo"
  if (c === "TH") return "th"
  return "en"
}

/** A year. The choice is a preference, not a session. */
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
