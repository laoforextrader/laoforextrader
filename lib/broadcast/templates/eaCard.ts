// Single-EA broadcast card. One image per EA so each gets its own
// background (galaxy for SGride, hyperspace for MegiHedge) — matching
// /ea-system. Shows just the two requested metrics: this period's
// profit (big headline) and total profit (smaller, secondary).
//
// Output: 1080×1080.

export type Period = "daily" | "weekly" | "monthly"
export type Theme = "blue" | "purple"

export interface EACardInput {
  ea: {
    name: string                  // "TheRocket EA SGride"
    icon: "rocket" | "zap"
    theme: Theme
  }
  period: Period
  /** Display date (e.g. "07-05-2026") */
  dateLabel: string
  /** Period profit (the headline number, e.g. "+1.3%") */
  periodPct: string
  /** Cumulative profit (e.g. "+554.2%") */
  totalPct: string
  /** Months since EA started — shown under total */
  monthsRunning: number
  /** Embedded font as data URI for offline rendering */
  fontDataUri: string
}

const PERIOD_LABEL: Record<Period, { eyebrow: string; metric: string }> = {
  daily:   { eyebrow: "Daily Report",   metric: "ມື້ນີ້" },
  weekly:  { eyebrow: "Weekly Report",  metric: "ອາທິດນີ້" },
  monthly: { eyebrow: "Monthly Report", metric: "ເດືອນນີ້" },
}

const ICONS = {
  rocket: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  zap:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
}

function pctColor(s: string, fallback: string): string {
  return s.trim().startsWith("-") ? "#F87171" : fallback
}

export function buildEaCardHtml(input: EACardInput): string {
  const {
    ea, period, dateLabel,
    periodPct, totalPct, monthsRunning,
    fontDataUri,
  } = input
  const label = PERIOD_LABEL[period]
  const isPurple = ea.theme === "purple"

  const bgGradient = isPurple
    ? "linear-gradient(135deg, #0A031F 0%, #1B0F36 50%, #2A0A40 100%)"
    : "linear-gradient(135deg, #050816 0%, #0B1230 50%, #1B0F36 100%)"
  const iconColor   = isPurple ? "#F472B6" : "#FCD34D"
  const periodColor = pctColor(periodPct, "#4ADE80")
  const totalColor  = pctColor(totalPct, isPurple ? "#F472B6" : "#FCD34D")
  const bgScript    = isPurple ? hyperspaceScript : galaxyScript
  const monthLabel  = monthsRunning === 1 ? "month" : "months"

  return `<!DOCTYPE html>
<html lang="lo">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'NotoSansLao';
    src: url('${fontDataUri}') format('truetype');
    font-weight: 100 900; font-display: block;
  }
  *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; font-family: 'NotoSansLao','Inter',sans-serif; }
  .root {
    width: 1080px; height: 1080px;
    background: ${bgGradient};
    position: relative; overflow: hidden;
    color: #fff;
    padding: 70px 80px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .bg-canvas {
    position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;
  }
  .vignette {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%),
      linear-gradient(to right, rgba(0,0,0,0.20), transparent 40%);
  }

  /* Header */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 2;
  }
  .brand { display: flex; align-items: center; gap: 14px; }
  .badge {
    background: linear-gradient(135deg, #EAB308, #CA8A04);
    color: #0B0918; font-weight: 900; font-size: 26px;
    padding: 9px 20px; border-radius: 11px; line-height: 1;
  }
  .brand-name { color: rgba(255,255,255,0.65); font-size: 21px; font-weight: 600; }
  .live-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(74,222,128,0.14); border: 0.5px solid rgba(74,222,128,0.4);
    border-radius: 100px; padding: 8px 18px;
    font-size: 14px; color: #4ADE80; font-weight: 700;
  }
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 10px rgba(74,222,128,0.7); }

  /* Eyebrow */
  .eyebrow-wrap {
    text-align: center; position: relative; z-index: 2;
  }
  .eyebrow {
    font-size: 16px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase;
    background: linear-gradient(90deg, #60A5FA, #22D3EE, #A78BFA, #F472B6, #FCD34D, #60A5FA);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 12px;
  }
  .date {
    font-size: 18px; color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
  }

  /* Glass card */
  .card {
    position: relative; z-index: 2;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 28px; padding: 50px 56px;
    backdrop-filter: blur(14px);
    text-align: center;
  }
  .card-live {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(74,222,128,0.12); border: 0.5px solid rgba(74,222,128,0.35);
    border-radius: 100px; padding: 7px 16px;
    font-size: 14px; color: #4ADE80; font-weight: 600;
    margin-bottom: 24px;
  }
  .card-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #4ADE80;
    box-shadow: 0 0 8px rgba(74,222,128,0.6);
  }

  .ea-name-row {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px; color: rgba(255,255,255,0.7); margin-bottom: 36px;
  }
  .ea-icon { color: ${iconColor}; display: inline-flex; align-items: center; }

  .period-label {
    font-size: 18px; color: rgba(255,255,255,0.5);
    letter-spacing: 0.06em; font-weight: 600; margin-bottom: 8px;
  }
  .period-value {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700; line-height: 1; letter-spacing: -0.04em;
    font-size: 168px; color: ${periodColor}; margin-bottom: 36px;
    text-shadow: 0 0 50px ${periodColor}40;
  }

  .divider {
    height: 1px; background: rgba(255,255,255,0.12);
    margin: 0 auto 30px; max-width: 70%;
  }

  .total-label {
    font-size: 14px; color: rgba(255,255,255,0.42);
    letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700;
    margin-bottom: 8px;
  }
  .total-value {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700; line-height: 1; letter-spacing: -0.02em;
    font-size: 64px; color: ${totalColor}; margin-bottom: 6px;
  }
  .total-sub {
    font-size: 14px; color: rgba(255,255,255,0.4);
  }

  /* Footer */
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 2;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 18px;
  }
  .footer-url {
    color: rgba(255,255,255,0.45); font-size: 17px;
    font-family: 'JetBrains Mono', monospace;
  }
  .footer-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.06); border-radius: 100px; padding: 7px 14px;
    color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 600;
  }
</style>
</head>
<body>
<div class="root">
  <canvas class="bg-canvas" id="bg" width="1080" height="1080"></canvas>
  <div class="vignette"></div>

  <div class="header">
    <div class="brand">
      <div class="badge">LFT</div>
      <div class="brand-name">LaoForexTrader</div>
    </div>
    <div class="live-pill">
      <span class="live-dot"></span>
      Live Account Running
    </div>
  </div>

  <div class="eyebrow-wrap">
    <div class="eyebrow">${escapeHtml(label.eyebrow)}</div>
    <div class="date">${escapeHtml(dateLabel)}</div>
  </div>

  <div class="card">
    <div class="card-live">
      <span class="card-live-dot"></span>
      Live Account Running
    </div>
    <div class="ea-name-row">
      <span class="ea-icon">${ICONS[ea.icon]}</span>
      ${escapeHtml(ea.name)}
    </div>

    <div class="period-label">${escapeHtml(label.metric)}</div>
    <div class="period-value">${escapeHtml(periodPct)}</div>

    <div class="divider"></div>

    <div class="total-label">Total Growth</div>
    <div class="total-value">${escapeHtml(totalPct)}</div>
    <div class="total-sub">${monthsRunning} ${monthLabel} · Live</div>
  </div>

  <div class="footer">
    <div class="footer-url">laoforextrader.com</div>
    <div class="footer-tag">📊 EA System · Live</div>
  </div>
</div>

<script>
${bgScript}
</script>
</body>
</html>`
}

