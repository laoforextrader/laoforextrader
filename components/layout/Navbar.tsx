"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Search } from "lucide-react"
import LoginButton from "@/components/LoginButton"
import ThemeToggle from "@/components/theme/ThemeToggle"
import LangPicker from "@/components/i18n/LangPicker"
import { SearchBar } from "@/components/layout/SearchBar"
import { useT } from "@/components/i18n/LangProvider"
import type { Strings } from "@/lib/i18n/dict"

//  The destinations are fixed; only their names change with the language,
//  so the table holds the key rather than the word.
const NAV: { key: keyof Strings["nav"]; href: string }[] = [
  { key: "broker",    href: "/broker" },
  { key: "ea",        href: "/ea-system" },
  { key: "signal",    href: "/signal/trs-signal-pro" },
  { key: "lessons",   href: "/lessons" },
  { key: "education", href: "/education" },
  { key: "quizzes",   href: "/quiz" },
  { key: "news",      href: "/news" },
  { key: "analysis",  href: "/analysis" },
  { key: "tools",     href: "/tools" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileQ, setMobileQ] = useState("")
  const { data: session } = useSession()
  const router = useRouter()
  const t = useT()

  const submitMobile = (e: React.FormEvent) => {
    e.preventDefault()
    const q = mobileQ.trim()
    if (q.length >= 2) {
      setMobileSearchOpen(false)
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-line-2"
      style={{ background:"var(--surface-glass)", backdropFilter:"blur(12px)" }}>
      <div className="max-w-[1060px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse-dot" />
          <span className="font-sans font-extrabold text-[20px] tracking-tight"
            style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LFT</span>
        </Link>
        <ul className="hidden lg:flex items-center gap-3">
          {NAV.map(item => (
            <li key={item.href}>
              <Link href={item.href}
                className="text-fg-3 hover:text-accent text-[10.5px] font-semibold uppercase tracking-wider transition-colors font-sans whitespace-nowrap">
                {t.nav[item.key]}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <SearchBar />
          <LangPicker />
          <ThemeToggle />
          <LoginButton />
        </div>
        <div className="flex md:hidden items-center gap-2">
          {/* Same bordered square as the light/dark switch beside it,
              so the bar reads as one row of controls. */}
          <LangPicker />
          <LoginButton compact />
          <ThemeToggle />
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="text-fg-3 hover:text-fg"
            aria-label={t.nav.search}
          >
            <Search size={20} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-fg-3 hover:text-fg"
            aria-label={t.nav.menu}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-surface border-t border-line-2 px-6 py-3">
          <form onSubmit={submitMobile} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-4 pointer-events-none" size={16} />
            <input
              autoFocus
              type="text"
              value={mobileQ}
              onChange={e => setMobileQ(e.target.value)}
              placeholder={t.nav.search}
              className="w-full pl-9 pr-9 py-2 bg-surface-2 border border-line-2 rounded-full text-[13px] font-lao text-fg placeholder:text-fg-4 focus:outline-none focus:border-blue-500"
            />
            {mobileQ && (
              <button
                type="button"
                onClick={() => setMobileQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-4 hover:text-fg-3"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      )}

      {open && (
        <div className="md:hidden bg-surface border-t border-line-2 px-6 py-4 flex flex-col gap-3">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="text-fg-3 hover:text-accent font-sans font-semibold text-sm py-1"
              onClick={() => setOpen(false)}>{t.nav[item.key]}</Link>
          ))}
          {/* Signing in lives on the bar icon now, so this part is only for
              somebody already signed in; a second door to /login would be a
              different form from the one the icon opens. */}
          {session && (
            <div className="pt-3 border-t border-line-2">
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="block font-sans text-sm text-fg-2 font-semibold py-1">
                {t.auth.account}
              </Link>
              <button onClick={() => signOut({ callbackUrl:"/" })}
                className="font-sans text-sm text-red-500 py-1">{t.auth.signOut}</button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
