"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"

// ── ຄ່າສຳເລັດຮູບຂອງແຕ່ລະໂໝດ (ກົງກັບຄ່າໃນ EA) ──
const FIX = { pw: 1.3, ds: 2.0, dd: 0.7, df: 1.1, satCapMult: 20, satK: 0.25 }

const MODES: Record<string, { name: string; desc: string; color: string; formula: string }> = {
  linear: { name: "Linear", desc: "ເພີ່ມເທົ່າກັນທຸກໄມ້", color: "#2563EB",
            formula: "lot = StartLot × level" },
  power:  { name: "Power", desc: `p=${FIX.pw} (ຄ່າຄົງທີ່)`, color: "#059669",
            formula: `lot = StartLot × level^${FIX.pw}` },
  decay:  { name: "Decaying Mult", desc: `${FIX.ds}/${FIX.dd}/${FIX.df} (ຄ່າຄົງທີ່)`, color: "#D97706",
            formula: `mult(lv) = ${FIX.df} + (${FIX.ds} − ${FIX.df}) × ${FIX.dd}^(lv−2) — ຄູນສະສົມທີລະ level` },
  sat:    { name: "Saturating", desc: `ເພດານ StartLot×${FIX.satCapMult}`, color: "#7C3AED",
            formula: `lot = Cap − (Cap − StartLot) × e^(−${FIX.satK}×(lv−1)),  Cap = StartLot × ${FIX.satCapMult}` },
  custom: { name: "Custom Table", desc: "ປັບຄ່າເອງໄດ້", color: "#DB2777",
            formula: "mult(lv) = Floor + (Start − Floor) × Decay^(lv−2) + Max Lot cap — ໃຊ້ຄ່າຈາກ Custom Parameters" },
}

const PIN_COLORS = ["#6B7280", "#60A5FA", "#F9A8D4"]
const STORAGE_KEY = "lft_lotcurve_presets"

type Params = {
  sl: number; ml: number; ls: number; gp: number; pv: number
  ds: number; dd: number; df: number; cm: number
}
type Row = {
  lv: number; ratio: number | null; rawLot: number; mt5: number
  cumLot: number; lvLoss: number; cumLoss: number; share: number
}
type Pin = { label: string; data: number[] }
type PresetMap = Record<string, { _mode: string } & Params>

const DEFAULTS: Params = { sl: 0.01, ml: 50, ls: 0.01, gp: 150, pv: 10, ds: 2.0, dd: 0.7, df: 1.1, cm: 0 }

function roundToLotStep(lot: number, step: number) {
  const decimals = Math.round(-Math.log10(step))
  return parseFloat((Math.round(lot / step) * step).toFixed(decimals))
}

function buildRows(mode: string, p: Params): Row[] {
  const rows: Row[] = []
  let rawLot = p.sl, cumLot = 0, cumLoss = 0, prevMt5 = 0
  for (let lv = 1; lv <= p.ml; lv++) {
    if (mode === "decay" || mode === "custom") {
      const mS = mode === "decay" ? FIX.ds : p.ds
      const mD = mode === "decay" ? FIX.dd : p.dd
      const mF = mode === "decay" ? FIX.df : p.df
      if (lv === 1) rawLot = p.sl
      else {
        const mult = mF + (mS - mF) * Math.pow(mD, lv - 2)
        rawLot = parseFloat((rawLot * mult).toFixed(8))
        if (rawLot < p.sl) rawLot = p.sl
      }
      if (mode === "custom" && p.cm > 0 && rawLot > p.cm) rawLot = p.cm
    } else if (mode === "linear") {
      rawLot = p.sl * lv
    } else if (mode === "power") {
      rawLot = p.sl * Math.pow(lv, FIX.pw)
    } else {
      const cap = p.sl * FIX.satCapMult
      rawLot = cap - (cap - p.sl) * Math.exp(-FIX.satK * (lv - 1))
    }
    if (rawLot < p.sl) rawLot = p.sl
    let mt5 = roundToLotStep(rawLot, p.ls)
    if (mt5 < p.ls) mt5 = p.ls
    const ratio = lv === 1 || prevMt5 <= 0 ? null : mt5 / prevMt5
    cumLot = parseFloat((cumLot + mt5).toFixed(8))
    const lvLoss = parseFloat((mt5 * p.gp * p.pv).toFixed(2))
    cumLoss = parseFloat((cumLoss + lvLoss).toFixed(2))
    rows.push({ lv, ratio, rawLot, mt5, cumLot, lvLoss, cumLoss, share: 0 })
    prevMt5 = mt5
  }
  rows.forEach(r => (r.share = (r.mt5 / cumLot) * 100))
  return rows
}

