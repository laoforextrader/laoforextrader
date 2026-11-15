# TheRocket EA installer
#   irm https://www.laoforextrader.com/go | iex
#
# Finds every MetaTrader 5 on this PC, downloads the builds you pick, checks
# each file against its published SHA-256, keeps a backup of what it replaces,
# and remembers the versions so the next run can tell you what is new.
#
# Nothing here needs administrator rights unless MT5 was installed in
# Program Files in portable mode - the script says so and keeps going.
#
# Source of truth: Dev/Tools/installer/install.ps1 in the EA repo.
# Published by Tools/mk_publish.py - do not edit the copy on the website.

$ErrorActionPreference = 'Stop'
#  Windows Server 2016/2019 still default to TLS 1.0, which our host refuses.
#  Without this the first download dies with "could not create SSL/TLS secure
#  channel" on exactly the machines that matter most - the VPS boxes people
#  run the EA on. Harmless on newer Windows, which already negotiates 1.2/1.3.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$BASE = 'https://www.laoforextrader.com'
$UA   = 'TheRocketInstaller/1.0'

# For testing the installer against a local or staging site before it goes out:
#   $env:ROCKET_BASE = 'http://localhost:3000'
if ($env:ROCKET_BASE) { $BASE = $env:ROCKET_BASE.TrimEnd('/') }

function Say([string]$t, [string]$c = 'Gray') { Write-Host $t -ForegroundColor $c }
function Head([string]$t) { Write-Host ''; Write-Host $t -ForegroundColor Cyan }

Write-Host ''
Write-Host '  TheRocket EA installer' -ForegroundColor White
Write-Host '  laoforextrader.com' -ForegroundColor DarkGray
Write-Host ''

# ---------------------------------------------------------------- manifest --
try {
    $man = Invoke-RestMethod -Uri "$BASE/api/dl/manifest" -Headers @{ 'User-Agent' = $UA } -TimeoutSec 30
} catch {
    Say "  Cannot reach $BASE - check the internet connection and try again." 'Red'
    Say "  ($($_.Exception.Message))" 'DarkGray'
    return
}
if (-not $man.builds) { Say '  The download list came back empty. Please tell support.' 'Red'; return }


# ------------------------------------------------------------------ picker -
#  A checkbox list driven by the arrow keys. Owner asked for this on
#  2026-11-15: typing numbers is the wrong shape for the real job, which is
#  "install these two EAs into those three terminals".
#
#  It needs a real console. Piped or redirected input (a CI job, a scheduled
#  task, ROCKET_MT5 set) falls back to the typed list further down, so the
#  script never hangs waiting for a key that cannot arrive.
function Test-CanPick {
    try {
        if ([Console]::IsInputRedirected) { return $false }
        $null = [Console]::CursorTop
        $null = [Console]::WindowWidth
        return $true
    } catch { return $false }
}

