// Gera imagens estáticas a partir da própria cena 3D (render real): fallback, Open Graph e imagens editoriais.
// Uso: npm run build && (npx vite preview --port 4174 &) && node tests/stills.mjs && npm run build
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const URL = process.env.URL || 'http://localhost:4174/'
const all = [['og', 1200, 630], ['pave', 900, 1125], ['rose', 900, 900], ['engrave', 1200, 900]]
const shots = process.argv.length > 2 ? all.filter((s) => process.argv.includes(s[0])) : all
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [name, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__scene, null, { timeout: 30000 })
  if (name === 'engrave') {
    await page.evaluate(() => { const s = document.querySelector('#slot-engrave'); s.style.cssText = 'position:fixed;inset:0;z-index:999'; s.append(document.querySelector('#gl')); window.__scene.resize() })
  }
  await page.waitForTimeout(1200)
  const data = await page.evaluate((n) => window.__scene.still(n), name)
  const png = `public/renders/${name}.png`
  writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'))
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', `scale=${w}:${h}:flags=lanczos`, '-q:v', '3', `public/renders/${name}.jpg`])
  execFileSync('rm', [png])
  console.log('ok', name)
  await page.close()
}
await browser.close()
