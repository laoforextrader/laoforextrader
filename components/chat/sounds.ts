// Synthesized sound effects for the chat widget.
//
// Three discrete events (click / boop) generate short blips, and a
// continuous "hum" plays for the entire duration the AI is streaming.
// All sounds are soft (peak gain ≤ 0.045) and clip-safe.

let _ctx: AudioContext | null = null

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (_ctx) return _ctx
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  _ctx = new Ctor()
  return _ctx
}

interface ToneOpts {
  freq: number
  durMs: number
  volume?: number
  type?: OscillatorType
  freqEnd?: number
}

function tone({ freq, durMs, volume = 0.04, type = "sine", freqEnd }: ToneOpts) {
  const c = ctx()
  if (!c) return
  if (c.state === "suspended") c.resume().catch(() => null)

  const dur = durMs / 1000
  const osc  = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + dur)
  }
  gain.gain.setValueAtTime(0.0001, c.currentTime)
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)

  osc.connect(gain).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur + 0.04)
}

// One-shot: completion chime when AI finishes streaming
export function playBoop() {
  tone({ freq: 700, durMs: 90,  volume: 0.04,  type: "sine" })
  setTimeout(() => tone({ freq: 980, durMs: 110, volume: 0.045, type: "sine" }), 75)
}

// One-shot: user pressed send
export function playClick() {
  tone({ freq: 1100, durMs: 40, volume: 0.028, type: "triangle" })
}

// ── "Thinking" tick loop while AI is streaming ────────────────────
// Rapid soft tones at slightly-varied pitch — sounds like AI is
// processing, not a sustained hum. Each tick is a 30 ms sine blip
// with pitch picked via a gentle random walk so consecutive ticks
// feel related (not just noise).

let tickInterval: ReturnType<typeof setInterval> | null = null
let lastTickFreq = 800

export function startStreamSound() {
  if (tickInterval !== null) return
  const c = ctx()
  if (!c) return
  if (c.state === "suspended") c.resume().catch(() => null)

  const tick = () => {
    // Random walk inside 680-920 Hz — gives a "doot doot doot" feel
    // without sounding like a flat tone or pure noise.
    const drift = (Math.random() - 0.5) * 80
    lastTickFreq = Math.max(680, Math.min(920, lastTickFreq + drift))
    tone({
      freq: lastTickFreq,
      freqEnd: lastTickFreq - 30, // tiny downward glide → "doot"
      durMs: 38,
      volume: 0.020,
      type: "sine",
    })
  }

  tick()                                    // fire immediately
  tickInterval = setInterval(tick, 160)     // ~6 ticks/sec
}

export function stopStreamSound() {
  if (tickInterval !== null) {
    clearInterval(tickInterval)
    tickInterval = null
  }
}
