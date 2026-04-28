"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"

const NAV = [
  { label:"ໂບຣກເກີ",  href:"/broker"    },
  { label:"EA System", href:"/ea-system" },
  { label:"ບົດຮຽນ",   href:"/lessons"   },
  { label:"ການສຶກສາ", href:"/education"  },
  { label:"ຂ່າວ",     href:"/news"      },
  { label:"ວິເຄາະ",   href:"/analysis"  },
  { label:"ເຄື່ອງມື", href:"/tools"     },
]

function UserMenu() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  if (status === "loading") return <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
  if (!session) return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="btn-ghost text-[11px] py-1.5 px-3.5">ເຂົ້າສູ່ລະບົບ</Link>
      <Link href="/login" className="btn-primary text-[11px] py-1.5 px-3.5">ສະໝັກ</Link>
    </div>
  )
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
        {session.user?.image
          ? <Image src={session.user.image} alt="" width={26} height={26} className="rounded-full border border-blue-200" />
          : <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center"><User size={12} className="text-blue-600" /></div>
        }
        <span className="font-sans text-[12px] font-semibold text-gray-700 max-w-[80px] truncate hidden md:block">
          {session.user?.name?.split(" ")[0]}
        </span>
        <ChevronDown size={11} className="text-gray-400 hidden md:block" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-100">
              <p className="font-sans text-[11px] font-semibold text-gray-800 truncate">{session.user?.name}</p>
              <p className="font-mono text-[10px] text-gray-400 truncate">{session.user?.email}</p>
            </div>
            <Link href="/dashboard" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-[11px] text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors font-sans font-medium">
              <LayoutDashboard size={12} /> Dashboard
            </Link>
            <Link href="/lessons" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-[11px] text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors font-sans font-medium">
              📚 ບົດຮຽນຂອງຂ້ອຍ
            </Link>
            <div className="border-t border-gray-100">
              <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }) }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-[11px] text-red-500 hover:bg-red-50 transition-colors font-sans font-medium">
                <LogOut size={12} /> ອອກຈາກລະບົບ
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200"
      style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)" }}>
      <div className="max-w-[1060px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-dot" />
          <span className="font-sans font-extrabold text-[16px] tracking-tight"
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
        <div className="hidden md:flex items-center"><UserMenu /></div>
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