function Select-Items {
    param(
        [Parameter(Mandatory)] [array]  $Items,
        [Parameter(Mandatory)] [string] $Title,
        [scriptblock] $Line,
        [switch] $AllOn
    )

    $sel = New-Object bool[] $Items.Count
    for ($i = 0; $i -lt $Items.Count; $i++) { $sel[$i] = [bool]$AllOn }
    $cur = 0

    Write-Host ''
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host '    up/down move   space select   a all   enter confirm   esc cancel' -ForegroundColor DarkGray
    Write-Host ''

    $top = [Console]::CursorTop
    $width = [Math]::Max(40, [Console]::WindowWidth - 2)

    while ($true) {
        [Console]::SetCursorPosition(0, $top)
        for ($i = 0; $i -lt $Items.Count; $i++) {
            $box = if ($sel[$i]) { '[x]' } else { '[ ]' }
            $arrow = if ($i -eq $cur) { '>' } else { ' ' }
            $text = "  $arrow $box " + (& $Line $Items[$i])
            if ($text.Length -gt $width) { $text = $text.Substring(0, $width - 1) + '~' }
            $colour = if ($i -eq $cur) { 'White' } elseif ($sel[$i]) { 'Green' } else { 'Gray' }
            Write-Host $text.PadRight($width) -ForegroundColor $colour
        }

        $k = [Console]::ReadKey($true)
        switch ($k.Key) {
            'UpArrow'   { $cur = ($cur - 1 + $Items.Count) % $Items.Count }
            'DownArrow' { $cur = ($cur + 1) % $Items.Count }
            'Spacebar'  { $sel[$cur] = -not $sel[$cur] }
            'Enter'     {
                $out = @()
                for ($i = 0; $i -lt $Items.Count; $i++) { if ($sel[$i]) { $out += $Items[$i] } }
                #  Enter on an empty list means "the one I am standing on" - the
                #  common case is one terminal, one EA, and no urge to press space.
                if ($out.Count -eq 0) { $out = @($Items[$cur]) }
                Write-Host ''
                return $out
            }
            'Escape'    { Write-Host ''; return @() }
            default {
                $ch = "$($k.KeyChar)".ToLower()
                if ($ch -eq 'a') {
                    $on = $false
                    foreach ($s in $sel) { if (-not $s) { $on = $true; break } }
                    for ($i = 0; $i -lt $Items.Count; $i++) { $sel[$i] = $on }
                } elseif ($ch -eq 'q') { Write-Host ''; return @() }
            }
        }
    }
}

# ------------------------------------------------------------ find MetaTrader
# Two shapes exist and both are real:
#   normal    %APPDATA%\MetaQuotes\Terminal\<hash>\MQL5\...   (origin.txt names the install)
#   portable  <install folder>\MQL5\...                       (next to terminal64.exe)
function Get-Mt5Targets {
    $found = @{}

    $termRoot = Join-Path $env:APPDATA 'MetaQuotes\Terminal'
    if (Test-Path $termRoot) {
        foreach ($d in Get-ChildItem $termRoot -Directory -ErrorAction SilentlyContinue) {
            if ($d.Name -in @('Common', 'Community', 'Help')) { continue }

            $originFile = Join-Path $d.FullName 'origin.txt'
            $origin = ''
            if (Test-Path $originFile) { $origin = (Get-Content $originFile -Raw -ErrorAction SilentlyContinue).Trim() }

            # a) the data folder itself (only MT5 has an MQL5 tree)
            if (Test-Path (Join-Path $d.FullName 'MQL5\Experts')) {
                $name = if ($origin) { Split-Path $origin -Leaf } else { $d.Name }
                $found[$d.FullName.ToLower()] = [pscustomobject]@{
                    Name = $name; Data = $d.FullName; Kind = 'data folder'
                }
            }

            # b) the install folder it points at, in case that one runs portable
            if ($origin -and (Test-Path (Join-Path $origin 'MQL5\Experts')) -and
                (Test-Path (Join-Path $origin 'terminal64.exe'))) {
                $found[$origin.ToLower()] = [pscustomobject]@{
                    Name = (Split-Path $origin -Leaf); Data = $origin; Kind = 'portable'
                }
            }
        }
    }

    # c) terminals running right now (catches a portable copy nothing points at)
    foreach ($p in Get-Process terminal64 -ErrorAction SilentlyContinue) {
        $dir = Split-Path $p.Path -Parent
        if ((Test-Path (Join-Path $dir 'MQL5\Experts')) -and -not $found.ContainsKey($dir.ToLower())) {
            $found[$dir.ToLower()] = [pscustomobject]@{
                Name = (Split-Path $dir -Leaf); Data = $dir; Kind = 'portable, running'
            }
        }
    }

    $found.Values | Sort-Object Name, Data
}

$targets = @(Get-Mt5Targets)
if ($targets.Count -eq 0) {
    Say '  No MetaTrader 5 found on this PC.' 'Red'
    Say '  Open MT5 once (so it creates its folders), then run this again.' 'DarkGray'
    return
}

$pick = @()

