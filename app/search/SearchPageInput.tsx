"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

export function SearchPageInput({ initial }: { initial: string }) {
  const [q, setQ] = useState(initial)
  const router = useRouter()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={submit} className="relative max-w-[600px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
      <input
        autoFocus
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="ຄົ້ນຫາບົດຄວາມ, Broker, Quiz…"
        className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-[15px] font-lao text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear"
        >
          <X size={16} />
        </button>
      )}
    </form>
  )
}
