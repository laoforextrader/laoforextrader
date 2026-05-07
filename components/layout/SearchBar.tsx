"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X, FileText, BookOpen, Building2, ListChecks } from "lucide-react"
import type { SearchResult } from "@/app/api/search/route"

const TYPE_ICON = {
  article:  FileText,
  broker:   Building2,
  quiz:     ListChecks,
} as const

const TYPE_LABEL: Record<string, string> = {
  article: "ບົດຄວາມ",
  broker:  "Broker",
  quiz:    "Quiz",
}

const CATEGORY_LABEL: Record<string, string> = {
  education: "ການສຶກສາ",
  "ea-tools": "EA / Tools",
  broker:    "ລີວິວ Broker",
  analysis:  "ວິເຄາະ",
  news:      "ຂ່າວ",
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`, { cache: "no-store" })
        const data = await res.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 220)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault()
      setIsOpen(false)
      router.push(results[activeIdx].url)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-[260px]">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true); setActiveIdx(-1) }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKey}
            placeholder="ຄົ້ນຫາ Broker, ບົດຮຽນ, ຂ່າວ…"
            className="w-full pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[12px] font-lao text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setIsOpen(false) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div
          className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-50"
          style={{ minWidth: 360, maxHeight: 480, overflowY: "auto" }}
        >
          {loading && (
            <div className="px-4 py-3 text-[12px] text-gray-400 font-lao">ກຳລັງຄົ້ນຫາ…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-gray-400 font-lao">
              ບໍ່ພົບຜົນຄົ້ນຫາ "<span className="text-gray-600">{query}</span>"
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <ul>
                {results.map((r, i) => {
                  const Icon = TYPE_ICON[r.type] || FileText
                  const isActive = i === activeIdx
                  return (
                    <li key={r._id}>
                      <Link
                        href={r.url}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 transition-colors ${
                          isActive ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                          r.type === "broker" ? "bg-blue-50 text-blue-600"
                          : r.type === "quiz" ? "bg-purple-50 text-purple-600"
                          : "bg-amber-50 text-amber-600"
                        }`}>
                          <Icon size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                            <span>{TYPE_LABEL[r.type]}</span>
                            {r.category && CATEGORY_LABEL[r.category] && (
                              <><span>·</span><span>{CATEGORY_LABEL[r.category]}</span></>
                            )}
                          </div>
                          <div className="font-lao text-[13px] font-semibold text-gray-900 line-clamp-1">
                            {r.title}
                          </div>
                          {r.excerpt && (
                            <div className="font-lao text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              {r.excerpt}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
              >
                ເບິ່ງຜົນທັງໝົດ →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
