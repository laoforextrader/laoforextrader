"use client"

import { useEffect, useRef } from "react"
import { useLang } from "@/components/i18n/LangProvider"

//  Everything the dictionary does not cover.
//
//  Menus, buttons and forms are translated by hand in lib/i18n/dict.ts.
//  Articles, lesson titles, broker copy and the hundreds of headings inside
//  pages are not, and never can be: they live in Sanity, change weekly, and
//  a dictionary entry per article would mean a deploy per article. So after
//  the page has rendered, the Lao left on it is collected and sent to
//  /api/translate, and the answers are written back into the text nodes.
//
//  Why it is safe to write into the DOM under React:
//
//    · only text nodes are touched, never structure
//    · a re-render puts the Lao back, the observer sees it, and the
//      replacement comes straight out of the cache — no request, no flicker
//      worth the name
//    · the loop terminates by itself, because only text containing Lao
//      letters is ever collected and a translation contains none
//
//  Nothing here runs for a Lao reader: the site is written in Lao and that
//  path costs nothing at all.

const LAO = /[຀-໿]/
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG"])
const BATCH = 30
const MAX_NODES = 400
const STORE_MAX = 1200

type Cache = Map<string, string>

function loadCache(lang: string): Cache {
  try {
    const raw = localStorage.getItem(`tx:${lang}`)
    if (!raw) return new Map()
    const obj = JSON.parse(raw) as Record<string, string>
    return new Map(Object.entries(obj))
  } catch { return new Map() }
}

function saveCache(lang: string, cache: Cache) {
  try {
    //  Keep the most recent; the oldest entries are pages nobody came back to.
    const entries = [...cache.entries()].slice(-STORE_MAX)
    localStorage.setItem(`tx:${lang}`, JSON.stringify(Object.fromEntries(entries)))
  } catch {}
}

export default function AutoTranslate() {
  const { lang, ready } = useLang()
  //  What each node said in Lao, so switching back restores it exactly.
  const original = useRef(new WeakMap<Text, string>())
  const touched = useRef<Text[]>([])
  const cache = useRef<Cache>(new Map())
  const busy = useRef(false)
  const applying = useRef(false)

  useEffect(() => {
    //  Put the Lao back first, whatever the new language is. Thai text is
    //  not Lao, so a Thai page has nothing left for the collector to find —
    //  switching Thai to English would translate nothing at all without
    //  this step, and switching back to Lao needs it anyway.
    applying.current = true
    for (const node of touched.current) {
      const was = original.current.get(node)
      if (was !== undefined && node.isConnected) node.nodeValue = was
    }
    touched.current = []
    applying.current = false

    if (lang === "lo" || !ready) return

    cache.current = loadCache(lang)
    let stopped = false

    function collect(): Text[] {
      const root = document.body
      if (!root) return []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const text = n.nodeValue ?? ""
          if (text.length < 2 || !LAO.test(text)) return NodeFilter.FILTER_REJECT
          const el = n.parentElement
          if (!el) return NodeFilter.FILTER_REJECT
          if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT
          if (el.closest("[data-no-tx]")) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      const out: Text[] = []
      let n = walker.nextNode()
      while (n && out.length < MAX_NODES) {
        out.push(n as Text)
        n = walker.nextNode()
      }
      return out
    }

    function put(node: Text, src: string, out: string) {
      if (!node.isConnected || out === src) return
      if (!original.current.has(node)) original.current.set(node, src)
      touched.current.push(node)
      applying.current = true
      node.nodeValue = out
      applying.current = false
    }

    async function run() {
      if (busy.current || stopped) return
      busy.current = true
      try {
        const nodes = collect()
        if (!nodes.length) return

        //  Anything already known goes in immediately — this is the whole
        //  of the work on a second visit, and it happens in one frame.
        const pending: { node: Text; src: string }[] = []
        for (const node of nodes) {
          const src = (node.nodeValue ?? "").trim()
          if (!src) continue
          const hit = cache.current.get(src)
          if (hit !== undefined) put(node, node.nodeValue ?? "", (node.nodeValue ?? "").replace(src, hit))
          else pending.push({ node, src })
        }
        if (!pending.length || stopped) return

        //  Unique strings only: a list of twenty cards often repeats the
        //  same label twenty times.
        const unique = [...new Set(pending.map(p => p.src))]
        const chunks: string[][] = []
        for (let i = 0; i < unique.length; i += BATCH) chunks.push(unique.slice(i, i + BATCH))

        //  A few in flight at once, not all of them: a long page is six or
        //  seven batches, and one at a time meant the bottom of it sat in
        //  Lao for ten seconds. Each batch paints as it lands.
        let next = 0
        const worker = async () => {
          while (!stopped) {
            const mine = next++
            if (mine >= chunks.length) return
            const slice = chunks[mine]
            let got: string[] = []
            try {
              const r = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lang, texts: slice }),
              })
              const j = await r.json()
              got = Array.isArray(j?.out) ? j.out : []
            } catch { got = [] }
            if (got.length !== slice.length || stopped) continue

            slice.forEach((src, n) => cache.current.set(src, got[n]))
            for (const p of pending) {
              const hit = cache.current.get(p.src)
              if (hit !== undefined && p.node.isConnected) {
                put(p.node, p.node.nodeValue ?? "", (p.node.nodeValue ?? "").replace(p.src, hit))
              }
            }
            saveCache(lang, cache.current)
          }
        }
        await Promise.all([worker(), worker(), worker()])
      } finally {
        busy.current = false
      }
    }

    //  Re-run when the page changes under us: a route change, a list that
    //  loaded, a dialog that opened.
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new MutationObserver(() => {
      if (applying.current) return
      clearTimeout(timer)
      timer = setTimeout(run, 350)
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    run()

    return () => {
      stopped = true
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [lang, ready])

  return null
}
