"use client"

import { useState } from "react"
import Link from "next/link"
import { DICT, LANGS, LANG_LABEL, pickLang, type Lang } from "@/lib/contest/i18n"

// Registration, and the one screen where the entry code is ever shown.
//
// The code is displayed after a successful signup and is also stored on the
// entry, so the contestant can come back to /contest and read it again. It is
// never sent anywhere else: from here on the EA proves itself by signing its
// pushes with it.

type Existing = { entryNo?: number; displayName?: string; mtLogin?: string; entryCode?: string } | null

export default function RegisterForm({
  existing, contestTitle, earlyBirdCount, entries, open, requirements,
}: {
  existing: Existing
  contestTitle: string
  earlyBirdCount: number
  entries: number
  open: boolean
  requirements: {
    broker?: string; accountType?: string; symbol?: string
    startBalance?: number; currency?: string; signupUrl?: string
  }
}) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "lo"
    try { return pickLang(localStorage.getItem("semi.lang")) } catch { return "lo" }
  })
  const t = DICT[lang]

  const [form, setForm] = useState({ displayName: "", contact: "", country: "", mtLogin: "", mtServer: "" })
  const [done, setDone] = useState<{ code: string; entryNo: number; earlyBird: boolean } | null>(
    existing?.entryCode ? { code: existing.entryCode, entryNo: existing.entryNo ?? 0, earlyBird: (existing.entryNo ?? 99) <= earlyBirdCount } : null
  )
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const errText = (reason: string) => ({
    "already-registered": t.errAlready,
    "login-taken": t.errLogin,
    closed: t.errClosed,
    full: t.errFull,
  } as Record<string, string>)[reason] ?? t.errGeneric

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await fetch("/api/contest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const j = await r.json()
      if (!r.ok) { setErr(errText(j.reason ?? "")); return }
      setDone({ code: j.code, entryNo: j.entryNo, earlyBird: j.earlyBird })
    } catch {
      setErr(t.errGeneric)
    } finally {
      setBusy(false)
    }
  }

  const Lang = (
    <div className="flex gap-0.5 self-end rounded-bk border border-bk-line bg-bk-sunken p-0.5">
      {LANGS.map(l => (
        <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
          className={`rounded-bk px-2 py-1 text-[11.5px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  )

  if (done) {
    return (
      <div className="mx-auto flex max-w-[440px] flex-col gap-3 px-4 py-8">
        {Lang}
        <div className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
          <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
          <div className="flex flex-col gap-3 p-4">
            <h1 className="text-[17px] font-extrabold tracking-tight">{t.doneTitle}</h1>
            <p className="text-[12.5px] text-bk-muted">{contestTitle} · #{done.entryNo}</p>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] text-bk-muted">{t.yourCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(done.code).then(() => {
                    setCopied(true); setTimeout(() => setCopied(false), 1500)
                  }).catch(() => {})
                }}
                className="rounded-bk border border-accent-line bg-accent-soft px-3 py-3 text-center font-mono text-[22px] font-extrabold tracking-[0.2em] text-accent-ink">
                {done.code}
              </button>
              {copied && <span className="text-[11.5px] font-semibold text-ok">{t.copied}</span>}
            </div>

            <p className="text-[12px] leading-relaxed text-bk-muted">{t.doneBody}</p>
            {done.earlyBird && (
              <p className="rounded-bk bg-ok-soft px-3 py-2 text-[12px] font-semibold text-ok-ink">🎁 {t.earlyBirdYou}</p>
            )}

            <Link href="/contest" className="rounded-bk bg-accent py-3 text-center text-[13px] font-bold text-white">
              {t.leaderboard}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[440px] flex-col gap-3 px-4 py-8">
      {Lang}
      <form onSubmit={submit} className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
        <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
        <div className="flex flex-col gap-3 p-4">
          <div>
            <h1 className="text-[17px] font-extrabold tracking-tight">{t.register}</h1>
            <p className="mt-0.5 text-[12.5px] text-bk-muted">{contestTitle}</p>
          </div>

          {earlyBirdCount > 0 && entries < earlyBirdCount && (
            <p className="rounded-bk bg-accent-soft px-3 py-2 text-[12px] font-semibold text-accent-ink">
              🎁 {t.spotsLeft}: {earlyBirdCount - entries} / {earlyBirdCount}
            </p>
          )}

          {!open && (
            <p className="rounded-bk bg-bad-soft px-3 py-2 text-[12px] font-semibold text-bad">{t.errClosed}</p>
          )}

          {/* The account has to exist and be funded correctly BEFORE this form
              is any use: the EA reports the starting balance and a wrong one is
              visible on day one. */}
          <div className="rounded-bk border border-bk-line bg-bk-sunken p-3">
            <h2 className="mb-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-bk-muted">{t.requirements}</h2>
            <ul className="flex flex-col gap-1 text-[12.5px]">
              <li>• {requirements.broker} {requirements.accountType} ({t.demo})</li>
              <li>• {t.startingBalance}: <b className="font-mono">
                {typeof requirements.startBalance === "number"
                  ? (requirements.currency === "USD" ? "$" : "") + requirements.startBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "—"}</b></li>
              <li>• Symbol: {requirements.symbol}</li>
            </ul>
            {requirements.signupUrl && (
              <a href={requirements.signupUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block text-[12px] font-bold text-accent underline underline-offset-2">
                {t.openAccount} ↗
              </a>
            )}
          </div>

          {([
            ["displayName", t.name, "text", "Souk T."],
            ["contact", t.contact, "text", "@username"],
            ["country", t.country, "text", "Laos"],
            ["mtLogin", t.mtLogin, "numeric", "530016764"],
            ["mtServer", t.mtServer, "text", "Exness-MT5Trial9"],
          ] as const).map(([k, label, mode, ph]) => (
            <label key={k} className="flex flex-col gap-1.5">
              <span className="text-[12px] text-bk-muted">{label}</span>
              <input
                value={form[k]} onChange={set(k)} placeholder={ph} autoComplete="off"
                inputMode={mode === "numeric" ? "numeric" : "text"}
                className="w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          ))}

          {err && <p className="rounded-bk bg-bad-soft px-3 py-2 text-[12px] font-semibold text-bad">{err}</p>}

          <button type="submit"
            disabled={busy || !open || !form.displayName || !form.contact || !form.mtLogin}
            className="rounded-bk bg-accent py-3 text-[13px] font-bold text-white disabled:opacity-40">
            {busy ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
