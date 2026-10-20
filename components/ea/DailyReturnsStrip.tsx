import { fmtMoney, type Money } from "@/lib/eaMoney"
import styles from "./DailyReturnsStrip.module.css"

export interface DailyRow {
  date: string
  pct: number
  /** Already converted out of cents by lib/eaMoney. */
  money: Money | null
}

/** Tallest a winning day may draw, in px. .up is 72px: this plus the money
 *  label that sits on the bar's head has to fit inside it. */
const MAX_BAR_PX = 56
/** A losing day draws this far below the axis, whatever its size. A -20% day
 *  scaled honestly would be taller than the whole chart; the colour is what
 *  has to register, so the depth is fixed and the figure carries the size. */
const LOSS_BAR_PX = 10

/**
 * The last N trading days as a column chart: a bar sized by the day's
 * percentage with the money riding on its head, then the percentage and the
 * date underneath. Presentational only — the caller fetches the doc, drops
 * weekends and does the cents/base conversion, so this can't disagree with
 * the stat card above it.
 *
 * A broker-server day runs roughly 04:00 → 04:00 ICT (see CLAUDE.md), so the
 * newest column is a day still in progress rather than a closed one.
 */
export default function DailyReturnsStrip({ rows }: { rows: DailyRow[] }) {
  if (rows.length === 0) return null

  const peak = Math.max(...rows.map(r => Math.abs(r.pct)), 0.01)

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.title}>Daily Profit</div>
        <div className={styles.note}>ສະເພາະວັນເທຣດ · ວັນຂວາສຸດຍັງບໍ່ປິດ</div>
      </div>

      <div className={styles.row}>
        {rows.map(r => {
          const up = r.pct > 0
          const down = r.pct < 0
          const color = up ? "#4ADE80" : down ? "#F87171" : "rgba(255,255,255,0.35)"
          const pctText = `${up ? "+" : ""}${r.pct.toFixed(2)}%`
          const height = up ? Math.max(3, (Math.abs(r.pct) / peak) * MAX_BAR_PX) : 0

          return (
            <div key={r.date} className={styles.col} title={`${r.date} · ${pctText}`}>
              <div className={styles.plot}>
                <div className={styles.up}>
                  <div className={styles.money} style={{ color }}>
                    {r.money ? fmtMoney(r.money.amount, r.money.currency) : pctText}
                  </div>
                  {up && <div className={styles.bar} style={{ height }} />}
                </div>
                <div className={styles.axis} />
                <div className={styles.down}>
                  {down && <div className={styles.barDown} style={{ height: LOSS_BAR_PX }} />}
                </div>
              </div>

              <div className={styles.pct} style={down ? { color: "#F87171" } : undefined}>
                {pctText}
              </div>
              <div className={styles.date}>{dayLabel(r.date)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** "2026-10-20" → "20/10" */
function dayLabel(date: string): string {
  const [, m, d] = date.split("-")
  return d && m ? `${d}/${m}` : date
}
