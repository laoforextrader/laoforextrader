"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DICT, LANGS, LANG_LABEL, pickLang, type Lang } from "@/lib/semi/i18n"

// Shown when the signed-in user owns accounts but this browser is not
// unlocked for any of them.
//
// Before this existed the page fell straight back to the key form, which is
// indistinguishable from "Connect did nothing" — the exact report that
// brought us here. The form is still the way in, because the second lock is
// the point of the design, but now it says which accounts are already linked
// and how each key ends, so somebody who typed the wrong one can see that
// rather than guess.

export default function AccountPicker({
  accounts, justLinked,
}: {
  accounts: Array<{ account: string; keyTail?: string; lastSeen?: string }>
  /** True when we have just come back from a successful link. */
  justLinked: boolean
}) {
  const [lang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en"
    try { return pickLang(localStorage.getItem("semi.lang")) } catch { return "en" }
  })
  const [account, setAccount] = useState(accounts[0]?.account ?? "")
  //  A second trading account on the same Google sign-in is normal — the
  //  list used to be the only way in, so an account that was not already
  //  linked could not be reached from this screen at all.
  const [adding, setAdding] = useState(false)
  const [fresh, setFresh] = useState("")
  const [key, setKey] = useState("")
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const t = DICT[lang]
  //  One value for both ways of choosing, so the form below never has to
  //  know which one the user used.
  const chosen = adding ? fresh.trim() : account

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await fetch("/api/semi/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: chosen, key, remember }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(j.error ?? "failed"); return }
      // A full navigation, not router.refresh(): the cookie was set on this
      // response, and a hard load is the one thing guaranteed to send it back.
      window.location.href = "/semi?linked=1"
    } catch {
      setErr("network error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-[440px] flex-col gap-3 px-4 py-8">
      <div className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
        <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
        <div className="flex flex-col gap-3 p-4">
          <h1 className="text-[17px] font-extrabold tracking-tight">{t.link}</h1>

          {justLinked && (
            <p className="rounded-bk bg-warn-soft px-3 py-2.5 text-[12px] font-semibold leading-relaxed text-warn-ink">
              {t.cookieBlocked}
            </p>
          )}

          {/* What is already linked to this Google account. Seeing the
              account here is the difference between "it did nothing" and
              "it worked, this browser just is not unlocked". */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-bk-muted">{t.yourAccounts}</span>
            <div className="flex flex-col gap-1.5">
              {accounts.map(a => (
                <label key={a.account}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-bk border px-3 py-2.5 ${
                    account === a.account ? "border-accent bg-accent-soft" : "border-bk-line bg-bk-sunken"
                  }`}>
                  <input type="radio" name="acct" value={a.account}
                    checked={!adding && account === a.account}
                    onChange={() => { setAdding(false); setAccount(a.account) }}
                    className="h-4 w-4 shrink-0 accent-[var(--accent)]" />
                  <span className="font-mono text-[14px] font-semibold">{a.account}</span>
                  {a.keyTail && (
                    <span className="ml-auto font-mono text-[11.5px] text-bk-muted">····{a.keyTail}</span>
                  )}
                </label>
              ))}

              {/* Another account on the same Google sign-in. Kept in the same
                  radio group so it reads as one choice, not a second form. */}
              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-bk border px-3 py-2.5 ${
                  adding ? "border-accent bg-accent-soft" : "border-dashed border-bk-line bg-bk-sunken"
                }`}>
                <input type="radio" name="acct" checked={adding}
                  onChange={() => setAdding(true)}
                  className="h-4 w-4 shrink-0 accent-[var(--accent)]" />
                <span className="text-[13px] font-semibold">+ {t.addAnother}</span>
              </label>

              {adding && (
                <input
                  value={fresh} onChange={e => setFresh(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric" autoFocus placeholder={t.acctNew}
                  autoComplete="off" spellCheck={false}
                  className="w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent" />
              )}
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-bk-muted">{t.key}</span>
              <input value={key} onChange={e => setKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" spellCheck={false}
                className="w-full rounded-bk border border-bk-line bg-bk-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <p className="text-[11.5px] leading-relaxed text-bk-muted">{t.keyHelp}</p>

            <label className="flex cursor-pointer items-center gap-2 rounded-bk border border-bk-line bg-bk-sunken px-3 py-2.5">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[var(--accent)]" />
              <span className="text-[12px] font-semibold">{t.remember}</span>
            </label>

            {err && <p className="rounded-bk bg-bad-soft px-3 py-2 text-[12px] font-semibold text-bad">{err}</p>}

            <button type="submit" disabled={busy || !chosen || !key}
              className="rounded-bk bg-accent py-3 text-[13px] font-bold text-white disabled:opacity-40">
              {t.connect}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
