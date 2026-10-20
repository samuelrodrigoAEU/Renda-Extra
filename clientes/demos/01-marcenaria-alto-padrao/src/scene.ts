import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Finish } from './config'

// Móvel modelado proceduralmente: aparador com gaveteiro, portas, tampo em pedra e prateleiras.
// Nenhum asset externo — tudo é geometria e texturas geradas em canvas.

type Key = { cam: THREE.Vector3; look: THREE.Vector3; doors: number; drawer: number; spin: number }

const KEYS: Key[] = [
  { cam: new THREE.Vector3(2.6, 1.55, 3.6), look: new THREE.Vector3(0.05, 0.72, 0), doors: 0, drawer: 0, spin: 0 },
  { cam: new THREE.Vector3(0.6, 1.35, 3.5), look: new THREE.Vector3(-0.05, 0.5, 0), doors: 1, drawer: 0, spin: 0 },
  { cam: new THREE.Vector3(-1.9, 1.75, 2.5), look: new THREE.Vector3(-0.45, 0.55, 0.15), doors: 0.1, drawer: 1, spin: 0 },
  { cam: new THREE.Vector3(1.9, 1.35, 3.9), look: new THREE.Vector3(0, 0.8, 0), doors: 0, drawer: 0, spin: 1 }
]

const W = 2.4, H = 0.78, D = 0.52, PLINTH = 0.08, T = 0.018, GAP = 0.004

function smooth(t: number) { return t * t * (3 - 2 * t) }

