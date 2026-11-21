"use client"

import { useEffect, useRef, useState } from "react"
import Flag from "@/components/contest/Flag"
import { LANGS, LANG_META, type Lang } from "@/lib/i18n/lang"
import { useLang } from "@/components/i18n/LangProvider"

//  The language control: a flag in the same bordered square as the
//  light/dark switch, because on a bar of icons everything should be the
//  same size and weight.
//
//  A flag, not the word "Language". Three flags answer "can I read this
//  site" faster than any label, in any of the three languages — and the
//  flag that is showing is already the answer to "which one am I in".
//
//  flagcdn images rather than 🇱🇦 and friends: Windows ships no flag glyphs
//  at all and renders those as the letters LA (see components/contest/Flag).

export default function LangPicker({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={box} className={className} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="theme-toggle" aria-label={t.nav.language} title={t.nav.language}
        aria-expanded={open}>
        <Flag value={LANG_META[lang].flag} size={18} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 60,
          minWidth: 150, borderRadius: 11, overflow: "hidden",
          border: "1px solid var(--line)", background: "var(--surface)",
          boxShadow: "0 18px 40px rgba(2,6,23,.28)",
        }}>
          {LANGS.map((l: Lang) => (
            <button key={l} type="button"
              onClick={() => { setLang(l); setOpen(false) }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "10px 13px", border: "none", cursor: "pointer", textAlign: "left",
                background: l === lang ? "var(--surface-2)" : "transparent",
                color: "var(--fg-2)", fontSize: 13,
                fontWeight: l === lang ? 700 : 500,
              }}>
              <Flag value={LANG_META[l].flag} size={18} />
              <span>{LANG_META[l].label}</span>
              {l === lang && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ marginLeft: "auto" }} aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
