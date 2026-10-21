import type { Mask, Sample } from './mask'
import { FLOOR } from './mask'

// A folha de papel de arroz: arrastar move e pressiona; a mancha cresce por capilaridade (r ∝ √t)
// e PARA sozinha quando o brilho embaixo chega ao piso. Teclado e movimento reduzido têm caminhos próprios.

export type SheetFrame = { u: number; v: number; hu: number; hv: number; rot: number; press: number; sample: Sample | null }
type Blot = { cx: number; cy: number; seed: number; ang: number; tau: number; dry: number }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function fibers(w: number, h: number, dpr: number) {
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.fillStyle = '#F6F5F0'; g.fillRect(0, 0, c.width, c.height)
  let s = 7
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const ang = (15 * Math.PI) / 180
  for (let i = 0; i < 900; i++) {
    const x = rnd() * c.width, y = rnd() * c.height, len = (6 + rnd() * 16) * dpr, a = ang + (rnd() - 0.5) * 0.6
    g.strokeStyle = `rgba(31,35,28,${0.035 + rnd() * 0.035})`
    g.lineWidth = 0.6 * dpr
    g.beginPath(); g.moveTo(x, y)
    g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (rnd() - 0.5) * 4 * dpr, y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 4 * dpr, x + Math.cos(a) * len, y + Math.sin(a) * len)
    g.stroke()
  }
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 8; d[i] += n; d[i + 1] += n; d[i + 2] += n }
  g.putImageData(img, 0, 0)
  return c
}

function noise1(t: number, seed: number) { return Math.sin(t * 3 + seed) * 0.6 + Math.sin(t * 7.3 + seed * 1.7) * 0.4 }