// ── styles ──
const card: React.CSSProperties = { background: "#fff", border: "1.5px solid #E2E6F0", borderRadius: 14, padding: "16px 18px" }
const secTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", margin: "22px 0 10px" }
const inputStyle: React.CSSProperties = { width: "100%", background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#111827", fontSize: 13, padding: "7px 10px", borderRadius: 8, outline: "none", fontFamily: "monospace" }
const btn = (color: string, bg: string, border: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${border}`,
  borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
  whiteSpace: "nowrap", color, background: bg,
})

export default function LotCurveDesigner() {
  const [mode, setMode] = useState("decay")
  const [p, setP] = useState<Params>(DEFAULTS)
  const [pins, setPins] = useState<Pin[]>([])
  const [presets, setPresets] = useState<PresetMap>({})
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const cLot = useRef<HTMLCanvasElement>(null)
  const cLoss = useRef<HTMLCanvasElement>(null)
  const cMult = useRef<HTMLCanvasElement>(null)
  const charts = useRef<Chart[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try { setPresets(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")) } catch { /* ignore */ }
  }, [])

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  const set = (k: keyof Params) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setP(prev => ({ ...prev, [k]: isFinite(v) ? v : prev[k] }))
  }

  const rows = buildRows(mode, p)
  const last = rows[rows.length - 1]
  const clr = MODES[mode].color
  const maxShare = Math.max(...rows.map(r => r.share))

  // ── charts ──
  useEffect(() => {
    charts.current.forEach(c => c.destroy())
    charts.current = []
    const gridClr = "rgba(0,0,0,0.06)", tickClr = "#9CA3AF"
    const baseOpts = {
      responsive: true, maintainAspectRatio: false, animation: { duration: 200 },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridClr }, ticks: { color: tickClr, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
        y: { grid: { color: gridClr }, ticks: { color: tickClr, font: { size: 10 } } },
      },
    } as const
    const labels = rows.map(r => "Lv" + r.lv)

    if (cLot.current) {
      const datasets: object[] = [{
        label: MODES[mode].name, data: rows.map(r => r.mt5), borderColor: clr,
        borderWidth: 2.5, pointRadius: 2.5, pointBackgroundColor: clr, fill: false, tension: 0.3,
      }]
      pins.forEach((pin, i) => datasets.push({
        label: "📌 " + pin.label, data: pin.data, borderColor: PIN_COLORS[i % PIN_COLORS.length],
        borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false, tension: 0.3,
      }))
      charts.current.push(new Chart(cLot.current, { type: "line", data: { labels, datasets: datasets as never }, options: baseOpts as never }))
    }
    if (cLoss.current) {
      charts.current.push(new Chart(cLoss.current, {
        type: "line",
        data: { labels, datasets: [{ data: rows.map(r => r.cumLoss), borderColor: "#DC2626", backgroundColor: "#DC262615", borderWidth: 2, pointRadius: 2, fill: true, tension: 0.3 }] },
        options: baseOpts as never,
      }))
    }
    if (cMult.current) {
      charts.current.push(new Chart(cMult.current, {
        type: "bar",
        data: { labels, datasets: [{ data: rows.map(r => (r.ratio ? parseFloat(r.ratio.toFixed(3)) : null)), backgroundColor: clr + "bb", borderRadius: 2 }] },
        options: baseOpts as never,
      }))
    }
    const snapshot = charts.current
    return () => snapshot.forEach(c => c.destroy())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, p, pins])

  // ── pins ──
  const pinLabel = () => {
    switch (mode) {
      case "linear": return "Linear ×lv"
      case "power": return `Power p=${FIX.pw}`
      case "decay": return `Decay ${FIX.ds}/${FIX.dd}/${FIX.df}`
      case "sat": return `Sat ×${FIX.satCapMult} k=${FIX.satK}`
      default: return `Custom ${p.ds}/${p.dd}/${p.df}${p.cm > 0 ? " cap" + p.cm : ""}`
    }
  }
  const pinCurve = () => {
    if (pins.length >= 3) { showToast("Pin ໄດ້ສູງສຸດ 3 ເສັ້ນ — ກົດລ້າງ Pin ກ່ອນ", false); return }
    setPins([...pins, { label: pinLabel(), data: rows.map(r => r.mt5) }])
    showToast("Pin ແລ້ວ")
  }

  // ── presets ──
  const savePresets = (ps: PresetMap) => { setPresets(ps); localStorage.setItem(STORAGE_KEY, JSON.stringify(ps)) }
  const doSave = () => {
    const name = window.prompt("ຕັ້ງຊື່ preset:", activePreset || "")?.trim()
    if (!name) return
    savePresets({ ...presets, [name]: { _mode: mode, ...p } })
    setActivePreset(name)
    showToast(`ບັນທຶກ "${name}" ແລ້ວ`)
  }
  const loadPreset = (n: string) => {
    const ps = presets[n]
    if (!ps) return
    if (MODES[ps._mode]) setMode(ps._mode)
    const { _mode, ...rest } = ps
    setP({ ...DEFAULTS, ...rest })
    setActivePreset(n)
    showToast(`ໂຫຼດ "${n}" ແລ້ວ`)
  }
  const deletePreset = (e: React.MouseEvent, n: string) => {
    e.stopPropagation()
    if (!window.confirm(`ລຶບ preset "${n}" ບໍ?`)) return
    const ps = { ...presets }
    delete ps[n]
    savePresets(ps)
    if (activePreset === n) setActivePreset(null)
    showToast(`ລຶບ "${n}" ແລ້ວ`)
  }
  const exportPresets = () => {
    if (Object.keys(presets).length === 0) { showToast("ບໍ່ມີ preset ທີ່ຈະ export", false); return }
    const b = new Blob([JSON.stringify(presets, null, 2)], { type: "application/json" })
    const u = URL.createObjectURL(b), a = document.createElement("a")
    a.href = u; a.download = "lotcurve_presets.json"; a.click(); URL.revokeObjectURL(u)
    showToast(`Export ${Object.keys(presets).length} preset ແລ້ວ`)
  }
  const importPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = ev => {
      try {
        const inc = JSON.parse(String(ev.target?.result))
        if (typeof inc !== "object" || Array.isArray(inc)) throw new Error()
        const ex = { ...presets }; let n = 0
        Object.entries(inc).forEach(([k, v]) => { if (v && typeof v === "object") { ex[k] = v as PresetMap[string]; n++ } })
        savePresets(ex)
        showToast(`Import ${n} preset ສຳເລັດ`)
      } catch { showToast("ໄຟລ໌ບໍ່ຖືກຕ້ອງ", false) }
      e.target.value = ""
    }
    r.readAsText(f)
  }

  const lastShare = last.share
  const num = (label: string, key: keyof Params, step: number, note?: string, accent?: string) => (
    <div style={{ ...card, padding: "10px 12px", ...(accent ? { borderColor: accent + "66" } : {}) }}>
      <label style={{ fontSize: 11, color: accent || "#6B7280", display: "block", marginBottom: 4, fontWeight: 600 }}>{label}</label>
      <input type="number" step={step} value={p[key]} onChange={set(key)} style={inputStyle} />
      {note && <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}>{note}</div>}
    </div>
  )

  return (
    <div style={{ background: "#EDEEF2", minHeight: "80vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px", fontFamily: "'Noto Sans Lao', -apple-system, sans-serif" }}>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 6 }}>
          ເຄື່ອງມື Forex
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Lot Curve Designer
        </h1>
        <p style={{ fontSize: 13, color: "#374151", marginBottom: 24 }}>
          ອອກແບບ ແລະ ປຽບທຽບສູດການເພີ່ມ Lot ຕໍ່ Level ຂອງ Grid / Martingale EA — ເບິ່ງຄວາມສ່ຽງກ່ອນນຳໄປໃຊ້ຈິງ
        </p>

        {/* MODE */}
        <div style={secTitle}>ຮູບແບບການເພີ່ມ Lot</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.entries(MODES).map(([k, m]) => (
            <div key={k} onClick={() => setMode(k)}
              style={{
                display: "flex", flexDirection: "column", gap: 2, background: mode === k ? m.color + "14" : "#fff",
                border: `1.5px solid ${mode === k ? m.color : "#E2E6F0"}`, borderRadius: 10,
                padding: "8px 14px", cursor: "pointer", userSelect: "none", minWidth: 118,
              }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: mode === k ? m.color : "#111827" }}>{m.name}</span>
              <span style={{ fontSize: 10, color: "#6B7280" }}>{m.desc}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#2563EB", background: "#EEF3FF", border: "1.5px solid #BFCFFF", borderRadius: 8, padding: "7px 12px", marginBottom: 14, fontFamily: "monospace" }}>
          ສູດ:  {MODES[mode].formula}
        </div>

        {/* PRESET BAR */}
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px 14px", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Presets</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {Object.keys(presets).length === 0 ? (
              <span style={{ fontSize: 11, color: "#9CA3AF", alignSelf: "center" }}>ຍັງບໍ່ມີ preset — ກົດບັນທຶກເພື່ອເກັບຄ່າໄວ້</span>
            ) : Object.keys(presets).map(n => (
              <span key={n} onClick={() => loadPreset(n)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 7, padding: "4px 10px",
                  fontSize: 11, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
                  background: activePreset === n ? "#EEF3FF" : "#F9FAFB",
                  border: `1.5px solid ${activePreset === n ? "#2563EB" : "#E5E7EB"}`,
                  color: activePreset === n ? "#2563EB" : "#374151", fontWeight: 600,
                }}>
                {n}
                <button onClick={e => deletePreset(e, n)}
                  style={{ width: 15, height: 15, borderRadius: 4, background: "#FEE2E2", color: "#DC2626", border: "none", cursor: "pointer", fontSize: 10, lineHeight: "15px", padding: 0 }}>✕</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={btn("#D97706", "#FFF7ED", "#FED7AA")} onClick={pinCurve}>📌 Pin ເສັ້ນ</button>
            <button style={btn("#DC2626", "#FEF2F2", "#FECACA")} onClick={() => setPins([])}>✕ ລ້າງ Pin</button>
            <button style={btn("#059669", "#ECFDF5", "#A7F3D0")} onClick={doSave}>💾 ບັນທຶກ</button>
            <button style={btn("#2563EB", "#EEF3FF", "#BFCFFF")} onClick={exportPresets}>⬇ Export</button>
            <button style={btn("#7C3AED", "#F5F3FF", "#DDD6FE")} onClick={() => fileRef.current?.click()}>⬆ Import</button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={importPresets} />
          </div>
        </div>

        {/* PARAMS */}
        <div style={secTitle}>ພາຣາມິເຕີພື້ນຖານ</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 8 }}>
          {num("Lot ເລີ່ມຕົ້ນ", "sl", 0.001)}
          {num("Max Level", "ml", 1)}
          {num("Lot Step ຂອງໂບຣກເກີ", "ls", 0.001, "lot ຂັ້ນຕໍ່າສຸດທີ່ broker ຮັບ", "#2563EB")}
          {num("ໄລຍະ Grid (pips)", "gp", 1)}
          {num("Pip Value (USD/pip/lot)", "pv", 0.1)}
        </div>

        {mode === "custom" && (<>
          <div style={secTitle}>Custom Parameters — ໃຊ້ໄດ້ສະເພາະໂໝດ Custom Table</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 8 }}>
            {num("Mult Start (ຄູນໄມ້ທຳອິດ)", "ds", 0.05, undefined, "#D97706")}
            {num("Mult Decay (0–1)", "dd", 0.05, "ຍິ່ງນ້ອຍ ຍິ່ງອ່ອນລົງໄວ · 1.0 = ຄູນຄົງທີ່", "#D97706")}
            {num("Mult Floor (ຄູນຕໍ່າສຸດ)", "df", 0.05, undefined, "#D97706")}
            {num("Max Lot ຕໍ່ໄມ້", "cm", 0.01, "0 = ບໍ່ຈຳກັດ", "#D97706")}
          </div>
        </>)}

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, margin: "16px 0" }}>
          <div style={card}><div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>ໂໝດ</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: clr }}>{MODES[mode].name}</div></div>
          <div style={card}><div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Lot ລວມທັງໝົດ</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#059669", fontFamily: "monospace" }}>{last.cumLot.toFixed(2)}</div></div>
          <div style={card}><div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Lot ສູງສຸດ Lv{p.ml}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#D97706", fontFamily: "monospace" }}>{last.mt5.toFixed(2)}</div></div>
          <div style={card}><div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>ໄມ້ສຸດທ້າຍ % ຂອງ volume</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "monospace", color: lastShare > 40 ? "#DC2626" : lastShare > 25 ? "#D97706" : "#059669" }}>{lastShare.toFixed(1)}%</div></div>
          <div style={card}><div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>ຂາດທຶນລວມ (ຖືກລາກຄົບ)</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#DC2626", fontFamily: "monospace" }}>${last.cumLoss.toLocaleString()}</div></div>
        </div>

        {/* CHARTS */}
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
            <span><span style={{ width: 10, height: 10, borderRadius: 2, display: "inline-block", marginRight: 4, verticalAlign: "middle", background: clr }} />{MODES[mode].name}</span>
            {pins.map((pin, i) => (
              <span key={i}><span style={{ width: 10, height: 10, borderRadius: 2, display: "inline-block", marginRight: 4, verticalAlign: "middle", background: PIN_COLORS[i % PIN_COLORS.length] }} />📌 {pin.label}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
            ຂະໜາດ Lot ຕໍ່ Level — 📌 Pin ເພື່ອປຽບທຽບຫຼາຍສູດພ້ອມກັນ
          </div>
          <div style={{ position: "relative", width: "100%", height: 230 }}><canvas ref={cLot} /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12, marginBottom: 12 }}>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>ຂາດທຶນສະສົມ ($) — ຖ້າຖືກລາກຄົບທຸກ level</div>
            <div style={{ position: "relative", width: "100%", height: 210 }}><canvas ref={cLoss} /></div>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>ຕົວຄູນ (ອັດຕາໄມ້ຕໍ່ໄມ້)</div>
            <div style={{ position: "relative", width: "100%", height: 210 }}><canvas ref={cMult} /></div>
          </div>
        </div>

        {/* TABLE */}
        <div style={secTitle}>ຕາຕະລາງ Lot</div>
        <div style={{ overflowX: "auto", border: "1.5px solid #E2E6F0", borderRadius: 12, background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: "#F9FAFB" }}>
              {["Lv", "ຕົວຄູນ", "Lot (raw)", "MT5 Lot ★", "Lot ສະສົມ", "% ຂອງທັງໝົດ", "ຂາດທຶນ/Level", "ຂາດທຶນສະສົມ"].map((h, i) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: i === 0 ? "center" : "right", fontWeight: 600, fontSize: 11, color: i === 3 ? "#2563EB" : "#6B7280", borderBottom: "1.5px solid #E2E6F0", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.lv}>
                  <td style={{ padding: "6px 10px", textAlign: "center", color: "#9CA3AF", borderBottom: "1px solid #F3F4F6" }}>{r.lv}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #F3F4F6", color: "#111827" }}>{r.ratio ? "×" + r.ratio.toFixed(2) : <span style={{ color: "#9CA3AF" }}>— (ເລີ່ມ)</span>}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: "#9CA3AF", fontSize: 11, borderBottom: "1px solid #F3F4F6", fontFamily: "monospace" }}>{r.rawLot.toFixed(6)}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: "#2563EB", fontWeight: 700, background: "#EEF3FF55", borderBottom: "1px solid #F3F4F6", fontFamily: "monospace" }}>{r.mt5.toFixed(2)}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: "#6B7280", borderBottom: "1px solid #F3F4F6", fontFamily: "monospace" }}>{r.cumLot.toFixed(2)}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #F3F4F6", color: "#111827" }}>
                    <span style={{ display: "inline-block", height: 8, background: "#F59E0B66", borderRadius: 2, verticalAlign: "middle", marginRight: 6, width: Math.max(2, (r.share / maxShare) * 60) }} />
                    {r.share.toFixed(1)}%
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: "#D97706", borderBottom: "1px solid #F3F4F6", fontFamily: "monospace" }}>${r.lvLoss.toLocaleString()}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", color: "#DC2626", borderBottom: "1px solid #F3F4F6", fontFamily: "monospace" }}>${r.cumLoss.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "#6B7280", marginTop: 10, padding: "0 4px" }}>
          ★ MT5 Lot = lot ຈິງຫຼັງປັດເສດຕາມ Lot Step ຂອງໂບຣກເກີ · &quot;% ຂອງທັງໝົດ&quot; = ໄມ້ນີ້ກິນສ່ວນເທົ່າໃດຂອງ volume ທັງ grid
        </p>
        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 14 }}>
          ⚠ ເຄື່ອງມືສຳລັບການສຶກສາ · Grid / Martingale ມີຄວາມສ່ຽງສູງ ຄວນທົດສອບ Backtest ກ່ອນໃຊ້ເງິນຈິງ
        </p>

        {/* TOAST */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, background: "#fff",
            border: `1.5px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderRadius: 10,
            padding: "10px 16px", fontSize: 12, color: toast.ok ? "#059669" : "#DC2626",
            zIndex: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontWeight: 600,
          }}>{toast.msg}</div>
        )}
      </div>
    </div>
  )
}
