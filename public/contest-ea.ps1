# TheRocket contest EA installer
#   irm https://www.laoforextrader.com/contest-ea | iex
#
# One build, every MetaTrader 5 on this PC, no questions. The full installer
# (/go) has a picker because it ships several EAs into several terminals; a
# contestant has exactly one EA to install and is usually doing it on a fresh
# VPS, so anything it asks is one more place to get stuck.
#
# What it cannot do: add the website to MT5's WebRequest allow-list. That list
# lives in config\experts.ini in a form the terminal writes itself, so the
# script explains the three clicks instead of pretending.
#
# Source of truth: Dev/Tools/installer/contest-ea.ps1 in the EA repo.
# Published by Tools/mk_publish.py — do not edit the copy on the website.

$ErrorActionPreference = 'Stop'
#  Windows Server 2016/2019 still default to TLS 1.0, which our host refuses —
#  and those are exactly the VPS boxes contestants run this on.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$BASE = 'https://www.laoforextrader.com'
$UA   = 'TheRocketContestInstaller/1.0'
if ($env:ROCKET_BASE) { $BASE = $env:ROCKET_BASE.TrimEnd('/') }

function Say([string]$t, [string]$c = 'Gray') { Write-Host $t -ForegroundColor $c }

Write-Host ''
Write-Host '  TheRocket - contest EA' -ForegroundColor White
Write-Host '  laoforextrader.com/contest' -ForegroundColor DarkGray
Write-Host ''

# ---------------------------------------------------------------- manifest --
try {
    $man = Invoke-RestMethod -Uri "$BASE/api/dl/manifest" -Headers @{ 'User-Agent' = $UA } -TimeoutSec 30
} catch {
    Say "  Cannot reach $BASE - check the internet connection and try again." 'Red'
    Say "  ($($_.Exception.Message))" 'DarkGray'
    return
}

$build = $man.builds | Where-Object { $_.id -eq 'contest' } | Select-Object -First 1
if (-not $build) {
    Say '  The contest build is not published yet.' 'Red'
    Say '  Check laoforextrader.com/contest for the dates, or ask on WhatsApp.' 'DarkGray'
    return
}

# ------------------------------------------------------------ find MetaTrader
#  Two shapes, both real:
#    normal    %APPDATA%\MetaQuotes\Terminal\<hash>\MQL5\...  (origin.txt names it)
#    portable  <install folder>\MQL5\...                      (beside terminal64.exe)
function Get-Mt5Targets {
    $found = @{}
    $termRoot = Join-Path $env:APPDATA 'MetaQuotes\Terminal'
    if (Test-Path $termRoot) {
        foreach ($d in Get-ChildItem $termRoot -Directory -ErrorAction SilentlyContinue) {
            if ($d.Name -in @('Common', 'Community', 'Help')) { continue }
            $originFile = Join-Path $d.FullName 'origin.txt'
            $origin = ''
            if (Test-Path $originFile) { $origin = (Get-Content $originFile -Raw -ErrorAction SilentlyContinue).Trim() }

            if (Test-Path (Join-Path $d.FullName 'MQL5\Experts')) {
                $name = if ($origin) { Split-Path $origin -Leaf } else { $d.Name }
                $found[$d.FullName.ToLower()] = [pscustomobject]@{ Name = $name; Data = $d.FullName }
            }
            if ($origin -and (Test-Path (Join-Path $origin 'MQL5\Experts')) -and
                (Test-Path (Join-Path $origin 'terminal64.exe'))) {
                $found[$origin.ToLower()] = [pscustomobject]@{ Name = (Split-Path $origin -Leaf); Data = $origin }
            }
        }
    }
    foreach ($p in Get-Process terminal64 -ErrorAction SilentlyContinue) {
        $dir = Split-Path $p.Path -Parent
        if ((Test-Path (Join-Path $dir 'MQL5\Experts')) -and -not $found.ContainsKey($dir.ToLower())) {
            $found[$dir.ToLower()] = [pscustomobject]@{ Name = (Split-Path $dir -Leaf); Data = $dir }
        }
    }
    $found.Values | Sort-Object Name, Data
}

$targets = @(Get-Mt5Targets)
if ($targets.Count -eq 0) {
    Say '  No MetaTrader 5 found on this PC.' 'Red'
    Say '  Open MT5 once so it creates its folders, then run this again.' 'DarkGray'
    return
}