// ─── Background scripts ────────────────────────────────────────────────────

const galaxyScript = `
(function(){
  const c = document.getElementById('bg');
  const ctx = c.getContext('2d');
  const W = 1080, H = 1080;
  const core = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 480);
  core.addColorStop(0, 'rgba(167, 139, 250, 0.32)');
  core.addColorStop(0.45, 'rgba(96, 165, 250, 0.10)');
  core.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  const palette = ['#FFFFFF', '#C7D2FE', '#A5B4FC', '#FBCFE8', '#DDD6FE', '#FDE68A'];
  let seed = 12345;
  function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  ctx.globalCompositeOperation = 'lighter';
  const total = 1100;
  const cx = W/2, cy = H/2;
  const maxR = Math.hypot(W, H) * 0.55;
  for (let i = 0; i < total; i++) {
    const t = rand();
    const r = Math.pow(t, 1.7) * maxR;
    const arm = Math.floor(rand() * 3);
    const baseAngle = (arm / 3) * Math.PI * 2;
    const spiral = (r / maxR) * Math.PI * 1.7;
    const noise = (rand() - 0.5) * 0.55;
    const angle = baseAngle + spiral + noise;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.55 + (cy - cy * 0.45);
    if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
    const size = (0.4 + Math.pow(rand(), 2.4) * 3.2) * (1 + (1 - r / maxR) * 0.6);
    const a = 0.35 + rand() * 0.55;
    const col = palette[(Math.floor(rand() * palette.length))];
    ctx.beginPath();
    ctx.fillStyle = col;
    ctx.globalAlpha = a;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
})();
`

const hyperspaceScript = `
(function(){
  const c = document.getElementById('bg');
  const ctx = c.getContext('2d');
  const W = 1080, H = 1080;
  const cx = W/2, cy = H/2;

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320);
  core.addColorStop(0, 'rgba(244, 114, 182, 0.16)');
  core.addColorStop(0.55, 'rgba(167, 139, 250, 0.05)');
  core.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  const palette = [
    'rgba(167, 139, 250, ',
    'rgba(196, 181, 253, ',
    'rgba(244, 114, 182, ',
    'rgba(96, 165, 250, ',
    'rgba(255, 255, 255, ',
  ];
  let seed = 67890;
  function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  const reach = Math.hypot(W, H) * 0.62;
  const total = 520;
  for (let i = 0; i < total; i++) {
    const angle = rand() * Math.PI * 2;
    const z = Math.pow(rand(), 0.8);
    const r = z * reach;
    const len = 6 + z * 60 + rand() * 18;
    const innerR = Math.max(0, r - len);
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * r;
    const y2 = cy + Math.sin(angle) * r;
    const alpha = Math.min(0.85, 0.18 + z * 0.7);
    const thickness = Math.min(1.6, 0.4 + z * 1.2);
    const col = palette[Math.floor(rand() * palette.length)];
    ctx.strokeStyle = col + alpha.toFixed(2) + ')';
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
})();
`

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
