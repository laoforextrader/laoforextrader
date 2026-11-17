"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"

// The two things the account page could not do from the server: copy the
// address to the clipboard, and sign out.
//
// The email is shown in full and can be copied because someone who has more
// than one Google account needs to know which one holds their contest entry
// before they go looking for it.

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  if (!email) return null
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(email)
          .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
          .catch(() => {})
      }}
      title={email}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%",
        padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line-2)",
        background: "var(--surface-2)", cursor: "pointer",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        color: copied ? "var(--success)" : "var(--fg-2)",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
      <span style={{ flexShrink: 0, fontSize: 10, opacity: 0.8 }}>{copied ? "✓" : "copy"}</span>
    </button>
  )
}

export function SignOutButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        width: "100%", padding: "12px 18px", borderRadius: 12,
        border: "1px solid var(--line-2)", background: "var(--surface)",
        color: "var(--danger)", fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Noto Sans Lao', sans-serif",
      }}
    >
      {label}
    </button>
  )
}
