"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_LOCAL_KEY,
  langFromCountry, pickLang, type Lang,
} from "@/lib/i18n/lang"
import { t, type Strings } from "@/lib/i18n/dict"

//  Who holds the language, and how it gets decided.
//
//  It starts as Lao on both the server and the first client render, then
//  corrects itself once mounted — the same shape as the theme switch, and
//  for the same reason: text that differs between the two renders is a
//  hydration failure, and React answers one by throwing the server tree
//  away. So a Thai reader sees Lao for one frame. That is the price of
//  keeping every page statically rendered at one address, which is the
//  trade the owner chose over /th and /en URLs.
//
//  Order of decision: what they chose before (cookie, then the key the
//  contest pages have always used), otherwise where the request came from,
//  otherwise Lao. The choice is written to both the cookie and localStorage
//  so the contest and Semi dashboards follow it too.

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: Strings; ready: boolean }

const LangCtx = createContext<Ctx>({ lang: "lo", setLang: () => {}, t: t("lo"), ready: false })

export const useLang = () => useContext(LangCtx)
/** Just the strings, for the common case. */
export const useT = () => useContext(LangCtx).t

function readCookie(name: string): string {
  try {
    const hit = document.cookie.split("; ").find(c => c.startsWith(name + "="))
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : ""
  } catch { return "" }
}

export default function LangProvider({
  initial = "lo", children,
}: {
  /** A server page that read the cookie itself can seed this and skip the swap. */
  initial?: Lang
  children: React.ReactNode
}) {
  const [lang, setLangState] = useState<Lang>(initial)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = readCookie(LANG_COOKIE) || (() => {
      try { return localStorage.getItem(LANG_LOCAL_KEY) ?? "" } catch { return "" }
    })()

    if (saved) {
      apply(pickLang(saved))
      return
    }

    //  Never chosen: guess once from the request's country, remember it, and
    //  let one tap overrule it forever after.
    let gone = false
    fetch("/api/geo")
      .then(r => r.json())
      .then(j => { if (!gone) apply(langFromCountry(j?.country)) })
      .catch(() => { if (!gone) setReady(true) })
    return () => { gone = true }

    function apply(l: Lang) {
      setLangState(l)
      setReady(true)
      document.documentElement.lang = l
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    document.documentElement.lang = l
    try {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`
      localStorage.setItem(LANG_LOCAL_KEY, l)
    } catch {}
  }

  return (
    <LangCtx.Provider value={{ lang, setLang, t: t(lang), ready }}>
      {children}
    </LangCtx.Provider>
  )
}
