"use client"

// Spot gold and the Lao shop price, in the homepage hero.
//
// Flat surface, same tokens as /broker: a hairline panel instead of a
// shadowed card, and no float animation — a price that drifts up and down on
// its own is the last thing a price panel should do.
//
// It used to be `hidden lg:block`, so the one piece of live data on the page
// was invisible to every phone, which is most of this audience. It renders at
// every width now and simply sits under the hero text on a narrow screen.

import { useGoldPrice } from "@/hooks/useGoldPrice"
import type { GoldSnapshot } from "@/lib/gold"

export function GoldWidget({ initial }: { initial?: GoldSnapshot | null }) {
  const { xauusd, laoGoldLAK, change, changePct, isLive } = useGoldPrice({ initial: initial ?? null })
  const up = change >= 0
  const hasChange = Math.abs(change) > 0.01

  return (
    <div className="rounded-bk border border-bk-line">
      <div className="flex items-center justify-between gap-2 border-b border-bk-line px-4 py-2.5">
        <span className="text-[13px] font-bold tracking-[-0.01em] text-bk-ink">XAUUSD</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-bk-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: isLive ? "#65A30D" : "var(--bk-dash)" }}
          />
          {isLive ? "LIVE" : "—"}
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="font-mono text-[28px] font-bold leading-none tracking-[-0.02em] text-bk-ink">
          {xauusd
            ? xauusd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "—"}
        </div>
        <div
          className={`mt-2 font-mono text-[13px] font-semibold ${
            hasChange ? (up ? "text-ok-ink dark:text-ok" : "text-bad") : "text-bk-muted"
          }`}
        >
          {hasChange ? (
            <>
              {up ? "▲" : "▼"} {up ? "+" : ""}
              {change.toFixed(2)} ({up ? "+" : ""}
              {changePct.toFixed(2)}%)
            </>
          ) : (
            <>—</>
          )}
        </div>
      </div>

      <div className="border-t border-bk-line px-4 py-3">
        <div className="text-[11px] leading-tight text-bk-muted">ລາຄາຄຳລາວ / ບາດ</div>
        <div className="mt-1 font-mono text-[15px] font-bold tracking-[-0.02em] text-bk-ink">
          {laoGoldLAK ? `${laoGoldLAK.toLocaleString("en-US")} ກີບ` : "—"}
        </div>
      </div>
    </div>
  )
}
