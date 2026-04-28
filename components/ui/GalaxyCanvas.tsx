"use client"
import { useEffect, useRef } from "react"

const VERT = `
attribute vec4 a_data;
attribute vec3 a_color;
attribute float a_twinkle;

uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_mouse;
uniform float u_mouseActive;
uniform float u_dpr;

varying vec3  v_color;
varying float v_alpha;

void main() {
  float r     = a_data.x;
  float angle = a_data.y + u_time * a_data.z;
  float size  = a_data.w;

  vec2 pos      = vec2(cos(angle), sin(angle) * 0.55) * r;
  vec2 center   = u_res * 0.5;
  vec2 worldPos = center + pos;

  if (u_mouseActive > 0.5) {
    vec2  d    = u_mouse - worldPos;
    float dist = length(d);
    if (dist < 230.0 && dist > 0.1) {
      float force = (1.0 - dist / 230.0);
      force = force * force * 32.0;
      vec2 perp = vec2(-d.y, d.x) / dist;
      worldPos += perp * force;
    }
  }

  vec2 clip = (worldPos / u_res) * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);

  float tw = 0.55 + sin(u_time * 2.6 + a_twinkle) * 0.45;
  v_alpha  = tw;
  v_color  = a_color;
  gl_PointSize = size * u_dpr;
}
`

const FRAG = `
precision mediump float;
varying vec3  v_color;
varying float v_alpha;

void main() {
  vec2  c   = gl_PointCoord - vec2(0.5);
  float d2  = dot(c, c);
  if (d2 > 0.25) discard;
  float a   = exp(-d2 * 14.0) * v_alpha;
  gl_FragColor = vec4(v_color, 1.0) * a;
}
`

const CORE_VERT = `
attribute vec2 a_pos;
varying   vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const CORE_FRAG = `
precision mediump float;
varying vec2  v_uv;
uniform vec2  u_res;
uniform float u_time;

void main() {
  vec2  p = (v_uv * u_res - u_res * 0.5) / min(u_res.x, u_res.y);
  float r = length(p);
  float a = smoothstep(0.32, 0.0, r);
  float pulse = 0.85 + sin(u_time * 1.2) * 0.15;
  vec3 warm = vec3(1.0, 0.78, 0.55);
  vec3 cool = vec3(0.55, 0.30, 0.85);
  vec3 col  = mix(cool, warm, smoothstep(0.32, 0.0, r));
  gl_FragColor = vec4(col, 1.0) * a * a * 0.55 * pulse;
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error("Shader compile error: " + log)
  }
  return sh
}

function link(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = gl.createProgram()!
  gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p)
    gl.deleteProgram(p)
    throw new Error("Program link error: " + log)
  }
  return p
}

const STAR_PALETTE: [number, number, number][] = [
  [1.00, 1.00, 1.00],
  [0.78, 0.86, 1.00],
  [0.65, 0.75, 1.00],
  [1.00, 0.82, 0.92],
  [0.82, 0.70, 1.00],
  [1.00, 0.94, 0.78],
  [1.00, 0.70, 0.78],
]