export function createSheet(o: {
  stage: HTMLElement; el: HTMLButtonElement; canvas: HTMLCanvasElement; mask: Mask; reduced: boolean
  onFrame: (f: SheetFrame) => void; onStopHere: () => void; onEquilibrium: () => void; onFirstPress: () => void
}) {
  const { stage, el, canvas, mask, reduced } = o
  const dpr = Math.min(devicePixelRatio, 2)
  let W = 1, H = 1, sw = 112, sh = 140, base: HTMLCanvasElement | null = null
  const pos = { x: 0, y: 0 }, target = { x: 0, y: 0 }
  let rot = -3, pressed = false, pressAnim = 0, pressT = 0, sampleT = 0, raf = 0, last = 0
  let lastSample: Sample | null = null, current: Blot | null = null, blots: Blot[] = [], blotsDirty = true
  let firedStop = false, firedEq = false, firstPress = false, dragOff = { x: 0, y: 0 }, keyPressUntil = 0
  let demo: { t: number; from: { x: number; y: number } } | null = null

  const rest = () => {
    const mobile = innerWidth < 960
    return mobile ? { x: W - sw * 0.4, y: sh * 0.62 + 12 } : { x: sw * 0.55, y: H - sh * 0.75 }
  }
  const clampPos = (p: { x: number; y: number }) => ({ x: clamp(p.x, 24, W - 24), y: clamp(p.y, 24, H - 24) })

  function layout() {
    const r = stage.getBoundingClientRect()
    W = r.width; H = r.height
    const mobile = innerWidth < 960
    sw = mobile ? 112 : 150; sh = mobile ? 140 : 188
    canvas.width = Math.round(sw * dpr); canvas.height = Math.round(sh * dpr)
    el.style.width = `${sw}px`; el.style.height = `${sh}px`
    base = fibers(sw, sh, dpr)
    blotsDirty = true
  }

  function drawSheet() {
    const g = canvas.getContext('2d')!
    g.globalCompositeOperation = 'source-over'
    g.clearRect(0, 0, canvas.width, canvas.height)
    if (base) g.drawImage(base, 0, 0)
    for (const b of blots) {
      const R = 0.42 * Math.min(sw, sh) * dpr
      const r = R * Math.sqrt(Math.min(1, b.tau / 1.6))
      if (r < 0.5) continue
      const cx = b.cx * canvas.width, cy = b.cy * canvas.height
      g.beginPath()
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2
        const rr = r * (1 + 0.08 * noise1(th, b.seed)) * (1 + 0.18 * Math.cos(2 * (th - b.ang)))
        const x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr
        i ? g.lineTo(x, y) : g.moveTo(x, y)
      }
      g.closePath()
      // translúcida onde absorveu (deixa ver a amostra) + tom quente sutil
      g.save(); g.clip()
      g.globalCompositeOperation = 'destination-out'
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2)
      gr.addColorStop(0, `rgba(0,0,0,${0.22 - b.dry * 0.06})`); gr.addColorStop(1, 'rgba(0,0,0,0.10)')
      g.fillStyle = gr; g.fillRect(cx - r * 1.4, cy - r * 1.4, r * 2.8, r * 2.8)
      g.globalCompositeOperation = 'source-atop'
      g.fillStyle = 'rgba(239,227,194,0.05)'; g.fillRect(cx - r * 1.4, cy - r * 1.4, r * 2.8, r * 2.8)
      g.restore()
      if (b.dry > 0) { g.strokeStyle = `rgba(138,106,31,${0.28 * b.dry})`; g.lineWidth = 1.2 * dpr; g.stroke() }
    }
    blotsDirty = false
  }

  function newBlot(full = false) {
    if (blots.length >= 8) blots.shift()
    const s = Math.random() * 100
    current = { cx: 0.5 + (Math.random() - 0.5) * 0.16, cy: 0.5 + (Math.random() - 0.5) * 0.16, seed: s, ang: ((15 + (Math.random() - 0.5) * 10) * Math.PI) / 180, tau: full ? 1.6 : 0, dry: full ? 1 : 0 }
    blots.push(current)
  }

  function rect() {
    const hu = sw / 2 / W, hv = sh / 2 / H
    return { u: pos.x / W, v: pos.y / H, hu, hv }
  }

  function apply() {
    el.style.transform = `translate(${pos.x - sw / 2}px, ${pos.y - sh / 2}px) rotate(${rot}deg) scale(${1 - 0.015 * pressAnim})`
    el.style.setProperty('--press', pressAnim.toFixed(3))
  }

  function frame(now: number) {
    const raw = Math.min(0.25, (now - last) / 1000 || 0.016), dt = Math.min(0.05, raw); last = now
    let active = false
    if (demo) {
      demo.t += dt
      const t = demo.t
      if (t < 0.9) { target.x = demo.from.x - 64 * (t / 0.9); target.y = demo.from.y - 20 * (t / 0.9) }
      else if (t < 1.6) { if (!pressed) startPress(true) }
      else if (t < 2.1) { if (pressed) endPress(); const r0 = rest(); target.x = r0.x; target.y = r0.y }
      else demo = null
      active = true
    }
    if (keyPressUntil && now > keyPressUntil) { keyPressUntil = 0; endPress() }
    const k = reduced ? 1 : 0.18
    const vx = (target.x - pos.x) * k
    pos.x += vx; pos.y += (target.y - pos.y) * k
    const rotT = pressed ? clamp(vx * 0.04 * 10, -4, 4) : -3
    rot = reduced ? rotT : lerp(rot, rotT, 0.12)
    pressAnim = reduced ? (pressed ? 1 : 0) : lerp(pressAnim, pressed ? 1 : 0, pressed ? 0.25 : 0.06)
    if (Math.abs(target.x - pos.x) > 0.3 || Math.abs(target.y - pos.y) > 0.3 || Math.abs(pressAnim - (pressed ? 1 : 0)) > 0.01) active = true

    const r = rect()
    if (pressed) {
      active = true
      pressT += raw   // tempo real: em aparelho lento o equilíbrio não demora mais
      mask.stamp(r.u, r.v, r.hu * 1.1, r.hv * 1.1, Math.min(0.035 * dt * 60, 0.06))
      sampleT += dt
      if (sampleT > 0.25 || !lastSample) { sampleT = 0; lastSample = mask.sample({ u0: r.u - r.hu, v0: r.v - r.hv, u1: r.u + r.hu, v1: r.v + r.hv }) }
      // crescimento por capilaridade: só avança enquanto há brilho acima do piso
      const gRate = clamp((lastSample.oilUnder - FLOOR) / (1 - FLOOR), 0, 1)
      if (current) { current.tau += dt * gRate; blotsDirty = true }
      if (!firedStop && lastSample.oilUnder <= 0.42) { firedStop = true; o.onStopHere() }
      if (!firedEq && (lastSample.treated >= 0.4 || pressT >= 7)) { firedEq = true; o.onEquilibrium() }
    }
    for (const b of blots) if (b !== current || !pressed) if (b.tau > 0 && b.dry < 1) { b.dry = Math.min(1, b.dry + dt / 0.8); blotsDirty = true; active = true }
    if (blotsDirty) drawSheet()
    apply()
    o.onFrame({ ...r, rot: (rot * Math.PI) / 180, press: pressAnim, sample: lastSample })
    raf = active ? requestAnimationFrame(frame) : 0
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }

  // a demonstração automática pressiona de verdade, mas não conta como primeira interação
  function startPress(auto = false) {
    pressed = true; el.classList.add('pressed'); newBlot()
    if (!auto && !firstPress) { firstPress = true; o.onFirstPress() }
    kick()
  }
  function endPress() {
    pressed = false; el.classList.remove('pressed')
    const r = rect()
    lastSample = mask.sample({ u0: r.u - r.hu, v0: r.v - r.hv, u1: r.u + r.hu, v1: r.v + r.hv })
    kick()
  }

  if (!reduced) {
    el.addEventListener('pointerdown', (e) => {
      demo = null
      el.setPointerCapture(e.pointerId)
      const sr = stage.getBoundingClientRect()
      dragOff = { x: e.clientX - sr.left - pos.x, y: e.clientY - sr.top - pos.y }
      startPress()
    })
    el.addEventListener('pointermove', (e) => {
      if (!pressed || keyPressUntil) return
      const sr = stage.getBoundingClientRect()
      Object.assign(target, clampPos({ x: e.clientX - sr.left - dragOff.x, y: e.clientY - sr.top - dragOff.y }))
      kick()
    })
    for (const ev of ['pointerup', 'pointercancel']) el.addEventListener(ev, () => { if (pressed && !keyPressUntil) endPress() })
  }
  el.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 48 : 16
    const mv: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (mv[e.key]) { e.preventDefault(); Object.assign(target, clampPos({ x: target.x + mv[e.key][0], y: target.y + mv[e.key][1] })); kick() }
    else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); if (reduced) pressAt(); else { startPress(); keyPressUntil = performance.now() + 600 } }
    else if (e.key === 'Escape') { Object.assign(target, rest()); kick() }
  })

  // Movimento reduzido: cada clique leva a folha a uma de três posições e aplica um carimbo completo.
  const SPOTS = [[0.3, 0.4], [0.62, 0.55], [0.45, 0.75]]
  let spot = 0
  function pressAt() {
    const [u, v] = SPOTS[spot % 3]; spot++
    target.x = pos.x = u * W; target.y = pos.y = v * H
    const r = rect()
    mask.stamp(r.u, r.v, r.hu * 1.1, r.hv * 1.1, 1)
    newBlot(true)
    if (!firstPress) { firstPress = true; o.onFirstPress() }
    lastSample = mask.sample({ u0: r.u - r.hu, v0: r.v - r.hv, u1: r.u + r.hu, v1: r.v + r.hv })
    if (!firedStop) { firedStop = true; o.onStopHere() }
    if (spot >= 3 && !firedEq) { firedEq = true; o.onEquilibrium() }
    blotsDirty = true; kick()
  }

  new ResizeObserver(() => { layout(); Object.assign(target, clampPos(target)); Object.assign(pos, clampPos(pos)); kick() }).observe(stage)
  layout()
  Object.assign(pos, rest()); Object.assign(target, pos)
  kick()

  return {
    pressAt,
    reset() { mask.paint(); blots = []; current = null; pressT = 0; lastSample = null; firedStop = false; Object.assign(target, rest()); blotsDirty = true; kick() },
    demo() { if (reduced || firstPress) return; demo = { t: 0, from: { ...pos } }; kick() },
    cancelDemo() { demo = null },
    get interacted() { return firstPress },
    frame: () => kick(),
    blotsCanvas: canvas
  }
}
