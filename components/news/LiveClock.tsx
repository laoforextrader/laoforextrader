"use client"
import { useEffect, useState } from "react"

// Shows the current Asia/Vientiane (GMT+7) date and time, ticking every
// second. Use this on /news so the operator can sanity-check that
// economic-calendar times render in the correct local zone.

function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }

function format(date: Date): { dateStr: string; timeStr: string } {
  // Always present in Lao local time regardless of where the browser is.
  const lao = new Date(date.getTime() + (date.getTimezoneOffset() + 7 * 60) * 60_000)
  return {
    dateStr: `${pad(lao.getDate())}-${pad(lao.getMonth() + 1)}-${lao.getFullYear()}`,
    timeStr: `${pad(lao.getHours())}:${pad(lao.getMinutes())}:${pad(lao.getSeconds())}`,
  }
}

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) {
    return (
      <div className="inline-flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-3 py-1.5 text-[11px] text-gray-400">
        <span className="font-mono">— —</span>
      </div>
    )
  }
  const { dateStr, timeStr } = format(now)

  return (
    <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      <span className="font-mono text-[11px] font-bold text-gray-700">{timeStr}</span>
      <span className="font-mono text-[10px] text-gray-400">{dateStr}</span>
      <span className="font-mono text-[10px] font-bold text-blue-600">GMT+7</span>
    </div>
  )
}
