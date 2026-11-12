"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { DICT, LANGS, LANG_LABEL, pickLang, type Lang } from "@/lib/semi/i18n"

// The control panel. Polls /api/semi/state, which doubles as the "someone is
// watching" signal — the EA sees it in its next reply and speeds up to a
// 3-second heartbeat, so the poll interval here is what actually sets how live
// the screen feels. 3s while the tab is visible, paused when it is not: a
// hidden tab that keeps polling would hold the EA at its fastest rate for
// nothing.

type Side = {
  side: "BUY" | "SELL"; state: "IDLE" | "ACTIVE" | "STOPPED"
  level: number; lots: number; pl: number; scale: number; rounds: number
  be?: number; target?: number; toGo?: number; targetUsd?: number
}
type Snapshot = {
  acct?: { login?: string; name?: string; broker?: string; symbol?: string; digits?: number; algoOn?: boolean }
  money?: { balance?: number; equity?: number; floating?: number; freeMargin?: number }
  state?: {
    mode?: string; guardPct?: number; guardHit?: boolean; firstLot?: number
    gridPips?: number; scale?: number; fullBasketLots?: number; overCap?: boolean
  }
  meters?: { trend?: string; trendForce?: number; trendMeter?: number; speed?: number; atr?: number; spread?: number }
  sides?: Side[]
  positions?: Array<{ t: number; side: string; lot: number; open: number; pl: number; at: number }>
}
type Round = { id: number; side: string; opened: number; closed: number; depth: number; lots: number; pl: number; by: string }
type Feed = {
  account: string; owner: string | null; online: boolean; ageSec: number | null
  state: Snapshot | null; rounds: Round[]; pendingCmd: string | null
}

const money = (n: number | undefined, d = 2) =>
  n === undefined || n === null || Number.isNaN(n)
    ? "—"
    : (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })

