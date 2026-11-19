"use client"

import { useMemo, useState } from "react"
import { searchCountries, toCode, countryName, type Country } from "@/lib/contest/countries"
import Flag from "@/components/contest/Flag"
import type { Lang } from "@/lib/contest/i18n"

// Pick a country, or type to find it.
//
// One control doing both, because the two habits are both common and the
// list is ninety-odd long: tapping it open shows the countries this contest
// actually draws from first, and typing anything — "lao", "ລາວ", "ph", "ไทย"
// — narrows it. What leaves here is always a two-letter code, so the board
// can show a flag without having to guess what "Laos :)" meant.
//
// Declared at file scope, not inside the form: a component defined inside
// another is a new component type on every render, and React throws the old
// one away — which is how this site's other pickers lost what was typed in
// them (see the Semi dashboard notes).

/** The few that cover most entrants, shown before anyone types. */
const NEAR = ["LA", "TH", "VN", "KH", "MM", "PH", "MY", "ID", "SG", "CN"]

export default function CountryPicker({
  value, onChange, lang, placeholder,
}: {
  /** ISO code, or whatever legacy text the entry already held. */
  value: string
  onChange: (code: string) => void
  lang: Lang
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")

  const code = toCode(value)
  const list = useMemo<Country[]>(() => {
    if (q.trim()) return searchCountries(q, 60)
    const near = NEAR.map(c => searchCountries(c, 1)[0]).filter(Boolean)
    const rest = searchCountries("", 200).filter(c => !NEAR.includes(c.code))
    return [...near, ...rest]
  }, [q])

  const label = (c: Country) =>
    lang === "lo" ? (c.lo ?? c.en) : lang === "th" ? (c.th ?? c.en) : c.en

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQ("") }}
        className="flex w-full items-center justify-between gap-2 rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 text-left text-[15px] outline-none focus:ring-2 focus:ring-accent"
      >
        <span className="flex items-center gap-2 truncate">
          {code ? <Flag value={code} size={18} /> : null}
          <span className={code ? "" : "text-bk-muted"}>
            {code ? countryName(code, lang) : placeholder}
          </span>
        </span>
        <span className="text-[11px] text-bk-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-bk border border-bk-line bg-bk-surface shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ຄົ້ນຫາ / search / ค้นหา"
            className="w-full border-b border-bk-line bg-bk-sunken px-3 py-2.5 text-[14px] outline-none"
          />
          <ul className="max-h-[260px] overflow-y-auto">
            {list.map(c => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setQ("") }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] hover:bg-bk-sunken ${
                    c.code === code ? "bg-bk-sunken font-semibold" : ""
                  }`}
                >
                  <Flag value={c.code} size={18} />
                  <span className="truncate">{label(c)}</span>
                  <span className="ml-auto font-mono text-[11px] text-bk-muted">{c.code}</span>
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="px-3 py-3 text-[12.5px] text-bk-muted">no match</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
