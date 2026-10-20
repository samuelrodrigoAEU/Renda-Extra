// Vídeo da demo em 60 fps renderizado quadro a quadro em tempo virtual (sem travamentos,
// independente da GPU): rAF e performance.now avançam 1/60 s por quadro; transições CSS
// acompanham via Animation.setPlaybackRate.
// Uso: npm run build && (npx vite preview --port 4174 &) && node tests/render60.mjs video/demo.mp4
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const OUT = process.argv[2] || 'video/demo-aliancas-60fps.mp4'
const LIMIT = Number(process.argv[3] || 1e9)
const FPS = 60, DT = 1000 / FPS, W = 1280, H = 720
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: Number(process.env.DPR || 1) })
const cdp = await page.context().newCDPSession(page)
await cdp.send('Animation.enable')
await page.addInitScript(() => {
  let vt = 0, id = 0, q = new Map()
  window.requestAnimationFrame = (cb) => { q.set(++id, cb); return id }
  window.cancelAnimationFrame = (i) => q.delete(i)
  performance.now = () => vt
  window.__tick = (t) => { vt = t; const c = q; q = new Map(); for (const cb of c.values()) cb(t) }
})
let vt = 1000
const tick = (js = '') => { vt += DT; return page.evaluate(`${js};window.__tick(${vt})`) }
await page.goto(process.env.URL || 'http://localhost:4174/', { waitUntil: 'load' })
await page.evaluate(() => window.__boot()) // o 3D sobe na primeira interação
for (let i = 0; i < 3000; i++) {
  await tick()
  if (await page.evaluate(() => document.documentElement.classList.contains('webgl-ready'))) break
  await page.waitForTimeout(30)
}
for (let i = 0; i < 90; i++) await tick()
await page.waitForTimeout(1800)
console.log('webgl pronto')

const m = await page.evaluate(() => {
  const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY
  return { stage: document.querySelector('.stage').offsetHeight - innerHeight, at: top('#atelie') - 40, en: top('#gravacao'), aro: top('#aro') - 30, pr: top('#encomenda') - 30, ct: top('#contato') - 30 }
})
const keys = [[0, 0], [4, 0], [12, m.stage], [14, m.stage], [17, m.at + 60], [19.5, m.at + 60], [22.5, m.en], [34, m.en],
  [37, m.aro], [41.5, m.aro], [44, m.pr], [45.5, m.pr], [48.5, m.ct], [54, m.ct], [57, 0], [58.5, 0]]
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
function scrollAt(t) {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, y0] = keys[i], [t1, y1] = keys[i + 1]
    if (t <= t1) return y0 + (y1 - y0) * ease(Math.max(0, (t - t0) / (t1 - t0)))
  }
  return keys.at(-1)[1]
}
const setVal = (sel, v) => `(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.value=${JSON.stringify(v)};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`
const click = (sel) => `document.querySelector(${JSON.stringify(sel)}).click()`
const events = [
  [23.2, setVal('#en-text', '')],
  [26.2, click('#en-metal input[value="rose"]')],
  [28.0, click('#en-font input[value="manuscrita"]')],
  [30.0, click('#en-width input[value="4"]')],
  [31.8, click('#en-font input[value="classica"]')],
  [40.2, click('[data-save="1"]')],
  [51.4, setVal('[name=peca]', 'Par de alianças')]
]
const typing = [[23.4, '#en-text', 'Júlia & Pedro · 2027'], [49.0, '[name=nomes]', 'Júlia e Pedro']]
const slider = [37.6, 39.6, 17.5, 18.6] // medidor: anel de 17,5 → 18,6 mm
const TOTAL = Math.min(58.5, LIMIT), N = Math.round(TOTAL * FPS)
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] })
let ev = 0, prevMs = 500
const t0 = Date.now()
for (let f = 0; f < N; f++) {
  const t = f / FPS
  // cursor desenha uma curva lenta: a luz do estúdio percorre o ouro
  const px = W * (0.55 + 0.3 * Math.sin(t * 0.7)), py = H * (0.45 + 0.2 * Math.sin(t * 1.1))
  let js = `scrollTo({top:${scrollAt(t).toFixed(2)},behavior:'instant'});dispatchEvent(new PointerEvent('pointermove',{clientX:${px},clientY:${py}}));`
  while (ev < events.length && events[ev][0] <= t) js += events[ev++][1] + ';'
  for (const [ts, sel, text] of typing) {
    const n = Math.min(text.length, Math.floor((t - ts) * 12))
    if (t >= ts && n >= 0 && t < ts + text.length / 12 + 0.1) js += setVal(sel, text.slice(0, n)) + ';'
  }
  if (t >= slider[0] && t <= slider[1] + 0.05) js += setVal('#ring', String(slider[2] + (slider[3] - slider[2]) * ease(Math.min(1, (t - slider[0]) / (slider[1] - slider[0]))))) + ';'
  await cdp.send('Animation.setPlaybackRate', { playbackRate: Math.min(1, Math.max(0.005, DT / prevMs)) })
  const it0 = Date.now()
  await tick(js + `;dispatchEvent(new Event('scroll'))`)
  ff.stdin.write(await page.screenshot({ type: 'jpeg', quality: 93 }))
  prevMs = Math.max(1, Date.now() - it0)
  if (f % 300 === 0) console.log(`quadro ${f}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
}
ff.stdin.end()
await new Promise((r) => ff.on('close', r))
await browser.close()
console.log('ok', OUT)
