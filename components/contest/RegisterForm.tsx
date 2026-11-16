"use client"

import { useState } from "react"
import Link from "next/link"
import { DICT, LANGS, LANG_LABEL, loc, pickLang, type Lang } from "@/lib/contest/i18n"
import { Dot, Ban, Shield, Arrow, External } from "@/components/contest/icons"
import type { ContestRule } from "@/lib/contest/store"

// Registration, and the one screen where the entry code is ever shown.
//
// The code is displayed after a successful signup and is also stored on the
// entry, so the contestant can come back to /contest and read it again. It is
// never sent anywhere else: from here on the EA proves itself by signing its
// pushes with it.

type Existing = { entryNo?: number; displayName?: string; mtLogin?: string; entryCode?: string } | null

export default function RegisterForm({
  existing, contestTitle, earlyBirdCount, entries, open, full, rules, seats, requirements,
}: {
  existing: Existing
  contestTitle: string
  earlyBirdCount: number
  entries: number
  open: boolean
  /** Seats gone, as distinct from the round being closed for another reason. */
  full: boolean
  /** The round's own rules, written by the owner in all three languages. */
  rules: ContestRule[]
  seats: number
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

  const [form, setForm] = useState({ displayName: "", contact: "", country: "", mtLogin: "", mtServer: "", investor: "" })
  //  Almost every contestant is in Laos, where mobile numbers are 20 XXXX XXXX.
  //  The prefix is shown rather than typed, so nobody has to think about the
  //  country code — but anyone outside Laos can switch and type it in full.
  const [lao, setLao] = useState(true)
  const waNumber = lao ? "85620" + form.contact.replace(/\D/g, "") : form.contact.replace(/\D/g, "")
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
    "phone-taken": t.errPhone,
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
        body: JSON.stringify({ ...form, contact: waNumber }),
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
            <p className="rounded-bk bg-bk-sunken px-3 py-2 text-[12px] leading-relaxed text-bk-muted">{t.pendingNote}</p>
            {done.earlyBird && (
              <p className="rounded-bk bg-gold-soft px-3 py-2 text-[12px] font-semibold text-gold-ink">{t.perkYours}</p>
            )}

            {/* Installing is the next thing that has to happen — the board
                has nothing on it for them yet. */}
            <Link href="/contest/install"
              className="rounded-bk bg-accent py-3 text-center text-[13px] font-bold text-white">
              {t.installNow} →
            </Link>
            <Link href="/contest" className="text-center text-[12.5px] font-semibold text-bk-muted">
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
            <p className="rounded-bk bg-bad-soft px-3 py-2 text-[12px] font-semibold text-bad">
              {full ? t.seatsFull : t.errClosed}
            </p>
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


          {/* How to join — four steps, because the fifth was "watch the
              board", which is not something anyone has to be told. */}
          <section>
            <h2 className="mb-2.5 text-[13px] font-extrabold uppercase tracking-wide">{t.howTitle}</h2>
            <div>
              {t.how.map((step: string, i: number) => (
                <div key={i} className="grid grid-cols-[26px_1fr] gap-3 border-t border-bk-line py-3 first:border-t-0">
                  <span className="grid h-[26px] w-[26px] place-items-center rounded-bk border border-[#233155] bg-[#121b33] font-mono text-[12px] font-semibold text-[#a9c0ff]">
                    {i + 1}
                  </span>
                  <p className="m-0 mt-[3px] text-[13.5px] leading-[1.6] text-bk-muted">
                    {step}
                    {i === 0 && requirements.signupUrl && (
                      <a href={requirements.signupUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent">
                        {t.openAccount} <External />
                      </a>
                    )}
                    {i === 3 && (
                      <Link href="/contest/install" className="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent">
                        {t.installTitle} <Arrow />
                      </Link>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* The rules, from the round document. Hard rules carry the ban
              mark so the three that disqualify stand out from the five that
              describe. */}
          {rules.length > 0 && (
            <section>
              <h2 className="mb-2.5 text-[13px] font-extrabold uppercase tracking-wide">{t.rules}</h2>
              <ul className="m-0 grid list-none gap-px overflow-hidden rounded-bk border border-bk-line bg-bk-line p-0">
                {rules.map((r, i) => {
                  const text = loc(r.text, lang)
                  const hard = /ຕັດສິດ|ຫ້າມ|ตัดสิทธิ์|ห้าม|disqualif|No deposits|no other EA/i.test(text)
                  const checked = /ກວດສອບ|ตรวจสอบ|checked/i.test(text)
                  return (
                    <li key={i} className="grid grid-cols-[18px_1fr] gap-2.5 bg-bk-surface px-3.5 py-3 text-[13px] leading-[1.6] text-bk-muted">
                      <span className={`mt-[2px] text-[15px] ${hard ? "text-bad" : checked ? "text-ok" : "text-bk-muted"}`}>
                        {hard ? <Ban /> : checked ? <Shield /> : <Dot />}
                      </span>
                      <span>{text}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <h2 className="mt-1 text-[13px] font-extrabold uppercase tracking-wide">{t.applicant}</h2>

          {([
            ["displayName", t.name, "text", "Souk T."],
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

          {/* WhatsApp, with the Lao country code and mobile prefix supplied.
              Stored in full international form so a wa.me link just works. */}
          <label className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between text-[12px] text-bk-muted">
              {t.contact}
              <button type="button" onClick={() => { setLao(!lao); setForm(f => ({ ...f, contact: "" })) }}
                className="text-[11px] font-semibold text-accent underline underline-offset-2">
                {lao ? t.intlNumber : t.laoNumber}
              </button>
            </span>
            <div className="flex items-stretch gap-0">
              {lao && (
                <span className="flex items-center rounded-l-bk border border-r-0 border-bk-line bg-bk-sunken px-3 font-mono text-[15px] text-bk-muted">
                  +856 20
                </span>
              )}
              <input
                value={form.contact}
                onChange={e => setForm(f => ({ ...f, contact: e.target.value.replace(/[^\d+]/g, "") }))}
                placeholder={lao ? "12345678" : "+66812345678"}
                inputMode="tel" autoComplete="tel"
                className={`w-full border border-bk-line bg-bk-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent ${lao ? "rounded-r-bk" : "rounded-bk"}`}
              />
            </div>
            <span className="text-[11px] leading-relaxed text-bk-muted">{t.contactHelp}</span>
          </label>

          {/* The read-only password. Asked for here rather than from the
              winners at the end: checking the account before the start is
              what lets an entry be approved in advance, and nobody has to
              hand over anything once there is prize money on the line. */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-bk-muted">{t.investor}</span>
            <input
              type="password" value={form.investor} onChange={set("investor")}
              autoComplete="off" spellCheck={false}
              className="w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-[11px] leading-relaxed text-bk-muted">{t.investorHelp}</span>
          </label>

          {err && <p className="rounded-bk bg-bad-soft px-3 py-2 text-[12px] font-semibold text-bad">{err}</p>}

          <button type="submit"
            disabled={busy || !open || !form.displayName || waNumber.length < 8 || !form.mtLogin || !form.investor}
            className="rounded-bk bg-accent py-3 text-[13px] font-bold text-white disabled:opacity-40">
            {busy ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