# ---------------------------------------------------------------- download --
$tmp = Join-Path $env:TEMP ("rocket-contest-" + [guid]::NewGuid().ToString('N') + ".ex5")
try {
    Invoke-WebRequest -Uri "$BASE$($build.url)" -OutFile $tmp -Headers @{ 'User-Agent' = $UA } -TimeoutSec 120
} catch {
    Say "  Download failed: $($_.Exception.Message)" 'Red'
    return
}

#  The hash is what makes an unattended install safe to trust: a truncated
#  download or a proxy's error page would otherwise land in Experts\ as a
#  file MT5 refuses, which looks like the EA being broken.
#  Get-FileHash is normally there on PowerShell 5.1, but it comes from a
#  module, and a stripped PSModulePath (seen while testing this very
#  script) makes it vanish with a CommandNotFoundException. .NET is always
#  present, so the cmdlet is the fast path and the class is the guarantee.
function Get-Sha256([string]$path) {
    try { return (Get-FileHash -Path $path -Algorithm SHA256).Hash.ToLower() } catch {}
    $h = [System.Security.Cryptography.SHA256]::Create()
    try {
        $fs = [System.IO.File]::OpenRead($path)
        try { return ([BitConverter]::ToString($h.ComputeHash($fs))).Replace("-", "").ToLower() }
        finally { $fs.Dispose() }
    } finally { $h.Dispose() }
}

$sha = Get-Sha256 $tmp
if ($build.sha256 -and $sha -ne $build.sha256.ToLower()) {
    Say '  The downloaded file does not match its published checksum.' 'Red'
    Say "  expected $($build.sha256)" 'DarkGray'
    Say "  got      $sha" 'DarkGray'
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    return
}

# ------------------------------------------------------------------ install --
$ok = 0
foreach ($t in $targets) {
    $dir = Join-Path $t.Data 'MQL5\Experts'
    $dst = Join-Path $dir $build.file
    try {
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        #  Keep whatever is already there: a contestant re-running this must
        #  not lose a build they are mid-round with.
        if (Test-Path $dst) {
            Copy-Item $dst "$dst.bak" -Force -ErrorAction SilentlyContinue
        }
        Copy-Item $tmp $dst -Force
        Say ("  installed -> " + $t.Name) 'Green'
        $ok++
    } catch {
        Say ("  could not write to " + $t.Name + " - " + $_.Exception.Message) 'Yellow'
        Say '  (close MT5 and run this again, or run PowerShell as administrator)' 'DarkGray'
    }
}
Remove-Item $tmp -Force -ErrorAction SilentlyContinue

if ($ok -eq 0) { Say '  Nothing was installed.' 'Red'; return }

# ------------------------------------------------------------------- next ---
Write-Host ''
Say '  Done. Three things left, in MT5:' 'White'
Write-Host ''
#  The allow-list cannot be written by a script: tested four ways on
#  2026-11-16 (startup /config:, config\common.ini, bare host, repeated key)
#  and MT5 keeps the value in the file while ignoring it completely — the EA
#  still gets error 4014. So the next best thing is to put the URL on the
#  clipboard, which turns three fiddly steps into tick, Ctrl+V, OK.
try { Set-Clipboard -Value $BASE; $onClip = $true } catch { $onClip = $false }

Say '  1. Tools > Options > Expert Advisors' 'Gray'
Say '       tick  Allow WebRequest for listed URL' 'Gray'
Say "       add   $BASE" 'Cyan'
if ($onClip) { Say '       (already copied - just press Ctrl+V in that box)' 'Green' }
Say '       (without this the EA trades but cannot report, and we cannot' 'DarkGray'
Say '        approve your entry)' 'DarkGray'
Write-Host ''
Say '  2. Open an XAUUSDm chart on M5, restart MT5 if the EA is not in' 'Gray'
Say '     the Navigator yet, then drag TheRocketMegiSemiContest onto it' 'Gray'
Say '     and paste your ContestCode.' 'Gray'
Write-Host ''
Say '  3. Turn Algo Trading on, so the button is green.' 'Gray'
Write-Host ''
Say "  Full guide: $BASE/contest/install" 'Cyan'
Write-Host ''
