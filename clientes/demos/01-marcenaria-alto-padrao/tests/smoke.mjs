// Teste de fumaça: abre a demo no Chromium, captura telas por etapa e valida interações.
// Uso: npm run build && npx vite preview --port 4173 & node tests/smoke.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL || 'http://localhost:4173/'
const OUT = process.env.OUT || 'screens'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
})
const results = []
const ok = (name, cond) => { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}`) }

for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.documentElement.classList.contains('webgl-ready'), null, { timeout: 20000 }).catch(() => {})
  ok(`${label}: WebGL carregado`, await page.evaluate(() => document.documentElement.classList.contains('webgl-ready')))
  const stageH = await page.evaluate(() => document.querySelector('.stage').getBoundingClientRect().height - innerHeight)
  for (const step of [0, 1, 2, 3]) {
    await page.evaluate(([h, s]) => window.scrollTo({ top: 31 + (h * s) / 3, behavior: 'instant' }), [stageH, step])
    await page.waitForTimeout(Number(process.env.WAIT || 2200))
    await page.screenshot({ path: `${OUT}/${label}-step${step}.png` })
  }
  // troca de acabamento
  await page.click('.swatch[data-id="oliva"]')
  await page.waitForTimeout(800)
  ok(`${label}: acabamento selecionado no formulário`, (await page.inputValue('input[name=acabamento]')) === 'Laca verde oliva')
  await page.screenshot({ path: `${OUT}/${label}-oliva.png` })
  // formulário: validação e link do WhatsApp
  await page.locator('#contato').scrollIntoViewIfNeeded()
  await page.click('#lead button[type=submit]')
  ok(`${label}: erro de validação exibido`, await page.isVisible('.form-error'))
  await page.fill('[name=nome]', 'Teste')
  await page.selectOption('[name=ambiente]', 'Cozinha')
  await page.click('.chip:has-text("Em obra")')
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null } })
  await page.click('#lead button[type=submit]')
  const popupUrl = await page.evaluate(() => window.__opened[0] || '')
  ok(`${label}: abre WhatsApp com mensagem`, /wa\.me|whatsapp/.test(popupUrl) && /Cozinha/.test(decodeURIComponent(popupUrl)))
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${label}-contato.png` })
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.42, behavior: 'instant' }))
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${label}-secoes.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  ok(`${label}: sem rolagem horizontal`, !overflow)
  ok(`${label}: sem erros no console (${errors.length})`, errors.length === 0)
  if (errors.length) console.log(errors.join('\n'))
  await page.close()
}
// Sem WebGL: deve cair no visual estático
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const p2 = await ctx.newPage()
await p2.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null })
await p2.goto(URL, { waitUntil: 'networkidle' })
await p2.waitForTimeout(800)
ok('fallback sem WebGL ativado', await p2.evaluate(() => document.documentElement.classList.contains('no-webgl')))
await p2.screenshot({ path: `${OUT}/fallback.png` })
await browser.close()
console.log(results.join('\n'))