if ($env:ROCKET_MT5) {
    # Unattended install (VPS, or a second PC set up the same way):
    #   $env:ROCKET_MT5='all'; $env:ROCKET_EA='sgrid'; irm https://www.laoforextrader.com/go | iex
    Head '  MetaTrader 5 found on this PC'
    for ($i = 0; $i -lt $targets.Count; $i++) {
        '    [{0}] {1,-34} {2}' -f ($i + 1), $targets[$i].Name, $targets[$i].Kind | Write-Host
        '        {0}' -f $targets[$i].Data | Write-Host -ForegroundColor DarkGray
    }
    if ($env:ROCKET_MT5 -match '^(?i)all$') {
        $pick = $targets
    } else {
        # Split on commas only. Broker names contain spaces ("XM Global MT5"),
        # and splitting on those matched every terminal whose name ends in MT5 -
        # a request for InterStellar installed into XM as well.
        foreach ($raw in ($env:ROCKET_MT5 -split ',')) {
            $n = $raw.Trim()
            if ($n -eq '') { continue }
            if ($n -match '^\d+$' -and [int]$n -ge 1 -and [int]$n -le $targets.Count) {
                $pick += $targets[[int]$n - 1]
            } elseif ($n -match '[\\/:]') {
                # looks like a path -> match the folder, not the broker name
                $pick += $targets | Where-Object { $_.Data -like "$n*" }
            } else {
                $pick += $targets | Where-Object { $_.Name -like "*$n*" }
            }
        }
        $pick = @($pick | Sort-Object Data -Unique)
    }
    Say ''
    Say ("  ROCKET_MT5=" + $env:ROCKET_MT5 + " -> " + (($pick | ForEach-Object { $_.Name }) -join ', '))
} elseif (Test-CanPick) {
    $pick = @(Select-Items -Items $targets -Title ("Install into which MetaTrader 5?  (" + $targets.Count + " found)") -Line {
        param($x)
        '{0,-32} {1,-13} {2}' -f $x.Name, $x.Kind, $x.Data
    })
} else {
    Head '  MetaTrader 5 found on this PC'
    for ($i = 0; $i -lt $targets.Count; $i++) {
        '    [{0}] {1,-34} {2}' -f ($i + 1), $targets[$i].Name, $targets[$i].Kind | Write-Host
        '        {0}' -f $targets[$i].Data | Write-Host -ForegroundColor DarkGray
    }
    Write-Host ''
    $ans = Read-Host "  Which one? (1-$($targets.Count), or a for all)"
    if ($ans -match '^[Aa]') {
        $pick = $targets
    } else {
        foreach ($n in ($ans -split '[,\s]+')) {
            if ($n -match '^\d+$' -and [int]$n -ge 1 -and [int]$n -le $targets.Count) { $pick += $targets[[int]$n - 1] }
        }
    }
}

if ($pick.Count -eq 0) { Say '  Nothing selected - stopping here.' 'Yellow'; return }
Say ("  MetaTrader 5: " + (($pick | ForEach-Object { $_.Name }) -join ', ')) 'DarkGray'

# ----------------------------------------------------------------- builds ---
$builds = @()

if ($env:ROCKET_EA) {
    $bans = $env:ROCKET_EA
    Say ''
    Say ("  ROCKET_EA=" + $bans)
    if ($bans -match '^(?i)a(ll)?$') {
        $builds = $man.builds
    } else {
        foreach ($n in ($bans -split '[,\s]+')) {
            if ($n -match '^\d+$' -and [int]$n -ge 1 -and [int]$n -le $man.builds.Count) {
                $builds += $man.builds[[int]$n - 1]
            } else {
                # an id from the manifest (sgrid / sgridpro / megihedge / semi)
                $builds += $man.builds | Where-Object { $_.id -eq $n }
            }
        }
    }
} elseif (Test-CanPick) {
    $builds = @(Select-Items -Items $man.builds -Title 'Which EA?  (pick as many as you want)' -Line {
        param($x)
        '{0,-26} {1,-6} {2}' -f $x.name, $x.version, $x.blurb
    })
} else {
    Head '  Which EA?'
    for ($i = 0; $i -lt $man.builds.Count; $i++) {
        $b = $man.builds[$i]
        '    [{0}] {1,-26} {2,-6} {3}' -f ($i + 1), $b.name, $b.version, $b.blurb | Write-Host
    }
    Write-Host ''
    $bans = Read-Host "  Which EA? (1-$($man.builds.Count), or a for all)"
    if ($bans -match '^(?i)a(ll)?$' -or $bans -eq '') {
        $builds = $man.builds
    } else {
        foreach ($n in ($bans -split '[,\s]+')) {
            if ($n -match '^\d+$' -and [int]$n -ge 1 -and [int]$n -le $man.builds.Count) {
                $builds += $man.builds[[int]$n - 1]
            }
        }
    }
}

