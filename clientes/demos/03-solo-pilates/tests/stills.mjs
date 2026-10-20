// Renders estáticos da própria cena 3D: imagem do herói, fallback sem WebGL e Open Graph.
// Uso: npm run build && (npx vite preview --port 4175 &) && node tests/stills.mjs && npm run build
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const URL = process.env.URL || 'http://localhost:4175/'
const all = [['hero', 1400, 1050], ['springs', 1200, 900], ['og', 1200, 630]]
const shots = process.argv.length > 2 ? all.filter((s) => process.argv.includes(s[0])) : all
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [name, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.querySelector('#molas').scrollIntoView())
  await page.waitForFunction(() => window.__scene, null, { timeout: 30000 })
  await page.evaluate(() => { const c = document.querySelector('#gl'); Object.assign(c.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: 999 }); window.__scene.stop(); window.__scene.resize() })
  await page.waitForTimeout(800)
  const data = await page.evaluate((n) => window.__scene.still(n === 'og' ? 'hero' : n), name)
  const png = `public/renders/${name}.png`
  writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'))
  // fundo claro do estúdio por trás do PNG transparente
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0xf6f7f4:s=${w * 2}x${h * 2}`, '-i', png, '-filter_complex', `[0][1]overlay,scale=${w}:${h}:flags=lanczos`, '-frames:v', '1', '-q:v', '2', `public/renders/${name}.jpg`])
  execFileSync('rm', [png])
  console.log('ok', name)
  await page.close()
}
await browser.close()
