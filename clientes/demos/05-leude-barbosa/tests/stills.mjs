// Capturas para revisão visual: dobra e página inteira (desktop e celular), e a folha depois de pressionada.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const URL = process.env.URL || 'http://localhost:4177/', OUT = process.env.OUT || 'screens'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: label === 'mobile' ? 2 : 1 })
  await ctx.addInitScript(() => sessionStorage.setItem('demo-feita', '1'))
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.mouse.move(vp.width / 2, 120)
  await page.waitForFunction(() => document.querySelector('#amostra').classList.contains('gl'), null, { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(2200)
  await page.screenshot({ path: `${OUT}/${label}-dobra.png` })
  const s = await page.locator('#folha').boundingBox()
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2); await page.mouse.down()
  for (let i = 1; i <= 30; i++) { await page.mouse.move(s.x + s.width / 2 - (label === 'mobile' ? 120 : -160) * i / 30, s.y + s.height / 2 - 90 * i / 30); await page.waitForTimeout(40) }
  await page.waitForTimeout(2500); await page.mouse.up(); await page.waitForTimeout(900)
  await page.locator('#amostra').screenshot({ path: `${OUT}/${label}-pressionada.png` })
  await page.evaluate(() => { for (const e of document.querySelectorAll('.rv')) e.classList.add('in', 'on') })
  await page.waitForTimeout(1300)
  await page.screenshot({ path: `${OUT}/${label}-pagina.png`, fullPage: true })
  await ctx.close()
}
await browser.close()
