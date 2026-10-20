import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Reformer de pilates modelado em código. O carrinho obedece a uma física de mola amortecida:
// a = (F − k·x − c·v) / m. Molas mais fortes (k maior) deixam o carrinho andar menos com a mesma força.

const TRAVEL = 0.62 // curso máximo do carrinho (m)
const HELIX_TURNS = 34

function helix(radius: number, wire: number) {
  // Mola com comprimento unitário no eixo X (esticada por scale.x)
  const pts: THREE.Vector3[] = []
  const N = HELIX_TURNS * 24
  for (let i = 0; i <= N; i++) {
    const a = (i / 24) * Math.PI * 2
    pts.push(new THREE.Vector3(i / N, Math.cos(a) * radius, Math.sin(a) * radius))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N * 2, wire, 6, false)
}

function grainTexture() {
  // Freijó claro, veio reto: faixas de tom e linhas finas (gerado em canvas, sem asset externo)
  const c = document.createElement('canvas')
  c.width = 2048; c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#c99b6b'; g.fillRect(0, 0, 2048, 256)
  let seed = 9
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let y = 0; y < 256; y += 2 + rnd() * 10) { g.globalAlpha = 0.06 + rnd() * 0.12; g.fillStyle = rnd() > 0.5 ? '#8f633d' : '#e2bd8f'; g.fillRect(0, y, 2048, 1 + rnd() * 6) }
  for (let i = 0; i < 260; i++) {
    const y0 = rnd() * 256, amp = 0.5 + rnd() * 2.5
    g.globalAlpha = 0.08 + rnd() * 0.22; g.strokeStyle = '#7d5533'; g.lineWidth = 0.4 + rnd() * 1.4
    g.beginPath()
    for (let x = 0; x <= 2048; x += 32) { const y = y0 + Math.sin(x * 0.004 + i) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y) }
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function createScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pm = new THREE.PMREMGenerator(renderer)
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.7
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 30)

  // Luz de janela: baixa, quente, lateral, com sombra longa e macia
  const sun = new THREE.DirectionalLight('#fff3e2', 3.2)
  sun.position.set(-2.6, 3.2, 2.2)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -2.2, right: 2.2, top: 2, bottom: -2 })
  sun.shadow.radius = 7
  sun.shadow.bias = -0.0003
  sun.shadow.normalBias = 0.015
  scene.add(sun, new THREE.HemisphereLight('#f4f8ff', '#d9d2c4', 0.55))
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.2 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const wood = new THREE.MeshPhysicalMaterial({ map: grainTexture(), roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35 })
  const alu = new THREE.MeshStandardMaterial({ color: '#cfd3d6', metalness: 1, roughness: 0.28 })
  const pad = new THREE.MeshPhysicalMaterial({ color: '#efe9e1', roughness: 0.82, sheen: 1, sheenColor: '#ffffff', sheenRoughness: 0.6 })
  const padDark = new THREE.MeshPhysicalMaterial({ color: '#1d2621', roughness: 0.75, sheen: 0.6, sheenColor: '#6b7a70' })
  const rubber = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.9 })
  const cast = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true } }); return o }
  const rbox = (w: number, h: number, d: number, mat: THREE.Material, r = 0.012) => cast(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat))

  const reformer = new THREE.Group()
  scene.add(reformer)
  const L = 2.3, Wd = 0.66, H = 0.3
  // Estrutura: laterais em madeira com trilhos de alumínio
  for (const z of [-Wd / 2, Wd / 2]) {
    const side = rbox(L, 0.11, 0.07, wood, 0.02)
    side.position.set(0, H, z)
    const rail = rbox(L - 0.1, 0.012, 0.05, alu, 0.004)
    rail.position.set(0, H + 0.061, z * 0.86)
    reformer.add(side, rail)
    for (const x of [-L / 2 + 0.12, L / 2 - 0.12]) {
      const leg = rbox(0.09, H - 0.055, 0.07, wood, 0.015)
      leg.position.set(x, (H - 0.055) / 2, z)
      const foot = rbox(0.1, 0.018, 0.08, rubber, 0.006)
      foot.position.set(x, 0.009, z)
      reformer.add(leg, foot)
    }
  }
  for (const x of [-L / 2 + 0.035, L / 2 - 0.035]) {
    const end = rbox(0.07, 0.11, Wd + 0.07, wood, 0.02)
    end.position.set(x, H, 0)
    reformer.add(end)
  }
  // Barra de pés (footbar): tubo em U inclinado na extremidade das molas
  const fb = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -Wd / 2 + 0.02), new THREE.Vector3(0.0, 0.32, -Wd / 2 + 0.02), new THREE.Vector3(-0.05, 0.38, -Wd / 4),
    new THREE.Vector3(-0.05, 0.38, Wd / 4), new THREE.Vector3(0.0, 0.32, Wd / 2 - 0.02), new THREE.Vector3(0, 0, Wd / 2 - 0.02)
  ], false, 'catmullrom', 0.2)
  const footbar = cast(new THREE.Mesh(new THREE.TubeGeometry(fb, 80, 0.018, 12, false), alu))
  footbar.position.set(L / 2 - 0.42, H, 0)
  const fbPad = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, Wd / 2 + 0.05, 32), padDark))
  fbPad.rotation.x = Math.PI / 2
  fbPad.position.set(L / 2 - 0.47, H + 0.38, 0)
  reformer.add(footbar, fbPad)

  // Carrinho estofado com apoio de cabeça e ombreiras
  const carriage = new THREE.Group()
  const base = rbox(0.78, 0.05, Wd - 0.06, wood, 0.012)
  const top = rbox(0.76, 0.06, Wd - 0.1, pad, 0.028)
  top.position.y = 0.055
  const head = rbox(0.2, 0.05, 0.3, pad, 0.024)
  head.position.set(-0.45, 0.075, 0)
  head.rotation.z = -0.12
  carriage.add(base, top, head)
  for (const z of [-0.12, 0.12]) {
    const sh = rbox(0.07, 0.14, 0.08, padDark, 0.03)
    sh.position.set(-0.2, 0.15, z)
    carriage.add(sh)
  }
  const HOME = -0.42
  carriage.position.set(HOME, H + 0.09, 0)
  reformer.add(carriage)

  // Barra das molas (fixa) e 4 molas coloridas
  const springBarX = L / 2 - 0.2
  const bar = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, Wd - 0.08, 16), alu))
  bar.rotation.x = Math.PI / 2
  bar.position.set(springBarX, H + 0.04, 0)
  reformer.add(bar)
  const helixGeo = helix(0.019, 0.0042)
  const springMeshes: { mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; z: number }[] = []
  const zs = [-0.15, -0.05, 0.05, 0.15]
  for (const z of zs) {
    const mat = new THREE.MeshPhysicalMaterial({ color: '#999', metalness: 0.3, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15 })
    const mesh = cast(new THREE.Mesh(helixGeo, mat))
    reformer.add(mesh)
    springMeshes.push({ mesh, mat, z })
  }

  // ---------- Estado ----------
  let k = 6, engaged = 0, active = true
  let x = 0, v = 0, force = 0, dragging = false, auto = !opts.reducedMotion, autoT = 0, idle = 0
  let dragStart = 0, dragW = 1
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2()
  let onMove: ((x: number) => void) | null = null

  function setSprings(c: string[], engagedIndex: number, kVal: number, enabled = true) {
    engaged = engagedIndex; k = kVal; active = enabled
    springMeshes.forEach((s, i) => s.mat.color.set(c[i]))
    if (!enabled) { force = 0 }
  }

  function layoutSprings() {
    const carEnd = carriage.position.x + 0.39 // ponta do carrinho no lado das molas
    springMeshes.forEach((s, i) => {
      const on = active && i === engaged
      const start = on ? carEnd - 0.06 : springBarX - 0.62 // engatada: presa ao carrinho; desengatada: repousa no gancho
      s.mesh.position.set(start, H + 0.04, s.z)
      s.mesh.scale.set(Math.max(0.05, springBarX - start), 1, 1)
      s.mat.emissive.set(on ? s.mat.color : '#000').multiplyScalar(on ? 0.08 : 0)
    })
  }

  // Arraste: a distância horizontal vira força aplicada no carrinho
  canvas.addEventListener('pointerdown', (e) => { dragging = true; auto = false; dragStart = e.clientX; dragW = canvas.clientWidth; canvas.setPointerCapture(e.pointerId) })
  canvas.addEventListener('pointermove', (e) => {
    pointer.set((e.offsetX / canvas.clientWidth) * 2 - 1, -((e.offsetY / canvas.clientHeight) * 2 - 1))
    if (dragging) force = Math.max(0, ((e.clientX - dragStart) / dragW) * 12)
  })
  const release = () => { dragging = false; force = 0 }
  canvas.addEventListener('pointerup', release)
  canvas.addEventListener('pointercancel', release)

  let vw = 1, vh = 1
  function resize() {
    const r = canvas.getBoundingClientRect()
    vw = Math.max(1, r.width); vh = Math.max(1, r.height)
    renderer.setSize(vw, vh, false)
    camera.aspect = vw / vh
    camera.fov = vw / vh < 1 ? 42 : 30
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(canvas)

  function step(dt: number) {
    if (auto && active) {
      // Demonstração: uma repetição lenta (empurra 2,4 s, solta) a cada 4 s
      autoT += dt
      const ph = autoT % 4
      force = ph < 2.4 ? Math.sin((ph / 2.4) * Math.PI) * 4.2 : 0
    } else if (!dragging && !opts.reducedMotion) {
      idle += dt
      if (idle > 6) { auto = true; idle = 0 }
    }
    if (dragging) idle = 0
    const kk = active ? k : 0
    const m = 1, c = 2.1
    // vários subpassos para estabilidade com molas fortes
    for (let i = 0; i < 4; i++) {
      const h = dt / 4
      const a = (force - kk * x - c * v) / m
      v += a * h; x += v * h
      if (x < 0) { x = 0; v = Math.abs(v) * 0.25 } // batente: pequeno quique
      if (x > TRAVEL) { x = TRAVEL; v = 0 }
    }
    if (!active) { x += (0 - x) * Math.min(1, dt * 6); v = 0 }
    carriage.position.x = HOME + x
    onMove?.(x / TRAVEL)
  }

  let raf = 0, running = false
  const clock = new THREE.Clock()
  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    step(dt)
    pointerS.lerp(pointer, 1 - Math.exp(-dt * 3))
    layoutSprings()
    const ang = 0.75 + pointerS.x * 0.12
    const r = vw / vh < 1 ? 4.2 : 2.95
    camera.position.set(Math.sin(ang) * r, 1.45 + pointerS.y * 0.15, Math.cos(ang) * r)
    camera.lookAt(0.05, 0.28, 0)
    renderer.render(scene, camera)
  }

  resize()
  layoutSprings()
  return {
    setSprings,
    resize,
    onMove(cb: (x: number) => void) { onMove = cb },
    push(f: number) { auto = false; idle = 0; force = f * 9 }, // controle alternativo (slider/teclado)
    release,
    start() { if (!running) { running = true; clock.getDelta(); frame() } },
    stop() { running = false; cancelAnimationFrame(raf) },
    still(name: 'hero' | 'springs') {
      x = name === 'hero' ? 0.18 : 0.42
      carriage.position.x = HOME + x
      layoutSprings()
      if (name === 'hero') { camera.fov = 24; camera.position.set(2.35, 0.95, 1.9); camera.lookAt(0.1, 0.3, 0) }
      else { camera.fov = 24; camera.position.set(1.95, 0.75, 0.62); camera.lookAt(0.68, 0.32, 0) }
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
      return canvas.toDataURL('image/png')
    }
  }
}
