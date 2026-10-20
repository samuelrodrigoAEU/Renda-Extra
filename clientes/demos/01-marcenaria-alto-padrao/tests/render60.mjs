// Renderiza o vídeo da demo quadro a quadro em tempo virtual (60 fps sem travamentos,
// independente da velocidade da GPU). Requer chrome-headless-shell (HeadlessExperimental.beginFrame).
// Uso: URL=http://localhost:4173/ HEADLESS_SHELL=... node tests/render60.mjs saida.mp4 [segundos-max]
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const OUT = process.argv[2] || 'video/demo-60fps.mp4'
const LIMIT = Number(process.argv[3] || 1e9)
const FPS = 60, DT = 1000 / FPS
const W = Number(process.env.W || 1280), H = Number(process.env.H || 720), DPR = Number(process.env.DPR || 1.5)

const browser = await chromium.launch({
  executablePath: process.env.HEADLESS_SHELL,
  headless: true,
  args: [
    '--enable-begin-frame-control', '--run-all-compositor-stages-before-draw', '--disable-threaded-animation',
    '--disable-threaded-scrolling', '--disable-checker-imaging', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist', '--hide-scrollbars'
  ]
})
console.log('launched')
const bcdp = await browser.newBrowserCDPSession()
const before = new Set((await bcdp.send('Target.getBrowserContexts')).browserContextIds)
const ctx = await browser.newContext({ viewport: null })
const ctxId = (await bcdp.send('Target.getBrowserContexts')).browserContextIds.find((id) => !before.has(id))
const pageP = ctx.waitForEvent('page')
await bcdp.send('Target.createTarget', { url: 'about:blank', browserContextId: ctxId, enableBeginFrameControl: true, width: W, height: H })
const page = await pageP
console.log('target ok')
const cdp = await ctx.newCDPSession(page)
await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: false })

// Relógio virtual: performance.now acompanha o timestamp do frame
await page.addInitScript(() => {
  let vt = 0
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => raf((t) => { vt = t; cb(t) })
  performance.now = () => vt
})

let ticks = 100000
async function frame(shot) {
  ticks += DT
  const r = await cdp.send('HeadlessExperimental.beginFrame', {
    frameTimeTicks: ticks, interval: DT, noDisplayUpdates: false,
    ...(shot ? { screenshot: { format: 'jpeg', quality: 93 } } : {})
  })
  return r.screenshotData
}

const nav = page.goto(process.env.URL || 'http://localhost:4173/', { waitUntil: 'load' })
let pumping = true
const pump = (async () => { while (pumping) { await frame(false).catch(() => {}); await new Promise((r) => setTimeout(r, 5)) } })()
await nav
console.log('loaded')
for (let i = 0; i < 4000; i++) {
  if (await page.evaluate(() => document.documentElement.classList.contains('webgl-ready'))) break
  await new Promise((r) => setTimeout(r, 50))
}
pumping = false
await pump
console.log('webgl ready')
{ const s0 = Date.now(); for (let i = 0; i < 90; i++) await frame(false); console.log("estab ms/frame", (Date.now() - s0) / 90) } // estabiliza (fade-in do canvas)

const m = await page.evaluate(() => {
  const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY
  return {
    stage: document.querySelector('.stage').getBoundingClientRect().height - innerHeight,
    rooms: top('.rooms'), proc: top('.process') - 40, contact: top('#contato') - 20, vh: innerHeight
  }
})

// Roteiro (segundos)
const S = m.stage
const scrollKeys = [[0, 0], [3.5, 0], [6.5, S / 3], [9, S / 3], [12, (2 * S) / 3], [14.5, (2 * S) / 3], [17.5, S], [27.5, S],
  [30, m.rooms], [32, m.rooms], [34.5, m.proc], [36.5, m.proc], [39, m.contact], [45, m.contact], [48, 0], [50, 0]]
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
function scrollAt(t) {
  for (let i = 0; i < scrollKeys.length - 1; i++) {
    const [t0, y0] = scrollKeys[i], [t1, y1] = scrollKeys[i + 1]
    if (t <= t1) return y0 + (y1 - y0) * ease(Math.max(0, (t - t0) / (t1 - t0)))
  }
  return scrollKeys.at(-1)[1]
}
const events = [
  [18.5, `document.querySelector('.swatch[data-id="nogueira"]').click()`],
  [20.3, `document.querySelector('.swatch[data-id="off"]').click()`],
  [22.1, `document.querySelector('.swatch[data-id="oliva"]').click()`],
  [23.9, `document.querySelector('.swatch[data-id="grafite"]').click()`],
  [25.7, `document.querySelector('.swatch[data-id="freijo"]').click()`],
  [41.2, `(()=>{const s=document.querySelector('[name=ambiente]');s.value='Cozinha';s.dispatchEvent(new Event('change',{bubbles:true}))})()`],
  [42.0, `document.querySelector('input[name=momento][value="Em obra"]').checked=true`]
]
const typing = [[39.6, 'nome', 'Mariana Souza'], [42.6, 'bairro', 'Setor Marista']]
const TOTAL = Math.min(50, LIMIT)

const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] })

let last = null, ev = 0
const N = Math.round(TOTAL * FPS)
const t0 = Date.now()
for (let f = 0; f < N; f++) {
  const t = f / FPS
  // cursor desenha uma elipse suave sobre o palco 3D durante as pausas
  const px = W * (0.68 + 0.12 * Math.sin(t * 0.9)), py = H * (0.5 + 0.12 * Math.sin(t * 1.3))
  let js = `scrollTo({top:${scrollAt(t).toFixed(2)},behavior:'instant'});window.dispatchEvent(new PointerEvent('pointermove',{clientX:${px},clientY:${py}}));`
  while (ev < events.length && events[ev][0] <= t) js += events[ev++][1] + ';'
  for (const [ts, name, text] of typing) {
    const n = Math.max(0, Math.min(text.length, Math.floor((t - ts) * 14)))
    if (t >= ts && t < ts + text.length / 14 + 0.1) js += `document.querySelector('[name=${name}]').value=${JSON.stringify(text.slice(0, n))};`
  }
  await page.evaluate(js)
  const data = await frame(true)
  if (data) last = Buffer.from(data, 'base64')
  if (last) ff.stdin.write(last)
  if (f % 60 === 0) console.log(`frame ${f}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
}
ff.stdin.end()
await new Promise((r) => ff.on('close', r))
await browser.close()
console.log('ok', OUT)
