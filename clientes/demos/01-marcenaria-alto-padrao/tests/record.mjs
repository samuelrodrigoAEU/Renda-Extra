// Grava um vídeo de apresentação da demo (webm). Uso: node tests/record.mjs <saida-dir> [desktop|mobile]
import { chromium } from 'playwright'
const out = process.argv[2], mode = process.argv[3] || 'desktop'
const vp = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 720 }
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const ctx = await browser.newContext({ viewport: vp, recordVideo: { dir: out, size: vp } })
const page = await ctx.newPage()
await page.goto(process.env.URL || 'http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForFunction(() => document.documentElement.classList.contains('webgl-ready'))
const wait = (ms) => page.waitForTimeout(ms)
const scrollTo = (y, ms) => page.evaluate(([y, ms]) => new Promise((res) => {
  const y0 = scrollY, t0 = performance.now()
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
  const tick = (now) => { const t = Math.min(1, (now - t0) / ms); scrollTo({ top: y0 + (y - y0) * ease(t), behavior: 'instant' }); t < 1 ? requestAnimationFrame(tick) : res() }
  requestAnimationFrame(tick)
}), [y, ms])
const stageH = await page.evaluate(() => document.querySelector('.stage').getBoundingClientRect().height - innerHeight)
await wait(3500)
await scrollTo(stageH / 3, 3500); await wait(3500)        // portas abertas
await scrollTo((stageH * 2) / 3, 3500); await wait(3500)  // gaveta
await scrollTo(stageH, 3500); await wait(1500)            // acabamentos
for (const id of ['nogueira', 'off', 'oliva', 'grafite', 'freijo']) { await page.click(`.swatch[data-id="${id}"]`); await wait(1800) }
const top = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel)
await scrollTo(await top('.rooms'), 2500); await wait(2500)
await scrollTo(await top('.process') - 40, 3000); await wait(2500)
await scrollTo(await top('#contato') - 20, 3000); await wait(1200)
await page.fill('[name=nome]', 'Mariana Souza'); await wait(300)
await page.selectOption('[name=ambiente]', 'Cozinha'); await wait(500)
await page.click('.chip:has-text("Em obra")'); await wait(400)
await page.fill('[name=bairro]', 'Setor Marista'); await wait(2500)
await scrollTo(0, 3000); await wait(2500)
await ctx.close(); await browser.close()
