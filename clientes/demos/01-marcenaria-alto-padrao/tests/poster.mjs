// Gera o pôster da abertura (o 3D renderizado e congelado) para mostrar antes da primeira interação.
import { chromium } from 'playwright'
const URL = process.env.URL || 'http://localhost:4173/'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [name, vp] of [['hero-d', { width: 1440, height: 900 }], ['hero-m', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: name === 'hero-m' ? 2 : 1 })
  await page.goto(URL, { waitUntil: 'networkidle' }); await page.mouse.move(vp.width / 2, vp.height / 2)
  await page.waitForFunction(() => document.documentElement.classList.contains('webgl-ready'), null, { timeout: 30000 })
  await page.mouse.move(vp.width / 2, vp.height / 2); await page.waitForTimeout(3500)
  await page.addStyleTag({ content: 'body *{visibility:hidden!important} .stage-canvas,#scene{visibility:visible!important} .poster{display:none!important}' })
  await page.waitForTimeout(300)
  await page.locator('#scene').screenshot({ path: `src/renders/${name}.png` })
  await page.close()
}
await browser.close()
