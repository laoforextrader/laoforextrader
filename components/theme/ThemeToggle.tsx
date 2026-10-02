"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const KEY = "lft-theme"

function apply(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark)
}

/**
 * Light/dark switch. Pressing it records an explicit choice that then sticks;
 * until the reader presses it, the site keeps following their OS setting.
 *
 * The two icons are BOTH rendered and one is hidden by CSS keyed off
 * `html.dark` (see .theme-icon-* in globals.css). That keeps the server and
 * first client render byte-identical — deciding in JS which icon to draw would
 * either mismatch hydration or need an empty first paint.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  // Drives the label only. Starts false so the first client render matches the
  // server, then corrects itself once mounted.
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    // Keep tracking the OS for as long as the reader hasn't chosen for themself.
    const onOS = (e: MediaQueryListEvent) => {
      try { if (localStorage.getItem(KEY)) return } catch { return }
      apply(e.matches)
      setDark(e.matches)
    }
    // Mirror a choice made in another tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return
      const d = e.newValue === "dark"
      apply(d)
      setDark(d)
    }

    mq.addEventListener("change", onOS)
    window.addEventListener("storage", onStorage)
    return () => {
      mq.removeEventListener("change", onOS)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains("dark")
    apply(next)
    setDark(next)
    try { localStorage.setItem(KEY, next ? "dark" : "light") } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle ${className}`}
      aria-label={dark ? "ສະຫຼັບໄປໂໝດແຈ້ງ" : "ສະຫຼັບໄປໂໝດມືດ"}
      title={dark ? "ໂໝດແຈ້ງ (Light)" : "ໂໝດມືດ (Dark)"}
    >
      <Sun size={18} className="theme-icon-light" aria-hidden="true" />
      <Moon size={18} className="theme-icon-dark" aria-hidden="true" />
    </button>
  )
}
