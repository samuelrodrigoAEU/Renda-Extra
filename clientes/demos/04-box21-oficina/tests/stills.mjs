// Renders estáticos da própria cena: abertura (LCP sem WebGL), recorte da vista explodida (sobre o numeral "21") e Open Graph.
// Uso: npm run build && (npx vite preview --port 4176 &) && node tests/stills.mjs && npm run build
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const URL = process.env.URL || 'http://localhost:4176/'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [name, size] of [['hero', 1400], ['exploded', 1200]]) {
  const page = await browser.newPage({ viewport: { width: size / 2, height: size / 2 }, deviceScaleFactor: 2 })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.__boot())
  await page.waitForFunction(() => window.__scene, null, { timeout: 30000 })
  await page.evaluate(() => { const c = document.querySelector('#gl'); Object.assign(c.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: 999, opacity: 1 }); window.__scene.stop(); window.__scene.resize() })
  await page.waitForTimeout(800)
  const data = await page.evaluate((n) => window.__scene.still(n), name)
  const png = `public/renders/${name}.png`
  writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'))
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-pix_fmt', 'yuva420p', '-quality', '88', `public/renders/${name}.webp`])
  if (name === 'hero') execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x101317:s=1200x630', '-i', png, '-filter_complex', '[1]scale=720:720[p];[0][p]overlay=480:-45', '-frames:v', '1', '-q:v', '2', 'public/renders/og.jpg'])
  execFileSync('rm', [png])
  console.log('ok', name)
  await page.close()
}
await browser.close()
