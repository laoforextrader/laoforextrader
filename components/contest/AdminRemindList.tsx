"use client"

import { useState } from "react"

// The chase list: everyone who should be nudged before the round starts.
//
// Why this is one button per person and not one button for everybody:
// WhatsApp has no way to send a message from a web page. Every message on
// this site is a `wa.me` link that opens the owner's own WhatsApp with the
// text already written — the send is a human pressing send. Opening a dozen
// tabs at once is blocked by every browser, and a dozen identical messages
// fired by a script is what gets a number banned. So the list is built to be
// walked down: press, send, come back, the row greys out.
//
// Sending for real without a human in the loop needs the WhatsApp Business
// API — an application, an approved template per message and a per-message
// fee. Nothing here is written as if that existed.

export interface RemindRow {
  id: string
  name: string
  login: string
  /** Pre-built wa.me link with the countdown and what to fix. */
  wa: string
  /** The EA has reported at least once. */
  seen: boolean
  remindedAt?: string
  remindCount?: number
}

export default function AdminRemindList({ rows, daysLeft }: { rows: RemindRow[]; daysLeft: number | null }) {
  // Which rows have been pressed in this sitting. The server timestamp is the
  // record; this is just so the list greys out as the owner works down it.
  const [sent, setSent] = useState<Record<string, boolean>>({})

  if (!rows.length) {
    return (
      <p className="rounded-bk border border-dashed border-bk-line bg-bk-sunken p-3 text-[12.5px] text-bk-muted">
        Everyone registered has an EA reporting. Nothing to chase.
      </p>
    )
  }

  const mark = (id: string) => {
    setSent(s => ({ ...s, [id]: true }))
    // Fire and forget: the WhatsApp tab is already opening in the same click.
    void fetch("/api/contest/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "remind" }),
    }).catch(() => {})
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 rounded-bk bg-bk-sunken px-3 py-2 text-[12px] leading-relaxed text-bk-muted">
        {daysLeft !== null && daysLeft > 0
          ? `อีก ${daysLeft} วันเริ่มแข่ง · `
          : "แข่งขันเริ่มแล้ว · "}
        ข้อความนับถอยหลังถูกเขียนไว้ให้แล้ว กดทีละคน แล้วกด send ในแอป WhatsApp
        — เว็บส่งเองไม่ได้ ต้องใช้ WhatsApp Business API เท่านั้น
      </p>

      {rows.map(r => {
        const pressed = sent[r.id] || !!r.remindedAt
        return (
          <div key={r.id}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-bk border px-3 py-2 ${
              pressed ? "border-dashed border-bk-line opacity-60" : "border-bk-line bg-bk-surface"
            }`}>
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold">{r.name}</span>
              <span className="font-mono text-[11.5px] text-bk-muted">#{r.login}</span>
              <span className={`text-[11px] font-semibold ${r.seen ? "text-ok" : "text-bad"}`}>
                {r.seen ? "EA connected" : "no EA yet"}
              </span>
              {r.remindedAt && (
                <span className="text-[11px] text-bk-muted">
                  reminded {new Date(r.remindedAt).toLocaleDateString()}
                  {r.remindCount ? ` · ${r.remindCount}×` : ""}
                </span>
              )}
            </div>
            <a href={r.wa} target="_blank" rel="noopener noreferrer" onClick={() => mark(r.id)}
              className={`rounded-bk px-3 py-1.5 text-[12px] font-bold ${
                pressed ? "bg-bk-sunken text-bk-muted" : "bg-accent text-white"
              }`}>
              {pressed ? "send again →" : "WhatsApp →"}
            </a>
          </div>
        )
      })}
    </div>
  )
}
