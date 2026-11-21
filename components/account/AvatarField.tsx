"use client"

import { useEffect, useRef, useState } from "react"
import { AVATARS, ContestAvatar, avatarById } from "@/components/contest/avatars"

//  One mark, already chosen, with a way out of it.
//
//  Showing twenty-four animals in a grid asked everybody to make a decision
//  nobody came here to make, and ate half the form doing it. So the form
//  picks one at random, shows it, and the grid only appears if the mark is
//  tapped. The + beside it is for a real photograph.
//
//  Random rather than derived from the email: two people with similar
//  addresses would otherwise get the same animal, and the point of the mark
//  is telling members apart.

export default function AvatarField({
  avatarId, onAvatarId, preview, onFile, label, hint, error,
}: {
  avatarId: string
  onAvatarId: (id: string) => void
  /** Object URL of a picture the member uploaded, when there is one. */
  preview: string
  onFile: (f: File) => void
  label: string
  hint: string
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  //  Give them one without asking. Runs on the client only, so the random
  //  pick can never differ between a server render and the first client one.
  useEffect(() => {
    if (!avatarId && !preview) {
      onAvatarId(AVATARS[Math.floor(Math.random() * AVATARS.length)].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const def = avatarById(avatarId) ?? AVATARS[0]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span className="font-lao" style={{ fontSize: 12, color: "var(--fg-4)" }}>{label}</span>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => setOpen(o => !o)}
          title={hint} aria-expanded={open}
          style={{
            padding: 0, lineHeight: 0, cursor: "pointer", borderRadius: "50%",
            border: open ? "2px solid var(--accent)" : "2px solid var(--line)",
            background: "none", flexShrink: 0,
          }}>
          {preview
            ? <img src={preview} alt="" width={42} height={42}
                style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", display: "block" }} />
            : <ContestAvatar def={def} size={42} />}
        </button>

        {/* The + is the upload, kept small: most people keep the animal. */}
        <button type="button" onClick={() => fileRef.current?.click()}
          title={hint}
          style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            border: "1px dashed var(--line)", background: "none", color: "var(--fg-3)",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
          style={{ display: "none" }} />

        <span className="font-lao" style={{ fontSize: 11.5, color: "var(--fg-4)", lineHeight: 1.6 }}>
          {hint}
        </span>
      </div>

      {open && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 5, padding: 9, borderRadius: 11,
          border: "1px solid var(--line)", background: "var(--surface-2)",
        }}>
          {AVATARS.map(a => (
            <button key={a.id} type="button"
              onClick={() => { onAvatarId(a.id); setOpen(false) }}
              title={a.label} aria-label={a.label}
              style={{
                borderRadius: "50%", padding: 2, cursor: "pointer", background: "none", lineHeight: 0,
                border: avatarId === a.id && !preview ? "2px solid var(--accent)" : "2px solid transparent",
              }}>
              <ContestAvatar def={a} size={28} />
            </button>
          ))}
        </div>
      )}

      {error && (
        <span className="font-lao" style={{ fontSize: 11.5, color: "#DC2626" }}>{error}</span>
      )}
    </div>
  )
}
