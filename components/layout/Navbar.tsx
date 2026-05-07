"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Search } from "lucide-react"
import LoginButton from "@/components/LoginButton"
import { SearchBar } from "@/components/layout/SearchBar"

const NAV = [
  { label:"ໂບຣກເກີ",  href:"/broker"    },
  { label:"EA System", href:"/ea-system" },
  { label:"ບົດຮຽນ",   href:"/lessons"   },
  { label:"ການສຶກສາ", href:"/education"  },
  { label:"Quizzes",  href:"/quiz"      },
  { label:"ຂ່າວ",     href:"/news"      },
  { label:"ວິເຄາະ",   href:"/analysis"  },
  { label:"ເຄື່ອງມື", href:"/tools"     },
]


export function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileQ, setMobileQ] = useState("")
  const { data: session } = useSession()
  const router = useRouter()

  const submitMobile = (e: React.FormEvent) => {
    e.preventDefault()
    const t = mobileQ.trim()
    if (t.length >= 2) {
      setMobileSearchOpen(false)
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(t)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200"
      style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)" }}>
      <div className="max-w-[1060px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse-dot" />
          <span className="font-sans font-extrabold text-[20px] tracking-tight"
            style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LFT</span>
        </Link>
        <ul className="hidden lg:flex items-center gap-4">
          {NAV.map(item => (
            <li key={item.href}>
              <Link href={item.href}
                className="text-gray-500 hover:text-blue-600 text-[11px] font-semibold uppercase tracking-widest transition-colors font-sans whitespace-nowrap">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <SearchBar />
          <LoginButton />
        </div>
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-gray-800">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-3">
          <form onSubmit={submitMobile} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <input
              autoFocus
              type="text"
              value={mobileQ}
              onChange={e => setMobileQ(e.target.value)}
              placeholder="ຄົ້ນຫາ…"
              className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-full text-[13px] font-lao text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
            />
            {mobileQ && (
              <button
                type="button"
                onClick={() => setMobileQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      )}

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="text-gray-600 hover:text-blue-600 font-sans font-semibold text-sm py-1"
              onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <div className="pt-3 border-t border-gray-100">
            {session
              ? <button onClick={() => signOut({ callbackUrl:"/" })} className="font-sans text-sm text-red-500 py-1">ອອກຈາກລະບົບ</button>
              : <Link href="/login" className="btn-primary block text-center py-2.5" onClick={() => setOpen(false)}>ເຂົ້າສູ່ລະບົບ / ສະໝັກ</Link>
            }
          </div>
        </div>
      )}
    </nav>
  )
}
