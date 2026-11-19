"use client"

import { useState } from "react"

// The one-line installer, shown above the manual download list.
//
// `irm https://www.laoforextrader.com/go | iex` fetches app/go/route.ts, which re-serves
// public/install.ps1 as text/plain. The script finds every MT5 on the PC,
// downloads what the customer picks, verifies each SHA-256 against
// /api/dl/manifest, backs up whatever it replaces, and remembers versions so a
// second run only fetches what changed.
//
// ROCKET_EA pins the page's own EA so someone on the SGrid page does not end up
// being asked about three products they did not come for.

interface Props {
  /** Manifest id: sgrid | sgridpro | semi. Omit to let the script ask. */
  eaId?: string
}

type Shell = "ps" | "cmd"

export default function InstallCommand({ eaId }: Props) {
  const [copied, setCopied] = useState(false)
  const [shell, setShell] = useState<Shell>("ps")

  //  The TLS line is on this variant too. It was only on the cmd one,
  //  as if the problem were cmd.exe - it is the Windows version, and a
  //  VPS owner who opens PowerShell himself hits exactly the same wall.
  const psCmd = eaId
    ? `[Net.ServicePointManager]::SecurityProtocol='Tls12'; $env:ROCKET_EA='${eaId}'; irm https://www.laoforextrader.com/go | iex`
    : `[Net.ServicePointManager]::SecurityProtocol='Tls12'; irm https://www.laoforextrader.com/go | iex`

  //  Two reasons this is not just the PowerShell line with a prefix:
  //  `irm` does not exist in cmd.exe, which is where a VPS session lands, and
  //  Windows Server 2016/2019 still negotiate TLS 1.0 by default, so the very
  //  first download fails on exactly those machines unless we ask for 1.2.
  const cmdCmd = eaId
    ? `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; $env:ROCKET_EA='${eaId}'; irm https://www.laoforextrader.com/go | iex"`
    : `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; irm https://www.laoforextrader.com/go | iex"`

  const cmd = shell === "ps" ? psCmd : cmdCmd

  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd)
    } catch {
      // Older browsers, and any page not served over https, reject the async
      // clipboard. Fall back to the textarea trick rather than failing silently.
      const ta = document.createElement("textarea")
      ta.value = cmd
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand("copy") } catch {}
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <h2 className="font-lao" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", margin: "0 0 4px" }}>
        ຕິດຕັ້ງອັດຕະໂນມັດ
      </h2>
      <p className="font-lao" style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 0 18px", lineHeight: 1.8 }}>
        ສະຄຣິບຈະຫາ MetaTrader 5 ທຸກຕົວໃນເຄື່ອງເອງ ດາວໂຫຼດ EA ຮຸ່ນລ່າສຸດ ຕິດຕັ້ງໃຫ້ ແລະ
        ສຳຮອງໄຟລ໌ເກົ່າໄວ້ກ່ອນທຸກເທື່ອ. ຖ້າມີຮຸ່ນເກົ່າຢູ່ແລ້ວ ມັນຈະອັບເດດໃຫ້ ແລະ ຖ້າໃໝ່ຢູ່ແລ້ວ ມັນຈະຂ້າມ.
      </p>

      {/* Which shell the person is actually sitting in. Default PowerShell;
          cmd is one tap away because that is what a fresh VPS opens with. */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {([["ps", "PowerShell"], ["cmd", "Command Prompt (cmd)"]] as [Shell, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => { setShell(k); setCopied(false) }}
            className="font-lao"
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${shell === k ? "var(--accent)" : "var(--line)"}`,
              background: shell === k ? "var(--accent)" : "transparent",
              color: shell === k ? "#fff" : "var(--fg-3)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ol
        className="font-lao"
        style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 13, lineHeight: 2, color: "var(--fg-2)" }}
      >
        {shell === "ps" ? (
          <li>ກົດຂວາປຸ່ມ Start ເລືອກ <b>Terminal</b> ຫຼື <b>Windows PowerShell</b></li>
        ) : (
          <li>ເປີດ <b>Command Prompt</b> (ຫຼື Remote Desktop ເຂົ້າ VPS ແລ້ວເປີດ cmd)</li>
        )}
        <li>ວາງຄຳສັ່ງຂ້າງລຸ່ມ ແລ້ວກົດ Enter</li>
        <li>ເລືອກ MT5 ທີ່ຈະຕິດຕັ້ງ ຖ້າມີຫຼາຍຕົວ</li>
      </ol>

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          border: "1px solid var(--line)",
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--surface-2)",
        }}
      >
        <code
          style={{
            flex: 1,
            padding: "14px 16px",
            fontSize: shell === "cmd" ? 11 : 12.5,
            fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
            color: "var(--fg)",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {cmd}
        </code>
        <button
          onClick={copy}
          className="font-lao"
          style={{
            flexShrink: 0,
            padding: "0 18px",
            border: "none",
            borderLeft: "1px solid var(--line)",
            background: copied ? "var(--success-ink)" : "var(--accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copied ? "ຄັດລອກແລ້ວ ✓" : "ຄັດລອກ"}
        </button>
      </div>

      <p className="font-lao" style={{ fontSize: 11.5, color: "var(--fg-4)", margin: "12px 0 0", lineHeight: 1.8 }}>
        {shell === "cmd" && (
          <>
            ຄຳສັ່ງ cmd ຍາວກວ່າເພາະຕ້ອງເອີ້ນ PowerShell ແລະ ບັງຄັບ TLS 1.2 ໃຫ້ Windows Server ລຸ້ນເກົ່າ
            <br />
          </>
        )}
        ຢາກເບິ່ງວ່າສະຄຣິບເຮັດຫຍັງແດ່ກ່ອນຮັນບໍ່?{" "}
        <a href="/go" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 700 }}>
          ເປີດເບິ່ງສະຄຣິບ
        </a>{" "}
        · ຕ້ອງເປີດ MT5 ຢ່າງໜ້ອຍໜຶ່ງເທື່ອກ່ອນ ສະຄຣິບຈຶ່ງຈະເຫັນມັນ
      </p>
    </section>
  )
}
