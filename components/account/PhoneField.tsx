"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Flag from "@/components/contest/Flag"
import { searchCountries, countryName, type Country } from "@/lib/contest/countries"
import { dialOf, SAMPLE } from "@/lib/account/dialCodes"

//  A phone number anyone's country can be typed into.
//
//  The old field was a Lao/foreign toggle with "+856 20" welded to the front,
//  which is fine until a Thai member joins. This is the contest form's shape
//  instead: a flag and a dialling code you pick, a plain box for the rest.
//
//  The default comes from the IP, because the common case is "I am where my
//  number is" and nobody should scroll a list of ninety countries to say so.
//  It is only a default — one tap changes it, and a VPN making a wrong guess
//  costs that one tap.
//
//  Declared at file scope. A component defined inside another is a new type
//  on every render and React throws the old one away with whatever was typed
//  in it — the mistake that cost this site a picker once already.

const NEAR = ["LA", "TH", "VN", "KH", "MM", "CN", "US", "GB", "AU", "KR"]

export default function PhoneField({
  country, onCountry, value, onValue, label, searchLabel = "ຄົ້ນຫາ / search / ค้นหา",
}: {
  country: string
  onCountry: (code: string) => void
  value: string
  onValue: (v: string) => void
  label: string
  searchLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const box = useRef<HTMLDivElement>(null)

  //  Click anywhere else and the list closes; inside a dialog there is no
  //  page to click, so this also catches the dialog's own backdrop.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const list = useMemo<Country[]>(() => {
    if (q.trim()) return searchCountries(q, 60).filter(c => dialOf(c.code))
    const near = NEAR.map(c => searchCountries(c, 1)[0]).filter(Boolean)
    const rest = searchCountries("", 200).filter(c => !NEAR.includes(c.code) && dialOf(c.code))
    return [...near, ...rest]
  }, [q])

  const dial = dialOf(country)
  const sample = SAMPLE[country] ?? "20 000 0000"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="font-lao" style={{ fontSize: 12, color: "var(--fg-4)" }}>{label}</span>

      <div ref={box} style={{ position: "relative", display: "flex" }}>
        <button type="button" onClick={() => { setOpen(o => !o); setQ("") }}
          style={{
            display: "flex", alignItems: "center", gap: 7, flexShrink: 0, cursor: "pointer",
            padding: "0 10px", borderRadius: "9px 0 0 9px",
            border: "1px solid var(--line)", borderRight: "none",
            background: "var(--surface-2)", color: "var(--fg-2)",
            fontFamily: "ui-monospace,monospace", fontSize: 13.5,
          }}>
          <Flag value={country} size={18} />
          <span>{dial ? "+" + dial : "+"}</span>
          <span style={{ fontSize: 9, color: "var(--fg-4)" }}>▼</span>
        </button>

        <input value={value} onChange={e => onValue(e.target.value)} inputMode="tel"
          placeholder={sample}
          style={{
            flex: 1, minWidth: 0,
            borderRadius: "0 9px 9px 0", border: "1px solid var(--line)",
            background: "var(--bg)", padding: "11px 12px",
            fontFamily: "ui-monospace,monospace", fontSize: 14, color: "var(--fg)",
          }} />

        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 5,
            borderRadius: 11, overflow: "hidden",
            border: "1px solid var(--line)", background: "var(--surface)",
            boxShadow: "0 18px 40px rgba(2,6,23,.35)",
          }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder={searchLabel}
              style={{
                width: "100%", border: "none", borderBottom: "1px solid var(--line)",
                background: "var(--surface-2)", padding: "10px 12px",
                fontSize: 13, color: "var(--fg)", outline: "none",
              }} />
            <ul style={{ margin: 0, padding: 0, listStyle: "none", maxHeight: 220, overflowY: "auto" }}>
              {list.map(c => (
                <li key={c.code}>
                  <button type="button"
                    onClick={() => { onCountry(c.code); setOpen(false); setQ("") }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 12px", cursor: "pointer", border: "none", textAlign: "left",
                      background: c.code === country ? "var(--surface-2)" : "transparent",
                      color: "var(--fg-2)", fontSize: 13,
                    }}>
                    <Flag value={c.code} size={18} />
                    <span className="font-lao" style={{
                      flex: 1, minWidth: 0, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {countryName(c.code, "lo")}
                    </span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, color: "var(--fg-4)" }}>
                      +{dialOf(c.code)}
                    </span>
                  </button>
                </li>
              ))}
              {list.length === 0 && (
                <li style={{ padding: "12px", fontSize: 12.5, color: "var(--fg-4)" }}>no match</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
