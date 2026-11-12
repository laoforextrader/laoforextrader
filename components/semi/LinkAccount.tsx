"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DICT, LANGS, LANG_LABEL, pickLang, type Lang } from "@/lib/semi/i18n"

// The only screen where the dashboard key is typed. After this the EA proves
// itself with a signature and the key never travels again.
export default function LinkAccount() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en"
    try { return pickLang(localStorage.getItem("semi.lang")) } catch { return "en" }
  })
  const [account, setAccount] = useState("")
  const [key, setKey] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const t = DICT[lang]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await fetch("/api/semi/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, key }),
      })
      const j = await r.json()
      if (!r.ok) { setErr(j.error ?? "failed"); return }
      router.refresh()
    } catch {
      setErr("network error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-[440px] flex-col gap-3 px-4 py-8">
      <div className="flex justify-end gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5 self-end">
        {LANGS.map(l => (
          <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("semi.lang", l) } catch {} }}
            className={`rounded-bk px-2.5 py-1 text-[12px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
        <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
        <div className="flex flex-col gap-3 p-4">
          <h1 className="text-[17px] font-extrabold tracking-tight">{t.link}</h1>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-bk-muted">{t.acctNo}</span>
            <input value={account} onChange={e => setAccount(e.target.value)} inputMode="numeric"
              placeholder="58036019" autoComplete="off"
              className="w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-bk-muted">{t.key}</span>
            <input value={key} onChange={e => setKey(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" spellCheck={false}
              className="w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent" />
          </label>

          <p className="text-[11.5px] leading-relaxed text-bk-muted">{t.keyHelp}</p>
          {err && <p className="rounded-bk bg-bad-soft px-3 py-2 text-[12px] font-semibold text-bad">{err}</p>}

          <button type="submit" disabled={busy || !account || !key}
            className="rounded-bk bg-accent py-3 text-[13px] font-bold text-white disabled:opacity-40">
            {t.connect}
          </button>
        </div>
      </form>
    </div>
  )
}