if ($builds.Count -eq 0) { Say '  Nothing selected - stopping here.' 'Yellow'; return }
Say ("  EA: " + (($builds | ForEach-Object { $_.name }) -join ', ')) 'DarkGray'

# ------------------------------------------------------------------ helpers -
function Get-Remote([string]$url, [string]$dest) {
    Invoke-WebRequest -Uri $url -OutFile $dest -Headers @{ 'User-Agent' = $UA } -TimeoutSec 180 -UseBasicParsing
}

function Test-Sha([string]$path, [string]$want) {
    if (-not $want) { return $true }
    $got = (Get-FileHash -Path $path -Algorithm SHA256).Hash.ToLower()
    return ($got -eq $want.ToLower())
}

function Save-File([string]$tmp, [string]$dest) {
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    if (Test-Path $dest) {
        $bakDir = Join-Path $dir '_backup'
        if (-not (Test-Path $bakDir)) { New-Item -ItemType Directory -Path $bakDir -Force | Out-Null }
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        Copy-Item $dest (Join-Path $bakDir ((Split-Path $dest -Leaf) + '.' + $stamp + '.bak')) -Force
    }
    Copy-Item $tmp $dest -Force
}

$mtRunning = @(Get-Process terminal64 -ErrorAction SilentlyContinue).Count -gt 0
$tmpRoot = Join-Path $env:TEMP ('TheRocket-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $tmpRoot -Force | Out-Null

$installedAny = $false
$locked = @()

foreach ($t in $pick) {
    Head ("  " + $t.Name)
    Say ("    " + $t.Data) "DarkGray"

    $expertDir = Join-Path $t.Data 'MQL5\Experts\TheRocket'
    $filesDir  = Join-Path $t.Data 'MQL5\Files\TheRocket'
    $stateFile = Join-Path $filesDir 'installed.json'

    $state = @{}
    if (Test-Path $stateFile) {
        try {
            (Get-Content $stateFile -Raw | ConvertFrom-Json).PSObject.Properties |
                ForEach-Object { $state[$_.Name] = $_.Value }
        } catch { $state = @{} }
    }

    foreach ($b in $builds) {
        # Decide by the fingerprint of the file that is actually there, not by the
        # version note: a rebuilt .ex5 can carry the same version string, and the
        # note is gone if the customer reinstalled MT5 or copied the folder.
        $have    = $state[$b.id]
        $destEx5 = Join-Path $expertDir $b.file
        if ((Test-Path $destEx5) -and (Test-Sha $destEx5 $b.sha256)) {
            '    {0,-20} {1} is the latest - skipped' -f $b.name, $b.version | Write-Host -ForegroundColor DarkGray
            $state[$b.id] = $b.version
            continue
        }

        $what = if (-not $have) { "install $($b.version)" }
                elseif ($have -ne $b.version) { "update $have -> $($b.version)" }
                else { "replace $($b.version) (the file here is not the published one)" }
        '    {0,-20} {1}' -f $b.name, $what | Write-Host

        # the .ex5 itself
        $tmp = Join-Path $tmpRoot $b.file
        try { Get-Remote ($BASE + $b.url) $tmp } catch {
            Say "      download failed: $($_.Exception.Message)" 'Red'; continue
        }
        if (-not (Test-Sha $tmp $b.sha256)) {
            Say '      the downloaded file does not match its published fingerprint - skipped' 'Red'
            continue
        }

        #  The Semi build was renamed on 2026-11-15 (TheRocketMagiSemi_REL.ex5 ->
        #  TheRocketMagiSemi.ex5). Leaving the old file behind would show the
        #  customer two entries in Navigator, one of them stale for good.
        foreach ($stale in @("TheRocketMagiSemi_REL.ex5")) {
            $old = Join-Path $expertDir $stale
            if ((Test-Path $old) -and ($stale -ne $b.file)) {
                try { Remove-Item $old -Force; '      removed the old {0}' -f $stale | Write-Host -ForegroundColor DarkGray } catch {}
            }
        }

        try {
            Save-File $tmp (Join-Path $expertDir $b.file)
        } catch {
            Say '      could not write the file - MT5 may be using it right now' 'Yellow'
            $locked += $b.name
            continue
        }

        # presets, if this build ships any
        foreach ($p in @($b.presets)) {
            if (-not $p) { continue }
            $ptmp = Join-Path $tmpRoot $p.file
            try {
                Get-Remote ($BASE + $p.url) $ptmp
                Save-File $ptmp (Join-Path $t.Data ('MQL5\Presets\' + $b.presetDir + '\' + $p.file))
                '      preset  {0}' -f $p.file | Write-Host -ForegroundColor DarkGray
            } catch { Say "      preset $($p.file) failed - skipped" 'Yellow' }
        }

        # manuals and the install note
        foreach ($d in @($b.docs)) {
            if (-not $d) { continue }
            $dtmp = Join-Path $tmpRoot $d.file
            try {
                Get-Remote ($BASE + $d.url) $dtmp
                Save-File $dtmp (Join-Path $filesDir $d.file)
                '      doc     {0}' -f $d.file | Write-Host -ForegroundColor DarkGray
            } catch { Say "      $($d.file) failed - skipped" 'Yellow' }
        }

        $state[$b.id] = $b.version
        $installedAny = $true
    }

    if (-not (Test-Path $filesDir)) { New-Item -ItemType Directory -Path $filesDir -Force | Out-Null }
    try {
        ($state | ConvertTo-Json) | Set-Content -Path $stateFile -Encoding UTF8
    } catch { Say '    could not save the version note (not important)' 'DarkGray' }
}

Remove-Item $tmpRoot -Recurse -Force -ErrorAction SilentlyContinue

# ------------------------------------------------------------------ wrap up -
if ($locked.Count -gt 0) {
    Head '  Some files are in use'
    Say ('    ' + ($locked -join ', ')) 'Yellow'
    Say '    Close MT5 and run this installer again to finish those.' 'Yellow'
}

if (-not $installedAny -and $locked.Count -eq 0) {
    Head '  Everything is already up to date.'
    Write-Host ''
    return
}

Head '  Done. In MT5:'
Write-Host '    1. Right-click Navigator > Refresh    (no need to restart MT5)'
Write-Host '    2. Open a XAUUSD chart and set it to M5'
Write-Host '    3. Drag the EA from Navigator > Expert Advisors > TheRocket onto the chart'
Write-Host '    4. Tick Allow Algo Trading and Allow DLL imports, then press OK'
Write-Host '    5. Press the Algo Trading button on the toolbar so it turns green'
if ($mtRunning) {
    Write-Host ''
    Say '  MT5 was open while installing. An EA already on a chart keeps the old' 'DarkGray'
    Say '  version until you remove it and drag the new one on.' 'DarkGray'
}
Write-Host ''
Say '  Manuals were saved in MQL5\Files\TheRocket (File > Open Data Folder).' 'DarkGray'
Say '  Questions: therocketea@gmail.com  -  WhatsApp +856 20 9233 3353' 'DarkGray'
Write-Host ''
