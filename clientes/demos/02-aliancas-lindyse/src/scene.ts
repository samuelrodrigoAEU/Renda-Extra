import * as THREE from 'three'

// Alianças modeladas em código: perfil anatômico (comfort fit) revolucionado, pavé de brilhantes
// com transmissão, IOR 2,42 e dispersão, e ambiente de estúdio (softboxes) que o cursor gira.

export type Mode = 'hero' | 'engrave' | 'off'
export type Engrave = { text: string; font: string; metal: string; width: number }

const R_IN = 1 // raio interno ≈ 9 mm na escala da peça
const MM = R_IN / 9
const smooth = (t: number) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t) }

function bandGeometry(widthMM: number, thickMM: number) {
  const w = widthMM * MM, th = thickMM * MM, pts: THREE.Vector2[] = []
  pts.push(new THREE.Vector2(R_IN, -w / 2), new THREE.Vector2(R_IN + th * 0.12, -w / 2))
  for (let i = 0; i <= 40; i++) {
    const t = -1 + (2 * i) / 40
    const dome = Math.sqrt(Math.max(0, 1 - t * t))
    pts.push(new THREE.Vector2(R_IN + th * (0.32 + 0.68 * dome), t * (w / 2) * 0.96))
  }
  pts.push(new THREE.Vector2(R_IN + th * 0.12, w / 2), new THREE.Vector2(R_IN, w / 2))
  return new THREE.LatheGeometry(pts, 256) // normais do próprio Lathe (sem costura)
}

function brilliant() {
  // Lapidação brilhante simplificada: mesa, coroa, cintura e pavilhão em 16 facetas
  const p = [[0, 0.32], [0.54, 0.32], [0.8, 0.23], [1, 0.1], [1, 0.06], [0.6, -0.38], [0, -0.8]].map(([x, y]) => new THREE.Vector2(x, y))
  const g = new THREE.LatheGeometry(p, 24)
  const f = g.toNonIndexed()
  f.computeVertexNormals() // normais por face: facetas nítidas
  return f
}

function studioEnvironment(renderer: THREE.WebGLRenderer) {
  // Estúdio de fotografia de joias: fundo quente médio, softboxes grandes e faixas de recorte
  const env = new THREE.Scene()
  env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: '#3b2622', side: THREE.BackSide })))
  const box = (w: number, h: number, pos: [number, number, number], hdr: number, tint = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(hdr), side: THREE.DoubleSide }))
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  box(16, 7, [0, 10, 0], 2.6)               // softbox superior
  box(2, 14, [-9, 1, 3], 6)                 // faixa principal à esquerda
  box(1.2, 12, [8, 0, -4], 4, '#ffe2c4')    // contra-luz quente
  box(12, 3, [0, -6, 8], 1.1, '#ffd9c0')    // rebatedor frontal baixo
  box(6, 6, [7, 4, 7], 2)                   // preenchimento
  box(30, 5, [0, -9, -6], 0.6, '#c99a7a')   // rebatimento do piso
  const pm = new THREE.PMREMGenerator(renderer)
  const tex = pm.fromScene(env, 0.012).texture
  pm.dispose()
  // Mapa cúbico nítido para a refração dos brilhantes
  // Estúdio próprio das pedras: dezenas de pontos de luz pequenos geram o cintilar do mosaico de facetas
  const gemEnv = new THREE.Scene()
  gemEnv.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 8), new THREE.MeshBasicMaterial({ color: '#5b5e64', side: THREE.BackSide })))
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 160; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.97, 0.94).multiplyScalar(3 + rnd() * 9), side: THREE.DoubleSide }))
    m.position.setFromSphericalCoords(12, Math.acos(1 - 2 * rnd()), rnd() * Math.PI * 2)
    m.scale.setScalar(0.8 + rnd() * 3)
    m.lookAt(0, 0, 0)
    gemEnv.add(m)
  }
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
  new THREE.CubeCamera(0.1, 50, cubeRT).update(renderer, gemEnv)
  return { tex, cube: cubeRT.texture }
}

function starTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.12, 'rgba(255,245,230,0.6)'); grad.addColorStop(1, 'rgba(255,240,220,0)')
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128)
  g.globalCompositeOperation = 'lighter'
  for (const [w, h] of [[128, 3], [3, 128]]) {
    const lg = g.createLinearGradient(64 - w / 2, 64 - h / 2, 64 + w / 2, 64 + h / 2)
    lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.9)'); lg.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = lg; g.fillRect(64 - w / 2, 64 - h / 2, w, h)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function createScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const studio = studioEnvironment(renderer)
  scene.environment = studio.tex
  scene.environmentIntensity = 1.2
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 60)

  const gold = (hex: string) => new THREE.MeshPhysicalMaterial({ color: hex, metalness: 1, roughness: 0.13 })
  const matA = gold('#f2c879'), matB = gold('#f2c879')
  // Brilhante em duas camadas: as faces internas do pavilhão refletem o estúdio (mosaico de reflexão
  // interna, como num diamante real visto pela mesa) e a coroa recebe um reflexo iridescente translúcido
  const gemMat = new THREE.MeshBasicMaterial({ color: '#ffffff', envMap: studio.cube, side: THREE.BackSide })
  const gemSpec = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 0, iridescence: 1, iridescenceIOR: 1.9, iridescenceThicknessRange: [200, 600], transparent: true, opacity: 0.45, depthWrite: false })

  // Aliança A (lisa, larga) com parede interna gravável
  const ringA = new THREE.Group()
  const outerA = new THREE.Mesh(bandGeometry(5, 1.7), matA)
  const engraveCanvas = document.createElement('canvas')
  engraveCanvas.width = 4096; engraveCanvas.height = 256
  const roughCanvas = document.createElement('canvas')
  roughCanvas.width = 4096; roughCanvas.height = 256
  const engraveTex = new THREE.CanvasTexture(engraveCanvas)
  const roughTex = new THREE.CanvasTexture(roughCanvas)
  for (const t of [engraveTex, roughTex]) { t.wrapS = THREE.RepeatWrapping; t.offset.x = 0.5; t.anisotropy = 8; t.flipY = false }
  engraveTex.colorSpace = THREE.SRGBColorSpace
  const innerMat = new THREE.MeshPhysicalMaterial({ color: '#f2c879', metalness: 1, roughness: 1, map: engraveTex, bumpMap: engraveTex, bumpScale: -2.2, roughnessMap: roughTex, side: THREE.BackSide })
  let innerA = new THREE.Mesh(new THREE.CylinderGeometry(R_IN, R_IN, 5 * MM * 0.97, 256, 1, true), innerMat)
  ringA.add(outerA, innerA)

  // Aliança B (fina, com pavé de 15 brilhantes)
  const ringB = new THREE.Group()
  const thickB = 1.5
  ringB.add(new THREE.Mesh(bandGeometry(3, thickB), matB))
  const gemGeo = brilliant()
  const N = 15
  const gems = new THREE.InstancedMesh(gemGeo, gemMat, N)
  const gemsSpec = new THREE.InstancedMesh(gemGeo, gemSpec, N)
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), matB, (N + 1) * 2)
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0)
  const gemLocal: THREE.Vector3[] = []
  const Rg = R_IN + thickB * MM * 0.98, gemS = 0.066
  for (let i = 0; i <= N; i++) {
    const a = Math.PI / 2 + ((i - N / 2) / N) * 1.9
    if (i < N) {
      const ac = a + 0.95 / N
      const n = new THREE.Vector3(Math.cos(ac), 0, Math.sin(ac))
      const p = n.clone().multiplyScalar(Rg + gemS * 0.18)
      q.setFromUnitVectors(up, n).multiply(new THREE.Quaternion().setFromAxisAngle(up, i * 0.7)) // cada pedra num giro diferente
      m4.compose(p, q, new THREE.Vector3(gemS, gemS, gemS))
      gems.setMatrixAt(i, m4); gemsSpec.setMatrixAt(i, m4)
      gemLocal.push(p.clone().addScaledVector(n, gemS * 0.3))
    }
    const nb = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
    // garras: duas por intervalo, junto às bordas da aliança
    for (const side of [-1, 1]) {
      m4.compose(nb.clone().multiplyScalar(Rg + 0.012).setY(side * 0.105), q.identity(), new THREE.Vector3(0.02, 0.02, 0.02))
      beads.setMatrixAt(i * 2 + (side + 1) / 2, m4)
    }
  }
  ringB.add(gems, gemsSpec, beads)

  // Entrelaçadas como elos: A no plano XY, B no plano XZ, centros a um raio de distância
  const pair = new THREE.Group()
  const holderA = new THREE.Group(), holderB = new THREE.Group()
  holderA.add(ringA); holderB.add(ringB)
  ringA.rotation.x = Math.PI / 2 // eixo do torno (Y) → Z
  holderA.position.x = -0.55
  holderB.position.x = 0.55
  pair.add(holderA, holderB)
  scene.add(pair)

  // Brilhos (glints) nas pedras
  const glintMat = new THREE.SpriteMaterial({ map: starTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
  const glints = gemLocal.filter((_, i) => i % 3 === 1).map((p) => {
    const s = new THREE.Sprite(glintMat.clone())
    s.position.copy(p)
    s.userData.phase = Math.random() * 10
    ringB.add(s)
    return s
  })

  // ---------- Gravação ----------
  let engrave: Engrave = { text: '', font: '', metal: '#f2c879', width: 5 }
  function drawEngraving() {
    const g = engraveCanvas.getContext('2d')!, r = roughCanvas.getContext('2d')!
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 4096, 256)
    r.fillStyle = 'rgb(30,30,30)'; r.fillRect(0, 0, 4096, 256)
    if (engrave.text) {
      for (const [ctx, color] of [[g, '#7d6a52'], [r, 'rgb(170,170,170)']] as const) {
        ctx.font = engrave.font.replace('{s}', '150')
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        // compensa a proporção da parede interna (circunferência × largura) para a letra não esticar
        const sx = (256 / (engrave.width * MM * 0.97)) / (4096 / (Math.PI * 2 * R_IN))
        ctx.save(); ctx.translate(2048, 136); ctx.scale(sx, 1)
        ctx.fillText(engrave.text, 0, 0, 1500 / sx)
        ctx.restore()
      }
    }
    engraveTex.needsUpdate = true; roughTex.needsUpdate = true
  }
  function setEngrave(e: Partial<Engrave>) {
    const widthChanged = e.width !== undefined && e.width !== engrave.width
    engrave = { ...engrave, ...e }
    matA.color.set(engrave.metal); innerMat.color.set(engrave.metal)
    if (widthChanged) {
      outerA.geometry.dispose(); outerA.geometry = bandGeometry(engrave.width, engrave.width > 4 ? 1.7 : 1.5)
      innerA.geometry.dispose(); innerA.geometry = new THREE.CylinderGeometry(R_IN, R_IN, engrave.width * MM * 0.97, 256, 1, true)
    }
    drawEngraving()
    dirty = true
  }
  drawEngraving()

  // ---------- Estado e interação ----------
  let mode: Mode = 'hero', portal = 0, portalS = 0
  let dirty = true
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2()
  let dragX = 0, dragV = 0, dragging = false, lastX = 0
  let vw = 1, vh = 1, mobile = false

  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId) })
  canvas.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; dragV = dx * 0.006; dragX += dragV })
  const endDrag = () => { dragging = false }
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag)
  if (!opts.reducedMotion) addEventListener('pointermove', (e) => pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)), { passive: true })

  function resize() {
    const r = canvas.getBoundingClientRect()
    vw = Math.max(1, r.width); vh = Math.max(1, r.height); mobile = vw < 760
    renderer.setSize(vw, vh, false)
    camera.aspect = vw / vh
    camera.updateProjectionMatrix()
    dirty = true
  }
  new ResizeObserver(resize).observe(canvas)

  const faceQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0, 0))
  const idleQ = new THREE.Quaternion(), tmpE = new THREE.Euler()
  const v = new THREE.Vector3()

  function layout(t: number) {
    const spin = opts.reducedMotion ? 0 : t * 0.18
    if (mode === 'engrave') {
      holderB.visible = false
      pair.scale.setScalar(1)
      pair.position.set(0, 0, 0)
      pair.quaternion.identity()
      holderA.position.set(0, 0, 0)
      const wob = opts.reducedMotion ? 0 : Math.sin(t * 0.5) * 0.12
      holderA.rotation.set(0.62 + pointerS.y * 0.05, 0, 0)
      ringA.rotation.set(Math.PI / 2, wob + dragX, 0)
      camera.fov = mobile ? 38 : 30
      camera.position.set(0, 0.35, mobile ? 3.75 : 3.6)
      camera.lookAt(0, -0.05, 0)
      camera.updateProjectionMatrix()
      return
    }
    holderB.visible = true
    ringA.rotation.set(Math.PI / 2, 0, 0)
    // Pose de vitrine: o par gira devagar; o arraste soma rotação com inércia
    tmpE.set(0.35 + pointerS.y * 0.12, spin + dragX + pointerS.x * 0.35, -0.18)
    idleQ.setFromEuler(tmpE)
    const a = smooth(portalS / 0.38)
    pair.quaternion.copy(idleQ).slerp(new THREE.Quaternion(), a)
    holderA.quaternion.copy(new THREE.Quaternion()).slerp(faceQ, a)
    holderA.position.x = THREE.MathUtils.lerp(-0.55, 0, a)
    holderB.position.set(0.55 + a * 3.2, a * 0.6, -a * 2.5)
    holderB.rotation.set(a * 1.4, a * 2.2, 0)
    pair.position.set(mobile ? 0 : THREE.MathUtils.lerp(0.2, 0, a), mobile ? THREE.MathUtils.lerp(0.7, 0, a) : 0, 0)
    pair.scale.setScalar(mobile ? THREE.MathUtils.lerp(0.74, 1, a) : 1)
    // Dolly: a câmera atravessa a aliança A
    const d = smooth((portalS - 0.3) / 0.7)
    camera.fov = mobile ? 40 : 30
    const z0 = mobile ? 9.6 : 7.4
    camera.position.set(0, THREE.MathUtils.lerp(0.15, 0, a), THREE.MathUtils.lerp(z0, -0.6, d))
    camera.lookAt(0, 0, -5)
    camera.updateProjectionMatrix()
  }

  function portalCircle() {
    // Círculo interno da aliança A projetado na tela (px CSS), para o clip-path da revelação
    holderA.updateWorldMatrix(true, true)
    const c = holderA.getWorldPosition(new THREE.Vector3())
    const dist = camera.position.distanceTo(c)
    if (mode !== 'hero') return { x: 0, y: 0, r: 0 }
    if (camera.position.z < c.z + 0.05) return { x: vw / 2, y: vh / 2, r: Math.hypot(vw, vh) }
    v.copy(c).project(camera)
    const focal = vh / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const open = smooth((portalS - 0.3) / 0.12) // só revela quando a aliança já está de frente
    return { x: (v.x * 0.5 + 0.5) * vw, y: (-v.y * 0.5 + 0.5) * vh, r: ((R_IN * 0.985 * focal) / dist) * open }
  }

  let raf = 0, running = false, slow = 0, degraded = false
  const clock = new THREE.Clock()
  let t = 0
  function frame() {
    raf = requestAnimationFrame(frame)
    const raw = clock.getDelta(), dt = Math.min(raw, 0.1)
    t += dt
    if (!degraded && raw > 0.05 && ++slow > 25) {
      degraded = true
      renderer.setPixelRatio(1)
      gemsSpec.visible = false // menos uma camada transparente
      resize()
    }
    const k = opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 6)
    portalS += (portal - portalS) * k
    pointerS.lerp(pointer, opts.reducedMotion ? 0 : 1 - Math.exp(-dt * 2.5))
    if (!dragging) { dragV *= Math.exp(-dt * 3); dragX += dragV }
    // O cursor move a luz do estúdio: os reflexos percorrem o metal
    scene.environmentRotation.set(pointerS.y * 0.5, pointerS.x * 1.4 + (opts.reducedMotion ? 0 : t * 0.05), 0)
    gemMat.envMapRotation.copy(scene.environmentRotation)
    for (const g of glints) {
      const s = Math.pow(Math.max(0, Math.sin(t * 1.7 + g.userData.phase)), 14)
      g.material.opacity = opts.reducedMotion ? 0.35 : s
      g.scale.setScalar(0.12 + s * 0.22)
    }
    layout(t)
    renderer.render(scene, camera)
    dirty = false
    onFrame?.()
  }
  let onFrame: (() => void) | undefined

  return {
    setMode(m: Mode) { if (m !== mode) { mode = m; dirty = true } },
    setPortal(p: number) { portal = Math.min(1, Math.max(0, p)) },
    setEngrave,
    portalCircle,
    onFrame(cb: () => void) { onFrame = cb },
    resize,
    start() { if (!running) { running = true; clock.getDelta(); frame() } },
    stop() { running = false; cancelAnimationFrame(raf) },
    get dirty() { return dirty },
    // Imagens estáticas (fallback sem WebGL, Open Graph e imagens editoriais). Render real da mesma cena.
    still(name: 'og' | 'pave' | 'rose' | 'engrave') {
      const bg = document.createElement('canvas'); bg.width = bg.height = 512
      const g = bg.getContext('2d')!, gr = g.createRadialGradient(256, 230, 10, 256, 256, 360)
      gr.addColorStop(0, '#5a1a27'); gr.addColorStop(0.55, '#2a0d14'); gr.addColorStop(1, '#12050a')
      g.fillStyle = gr; g.fillRect(0, 0, 512, 512)
      const tex = new THREE.CanvasTexture(bg); tex.colorSpace = THREE.SRGBColorSpace
      scene.background = tex
      for (const gl of glints) { gl.material.opacity = 0.9; gl.scale.setScalar(0.26) }
      mode = name === 'engrave' ? 'engrave' : 'hero'
      portalS = 0; dragX = 0; pointerS.set(0, 0)
      layout(name === 'og' ? 1.6 : 0)
      if (name === 'pave' || name === 'rose') {
        pair.quaternion.identity(); pair.position.set(0, 0, 0); pair.scale.setScalar(1)
        holderA.visible = name === 'rose'; holderB.visible = name === 'pave'
        holderB.position.set(0, 0, 0); holderB.rotation.set(0, 0, 0)
        holderA.position.set(0, 0, 0); holderA.rotation.set(0.95, 0.55, 0.15)
        if (name === 'rose') { matA.color.set('#f1b89c'); innerMat.color.set('#f1b89c') }
        camera.fov = 30
        if (name === 'pave') { holderB.rotation.set(-0.55, 0, 0); camera.position.set(0.25, 1.25, 3.1); camera.lookAt(0, 0.55, 0.95) }
        else { camera.position.set(0, 0.1, 5.2); camera.lookAt(0, 0, 0) }
        camera.updateProjectionMatrix()
      }
      renderer.render(scene, camera)
      const url = canvas.toDataURL('image/png')
      scene.background = null; holderA.visible = true; holderB.visible = true
      matA.color.set(engrave.metal); innerMat.color.set(engrave.metal)
      return url
    }
  }
}
