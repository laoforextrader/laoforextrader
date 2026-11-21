"use client"

import Link from "next/link"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { useT } from "@/components/i18n/LangProvider"
import type { Strings } from "@/lib/i18n/dict"

//  A client component now, only so it can read the chosen language. Nothing
//  here is interactive beyond the links, and the newsletter form was always
//  its own island.

type FKey = keyof Strings["footer"]

const COLUMNS: { title: FKey; links: { key: FKey; href: string }[] }[] = [
  {
    title: "content",
    links: [
      { key: "broker",    href: "/broker" },
      { key: "education", href: "/education" },
      { key: "analysis",  href: "/analysis" },
      { key: "news",      href: "/news" },
    ],
  },
  {
    title: "tools",
    links: [
      //  Product names, the same in every language.
      { key: "tools", href: "/tools/pip-calculator" },
      { key: "tools", href: "/tools/lot-calculator" },
    ],
  },
  {
    title: "about",
    links: [
      { key: "aboutUs", href: "/about" },
      { key: "contact", href: "/contact" },
      { key: "privacy", href: "/privacy" },
    ],
  },
]

//  The calculators keep their English names in all three languages — that
//  is what the tool is called on every broker site a reader has seen.
const TOOL_NAMES: Record<string, string> = {
  "/tools/pip-calculator": "Pip Calculator",
  "/tools/lot-calculator": "Lot Calculator",
}

export function Footer() {
  const t = useT()

  return (
    <footer className="bg-surface border-t border-line-2">
      <div className="max-w-[1060px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-sans font-extrabold text-[15px]"
                style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LFT</span>
            </div>
            <p className="font-lao text-[11px] text-fg-4 leading-relaxed mb-4">{t.footer.tagline}</p>
            <div className="flex gap-2">
              {[
                { label: "FB", href: "https://www.facebook.com/groups/Laoforextrader" },
                { label: "YT", href: "https://www.youtube.com/@MeeMuangsong" },
                { label: "TK", href: "https://www.tiktok.com/@meemuangsong" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-surface-2 border border-line-2 flex items-center justify-center font-mono text-[9px] text-fg-4 hover:text-accent hover:border-blue-200 transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-fg-4 mb-3">
                {t.footer[col.title]}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="font-lao text-[11px] text-fg-3 hover:text-accent transition-colors">
                      {TOOL_NAMES[link.href] ?? t.footer[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <NewsletterSignup />
        </div>

        <div className="border-t border-line-2 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-lao text-[10px] text-fg-4">© 2025 LaoForexTrader · {t.footer.madeWith}</p>
          <p className="font-lao text-[10px] text-fg-4 flex items-center gap-1.5">
            {/* Drawn, not an emoji: the site avoids those, and a warning
                triangle is exactly the kind of glyph that renders as a box. */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            {t.footer.riskNote}
          </p>
        </div>
      </div>
    </footer>
  )
}
