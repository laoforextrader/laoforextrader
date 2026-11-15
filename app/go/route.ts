import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// The one line a customer types to install the EAs:
//
//     irm laoforextrader.com/go | iex
//
// `irm` (Invoke-RestMethod) decides what to hand back from the Content-Type it
// receives. Vercel serves /install.ps1 from public/ as a binary download, and
// piping bytes into `iex` fails with a type error — so this route re-serves the
// same file as text/plain, which `irm` gives back as a string that `iex` runs.
//
// The script itself is NOT written here: it is published from the EA repo
// (Dev/Tools/installer/install.ps1 → Tools/mk_publish.py → public/install.ps1),
// so the copy customers run is always the copy that was tested next to the EA.
//
// no-store: a cached installer is how someone ends up installing last month's
// build after we ship a fix.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin

  let script: string
  try {
    const res = await fetch(`${origin}/install.ps1`, { cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    script = await res.text()
  } catch (err) {
    // Fail loudly inside PowerShell rather than handing `iex` half a script.
    const msg = err instanceof Error ? err.message : String(err)
    return new NextResponse(
      `Write-Host "The installer could not be loaded (${msg})." -ForegroundColor Red\n` +
        `Write-Host "Please try again, or write to therocketea@gmail.com" -ForegroundColor DarkGray\n`,
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )
  }

  return new NextResponse(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
