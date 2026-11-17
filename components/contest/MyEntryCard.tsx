"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { DICT, LANGS, LANG_LABEL, pickLang, type Lang } from "@/lib/contest/i18n"
import { Arrow } from "@/components/contest/icons"

// One card: the code, where the entry stands, and the way to the installer.
//
// Deliberately boring. It is read on a phone, usually in a hurry, often by
// somebody who has already forgotten what the code was for.

export default function MyEntryCard({
  contestTitle, entryNo, code, status, lastSeen, mtLogin, startAt,
}: {
  contestTitle: string
  entryNo: number
  code: string
  status: string
  lastSeen: string | null
  mtLogin: string
  startAt: string | null
}) {
  // Read after mount, never during the first render: localStorage does not
  // exist on the server, so a stored EN/ไทย choice would make every string
  // differ and cost the page its hydration (see ContestHome).
  const [lang, setLang] = useState<Lang>("lo")
  // `mounted` gates the one value only the reader's machine can produce: a
  // timestamp in their own timezone. Rendering it on the server too would
  // cost the page its hydration, and with it the dark class on <html>.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    try { setLang(pickLang(localStorage.getItem("semi.lang"))) } catch {}
  }, [])
  const t = DICT[lang]
  const [copied, setCopied] = useState(false)

  const line =
    status === "approved" || status === "active" ? { text: t.meStatusApproved, tone: "text-ok border-ok-line bg-ok-soft" }
    : status === "flagged" ? { text: t.meStatusFlagged, tone: "text-warn border-gold-line bg-gold-soft" }
    : status === "blown" ? { text: t.meStatusBlown, tone: "text-bad border-bk-line bg-bk-sunken" }
    : status === "disqualified" ? { text: t.meStatusDq, tone: "text-bad border-bk-line bg-bad-soft" }
    : { text: t.meStatusPending, tone: "text-bk-muted border-bk-line bg-bk-sunken" }

  return (
    <div className="mx-auto flex max-w-[440px] sm:max-w-[520px] flex-col gap-3 px-4 py-8">
      <div className="flex gap-0.5 self-end rounded-bk border border-bk-line bg-bk-sunken p-0.5">
        {LANGS.map(l => (
          <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
            className={`rounded-bk px-2 py-1 text-[11.5px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
        <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
        <div className="flex flex-col gap-3 p-4">
          <div>
            <h1 className="text-[18px] font-extrabold leading-[1.6]">{t.meTitle}</h1>
            <p className="mt-0.5 text-[12.5px] leading-[1.7] text-bk-muted">
              {contestTitle}{entryNo ? ` · #${entryNo}` : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] leading-[1.7] text-bk-muted">{t.yourCode}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(code).then(() => {
                  setCopied(true); setTimeout(() => setCopied(false), 1500)
                }).catch(() => {})
              }}
              className="rounded-bk border border-accent-line bg-accent-soft px-3 py-3 text-center font-mono text-[22px] font-extrabold tracking-[0.2em] text-accent-ink">
              {code || "—"}
            </button>
            {copied && <span className="text-[11.5px] font-semibold text-ok">{t.copied}</span>}
          </div>

          <p className={`rounded-bk border px-3 py-2 text-[12px] font-semibold leading-relaxed ${line.tone}`}>
            {line.text}
          </p>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] leading-[1.7]">
            <span className="text-bk-muted">{t.meAccount}</span>
            <span className="text-right font-mono">{mtLogin || "—"}</span>
            <span className="text-bk-muted">{lastSeen ? t.meSeen : ""}</span>
            <span className="text-right font-mono text-bk-muted">
              {lastSeen ? (mounted ? new Date(lastSeen).toLocaleString() : "…") : t.meNoSeen}
            </span>
            {startAt && (
              <>
                <span className="text-bk-muted">{t.meStarts}</span>
                <span className="text-right font-mono">{new Date(startAt).toISOString().slice(0, 10)}</span>
              </>
            )}
          </div>

          <Link href="/contest/install"
            className="rounded-bk bg-accent py-3 text-center text-[13px] font-bold text-white">
            {t.installNow} <Arrow />
          </Link>
          <Link href="/contest" className="text-center text-[12.5px] font-semibold text-bk-muted">
            {t.leaderboard}
          </Link>

          <p className="rounded-bk bg-bk-sunken px-3 py-2 text-[11.5px] leading-relaxed text-bk-muted">
            {t.meBookmark}
          </p>

          {/* The way out of the commonest mix-up: they registered on one
              Google account and came back signed in as another. */}
          <button onClick={() => signIn("google", { callbackUrl: "/contest/me" })}
            className="text-center text-[11.5px] font-semibold text-bk-muted underline underline-offset-2">
            {t.meSwitch}
          </button>
        </div>
      </div>
    </div>
  )
}
