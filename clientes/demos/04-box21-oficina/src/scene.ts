import * as THREE from 'three'

// Conjunto de freio de alto desempenho modelado em código: disco ventilado e furado, cubo (chapéu),
// pinça de 3 partes e pastilhas. Vista explodida com âncoras para etiquetas HTML e "teste de frenagem"
// que aquece o disco (emissivo radial) enquanto a rotação desacelera.

const V2 = (x: number, y: number) => new THREE.Vector2(x, y)
const smooth = (t: number) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t) }

function ring(r0: number, r1: number, y0: number, y1: number, seg = 160, phiStart = 0, phiLen = Math.PI * 2) {
  const b = 0.006 // chanfro leve nas arestas
  const p = [V2(r0, y0 + b), V2(r0 + b, y0), V2(r1 - b, y0), V2(r1, y0 + b), V2(r1, y1 - b), V2(r1 - b, y1), V2(r0 + b, y1), V2(r0, y1 - b), V2(r0, y0 + b)]
  return new THREE.LatheGeometry(p, seg, phiStart, phiLen)
}

function studio(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene()
  env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: '#0b0d10', side: THREE.BackSide })))
  const box = (w: number, h: number, pos: [number, number, number], hdr: number, tint = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(hdr), side: THREE.DoubleSide }))
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m)
  }
  box(14, 2.2, [0, 9, 2], 5)            // faixa superior longa (reflexo "de showroom")
  box(1.4, 12, [-9, 0, 4], 6)           // faixa lateral principal
  box(1, 10, [9, 1, -3], 3.5, '#dff3ff') // recorte frio
  box(6, 1, [2, -5, 8], 1.4)            // rebatedor baixo
  box(2, 2, [6, 3, 8], 2.5, '#efffc4')  // toque do acento lima
  const pm = new THREE.PMREMGenerator(renderer)
  const t = pm.fromScene(env, 0.02).texture
  pm.dispose()
  return t
}

function heatTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(256, 256, 120, 256, 256, 256)
  gr.addColorStop(0, '#000'); gr.addColorStop(0.55, '#3a0800'); gr.addColorStop(0.8, '#ff4a00'); gr.addColorStop(0.95, '#ffb347'); gr.addColorStop(1, '#ff6a00')
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function decal(text: string) {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 256
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 1024, 256)
  g.fillStyle = '#0d0f12'
  g.font = '800 150px "Archivo Variable", Arial, sans-serif'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, 512, 136)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export type Anchor = { id: string; x: number; y: number; visible: boolean }