function woodTexture(base: string, grain: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const g = c.getContext('2d')!
  g.fillStyle = base
  g.fillRect(0, 0, 1024, 1024)
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  // veios verticais ondulados
  // faixas largas de tom, como numa lâmina natural
  for (let x = 0; x < 1024; x += 8 + rnd() * 40) {
    g.globalAlpha = 0.04 + rnd() * 0.1
    g.fillStyle = rnd() > 0.5 ? grain : '#ffffff'
    g.fillRect(x, 0, 6 + rnd() * 30, 1024)
  }
  for (let i = 0; i < 420; i++) {
    const x0 = rnd() * 1024
    const amp = 1.5 + rnd() * 6
    const freq = 0.0015 + rnd() * 0.003
    g.strokeStyle = grain
    g.globalAlpha = 0.08 + rnd() * 0.3
    g.lineWidth = 0.5 + rnd() * 2
    g.beginPath()
    for (let y = 0; y <= 1024; y += 16) {
      const x = x0 + Math.sin(y * freq + i) * amp + Math.sin(y * 0.03 + i * 3) * 1.2
      y === 0 ? g.moveTo(x, y) : g.lineTo(x, y)
    }
    g.stroke()
  }
  // poros finos
  g.globalAlpha = 0.06
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = rnd() > 0.5 ? grain : '#ffffff'
    g.fillRect(rnd() * 1024, rnd() * 1024, 1, 2 + rnd() * 6)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

function stoneTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const g = c.getContext('2d')!
  g.fillStyle = '#d9d0c3'
  g.fillRect(0, 0, 1024, 1024)
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = i % 3 ? '#b8aa97' : '#9a8a76'
    g.globalAlpha = 0.35 + rnd() * 0.45
    g.lineWidth = 0.5 + rnd() * 1.8
    g.beginPath()
    let x = rnd() * 1024, y = rnd() * 1024
    g.moveTo(x, y)
    for (let s = 0; s < 14; s++) { x += (rnd() - 0.3) * 120; y += (rnd() - 0.5) * 60; g.lineTo(x, y) }
    g.stroke()
  }
  g.globalAlpha = 0.08
  for (let i = 0; i < 14000; i++) { g.fillStyle = rnd() > 0.5 ? '#a99a86' : '#fff'; g.fillRect(rnd() * 1024, rnd() * 1024, 1.5, 1.5) }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const paper = new THREE.Color('#ece6dc')
  const scene = new THREE.Scene()
  scene.background = paper
  scene.fog = new THREE.Fog(paper, 7, 14)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40)

  // Luz principal quente vinda da "janela", com sombra suave
  const sun = new THREE.DirectionalLight('#fff0dc', 2.6)
  sun.position.set(-3.2, 4.8, 3.6)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -3; sun.shadow.camera.right = 3
  sun.shadow.camera.top = 3; sun.shadow.camera.bottom = -1
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.02
  sun.shadow.radius = 6
  scene.add(sun)
  scene.add(new THREE.HemisphereLight('#fffaf2', '#b9a891', 0.5))

  // Ambiente: piso e parede na cor do papel para o móvel "flutuar" na página
  const roomMat = new THREE.MeshStandardMaterial({ color: '#e9e2d7', roughness: 0.95 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), roomMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), roomMat)
  wall.position.set(0, 6, -D / 2 - 0.01)
  wall.receiveShadow = true
  scene.add(wall)

  // Materiais
  const front = new THREE.MeshPhysicalMaterial({ roughness: 0.6, clearcoat: 0, clearcoatRoughness: 0.35 })
  const carcass = new THREE.MeshStandardMaterial({ color: '#efe8dc', roughness: 0.7 })
  const inner = new THREE.MeshStandardMaterial({ color: '#d8cfc1', roughness: 0.8 })
  const bronze = new THREE.MeshStandardMaterial({ color: '#9a6b43', metalness: 1, roughness: 0.32 })
  const stone = new THREE.MeshPhysicalMaterial({ map: stoneTexture(), roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.25 })
  const ceramic = new THREE.MeshPhysicalMaterial({ color: '#2f2b26', roughness: 0.45, clearcoat: 0.6 })
  const ceramicLight = new THREE.MeshPhysicalMaterial({ color: '#cbb8a0', roughness: 0.75 })
  const led = new THREE.MeshBasicMaterial({ color: '#ffd9a6' })
  const shadowy = <T extends THREE.Mesh>(m: T) => { m.castShadow = true; m.receiveShadow = true; return m }

  const furniture = new THREE.Group()
  scene.add(furniture)

  const box = (w: number, h: number, d: number, mat: THREE.Material, r = 0.003) =>
    shadowy(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat))

  // Caixaria (visível ao abrir)
  const z0 = -D / 2
  const carcassParts: [number, number, number, number, number, number][] = [
    [T, H, D - T, -W / 2 + T / 2, PLINTH + H / 2, 0],
    [T, H, D - T, W / 2 - T / 2, PLINTH + H / 2, 0],
    [T, H, D - T, -W / 6, PLINTH + H / 2, 0],
    [W, T, D - T, 0, PLINTH + T / 2, 0],
    [(W * 2) / 3 - 1.5 * T, T, D - T - 0.02, W / 6, PLINTH + H / 2, -0.01]
  ]
  for (const [w, h, d, x, y, z] of carcassParts) {
    const m = box(w, h, d, carcass, 0.002)
    m.position.set(x, y, z - T / 2)
    furniture.add(m)
  }
  const back = box(W, H, 0.008, inner, 0.001)
  back.position.set(0, PLINTH + H / 2, z0 + 0.004)
  furniture.add(back)
  const plinth = box(W - 0.06, PLINTH, D - 0.06, new THREE.MeshStandardMaterial({ color: '#2a2724', roughness: 0.8 }))
  plinth.position.set(0, PLINTH / 2, -0.03)
  furniture.add(plinth)

  // Objetos dentro do armário (aparecem quando as portas abrem)
  for (let i = 0; i < 4; i++) {
    const b = box(0.26, 0.08, 0.32, i % 2 ? ceramicLight : carcass, 0.01)
    b.position.set(W / 6 + 0.25 + (i % 2) * 0.32 - 0.3, PLINTH + H / 2 + 0.05 + Math.floor(i / 2) * 0.09, -0.02)
    furniture.add(b)
  }
  const bowl = shadowy(new THREE.Mesh(new THREE.SphereGeometry(0.11, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), ceramic))
  bowl.rotation.x = Math.PI
  bowl.position.set(W / 2 - 0.35, PLINTH + T + 0.11, 0)
  furniture.add(bowl)

  // Tampo de pedra
  const top = box(W + 0.04, 0.03, D + 0.04, stone, 0.006)
  top.position.set(0, PLINTH + H + 0.015, 0.005)
  furniture.add(top)

  // Gaveteiro (3 gavetas) à esquerda
  const fw = W / 3 - GAP * 2
  const frontZ = D / 2 - T / 2 + 0.001
  const drawers: THREE.Group[] = []
  const dh = (H - GAP * 4) / 3
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group()
    const f = box(fw, dh, T, front)
    g.add(f)
    const sideL = box(0.012, dh * 0.7, D - 0.08, inner, 0.001)
    sideL.position.set(-fw / 2 + 0.03, -0.02, -(D - 0.08) / 2)
    const sideR = sideL.clone(); sideR.position.x = fw / 2 - 0.03
    const bottom = box(fw - 0.06, 0.01, D - 0.08, inner, 0.001)
    bottom.position.set(0, -dh * 0.35 - 0.02, -(D - 0.08) / 2)
    const pull = box(fw * 0.38, 0.01, 0.014, bronze, 0.004)
    pull.position.set(0, dh / 2 - 0.022, T / 2 + 0.007)
    g.add(sideL, sideR, bottom, pull)
    g.position.set(-W / 3, PLINTH + GAP + dh / 2 + (2 - i) * (dh + GAP), frontZ)
    g.userData.baseZ = frontZ
    furniture.add(g)
    drawers.push(g)
  }

  // Portas com dobradiça lateral
  const doors: { pivot: THREE.Group; dir: number }[] = []
  const doorW = W / 3 - GAP * 2
  for (const [hingeX, dir] of [[-W / 6 + GAP, -1], [W / 2 - GAP, 1]] as const) {
    const pivot = new THREE.Group()
    pivot.position.set(hingeX, PLINTH + H / 2, D / 2 + 0.001)
    const d = box(doorW, H - GAP * 2, T, front)
    d.position.set(dir === -1 ? doorW / 2 : -doorW / 2, 0, -T / 2)
    const pull = box(0.012, H * 0.3, 0.014, bronze, 0.004)
    pull.position.set(dir === -1 ? doorW - 0.03 : -doorW + 0.03, H * 0.25, 0.007)
    pivot.add(d, pull)
    furniture.add(pivot)
    doors.push({ pivot, dir })
  }

  // Prateleiras suspensas com fita de LED
  for (const [x, y, w] of [[-0.55, 1.62, 1.1], [0.55, 2.05, 1.1]] as const) {
    const s = box(w, 0.035, 0.24, front, 0.004)
    s.position.set(x, y, z0 + 0.12)
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.004, 0.01), led)
    strip.position.set(x, y - 0.02, z0 + 0.2)
    furniture.add(s, strip)
  }
  const vasePts = [0, 0.09, 0.115, 0.12, 0.1, 0.06, 0.045, 0.05].map((r, i) => new THREE.Vector2(r, i * 0.045))
  const vase = shadowy(new THREE.Mesh(new THREE.LatheGeometry(vasePts, 64), ceramicLight))
  vase.position.set(-0.85, 1.64, z0 + 0.12)
  const books = [0.03, 0.026, 0.034].map((t, i) => {
    const b = box(t, 0.2 + i * 0.015, 0.16, i === 1 ? ceramic : carcass, 0.002)
    b.position.set(-0.3 + i * 0.036, 1.64 + (0.2 + i * 0.015) / 2, z0 + 0.12)
    return b
  })
  const sphere = shadowy(new THREE.Mesh(new THREE.SphereGeometry(0.06, 48, 32), bronze))
  sphere.position.set(0.8, 2.07 + 0.06, z0 + 0.12)
  const lamp = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.32, 48), ceramic))
  lamp.position.set(0.85, PLINTH + H + 0.03 + 0.16, -0.05)
  furniture.add(vase, ...books, sphere, lamp)

  // Acabamentos
  const texCache = new Map<string, THREE.Texture>()
  function setFinish(f: Finish) {
    front.map = null
    if (f.grain) {
      let t = texCache.get(f.id)
      if (!t) { t = woodTexture(f.base, f.grain); texCache.set(f.id, t) }
      front.map = t
      front.color.set('#ffffff')
    } else {
      front.color.set(f.base)
    }
    front.roughness = f.rough
    front.clearcoat = f.gloss
    front.needsUpdate = true
    pulse = 1
    dirty = true
  }

  // Estado animado
  let target = 0
  let progress = 0
  let pulse = 0
  let dirty = true
  const pointer = new THREE.Vector2()
  const pointerS = new THREE.Vector2()
  const cam = new THREE.Vector3()
  const look = new THREE.Vector3()
  let vw = 1, vh = 1
  let dist = 1

  function resize() {
    const r = canvas.getBoundingClientRect()
    vw = Math.max(1, r.width); vh = Math.max(1, r.height)
    renderer.setSize(vw, vh, false)
    camera.aspect = vw / vh
    const mobile = vw < 720
    camera.fov = mobile ? 40 : 32
    // afasta a câmera em telas estreitas para o móvel caber inteiro
    dist = mobile ? 1.95 : vw / vh < 1.45 ? 1.45 : 1.22
    // Desloca o enquadramento para abrir espaço ao texto (direita no desktop, topo no celular)
    if (mobile) camera.setViewOffset(vw, vh, 0, vh * 0.16, vw, vh)
    else camera.setViewOffset(vw, vh, -vw * 0.17, 0, vw, vh)
    camera.updateProjectionMatrix()
    dirty = true
  }

  function apply(p: number) {
    const i = Math.min(KEYS.length - 2, Math.floor(p))
    const t = smooth(Math.min(1, Math.max(0, p - i)))
    const a = KEYS[i], b = KEYS[i + 1]
    cam.lerpVectors(a.cam, b.cam, t)
    look.lerpVectors(a.look, b.look, t)
    const doorOpen = THREE.MathUtils.lerp(a.doors, b.doors, t)
    const drawerOut = THREE.MathUtils.lerp(a.drawer, b.drawer, t)
    for (const d of doors) d.pivot.rotation.y = d.dir * doorOpen * 1.75
    drawers.forEach((g, i) => { g.position.z = g.userData.baseZ + drawerOut * (i === 0 ? 0.42 : i === 1 ? 0.16 : 0) })
    const spin = THREE.MathUtils.lerp(a.spin, b.spin, t)
    furniture.rotation.y = pointerS.x * 0.08 + spin * -0.12
    camera.position.copy(look).addScaledVector(cam.sub(look), dist)
    camera.position.x += pointerS.x * 0.25
    camera.position.y += pointerS.y * 0.12
    camera.lookAt(look)
  }

  let raf = 0
  let running = false
  const clock = new THREE.Clock()
  // Qualidade adaptativa: se o aparelho não sustentar ~30 fps, reduz a resolução e as sombras
  let slowFrames = 0
  let degraded = false
  function frame() {
    raf = requestAnimationFrame(frame)
    const raw = clock.getDelta()
    const dt = Math.min(raw, 0.12)
    const settled = Math.abs(target - progress) < 1e-4 && pointerS.distanceToSquared(pointer) < 1e-6 && pulse === 0
    if (settled && !dirty) return // nada mudou: não redesenha, economiza bateria
    dirty = false
    if (!degraded && raw > 0.045 && ++slowFrames > 20) {
      degraded = true
      renderer.setPixelRatio(1)
      sun.shadow.mapSize.set(1024, 1024)
      sun.shadow.map?.dispose()
      sun.shadow.map = null
      resize()
    }
    const k = opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 4.5)
    progress += (target - progress) * k
    pointerS.lerp(pointer, opts.reducedMotion ? 0 : 1 - Math.exp(-dt * 3))
    if (pulse > 0) { pulse = Math.max(0, pulse - dt * 1.6); renderer.toneMappingExposure = 1.05 + Math.sin(pulse * Math.PI) * 0.06 }
    apply(progress)
    renderer.render(scene, camera)
  }

  function start() { if (!running) { running = true; clock.getDelta(); frame() } }
  function stop() { running = false; cancelAnimationFrame(raf) }

  window.addEventListener('resize', resize)
  if (!opts.reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }, { passive: true })
  }
  resize()
  apply(0)

  return {
    setProgress(p: number) { target = Math.max(0, Math.min(KEYS.length - 1, p)) },
    setFinish,
    start,
    stop,
    renderOnce() { renderer.render(scene, camera) }
  }
}
