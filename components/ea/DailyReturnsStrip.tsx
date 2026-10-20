import { fmtMoney, type Money } from "@/lib/eaMoney"
import styles from "./DailyReturnsStrip.module.css"

export interface DailyRow {
  date: string
  pct: number
  /** Already converted out of cents by lib/eaMoney. */
  money: Money | null
}

/**
 * The last N trading days as one box each: the money on top, the date and
 * the percentage it came from beneath. Presentational only — the caller
 * fetches the doc and does the cents/base conversion, so this component
 * can't disagree with the stat card sitting above it.
 *
 * A broker-server day runs roughly 04:00 → 04:00 ICT (see CLAUDE.md), so the
 * newest box is a day still in progress rather than a closed one.
 */
export default function DailyReturnsStrip({ rows }: { rows: DailyRow[] }) {
  if (rows.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.title}>Daily Profit</div>
        <div className={styles.note}>ດຶງຈາກບັນຊີຈິງ · ວັນຂວາສຸດຍັງບໍ່ປິດ</div>
      </div>

      <div className={styles.grid}>
        {rows.map(r => {
          const color =
            r.pct > 0 ? "#4ADE80" :
            r.pct < 0 ? "#F87171" : "rgba(255,255,255,0.35)"
          const pctText = `${r.pct > 0 ? "+" : ""}${r.pct.toFixed(2)}%`
          return (
            <div key={r.date} className={styles.box} title={`${r.date} · ${pctText}`}>
              <div className={styles.money} style={{ color }}>
                {r.money ? fmtMoney(r.money.amount, r.money.currency) : pctText}
              </div>
              <div className={styles.meta}>
                {dayLabel(r.date)} · {pctText}
              </div>
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
