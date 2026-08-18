"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { OPT_IN_PENDING_KEY } from "@/components/auth/LoginButton"

/**
 * Finishes what the login checkbox started.
 *
 * The Google round trip throws away React state, and the subscriber doc does
 * not exist until the signIn callback has run, so consent cannot be recorded at
 * the moment it is given. The checkbox parks a flag in localStorage; this picks
 * it up as soon as a session exists and turns it into the real thing.
 *
 * Renders nothing. Mounted once in the layout so it works no matter where the
 * OAuth redirect lands.
 */
export function OptInSync() {
  const { status } = useSession()
  const done = useRef(false)

  useEffect(() => {
    if (status !== "authenticated" || done.current) return

    let pending = false
    try {
      pending = localStorage.getItem(OPT_IN_PENDING_KEY) === "1"
    } catch {
      return
    }
    if (!pending) return

    done.current = true
    fetch("/api/newsletter/opt-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optIn: true }),
    })
      .then((res) => {
        // Clear only on success. A failed call leaves the flag in place so the
        // next page load tries again rather than silently losing the consent
        // someone actually gave.
        if (res.ok) localStorage.removeItem(OPT_IN_PENDING_KEY)
        else done.current = false
      })
      .catch(() => {
        done.current = false
      })
  }, [status])

  return null
}
