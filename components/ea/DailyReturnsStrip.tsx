import { fmtMoney, type Money } from "@/lib/eaMoney"
import styles from "./DailyReturnsStrip.module.css"

export interface DailyRow {
  date: string
  pct: number
  /** Already converted out of cents by lib/eaMoney. */
  money: Money | null
}

/**
 * The last N trading days as one box each: percentage plus the money it
 * stands for. Presentational only — the caller fetches the doc and does the
 * cents/base conversion, so this component can't disagree with the stat card
 * sitting above it.
 *
 * A broker-server day runs roughly 04:00 → 04:00 ICT (see CLAUDE.md), so the
 * newest box is a day still in progress rather than a closed one.
 */
export default function DailyReturnsStrip({ rows }: { rows: DailyRow[] }) {
  if (rows.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.title}>Daily Profit · {rows.length} ວັນ</div>
        <div className={styles.note}>ດຶງຈາກບັນຊີຈິງ · ວັນຂວາສຸດຍັງບໍ່ປິດ</div>
      </div>

      <div className={styles.grid}>
        {rows.map(r => {
          const color =
            r.pct > 0 ? "#4ADE80" :
            r.pct < 0 ? "#F87171" : "rgba(255,255,255,0.35)"
          return (
            <div key={r.date} className={styles.box} title={r.date}>
              <div className={styles.date}>{dayLabel(r.date)}</div>
              <div className={styles.pct} style={{ color }}>
                {r.pct > 0 ? "+" : ""}{r.pct.toFixed(2)}%
              </div>
              {r.money && (
                <div className={styles.money}>
                  {fmtMoney(r.money.amount, r.money.currency)}
                </div>
              )}
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