export function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const wrap = canvas.parentElement
    if (!wrap) return

    const gl = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true })
              || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null
    if (!gl) return

    let starProg: WebGLProgram, coreProg: WebGLProgram
    try {
      starProg = link(gl, compile(gl, gl.VERTEX_SHADER, VERT),      compile(gl, gl.FRAGMENT_SHADER, FRAG))
      coreProg = link(gl, compile(gl, gl.VERTEX_SHADER, CORE_VERT), compile(gl, gl.FRAGMENT_SHADER, CORE_FRAG))
    } catch (e) {
      console.error(e)
      return
    }

    const a_data    = gl.getAttribLocation(starProg, "a_data")
    const a_color   = gl.getAttribLocation(starProg, "a_color")
    const a_twinkle = gl.getAttribLocation(starProg, "a_twinkle")
    const u_time         = gl.getUniformLocation(starProg, "u_time")
    const u_res          = gl.getUniformLocation(starProg, "u_res")
    const u_mouse        = gl.getUniformLocation(starProg, "u_mouse")
    const u_mouseActive  = gl.getUniformLocation(starProg, "u_mouseActive")
    const u_dpr          = gl.getUniformLocation(starProg, "u_dpr")

    const a_pos    = gl.getAttribLocation(coreProg, "a_pos")
    const cu_res   = gl.getUniformLocation(coreProg, "u_res")
    const cu_time  = gl.getUniformLocation(coreProg, "u_time")

    const dataBuf    = gl.createBuffer()!
    const colorBuf   = gl.createBuffer()!
    const twinkleBuf = gl.createBuffer()!
    const quadBuf    = gl.createBuffer()!

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0
    let numStars = 0

    const initStars = () => {
      const total = Math.min(1500, Math.max(500, Math.floor((w * h) / 900)))
      numStars = total
      const data    = new Float32Array(total * 4)
      const colors  = new Float32Array(total * 3)
      const twinkle = new Float32Array(total)

      const maxR    = Math.hypot(w, h) * 0.55
      const armCount = 3
      const tightness = 1.7

      for (let i = 0; i < total; i++) {
        const t   = Math.random()
        const r   = Math.pow(t, 1.7) * maxR
        const arm = Math.floor(Math.random() * armCount)
        const baseAngle = (arm / armCount) * Math.PI * 2
        const spiral    = (r / maxR) * Math.PI * tightness
        const noise     = (Math.random() - 0.5) * 0.55
        const angle     = baseAngle + spiral + noise

        const speed = 0.00009 + (1 - r / maxR) * 0.00045
        const size  = (0.6 + Math.pow(Math.random(), 2.4) * 5.2) * (1 + (1 - r / maxR) * 0.6)

        data[i * 4 + 0] = r
        data[i * 4 + 1] = angle
        data[i * 4 + 2] = speed * 1000
        data[i * 4 + 3] = size

        const col = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)]
        colors[i * 3 + 0] = col[0]
        colors[i * 3 + 1] = col[1]
        colors[i * 3 + 2] = col[2]

        twinkle[i] = Math.random() * Math.PI * 2
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, dataBuf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, twinkleBuf)
      gl.bufferData(gl.ARRAY_BUFFER, twinkle, gl.STATIC_DRAW)
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = wrap.offsetWidth
      h = wrap.offsetHeight
      canvas.width  = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width  = w + "px"
      canvas.style.height = h + "px"
      gl.viewport(0, 0, canvas.width, canvas.height)
      initStars()
    }
    resize()
    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    const mouseTarget = { x: -9999, y: -9999, active: false }
    const mouse       = { x: -9999, y: -9999 }
    const onMove = (e: MouseEvent) => {
      const rc = wrap.getBoundingClientRect()
      mouseTarget.x = e.clientX - rc.left
      mouseTarget.y = e.clientY - rc.top
      if (!mouseTarget.active) {
        mouse.x = mouseTarget.x; mouse.y = mouseTarget.y
      }
      mouseTarget.active = true
    }
    const onLeave = () => { mouseTarget.active = false }
    wrap.addEventListener("mousemove", onMove)
    wrap.addEventListener("mouseleave", onLeave)

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)

    const start = performance.now()
    let raf = 0

    const frame = () => {
      const time = (performance.now() - start) / 1000

      mouse.x += (mouseTarget.x - mouse.x) * 0.18
      mouse.y += (mouseTarget.y - mouse.y) * 0.18

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // ── Galactic core glow ──
      gl.useProgram(coreProg)
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
      gl.enableVertexAttribArray(a_pos)
      gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(cu_res, w, h)
      gl.uniform1f(cu_time, time)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // ── Stars ──
      gl.useProgram(starProg)
      gl.uniform1f(u_time,        time)
      gl.uniform2f(u_res,         w, h)
      gl.uniform2f(u_mouse,       mouse.x, mouse.y)
      gl.uniform1f(u_mouseActive, mouseTarget.active ? 1 : 0)
      gl.uniform1f(u_dpr,         dpr)

      gl.bindBuffer(gl.ARRAY_BUFFER, dataBuf)
      gl.enableVertexAttribArray(a_data)
      gl.vertexAttribPointer(a_data, 4, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf)
      gl.enableVertexAttribArray(a_color)
      gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, twinkleBuf)
      gl.enableVertexAttribArray(a_twinkle)
      gl.vertexAttribPointer(a_twinkle, 1, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.POINTS, 0, numStars)

      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      wrap.removeEventListener("mousemove", onMove)
      wrap.removeEventListener("mouseleave", onLeave)
      gl.deleteBuffer(dataBuf)
      gl.deleteBuffer(colorBuf)
      gl.deleteBuffer(twinkleBuf)
      gl.deleteBuffer(quadBuf)
      gl.deleteProgram(starProg)
      gl.deleteProgram(coreProg)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
