"use client"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback: select-all via temp input
      const ta = document.createElement("textarea")
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 font-lao text-[12px] font-semibold transition-colors"
      style={{
        background: copied ? "#10B981" : "#EEF3FF",
        color: copied ? "#fff" : "#2563EB",
        border: `1px solid ${copied ? "#10B981" : "#BFCFFF"}`,
        padding: "5px 10px",
        borderRadius: 8,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2.2} />}
      {copied ? "Copied!" : label}
    </button>
  )
}
