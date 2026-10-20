"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./GalaxySpiralCanvas.module.css"

// Spiral galaxy background (three.js). The particles are laid out on
// `BRANCHES` arms and the vertex shader rotates each one around the centre by
// an amount that falls off with distance, so the inner arms sweep faster and
// the spiral keeps winding — the arms are geometry, the curl is time.
//
// Three.js is ~150 KB gzip, so it is imported dynamically the first time the
// section scrolls near the viewport, and the loop only runs while the section
// is on screen.

const COUNT_DESKTOP = 100_000
const COUNT_MOBILE = 35_000 // a phone GPU chokes on 100k additive points
const SIZE = 12
const RADIUS = 9
const BRANCHES = 6
const RANDOMNESS = 0.2
const RANDOMNESS_POWER = 2
const SPIN = 0.2

export interface GalaxyPreset {
  name: string
  inside: string
  outside: string
}

const PRESETS: GalaxyPreset[] = [
  { name: "Nebula", inside: "#FCD34D", outside: "#DB2777" },
  { name: "MegiHedge", inside: "#F472B6", outside: "#7C3AED" },
  { name: "Deep space", inside: "#FFFFFF", outside: "#6D28D9" },
  { name: "Calm", inside: "#22D3EE", outside: "#4338CA" },
]

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;

  attribute float aScale;
  attribute vec3 aRandomness;

  varying vec3 vColor;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * ${SPIN.toFixed(2)};
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
  }
`

const FRAG = /* glsl */ `
  varying vec3 vColor;

  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    gl_FragColor = vec4(mix(vec3(0.0), vColor, strength), 1.0);
    #include <colorspace_fragment>
  }
`

export function GalaxySpiralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preset, setPreset] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [reduced, setReduced] = useState(false)

  // Imperative handles the effect fills in once three has loaded. State drives
  // the buttons; these drive the scene, so changing a colour or the speed
  // never rebuilds the geometry.
  const applyColors = useRef<((p: GalaxyPreset) => void) | null>(null)
  const speedRef = useRef(1)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { applyColors.current?.(PRESETS[preset]) }, [preset])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const still = motionQuery.matches
    setReduced(still)

    let disposed = false
    let started = false
    let visible = false
    let stop: (() => void) | null = null

    async function init() {
      const THREE = await import("three")
      if (disposed) return

      const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas!,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(host!.clientWidth, host!.clientHeight, false)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        60,
        host!.clientWidth / Math.max(1, host!.clientHeight),
        0.1,
        100,
      )
      // Inside the arms rather than above them: at RADIUS 9 this reads as a
      // starfield you are flying through, which is the look that was approved.
      camera.position.set(3.2, 2.4, 3.6)
      camera.lookAt(0, 0, 0)

      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const scales = new Float32Array(count)
      const randomness = new Float32Array(count * 3)
      // Distance ratio per particle, kept so a colour change is one pass over
      // this array instead of a full rebuild.
      const ratios = new Float32Array(count)

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const radius = Math.random() * RADIUS
        const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2

        positions[i3] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius

        for (let a = 0; a < 3; a++) {
          randomness[i3 + a] =
            Math.pow(Math.random(), RANDOMNESS_POWER) *
            (Math.random() < 0.5 ? 1 : -1) *
            RANDOMNESS *
            radius
        }

        ratios[i] = radius / RADIUS
        scales[i] = Math.random()
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1))
      geometry.setAttribute("aRandomness", new THREE.BufferAttribute(randomness, 3))

      const material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: SIZE * dpr },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      })

      const points = new THREE.Points(geometry, material)
      scene.add(points)

      const paint = (p: GalaxyPreset) => {
        const inside = new THREE.Color(p.inside)
        const outside = new THREE.Color(p.outside)
        const mixed = new THREE.Color()
        for (let i = 0; i < count; i++) {
          mixed.copy(inside).lerp(outside, ratios[i])
          colors[i * 3] = mixed.r
          colors[i * 3 + 1] = mixed.g
          colors[i * 3 + 2] = mixed.b
        }
        geometry.attributes.color.needsUpdate = true
      }
      paint(PRESETS[preset])
      applyColors.current = paint

      const resize = () => {
        const w = host!.clientWidth
        const h = Math.max(1, host!.clientHeight)
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      const ro = new ResizeObserver(resize)
      ro.observe(host!)

      let raf = 0
      let last = performance.now()
      let spinTime = 0

      const frame = () => {
        raf = requestAnimationFrame(frame)
        const now = performance.now()
        const delta = Math.min((now - last) / 1000, 0.1)
        last = now
        if (!visible) return

        const mult = speedRef.current
        spinTime += delta * mult
        material.uniforms.uTime.value = spinTime
        points.rotation.y += delta * 0.02 * mult
        renderer.render(scene, camera)
      }

      if (still) {
        renderer.render(scene, camera) // one static frame
      } else {
        raf = requestAnimationFrame(frame)
      }

      stop = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        applyColors.current = null
        geometry.dispose()
        material.dispose()
        renderer.dispose()
      }
    }

    const io = new IntersectionObserver(
      entries => {
        visible = entries[0]?.isIntersecting ?? false
        if (visible && !started) {
          started = true
          void init()
        }
      },
      { rootMargin: "300px" },
    )
    io.observe(host)

    return () => {
      disposed = true
      io.disconnect()
      stop?.()
    }
    // Colours and speed are applied through refs, so the scene is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className={styles.controls}>
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            className={styles.dot}
            aria-pressed={preset === i}
            aria-label={`ສີ ${p.name}`}
            title={p.name}
            onClick={() => setPreset(i)}
            style={{ background: `linear-gradient(135deg, ${p.inside}, ${p.outside})` }}
          />
        ))}

        {!reduced && (
          <>
            <span className={styles.sep} />
            {[1, 2, 3, 4].map(s => (
              <button
                key={s}
                type="button"
                className={styles.speed}
                aria-pressed={speed === s}
                aria-label={`ຄວາມໄວ x${s}`}
                onClick={() => setSpeed(s)}
              >
                x{s}
              </button>
            ))}
          </>
        )}
      </div>
    </>
  )
}
