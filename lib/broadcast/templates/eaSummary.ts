// Image template for EA broadcast (daily / weekly / monthly).
// Same visual language as the EA showcase sections on /ea-system.
// Output: 1080×1080 square for LINE feed.

export type Period = "daily" | "weekly" | "monthly"

export interface EAEntry {
  name: string                  // "TheRocket SGride"
  shortName: string             // "SGride"
  icon: "rocket" | "zap"        // chosen by EA
  theme: "blue" | "purple"      // accent
  periodPct: string             // "+2.4%" — today's / this week's / this month's
  totalPct: string              // "+500%" — cumulative
  strategy: string              // "Grid"
  risk: string                  // "Medium"
}

export interface SummaryInput {
  period: Period
  /** Display date (e.g. "07 ພຶດສະພາ 2026", "02–07 ພຶດສະພາ 2026", "ເມສາ 2026") */
  dateLabel: string
  eas: [EAEntry, EAEntry]
  /** Embedded font as data URI for offline rendering */
  fontDataUri: string
}

const PERIOD_LABEL: Record<Period, { eyebrow: string; metric: string }> = {
  daily:   { eyebrow: "Daily Report",   metric: "ມື້ນີ້" },
  weekly:  { eyebrow: "Weekly Report",  metric: "ອາທິດນີ້" },
  monthly: { eyebrow: "Monthly Report", metric: "ເດືອນນີ້" },
}

const ICONS = {
  rocket: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  zap:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
}

export function buildEaSummaryHtml(input: SummaryInput): string {
  const { period, dateLabel, eas, fontDataUri } = input
  const label = PERIOD_LABEL[period]

  return `<!DOCTYPE html>
<html lang="lo">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'NotoSansLao';
    src: url('${fontDataUri}') format('truetype');
    font-weight: 100 900;
    font-display: block;
  }
  *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; font-family: 'NotoSansLao','Inter',sans-serif; }
  .root {
    width: 1080px; height: 1080px;
    background: linear-gradient(135deg, #050816 0%, #0B1230 50%, #1B0F36 100%);
    position: relative; overflow: hidden;
    color: #fff;
    padding: 64px 60px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .grain {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 18% 22%, rgba(96,165,250,0.18), transparent 32%),
      radial-gradient(circle at 82% 78%, rgba(244,114,182,0.16), transparent 30%),
      radial-gradient(circle at 75% 18%, rgba(167,139,250,0.10), transparent 35%);
    pointer-events: none;
  }
  .grid-lines {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .badge {
    background: linear-gradient(135deg, #EAB308, #CA8A04);
    color: #0B0918; font-weight: 900; font-size: 24px;
    padding: 8px 18px; border-radius: 10px; line-height: 1;
  }
  .brand-name { color: rgba(255,255,255,0.72); font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
  .live-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(74,222,128,0.14); border: 0.5px solid rgba(74,222,128,0.4);
    border-radius: 100px; padding: 7px 16px;
    font-size: 13px; color: #4ADE80; font-weight: 700;
  }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 10px rgba(74,222,128,0.7); }

  /* Period title */
  .period { text-align: center; position: relative; z-index: 1; margin-top: -20px; }
  .eyebrow {
    font-size: 14px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
    background: linear-gradient(135deg, #60A5FA, #A78BFA, #F472B6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 14px;
  }
  .period-title {
    font-size: 50px; font-weight: 800; color: #fff;
    letter-spacing: -0.02em; line-height: 1.05; margin-bottom: 10px;
  }
  .date {
    font-size: 18px; color: rgba(255,255,255,0.55);
    font-family: 'JetBrains Mono','Inter',monospace;
  }

  /* EA grid */
  .ea-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 22px;
    position: relative; z-index: 1;
  }
  .ea-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 22px; padding: 28px 26px;
    backdrop-filter: blur(10px); position: relative; overflow: hidden;
  }
  .ea-card.blue::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #60A5FA, #A78BFA);
  }
  .ea-card.purple::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #A78BFA, #F472B6);
  }

  .ea-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .ea-icon { display: flex; align-items: center; justify-content: center; }
  .ea-icon.blue { color: #FCD34D; }
  .ea-icon.purple { color: #F472B6; }
  .ea-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85);
    letter-spacing: -0.01em;
  }

  .metric-main { margin-bottom: 22px; }
  .metric-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 6px;
  }
  .metric-value {
    font-family: 'JetBrains Mono', monospace; font-weight: 700;
    font-size: 64px; line-height: 1; letter-spacing: -0.02em;
    color: #4ADE80;
  }
  .metric-value.neg { color: #F87171; }

  .ea-sub {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 16px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .ea-sub-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; }
  .ea-k { color: rgba(255,255,255,0.4); letter-spacing: 0.04em; }
  .ea-v { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: rgba(255,255,255,0.85); }
  .ea-v.total { color: #FCD34D; }
  .ea-v.purple-total { color: #F472B6; }

  /* Footer */
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 1;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 22px;
  }
  .footer-url {
    color: rgba(255,255,255,0.45); font-size: 16px; letter-spacing: 0.01em;
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
  <div class="grain"></div>
  <div class="grid-lines"></div>

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

  <div class="period">
    <div class="eyebrow">${escapeHtml(label.eyebrow)}</div>
    <div class="period-title">ຜົນງານ TheRocket EA</div>
    <div class="date">${escapeHtml(dateLabel)}</div>
  </div>

  <div class="ea-grid">
    ${eas.map((ea, i) => renderCard(ea, label.metric, i === 0 ? "left" : "right")).join("")}
  </div>

  <div class="footer">
    <div class="footer-url">laoforextrader.com</div>
    <div class="footer-tag">📊 EA System · Live</div>
  </div>
</div>
</body>
</html>`
}

function renderCard(ea: EAEntry, metricLabel: string, _pos: "left" | "right"): string {
  const isPurple = ea.theme === "purple"
  const cls = isPurple ? "purple" : "blue"
  const totalCls = isPurple ? "purple-total" : "total"
  const negCls = ea.periodPct.trim().startsWith("-") ? "neg" : ""

  return `
    <div class="ea-card ${cls}">
      <div class="ea-header">
        <div class="ea-icon ${cls}">${ICONS[ea.icon]}</div>
        <div class="ea-name">${escapeHtml(ea.name)}</div>
      </div>
      <div class="metric-main">
        <div class="metric-label">${escapeHtml(metricLabel)}</div>
        <div class="metric-value ${negCls}">${escapeHtml(ea.periodPct)}</div>
      </div>
      <div class="ea-sub">
        <div class="ea-sub-row">
          <span class="ea-k">Total Growth</span>
          <span class="ea-v ${totalCls}">${escapeHtml(ea.totalPct)}</span>
        </div>
        <div class="ea-sub-row">
          <span class="ea-k">Strategy</span>
          <span class="ea-v">${escapeHtml(ea.strategy)}</span>
        </div>
        <div class="ea-sub-row">
          <span class="ea-k">Risk</span>
          <span class="ea-v">${escapeHtml(ea.risk)}</span>
        </div>
      </div>
    </div>
  `
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
