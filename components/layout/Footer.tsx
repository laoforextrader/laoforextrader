import Link from "next/link"

const LINKS = {
  "ເນື້ອຫາ":   [{ label:"ລີວິວ Broker",  href:"/broker"},{ label:"ການສຶກສາ",href:"/education"},{ label:"ວິເຄາະ",href:"/analysis"},{ label:"ຂ່າວ",href:"/news"}],
  "ເຄື່ອງມື": [{ label:"Pip Calculator",href:"/tools/pip-calculator"},{ label:"Lot Calculator",href:"/tools/lot-calculator"}],
  "LFT":       [{ label:"ກ່ຽວກັບ",href:"/about"},{ label:"ຕິດຕໍ່",href:"/contact"},{ label:"ນະໂຍບາຍ",href:"/privacy"}],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1060px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-sans font-extrabold text-[15px]"
                style={{ background:"linear-gradient(135deg,#2563EB,#4F46E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LFT</span>
            </div>
            <p className="font-lao text-[11px] text-gray-400 leading-relaxed mb-4">ແຫຼ່ງຂໍ້ມູນ Forex #1<br/>ສຳລັບ Trader ລາວ</p>
            <div className="flex gap-2">
              {[
                { label: "FB", href: "https://www.facebook.com/groups/Laoforextrader" },
                { label: "YT", href: "https://www.youtube.com/@MeeMuangsong" },
                { label: "TK", href: "https://www.tiktok.com/@meemuangsong" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center font-mono text-[9px] text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>
              <ul className="flex flex-col gap-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-lao text-[11px] text-gray-500 hover:text-blue-600 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-lao text-[10px] text-gray-400">© 2025 LaoForexTrader · ສ້າງດ້ວຍ ❤️ ສຳລັບ Trader ລາວ</p>
          <p className="font-lao text-[10px] text-gray-300">⚠ ການລົງທຶນມີຄວາມສ່ຽງ · ໃຊ້ຂໍ້ມູນດ້ວຍຄວາມລະມັດລະວັງ</p>
        </div>
      </div>
    </footer>
  )
}
