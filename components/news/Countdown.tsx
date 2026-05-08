"use client"
import { useEffect, useState } from "react"

interface Props {
  /** ISO timestamp the event fires at (UTC) */
  target: string
  /** Show "released" label after target passes */
  passedLabel?: string
}

function parts(ms: number) {
  if (ms < 0) ms = 0
  const totalSec = Math.floor(ms / 1000)
  const days  = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins  = Math.floor((totalSec % 3600) / 60)
  const secs  = totalSec % 60
  return { days, hours, mins, secs }
}

export function Countdown({ target, passedLabel = "ປະກາດແລ້ວ" }: Props) {
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    // Defensive: if upstream sent "YYYY-MM-DD HH:MM:SS" without timezone
    // info (Finnhub's raw format), JS would parse it as browser-local.
    // Reshape to ISO-with-Z so it's interpreted as UTC.
    const iso = target.includes("T") ? target : target.replace(" ", "T") + "Z"
    const t = new Date(iso).getTime()
    if (isNaN(t)) return
    const tick = () => setMs(t - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  if (ms === null) return null
  if (ms <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {passedLabel}
      </span>
    )
  }

  const { days, hours, mins, secs } = parts(ms)
  const close = ms < 60 * 60 * 1000 // <1 hour = red

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono ${close ? "text-red-600" : "text-blue-600"}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${close ? "bg-red-500 animate-pulse" : "bg-blue-500 animate-pulse-dot"}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest">ນັບຖອຍຫຼັງ</span>
      <span className="text-[13px] font-semibold">
        {days > 0 && <>{days}ດ </>}
        {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  )
}
