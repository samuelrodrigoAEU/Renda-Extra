// Teste de fumaça: capturas por seção (desktop e celular) e validação das interações.
// Uso: npm run build && (npx vite preview --port 4174 &) && node tests/smoke.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const URL = process.env.URL || 'http://localhost:4174/'
const OUT = process.env.OUT || 'screens'
const WAIT = Number(process.env.WAIT || 3000)
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const results = []
const ok = (n, c) => results.push(`${c ? 'PASS' : 'FAIL'} ${n}`)
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.documentElement.classList.contains('webgl-ready'), null, { timeout: 30000 }).catch(() => {})
  ok(`${label}: WebGL`, await page.evaluate(() => document.documentElement.classList.contains('webgl-ready')))
  const go = async (y, name) => { await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(WAIT); await page.screenshot({ path: `${OUT}/${label}-${name}.png` }) }
  const stageH = await page.evaluate(() => document.querySelector('.stage').offsetHeight - innerHeight)
  const top = (s) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, s)
  await go(0, '1-hero')
  for (const s of [0.3, 0.55, 0.8]) await go(stageH * s, `2-portal-${s}`)
  await go(await top('#atelie'), '3-atelie')
  await go(await top('#gravacao'), '4-gravacao')
  await page.fill('#en-text', 'Lindyse · 2027')
  await page.$eval('#en-metal label:nth-child(4) input', (el) => el.click())
  await page.waitForTimeout(WAIT)
  await page.screenshot({ path: `${OUT}/${label}-4b-gravacao-rose.png` })
  ok(`${label}: gravação vai para o formulário`, (await page.inputValue('[name=gravacao]')) === 'Lindyse · 2027')
  await go(await top('#aro'), '5-aro')
  await page.fill('#circ', '56')
  await page.click('[data-save="1"]')
  ok(`${label}: aro 16 salvo no formulário`, (await page.inputValue('[name=aro1]')) === '16')
  await go(await top('#encomenda'), '6-processo')
  await go(await top('#contato'), '7-contato')
  await page.click('#lead button[type=submit]')
  ok(`${label}: validação`, await page.isVisible('.form-error'))
  await page.fill('[name=nomes]', 'Ana e Léo')
  await page.selectOption('[name=peca]', 'Par de alianças')
  await page.evaluate(() => { window.__o = []; window.open = (u) => { window.__o.push(u) } })
  await page.click('#lead button[type=submit]')
  const u = decodeURIComponent(await page.evaluate(() => window.__o[0] || ''))
  ok(`${label}: WhatsApp com dados`, u.includes('wa.me') && u.includes('Ana e Léo') && u.includes('Lindyse · 2027') && u.includes('16'))
  ok(`${label}: sem rolagem horizontal`, !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  ok(`${label}: console limpo (${errors.length})`, errors.length === 0)
  if (errors.length) console.log(errors.slice(0, 5).join('\n'))
  await page.close()
}
const p2 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await p2.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null })
await p2.goto(URL, { waitUntil: 'networkidle' }); await p2.waitForTimeout(800)
ok('fallback sem WebGL', await p2.evaluate(() => document.documentElement.classList.contains('no-webgl')))
await p2.screenshot({ path: `${OUT}/fallback.png` })
await browser.close()
console.log(results.join('\n'))