export default function SemiDashboard({ account }: { account: string }) {
  const [lang, setLang] = useState<Lang>("en")
  const [feed, setFeed] = useState<Feed | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [tab, setTab] = useState<"dash" | "hist">("dash")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = DICT[lang]

  useEffect(() => {
    try { setLang(pickLang(localStorage.getItem("semi.lang"))) } catch {}
  }, [])
  const chooseLang = (l: Lang) => {
    setLang(l)
    try { localStorage.setItem("semi.lang", l) } catch {}
  }

  const poll = useCallback(async () => {
    try {
      const r = await fetch(`/api/semi/state?acc=${encodeURIComponent(account)}`, { cache: "no-store" })
      if (r.ok) setFeed(await r.json())
    } catch {
      /* a dropped poll is not an error worth showing — the next one recovers */
    }
    timer.current = setTimeout(poll, document.visibilityState === "visible" ? 3000 : 20000)
  }, [account])

  useEffect(() => {
    poll()
    const onVis = () => { if (document.visibilityState === "visible") { if (timer.current) clearTimeout(timer.current); poll() } }
    document.addEventListener("visibilitychange", onVis)
    return () => { if (timer.current) clearTimeout(timer.current); document.removeEventListener("visibilitychange", onVis) }
  }, [poll])

  async function send(cmd: string, lot = 0) {
    setBusy(true)
    try {
      const r = await fetch("/api/semi/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, cmd, lot }),
      })
      const j = await r.json()
      setToast(r.ok ? (j.online ? t.sent : t.offlineNote) : (j.error ?? t.failed))
    } catch {
      setToast(t.failed)
    } finally {
      setBusy(false)
      setTimeout(() => setToast(null), 4000)
      if (timer.current) clearTimeout(timer.current)
      poll()
    }
  }

  const s = feed?.state ?? null
  const st = s?.state ?? {}
  const m = s?.meters ?? {}
  const money_ = s?.money ?? {}
  const sides = s?.sides ?? []
  const mode = (st.mode ?? "SEMI").toUpperCase()
  const lot = st.firstLot ?? 0.01
  const grid = st.gridPips ?? 150
  const guard = st.guardPct ?? 0

  const Chip = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
      ok ? "bg-ok-soft text-ok" : "bg-bk-sunken text-fg-4 border border-bk-line"}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-ok" : "bg-fg-4"}`} />{children}
    </span>
  )

  const Meter = ({ label, frac, value, color, bipolar }: {
    label: string; frac: number; value: string; color: string; bipolar?: boolean
  }) => {
    const w = Math.min(Math.abs(frac), 1) * (bipolar ? 50 : 100)
    const left = bipolar ? (frac >= 0 ? 50 : 50 - w) : 0
    return (
      <div className="grid grid-cols-[54px_1fr_62px] items-center gap-2">
        <span className="text-[11px] text-bk-muted">{label}</span>
        <span className="relative block h-1.5 overflow-hidden rounded-full bg-bk-track">
          <i className="absolute inset-y-0 block rounded-full" style={{ left: `${left}%`, width: `${w}%`, background: color }} />
        </span>
        <span className="text-right font-mono text-[11px] tabular-nums">{value}</span>
      </div>
    )
  }

  const Stepper = ({ label, value, cmd, step, min, max }: {
    label: string; value: number; cmd: string; step: number; min: number; max: number
  }) => (
    <div className="rounded-bk border border-bk-line bg-bk-sunken p-2 text-center">
      <div className="text-[9px] font-bold uppercase tracking-[0.09em] text-fg-4">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-1">
        <button disabled={busy} onClick={() => send(cmd, Math.max(min, +(value - step).toFixed(2)))}
          className="h-6 w-6 rounded-md border border-bk-line bg-bk-surface text-[14px] leading-none disabled:opacity-40">−</button>
        <span className="min-w-0 flex-1 font-mono text-[12.5px] font-bold tabular-nums">
          {cmd === "SET_GRID" ? `${value}p` : cmd === "SET_GUARD" ? `${value}%` : value.toFixed(2)}
        </span>
        <button disabled={busy} onClick={() => send(cmd, Math.min(max, +(value + step).toFixed(2)))}
          className="h-6 w-6 rounded-md border border-bk-line bg-bk-surface text-[14px] leading-none disabled:opacity-40">+</button>
      </div>
    </div>
  )

  const SideCard = ({ d }: { d: Side }) => {
    const isBuy = d.side === "BUY"
    const label = d.state === "ACTIVE" ? t.active : d.state === "STOPPED" ? t.stopped : t.idle
    return (
      <details className="rounded-bk border border-bk-line bg-bk-sunken">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-2.5">
          <b className={`text-[11.5px] font-extrabold tracking-wider ${isBuy ? "text-ok" : "text-bad"}`}>{d.side}</b>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            d.state === "ACTIVE" ? "bg-accent-soft text-accent-ink"
            : d.state === "STOPPED" ? "bg-warn-soft text-warn" : "bg-bk-surface text-fg-4 border border-bk-line"}`}>{label}</span>
          {d.level > 0
            ? <>
                <span className="font-mono text-[11.5px] tabular-nums">Lv{d.level} · {d.lots.toFixed(2)}L</span>
                <span className={`ml-auto font-mono text-[11.5px] tabular-nums ${d.pl >= 0 ? "text-ok" : "text-bad"}`}>{money(d.pl)}</span>
              </>
            : <span className="ml-auto font-mono text-[11.5px] text-fg-4">{t.flat}</span>}
        </summary>
        {d.level > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-2.5 pb-2 text-[11px] text-bk-muted">
            <span className="flex justify-between">{t.be}<b className="font-mono text-fg">{d.be?.toFixed(2) ?? "—"}</b></span>
            <span className="flex justify-between">{t.target}<b className="font-mono text-fg">{d.target?.toFixed(2) ?? money(d.targetUsd)}</b></span>
            <span className="flex justify-between">{t.toGo}<b className="font-mono text-fg">{d.toGo != null ? `${d.toGo}p` : "—"}</b></span>
            <span className="flex justify-between">{t.lots}<b className="font-mono text-fg">{d.lots.toFixed(2)}</b></span>
          </div>
        )}
        <div className="flex gap-1.5 px-2.5 pb-2.5">
          <button disabled={busy} onClick={() => send(isBuy ? "CLOSE_BUY" : "CLOSE_SELL")}
            className="flex-1 rounded-md border border-bk-line bg-bk-surface py-1.5 text-[11.5px] font-bold disabled:opacity-40">{t.close}</button>
          <button disabled={busy} onClick={() => send(isBuy ? "STOP_BUY" : "STOP_SELL")}
            className="flex-1 rounded-md border border-bk-line bg-bk-surface py-1.5 text-[11.5px] font-bold disabled:opacity-40">{t.stop}</button>
        </div>
      </details>
    )
  }

  return (
    <div className="mx-auto flex max-w-[520px] flex-col gap-2.5 px-4 py-4 lg:max-w-[1100px]">
      {/* language + tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(["dash", "hist"] as const).map(k => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-bk border px-3 py-1.5 text-[12.5px] font-bold ${
                tab === k ? "border-accent-line bg-accent-soft text-accent-ink" : "border-bk-line bg-bk-surface text-bk-muted"}`}>
              {k === "dash" ? t.dash : t.history}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5">
          {LANGS.map(l => (
            <button key={l} onClick={() => chooseLang(l)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-bold ${lang === l ? "bg-accent text-white" : "text-bk-muted"}`}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      {!feed && <p className="py-10 text-center text-[13px] text-fg-3">{t.waiting}</p>}

      {feed && (
        <div className="grid gap-2.5 lg:grid-cols-3 lg:items-start">
          {/* ── account + money ── */}
          <div className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
            <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-extrabold">{feed.owner ?? t.owner}</div>
                  <div className="truncate font-mono text-[10.5px] text-bk-muted">
                    #{feed.account} · {s?.acct?.broker ?? ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Chip ok={feed.online}>{feed.online ? t.online : t.offline}</Chip>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase text-accent-ink">{mode}</span>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">{t.equity}</div>
                  <div className="font-mono text-[25px] font-extrabold leading-tight tabular-nums tracking-tight">{money(money_.equity)}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-[13px] font-bold tabular-nums ${(money_.floating ?? 0) >= 0 ? "text-ok" : "text-bad"}`}>
                    {money(money_.floating)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-fg-4">{t.floating}</div>
                </div>
              </div>
              <div className="mt-2 flex justify-between border-t border-bk-line pt-2 text-[11.5px] text-bk-muted">
                <span>{t.balance} <b className="font-mono text-fg">{money(money_.balance, 0)}</b></span>
                <span>{t.free} <b className="font-mono text-fg">{money(money_.freeMargin, 0)}</b></span>
                <span className="font-mono text-fg-4">{feed.ageSec ?? "—"}{t.secAgo}</span>
              </div>
              {s?.acct?.algoOn === false && (
                <p className="mt-2 rounded-bk bg-bad-soft px-2 py-1.5 text-[11px] font-semibold text-bad">{t.algoOff}</p>
              )}
              {st.guardHit && (
                <p className="mt-2 rounded-bk bg-warn-soft px-2 py-1.5 text-[11px] font-semibold text-warn">{t.guardHit}</p>
              )}
            </div>
          </div>

          {tab === "dash" ? (
            <>
              {/* ── meters ── */}
              <div className="rounded-bk border border-bk-line bg-bk-surface p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">{t.meters}</div>
                <div className="flex flex-col gap-1.5">
                  <Meter label={t.trend} bipolar frac={m.trendMeter ?? 0} color="var(--danger)"
                    value={`${(m.trendForce ?? 0).toFixed(2)}x`} />
                  <Meter label={t.speed} frac={(m.speed ?? 0) / 30} color="var(--accent)" value={`${(m.speed ?? 0).toFixed(1)} p/s`} />
                  <Meter label={t.atr} frac={(m.atr ?? 0) / 12} color="var(--accent)" value={(m.atr ?? 0).toFixed(2)} />
                  <Meter label={t.spread} frac={(m.spread ?? 0) / 120} color="var(--warn)" value={`${(m.spread ?? 0).toFixed(0)}p`} />
                  <Meter label={t.guard} frac={guard / 100} color="var(--success)" value={`${guard.toFixed(0)}%`} />
                </div>
              </div>

              {/* ── mode → setup → engines → actions ── */}
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-0.5 rounded-bk border border-bk-line bg-bk-sunken p-0.5">
                  {t.modes.map((label, i) => {
                    const want = ["MANUAL", "SEMI", "AUTO"][i]
                    return (
                      <button key={want} disabled={busy} onClick={() => send(`MODE_${want}`)}
                        className={`flex-1 rounded-md py-2 text-[12.5px] font-bold disabled:opacity-40 ${
                          mode === want ? "bg-accent text-white" : "text-bk-muted"}`}>{label}</button>
                    )
                  })}
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">{t.setup}</span>
                    <span className="font-mono text-[10px] text-bk-muted">
                      {t.ladder} ×{(st.scale ?? 1).toFixed(2)} · {t.fullBasket} {(st.fullBasketLots ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Stepper label={t.firstLot} value={lot}   cmd="SET_LOT"   step={0.01} min={0.01} max={100} />
                    <Stepper label={t.grid}     value={grid}  cmd="SET_GRID"  step={10}   min={10}   max={5000} />
                    <Stepper label={t.guard}    value={guard} cmd="SET_GUARD" step={5}    min={0}    max={95} />
                  </div>
                  <button disabled={busy} onClick={() => send("RESET")}
                    className="mt-1.5 w-full rounded-bk border border-bk-line bg-bk-surface py-1.5 text-[11.5px] font-bold text-bk-muted disabled:opacity-40">
                    {t.reset}
                  </button>
                  {st.overCap && <p className="mt-1.5 text-[11px] font-semibold text-warn">{t.overCap}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">{t.engines}</div>
                  {sides.map(d => <SideCard key={d.side} d={d} />)}
                </div>

                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => send("BUY", lot)}
                    className="flex-1 rounded-bk bg-ok py-3 text-[13.5px] font-extrabold text-white disabled:opacity-40">
                    {t.buy} {lot.toFixed(2)}
                  </button>
                  <button disabled={busy} onClick={() => send("SELL", lot)}
                    className="flex-1 rounded-bk bg-bad py-3 text-[13.5px] font-extrabold text-white disabled:opacity-40">
                    {t.sell} {lot.toFixed(2)}
                  </button>
                </div>
                <button disabled={busy}
                  onClick={() => { if (window.confirm(t.confirmClose)) send("CLOSE_ALL") }}
                  className="rounded-bk border border-bad bg-bad-soft py-2.5 text-[12.5px] font-bold text-bad disabled:opacity-40">
                  {t.closeAll}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* ── open positions first, then history ── */}
              <div className="overflow-hidden rounded-bk border border-bk-line bg-bk-surface">
                <div className="h-[3px] bg-gradient-to-r from-ok to-accent" />
                <div className="p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">{t.openPos}</div>
                  {(s?.positions ?? []).length === 0 && <p className="py-2 text-[12px] text-fg-4">{t.nothing}</p>}
                  {(s?.positions ?? []).map(p => (
                    <div key={p.t} className="flex items-center gap-2 border-t border-bk-line py-2 first:border-t-0">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                        p.side === "BUY" ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`}>{p.side}</span>
                      <span className="flex-1 font-mono text-[11.5px] tabular-nums">{p.lot.toFixed(2)} @ {p.open.toFixed(2)}</span>
                      <span className={`font-mono text-[11.5px] tabular-nums ${p.pl >= 0 ? "text-ok" : "text-bad"}`}>{money(p.pl)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-bk border border-bk-line bg-bk-surface p-3 lg:col-span-2">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-fg-4">{t.rounds}</div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-bk-line text-left text-[9.5px] uppercase tracking-wider text-fg-4">
                        <th className="pb-1.5 font-bold">{t.opened}</th><th />
                        <th className="pb-1.5 font-bold">{t.depth}</th>
                        <th className="pb-1.5 text-right font-bold">{t.result}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feed.rounds.map(r => (
                        <tr key={r.id} className="border-b border-bk-line font-mono text-[11.5px] tabular-nums">
                          <td className="py-1.5">{new Date(r.opened * 1000).toLocaleString(undefined, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className={r.side === "BUY" ? "text-ok" : "text-bad"}>{r.side}</td>
                          <td>Lv{r.depth}</td>
                          <td className={`text-right ${r.pl >= 0 ? "text-ok" : "text-bad"}`}>{money(r.pl)}</td>
                        </tr>
                      ))}
                      {feed.rounds.length === 0 && (
                        <tr><td colSpan={4} className="py-3 text-center text-[12px] text-fg-4">{t.nothing}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-[460px] rounded-bk border border-bk-line bg-bk-surface px-4 py-2.5 text-center text-[12.5px] font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
