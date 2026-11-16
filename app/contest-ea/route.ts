import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// The one line a contestant types:
//
//     irm https://www.laoforextrader.com/contest-ea | iex
//
// Same reason /go exists: Vercel serves a .ps1 out of public/ as a binary
// download, and piping bytes into `iex` fails with a type error. Re-serving
// it as text/plain is what makes `irm | iex` work.
//
// The script itself comes from the EA repo (Dev/Tools/installer/contest-ea.ps1
// → Tools/mk_publish.py → public/contest-ea.ps1), so what a contestant runs is
// what was tested next to the build it installs.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin

  let script: string
  try {
    const res = await fetch(`${origin}/contest-ea.ps1`, { cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    script = await res.text()
  } catch (err) {
    // Fail inside PowerShell with something readable rather than handing
    // `iex` half a script.
    const msg = err instanceof Error ? err.message : String(err)
    return new NextResponse(
      `Write-Host "The contest installer could not be loaded (${msg})." -ForegroundColor Red\n` +
        `Write-Host "Open ${origin}/contest/install and follow the manual steps." -ForegroundColor DarkGray\n`,
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )
  }

  return new NextResponse(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // A cached installer is how someone installs last week's build after a
      // fix has shipped.
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
