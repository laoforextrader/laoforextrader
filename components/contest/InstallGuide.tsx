"use client"

import { useState } from "react"
import Link from "next/link"
import { DICT, LANGS, LANG_LABEL, pickLang, type Lang } from "@/lib/contest/i18n"
import { Alert, Copy, Check, Arrow } from "@/components/contest/icons"

// How to get the contest EA running.
//
// Written against the two things that actually go wrong, both of which cost
// real support time before: a VPS opens cmd rather than PowerShell, so the
// long form of the command is given as its own block rather than buried in a
// note; and WebRequest is off by default, which lets the EA trade while
// reporting nothing — the one failure that looks like success.

function Cmd({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="flex items-start gap-3 rounded-bk border border-bk-line bg-[#04070d] p-3.5">
      <code className="min-w-0 flex-1 break-all font-mono text-[12px] leading-[1.65] text-[#8fc8ff]">{text}</code>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(text)
            .then(() => { setDone(true); setTimeout(() => setDone(false), 1600) })
            .catch(() => {})
        }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-bk border border-bk-line bg-bk-sunken px-2.5 py-1.5 text-[11px] font-semibold text-bk-muted"
      >
        {done ? <Check /> : <Copy />} {label}
      </button>
    </div>
  )
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[26px_1fr] gap-3 border-t border-bk-line py-3 first:border-t-0">
      <span className="grid h-[26px] w-[26px] place-items-center rounded-bk border border-[#233155] bg-[#121b33] font-mono text-[12px] font-semibold text-[#a9c0ff]">
        {n}
      </span>
      <p className="m-0 mt-[3px] text-[13.5px] leading-[1.6] text-bk-muted">{children}</p>
    </div>
  )
}

export default function InstallGuide({
  installUrl, symbol, hasEntry, entryCode,
}: {
  installUrl: string
  symbol: string
  hasEntry: boolean
  entryCode: string | null
}) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "lo"
    try { return pickLang(localStorage.getItem("semi.lang")) } catch { return "lo" }
  })
  const t = DICT[lang]

  const short = `irm ${installUrl} | iex`
  const long = `powershell -NoProfile -ExecutionPolicy Bypass -Command "irm ${installUrl} | iex"`

  return (
    <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-8">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ok">
          <span className="h-[7px] w-[7px] rounded-full bg-ok shadow-[0_0_0_3px_rgba(46,203,148,0.16)]" />
          {t.afterApproval}
        </span>
        <div className="flex shrink-0 gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5">
          {LANGS.map(l => (
            <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
              className={`rounded-bk px-2 py-1 text-[11px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      <h1 className="mt-3 text-[24px] font-bold leading-[1.3] tracking-[-0.01em]">{t.installTitle}</h1>
      <p className="mt-2 text-[14px] leading-[1.7] text-bk-muted">{t.installLede}</p>

      {!entryCode && (
        /* They almost always arrive here from WhatsApp on a different
           machine, signed out. Without this the code is unreachable from
           the page that tells them to type it in. */
        <Link href="/contest/me"
          className="mt-3 inline-flex items-center gap-2 rounded-bk border border-accent-line bg-accent-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-accent-ink">
          {t.yourCode} <Arrow />
        </Link>
      )}
      {entryCode && (
        <p className="mt-4 inline-block rounded-bk bg-ok-soft px-3.5 py-2.5 text-[13px] font-semibold text-ok-ink">
          {t.yourCode}: <span className="font-mono tracking-[0.15em]">{entryCode}</span>
        </p>
      )}

      <section className="mt-6 border-t border-bk-line pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[16px] font-bold">1 · {t.dl1}</h2>
          <span className="text-[11.5px] text-bk-muted">PowerShell</span>
        </div>
        <Cmd text={short} label={t.copy} />
        <p className="mt-2.5 text-[11.5px] leading-[1.55] text-bk-muted">{t.dlCmdNote}</p>
        <div className="mt-2">
          <Cmd text={long} label={t.copy} />
        </div>
        <p className="mt-2.5 text-[11.5px] leading-[1.55] text-bk-muted">{t.dlAfter}</p>
      </section>

      <section className="mt-6 border-t border-bk-line pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[16px] font-bold">2 · {t.web1}</h2>
          <span className="text-[11.5px] text-bk-muted">{t.webOnce}</span>
        </div>
        <div className="flex gap-3 rounded-bk border border-gold-line bg-gold-soft px-3.5 py-3 text-[12.5px] leading-[1.6] text-gold-ink">
          <span className="mt-[1px] shrink-0 text-[17px] text-gold"><Alert /></span>
          <span>{t.webWarn}</span>
        </div>
        <div className="mt-3">
          <Step n="a">{t.webA}</Step>
          <Step n="b">{t.webB}</Step>
          <Step n="c">{t.webC}</Step>
        </div>
      </section>

      <section className="mt-6 border-t border-bk-line pt-6">
        <h2 className="mb-3 text-[16px] font-bold">3 · {t.run1}</h2>
        <Step n="a">{t.runA.replace("XAUUSDm", symbol)}</Step>
        <Step n="b">{t.runB}</Step>
        <Step n="c">{t.runC}</Step>
      </section>

      <section className="mt-6 border-t border-bk-line pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[16px] font-bold">4 · {t.chk1}</h2>
          <span className="text-[11.5px] text-bk-muted">{t.chkIn}</span>
        </div>
        {/* What the panel looks like when it is right — the fastest way for
            someone to tell whether they are finished. */}
        <div className="rounded-bk border border-bk-line bg-[#04070d] p-3.5 font-mono text-[12px] leading-[1.9] text-bk-muted">
          <div><span className="inline-block w-[74px] text-bk-muted">CONTEST</span><span className="text-gold">Round 1</span></div>
          <div><span className="inline-block w-[74px] text-bk-muted">status</span><span className="text-ok">connected</span></div>
          <div><span className="inline-block w-[74px] text-bk-muted">rank</span>3 / 14</div>
          <div><span className="inline-block w-[74px] text-bk-muted">symbol</span>{symbol}</div>
        </div>
        <p className="mt-2.5 text-[11.5px] leading-[1.55] text-bk-muted">{t.chkNote}</p>
      </section>

      {!hasEntry && (
        <section className="mt-6 border-t border-bk-line pt-6">
          <Link href="/contest/register"
            className="inline-flex items-center gap-2 rounded-bk bg-accent px-5 py-3.5 text-[14px] font-semibold text-white">
            {t.register} <Arrow />
          </Link>
        </section>
      )}
    </div>
  )
}
