"use client"
import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Menu, X } from "lucide-react"
import LoginButton from "@/components/LoginButton"

const NAV = [
  { label:"ໂບຣກເກີ",  href:"/broker"    },
  { label:"EA System", href:"/ea-system" },
  { label:"ບົດຮຽນ",   href:"/lessons"   },
  { label:"ການສຶກສາ", href:"/education"  },
  { label:"ຂ່າວ",     href:"/news"      },
  { label:"ວິເຄາະ",   href:"/analysis"  },
  { label:"ເຄື່ອງມື", href:"/tools"     },
]


export function Navbar() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200"
      style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)" }}>
      <div className="max-w-[1060px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse-dot" />
          <span className="font-sans font-extrabold text-[20px] tracking-tight"
            style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LFT</span>
        </Link>
        <ul className="hidden md:flex items-center gap-5">
          {NAV.map(item => (
            <li key={item.href}>
              <Link href={item.href}
                className="text-gray-500 hover:text-blue-600 text-[11px] font-semibold uppercase tracking-widest transition-colors font-sans">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center"><LoginButton /></div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-gray-500 hover:text-gray-800">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
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