export function createScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const scene = new THREE.Scene()
  scene.environment = studio(renderer)
  scene.environmentIntensity = 1.1
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50)
  const key = new THREE.DirectionalLight('#ffffff', 1.2)
  key.position.set(-3, 4, 5)
  scene.add(key)

  // Materiais
  const heat = heatTexture()
  const iron = new THREE.MeshPhysicalMaterial({ color: '#9aa0a6', metalness: 1, roughness: 0.32, anisotropy: 0.9, emissive: '#ffffff', emissiveMap: heat, emissiveIntensity: 0 })
  const vaneMat = new THREE.MeshStandardMaterial({ color: '#3a3d41', metalness: 0.8, roughness: 0.6 })
  const holeMat = new THREE.MeshStandardMaterial({ color: '#08090a', metalness: 0.2, roughness: 0.9 })
  const hatMat = new THREE.MeshPhysicalMaterial({ color: '#2b2e33', metalness: 0.9, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 })
  const paint = new THREE.MeshPhysicalMaterial({ color: '#b4e62e', metalness: 0.25, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.8 })
  const padMat = new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 0.95 })
  const plateMat = new THREE.MeshStandardMaterial({ color: '#7d8389', metalness: 1, roughness: 0.4 })
  const boltMat = new THREE.MeshStandardMaterial({ color: '#c9ccd0', metalness: 1, roughness: 0.25 })

  const assembly = new THREE.Group()
  scene.add(assembly)
  const rotor = new THREE.Group()  // gira
  const caliper = new THREE.Group() // fixa
  assembly.add(rotor, caliper)

  // Disco: duas pistas com aletas entre elas
  const H = 0.035, GAP = 0.05
  const plateTop = new THREE.Mesh(ring(0.58, 1, GAP, GAP + 2 * H), iron)
  const plateBot = new THREE.Mesh(ring(0.58, 1, -GAP - 2 * H, -GAP), iron)
  rotor.add(plateTop, plateBot)
  const vanes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, GAP * 2, 0.022), vaneMat, 40)
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0)
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2
    q.setFromAxisAngle(up, -a + 0.35)
    m4.compose(new THREE.Vector3(Math.cos(a) * 0.79, 0, Math.sin(a) * 0.79), q, s1)
    vanes.setMatrixAt(i, m4)
  }
  rotor.add(vanes)
  // Furos (cilindros escuros que atravessam as pistas) em 3 anéis desencontrados
  const holes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.021, 0.021, (GAP + 2 * H) * 2 + 0.004, 16), holeMat, 72)
  let h = 0
  for (const [r, n, off] of [[0.68, 24, 0], [0.8, 24, 0.5], [0.92, 24, 0.25]] as const) {
    for (let i = 0; i < n; i++) {
      const a = ((i + off) / n) * Math.PI * 2
      m4.compose(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r), q.identity(), s1)
      holes.setMatrixAt(h++, m4)
    }
  }
  rotor.add(holes)
  // Cubo (chapéu) com 5 furos de roda e furo central
  const hatProfile = [V2(0.6, GAP + 2 * H), V2(0.55, GAP + 2 * H + 0.02), V2(0.47, 0.32), V2(0.44, 0.34), V2(0.13, 0.34), V2(0.12, 0.32), V2(0.12, -0.02)]
  const hat = new THREE.Mesh(new THREE.LatheGeometry(hatProfile.map((p) => p.clone()), 128), hatMat)
  const lugs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 24), holeMat, 5)
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; m4.compose(new THREE.Vector3(Math.cos(a) * 0.29, 0.345, Math.sin(a) * 0.29), q.identity(), s1); lugs.setMatrixAt(i, m4) }
  const hatGroup = new THREE.Group()
  hatGroup.add(hat, lugs)
  rotor.add(hatGroup)

  // Pinça: duas carcaças laterais + ponte externa, num arco de ~68°, com decalque "BOX 21"
  const A0 = Math.PI * 0.93, AL = Math.PI * 0.36
  const outer = new THREE.Mesh(ring(0.7, 1.16, GAP + 2 * H + 0.03, GAP + 2 * H + 0.2, 64, A0, AL), paint)
  const inner = new THREE.Mesh(ring(0.7, 1.16, -GAP - 2 * H - 0.2, -GAP - 2 * H - 0.03, 64, A0, AL), paint)
  const bridge = new THREE.Mesh(ring(1.05, 1.16, -GAP - 2 * H - 0.2, GAP + 2 * H + 0.2, 64, A0, AL), paint)
  // decalque na face externa da pinça (a que fica de frente para a câmera)
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.11), new THREE.MeshPhysicalMaterial({ map: decal('BOX 21'), transparent: true, roughness: 0.3, clearcoat: 1, metalness: 0, depthWrite: false }))
  label.rotation.set(-Math.PI / 2, 0, A0 + AL / 2 + Math.PI) // texto acompanha o arco
  label.position.set(Math.sin(A0 + AL / 2) * 0.93, GAP + 2 * H + 0.202, Math.cos(A0 + AL / 2) * 0.93)
  const caliperBody = new THREE.Group()
  caliperBody.add(outer, inner, bridge, label)
  for (const a of [A0 + 0.12, A0 + AL - 0.12]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), boltMat)
    bolt.position.set(Math.sin(a) * 0.93, GAP + 2 * H + 0.225, Math.cos(a) * 0.93) // convenção do Lathe: x = r·sen φ, z = r·cos φ
    caliperBody.add(bolt)
  }
  // Pastilhas (material de atrito + placa de aço)
  const mkPad = (sign: number) => {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(ring(0.74, 0.99, 0, 0.022, 48, A0 + 0.06, AL - 0.12), padMat))
    const plate = new THREE.Mesh(ring(0.73, 1, 0.022, 0.034, 48, A0 + 0.04, AL - 0.08), plateMat)
    g.add(plate)
    if (sign < 0) g.rotation.x = Math.PI
    g.position.y = sign * (GAP + 2 * H + 0.002)
    return g
  }
  const padOut = mkPad(1), padIn = mkPad(-1)
  caliper.add(caliperBody, padOut, padIn)

  // Orientação de vitrine: disco de frente, inclinado 3/4
  assembly.rotation.set(1.18, 0, -0.5)

  // ---------- Âncoras para etiquetas ----------
  const midA = A0 + AL / 2
  const at = (a: number, r: number, y: number) => new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)
  // âncoras no espaço do conjunto (sem o giro do disco); peças móveis somam o próprio deslocamento
  const anchors: { id: string; p: THREE.Vector3; o?: THREE.Object3D }[] = [
    { id: 'disco', p: at(Math.PI * 1.25, 0.96, GAP + 2 * H) },
    { id: 'pinca', p: at(midA, 1.17, 0.2), o: caliperBody },
    { id: 'pastilhas', p: at(midA - 0.25, 0.9, GAP + 2 * H + 0.03), o: padOut },
    { id: 'cubo', p: new THREE.Vector3(0, 0.345, 0), o: hatGroup }
  ]

  // ---------- Estado ----------
  let explode = 0, explodeT = 0, brake = false, heatV = 0, spin = 0.9, angle = 0
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2()
  if (!opts.reducedMotion) addEventListener('pointermove', (e) => pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)), { passive: true })

  let vw = 1, vh = 1
  function resize() {
    const r = canvas.getBoundingClientRect()
    vw = Math.max(1, r.width); vh = Math.max(1, r.height)
    renderer.setSize(vw, vh, false)
    camera.aspect = vw / vh
    camera.fov = vw / vh < 0.9 ? 40 : 28
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(canvas)

  function pose(e: number) {
    const k = smooth(e)
    const dir = new THREE.Vector3(Math.sin(midA), 0, Math.cos(midA))
    caliperBody.position.copy(dir).multiplyScalar(0.42 * k)
    caliperBody.position.y = 0
    padOut.position.copy(dir).multiplyScalar(0.3 * k); padOut.position.y = (GAP + 2 * H + 0.002) + 0.38 * k
    padIn.position.copy(dir).multiplyScalar(0.3 * k); padIn.position.y = -(GAP + 2 * H + 0.002) - 0.38 * k
    hatGroup.position.y = 0.42 * k
  }

  const v = new THREE.Vector3()
  function project(): Anchor[] {
    assembly.updateWorldMatrix(true, false)
    return anchors.map(({ id, p, o }) => {
      v.copy(p)
      if (o) v.add(o === padOut ? o.position.clone().setY(o.position.y - (GAP + 2 * H + 0.002)) : o.position)
      assembly.localToWorld(v).project(camera)
      return { id, x: (v.x * 0.5 + 0.5) * vw, y: (-v.y * 0.5 + 0.5) * vh, visible: v.z < 1 }
    })
  }

  let onFrame: ((a: Anchor[], explode: number, heat: number) => void) | null = null
  let raf = 0, running = false, slow = 0
  const clock = new THREE.Clock()
  function frame() {
    raf = requestAnimationFrame(frame)
    const raw = clock.getDelta(), dt = Math.min(raw, 0.05)
    if (raw > 0.05 && ++slow > 30 && renderer.getPixelRatio() > 1) renderer.setPixelRatio(1) // qualidade adaptativa
    explode += (explodeT - explode) * (opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 4))
    // Frenagem: aquece e desacelera; soltar esfria devagar e o disco volta a girar
    heatV = brake ? Math.min(1, heatV + dt * 0.55) : Math.max(0, heatV - dt * 0.22)
    spin += ((brake ? 0.05 : 0.9) - spin) * (1 - Math.exp(-dt * (brake ? 2.2 : 0.8)))
    if (!opts.reducedMotion) angle += spin * dt
    rotor.rotation.y = angle
    iron.emissiveIntensity = heatV * heatV * 3.2
    pointerS.lerp(pointer, 1 - Math.exp(-dt * 2.5))
    assembly.rotation.set(1.18 + pointerS.y * 0.12, pointerS.x * 0.25, -0.5 + explode * 0.18)
    pose(explode)
    const z = vw / vh < 0.9 ? 7 : 5.5
    camera.position.set(0, explode * 0.3, z + explode * 1.2)
    camera.lookAt(0, explode * 0.3, 0)
    renderer.render(scene, camera)
    onFrame?.(project(), explode, heatV)
  }
  resize()
  return {
    setExplode(on: boolean) { explodeT = on ? 1 : 0 },
    setBrake(on: boolean) { brake = on },
    onFrame(cb: typeof onFrame) { onFrame = cb },
    resize,
    start() { if (!running) { running = true; clock.getDelta(); frame() } },
    stop() { running = false; cancelAnimationFrame(raf) },
    still(name: 'hero' | 'exploded') {
      explode = explodeT = name === 'exploded' ? 1 : 0
      pose(explode); pointerS.set(0, 0); angle = 0.4; rotor.rotation.y = angle
      assembly.rotation.set(1.18, 0, -0.5 + explode * 0.18)
      camera.position.set(0, explode * 0.3, 5.5 + explode * 1.2); camera.lookAt(0, explode * 0.3, 0)
      renderer.render(scene, camera)
      return canvas.toDataURL('image/png')
    }
  }
}
